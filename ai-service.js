// ai-service.js

/**
 * バックエンドのAPIを経由して、AIにサブスクの分析をリクエストする関数
 * @param {String} formattedData - logic.formatDataForAI() で作成したテキストデータ
 * @param {String} userGoal - ユーザーが選んだ目的（例: 'saving'(節約), 'qol'(生活向上), 'family'(家族向け)）
 * @returns {Promise<String>} AIからの分析結果（テキスト）
 */
export async function analyzeSubscriptions(formattedData, userGoal) {
  try {
    // まだ作っていませんが、Vercelの裏側に作る予定の「/api/analyze」という窓口にデータを送ります
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 送るデータの中身（サブスクの契約状況 ＋ ユーザーの目的）
      body: JSON.stringify({
        subscriptions: formattedData,
        goal: userGoal,
      }),
    });

    // もし裏側の部屋からエラーが返ってきたら例外を投げる
    if (!response.ok) {
      throw new Error(`APIリクエストに失敗しました: ${response.status}`);
    }

    // 成功したら、AIが考えたアドバイスのテキストを受け取る
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("AI分析エラー:", error);
    // ユーザー画面に表示するための優しいエラーメッセージ
    return "申し訳ありません。現在AIシステムが混み合っているか、通信エラーが発生しました。しばらく経ってからもう一度お試しください。";
  }
}
