// brand-icons.js（公式アプリアイコン解決＆ブランドバッジ導出モジュール）

/**
 * サービス名やカテゴリからブランドカラー＆頭文字バッジを導出するヘルパー
 */
export function getBrandBadge(name = "", categoryId = "") {
  const n = (name || "").trim();

  // 有名ブランドの固有カラー
  if (/netflix/i.test(n)) return { label: "N", bg: "bg-red-600 text-white" };
  if (/amazon|prime/i.test(n)) return { label: "A", bg: "bg-amber-500 text-white" };
  if (/youtube/i.test(n)) return { label: "Y", bg: "bg-red-500 text-white" };
  if (/spotify/i.test(n)) return { label: "S", bg: "bg-emerald-500 text-white" };
  if (/apple|icloud/i.test(n)) return { label: "A", bg: "bg-slate-950 text-white" };
  if (/disney/i.test(n)) return { label: "D", bg: "bg-blue-700 text-white" };
  if (/u-next/i.test(n)) return { label: "U", bg: "bg-slate-900 text-white" };
  if (/chatgpt|openai/i.test(n)) return { label: "G", bg: "bg-teal-600 text-white" };
  if (/claude|anthropic/i.test(n)) return { label: "C", bg: "bg-amber-700 text-white" };
  if (/notion/i.test(n)) return { label: "N", bg: "bg-slate-900 text-white" };
  if (/line/i.test(n)) return { label: "L", bg: "bg-emerald-500 text-white" };
  if (/google|drive|gemini/i.test(n)) return { label: "G", bg: "bg-blue-600 text-white" };
  if (/playstation|ps\b/i.test(n)) return { label: "P", bg: "bg-blue-700 text-white" };
  if (/nintendo/i.test(n)) return { label: "N", bg: "bg-red-600 text-white" };
  if (/dアニメ/i.test(n)) return { label: "d", bg: "bg-orange-500 text-white" };
  if (/dラボ/i.test(n)) return { label: "D", bg: "bg-indigo-600 text-white" };
  if (/hulu/i.test(n)) return { label: "h", bg: "bg-emerald-600 text-white" };
  if (/abema/i.test(n)) return { label: "A", bg: "bg-emerald-700 text-white" };
  if (/dropbox/i.test(n)) return { label: "D", bg: "bg-blue-500 text-white" };
  if (/microsoft|office|365/i.test(n)) return { label: "M", bg: "bg-red-600 text-white" };
  if (/canva/i.test(n)) return { label: "C", bg: "bg-cyan-600 text-white" };
  if (/adobe/i.test(n)) return { label: "A", bg: "bg-red-600 text-white" };
  if (/uber/i.test(n)) return { label: "U", bg: "bg-slate-950 text-white" };
  if (/kindle/i.test(n)) return { label: "K", bg: "bg-amber-600 text-white" };
  if (/dazn/i.test(n)) return { label: "D", bg: "bg-slate-900 text-yellow-300" };
  if (/audible/i.test(n)) return { label: "A", bg: "bg-amber-500 text-white" };
  if (/dマガジン/i.test(n)) return { label: "d", bg: "bg-red-600 text-white" };
  if (/wowow/i.test(n)) return { label: "W", bg: "bg-blue-600 text-white" };
  if (/楽天/i.test(n)) return { label: "R", bg: "bg-red-600 text-white" };
  if (/chocozap|チョコザップ/i.test(n)) return { label: "C", bg: "bg-yellow-500 text-white" };
  if (/game\s*pass|xbox/i.test(n)) return { label: "X", bg: "bg-emerald-600 text-white" };
  if (/kinto/i.test(n)) return { label: "K", bg: "bg-teal-600 text-white" };
  if (/タイムズ|times/i.test(n)) return { label: "T", bg: "bg-yellow-500 text-slate-900" };

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
  const letter = clean.charAt(0).toUpperCase() || n.charAt(0) || "★";

  return { label: letter, bg };
}

/**
 * サービス名から公式ドメインを取得（高解像度アプリアイコン自動取得用）
 */
export function getBrandDomain(name = "") {
  const n = (name || "").toLowerCase();
  if (/netflix/i.test(n)) return "netflix.com";
  if (/amazon|prime/i.test(n)) return "amazon.co.jp";
  if (/youtube/i.test(n)) return "youtube.com";
  if (/spotify/i.test(n)) return "spotify.com";
  if (/apple|icloud/i.test(n)) return "apple.com";
  if (/disney/i.test(n)) return "disneyplus.com";
  if (/u-next/i.test(n)) return "unext.jp";
  if (/chatgpt|openai/i.test(n)) return "openai.com";
  if (/claude|anthropic/i.test(n)) return "anthropic.com";
  if (/cursor/i.test(n)) return "cursor.com";
  if (/notion/i.test(n)) return "notion.so";
  if (/line/i.test(n)) return "line.me";
  if (/google|drive|gemini/i.test(n)) return "google.com";
  if (/playstation|ps\b/i.test(n)) return "playstation.com";
  if (/nintendo|switch/i.test(n)) return "nintendo.com";
  if (/xbox/i.test(n)) return "xbox.com";
  if (/ea play/i.test(n)) return "ea.com";
  if (/ubisoft/i.test(n)) return "ubisoft.com";
  if (/geforce/i.test(n)) return "nvidia.com";
  if (/dマガジン/i.test(n)) return "magazine.dmkt-sp.jp";
  if (/dアニメ/i.test(n)) return "animestore.docomo.ne.jp";
  if (/dラボ/i.test(n)) return "daigo.jp";
  if (/hulu/i.test(n)) return "hulu.jp";
  if (/abema/i.test(n)) return "abema.tv";
  if (/dropbox/i.test(n)) return "dropbox.com";
  if (/microsoft|office|365/i.test(n)) return "microsoft.com";
  if (/canva/i.test(n)) return "canva.com";
  if (/adobe/i.test(n)) return "adobe.com";
  if (/uber/i.test(n)) return "ubereats.com";
  if (/出前館/i.test(n)) return "demae-can.com";
  if (/kindle|audible/i.test(n)) return "amazon.co.jp";
  if (/dazn/i.test(n)) return "dazn.com";
  if (/radiko/i.test(n)) return "radiko.jp";
  if (/cookpad/i.test(n)) return "cookpad.com";
  if (/pixiv/i.test(n)) return "pixiv.net";
  if (/github/i.test(n)) return "github.com";
  if (/slack/i.test(n)) return "slack.com";
  if (/zoom/i.test(n)) return "zoom.us";
  if (/duolingo/i.test(n)) return "duolingo.com";
  if (/pokekara/i.test(n)) return "pokekara.com";
  if (/telasa/i.test(n)) return "telasa.jp";
  if (/fod/i.test(n)) return "fod.fujitv.co.jp";
  if (/wowow/i.test(n)) return "wod.wowow.co.jp";
  if (/dmm/i.test(n)) return "dmm.com";
  if (/lemino|dtv/i.test(n)) return "lemino.docomo.ne.jp";
  if (/paravi/i.test(n)) return "paravi.jp";
  if (/楽天/i.test(n)) return "rakuten.co.jp";
  if (/ジャンプ/i.test(n)) return "shonenjumpplus.com";
  if (/マガポケ/i.test(n)) return "pocket.shonenmagazine.com";
  if (/book.*walker/i.test(n)) return "bookwalker.jp";
  if (/ブック放題/i.test(n)) return "bookhodai.jp";
  if (/ameba/i.test(n)) return "ameba.jp";
  if (/awa\b/i.test(n)) return "awa.fm";
  if (/kkbox/i.test(n)) return "kkbox.com";
  if (/game\s*pass/i.test(n)) return "xbox.com";
  if (/terabox/i.test(n)) return "terabox.com";
  if (/pcloud/i.test(n)) return "pcloud.com";
  if (/chocozap|チョコザップ/i.test(n)) return "chocozap.jp";
  if (/anytime/i.test(n)) return "anytimefitness.co.jp";
  if (/kinto/i.test(n)) return "kinto-jp.com";
  if (/タイムズ|times/i.test(n)) return "timescar.jp";
  if (/bloomee|ブルーミー/i.test(n)) return "bloomeelife.com";
  if (/postcoffee/i.test(n)) return "postcoffee.co";
  if (/goopass/i.test(n)) return "goopass.jp";
  if (/oisix|オイシックス/i.test(n)) return "oisix.com";
  if (/メチャカリ/i.test(n)) return "mechakari.com";
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
  const brandBadge = getBrandBadge(name, categoryId);
  const domain = getBrandDomain(name);
  const faviconUrl = domain
    ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
    : "";

  if (faviconUrl) {
    return `
      <div class="${sizeClasses} rounded-xl shrink-0 select-none overflow-hidden relative flex items-center justify-center">
        <img src="${faviconUrl}" alt="" referrerpolicy="no-referrer" class="w-full h-full object-contain p-0.5" onerror="this.parentElement.className='${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none'; this.remove();">
        <span class="sr-only">${brandBadge.label}</span>
      </div>`;
  }

  return `
    <div class="${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none">
      ${brandBadge.label}
    </div>`;
}
