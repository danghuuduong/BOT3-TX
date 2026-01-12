const { UI_Btn_Show_TieuDiem } = require("./src/Button_Common");
const { UI_TieuDiem, UI_Update_Table, UI_Table_LuuTru, UI_History, UI_Update_History } = require("./src/UI_tieudiem");
const {
  updateButton, handleGetColor_TX, TinHieuMuaBan,
  TYPES, T, X
} = require('./src/util');
const { handleGetTien, getHuongForItem } = require('./src/util');
const player = require("play-sound")();
const path = require("path");
const { chromium } = require("playwright");
const LOCK_SOUND = path.join(__dirname, "tinh.mp3");

// pngjs dùng để đọc pixel từ ảnh screenshot
const { PNG } = require("pngjs");

let startX = 455;
let startY = 326;

// 1. ______________________TÌM KẾT QUẢ__________________
let X_Ketqua = startX + 33; //488
let Y_Ketqua = startY; //326

// 2. ______________________Đặt Tài _____________________
let X_DatTai = startX - 325; // 130
let Y_DatTai = startY - 61;//265

// 3._______________________Đặt Xỉu _____________________
let X_DatXiu = startX; //455
let Y_DatXiu = startY - 61; //265

// 4._______________________cược 1_____________________
let X_cuoc1 = startX - 405; //50
let Y_cuoc1 = startY + 49; //375

// 5._______________________cược 10_____________________
let X_cuoc10 = startX - 335; //120
let Y_cuoc10 = startY + 49; //375

// 5._______________________Nút Đặt cược_____________________
let X_Submit = startX - 180; //275
let Y_Submit = startY + 111; //437

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

let countdown = 70;      // biến global cho countdown
let countdownInterval;   // interval global để có thể clear

const MAX_LENGTH = 13;
const ArrayKQ = [];
let soDuTaiKhoan = 1000;
let soDuLonNhat = 1000;

const LuutruLongmach = [
  { id: 1, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 3, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_1_1 },
  { id: 3, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 3, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_1_1, isFomo: true },
  { id: 2, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_1_1_PLUS },
  { id: 4, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_1_1_PLUS, isFomo: true },

  { id: 5, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 3, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_2 },
  { id: 7, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 3, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_2, isFomo: true },
  { id: 6, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_2_PLUS },
  { id: 8, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_2_PLUS, isFomo: true },

  { id: 9, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_3 },
  { id: 11, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_3, isFomo: true },
  { id: 10, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_3_PLUS },
  { id: 12, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_3_PLUS, isFomo: true },

  { id: 13, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_1 },
  { id: 15, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_1, isFomo: true },
  { id: 14, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_1_PLUS },
  { id: 16, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_2_1_PLUS, isFomo: true },

  { id: 17, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_1 },
  { id: 19, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_1, isFomo: true },
  { id: 18, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_1_PLUS },
  { id: 20, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_3_1_PLUS, isFomo: true },

  { id: 21, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 3, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_123 },
  { id: 23, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_123, isFomo: true },
  { id: 22, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_123_PLUS },
  { id: 24, isTrading: false, huong: "null", profit: 0, thepDanhChoNgam: 0, ngam: 2, thep: 0, vol: 0, win: 0, lost: 0, A: 0, B: 0, C: 0, D: 0, E: 0, deal: 0, type: TYPES.TYPE_123_PLUS, isFomo: true },
];
const arrayHistory = [];

async function handleStart() {
  if (isRunning) return;

  isRunning = true;

  await updateButton(page, "⏹ Dừng...", "#e23a10ff");

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

  await updateButton(page, "Bắt đầu", "#28a745");

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

  await UI_Table_LuuTru(page);//Bắt đầu
  await UI_Update_Table(page, LuutruLongmach);//Bắt đầu
  await UI_History(page); // tạo container history

})();

// ================================================== HANDLE LOGIC ===========================================
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


    if (hex) {
      const ketqua = handleGetColor_TX(r, g, b)
      if (ketqua !== "null") {
        ArrayKQ.push(ketqua === "black" ? T : X);
        if (ArrayKQ.length > MAX_LENGTH) { ArrayKQ.shift() }
        ThucHienGiaoDich();
      }
    }
    countdown = 70;
  } catch (err) {
    console.error("❌ Capture error:", err);
  }
}

function updateAray(id, updates) {
  const item = LuutruLongmach.find(i => i.id === id);
  if (!item) return;
  Object.assign(item, updates);
}

async function ThucHienGiaoDich() {

  const tinHieuAI = TinHieuMuaBan(ArrayKQ);

  const resultNew = ArrayKQ.at(-1);
  if (resultNew === "null") return;

  // 🔥 LẤY TẤT CẢ ITEM CÙNG TYPE


  if (tinHieuAI.huong !== "null") {
    console.log("Type", tinHieuAI.type);

    player.play(LOCK_SOUND, (err) => {
      if (err) console.log("Sound error:", err);
    });
  }
  // ========================== ĐẶT LỆNH ==========================
  const items = LuutruLongmach.filter(i => i.type === tinHieuAI.type);
  for (const item of items) {
    const huongDanh = getHuongForItem(item, tinHieuAI.huong);
    const isNgam = item.thepDanhChoNgam < item.ngam;
    if (huongDanh !== "null" && !item.isTrading) {
      const tinhVol = handleGetTien(item.thep + 1, soDuLonNhat, 30);
      if (!isNgam) {
        // onlick 10 ..
      }
      updateAray(item.id, {
        isTrading: true,
        huong: huongDanh,
        ...(isNgam && { thepDanhChoNgam: item.thepDanhChoNgam + 1 }),
        ...(!isNgam && {
          thep: item.thep + 1,
          vol: tinhVol,
        }),
      });
      await UI_Update_Table(page, LuutruLongmach);//Bắt đầu


      // =======================HISTORY=========================
      const now = new Date();
      const timeVN = now.toLocaleString("vi-VN", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" });

      arrayHistory.push({
        id: item.id,
        type: item.isFomo ? tinHieuAI.type + " fomo" : tinHieuAI.type,
        huong: huongDanh,
        thep: item.thep + 1,
        vol: tinhVol,
        time: timeVN
      });

      // Cập nhật UI lịch sử
      await UI_Update_History(page, arrayHistory);

    }
  }

  // ========================== TP / SL ==========================
  for (const item of LuutruLongmach) {
    if (item.isTrading && item.huong) {
      const isNgam = item.thepDanhChoNgam < item.ngam;
      const isWin = resultNew === item.huong
      if (isWin) {
        if (!isNgam) {
          soDuTaiKhoan = soDuTaiKhoan + item.vol * 0.98;
          if (soDuTaiKhoan > soDuLonNhat) {
            soDuLonNhat = soDuTaiKhoan
          }
        }
        updateAray(item.id, {
          isTrading: false,
          huong: "null",
          ...(isNgam && { thepDanhChoNgam: 0 }),
          ...(!isNgam && {
            profit: item.profit + item.vol * 0.98,
            thep: 0,
            vol: 0,
            win: item.win + 1,
            A: item.thep === 1 ? item.A + 1 : item.A,
            B: item.thep === 2 ? item.B + 1 : item.B,
            C: item.thep === 3 ? item.C + 1 : item.C,
            D: item.thep === 4 ? item.D + 1 : item.D,
            E: item.thep === 5 ? item.E + 1 : item.E,
          }),
        });


      } else {
        if (!isNgam) {
          soDuTaiKhoan = soDuTaiKhoan - item.vol * 0.98;
        }
        updateAray(item.id, {
          isTrading: false,
          huong: "null",
          ...(!isNgam && {
            profit: item.profit - item.vol * 0.98,
            vol: 0,
            lost: item.lost + 1,
          }),
          ...(!isNgam && item.thep >= 5 && {
            thep: 0,
            deal: item.deal + 1,
          }),
        });

      }
      await UI_Update_Table(page, LuutruLongmach);//Bắt đầu
    }
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

