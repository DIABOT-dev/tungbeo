export function saveDevSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dev_supabase_url', url);
    localStorage.setItem('dev_supabase_anon_key', anonKey);
    window.location.reload();
  }
}

function getDevSupabaseConfig() {
  if (typeof window === 'undefined') return null;
  
  const url = localStorage.getItem('dev_supabase_url');
  const anonKey = localStorage.getItem('dev_supabase_anon_key');
  return url && anonKey ? { url, anonKey } : null;
}