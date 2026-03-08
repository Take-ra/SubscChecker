// main.js
import { initApp } from "./app.js";

async function loadComponents() {
  try {
    const [modalsRes, resultRes] = await Promise.all([
      fetch("./Modals.html"),
      fetch("./ResultScreen.html"),
    ]);

    const modalsHtml = await modalsRes.text();
    const resultHtml = await resultRes.text();

    document.getElementById("modals-container").innerHTML = modalsHtml;
    document.getElementById("result-container").innerHTML = resultHtml;

    console.log("HTML部品の読み込み完了。アプリの起動を準備します。");

    setTimeout(() => {
      try {
        initApp();
      } catch (e) {
        console.error("initAppの実行中にエラーが発生しました:", e);
      }
    }, 0);
  } catch (error) {
    console.error("HTMLの読み込みに失敗しました:", error);
  }
}

loadComponents();
