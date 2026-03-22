/* ========================================================================== */
/* 📌 帳號登出與刪除 (Logout & Account Deletion)                                */
/* ========================================================================== */

// 處理登出邏輯並包含防呆警告
function logout() {
    if (typeof isAccountSettingsEditMode !== 'undefined' && !isAccountSettingsEditMode) { 
        if(window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要登出，請先切換至編輯狀態。"); 
        return; 
    }

    if (currentUser) {
        if (currentUser.isAnonymous) {
            showConfirm("⚠️ 匿名帳號登出後資料會消失，確定嗎？", "警告").then(ok => {
                if (ok) performLogout();
            });
        } else {
            const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');
            
            if (isGoogleUser) {
                showConfirm("您目前使用 Google 帳號登入，確定要登出嗎？", "登出確認").then(ok => {
                    if (ok) performLogout();
                });
            } else {
                showConfirm("確定要登出您的帳號嗎？", "登出確認").then(ok => {
                    if (ok) performLogout();
                });
            }
        }
    } else {
        performLogout();
    }
}

// 執行實際的登出動作並重新整理頁面
async function performLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.reload();
}

// 處理永久註銷(刪除)帳號的流程 (Supabase 版本)
function deleteAccount() {
    if (!currentUser) return;
    
    if (typeof isAccountSettingsEditMode !== 'undefined' && !isAccountSettingsEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要刪除帳號，請先切換至編輯狀態。");
        return;
    }
    
    showConfirm("⚠️ 警告：此動作將「永久刪除」您的所有資料（包含課表、成績、記帳...等），且無法復原！\n\n確定要註銷帳號嗎？", "危險操作")
    .then(isConfirmed => {
        if (isConfirmed) {
            return showPrompt("為了確認您的意願，請輸入「DELETE」", "", "最終確認");
        }
        return null;
    })
    .then(async (inputStr) => {
        if (inputStr === "DELETE") {
            // 注意：Supabase 的 User 物件識別碼通常是 .id，為了保險起見我們兼容 .uid
            const userId = currentUser.id || currentUser.uid; 
            if(window.showAlert) showAlert("正在刪除資料，請稍候...", "處理中");

            try {
                // 1. 刪除 Supabase 資料庫中該使用者的關聯資料
                const { error: dbError } = await supabase
                    .from("users")
                    .delete()
                    .eq("id", userId);

                if (dbError) throw dbError;

                // 2. 清除瀏覽器本地端 LocalStorage 的快取資料
                const dbKey = 'CampusKing_v3.8.0_' + userId;
                localStorage.removeItem(dbKey);
                
                // 這裡我們執行登出來清空當前登入狀態
                await supabase.auth.signOut();

                alert("帳號已成功註銷，感謝您的使用。"); 
                window.location.href = 'index.html'; // 刪除後跳回登入頁

            } catch (error) {
                console.error("Delete error:", error);
                showAlert("註銷失敗：" + error.message, "錯誤");
            }
            
        } else if (inputStr !== null) {
            showAlert("輸入內容不正確，已取消操作。", "取消");
        }
    });
}


/* ========================================================================== */
/* 📌 介面狀態與安全防護 (UI State & Security)                                  */
/* ========================================================================== */

// 根據登入狀態更新畫面，未登入時強制踢回登入頁
function updateLoginUI(isLoggedIn) {
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    const dashboard = document.querySelector('.dashboard-container');
    const topBar = document.getElementById('top-bar'); 
    
    if (dashboard) dashboard.style.display = 'flex'; 
    if (topBar) topBar.style.display = 'flex'; 
}

// 記錄帳號設定區塊是否處於編輯模式
let isAccountSettingsEditMode = false;

// 切換帳號設定區塊的「唯讀/編輯」模式
window.toggleAccountSettingsEditMode = function() {
    const btn = document.getElementById('btn-toggle-account-edit');
    if (isAccountSettingsEditMode) {
        isAccountSettingsEditMode = false;
        if (btn) {
            btn.innerHTML = "🔒 唯讀模式";
            btn.style.color = "#888";
            btn.style.borderColor = "#ddd";
            btn.style.background = "transparent";
        }
    } else {
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以執行登出與永久刪除帳號。", "✏️ 進入編輯模式").then(ok => {
            if (ok) {
                isAccountSettingsEditMode = true;
                if (btn) {
                    btn.innerHTML = "✏️ 編輯模式";
                    btn.style.color = "var(--danger)";
                    btn.style.borderColor = "var(--danger)";
                    btn.style.background = "#fff0f0";
                }
            }
        });
    }
}