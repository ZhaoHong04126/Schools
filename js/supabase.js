const SUPABASE_URL = 'https://kslxwdszphrijelfefpf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__HFXyWt9PLb9yvF1K0LZYg_b3jJoeJI';

// 初始化 Supabase 客戶端
// 💡 關鍵修改：不要用 const supabase 宣告，直接將實例覆寫給 window.supabase 解決衝突
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);