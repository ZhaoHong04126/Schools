/* ========================================================================== */
/* 📌 Firebase 核心配置與初始化 (Firebase Configuration & Initialization)       */
/* ========================================================================== */

// Firebase 專案的連線設定檔 (包含 API Key 與專案 ID)
const firebaseConfig = {
    apiKey: "AIzaSyBvWcCroeNSe4O1H_-hXgOJysO-Fyez0Qg",
    authDomain: "campusking6.firebaseapp.com",
    projectId: "campusking6",
    storageBucket: "campusking6.firebasestorage.app",
    messagingSenderId: "904334224237",
    appId: "1:904334224237:web:21e9c3717bd05896af0864",
    measurementId: "G-ER6B64XEBJ"
};

// 初始化 Firebase 應用程式實例
firebase.initializeApp(firebaseConfig);

// 取得 Firebase Authentication (身分驗證) 實例
const auth = firebase.auth();

// 建立 Google 登入的驗證提供者 (Provider)
const provider = new firebase.auth.GoogleAuthProvider();

// 取得 Firestore 資料庫實例，用於後續資料讀寫
const db = firebase.firestore();