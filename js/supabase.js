const SUPABASE_URL = 'https://kslxwdszphrijelfefpf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__HFXyWt9PLb9yvF1K0LZYg_b3jJoeJI';

// 初始化 Supabase 客戶端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 取代原本的 db 與 auth 全域變數，或是直接在程式碼中改用 supabase.auth 與 supabase.from()