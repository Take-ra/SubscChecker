// calendar.js

let currentCalSub = null;
let pendingGoogleCalendarDays = []; // Googleカレンダー用に「残り何件登録するか」を覚えておく配列

// モーダルを開く処理
export function openCalendarModal(subId, subName, plan) {
  currentCalSub = { id: subId, name: subName, plan: plan };
  pendingGoogleCalendarDays = []; // リセット

  const modal = document.getElementById("calendar-modal");
  const nameEl = document.getElementById("cal-sub-name");
  const dateInput = document.getElementById("cal-start-date");
  const customContainer = document.getElementById(
    "cal-custom-timing-container",
  );
  const googleBtn = document.getElementById("btn-google-cal");

  if (!modal) return;

  nameEl.textContent = subName;
  dateInput.value = new Date().toISOString().split("T")[0];

  // UIリセット：デフォルトで「1週間前」だけチェックを入れておく
  document.querySelectorAll(".cal-notify-cb").forEach((cb) => {
    cb.checked = cb.value === "7";
  });
  customContainer.classList.add("hidden");
  if (googleBtn) googleBtn.innerHTML = "📅 Googleカレンダーに追加";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

// モーダルを閉じる処理
export function closeCalendarModal() {
  const modal = document.getElementById("calendar-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  document.body.style.overflow = "";
  currentCalSub = null;
}

// 任意の日数前のチェックボックス切替
export function handleTimingChange(e) {
  const customContainer = document.getElementById(
    "cal-custom-timing-container",
  );
  if (e.target.checked) {
    customContainer.classList.remove("hidden");
  } else {
    customContainer.classList.add("hidden");
  }
}

// チェックされている通知日数を配列で取得する関数（例: [7, 3]）
function getSelectedNotifyDays() {
  const checkboxes = document.querySelectorAll(".cal-notify-cb:checked");
  let daysArray = [];

  checkboxes.forEach((cb) => {
    if (cb.value === "custom") {
      const customDays = parseInt(
        document.getElementById("cal-custom-days").value,
        10,
      );
      if (!isNaN(customDays)) daysArray.push(customDays);
    } else {
      daysArray.push(parseInt(cb.value, 10));
    }
  });

  // 重複を消して、数字が大きい（日付が早い）順に並び替え
  return [...new Set(daysArray)].sort((a, b) => b - a);
}

// 特定の通知日数から「予定日」を計算する
function calculateSingleEventDate(notifyDays) {
  const startDateStr = document.getElementById("cal-start-date").value;
  if (!startDateStr) return null;

  const start = new Date(startDateStr);
  let nextRenewal = new Date(start);

  if (currentCalSub.plan === "monthly") {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  } else {
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
  }

  const now = new Date();
  while (nextRenewal < now) {
    if (currentCalSub.plan === "monthly") {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    } else {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    }
  }

  const eventDate = new Date(nextRenewal);
  eventDate.setDate(eventDate.getDate() - notifyDays);
  return eventDate;
}

// Googleカレンダーへ追加（複数ある場合は1つずつボタンを押してもらう）
export function addToGoogleCalendar() {
  // ボタンを初めて押した時に、チェックされている日付をすべて取得する
  if (pendingGoogleCalendarDays.length === 0) {
    pendingGoogleCalendarDays = getSelectedNotifyDays();
    if (pendingGoogleCalendarDays.length === 0)
      return alert("通知日を1つ以上選択してください");
  }

  // 先頭の1件を取り出す
  const notifyDays = pendingGoogleCalendarDays.shift();
  const eventDate = calculateSingleEventDate(notifyDays);
  if (!eventDate) return alert("契約日を入力してください");

  const title = `【更新${notifyDays}日前】${currentCalSub.name}`;
  const details = `${currentCalSub.name} の契約更新が近づいています。\n意図しない自動更新を防ぐために確認してください。`;
  const dateStr = eventDate
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "")
    .slice(0, 8);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(details)}`;
  window.open(
    url,
    "_blank",
    "width=600,height=600,scrollbars=yes,resizable=yes",
  );

  // まだ登録すべき予定が残っている場合、ボタンの文字を変えて連続クリックを促す
  if (pendingGoogleCalendarDays.length > 0) {
    const googleBtn = document.getElementById("btn-google-cal");
    if (googleBtn) {
      googleBtn.innerHTML = `📅 次の予定を登録する (残り${pendingGoogleCalendarDays.length}件)`;
      googleBtn.classList.replace("bg-white", "bg-blue-50"); // 色を少し変えてアピール
    }
  } else {
    // 全て登録し終わったら閉じる
    closeCalendarModal();
  }
}

// Appleカレンダー等へ追加 (1つのファイルに複数の予定をまとめて出力できる)
export async function addToAppleCalendar() {
  try {
    const daysArray = getSelectedNotifyDays();
    if (daysArray.length === 0) {
      alert("通知日を1つ以上選択してください");
      return;
    }

    let icsEvents = "";

    // 選択された日数の数だけ予定(VEVENT)を作る
    for (const notifyDays of daysArray) {
      const eventDate = calculateSingleEventDate(notifyDays);
      if (!eventDate) {
        alert("契約日を入力してください");
        return;
      }

      const title = `【更新${notifyDays}日前】${currentCalSub.name}`;
      const details = `${currentCalSub.name} の契約更新が近づいています。確認してください。`;
      const dateStr = eventDate
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "")
        .slice(0, 8);

      icsEvents += `BEGIN:VEVENT
SUMMARY:${title}
DTSTART;VALUE=DATE:${dateStr}
DESCRIPTION:${details}
END:VEVENT
`;
    }

    // カレンダーファイルをまとめる
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
${icsEvents}END:VCALENDAR`;

    let file;
    try {
      // ここでPCローカル環境のエラーが起きやすいので、安全に処理する
      const fileName = "subscription_alert.ics";
      file = new File([icsData], fileName, { type: "text/calendar" });
    } catch (fileErr) {
      alert(
        "お使いのブラウザ環境ではファイルの生成がブロックされました。\nGoogleカレンダーをご利用ください。",
      );
      return;
    }

    // スマホなどの「共有メニュー（Web Share API）」が使えるかチェック
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "サブスク更新通知",
        });
        closeCalendarModal();
      } catch (shareErr) {
        console.log("共有がキャンセルされたか、失敗しました:", shareErr);
        // ▼▼ 修正：コンソールに出すだけではなく、画面にアラートを出して案内する ▼▼
        alert(
          "お使いの環境では共有メニューを開けませんでした（ブラウザの権限ブロック等）。\n恐れ入りますが、Googleカレンダーボタンをご利用いただくか、スマホでお試しください。",
        );
      }
    } else {
      // 使えない環境（PCのブラウザ等）の場合はアラートを出す
      alert(
        "PC環境など、お使いのブラウザでは直接カレンダーアプリを開く機能（共有メニュー）がサポートされていません。\nGoogleカレンダーボタンをご利用いただくか、スマホのブラウザでお試しください。",
      );
    }
  } catch (error) {
    // 予期せぬエラーが起きた場合も、絶対にフリーズさせずにアラートを出す
    console.error(error);
    alert("エラーが発生しました: " + error.message);
  }
}
