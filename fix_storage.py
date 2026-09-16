import re

with open('src/services/dataStorage.ts', 'r') as f:
    content = f.read()

# Fix the infinite recursion
content = content.replace('''function safeSetStorage(key: string, data: any) {
  try {
    safeSetStorage(key, data);''', '''function safeSetStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));''')

content = content.replace('''const truncated = data.slice(0, 100);
        try {
          safeSetStorage(key, truncated);''', '''const truncated = data.slice(0, 100);
        try {
          localStorage.setItem(key, JSON.stringify(truncated));''')

content = content.replace('''try {
             safeSetStorage(key, data.slice(0, 20));''', '''try {
             localStorage.setItem(key, JSON.stringify(data.slice(0, 20)));''')

with open('src/services/dataStorage.ts', 'w') as f:
    f.write(content)
