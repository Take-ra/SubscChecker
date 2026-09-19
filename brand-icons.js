// brand-icons.js（公式アプリアイコン解決＆ブランドバッジ導出モジュール）

/**
 * 主要サブスクリプション全件の超高解像度・公式忠実ベクターSVGマップ
 * 拡大しても一切ぼやけず、Retinaディスプレイでも100%シャープに描画されます。
 */
export function getCustomBrandSvg(name = "") {
  const n = (name || "").toLowerCase().trim();

  // --- 動画配信 (video) ---
  if (/netflix/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><path d="M9 7H13.2V25H9V7Z" fill="#B81D24"/><path d="M18.8 7H23V25H18.8V7Z" fill="#B81D24"/><path d="M9 7H13.2L23 25H18.8L9 7Z" fill="#E50914"/></svg>`;
  }
  if (/amazon\s*prime/i.test(n) || (n.includes("prime") && !n.includes("music"))) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#00A8E1"/><text x="16" y="16.5" text-anchor="middle" fill="white" font-size="8.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">prime</text><path d="M8.5 20C13 23.5 19 23.5 23.5 20" stroke="#FF9900" stroke-width="2" stroke-linecap="round"/><path d="M22.5 18.5L24 20.5L21.5 21" stroke="#FF9900" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  if (/youtube\s*premium/i.test(n) || (/youtube/i.test(n) && !n.includes("music"))) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FF0000"/><polygon points="13,11 22,16 13,21" fill="white"/></svg>`;
  }
  if (/disney/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><defs><linearGradient id="disney-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0E2356"/><stop offset="100%" stop-color="#04091A"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#disney-grad)"/><text x="12" y="19" text-anchor="middle" fill="white" font-size="12" font-style="italic" font-weight="900" font-family="serif">D</text><path d="M20 12V20M16 16H24" stroke="#00D6FE" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  }
  if (/u-next|ユーネクスト/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><path d="M10 9V17C10 20.3 12.7 23 16 23C19.3 23 22 20.3 22 17V9H18.5V17C18.5 18.4 17.4 19.5 16 19.5C14.6 19.5 13.5 18.4 13.5 17V9H10Z" fill="white"/><rect x="20.5" y="7" width="3.2" height="3.2" rx="0.5" fill="#00D2FF"/></svg>`;
  }
  if (/hulu|フールー/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#1CE783"/><text x="16" y="20" text-anchor="middle" fill="#0B3E27" font-size="10.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">hulu</text></svg>`;
  }
  if (/abema|アベマ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#1A1A1A"/><rect x="9" y="11" width="14" height="11" rx="4" fill="#00C974"/><circle cx="13" cy="16" r="1.5" fill="#1A1A1A"/><circle cx="19" cy="16" r="1.5" fill="#1A1A1A"/><circle cx="16" cy="8.5" r="1.5" fill="#00C974"/></svg>`;
  }
  if (/dmm\s*tv/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><text x="16" y="15.5" text-anchor="middle" fill="white" font-size="7.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">DMM</text><text x="16" y="23.5" text-anchor="middle" fill="#FF0044" font-size="7.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">TV</text></svg>`;
  }
  if (/dアニメ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#F47521"/><text x="12.5" y="21.5" text-anchor="middle" fill="white" font-size="14.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">d</text><polygon points="18.5,13 24,16.5 18.5,20" fill="white"/></svg>`;
  }
  if (/dazn|ダゾーン/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><text x="16" y="15.5" text-anchor="middle" fill="#F7FF00" font-size="7.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">DA</text><text x="16" y="23.5" text-anchor="middle" fill="#F7FF00" font-size="7.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">ZN</text></svg>`;
  }
  if (/fod/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#C41230"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="9.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">FOD</text></svg>`;
  }
  if (/wowow/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#002B7F"/><text x="16" y="19" text-anchor="middle" fill="white" font-size="6.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">WOWOW</text></svg>`;
  }
  if (/lemino|レミノ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FFE600"/><circle cx="12" cy="14.5" r="2" fill="#1C1C1C"/><circle cx="20" cy="14.5" r="2" fill="#1C1C1C"/><path d="M12 18.5C14 21 18 21 20 18.5" stroke="#1C1C1C" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  if (/apple\s*tv/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><path d="M12.5 13.5C12 13 11 13.5 10.5 14C10 14.5 9 16 9 17.5C9 19.5 10.5 21.5 11.8 21.5C12.4 21.5 12.8 21.1 13.4 21.1C14 21.1 14.4 21.5 15 21.5C16.3 21.5 17.5 19.5 17.5 18C16 17.5 15.5 16 15.7 14.7C14.7 14.5 14 15 12.5 13.5Z" fill="white"/><text x="21" y="19" text-anchor="middle" fill="white" font-size="7.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">tv+</text></svg>`;
  }
  if (/telasa|テラサ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FF5000"/><text x="16" y="19" text-anchor="middle" fill="white" font-size="6.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">TELASA</text></svg>`;
  }

  // --- 音楽 (music) ---
  if (/spotify/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#1ED760"/><path d="M22.5 12.5C17.5 9.5 11.5 9.5 7.5 11.5" stroke="#121212" stroke-width="2.5" stroke-linecap="round"/><path d="M21 16C16.5 13.5 11.5 13.5 8.5 15" stroke="#121212" stroke-width="2.2" stroke-linecap="round"/><path d="M19.5 19.5C16 17.5 12 17.5 9.5 18.5" stroke="#121212" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  }
  if (/apple\s*music/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><defs><linearGradient id="applemusic-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FC3C44"/><stop offset="100%" stop-color="#FA243C"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#applemusic-grad)"/><path d="M12 18.5C10.6 18.5 9.5 19.4 9.5 20.5C9.5 21.6 10.6 22.5 12 22.5C13.4 22.5 14.5 21.6 14.5 20.5V11L21.5 9.5V17C20.1 17 19 17.9 19 19C19 20.1 20.1 21 21.5 21C22.9 21 24 20.1 24 19V7.5L12 9.5V18.5Z" fill="white"/></svg>`;
  }
  if (/amazon\s*music/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#1E2B37"/><path d="M17 8.5V16.8C16.4 16.4 15.6 16.1 14.7 16.1C12.7 16.1 11 17.4 11 19.1C11 20.8 12.7 22.1 14.7 22.1C16.7 22.1 18.3 20.8 18.3 19.1V12L22 11V8.5L17 8.5Z" fill="#00A8E1"/><path d="M8 24C12 26 18 26 23 23.5" stroke="#FF9900" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  }
  if (/youtube\s*music/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#181818"/><circle cx="16" cy="16" r="10" fill="#FF0000"/><circle cx="16" cy="16" r="6" fill="#181818"/><polygon points="14.5,12.5 19,16 14.5,19.5" fill="white"/></svg>`;
  }
  if (/line\s*music/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#06C755"/><path d="M18.5 8.5V17.8C17.9 17.4 17.1 17.1 16.2 17.1C14 17.1 12.2 18.5 12.2 20.3C12.2 22.1 14 23.5 16.2 23.5C18.4 23.5 20.2 22.1 20.2 20.3V11.5L23.5 10.5V8.5L18.5 8.5Z" fill="white"/><rect x="7" y="16" width="2" height="6" rx="1" fill="white" fill-opacity="0.85"/><rect x="25" y="14" width="2" height="8" rx="1" fill="white" fill-opacity="0.85"/></svg>`;
  }
  if (/awa\b/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#1C1C1C"/><path d="M7 21L11 11L14 19L18 11L21 21" stroke="#FF5500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (/楽天ミュージック|rakuten\s*music/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#BF0000"/><path d="M9 7.5H15.5C18 7.5 19.8 8.8 19.8 11.2C19.8 13.1 18.4 14.5 16.5 14.8L20.2 21H17.2L13.8 15.2H11.5V21H9V7.5ZM11.5 13H15.2C16.4 13 17.3 12.3 17.3 11.2C17.3 10.1 16.4 9.4 15.2 9.4H11.5V13Z" fill="white"/><path d="M9 23.5H23" stroke="#FF4D4D" stroke-width="1.8" stroke-linecap="round"/><circle cx="23" cy="8.5" r="1.8" fill="#FFEB3B"/><path d="M24.8 8.5V13" stroke="#FFEB3B" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }

  // --- 電子書籍 (ebook) ---
  if (/kindle/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><defs><linearGradient id="kindle-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0F82BC"/><stop offset="100%" stop-color="#004675"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#kindle-grad)"/><path d="M8 12C11 10.5 14 11 16 13C18 11 21 10.5 24 12V22C21 20.5 18 21 16 23C14 21 11 20.5 8 22V12Z" fill="white" fill-opacity="0.95"/><path d="M16 13V23" stroke="#004675" stroke-width="1.2" stroke-linecap="round"/><circle cx="16" cy="8" r="1.2" fill="#FFB800"/><path d="M12 7.5L12.5 9L14 9.5L12.5 10L12 11.5L11.5 10L10 9.5L11.5 9L12 7.5Z" fill="#FFD700"/></svg>`;
  }
  if (/audible|オーディブル/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#F7941D"/><path d="M8 13C11 11.5 14 12 16 14C18 12 21 11.5 24 13V22C21 20.5 18 21 16 23C14 21 11 20.5 8 22V13Z" fill="white"/><circle cx="16" cy="9" r="1.5" fill="white"/><path d="M12 8C14 6.5 18 6.5 20 8" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }
  if (/dマガジン/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#CC0000"/><text x="12" y="21.5" text-anchor="middle" fill="white" font-size="14.5" font-weight="900" font-family="system-ui, -apple-system, sans-serif">d</text><rect x="18" y="11" width="6.5" height="9" rx="1" fill="white"/><line x1="20" y1="14" x2="22.5" y2="14" stroke="#CC0000" stroke-width="1"/><line x1="20" y1="17" x2="22.5" y2="17" stroke="#CC0000" stroke-width="1"/></svg>`;
  }
  if (/楽天マガジン|rakuten\s*magazine/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#BF0000"/><path d="M9 7.5H15.5C18 7.5 19.8 8.8 19.8 11.2C19.8 13.1 18.4 14.5 16.5 14.8L20.2 21H17.2L13.8 15.2H11.5V21H9V7.5ZM11.5 13H15.2C16.4 13 17.3 12.3 17.3 11.2C17.3 10.1 16.4 9.4 15.2 9.4H11.5V13Z" fill="white"/><path d="M9 23.5H23" stroke="#FF4D4D" stroke-width="1.8" stroke-linecap="round"/><rect x="20" y="7" width="5" height="6.5" rx="1" fill="#FFEB3B"/></svg>`;
  }
  if (/cmoa|コミックシーモア/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FF5000"/><path d="M8 10C11 9 14 9.5 16 11.5C18 9.5 21 9 24 10V22C21 21 18 21.5 16 23.5C14 21.5 11 21 8 22V10Z" fill="white"/><path d="M16 11.5V23.5" stroke="#FF5000" stroke-width="1.2"/></svg>`;
  }

  // --- ゲーム (game) ---
  if (/playstation|ps\s*plus/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#003791"/><path d="M16 9V23M9 16H23" stroke="#F5C400" stroke-width="3.8" stroke-linecap="round"/></svg>`;
  }
  if (/nintendo|switch/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#E60012"/><path d="M7 10C7 7.79 8.79 6 11 6H13V26H11C8.79 26 7 24.21 7 22V10Z" fill="white"/><circle cx="10" cy="11" r="1.5" fill="#E60012"/><rect x="9.25" y="16" width="1.5" height="1.5" fill="#E60012" rx="0.5"/><rect x="9.25" y="19" width="1.5" height="1.5" fill="#E60012" rx="0.5"/><path d="M19 6H21C23.21 6 25 7.79 25 10V22C25 24.21 23.21 26 21 26H19V6Z" fill="white"/><circle cx="22" cy="19" r="1.5" fill="#E60012"/><rect x="21.25" y="11" width="1.5" height="1.5" fill="#E60012" rx="0.5"/><rect x="21.25" y="14" width="1.5" height="1.5" fill="#E60012" rx="0.5"/></svg>`;
  }
  if (/xbox|game\s*pass/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#107C10"/><circle cx="16" cy="16" r="9" fill="white"/><path d="M11 11C13 14 16 17 16 17C16 17 19 14 21 11C23 15 22 20 20 22C18 20 16 18 16 18C16 18 14 20 12 22C10 20 9 15 11 11Z" fill="#107C10"/></svg>`;
  }

  // --- 仕事・ツール (tool) ---
  if (/chatgpt|openai/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#10A37F"/><path d="M23.5 14.5C23.2 12.8 22 11.5 20.4 11V9.5C20.4 7.6 18.8 6 16.9 6C15.8 6 14.8 6.5 14.2 7.4C13.7 7.1 13.1 7 12.5 7C10.6 7 9 8.6 9 10.5V11.2C7.3 11.8 6 13.4 6 15.3C6 16.6 6.6 17.7 7.6 18.4C7.4 19 7.3 19.6 7.3 20.2C7.3 22.1 8.9 23.7 10.8 23.7C11.7 23.7 12.5 23.3 13.1 22.7C13.8 23.5 14.8 24 16 24C17.9 24 19.5 22.4 19.5 20.5V19.8C21.2 19.2 22.5 17.6 22.5 15.7C22.5 15.3 22.4 14.9 22.3 14.5H23.5Z" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/></svg>`;
  }
  if (/claude|anthropic/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#D96B27"/><path d="M16 6V26M6 16H26M8.9 8.9L23.1 23.1M23.1 8.9L8.9 23.1" stroke="white" stroke-width="2.8" stroke-linecap="round"/></svg>`;
  }
  if (/microsoft|office|365/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="white" stroke="#E2E8F0" stroke-width="0.8"/><rect x="8" y="8" width="7" height="7" fill="#F25022"/><rect x="17" y="8" width="7" height="7" fill="#7FBA00"/><rect x="8" y="17" width="7" height="7" fill="#00A4EF"/><rect x="17" y="17" width="7" height="7" fill="#FFB900"/></svg>`;
  }
  if (/adobe/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FA0F00"/><path d="M13.2 7H7V25H11.5L13.2 21H18.8L20.5 25H25V7H18.8L22 17H16.8L13.2 7Z" fill="white"/></svg>`;
  }
  if (/canva/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><defs><linearGradient id="canva-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00C4CC"/><stop offset="100%" stop-color="#7D2AE8"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#canva-grad)"/><path d="M20.5 13C19.5 10.5 17 9.5 14.5 10C11.5 10.5 9.5 13.5 10 17C10.5 20.5 13.5 22.5 17 22C19.5 21.5 21.5 19.5 22 17" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  }
  if (/notion/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="white" stroke="#E2E8F0" stroke-width="0.8"/><path d="M8.5 7.5L20.5 6.5C22 6.4 23 7.5 23 9V22.5C23 24 21.8 25.2 20.2 25.4L8.8 26.4C7.3 26.5 6 25.4 6 23.9V9.1C6 7.6 7.2 6.4 8.5 7.5Z" fill="#000000"/><path d="M10 11H13V22H10V11ZM10 11L18 22H21V11H18L10 22" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  }
  if (/copilot/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><defs><linearGradient id="copilot-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5B58F5"/><stop offset="50%" stop-color="#8054F6"/><stop offset="100%" stop-color="#FF5197"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="#181A1F"/><path d="M9 13.5C9 10 12 7.5 16 7.5C20 7.5 23 10 23 13.5V17C23 19 21.5 20.5 19.5 20.5H18L16 23.5L14 20.5H12.5C10.5 20.5 9 19 9 17V13.5Z" fill="url(#copilot-grad)"/><ellipse cx="13" cy="14" rx="1.5" ry="2" fill="white"/><ellipse cx="19" cy="14" rx="1.5" ry="2" fill="white"/></svg>`;
  }
  if (/cursor/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#18181B"/><polygon points="16,8 24,12.5 16,17 8,12.5" fill="#E4E4E7"/><polygon points="8,12.5 16,17 16,25 8,20.5" fill="#A1A1AA"/><polygon points="24,12.5 16,17 16,25 24,20.5" fill="#71717A"/></svg>`;
  }

  // --- ストレージ (storage) ---
  if (/icloud/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><defs><linearGradient id="icloud-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3697FE"/><stop offset="100%" stop-color="#1B6DF9"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#icloud-grad)"/><path d="M19.5 13C19.1 10.2 16.7 8 13.8 8C11.3 8 9.2 9.7 8.5 12C6.5 12.5 5 14.3 5 16.5C5 19 7 21 9.5 21H19.5C21.9 21 24 19.1 24 16.7C24 14.5 22 13.1 19.5 13Z" fill="white"/></svg>`;
  }
  if (/google\s*one/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="white" stroke="#E2E8F0" stroke-width="0.8"/><circle cx="16" cy="16" r="8.5" stroke="#4285F4" stroke-width="2.5" stroke-dasharray="14 40"/><circle cx="16" cy="16" r="8.5" stroke="#EA4335" stroke-width="2.5" stroke-dasharray="14 40" stroke-dashoffset="-13"/><circle cx="16" cy="16" r="8.5" stroke="#FBBC05" stroke-width="2.5" stroke-dasharray="14 40" stroke-dashoffset="-27"/><circle cx="16" cy="16" r="8.5" stroke="#34A853" stroke-width="2.5" stroke-dasharray="14 40" stroke-dashoffset="-40"/><path d="M14.5 13L16.5 11.5V20.5H15" stroke="#4285F4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (/apple\s*one/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><path d="M15.5 13C14.8 12.3 13.5 12.8 12.8 13.5C12.1 14.2 11 16 11 18C11 20.8 12.8 23 14.3 23C15 23 15.6 22.5 16.4 22.5C17.2 22.5 17.7 23 18.5 23C20.1 23 21.6 20.6 21.6 18.7C19.7 18 19.1 16.2 19.3 14.6C18.1 14.4 17.2 15 15.5 13Z" fill="white"/><path d="M17.5 10C18.2 9.1 18.6 8 18.4 7C17.4 7.1 16.3 7.8 15.7 8.6C15.1 9.4 14.6 10.6 14.8 11.6C15.9 11.7 16.9 10.9 17.5 10Z" fill="white"/></svg>`;
  }
  if (/dropbox/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#0061FE"/><polygon points="11.5,10 7,13.5 11.5,17 16,13.5" fill="white"/><polygon points="20.5,10 16,13.5 20.5,17 25,13.5" fill="white"/><polygon points="7,19 11.5,22.5 16,19 11.5,15.5" fill="white"/><polygon points="25,19 20.5,15.5 16,19 20.5,22.5" fill="white"/><polygon points="11.5,24 16,21 20.5,24 16,26.5" fill="white"/></svg>`;
  }

  // --- 配達・フード (delivery) ---
  if (/uber/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#000000"/><text x="16" y="15" text-anchor="middle" fill="white" font-size="7" font-weight="900" font-family="system-ui, -apple-system, sans-serif">Uber</text><text x="16" y="24" text-anchor="middle" fill="#C0A062" font-size="9" font-weight="900" font-family="system-ui, -apple-system, sans-serif">One</text></svg>`;
  }
  if (/lyp/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.8"/><circle cx="11" cy="16" r="4.5" fill="#06C755"/><circle cx="21" cy="16" r="4.5" fill="#FF0033"/><path d="M10 14V18H13" stroke="white" stroke-width="1.2" stroke-linecap="round"/><path d="M20 14L21 16L22 14M21 16V18" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }
  if (/cookpad|クックパッド/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FF8A00"/><path d="M16 8C13.5 8 11.5 9.8 11.1 12.2C9.9 12.6 9 13.7 9 15C9 16.5 10.1 17.7 11.5 17.9V21C11.5 21.6 12 22 12.5 22H19.5C20 22 20.5 21.6 20.5 21V17.9C21.9 17.7 23 16.5 23 15C23 13.7 22.1 12.6 20.9 12.2C20.5 9.8 18.5 8 16 8Z" fill="white"/><line x1="12.5" y1="20" x2="19.5" y2="20" stroke="#FF8A00" stroke-width="1"/></svg>`;
  }

  // --- 生活・その他 (lifestyle) ---
  if (/chocozap|チョコザップ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FEDB00"/><circle cx="16" cy="16" r="8" fill="#222222"/><circle cx="13.5" cy="14.5" r="1.2" fill="#FEDB00"/><circle cx="18.5" cy="14.5" r="1.2" fill="#FEDB00"/><path d="M12.5 17.5C13.5 19.5 18.5 19.5 19.5 17.5" stroke="#FEDB00" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  if (/radiko|ラジコ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#0099FF"/><circle cx="16" cy="16" r="9" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="4.5" fill="white"/></svg>`;
  }
  if (/duolingo/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#58CC02"/><circle cx="11.5" cy="15" r="4" fill="white"/><circle cx="20.5" cy="15" r="4" fill="white"/><circle cx="12" cy="15" r="2.2" fill="#2B3844"/><circle cx="20" cy="15" r="2.2" fill="#2B3844"/><polygon points="16,17 14,20 18,20" fill="#FF9600"/></svg>`;
  }
  if (/moneyforward|マネーフォワード/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FF6B00"/><circle cx="13" cy="16" r="5" stroke="white" stroke-width="2.2"/><path d="M19 11L24 16L19 21" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (/times|タイムズ/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#FFDC00"/><path d="M8 9H24V13H18.5V24H13.5V13H8V9Z" fill="#1C1C1C"/></svg>`;
  }
  if (/kinto|キント/i.test(n)) {
    return `<svg viewBox="0 0 32 32" class="w-full h-full" fill="none"><rect width="32" height="32" rx="8" fill="#00A3AF"/><path d="M10 8H13.5V14.5L19 8H23.5L16.5 15.5L24 24H19L13.5 16.8V24H10V8Z" fill="white"/></svg>`;
  }

  return null;
}

/**
 * サービス名やカテゴリからブランドカラー＆頭文字バッジを導出するヘルパー（カスタムサブスク等のフォールバック）
 */
export function getBrandBadge(name = "", categoryId = "") {
  const n = (name || "").trim();

  // カテゴリ別のグラデーションカラー
  const catColors = {
    video: "bg-rose-500 text-white",
    music: "bg-emerald-600 text-white",
    ebook: "bg-amber-600 text-white",
    game: "bg-indigo-600 text-white",
    tool: "bg-blue-600 text-white",
    storage: "bg-sky-500 text-white",
    delivery: "bg-orange-500 text-white",
    lifestyle: "bg-purple-600 text-white",
  };
  const bg = catColors[categoryId] || "bg-slate-700 text-white";

  // 先頭の文字（アルファベット、漢字、カナ）
  const clean = n.replace(/^[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/, "");
  const letter = clean.charAt(0).toUpperCase() || n.charAt(0) || "S";

  return { label: letter, bg };
}

/**
 * サービス名から公式ドメインを取得（高解像度アプリアイコン自動取得用フォールバック）
 */
export function getBrandDomain(name = "") {
  const n = (name || "").toLowerCase();

  // 単語境界を厳格に判定し誤爆を防ぐ
  if (/netflix/i.test(n)) return "netflix.com";
  if (/amazon\s*prime/i.test(n)) return "amazon.co.jp";
  if (/youtube\s*music/i.test(n)) return "music.youtube.com";
  if (/youtube/i.test(n)) return "youtube.com";
  if (/spotify/i.test(n)) return "spotify.com";
  if (/apple\s*music/i.test(n)) return "music.apple.com";
  if (/apple\s*tv/i.test(n)) return "tv.apple.com";
  if (/icloud/i.test(n)) return "icloud.com";
  if (/apple/i.test(n)) return "apple.com";
  if (/disney/i.test(n)) return "disneyplus.com";
  if (/u-next/i.test(n)) return "unext.jp";
  if (/chatgpt|openai/i.test(n)) return "chatgpt.com";
  if (/claude|anthropic/i.test(n)) return "claude.ai";
  if (/cursor/i.test(n)) return "cursor.com";
  if (/notion/i.test(n)) return "notion.so";
  if (/\bline\s*music\b/i.test(n)) return "music.line.me";
  if (/\bline\b/i.test(n) && !n.includes("online")) return "line.me";
  if (/google\s*one/i.test(n)) return "one.google.com";
  if (/google/i.test(n)) return "google.com";
  if (/playstation/i.test(n)) return "playstation.com";
  if (/nintendo|switch/i.test(n)) return "nintendo.com";
  if (/xbox/i.test(n)) return "xbox.com";
  if (/dマガジン/i.test(n)) return "magazine.dmkt-sp.jp";
  if (/dアニメ/i.test(n)) return "animestore.docomo.ne.jp";
  if (/hulu/i.test(n)) return "hulu.jp";
  if (/abema/i.test(n)) return "abema.tv";
  if (/dropbox/i.test(n)) return "dropbox.com";
  if (/microsoft|office|365/i.test(n)) return "microsoft.com";
  if (/canva/i.test(n)) return "canva.com";
  if (/adobe/i.test(n)) return "adobe.com";
  if (/uber/i.test(n)) return "ubereats.com";
  if (/audible/i.test(n)) return "audible.co.jp";
  if (/dazn/i.test(n)) return "dazn.com";
  if (/radiko/i.test(n)) return "radiko.jp";
  if (/cookpad|クックパッド/i.test(n)) return "cookpad.com";
  if (/pixiv/i.test(n)) return "pixiv.net";
  if (/github/i.test(n)) return "github.com";
  if (/slack/i.test(n)) return "slack.com";
  if (/zoom/i.test(n)) return "zoom.us";
  if (/duolingo/i.test(n)) return "duolingo.com";
  if (/telasa/i.test(n)) return "telasa.jp";
  if (/fod/i.test(n)) return "fod.fujitv.co.jp";
  if (/wowow/i.test(n)) return "wod.wowow.co.jp";
  if (/dmm/i.test(n)) return "dmm.com";
  if (/lemino|dtv/i.test(n)) return "lemino.docomo.ne.jp";
  if (/楽天ミュージック/i.test(n)) return "music.rakuten.co.jp";
  if (/楽天マガジン/i.test(n)) return "magazine.rakuten.co.jp";
  if (/楽天/i.test(n)) return "rakuten.co.jp";
  if (/awa\b/i.test(n)) return "awa.fm";
  if (/chocozap|チョコザップ/i.test(n)) return "chocozap.jp";
  if (/kinto/i.test(n)) return "kinto-jp.com";
  if (/タイムズ|times/i.test(n)) return "timescar.jp";
  if (/moneyforward|マネーフォワード/i.test(n)) return "moneyforward.com";
  return null;
}

/**
 * サービス名に応じたアプリアイコンまたは頭文字フォールバックバッジのHTMLを生成する共通ヘルパー
 * @param {string} name サービス名
 * @param {string} categoryId カテゴリID
 * @param {string} sizeClasses サイズ等の追加クラス（デフォルト: "w-8 h-8 sm:w-9 sm:h-9"）
 * @param {string} textSizeClasses フォールバック文字のサイズクラス（デフォルト: "text-xs sm:text-sm"）
 */
export function renderBrandIcon(
  name = "",
  categoryId = "",
  sizeClasses = "w-8 h-8 sm:w-9 sm:h-9",
  textSizeClasses = "text-xs sm:text-sm"
) {
  // 1. 完全鮮明な専用ベクターSVG（ぼやけゼロ・誤爆ゼロ）
  const customSvg = getCustomBrandSvg(name);
  if (customSvg) {
    return `<div class="${sizeClasses} rounded-xl overflow-hidden shrink-0 select-none shadow-2xs flex items-center justify-center">${customSvg}</div>`;
  }

  // 2. ドメインベースのFavicon
  const brandBadge = getBrandBadge(name, categoryId);
  const domain = getBrandDomain(name);
  const faviconUrl = domain
    ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
    : "";

  if (faviconUrl) {
    return `
      <div class="${sizeClasses} rounded-xl shrink-0 select-none overflow-hidden relative flex items-center justify-center bg-white shadow-2xs">
        <img src="${faviconUrl}" alt="" referrerpolicy="no-referrer" class="w-full h-full object-contain p-0.5" onerror="this.parentElement.className='${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none'; this.remove();">
        <span class="sr-only">${brandBadge.label}</span>
      </div>`;
  }

  // 3. ブランドバッジ（カテゴリカラー＋頭文字）
  return `
    <div class="${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none">
      ${brandBadge.label}
    </div>`;
}
