// ai-service.js

/**
 * バックエンドのAPIを経由して、AIにサブスクの分析をリクエストする関数
 * @param {String} formattedData - logic.formatDataForAI() で作成したテキストデータ
 * @param {String} userGoal - ユーザーが選んだ目的（例: 'saving'(節約), 'qol'(生活向上), 'custom'(自由入力)）
 * @param {String} customText - ユーザーからの自由な質問（無い場合は undefined や空文字）
 * @param {Array} database - data.js から読み込んだ全サブスクデータの配列
 * @returns {Promise<String>} AIからの分析結果（テキスト）
 */
export async function analyzeSubscriptions(
  formattedData,
  userGoal,
  customText,
  database,
) {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ★変更箇所：荷物（body）の中に「自由質問(question)」と「データベース(database)」を追加！
      body: JSON.stringify({
        subscriptions: formattedData,
        goal: userGoal,
        question: customText,
        database: database,
      }),
    });

    if (!response.ok) {
      throw new Error(`APIリクエストに失敗しました: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("AI分析エラー:", error);
    return "申し訳ありません。現在AIシステムが混み合っているか、通信エラーが発生しました。しばらく経ってからもう一度お試しください。";
  }
}
