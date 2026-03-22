/* ========================================================================== */
/* 📌 作業全域變數與列表渲染 (Homework Variables & Rendering)                   */
/* ========================================================================== */

// 用來記錄目前正在編輯的作業索引 (-1 代表新增模式)
let editingHomeworkIndex = -1;

// 渲染作業列表，包含完成狀態樣式切換與總計數據計算
function renderHomework() {
    const listDiv = document.getElementById('homework-list');
    const summaryDiv = document.getElementById('homework-summary');
    if (!listDiv) return;

    homeworkList.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.date) - new Date(b.date);
    });

    let html = '';
    let totalCount = homeworkList.length;
    let completedCount = 0;

    if (totalCount === 0) {
        html = `
            <div style="text-align:center; padding:30px; color:#999;">
                <div style="font-size:3rem; margin-bottom:10px;">🎒</div>
                <p>目前沒有作業<br>享受自由的時光吧！</p>
            </div>`;
    } else {
        homeworkList.forEach((item, index) => {
            if (item.completed) completedCount++;

            const statusColor = item.completed ? '#2ecc71' : '#e74c3c';
            const cardOpacity = item.completed ? '0.7' : '1';
            const decoration = item.completed ? 'line-through' : 'none';
            const icon = item.completed ? '✅' : '⬜';

            html += `
            <div class="card" style="margin-bottom: 12px; padding: 15px; border-left: 5px solid ${statusColor}; opacity: ${cardOpacity};">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="flex: 1;" onclick="editHomework(${index})">
                        <div style="font-size:0.85rem; color:#888; margin-bottom:4px;">
                            ${item.date} • <span style="color:var(--primary); font-weight:bold;">${item.subject}</span>
                        </div>
                        <div style="font-weight:bold; font-size:1.1rem; color:var(--text-main); text-decoration: ${decoration}; margin-bottom: 5px;">
                            ${item.title}
                        </div>
                        <div style="font-size:0.9rem; color:#666;">
                            分數: <span style="font-weight:bold; color:#333;">${item.score || '-'}</span> / ${item.total || 100}
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px; align-items:flex-end;">
                        <button onclick="toggleHomeworkStatus(${index})" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer;" title="切換狀態">${icon}</button>
                        <div style="display:flex; gap: 5px;">
                            <button onclick="editHomework(${index})" style="background:transparent; border:none; color:#f39c12; cursor:pointer; font-size:0.9rem;">✏️</button>
                            <button onclick="deleteHomework(${index})" style="background:transparent; border:none; color:#ccc; cursor:pointer; font-size:0.9rem;">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    
    listDiv.innerHTML = html;

    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <span style="margin-right: 15px;">總計: <b>${totalCount}</b></span>
            <span style="color:#2ecc71;">完成: <b>${completedCount}</b></span> / 
            <span style="color:#e74c3c;">未完: <b>${totalCount - completedCount}</b></span>
        `;
    }
}



/* ========================================================================== */
/* 📌 作業新增、修改與刪除 (Homework CRUD Operations)                           */
/* ========================================================================== */

// 儲存作業資料 (根據編輯模式索引，決定是更新陣列還是推入新資料)
function addHomework() {
    const selectEl = document.getElementById('input-hw-subject-select');
    const textEl = document.getElementById('input-hw-subject-text');
    
    let subject = (selectEl.style.display !== 'none') ? selectEl.value : textEl.value;
    
    const title = document.getElementById('input-hw-title').value;
    const date = document.getElementById('input-hw-date').value;
    const score = document.getElementById('input-hw-score').value;
    const total = document.getElementById('input-hw-total').value;

    if (!subject || !title || !date) {
        showAlert("請輸入科目、作業名稱與日期", "資料不全");
        return;
    }

    const homeworkData = {
        subject,
        title,
        date,
        score: score,
        total: total || 100,
        completed: editingHomeworkIndex > -1 ? homeworkList[editingHomeworkIndex].completed : false
    };

    if (editingHomeworkIndex > -1) {
        homeworkList[editingHomeworkIndex] = homeworkData;
        showAlert("作業修改成功！", "完成");
    } else {
        homeworkList.push(homeworkData);
        showAlert("作業已新增！", "成功");
    }

    saveData();
    closeHomeworkModal();
    renderHomework();
}

// 進入指定作業的編輯模式，並將資料回填至視窗表單中
function editHomework(index) {
    const item = homeworkList[index];
    if (!item) return;

    editingHomeworkIndex = index;
    
    document.getElementById('homework-modal').style.display = 'flex';
    document.getElementById('modal-hw-title').innerText = "✏️ 編輯作業";
    
    const btn = document.getElementById('btn-save-hw');
    if (btn) {
        btn.innerText = "💾 儲存修改";
        btn.style.background = "#f39c12";
    }

    updateHomeworkSubjectOptions();

    const selectEl = document.getElementById('input-hw-subject-select');
    const textEl = document.getElementById('input-hw-subject-text');
    const toggleBtn = document.getElementById('btn-toggle-hw-input');
    
    let optionExists = false;
    for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === item.subject) {
            optionExists = true;
            break;
        }
    }

    if (optionExists) {
        selectEl.style.display = 'block';
        textEl.style.display = 'none';
        selectEl.value = item.subject;
        toggleBtn.innerText = "✏️";
    } else {
        selectEl.style.display = 'none';
        textEl.style.display = 'block';
        textEl.value = item.subject;
        toggleBtn.innerText = "📜";
    }

    document.getElementById('input-hw-title').value = item.title;
    document.getElementById('input-hw-date').value = item.date;
    document.getElementById('input-hw-score').value = item.score || '';
    document.getElementById('input-hw-total').value = item.total || 100;
}

// 刪除指定的作業項目
function deleteHomework(index) {
    showConfirm("確定要刪除這項作業嗎？").then(ok => {
        if (ok) {
            if (editingHomeworkIndex === index) closeHomeworkModal();
            homeworkList.splice(index, 1);
            saveData();
            renderHomework();
        }
    });
}



/* ========================================================================== */
/* 📌 表單視窗與輸入控制 (Form Modals & Input Controls)                         */
/* ========================================================================== */

// 切換作業科目的輸入模式 (下拉選單自動選擇 / 文字手寫輸入)
function toggleHomeworkSubjectMode() {
    const selectEl = document.getElementById('input-hw-subject-select');
    const textEl = document.getElementById('input-hw-subject-text');
    const btn = document.getElementById('btn-toggle-hw-input');

    if (selectEl.style.display !== 'none') {
        selectEl.style.display = 'none';
        textEl.style.display = 'block';
        textEl.focus();
        btn.innerText = "📜";
    } else {
        selectEl.style.display = 'block';
        textEl.style.display = 'none';
        btn.innerText = "✏️";
    }
}

// 開啟新增作業的 Modal 視窗，並重置表單為預設狀態
function openHomeworkModal() {
    editingHomeworkIndex = -1;
    document.getElementById('homework-modal').style.display = 'flex';
    document.getElementById('modal-hw-title').innerText = "🎒 新增作業";
    
    const btn = document.getElementById('btn-save-hw');
    if (btn) {
        btn.innerText = "+ 儲存";
        btn.style.background = "var(--primary)";
    }

    document.getElementById('input-hw-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('input-hw-title').value = '';
    document.getElementById('input-hw-score').value = '';
    document.getElementById('input-hw-total').value = '100';

    updateHomeworkSubjectOptions();
    
    const selectEl = document.getElementById('input-hw-subject-select');
    const textEl = document.getElementById('input-hw-subject-text');
    const toggleBtn = document.getElementById('btn-toggle-hw-input');
    
    selectEl.style.display = 'block';
    selectEl.value = '';
    textEl.style.display = 'none';
    textEl.value = '';
    toggleBtn.innerText = "✏️";
}

// 關閉作業新增/編輯的 Modal 視窗，並重置編輯索引
function closeHomeworkModal() {
    document.getElementById('homework-modal').style.display = 'none';
    editingHomeworkIndex = -1;
}

// 從課表中自動抓取所有科目，並更新作業視窗的科目下拉選單內容
function updateHomeworkSubjectOptions() {
    const select = document.getElementById('input-hw-subject-select');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>請選擇科目</option>';
    
    let subjects = new Set();
    if (typeof weeklySchedule !== 'undefined') {
        Object.values(weeklySchedule).forEach(day => {
            day.forEach(c => {
                if(c.subject) subjects.add(c.subject);
            });
        });
    }

    subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.innerText = s;
        select.appendChild(opt);
    });
}



/* ========================================================================== */
/* 📌 作業通知檢查 (Homework Notifications)                                     */
/* ========================================================================== */

window.checkHomeworkNotifications = function() {
    if (typeof homeworkList === 'undefined' || homeworkList.length === 0) return;

    // 取得今天與明天的日期字串 (格式: YYYY-MM-DD)
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.getFullYear() + '-' + String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' + String(tomorrow.getDate()).padStart(2, '0');

    homeworkList.forEach(hw => {
        // 如果作業已經勾選「完成 (completed)」，就不發送通知
        if (hw.completed) return;

        if (hw.date === todayStr) {
            const msg = `【${hw.subject}】的「${hw.title}」今天截止，記得繳交喔！`;
            addNotification("⚠️ 今日死線提醒", msg, "hw_today_" + hw.title + todayStr);
        } 
        else if (hw.date === tomorrowStr) {
            const msg = `【${hw.subject}】的「${hw.title}」明天截止，準備好了嗎？`;
            addNotification("⏳ 明日死線預告", msg, "hw_tmr_" + hw.title + tomorrowStr);
        }
        else if (hw.date < todayStr) {
            // 額外加碼：如果日期已經過去了，但還沒打勾，就發送逾期警告
            const msg = `【${hw.subject}】的「${hw.title}」已經逾期了！快去檢查是否忘記打勾或補交！`;
            addNotification("🚨 作業逾期警告", msg, "hw_overdue_" + hw.title + hw.date);
        }
    });
};