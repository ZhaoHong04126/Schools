/* ========================================================================== */
/* 📌 Supabase 核心配置與初始化                                                 */
/* ========================================================================== */

const SUPABASE_URL = 'https://fpujjzqbgvvzyytruhbz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_C6A2AJfAYGXUEjrO0ZB4Fw_gRk5r5vg';

// 初始化 Supabase 客戶端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 取代原本的 db 與 auth 全域變數，或是直接在程式碼中改用 supabase.auth 與 supabase.from()