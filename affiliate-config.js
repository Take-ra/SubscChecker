// affiliate-config.js
// アフィリエイト広告のURL・UTMパラメータおよびクリック計測（GA4連携）の一元管理モジュール

/**
 * アフィリエイト設定マスタ
 * A8.net等の実URLが発行された際は、以下の baseUrl を差し替えるだけで変更が反映されます。
 */
export const AFFILIATE_CONFIG = {
  abema: {
    id: "abema",
    name: "ABEMA",
    baseUrl: "https://px.a8.net/svt/ejp?a8mat=4BCGFN+AGVEPE+4EKC+5YRHE",
    utmParams: {
      utm_source: "subsc-checker",
      utm_medium: "affiliate",
      utm_campaign: "cost_review",
      utm_content: "abema_card",
    },
    buttonText: "ABEMAプレミアムの詳細を見る",
    microCopy: "※2週間の無料体験あり・Web管理画面からいつでも即時解約可能",
  },
  audible: {
    id: "audible",
    name: "Audible",
    baseUrl: "https://px.a8.net/svt/ejp?a8mat=4BCGFN+B9G7QQ+5TB0+5YRHE",
    utmParams: {
      utm_source: "subsc-checker",
      utm_medium: "affiliate",
      utm_campaign: "lifestyle_proposal",
      utm_content: "audible_card",
    },
    buttonText: "Audibleの30日間無料体験を見る",
    microCopy: "※無料体験期間中に解約した場合、料金は一切発生しません",
  },
};

/**
 * ベースURLにUTMパラメータを安全に付与して完全なアフィリエイトURLを生成
 * @param {string} serviceKey 'abema' | 'audible'
 * @returns {string}
 */
export function getAffiliateUrl(serviceKey) {
  const config = AFFILIATE_CONFIG[serviceKey];
  if (!config) return "#";

  try {
    const url = new URL(config.baseUrl);
    if (config.utmParams) {
      Object.entries(config.utmParams).forEach(([key, val]) => {
        if (val) url.searchParams.set(key, val);
      });
    }
    return url.toString();
  } catch (e) {
    // baseUrlが相対パスや特殊スキーマの場合のフォールバック
    const separator = config.baseUrl.includes("?") ? "&" : "?";
    const query = new URLSearchParams(config.utmParams || {}).toString();
    return query ? `${config.baseUrl}${separator}${query}` : config.baseUrl;
  }
}

/**
 * アフィリエイトCTAクリック計測関数（GA4連携）
 * カード全体ではなく、明示的なボタンをクリックした時のみ呼び出されます。
 * @param {string} cardId 例: 'abema_card', 'audible_card'
 * @param {string} serviceName 例: 'ABEMA', 'Audible'
 * @param {string} destinationUrl 遷移先URL
 */
export function trackAffiliateClick(cardId, serviceName, destinationUrl) {
  // GA4 (gtag.js) イベント送信
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", "affiliate_click", {
        card_id: cardId,
        service_name: serviceName,
        destination_url: destinationUrl,
        event_category: "Affiliate",
        event_label: serviceName,
      });
    } catch (err) {
      console.warn("[GA4] affiliate_click イベント送信に失敗しました:", err);
    }
  }

  // デバッグ & 動作検証用ログ
  console.log(`[Affiliate Click] ${serviceName} (${cardId}) -> ${destinationUrl}`);
}

// グローバルスコープにも登録（HTMLテンプレートリテラル内のonclick等から安全に呼び出せるようにする）
if (typeof window !== "undefined") {
  window.trackAffiliateClick = trackAffiliateClick;
}
