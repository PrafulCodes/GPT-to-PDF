const http = require('http');

const payload = {
  eventType: 'export',
  anonymousVisitorId: 'test-visitor-123',
  sessionId: 'test-session-123',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  landingPath: '/',
  currentPage: '/',
  rawReferrer: 'https://google.com',
  normalizedReferrer: 'Google',
  browser: 'Chrome',
  operatingSystem: 'Windows',
  deviceType: 'Desktop',
  country: 'United States',
  city: 'San Francisco',
  exportId: 'export-123',
  success: true,
  pdfSize: 102400,
  generationDuration: 1.5,
  exportSource: 'HeroInputCard',
  returningSession: false
};

const req = http.request('http://localhost:3000/api/telemetry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', console.error);
req.write(JSON.stringify(payload));
req.end();
