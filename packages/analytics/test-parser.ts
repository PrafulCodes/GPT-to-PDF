// Self-contained parser verification tests (pure functions)

function detectBrowser(ua: string): string {
  if (!ua) return 'Unknown';
  const uaLower = ua.toLowerCase();
  
  if (uaLower.includes('opera') || uaLower.includes('opr/')) return 'Opera';
  if (uaLower.includes('edg/')) return 'Edge';
  if (uaLower.includes('chrome') || uaLower.includes('crios')) {
    if (uaLower.includes('googlebot') || uaLower.includes('bingbot')) {
      return 'Unknown';
    }
    return 'Chrome';
  }
  if (uaLower.includes('firefox') || uaLower.includes('fxios')) return 'Firefox';
  if (uaLower.includes('safari') && !uaLower.includes('chrome') && !uaLower.includes('android')) return 'Safari';
  
  return 'Unknown';
}

function detectDevice(ua: string): string {
  if (!ua) return 'Unknown';
  const uaLower = ua.toLowerCase();
  
  const bots = [
    'bot', 'crawler', 'spider', 'googlebot', 'bingbot', 'yandexbot', 
    'slurp', 'duckduckbot', 'baiduspider', 'twitterbot', 'facebookexternalhit',
    'perplexitybot', 'chatgpt-user', 'applebot', 'ia_archiver'
  ];
  if (bots.some(bot => uaLower.includes(bot))) return 'Bot';
  
  if (uaLower.includes('ipad') || (uaLower.includes('android') && !uaLower.includes('mobile'))) {
    return 'Tablet';
  }
  
  if (/mobi|iphone|ipod|iemobile|blackberry|webos/i.test(uaLower)) {
    return 'Mobile';
  }
  
  if (uaLower.includes('win') || uaLower.includes('macintosh') || uaLower.includes('linux')) {
    return 'Desktop';
  }
  
  return 'Unknown';
}

function detectOS(ua: string): string {
  if (!ua) return 'Unknown';
  const uaLower = ua.toLowerCase();
  
  if (uaLower.includes('win')) return 'Windows';
  if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) {
    if (/iphone|ipad|ipod/.test(uaLower)) return 'iOS';
    return 'macOS';
  }
  if (uaLower.includes('android')) return 'Android';
  if (/iphone|ipad|ipod/.test(uaLower)) return 'iOS';
  if (uaLower.includes('linux')) return 'Linux';
  
  return 'Unknown';
}

function detectReferrer(referrerUrl: string): string {
  if (!referrerUrl || referrerUrl.trim() === '') return 'Direct';
  
  try {
    const url = new URL(referrerUrl);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();
    const search = url.search.toLowerCase();
    
    if (host.includes('google.com')) {
      if (search.includes('google_ai_overview') || path.includes('/ai-overview') || search.includes('&sxsrf=') && search.includes('google_ai')) {
        return 'Google AI Overview';
      }
      return 'Google';
    }
    if (host.includes('bing.com')) return 'Bing';
    if (host.includes('duckduckgo.com') || host.includes('ddg.gg')) return 'DuckDuckGo';
    if (host.includes('perplexity.ai')) return 'Perplexity';
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'ChatGPT';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('github.com')) return 'GitHub';
    if (referrerUrl.toLowerCase() === 'direct') return 'Direct';
    
    return 'Unknown';
  } catch {
    const refLower = referrerUrl.toLowerCase().trim();
    if (refLower.includes('google')) return 'Google';
    if (refLower.includes('bing')) return 'Bing';
    if (refLower.includes('duckduckgo') || refLower.includes('ddg')) return 'DuckDuckGo';
    if (refLower.includes('perplexity')) return 'Perplexity';
    if (refLower.includes('chatgpt') || refLower.includes('openai')) return 'ChatGPT';
    if (refLower.includes('reddit')) return 'Reddit';
    if (refLower.includes('github')) return 'GitHub';
    if (refLower === 'direct') return 'Direct';
    
    return 'Unknown';
  }
}

const userAgents = [
  {
    name: 'Chrome on Windows 11',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    expectedBrowser: 'Chrome', expectedOS: 'Windows', expectedDevice: 'Desktop'
  },
  {
    name: 'Safari on iPhone (iOS)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    expectedBrowser: 'Safari', expectedOS: 'iOS', expectedDevice: 'Mobile'
  },
  {
    name: 'Firefox on Linux',
    ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
    expectedBrowser: 'Firefox', expectedOS: 'Linux', expectedDevice: 'Desktop'
  },
  {
    name: 'Edge on Windows 10',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.65',
    expectedBrowser: 'Edge', expectedOS: 'Windows', expectedDevice: 'Desktop'
  },
  {
    name: 'Googlebot (Crawler)',
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/123.0.0.0 Safari/537.36',
    expectedBrowser: 'Unknown', expectedOS: 'Unknown', expectedDevice: 'Bot'
  },
  {
    name: 'ChatGPT User Bot',
    ua: 'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
    expectedBrowser: 'Unknown', expectedOS: 'Unknown', expectedDevice: 'Bot'
  }
];

const referrers = [
  { input: 'https://www.google.com/search?q=chatgpt+to+pdf', expected: 'Google' },
  { input: 'https://www.google.com/search?q=ai+overview&google_ai_overview=true', expected: 'Google AI Overview' },
  { input: 'https://chatgpt.com/c/uuid', expected: 'ChatGPT' },
  { input: 'https://perplexity.ai/search', expected: 'Perplexity' },
  { input: 'https://github.com/some/repo', expected: 'GitHub' },
  { input: 'https://reddit.com/r/openai', expected: 'Reddit' },
  { input: '', expected: 'Direct' },
  { input: 'Direct', expected: 'Direct' },
  { input: 'https://example.com/arbitrary-referrer', expected: 'Unknown' }
];

function runTests() {
  console.log('==================================================');
  console.log('RUNNING USER-AGENT PARSER TESTS');
  console.log('==================================================');
  
  let uaPassed = 0;
  userAgents.forEach(tc => {
    const browser = detectBrowser(tc.ua);
    const os = detectOS(tc.ua);
    const device = detectDevice(tc.ua);
    
    const bOk = browser === tc.expectedBrowser;
    const oOk = os === tc.expectedOS;
    const dOk = device === tc.expectedDevice;
    
    if (bOk && oOk && dOk) {
      console.log(`[PASS] ${tc.name}`);
      uaPassed++;
    } else {
      console.log(`[FAIL] ${tc.name}`);
      console.log(`       Expected: Browser=${tc.expectedBrowser}, OS=${tc.expectedOS}, Device=${tc.expectedDevice}`);
      console.log(`       Got:      Browser=${browser}, OS=${os}, Device=${device}`);
    }
  });

  console.log('\n==================================================');
  console.log('RUNNING REFERRER PARSER TESTS');
  console.log('==================================================');
  
  let refPassed = 0;
  referrers.forEach(tc => {
    const ref = detectReferrer(tc.input);
    if (ref === tc.expected) {
      console.log(`[PASS] Input: "${tc.input || '(empty)'}" -> "${ref}"`);
      refPassed++;
    } else {
      console.log(`[FAIL] Input: "${tc.input}"`);
      console.log(`       Expected: "${tc.expected}"`);
      console.log(`       Got:      "${ref}"`);
    }
  });

  const total = userAgents.length + referrers.length;
  const passed = uaPassed + refPassed;
  
  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${passed}/${total} checks passed.`);
  console.log('==================================================\n');
  
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
