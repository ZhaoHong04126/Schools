/* ========================================================================== */
/* 📌 應用程式進入點與狀態監聽 (App Entry Point & Auth Listener)             */
/* ========================================================================== */

// 🌟 Supabase 狀態監聽
supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session ? session.user : null;

    if (user) {
        currentUser = user;
        updateLoginUI(true);

        // 🌟 核心修復：強制等待 loadData() 完全執行完畢 (包含等待雲端下載)
        await loadData();

        // 🌟 資料準備好後，才開始初始化畫面、抓取推播
        initUI();

        // ⚠️ 注意：這裡的 UID 還是你舊版 Firebase 的！
        // 記得用你的管理員帳號登入新系統後，把這串換成你新的 Supabase ID (通常是 UUID 格式)
        if (user.id === 'e5edd19c-6e0a-433f-93cc-fade3f5bff74') {
            const adminNav = document.getElementById('admin-nav-section');
            if (adminNav) adminNav.style.display = 'block';
        }

        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById('view-' + hash)) {
            switchTab(hash, false);
        } else {
            switchTab('schedule', false);
        }

        // 使用者登入成功後，延遲 1 秒檢查是否有維護公告
        setTimeout(checkMaintenanceAlert, 1000);

        // 使用者登入成功後，延遲 1.5 秒檢查是否有版本更新
        setTimeout(checkUpdateModal, 1500);

    } else {
        currentUser = null;
        updateLoginUI(false);
        // 如果沒有登入，自動導回首頁
        if (window.location.pathname.includes('app.html')) {
            window.location.href = 'index.html';
        }
    }
});

// 如果頁面載入時已經有 session，手動觸發一次初始化
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        // onAuthStateChange 通常在初始載入時也會觸發 (SIGNED_IN 或 INITIAL_SESSION)
        // 但加上這段可以做雙重保險
    }
});

/* ========================================================================== */
/* 🛠️ 預定維護公告功能 (Scheduled Maintenance)                               */
/* ========================================================================== */

// 1. 管理員儲存設定
async function saveMaintenanceSettings() {
    const enabled = document.getElementById('maintenance-enabled').checked;
    const startTime = document.getElementById('maintenance-start').value;
    const endTime = document.getElementById('maintenance-end').value;
    const message = document.getElementById('maintenance-msg').value;

    if (enabled && (!startTime || !endTime)) {
        alert("⚠️ 啟用公告時，必須設定開始與結束時間！");
        return;
    }

    try {
        // 寫入 Supabase (存入 system_settings 表格，以 JSONB 格式存放在 data 欄位)
        const { error } = await supabase.from("system_settings").upsert({
            id: 'maintenance',
            data: {
                enabled: enabled,
                startTime: startTime,
                endTime: endTime,
                message: message
            },
            updated_at: new Date().toISOString()
        });

        if (error) throw error;
        alert("✅ 維護公告設定已成功發布！");
    } catch (error) {
        console.error("發布維護設定失敗：", error);
        alert("發布失敗，請確認您有管理員權限。");
    }
}

// 2. 學生端檢查公告 (登入時呼叫)
async function checkMaintenanceAlert() {
    try {
        const { data: row, error } = await supabase.from("system_settings").select("data").eq("id", "maintenance").single();

        if (row && row.data) {
            const data = row.data;

            // 如果啟用，且有設定結束時間
            if (data.enabled && data.endTime) {
                const now = new Date();
                const endDate = new Date(data.endTime);

                if (now < endDate && !sessionStorage.getItem('maintenanceAlertSeen')) {
                    const formatTime = (timeStr) => {
                        return new Date(timeStr).toLocaleString('zh-TW', {
                            month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        });
                    };

                    document.getElementById('alert-modal-msg').innerText = data.message || "系統將進行維護，期間可能無法使用。";
                    document.getElementById('alert-modal-start').innerText = formatTime(data.startTime);
                    document.getElementById('alert-modal-end').innerText = formatTime(data.endTime);
                    document.getElementById('maintenance-alert-modal').style.display = 'flex';
                }
            }
        }
    } catch (error) {
        console.error("檢查維護公告失敗：", error);
    }
}

function closeMaintenanceAlert() {
    document.getElementById('maintenance-alert-modal').style.display = 'none';
    sessionStorage.setItem('maintenanceAlertSeen', 'true');
}

/* ========================================================================== */
/* 🚀 系統更新日誌功能 (Update Log)                                          */
/* ========================================================================== */

function checkUpdateModal() {
    supabase.from("system_settings").select("data").eq("id", "system_update_log").single()
    .then(({ data: row, error }) => {
        if (row && row.data) {
            const data = row.data;
            const CURRENT_VERSION = data.version || 'v1.0.0';
            const UPDATE_LOG = data.content || '<p style="text-align: center;">無更新內容</p>';

            const savedVersion = localStorage.getItem('appVersion');

            // 判斷是否為新用戶 (建立時間與最後登入時間相差小於 10 秒)
            // 在 Supabase 中，我們可以用 created_at 和 last_sign_in_at 來判斷
            let isNewUser = false;
            if (currentUser && currentUser.created_at && currentUser.last_sign_in_at) {
                const creationTime = new Date(currentUser.created_at).getTime();
                const lastSignInTime = new Date(currentUser.last_sign_in_at).getTime();
                if (Math.abs(lastSignInTime - creationTime) < 10000) {
                    isNewUser = true;
                }
            }

            if (savedVersion !== CURRENT_VERSION) {
                if (isNewUser) {
                    localStorage.setItem('appVersion', CURRENT_VERSION);
                    return;
                }

                const modalContent = document.getElementById('update-log-content');
                const versionSpan = document.getElementById('update-log-version');
                if (modalContent) {
                    modalContent.innerHTML = UPDATE_LOG;
                    if (versionSpan) {
                        versionSpan.textContent = CURRENT_VERSION;
                    }
                    document.getElementById('update-log-modal').style.display = 'flex';
                }
                window._latestAppVersion = CURRENT_VERSION;
            }
        }
    }).catch(e => console.error("讀取系統更新日誌失敗:", e));
}

function closeUpdateLogModal() {
    document.getElementById('update-log-modal').style.display = 'none';
    if (window._latestAppVersion) {
        localStorage.setItem('appVersion', window._latestAppVersion);
    }
}