/* ========================================================================== */
/* 📌 應用程式進入點與狀態監聽 (App Entry Point & Auth Listener)             */
/* ========================================================================== */

// 🌟 將監聽回呼函式加上 async，讓內部可以使用 await 來排隊執行
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);

        // 🌟 核心修復：強制等待 loadData() 完全執行完畢 (包含等待雲端下載)
        // 這樣能保證在執行下一行的 initUI() 前，資料絕對已經被填好！
        await loadData();

        // 🌟 資料準備好後，才開始初始化畫面、抓取推播 (原本觸發覆寫的元兇)
        initUI();

        if (user.uid === '8OeziUfXrKXot4l60U2keePhOwS2') {
        const adminNav = document.getElementById('admin-nav-section'); // 新增的左側選單
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
        // 寫入 Firebase
        await db.collection("public").doc("maintenance").set({
            enabled: enabled,
            startTime: startTime,
            endTime: endTime,
            message: message
        }, { merge: true });

        alert("✅ 維護公告設定已成功發布！");
    } catch (error) {
        console.error("發布維護設定失敗：", error);
        alert("發布失敗，請確認您有管理員權限。");
    }
}

// 2. 學生端檢查公告 (登入時呼叫)
async function checkMaintenanceAlert() {
    try {
        const docSnap = await db.collection("public").doc("maintenance").get();

        if (docSnap.exists) {
            const data = docSnap.data();

            // 如果啟用，且有設定結束時間
            if (data.enabled && data.endTime) {
                const now = new Date();
                const endDate = new Date(data.endTime);

                // 核心邏輯：現在時間 < 結束時間 才顯示，且這個 Session 沒點過「我知道了」
                if (now < endDate && !sessionStorage.getItem('maintenanceAlertSeen')) {

                    // 格式化時間
                    const formatTime = (timeStr) => {
                        return new Date(timeStr).toLocaleString('zh-TW', {
                            month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        });
                    };

                    // 填入資料到 Modal
                    document.getElementById('alert-modal-msg').innerText = data.message || "系統將進行維護，期間可能無法使用。";
                    document.getElementById('alert-modal-start').innerText = formatTime(data.startTime);
                    document.getElementById('alert-modal-end').innerText = formatTime(data.endTime);

                    // 顯示 Modal
                    document.getElementById('maintenance-alert-modal').style.display = 'flex';
                }
            }
        }
    } catch (error) {
        console.error("檢查維護公告失敗：", error);
    }
}

// 3. 關閉彈窗並記錄 (避免一直跳出)
function closeMaintenanceAlert() {
    document.getElementById('maintenance-alert-modal').style.display = 'none';
    // 寫入 SessionStorage，這樣只要不關閉瀏覽器分頁，就不會再跳出來煩人
    sessionStorage.setItem('maintenanceAlertSeen', 'true');
}

/* ========================================================================== */
/* 🚀 系統更新日誌功能 (Update Log)                                          */
/* ========================================================================== */

// 檢查是否需要顯示更新公告 (改為從 Firebase 讀取)
function checkUpdateModal() {
    db.collection("public").doc("system_update_log").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const CURRENT_VERSION = data.version || 'v1.0.0';
            const UPDATE_LOG = data.content || '<p style="text-align: center;">無更新內容</p>';

            const savedVersion = localStorage.getItem('appVersion');

            // 判斷是否為新用戶 (建立時間與最後登入時間相差小於 10 秒)
            let isNewUser = false;
            if (currentUser && currentUser.metadata) {
                const creationTime = new Date(currentUser.metadata.creationTime).getTime();
                const lastSignInTime = new Date(currentUser.metadata.lastSignInTime).getTime();
                if (Math.abs(lastSignInTime - creationTime) < 10000) {
                    isNewUser = true;
                }
            }

            // 如果沒有儲存的版本號，或者是舊版本
            if (savedVersion !== CURRENT_VERSION) {
                
                // 🛑 若為新用戶，直接記錄最新版本號並跳過顯示
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
                // 暫存最新版本號，等待使用者點擊關閉按鈕時寫入 localStorage
                window._latestAppVersion = CURRENT_VERSION;
            }
        }
    }).catch(e => console.error("讀取系統更新日誌失敗:", e));
}

// 關閉更新公告並記錄為已讀
function closeUpdateLogModal() {
    document.getElementById('update-log-modal').style.display = 'none';
    if (window._latestAppVersion) {
        localStorage.setItem('appVersion', window._latestAppVersion); // 記錄已讀當前版本
    }
}