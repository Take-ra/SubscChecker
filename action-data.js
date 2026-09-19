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
    detailGuideUrl: "/cancel/netflix.html",
    category: "動画",
  },
  {
    keywords: ["amazon prime", "プライム", "アマゾンプライム", "prime video"],
    name: "Amazonプライム",
    url: "https://www.amazon.co.jp/mc/manage",
    guide: "「アカウントサービス」＞「プライム会員情報」＞「会員資格を終了する」",
    detailGuideUrl: "/cancel/amazon-prime.html",
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
    detailGuideUrl: "/cancel/youtube-premium.html",
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
 * お得な最適化プラン / 代替案プロモーションデータ（文脈連動型）
 * ユーザーの登録契約データと照合し、条件に一致する場合のみ表示されます。
 */
export const PROMO_CARDS = [
  {
    id: "unext-point",
    badge: "動画・マンガ集約",
    isPR: true,
    title: "U-NEXT",
    subTitle: "見放題作品数No.1 ＋ 毎月1,200pt還元",
    savingHighlight: "実質月額 約989円",
    points: [
      "映画・アニメ31万本＋雑誌200誌以上が見放題",
      "毎月1,200ptで最新映画やマンガも購入可能",
    ],
    demerit: "※NetflixやDisney+などの独自オリジナル作品は視聴できません",
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
    // 動画または電子書籍を契約しているユーザーにマッチ
    match: (items = []) => {
      const targets = items.filter((i) => {
        const cat = (i.category || "").toLowerCase();
        const name = (i.name || "").toLowerCase();
        return (
          cat.includes("動画") ||
          cat.includes("書籍") ||
          /netflix|disney|hulu|dmm|kindle|マガジン|unext/i.test(name)
        );
      });
      if (targets.length === 0) return null;

      const currentTotal = targets.reduce((sum, i) => sum + (Number(i.monthly) || 0), 0);
      const targetNames = targets.map((i) => i.name).slice(0, 2).join("・");
      return {
        matched: true,
        reason: `契約中の ${targetNames}${targets.length > 2 ? "など" : ""}（月額計¥${currentTotal.toLocaleString()}）を集約して節約できる選択肢`,
        currentTotal,
      };
    },
  },
  {
    id: "amazon-prime",
    badge: "王道まとめ割",
    isPR: true,
    title: "Amazonプライム",
    subTitle: "動画・音楽・配送を1本に集約",
    savingHighlight: "月額 約492円 (年払い時)",
    points: [
      "Prime Video見放題 ＋ お急ぎ便・日時指定便が何度でも無料",
      "単体契約を一本化して月々の固定費を大幅圧縮",
    ],
    demerit: "※専門の音楽・動画アプリと比べると一部最新曲や特定作品に制限があります",
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
    // Amazonプライムを契約していない人にのみ表示
    match: (items = []) => {
      const hasPrime = items.some((i) => /prime|プライム/i.test(i.name || ""));
      if (hasPrime) return null; // 契約済みなら表示しない
      return {
        matched: true,
        reason: "動画・音楽・配送特典をまとめて固定費を一本化したい方向け",
      };
    },
  },
  {
    id: "rakuten-mobile",
    badge: "固定費＋特典",
    isPR: true,
    title: "楽天モバイル",
    subTitle: "スマホ代大幅削減 ＆ 特典無料付帯",
    savingHighlight: "データ無制限 月3,278円",
    points: [
      "大手キャリアからの乗り換えで月約4,000円のスマホ代節約",
      "NBAやパ・リーグが見放題 ＋ YouTube Premium 3ヶ月無料",
    ],
    demerit: "※お住まいの地域や地下・屋内環境によって電波状況が異なる場合があります",
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
    // YouTube Premium利用中、またはサブスク月額合計が高額なユーザーにのみ表示
    match: (items = []) => {
      const hasYoutube = items.some((i) => /youtube/i.test(i.name || ""));
      const totalMonthly = items.reduce((sum, i) => sum + (Number(i.monthly) || 0), 0);
      if (!hasYoutube && totalMonthly < 4000) return null;
      return {
        matched: true,
        reason: hasYoutube
          ? "YouTube Premium特典（3ヶ月無料）＆通信費圧縮の選択肢"
          : "スマホ代を下げてサブスク全体の固定費を浮かせる選択肢",
      };
    },
  },
];

/**
 * ユーザーの登録サブスク一覧に条件合致する広告カードのみを抽出する
 */
export function getMatchedPromoCards(items = []) {
  const matched = [];
  for (const card of PROMO_CARDS) {
    if (typeof card.match === "function") {
      const matchResult = card.match(items);
      if (matchResult && matchResult.matched) {
        matched.push({
          ...card,
          contextReason: matchResult.reason,
          currentTotal: matchResult.currentTotal,
        });
      }
    } else {
      matched.push(card);
    }
  }
  // 最大2件までに厳選（過剰な広告感を防止）
  return matched.slice(0, 2);
}

/**
 * 開発用モックデータ（UI確認時にGemini APIのクォータを一切消費しないためのダミー）
 * 新しいToDoアクション構造と完全一致する決定論的データ
 */
export const MOCK_DIAGNOSIS_DATA = {
  profile_type: "動画・エンタメ充実型",
  summary:
    "動画配信や配送特典などを中心にご利用中。年払いプランへの集約や配信サービスの隔月運用により、無理のない固定費削減が可能です。",
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
      annual_saving: 5340,
      effort: "low",
      time_required_min: 2,
      current_state: "通年契約 (年間¥10,680)",
      proposed_state: "見たい月のみ年6回契約 (年間¥5,340)",
      reason_short:
        "新作や見たい作品がある月だけ契約を再開・休会することで、広告つきスタンダードの満足度を落とさず出費を半額に圧縮できます。",
    },
    {
      id: "act_youtube_annual",
      service: "YouTube Premium",
      action_type: "plan_change",
      title: "年払いプラン（Web経由）に切り替える",
      annual_saving: 2560,
      effort: "low",
      time_required_min: 3,
      current_state: "月払い ¥1,280/月 (年間¥15,360)",
      proposed_state: "年払い ¥12,800/年 (Web版)",
      reason_short:
        "Webブラウザ経由で年払いプランに変更すると、約2ヶ月分（年間2,560円）お得に利用できます。",
    },
  ],
  investment_impact: {
    yearly_amount: 9200,
    monthly_amount: 766,
    principal_20y: 184000,
    profit_20y: 129000,
    total_20y: 313000,
    note: "削減できた年間約9,200円（月約760円）を新NISA（年利5%）で20年積立運用した場合の試算です。",
  },
};



