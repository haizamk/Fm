const target = "1111135503"; // Without 60
const message = "Test auto";
const token = "x3SReuA4iR9Z2aXo5S!Z";

const formBody = new URLSearchParams();
formBody.append('target', target);
formBody.append('message', message);
formBody.append('countryCode', '60');

fetch('https://api.fonnte.com/send', {
  method: 'POST',
  headers: {
    'Authorization': token,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: formBody.toString()
}).then(r => r.json()).then(console.log);
