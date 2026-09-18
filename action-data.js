// action-data.js
// 解約サポート公式リンク集 & お得な代替案プロモーションデータ & 開発用モックデータ

/**
 * 主要サブスクリプションの公式解約・プラン管理ページURL一覧
 * 後からサービスの追加・URLの差し替えが容易に行えるよう一元管理しています。
 */
export const CANCEL_URLS = [
  {
    keywords: ["netflix", "ネットフリックス"],
    name: "Netflix",
    url: "https://www.netflix.com/youraccount",
    guide: "ログイン後、「アカウント」＞「メンバーシップのキャンセル」",
    category: "動画",
  },
  {
    keywords: ["amazon prime", "プライム", "アマゾンプライム", "prime video"],
    name: "Amazonプライム",
    url: "https://www.amazon.co.jp/mc/manage",
    guide: "「アカウントサービス」＞「プライム会員情報」＞「会員資格を終了する」",
    category: "EC・動画",
  },
  {
    keywords: ["spotify", "スポティファイ"],
    name: "Spotify",
    url: "https://www.spotify.com/account/overview/",
    guide: "アカウント情報ページ＞「プランを変更」＞最下部「Spotify Freeにキャンセル」",
    category: "音楽",
  },
  {
    keywords: ["youtube premium", "ユーチューブ", "youtube"],
    name: "YouTube Premium",
    url: "https://www.youtube.com/paid_memberships",
    guide: "「購入内容とメンバーシップ」＞「メンバーシップの管理」＞「無効にする」",
    category: "動画・音楽",
  },
  {
    keywords: ["apple", "icloud", "アップル", "apple one", "apple music"],
    name: "Apple / iCloud+ / Apple One",
    url: "https://support.apple.com/ja-jp/HT202039",
    guide: "iPhoneの「設定」＞「自分の名前」＞「サブスクリプション」より解約",
    category: "クラウド・総合",
  },
  {
    keywords: ["disney", "ディズニープラス", "ディズニー"],
    name: "Disney+",
    url: "https://www.disneyplus.com/account",
    guide: "「アカウント」＞「サブスクリプション」＞「Disney+を解約」",
    category: "動画",
  },
  {
    keywords: ["hulu", "フールー"],
    name: "Hulu",
    url: "https://www.hulu.jp/account",
    guide: "「アカウント」＞「サービスのご利用状況」＞「解約する」",
    category: "動画",
  },
  {
    keywords: ["u-next", "ユーネクスト", "unext"],
    name: "U-NEXT",
    url: "https://account.unext.jp/account",
    guide: "「アカウント・契約」＞「契約内容の確認・解約」＞「解約手続きはこちら」",
    category: "動画・書籍",
  },
  {
    keywords: ["dアニメ", "dアニメストア"],
    name: "dアニメストア",
    url: "https://animestore.docomo.ne.jp/animestore/CF/cancel_top",
    guide: "解約手続きページよりdアカウントでログインして解約",
    category: "アニメ",
  },
  {
    keywords: ["dazn", "ダゾーン"],
    name: "DAZN",
    url: "https://www.dazn.com/ja-JP/myaccount/subscription",
    guide: "「マイ・アカウント」＞「ご契約内容」＞「退会する」",
    category: "スポーツ",
  },
  {
    keywords: ["chatgpt", "openai"],
    name: "ChatGPT Plus",
    url: "https://chatgpt.com/#settings",
    guide: "画面左下のアカウント＞「設定」＞「サブスクリプション」＞「管理」",
    category: "AI",
  },
  {
    keywords: ["adobe", "アドビ", "creative cloud"],
    name: "Adobe Creative Cloud",
    url: "https://account.adobe.com/plans",
    guide: "「プランを管理」＞「プランを解約」",
    category: "クリエイティブ",
  },
];

/**
 * サービス名から公式解約リンク情報を検索する関数
 * マッチしない場合はGoogle検索の公式解約クエリを安全に返します。
 */
export function findCancelInfo(serviceName) {
  if (!serviceName) return null;
  const lower = serviceName.toLowerCase().trim();

  for (const item of CANCEL_URLS) {
    if (
      item.keywords.some((kw) => lower.includes(kw.toLowerCase())) ||
      lower.includes(item.name.toLowerCase())
    ) {
      return {
        ...item,
        isDirect: true,
      };
    }
  }

  // マッチしないサービスのフォールバック（Google検索公式導線）
  return {
    name: serviceName,
    url: `https://www.google.com/search?q=${encodeURIComponent(serviceName + " 解約 公式 手順")}`,
    guide: "公式の解約手続き案内ページをGoogleで検索して確認します",
    isDirect: false,
  };
}

/**
 * お得な最適化プラン / 代替案プロモーションデータ
 * 後からアフィリエイトリンク（ASPリンク）や掲載内容を1行で差し替え可能です。
 */
export const PROMO_CARDS = [
  {
    id: "amazon-prime",
    badge: "王道まとめ割",
    isPR: true,
    title: "Amazonプライムで動画・音楽・配送特典を1本化",
    savingHighlight: "動画・音楽の個別契約より年間約14,000円お得",
    description:
      "月額600円（年払いなら5,900円/年）で、動画（Prime Video）・音楽（Prime Music）・お急ぎ便無料がすべて込み。複数のサブスクを1つに集約する最強の固定費削減プランです。",
    buttonText: "30日間の無料体験を試す ↗",
    url: "https://www.amazon.co.jp/prime", // ※ASPアフィリエイトリンクに差し替え可能
    theme: {
      border: "border-blue-300",
      bgGradient: "from-blue-50/90 via-indigo-50/50 to-white",
      badgeBg: "bg-blue-600 text-white",
      highlightColor: "text-blue-700",
      buttonBg: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20",
    },
  },
  {
    id: "unext-point",
    badge: "マンガ・映画集約",
    isPR: true,
    title: "U-NEXTで動画＋雑誌＋毎月1,200pt還元をフル活用",
    savingHighlight: "実質月額約989円で動画と電子書籍をまとめ見",
    description:
      "見放題作品数No.1に加え、毎月付与される1,200円分のポイントで最新映画のレンタルやマンガ購入が可能。電子書籍と動画を別々に課金している方におすすめです。",
    buttonText: "31日間無料トライアルはこちら ↗",
    url: "https://video.unext.jp/", // ※ASPアフィリエイトリンクに差し替え可能
    theme: {
      border: "border-slate-300",
      bgGradient: "from-slate-50/90 via-sky-50/50 to-white",
      badgeBg: "bg-slate-800 text-white",
      highlightColor: "text-slate-800",
      buttonBg: "bg-gradient-to-r from-slate-800 to-slate-900 hover:from-black hover:to-slate-800 text-white shadow-slate-900/20",
    },
  },
  {
    id: "rakuten-mobile",
    badge: "通信費＋サブスク",
    isPR: true,
    title: "楽天モバイルでスマホ代圧縮 ＆ エンタメ無料付帯",
    savingHighlight: "大手キャリアから乗り換えで月約4,000円節約",
    description:
      "データ無制限で月額3,278円。さらにRakuten TVのパ・リーグ＆NBA見放題やYouTube Premiumの初回3ヶ月無料特典など、エンタメサブスク特典も充実しています。",
    buttonText: "料金シミュレーションを見る ↗",
    url: "https://network.mobile.rakuten.co.jp/", // ※ASPアフィリエイトリンクに差し替え可能
    theme: {
      border: "border-rose-300",
      bgGradient: "from-rose-50/90 via-pink-50/50 to-white",
      badgeBg: "bg-rose-600 text-white",
      highlightColor: "text-rose-700",
      buttonBg: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-rose-500/20",
    },
  },
];

/**
 * 開発用モックデータ（UI確認時にGemini APIのクォータを一切消費しないためのダミー）
 */
export const MOCK_DIAGNOSIS_DATA = {
  profile_type: "エンタメ・ショッピング充実型",
  summary:
    "動画配信や音楽配信を中心に複数のサブスクをご利用中です。一部のサービスでコンテンツや機能の重複が見られ、年払いへの切り替えや契約の見直しを行うことで、年間15,000円以上の固定費削減が期待できます。",
  priority_action: {
    title: "Amazonプライムの月払いから年払いへの切り替え",
    annual_saving: 1300,
    reason:
      "月額600円（年間7,200円）から年払い（5,900円/年）に切り替えるだけで、サービス内容は一切変えずに年間1,300円を確実に即座に節約できます。",
  },
  duplicate_warnings: [
    "NetflixとAmazon Prime Videoで動画配信のジャンルが重複しています。見たい作品がある時期だけ交互に契約するローテーション契約を検討すると年間約1万円の節約になります。",
    "音楽配信サービスと動画サービスの付帯音楽特典（Prime Music等）の重複利用がないかご確認ください。",
  ],
  plan_optimizations: [
    "Amazonプライムを年払いに変更（年間1,300円削減）",
    "動画配信を単月契約のローテーション運用に切り替え（年間約8,000〜14,000円削減）",
    "ご家族で利用中のサービスがあればファミリープランへの集約を検討",
  ],
  investment_impact:
    "見直しによって浮いた年間約15,000円（月額1,250円）を新NISAの全世界株式等に年利5%で20年間積立投資した場合、元本30万円に対して運用益が約21万円加わり、将来約51万円の資産形成につながります。",
};

