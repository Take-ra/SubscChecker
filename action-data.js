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
    title: "Amazonプライム",
    subTitle: "動画・音楽・配送を1本に集約",
    savingHighlight: "年間 約14,000円 お得",
    points: [
      "Prime Video見放題 ＋ お急ぎ便・日時指定便が何度でも無料",
      "単体契約を一本化して月々の固定費を大幅圧縮",
    ],
    buttonText: "30日間無料体験を試す",
    microCopy: "※Webからいつでも即時解約可能・違約金ゼロ",
    url: "https://www.amazon.co.jp/prime",
    theme: {
      border: "border-blue-200 hover:border-blue-400",
      bgGradient: "from-blue-50/70 via-indigo-50/30 to-white",
      badgeBg: "bg-blue-600 text-white",
      highlightColor: "text-blue-700",
      buttonBg: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    },
  },
  {
    id: "unext-point",
    badge: "動画・マンガ集約",
    isPR: true,
    title: "U-NEXT",
    subTitle: "見放題作品数No.1 ＋ 毎月1,200pt",
    savingHighlight: "実質月額 約989円",
    points: [
      "映画・アニメ31万本＋雑誌200誌以上が見放題",
      "毎月1,200円分のポイントで最新作やマンガも購入可能",
    ],
    buttonText: "31日間無料トライアル",
    microCopy: "※無料期間内に解約すれば料金は一切かかりません",
    url: "https://video.unext.jp/",
    theme: {
      border: "border-slate-300 hover:border-slate-500",
      bgGradient: "from-slate-50/90 via-sky-50/30 to-white",
      badgeBg: "bg-slate-900 text-white",
      highlightColor: "text-slate-900",
      buttonBg: "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20",
    },
  },
  {
    id: "rakuten-mobile",
    badge: "通信費＋サブスク",
    isPR: true,
    title: "楽天モバイル",
    subTitle: "スマホ代大幅削減 ＆ 特典無料付帯",
    savingHighlight: "月 約4,000円 節約",
    points: [
      "データ無制限で月3,278円の圧倒的コストパフォーマンス",
      "NBAやパ・リーグが見放題 ＋ YouTube Premium 3ヶ月無料",
    ],
    buttonText: "料金シミュレーションを見る",
    microCopy: "※事務手数料0円・いつでも解約金なし",
    url: "https://network.mobile.rakuten.co.jp/",
    theme: {
      border: "border-rose-200 hover:border-rose-400",
      bgGradient: "from-rose-50/70 via-pink-50/30 to-white",
      badgeBg: "bg-rose-600 text-white",
      highlightColor: "text-rose-700",
      buttonBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
    },
  },
];

/**
 * 開発用モックデータ（UI確認時にGemini APIのクォータを一切消費しないためのダミー）
 * 新しいToDoアクション構造と完全一致する決定論的データ
 */
export const MOCK_DIAGNOSIS_DATA = {
  profile_type: "エンタメ・動画重視型",
  summary:
    "動画や音楽などエンタメ系を中心に複数契約中。年払い化と重複機能の整理で、年間約23,200円の固定費を無理なく削減できます。",
  actions: [
    {
      id: "act_prime_annual",
      service: "Amazonプライム",
      action_type: "plan_change",
      title: "年払いに切り替える",
      annual_saving: 1300,
      effort: "low",
      time_required_min: 3,
      current_state: "月払い ¥600/月 (年間¥7,200)",
      proposed_state: "年払い ¥5,900/年",
      reason_short:
        "サービス内容はそのまま、年払いに変更するだけで実質2ヶ月分（年間1,300円）が確実に浮きます。",
    },
    {
      id: "act_netflix_rotation",
      service: "Netflix",
      action_type: "review",
      title: "見たい月だけの隔月契約に切り替える",
      annual_saving: 8940,
      effort: "low",
      time_required_min: 2,
      current_state: "通年契約 (年間¥17,880)",
      proposed_state: "見たい月のみ年6回契約 (年間¥8,940)",
      reason_short:
        "新作や見たい作品がある月だけ契約を再開・休会することで、満足度を落とさず出費を半額に圧縮できます。",
    },
    {
      id: "act_music_duplicate",
      service: "Spotify",
      action_type: "duplicate",
      title: "音楽サブスクを1本に集約する",
      annual_saving: 12960,
      effort: "medium",
      time_required_min: 5,
      current_state: "複数音楽サービス併用 (月¥2,160)",
      proposed_state: "どちらか1本に集約 (月¥1,080)",
      reason_short:
        "楽曲ライブラリがほぼ重複しているため、普段よく使うアプリ1本に絞るだけで年間12,000円以上節約できます。",
    },
  ],
  investment_impact: {
    yearly_amount: 23200,
    monthly_amount: 1933,
    principal_20y: 464000,
    profit_20y: 325000,
    total_20y: 789000,
    note: "削減できた年間約2.3万円（月約1,930円）を新NISA（年利5%）で20年積立運用した場合の試算です。",
  },
};


