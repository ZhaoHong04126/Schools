const SUPABASE_URL = 'https://kslxwdszphrijelfefpf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__HFXyWt9PLb9yvF1K0LZYg_b3jJoeJI';

// 💡 關鍵：直接用 window.supabase 去接收建立好的 Client，
// 千萬不要在這裡加上 const 或 let，否則會跟 CDN 衝突！
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);