const target = "601111135503";
const message = "Test auto";
const token = "x3SReuA4iR9Z2aXo5S!Z"; // Note: this is a dummy token, maybe user didn't share his real token here.

fetch('https://api.fonnte.com/send', {
  method: 'POST',
  headers: {
    'Authorization': token,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({target, message}).toString()
}).then(r => r.json()).then(console.log);
