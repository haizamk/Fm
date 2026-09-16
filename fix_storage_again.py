import re

with open('src/services/dataStorage.ts', 'r') as f:
    content = f.read()

new_func = """function safeSetStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e?.message?.includes('quota') || e?.message?.includes('exceeded')) {
      console.warn(`[Storage Quota Exceeded] for ${key}. Attempting to free space...`);
      
      try {
        // Clear potentially large non-critical caches
        localStorage.removeItem('khairul_fresh_media_library_v5');
        localStorage.removeItem('khairul_fresh_audit_logs_v5');
        localStorage.removeItem('khairul_fresh_logistics_runs_v5');
      } catch (err) {}

      if (Array.isArray(data)) {
        try {
          localStorage.setItem(key, JSON.stringify(data.slice(0, 40)));
        } catch (innerError) {
          try {
             localStorage.setItem(key, JSON.stringify(data.slice(0, 5)));
          } catch(e3) {
             console.error("Giving up on saving local cache for", key);
          }
        }
      } else {
         try {
           localStorage.setItem(key, JSON.stringify(data));
         } catch(e4) {
           console.error("Giving up on saving local cache for", key);
         }
      }
    } else {
      console.error(`[Storage] Failed to save ${key}`, e);
    }
  }
}"""

content = re.sub(r'function safeSetStorage\(key: string, data: any\) \{[\s\S]*?\}\n\}\n', new_func + '\n', content)

with open('src/services/dataStorage.ts', 'w') as f:
    f.write(content)
