const { UI_Btn_Show_TieuDiem } = require("./src/Button_Common");
const { UI_TieuDiem } = require("./src/UI_tieudiem");
const {
  updateButton, handleGetColor_TX,TinHieuMuaBan,
  type01, type02, type03, type04, type05, type06,
  type07, type08, type09, type10, type11, type12,
  type13, type14, type15, type16, type17, type18,
  type19, type20, type21, type22, type23, type24,
} = require('./src/util');

const { chromium } = require("playwright");

// pngjs dùng để đọc pixel từ ảnh screenshot
const { PNG } = require("pngjs");

let startX = 455;
let startY = 326;

// 1. ______________________TÌM KẾT QUẢ__________________
let X_Ketqua = startX + 33; //488
let Y_Ketqua = startY; //326

// 2. ______________________Đặt Tài _____________________
let X_DatTai = startX - 325; // 130
let Y_DatTai = startY - 61 ;//265

// 3._______________________Đặt Xỉu _____________________
let X_DatXiu = startX; //455
let Y_DatXiu = startY - 61 ; //265

// 4._______________________cược 1_____________________
let X_cuoc1 = startX - 405; //50
let Y_cuoc1 = startY + 49 ; //375

// 5._______________________cược 10_____________________
let X_cuoc10 = startX - 335; //120
let Y_cuoc10 = startY + 49 ; //375

// 5._______________________Nút Đặt cược_____________________
let X_Submit = startX - 180; //275
let Y_Submit = startY + 111 ; //437

// Kích thước tiêu điểm
const width = 2;
const height = 2;

// Thời gian lặp (ms) – 7 giây
const INTERVAL_MS = 70;


// ================== STATE – TRẠNG THÁI ==================

// Đang chạy hay không
let isRunning = false;

// Lưu interval để stop đúng
let intervalId = null;
let page;

const MAX_LENGTH = 13;
const ArrayKQ = [];

const LuutruLongmach = [
  { id: 1,  type: type01, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 2,  type: type02, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 3,  type: type03, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 4,  type: type04, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },

  { id: 5,  type: type05, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 6,  type: type06, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 7,  type: type07, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 8,  type: type08, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },

  { id: 9,  type: type09, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 10, type: type10, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 11, type: type11, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 12, type: type12, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },

  { id: 13, type: type13, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 14, type: type14, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 15, type: type15, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 16, type: type16, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },

  { id: 17, type: type17, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 18, type: type18, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 19, type: type19, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 20, type: type20, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },

  { id: 21, type: type21, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 22, type: type22, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 23, type: type23, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
  { id: 24, type: type24, taophan: 0, thep: 1, win: 0, lost: 0, profit: 0, mot: 0, hai: 0, ba: 0, bon: 0, nam: 0 },
];


async function handleStart() {
  if (isRunning) return;

  isRunning = true;

  await updateButton(page,"⏹ Dừng...", "#e23a10ff");

  // Chạy lần đầu ngay
  await CheckColor_X_Y();

  // Chạy lặp theo INTERVAL_MS
  intervalId = setInterval(CheckColor_X_Y, INTERVAL_MS * 1000);

  // Hiển thị đồng hồ đếm ngược
  await ShowTime70();
}

async function handleStop() {
  if (!isRunning) return;

  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;

  await updateButton("Bắt đầu", "#28a745");

  // Ẩn timer ngay lập tức khi dừng
  await page.evaluate(() => {
    const timerDiv = document.getElementById("timer-display");
    if (timerDiv) timerDiv.style.display = "none";
  });
}

// ================== MAIN – CHƯƠNG TRÌNH CHÍNH ==================
(async () => {
  const browser = await chromium.launch({ headless: false });

  // Tạo tab mới
  page = await browser.newPage();

  await page.goto("https://web.sun.win/", {
    waitUntil: "networkidle",
  });


// Tạo overlay nhiều điểm
await UI_TieuDiem(page, startX, startY, width, height, "control", "#ff0000");   // đỏ
await UI_TieuDiem(page, X_Ketqua, Y_Ketqua, width, height, "tieudiem-2", "#007bff"); // xanh dương
await UI_TieuDiem(page, X_DatTai, Y_DatTai, width, height, "tieudiem-3", "#28a745"); // xanh lá
await UI_TieuDiem(page, X_DatXiu, Y_DatXiu, width, height, "tieudiem-4", "#ffc107"); // vàng
await UI_TieuDiem(page, X_cuoc1, Y_cuoc1, width, height, "tieudiem-5", "#6f42c1"); // tím
await UI_TieuDiem(page, X_cuoc10, Y_cuoc10, width, height, "tieudiem-6", "#fd7e14"); // cam
await UI_TieuDiem(page, X_Submit, Y_Submit, width, height, "tieudiem-7", "#e83e8c"); // hồng


// Tạo UI tách biệt
  await UI_Btn_Show_TieuDiem(page);
  await UI_DieuKhien(page);//điều khiển 
  await UI_Start(page);//Bắt đầu

  
})();

async function CheckColor_X_Y() {
  if (!isRunning) return;

  try {
    const buffer = await page.screenshot({ fullPage: true });
    const png = PNG.sync.read(buffer);

    let r = 0, g = 0, b = 0, count = 0;

    for (let y = startY; y < startY + height; y++) {
      for (let x = X_Ketqua; x < X_Ketqua + width; x++) {
        const idx = (png.width * y + x) << 2;
        r += png.data[idx];
        g += png.data[idx + 1];
        b += png.data[idx + 2];
        count++;
      }
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");

  // console.log(`🎨 RGB(${r},${g},${b}) HEX ${hex}`);
  // await page.mouse.click(x, y);

    if(hex){
      const ketqua = handleGetColor_TX(r,g,b)
      if(ketqua !== "null"){
          ArrayKQ.push(ketqua === "black" ? "Tai" : "Xiu"); 
          if (ArrayKQ.length > MAX_LENGTH) {ArrayKQ.shift()}
          ShowChuoiKetQuaTX();
      }
    }
    countdown = 70;
  } catch (err) { console.error("❌ Capture error:", err);
  }
}
// ================== UI – TẠO NÚT START ==================

async function UI_Start(page) {
  // Tạo button trong browser
  await page.evaluate(() => {
    const btn = document.createElement("button");
    btn.id = "start-button";
    btn.innerText = "▶ Bắt đầu";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "15px",
      right: "15px",
      zIndex: 9999,
      padding: "10px 20px",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    });
    document.body.appendChild(btn);
  });
  

  await page.exposeFunction("toggleCapture", toggleCapture);

  // Gắn sự kiện click cho button
  await page.evaluate(() => {
    document
      .getElementById("start-button")
      .addEventListener("click", () => {
        window.toggleCapture();
      });
  });
}

async function ShowChuoiKetQuaTX() {
  const tinHieu = TinHieuMuaBan(ArrayKQ)
  console.log("Kết quả", ArrayKQ)
}


let countdown = 70;      // biến global cho countdown
let countdownInterval;   // interval global để có thể clear

async function ShowTime70() {
  // Thêm div hiển thị nếu chưa có
  await page.evaluate(() => {
    let timerDiv = document.getElementById("timer-display");
    if (!timerDiv) {
      timerDiv = document.createElement("div");
      timerDiv.id = "timer-display";
      Object.assign(timerDiv.style, {
        position: "fixed",
        bottom: "60px",
        right: "15px",
        zIndex: 9999,
        padding: "10px 15px",
        backgroundColor: "#007bff",
        color: "#fff",
        fontSize: "20px",
        fontWeight: "bold",
        borderRadius: "5px",
      });
      document.body.appendChild(timerDiv);
    }
  });

  // Hiển thị lần đầu
  await page.evaluate((c) => {
    const timerDiv = document.getElementById("timer-display");
    if (timerDiv) timerDiv.innerText = c;
  }, countdown);

  // Xóa interval cũ nếu có
  if (countdownInterval) clearInterval(countdownInterval);

  // Tạo interval đếm ngược
  countdownInterval = setInterval(async () => {
    if (!isRunning) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      // Ẩn div khi dừng
      await page.evaluate(() => {
        const timerDiv = document.getElementById("timer-display");
        if (timerDiv) timerDiv.style.display = "none";
      });
      return;
    }

    // Hiển thị countdown
    await page.evaluate((c) => {
      const timerDiv = document.getElementById("timer-display");
      if (timerDiv) {
        timerDiv.style.display = "block";
        timerDiv.innerText = c;
      }
    }, countdown);

    countdown--;

    // Khi countdown < 0 thì reset về 70
    if (countdown < 0) countdown = 70;

  }, 1000);
}

async function toggleCapture() {
  isRunning ? await handleStop() : await handleStart();
}

async function UI_DieuKhien(page) {
  await page.evaluate(() => {
    let container = document.getElementById("adjust-buttons");
    if (!container) {
      container = document.createElement("div");
      container.id = "adjust-buttons";
      Object.assign(container.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 9999,
        display: "grid",
        gridTemplateColumns: "25px 25px 25px",
        gridTemplateRows: "25px 25px",
        gap: "1px", // siêu sát
      });
      document.body.appendChild(container);

      // Layout 4 nút bàn phím thật
      const layout = [
        { id: "up-btn", text: "⬆️", col: 2, row: 1 },
        { id: "left-btn", text: "⬅️", col: 1, row: 2 },
        { id: "down-btn", text: "⬇️", col: 2, row: 2 },
        { id: "right-btn", text: "➡️", col: 3, row: 2 },
      ];

      layout.forEach(btnInfo => {
        const btn = document.createElement("button");
        btn.id = btnInfo.id;
        btn.innerText = btnInfo.text;
        Object.assign(btn.style, {
          width: "25px",
          height: "25px",
          fontSize: "16px",
          borderRadius: "3px",
          border: "1px solid black",
          cursor: "pointer",
          backgroundColor: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gridColumn: btnInfo.col,
          gridRow: btnInfo.row,
          padding: "0",
          margin: "0",
        });
        container.appendChild(btn);
      });
    }
  });

  // Expose Node.js function để update startX/startY
  await page.exposeFunction("adjustStartXY", async (dx, dy) => {
    startX += dx;
    startY += dy;

    X_Ketqua += dx;
    Y_Ketqua += dy;

    X_DatTai += dx;
    Y_DatTai += dy;

    X_DatXiu += dx;
    Y_DatXiu += dy;

     X_cuoc1 += dx;
    Y_cuoc1 += dy;

    X_cuoc10 += dx;
    Y_cuoc10 += dy;

    X_Submit += dx;
    Y_Submit += dy;

    // console.log(`🖌 startX=${startX}, startY=${startY}`);
    await UI_TieuDiem(page, startX, startY, width, height, "control", "#ff0000");   // đỏ
    await UI_TieuDiem(page, X_Ketqua, Y_Ketqua, width, height, "tieudiem-2", "#007bff"); // xanh dương
    await UI_TieuDiem(page, X_DatTai, Y_DatTai, width, height, "tieudiem-3", "#28a745"); // xanh lá
    await UI_TieuDiem(page, X_DatXiu, Y_DatXiu, width, height, "tieudiem-4", "#ffc107"); // vàng
    await UI_TieuDiem(page, X_cuoc1, Y_cuoc1, width, height, "tieudiem-5", "#6f42c1"); // tím
    await UI_TieuDiem(page, X_cuoc10, Y_cuoc10, width, height, "tieudiem-6", "#fd7e14"); // cam
    await UI_TieuDiem(page, X_Submit, Y_Submit, width, height, "tieudiem-7", "#e83e8c"); // hồng
  });

  // Gắn sự kiện click cho 4 nút
  await page.evaluate(() => {
    document.getElementById("up-btn").addEventListener("click", () => window.adjustStartXY(0, -1));
    document.getElementById("down-btn").addEventListener("click", () => window.adjustStartXY(0, 1));
    document.getElementById("left-btn").addEventListener("click", () => window.adjustStartXY(-1, 0));
    document.getElementById("right-btn").addEventListener("click", () => window.adjustStartXY(1, 0));
  });
}

