/* ========================================================================== */
/* 📌 系統狀態與使用者資訊 (System State & User Info)                           */
/* ========================================================================== */

// 目前登入的 Firebase 使用者物件
let currentUser = null;

// 是否為註冊模式 (控制登入頁面狀態)
let isRegisterMode = false;

// 儲存學校與科系資訊的物件
let userSchoolInfo = { school: "", department: "" };



/* ========================================================================== */
/* 📌 學期與時間設定 (Semester & Time Settings)                                 */
/* ========================================================================== */

// 目前選擇的星期 (預設為今天)
let currentDay = new Date().getDay();

// 目前選擇的學期代號
let currentSemester = "114-1";

// 儲存所有可用的學期清單
let semesterList = ["114-1"];

// 當前學期的開始日期
let semesterStartDate = "";

// 當前學期的結束日期
let semesterEndDate = "";

// 課堂時間設定預設值 (上課、下課時間與首節開始時間)
let periodConfig = { classDur: 50, breakDur: 10, startHash: "08:10" };

// 儲存各節次獨立時間的設定
let periodTimesConfig = {};

// 預設的節次代碼列表 (可自訂)
let customPeriods = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D'];



/* ========================================================================== */
/* 📌 各模組資料暫存變數 (Module Data Storage)                                  */
/* ========================================================================== */

// 儲存所有學期的完整資料結構
let allData = {};

// 預設的課表結構 (週一到週五，節次為空陣列)
const defaultSchedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };

// 當前學期的週課表資料
let weeklySchedule = {};

// 當前學期的平常考資料
let regularExams = {};

// 當前學期的段考資料
let midtermExams = {};

// 當前學期的成績資料
let gradeList = [];

// 當前學期的行事曆資料
let calendarEvents = [];

// 當前學期的記帳資料
let accountingList = [];

// 學期成績計算的筆記資料
let gradeCalcNotes = [];

// 紀念日追蹤的資料列表
let anniversaryList = [];

// 籤筒模組的資料列表
let lotteryList = [];

// 作業管理的資料列表
let homeworkList = [];

// 記錄系統通知的陣列
let systemNotifications = [];

// 當前學期的自主學習活動紀錄
let selfStudyActivities = [];

// 自主學習活動學分兌換率 (預設 18 小時兌換 1 學分)
let selfStudyConversionRate = 18;



/* ========================================================================== */
/* 📌 系統預設分類與目標設定 (System Defaults & Targets)                        */
/* ========================================================================== */

// 記帳圖表的 Chart.js 實例暫存
let accChartInstance = null;

// 畢業學分目標 (預設為 128 學分)
let graduationTarget = 128;

// 預設的支付方式列表 (現金、刷卡等)
let paymentMethods = [ "現金", "一卡通", "悠遊卡", "信用卡", "行動支付", "轉帳" ];

// 預設的收支分類列表 (包含收入與支出類別)
let accCategories = {
    expense: [ "飲食", "交通", "購物", "生活用品", "網路費", "其他" ],
    income: [ "薪水", "零用錢", "獎金", "投資", "其他" ]
};

// 模組類別的目標值設定 (如自由選修學分等)
let categoryTargets = { "自由選修": 20 };



/* ========================================================================== */
/* 📌 使用者偏好設定 (User Preferences)                                         */
/* ========================================================================== */

// 紀錄使用者的系統設定 (目前僅保留系統通知開關)
let userPreferences = {
    pushEnabled: false
};