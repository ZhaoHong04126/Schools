// ==========================================
// 1. 學生端：送出回饋
// ==========================================
async function submitFeedback() {
    const type = document.getElementById('feedback-type').value;
    const content = document.getElementById('feedback-content').value;
    const submitBtn = document.querySelector('#feedback-modal .btn-primary');

    if (!content.trim()) {
        alert("請輸入回饋內容！");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "送出中...";

    try {
        const uid = currentUser ? currentUser.id : "anonymous"; // 改為 currentUser.id
        
        const { error } = await supabase.from("feedbacks").insert([{
            uid: uid,
            type: type,
            content: content,
            status: "pending"
            // created_at 會由 Supabase 自動填入
        }]);

        if (error) throw error;

        alert("感謝您的回饋！我們已經收到囉。");
        document.getElementById('feedback-content').value = "";
        document.getElementById('feedback-modal').style.display = 'none';
    } catch (error) {
        console.error("送出回饋失敗:", error);
        alert("送出失敗，請稍後再試。");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "送出回饋";
    }
}

// ==========================================
// 2. 管理端：讀取所有回饋 (已美化版)
// ==========================================
async function loadAdminFeedbacks() {
    const listContainer = document.getElementById('admin-feedback-list');
    const adminView = document.getElementById('view-admin-feedback');

    // --- 啟動紅色背景安全防護模式 (隱藏內容) ---
    const children = Array.from(adminView.children);
    const originalDisplays = children.map(child => child.style.display);
    children.forEach(child => child.style.display = 'none');

    const originalBg = adminView.style.backgroundColor;
    const originalMinHeight = adminView.style.minHeight;
    adminView.style.backgroundColor = '#8b0000'; 
    adminView.style.minHeight = '80vh';

    const warningDiv = document.createElement('div');
    warningDiv.style.textAlign = 'center';
    warningDiv.style.paddingTop = '100px';
    warningDiv.style.color = 'white';
    warningDiv.innerHTML = '<h2>🚨 系統安全防護已啟動</h2><p>此專區包含高度隱私資料<br>請先完成身分驗證程序。</p>';
    adminView.appendChild(warningDiv);

    const restoreView = () => {
        warningDiv.remove();
        children.forEach((child, i) => child.style.display = originalDisplays[i]);
        adminView.style.backgroundColor = originalBg;
        adminView.style.minHeight = originalMinHeight;
    };
    // ----------------------------------------

    const psw = await showPrompt("請輸入管理員密碼以存取使用者回饋：", "", "🔒 權限驗證 (1/3)");
    if (psw === null) {
        restoreView();
        if (typeof switchTab === 'function') switchTab('schedule');
        return;
    }

    if (psw !== "zhao20261150304") {
        if (typeof showAlert === 'function') showAlert("密碼錯誤，拒絕存取！", "❌ 拒絕存取");
        else alert("❌ 密碼錯誤，拒絕存取！");
        restoreView();
        listContainer.innerHTML = "<tr><td colspan='6' style='color: red; font-weight: bold; text-align: center;'>驗證失敗，為保護使用者隱私，拒絕顯示資料。</td></tr>";
        if (typeof switchTab === 'function') switchTab('schedule');
        return;
    }

    const ans1 = await showPrompt("管理者最喜歡吃什麼？", "", "🛡️ 第二次驗證防護 (2/3)");
    if (ans1 === null || ans1.trim() !== "鳳梨湯") {
        if (typeof showAlert === 'function') showAlert("答案錯誤，拒絕存取！", "❌ 拒絕存取");
        else alert("❌ 答案錯誤，拒絕存取！");
        restoreView();
        listContainer.innerHTML = "<tr><td colspan='6' style='color: red; font-weight: bold; text-align: center;'>驗證失敗，為保護使用者隱私，拒絕顯示資料。</td></tr>";
        if (typeof switchTab === 'function') switchTab('schedule');
        return;
    }

    const ans2 = await showPrompt("管理者人生中的第一個老師是誰？", "", "🛡️ 第三次驗證防護 (3/3)");
    if (ans2 === null || ans2.trim() !== "施淑惠老師") {
        if (typeof showAlert === 'function') showAlert("答案錯誤，拒絕存取！", "❌ 拒絕存取");
        else alert("❌ 答案錯誤，拒絕存取！");
        restoreView();
        listContainer.innerHTML = "<tr><td colspan='6' style='color: red; font-weight: bold; text-align: center;'>驗證失敗，為保護使用者隱私，拒絕顯示資料。</td></tr>";
        if (typeof switchTab === 'function') switchTab('schedule');
        return;
    }

    // 驗證全數通過，還原畫面並開始載入
    restoreView();
    listContainer.innerHTML = "<tr><td colspan='6'>載入中...</td></tr>";

    try {
        // 從 Supabase 讀取並依照時間排序
        const { data: feedbacks, error } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
        if (error) throw error;

        listContainer.innerHTML = "";

        if (!feedbacks || feedbacks.length === 0) {
            listContainer.innerHTML = "<tr><td colspan='6' style='color: gray;'>目前沒有任何回饋資料。</td></tr>";
            return;
        }

        feedbacks.forEach(data => {
            const id = data.id;
            // Supabase 統一回傳 ISO 時間字串，解析更簡單安全
            const date = data.created_at ? new Date(data.created_at).toLocaleString('zh-TW', { hour12: false }) : "未知時間";
            
            let statusBadgeClass = "badge badge-status-pending";
            let statusText = "待處理";
            if (data.status === "processing") { statusBadgeClass = "badge badge-status-processing"; statusText = "處理中"; }
            if (data.status === "resolved") { statusBadgeClass = "badge badge-status-resolved"; statusText = "已解決"; }

            let typeBadgeClass = "badge badge-type-other";
            let typeIcon = "💬";
            let typeText = "其他";
            if (data.type === "bug") { typeBadgeClass = "badge badge-type-bug"; typeIcon = "🐞"; typeText = "Bug"; }
            if (data.type === "suggestion") { typeBadgeClass = "badge badge-type-suggestion"; typeIcon = "💡"; typeText = "建議"; }
            
            listContainer.innerHTML += `
                <tr>
                    <td style="color: black;">${date}</td>
                    <td style="color: black; font-family: monospace;">${data.uid || "anonymous"}</td> 
                    <td><span class="${typeBadgeClass}">${typeIcon} ${typeText}</span></td> 
                    <td style="max-width: 300px; word-wrap: break-word; color: black;">${data.content}</td>
                    <td><span class="${statusBadgeClass}">${statusText}</span></td> 
                    <td>
                        <select class="feedback-status-select" onchange="updateFeedbackStatus('${id}', this.value)"> 
                            <option value="pending" ${data.status === 'pending' ? 'selected' : ''}>設為待處理</option>
                            <option value="processing" ${data.status === 'processing' ? 'selected' : ''}>設為處理中</option>
                            <option value="resolved" ${data.status === 'resolved' ? 'selected' : ''}>設為已解決</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("載入回饋失敗:", error);
        listContainer.innerHTML = "<tr><td colspan='6'>載入失敗，請檢查權限或網路。</td></tr>";
    }
}

// ==========================================
// 3. 管理端：更新處理狀態
// ==========================================
async function updateFeedbackStatus(docId, newStatus) {
    try {
        const { error } = await supabase.from("feedbacks").update({ status: newStatus }).eq("id", docId);
        if (error) throw error;
    } catch (error) {
        console.error("更新狀態失敗:", error);
        alert("狀態更新失敗！");
    }
}