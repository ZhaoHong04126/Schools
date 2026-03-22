/* ========================================================================== */
/* 📌 自主學習活動模組 (Self-Study Activities Module)                          */
/* ========================================================================== */

let editingSelfStudyIndex = -1;

// 渲染列表與計算時數
function renderSelfStudy() {
    const listDiv = document.getElementById('self-study-list');
    if (!listDiv) return;

    // 依日期近到遠排序
    selfStudyActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    let totalHours = 0;
    let html = '';

    if (selfStudyActivities.length === 0) {
        html = '<p style="color:#999; text-align:center; padding: 20px;">目前沒有活動紀錄，趕快去參加活動吧！</p>';
    } else {
        selfStudyActivities.forEach((item, index) => {
            const hours = parseFloat(item.hours) || 0;
            totalHours += hours;

            html += `
            <div class="card" style="margin-bottom: 12px; padding: 15px; border-left: 5px solid var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="flex: 1;" onclick="editSelfStudy(${index})">
                        <div style="font-size:0.85rem; color:#888; margin-bottom:4px;">
                            ${item.date} • ${item.location || '無地點'}
                        </div>
                        <div style="font-weight:bold; font-size:1.1rem; color:var(--text-main); margin-bottom: 5px;">
                            ${item.name}
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px; align-items:flex-end;">
                        <span style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">${hours} 小時</span>
                        <div style="display:flex; gap: 5px;">
                            <button onclick="editSelfStudy(${index})" style="background:transparent; border:none; color:#f39c12; cursor:pointer; font-size:0.9rem;">✏️</button>
                            <button onclick="deleteSelfStudy(${index})" style="background:transparent; border:none; color:#ccc; cursor:pointer; font-size:0.9rem;">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }

    listDiv.innerHTML = html;

    // 計算自訂時數換 1 學分 (預設 18)
    const rate = selfStudyConversionRate || 18;
    const credits = Math.floor(totalHours / rate);
    const hoursLeft = rate - (totalHours % rate);

    document.getElementById('self-study-total-hours').innerText = totalHours;
    document.getElementById('self-study-credits').innerText = credits;
    document.getElementById('self-study-hours-left').innerText = hoursLeft;
    
    const rateText = document.getElementById('text-self-study-rate');
    if (rateText) rateText.innerText = rate;
}

// 開啟新增視窗
function openSelfStudyModal() {
    editingSelfStudyIndex = -1;
    document.getElementById('self-study-modal').style.display = 'flex';
    document.getElementById('modal-ss-title').innerText = "🏃 新增活動紀錄";
    document.getElementById('btn-save-ss').innerText = "+ 儲存";
    document.getElementById('btn-save-ss').style.background = "var(--primary)";

    document.getElementById('input-ss-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('input-ss-name').value = '';
    document.getElementById('input-ss-location').value = '';
    document.getElementById('input-ss-hours').value = '';
}

function closeSelfStudyModal() {
    document.getElementById('self-study-modal').style.display = 'none';
    editingSelfStudyIndex = -1;
}

// 儲存活動
function addSelfStudyActivity() {
    const name = document.getElementById('input-ss-name').value.trim();
    const location = document.getElementById('input-ss-location').value.trim();
    const date = document.getElementById('input-ss-date').value;
    const hours = parseFloat(document.getElementById('input-ss-hours').value);

    if (!name || !date || isNaN(hours) || hours <= 0) {
        showAlert("請輸入活動名稱、日期與有效的獲得時數", "資料不全");
        return;
    }

    const data = { name, location, date, hours };

    if (editingSelfStudyIndex > -1) {
        selfStudyActivities[editingSelfStudyIndex] = data;
        showAlert("活動修改成功！", "完成");
    } else {
        selfStudyActivities.push(data);
        showAlert("活動已新增！", "成功");
    }

    saveData();
    closeSelfStudyModal();
    renderSelfStudy();
    if (typeof renderCalendar === 'function') renderCalendar();
}

// 編輯活動
function editSelfStudy(index) {
    const item = selfStudyActivities[index];
    if (!item) return;

    editingSelfStudyIndex = index;
    document.getElementById('self-study-modal').style.display = 'flex';
    document.getElementById('modal-ss-title').innerText = "✏️ 編輯活動紀錄";
    document.getElementById('btn-save-ss').innerText = "💾 儲存修改";
    document.getElementById('btn-save-ss').style.background = "#f39c12";

    document.getElementById('input-ss-date').value = item.date;
    document.getElementById('input-ss-name').value = item.name;
    document.getElementById('input-ss-location').value = item.location || '';
    document.getElementById('input-ss-hours').value = item.hours;
}

// 刪除活動
function deleteSelfStudy(index) {
    showConfirm("確定要刪除這筆活動紀錄嗎？").then(ok => {
        if (ok) {
            if (editingSelfStudyIndex === index) closeSelfStudyModal();
            selfStudyActivities.splice(index, 1);
            saveData();
            renderSelfStudy();
            if (typeof renderCalendar === 'function') renderCalendar();
        }
    });
}

// 支援從行事曆點擊編輯 (自動切換至自主學習頁籤並開啟 Modal)
window.editSelfStudyEventFromCalendar = function(event, index) {
    if (event) event.stopPropagation();
    if (typeof switchTab === 'function') switchTab('self-study');
    
    // 給一點延遲讓頁面切換完畢再開啟 Modal
    setTimeout(() => {
        editSelfStudy(index);
    }, 100);
};

// 支援從行事曆刪除
window.deleteSelfStudyEventFromCalendar = function(index) {
    if (!isCalendarEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要刪除活動，請先切換至編輯狀態。");
        return;
    }
    
    if (window.showConfirm) {
        showConfirm("確定刪除這筆自主學習活動紀錄嗎？").then(ok => {
            if (ok) {
                selfStudyActivities.splice(index, 1);
                saveData();
                renderSelfStudy();
                if (typeof renderCalendar === 'function') renderCalendar();
            }
        });
    }
};

// 核心功能：同步時數轉換的學分至成績單
function syncSelfStudyToGrades() {
    let totalHours = 0;
    selfStudyActivities.forEach(item => totalHours += (parseFloat(item.hours) || 0));
    
    const rate = selfStudyConversionRate || 18;
    const credits = Math.floor(totalHours / rate);

    if (credits === 0) {
        showAlert(`目前累計時數不足以兌換學分（需滿 ${rate} 小時）。\n繼續加油去參加活動吧！`, "時數不足");
        return;
    }

    // 尋找成績單中是否已經有「自主學習」且為學分紀錄模式(score === -1)
    let existingIndex = gradeList.findIndex(g => g.subject === '自主學習' && g.score === -1);
    
    if (existingIndex > -1) {
        gradeList[existingIndex].credit = credits;
        showAlert(`已更新成績單中「自主學習」學分為 ${credits}！`, "同步成功");
    } else {
        gradeList.push({
            subject: '自主學習',
            category: '自由選修', // 系統預設
            nature: '選修',
            credit: credits,
            score: -1 // -1 代表只計學分不計成績
        });
        showAlert(`已新增「自主學習」至成績單，學分為 ${credits}！`, "同步成功");
    }
    
    saveData();
    if (typeof loadGrades === 'function') loadGrades();
}

// 編輯學分兌換率設定
// 開啟學分兌換率設定 Modal
window.editSelfStudyRate = function() {
    const currentRate = selfStudyConversionRate || 18;
    document.getElementById('input-ss-rate').value = currentRate;
    document.getElementById('self-study-rate-modal').style.display = 'flex';
}

// 關閉學分兌換率設定 Modal
window.closeSelfStudyRateModal = function() {
    document.getElementById('self-study-rate-modal').style.display = 'none';
}

// 儲存學分兌換率設定
window.saveSelfStudyRate = function() {
    const newRateStr = document.getElementById('input-ss-rate').value;
    const newRate = parseFloat(newRateStr);
    
    if (!isNaN(newRate) && newRate > 0) {
        selfStudyConversionRate = newRate;
        saveData();
        renderSelfStudy();
        if (typeof renderCalendar === 'function') renderCalendar();
        closeSelfStudyRateModal();
        if (window.showAlert) showAlert("已成功更新自主學習學分兌換率！", "設定成功");
    } else {
        if (window.showAlert) showAlert("請輸入大於 0 的有效數字！", "輸入錯誤");
    }
}