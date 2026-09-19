// brand-icons.js（公式アプリアイコン解決＆ブランドバッジ導出モジュール）

/**
 * サービス名に応じた本物の公式ロゴ画像（512px高解像度PNG / 公式ベクターSVG）のパスを取得
 * 似せた自作アイコンではなく、各サービス公式の正真正銘のロゴアセットを返します。
 * @param {string} name サービス名
 * @returns {string|null} ローカルアセットの相対パス
 */
export function getOfficialLogoPath(name = "") {
  const n = (name || "").toLowerCase().trim();

  // --- 動画配信 (video) ---
  if (/netflix/i.test(n)) return "assets/logos/netflix.png";
  if (/amazon\s*prime/i.test(n) || (n.includes("prime") && !n.includes("music"))) return "assets/logos/amazon-prime.png";
  if (/youtube\s*premium/i.test(n) || (/youtube/i.test(n) && !n.includes("music"))) return "assets/logos/youtube-premium.png";
  if (/disney/i.test(n)) return "assets/logos/disney-plus.png";
  if (/u-next|ユーネクスト/i.test(n)) return "assets/logos/unext.png";
  if (/hulu|フールー/i.test(n)) return "assets/logos/hulu.png";
  if (/abema|アベマ/i.test(n)) return "assets/logos/abema.png";
  if (/dmm\s*tv/i.test(n)) return "assets/logos/dmm-tv.png";
  if (/dアニメ/i.test(n)) return "assets/logos/d-anime.png";
  if (/dazn|ダゾーン/i.test(n)) return "assets/logos/dazn.png";
  if (/fod/i.test(n)) return "assets/logos/fod.png";
  if (/wowow/i.test(n)) return "assets/logos/wowow.png";
  if (/lemino|レミノ/i.test(n)) return "assets/logos/lemino.png";
  if (/apple\s*tv/i.test(n)) return "assets/logos/apple-tv-plus.png";
  if (/telasa|テラサ/i.test(n)) return "assets/logos/telasa.png";

  // --- 音楽 (music) ---
  if (/spotify/i.test(n)) return "assets/logos/spotify.png";
  if (/apple\s*music/i.test(n)) return "assets/logos/apple-music.png";
  if (/amazon\s*music/i.test(n)) return "assets/logos/amazon-music.png";
  if (/youtube\s*music/i.test(n)) return "assets/logos/youtube-music.png";
  if (/line\s*music/i.test(n)) return "assets/logos/line-music.png";
  if (/awa\b/i.test(n)) return "assets/logos/awa.png";
  if (/楽天ミュージック/i.test(n)) return "assets/logos/rakuten-music.png";

  // --- 電子書籍 (ebook) ---
  if (/kindle/i.test(n)) return "assets/logos/kindle-unlimited.png";
  if (/audible|オーディブル/i.test(n)) return "assets/logos/audible.png";
  if (/dマガジン/i.test(n)) return "assets/logos/d-magazine.png";
  if (/楽天マガジン/i.test(n)) return "assets/logos/rakuten-magazine.png";
  if (/シーモア|cmoa/i.test(n)) return "assets/logos/cmoa.png";

  // --- ゲーム (game) ---
  if (/playstation|ps\s*plus/i.test(n)) return "assets/logos/ps-plus.png";
  if (/nintendo|switch/i.test(n)) return "assets/logos/nintendo-switch-online.png";
  if (/xbox/i.test(n)) return "assets/logos/xbox-game-pass.png";

  // --- 仕事・ツール (tool) ---
  if (/chatgpt|openai/i.test(n)) return "assets/logos/chatgpt-plus.png";
  if (/claude|anthropic/i.test(n)) return "assets/logos/claude-pro.png";
  if (/microsoft\s*365|office\s*365/i.test(n)) return "assets/logos/microsoft-365.svg";
  if (/adobe|creative\s*cloud/i.test(n)) return "assets/logos/adobe-cc.svg";
  if (/canva/i.test(n)) return "assets/logos/canva-pro.png";
  if (/notion/i.test(n)) return "assets/logos/notion-plus.png";
  if (/copilot/i.test(n)) return "assets/logos/github-copilot.svg";
  if (/cursor/i.test(n)) return "assets/logos/cursor-pro.png";

  // --- ストレージ (storage) ---
  if (/icloud/i.test(n)) return "assets/logos/icloud-plus.svg";
  if (/google\s*one/i.test(n)) return "assets/logos/google-one.png";
  if (/apple\s*one/i.test(n)) return "assets/logos/apple-one.svg";
  if (/dropbox/i.test(n)) return "assets/logos/dropbox-plus.png";

  // --- 配達・フード (delivery) ---
  if (/uber/i.test(n)) return "assets/logos/uber-one.png";
  if (/lyp|line\s*ヤフー|yahoo.*プレミアム/i.test(n)) return "assets/logos/lyp-premium.png";
  if (/cookpad|クックパッド/i.test(n)) return "assets/logos/cookpad.png";

  // --- 生活・その他 (lifestyle) ---
  if (/chocozap|チョコザップ/i.test(n)) return "assets/logos/chocozap.png";
  if (/radiko|ラジコ/i.test(n)) return "assets/logos/radiko-premium.png";
  if (/duolingo/i.test(n)) return "assets/logos/duolingo-super.png";
  if (/moneyforward|マネーフォワード/i.test(n)) return "assets/logos/moneyforward-me.png";
  if (/タイムズ|times/i.test(n)) return "assets/logos/times-car.png";
  if (/kinto/i.test(n)) return "assets/logos/kinto.png";

  return null;
}

/**
 * サービス名に応じたブランドバッジ情報（背景色・文字色・表示文字）を返す（フォールバック用）
 */
export function getBrandBadge(name = "", categoryId = "") {
  const n = (name || "").toLowerCase().trim();

  // ブランド固有カラー定義（フォールバック用）
  if (/netflix/i.test(n)) return { bg: "bg-black text-red-600", label: "N" };
  if (/amazon|prime/i.test(n)) return { bg: "bg-[#232F3E] text-[#FF9900]", label: "a" };
  if (/youtube/i.test(n)) return { bg: "bg-[#FF0000] text-white", label: "YT" };
  if (/spotify/i.test(n)) return { bg: "bg-[#1ED760] text-black", label: "Sp" };
  if (/apple/i.test(n)) return { bg: "bg-black text-white", label: "A" };
  if (/google/i.test(n)) return { bg: "bg-white text-blue-600 border border-slate-200", label: "G" };
  if (/disney/i.test(n)) return { bg: "bg-[#113CCF] text-white", label: "D+" };
  if (/u-next|ユーネクスト/i.test(n)) return { bg: "bg-black text-cyan-400", label: "U" };
  if (/hulu/i.test(n)) return { bg: "bg-[#1CE783] text-black", label: "hulu" };
  if (/nintendo|switch/i.test(n)) return { bg: "bg-[#E60012] text-white", label: "N" };
  if (/playstation|ps\b/i.test(n)) return { bg: "bg-[#003791] text-white", label: "PS" };
  if (/chatgpt|openai/i.test(n)) return { bg: "bg-[#10A37F] text-white", label: "AI" };
  if (/notion/i.test(n)) return { bg: "bg-black text-white", label: "N" };

  // カテゴリ別のデフォルト配色
  const categoryThemes = {
    video: { bg: "bg-rose-100 text-rose-700" },
    music: { bg: "bg-emerald-100 text-emerald-700" },
    ebook: { bg: "bg-amber-100 text-amber-700" },
    game: { bg: "bg-purple-100 text-purple-700" },
    tool: { bg: "bg-blue-100 text-blue-700" },
    storage: { bg: "bg-cyan-100 text-cyan-700" },
    delivery: { bg: "bg-orange-100 text-orange-700" },
    lifestyle: { bg: "bg-indigo-100 text-indigo-700" },
  };

  const theme = categoryThemes[categoryId] || { bg: "bg-slate-100 text-slate-700" };
  const firstChar = (name || "?").trim().charAt(0).toUpperCase();

  return {
    bg: theme.bg,
    label: firstChar,
  };
}

/**
 * サービス名から公式ドメインを推測（カスタム追加サブスク等のFavicon用）
 */
export function getBrandDomain(name = "") {
  const n = (name || "").toLowerCase().trim();

  if (/netflix/i.test(n)) return "netflix.com";
  if (/amazon/i.test(n)) return "amazon.co.jp";
  if (/youtube/i.test(n)) return "youtube.com";
  if (/spotify/i.test(n)) return "spotify.com";
  if (/apple/i.test(n)) return "apple.com";
  if (/google/i.test(n)) return "google.com";
  if (/disney/i.test(n)) return "disneyplus.com";
  if (/u-next|ユーネクスト/i.test(n)) return "unext.jp";
  if (/hulu/i.test(n)) return "hulu.jp";
  if (/(?:^|\s)line(?:\s|$)/i.test(n) && !n.includes("online")) return "line.me";
  if (/playstation/i.test(n)) return "playstation.com";
  if (/nintendo|switch/i.test(n)) return "nintendo.com";
  if (/xbox/i.test(n)) return "xbox.com";
  if (/chatgpt|openai/i.test(n)) return "openai.com";
  if (/notion/i.test(n)) return "notion.so";
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
 * サービス名に応じた公式アプリアイコンまたは頭文字フォールバックバッジのHTMLを生成する共通ヘルパー
 * 1. 実際に各サービスが配信している公式アプリアイコン（512px高解像度）または公式SVGロゴを最優先で表示
 * 2. 存在しないカスタム登録サブスクはFaviconまたはフォールバックバッジを表示
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

  // 1. 各サービスの「本物の公式ロゴ」（高解像度PNG / 公式ベクターSVG）
  const officialLogoPath = getOfficialLogoPath(name);
  if (officialLogoPath) {
    const isSvg = officialLogoPath.endsWith(".svg");
    const imgClasses = isSvg
      ? "w-full h-full object-contain p-1"
      : "w-full h-full object-cover";

    return `
      <div class="${sizeClasses} rounded-xl overflow-hidden shrink-0 select-none shadow-2xs flex items-center justify-center bg-white">
        <img src="${officialLogoPath}" alt="" class="${imgClasses}" loading="lazy" decoding="async" onerror="this.parentElement.className='${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none'; this.remove();" />
      </div>`;
  }

  // 2. ドメインベースのFavicon（独自カスタムサブスク用）
  const domain = getBrandDomain(name);
  const faviconUrl = domain
    ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
    : "";

  if (faviconUrl) {
    return `
      <div class="${sizeClasses} rounded-xl shrink-0 select-none overflow-hidden relative flex items-center justify-center bg-white shadow-2xs">
        <img src="${faviconUrl}" alt="" referrerpolicy="no-referrer" class="w-full h-full object-contain p-0.5" onerror="this.parentElement.className='${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none'; this.remove();" />
        <span class="sr-only">${brandBadge.label}</span>
      </div>`;
  }

  // 3. ブランドバッジ（カテゴリカラー＋頭文字）
  return `
    <div class="${sizeClasses} rounded-xl ${brandBadge.bg} flex items-center justify-center font-black ${textSizeClasses} shadow-2xs shrink-0 select-none">
      ${brandBadge.label}
    </div>`;
}
