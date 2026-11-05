// Minimal, dependency-free user-agent classifier. Only coarse buckets are kept - the raw
// user-agent string is never stored.

export type UaInfo = { bot: boolean; device: 'mobile' | 'tablet' | 'desktop'; browser: string; os: string };

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|facebot|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http|java\/|httpclient|scrapy|vercel|gtmetrix|pagespeed|semrush|ahrefs|mj12|dataprovider|bytespider|petalbot|yandex|baiduspider|bingpreview|whatsapp|telegrambot|discordbot|twitterbot|linkedinbot|pinterestbot|embedly/i;

export function parseUserAgent(ua: string | null | undefined): UaInfo {
  const s = (ua || '').slice(0, 400);
  if (!s || BOT.test(s)) return { bot: true, device: 'desktop', browser: 'Bot', os: 'Other' };
  const tablet = /iPad|Tablet|Nexus 7|Nexus 9|SM-T|Kindle|Silk/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s));
  const mobile = !tablet && /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(s);
  const os = /Windows/i.test(s) ? 'Windows'
    : /iPhone|iPad|iPod/i.test(s) ? 'iOS'
    : /Android/i.test(s) ? 'Android'
    : /CrOS/i.test(s) ? 'ChromeOS'
    : /Mac OS X|Macintosh/i.test(s) ? 'macOS'
    : /Linux|X11/i.test(s) ? 'Linux' : 'Other';
  // In-app browsers first: these are what ad clicks from Instagram/Facebook/TikTok/Pinterest open in.
  const browser = /Instagram/i.test(s) ? 'Instagram app'
    : /FBAN|FBAV|FB_IAB/i.test(s) ? 'Facebook app'
    : /musical_ly|TikTok|BytedanceWebview|Bytedance/i.test(s) ? 'TikTok app'
    : /Pinterest/i.test(s) ? 'Pinterest app'
    : /EdgA?\/|Edg\//.test(s) ? 'Edge'
    : /OPR\/|Opera/i.test(s) ? 'Opera'
    : /SamsungBrowser/i.test(s) ? 'Samsung Internet'
    : /Firefox|FxiOS/i.test(s) ? 'Firefox'
    : /Chrome|CriOS/i.test(s) ? 'Chrome'
    : /Safari/i.test(s) ? 'Safari' : 'Other';
  return { bot: false, device: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop', browser, os };
}
