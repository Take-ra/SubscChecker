export const config = {
  runtime: "edge", // 処理を高速化するためのVercelの設定
};

export default async function handler(req) {
  // POSTメソッド（データの送信）以外は弾く安全装置
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POSTメソッドのみ許可されています" }),
      { status: 405 },
    );
  }

  try {
    // フロントエンド（ai-service.js）から送られてきたデータを受け取る
    const { subscriptions, goal } = await req.json();

    // Vercelの環境変数からAPIキーをこっそり読み込む
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "APIキーが設定されていません" }),
        { status: 500 },
      );
    }

    // --- AIへの指示書（プロンプト）の作成 ---
    let systemPrompt =
      "あなたはサブスクリプション管理の専門家であり、優秀なファイナンシャルプランナーです。ユーザーの契約状況を見て、具体的で実行可能、かつ親しみやすいトーンでアドバイスを提示してください。\n\n";

    // ユーザーが選んだ目的に合わせて、AIの人格（着眼点）を切り替える
    if (goal === "saving") {
      systemPrompt +=
        "【目的: 徹底的な節約】\n重複しているサービス（例: 複数の音楽配信や動画配信）を厳しく見つけ出し、解約すべき優先順位や、より安い代替プランを提案して、毎月の固定費を削るアドバイスをしてください。";
    } else if (goal === "qol") {
      systemPrompt +=
        "【目的: 生活の質(QOL)向上】\n単に解約を勧めるのではなく、「これとこれをまとめて上位プランにすればもっと楽しめますよ」「この組み合わせは素晴らしいですね」といった、より豊かなサブスク生活のための提案をしてください。";
    } else if (goal === "family") {
      systemPrompt +=
        "【目的: ファミリー向け最適化】\n個人プランを複数契約している場合、ファミリープランへの統合を提案するなど、家族全体でのコストパフォーマンスが良くなる構成をアドバイスしてください。";
    } else {
      systemPrompt +=
        "ユーザーの状況に合わせて、バランスの良い見直し提案をしてください。";
    }

    // 指示書と、太一さんのアプリで作った「契約データ」を合体させる
    const prompt = `${systemPrompt}\n\n${subscriptions}`;

    // --- Gemini 1.5 Flash API への通信 ---
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7, // 0に近づくと機械的、1に近づくと創造的な文章になる
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    const data = await response.json();

    // エラー時の処理
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return new Response(
        JSON.stringify({ error: "AIの分析中にエラーが発生しました" }),
        { status: 500 },
      );
    }

    // AIが考えてくれた文章を抽出
    const aiText = data.candidates[0].content.parts[0].text;

    // フロントエンド（画面）に結果を返す
    return new Response(JSON.stringify({ result: aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(
      JSON.stringify({ error: "サーバー内でエラーが発生しました" }),
      { status: 500 },
    );
  }
}
