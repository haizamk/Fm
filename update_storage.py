import re

with open('src/services/dataStorage.ts', 'r') as f:
    content = f.read()

helper = """
/**
 * Safely saves data to localStorage, truncating arrays if QuotaExceededError occurs
 */
function safeSetStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e?.message?.includes('quota') || e?.message?.includes('exceeded')) {
      console.warn(`[Storage Quota Exceeded] for ${key}. Attempting to truncate data...`);
      if (Array.isArray(data)) {
        const truncated = data.slice(0, 100);
        try {
          localStorage.setItem(key, JSON.stringify(truncated));
          console.log(`[Storage] Successfully saved truncated data for ${key}`);
        } catch (innerError) {
          try {
             localStorage.setItem(key, JSON.stringify(data.slice(0, 20)));
          } catch(e3) {
             console.error("Giving up on saving local cache for", key);
          }
        }
      } else {
         console.warn(`[Storage] Cannot truncate non-array data for ${key}`);
      }
    } else {
      console.error(`[Storage] Failed to save ${key}`, e);
    }
  }
}

export const dataStorageService = {
"""

content = content.replace("export const dataStorageService = {", helper)
content = re.sub(r'localStorage\.setItem\(([^,]+),\s*JSON\.stringify\(([^)]+)\)\)', r'safeSetStorage(\1, \2)', content)

with open('src/services/dataStorage.ts', 'w') as f:
    f.write(content)
