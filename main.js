const { UI_Btn_Show_TieuDiem, UI_Show_SoDu } = require("./src/Button_Common");
const { UI_TieuDiem, UI_Update_Table, UI_Table_LuuTru, UI_MouseClick } = require("./src/UI_tieudiem");
const {
  updateButton, handleGetColor_TX, TinHieuMuaBan, T, X, Dep,
  Xau, maxThep, getHuongForItem, TinHieuMuaBanNew
} = require('./src/util');

const { handleGetTien } = require('./src/util2');
const player = require("play-sound")();
const path = require("path");
const { chromium } = require("playwright");
const LOCK_SOUND = path.join(__dirname, "tinh.mp3");

// pngjs dùng để đọc pixel từ ảnh screenshot
const { PNG } = require("pngjs");

const fs = require("fs");

const TYPES2 = {
  typeBeThangDep: "beDep",
  typeBeThangXau: "beXau",
  typeSenke: "senke",
};



const STATE_FILE = path.join(__dirname, "state.txt");


// Đây chỉ là nơi xác định tiêu điểm thôi k dùng lmj cả
let startX = 455;
let startY = 326;

// 1. ______________________TÌM KẾT QUẢ Chính__________________
let X_Ketqua = startX + 33; //488
let Y_Ketqua = startY; //326

let X_DatTai = startX - 325; // 130
let Y_DatTai = startY - 61;//265

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

const width = 2;
const height = 2;

const INTERVAL_MS = 70;


// ================== STATE – TRẠNG THÁI ==================

// Đang chạy hay không
let isRunning = false;

// Lưu interval để stop đúng
let intervalId = null;
let page;

let countdown = 70;
let countdownInterval;

const MAX_LENGTH = 10;
const ArrayKQ = [];
const ArrayKQ_XAU = [];
let muaGiaLap = "null"

let soDuTaiKhoan = 1000;
let soDuLonNhat = 1000;
let phanTramGiaoDich = 30;

let profitAll = 0;


const LuutruLongmach = [
  {
    id: 1, isTrading: false, huong: "null", profit: 0, thepChoNgam: 0, isNgamDone: false, ngam: 1, thep: 0, vol: 0, win: 0, lost: 0,
    A: 0, B: 0, C: 0, D: 0, E: 0, A1: 0, A2: 0, A3: 0, A4: 0, A5: 0, deal: 0, isStop: false, type: TYPES2.typeBeThangDep, isFomo: false
  },
  {
    id: 2, isTrading: false, huong: "null", profit: 0, thepChoNgam: 0, isNgamDone: false, ngam: 1, thep: 0, vol: 0, win: 0, lost: 0,
    A: 0, B: 0, C: 0, D: 0, E: 0, A1: 0, A2: 0, A3: 0, A4: 0, A5: 0, deal: 0, isStop: false, type: TYPES2.typeBeThangXau, isFomo: true
  },
  {
    id: 3, isTrading: false, huong: "null", profit: 0, thepChoNgam: 0, isNgamDone: false, ngam: 1, thep: 0, vol: 0, win: 0, lost: 0,
    A: 0, B: 0, C: 0, D: 0, E: 0, A1: 0, A2: 0, A3: 0, A4: 0, A5: 0, deal: 0, isStop: false, type: TYPES2.typeSenke, isFomo: false
  },
];

loadStateTXT();

async function handleStart() {
  if (isRunning) return;

  isRunning = true;

  await updateButton(page, "⏹ Dừng...", "#e23a10ff");

  // Chạy lần đầu ngay
  await CheckColor_X_Y();

  // Chạy lặp theo INTERVAL_MS

  intervalId = setInterval(async () => {
    await CheckColor_X_Y();
  }, INTERVAL_MS * 1000);


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

  await page.goto("https://web.sunwin.sx/", {
    waitUntil: "networkidle",
    timeout: 15 * 60 * 1000,
  });


  await page.exposeFunction(
    "applyCaiDatVon",
    async (soDu, soDuMax, percent, stopId) => {
      soDuTaiKhoan = soDu;
      soDuLonNhat = soDuMax;
      phanTramGiaoDich = percent;

      // ✅ TOGGLE CHẶN / MỞ ID GIAO DỊCH
      if (stopId > 0) {
        const item = LuutruLongmach.find(i => i.id === stopId);
        if (item) {
          updateAray(stopId, { isStop: !item.isStop });
          await UI_Update_Table(page, LuutruLongmach);//Bắt đầu
        }
      }

      await UI_Show_SoDu(page, soDuTaiKhoan, profitAll);
      saveStateTXT();
      await UI_Update_CaiDatVon(
        page,
        soDuTaiKhoan,
        soDuLonNhat,
        phanTramGiaoDich
      );
    }
  );


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
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll)
  await UI_CaiDatVon(page, soDuTaiKhoan, soDuLonNhat, phanTramGiaoDich);
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
  if (resultNew === "null") { console.log("Bị vấn đề khi lấy kết quả"); return };

  if (muaGiaLap !== "null") {
    const isWin = resultNew === muaGiaLap
    if (isWin) {
      ArrayKQ_XAU.push(Xau); if (ArrayKQ_XAU.length > 1000) { ArrayKQ_XAU.shift() }
      muaGiaLap = "null"
    } else {
      ArrayKQ_XAU.push(Dep); if (ArrayKQ_XAU.length > 1000) { ArrayKQ_XAU.shift() }
      muaGiaLap = "null"
    }
  }
  if (muaGiaLap === "null" && tinHieuAI.huong !== "null") {
    muaGiaLap = tinHieuAI.huong
  }


  // ========================== TP / SL ==========================
  for (const item of LuutruLongmach) {
    if (item.isTrading && item.huong) {
      const isNgam = item.ngam && !item.isNgamDone;
      const isWin = resultNew === item.huong
      if (isWin) {
        if (!isNgam) {
          soDuTaiKhoan = soDuTaiKhoan + (item.vol * 0.98);
          profitAll = profitAll + (item.vol * 0.98)
        }
        updateAray(item.id, {
          isTrading: false,
          huong: "null",
          ...(isNgam
            ? { thepChoNgam: 0 }
            : {
              profit: item.profit + (item.vol * 0.98),
              win: item.win + 1,
              A: item.thep === 1 ? item.A + 1 : item.A,
              B: item.thep === 2 ? item.B + 1 : item.B,
              C: item.thep === 3 ? item.C + 1 : item.C,
              D: item.thep === 4 ? item.D + 1 : item.D,
              E: item.thep === 5 ? item.E + 1 : item.E,
              A1: item.thep === 6 ? item.A1 + 1 : item.A1,
              A2: item.thep === 7 ? item.A2 + 1 : item.A2,
              A3: item.thep === 8 ? item.A3 + 1 : item.A3,
              A4: item.thep === 9 ? item.A4 + 1 : item.A4,
              A5: item.thep === 10 ? item.A5 + 1 : item.A5,
              vol: 0,
              ...(item?.ngam && item?.isNgamDone ? { isNgamDone: false, thepChoNgam: 0 } : {}),
              thep: 0,
            }),
        });
      } else {
        if (!isNgam) {
          soDuTaiKhoan = soDuTaiKhoan - item.vol;
          profitAll = profitAll - item.vol;
        }
        updateAray(item.id, {
          isTrading: false,
          huong: "null",
          ...(isNgam
            ? (item?.thepChoNgam >= item.ngam ? { isNgamDone: true } : {})
            : {
              ...(item.thep >= maxThep ? { thep: 0, deal: item.deal + 1 } : {}),
              vol: 0,
              profit: item.profit - item.vol,
              lost: item.lost + 1,
            }),
        });
      }
    }
  }

  if (soDuTaiKhoan > soDuLonNhat) {
    soDuLonNhat = soDuTaiKhoan
  }

  await UI_Update_Table(page, LuutruLongmach);
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll)
  await UI_Update_CaiDatVon(page, soDuTaiKhoan, soDuLonNhat, phanTramGiaoDich);
  saveStateTXT();
  // ========================== ĐẶT LỆNH ==========================

  if (tinHieuAI.huong !== "null") {
    player.play(LOCK_SOUND, (err) => {
      if (err) console.log("Sound error:", err);
    });
  }

  const tinHieuAINew = TinHieuMuaBanNew(ArrayKQ_XAU);
  const arrayNew = LuutruLongmach.filter(i => i.type === tinHieuAINew.type && !i.isStop); {
    if (tinHieuAINew.huong !== "null" && tinHieuAI.huong !== "null") {
      // player.play(LOCK_SOUND, (err) => {
      //   if (err) console.log("Sound error:", err);
      // });

      for (const item of arrayNew) {
        const huongDanhNew = getHuongForItem(tinHieuAINew, tinHieuAI.huong);
        const isNgam = item.ngam && !item.isNgamDone;
        const tinhVol = handleGetTien(item.thep + 1, soDuLonNhat, phanTramGiaoDich);
        updateAray(item.id, {
          isTrading: true,
          huong: huongDanhNew,
          ...(isNgam && { thepChoNgam: item.thepChoNgam + 1 }),
          ...(!isNgam && {
            thep: item.thep + 1,
            vol: tinhVol,
            isFomo: tinHieuAINew.isPheDep
          }),
        });
        console.log('LuutruLongmach', LuutruLongmach);

        await UI_Update_Table(page, LuutruLongmach);//Bắt đầu
        saveStateTXT();
      }
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
        top: "10px",
        right: "42px",
        zIndex: 9999,
        padding: "3px 4px",
        backgroundColor: "#007bff",
        color: "#fff",
        fontSize: "14px",
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
        bottom: "10px",
        left: "10px",
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

async function clickTheoTinhVol(page, tinhVol, icon) {
  const vol = Math.floor(tinhVol);
  if (vol <= 0) return;

  // 1 → 9
  if (vol <= 9) {
    await clickN(page, X_cuoc1, Y_cuoc1, vol, icon);
    return;
  }

  // ≥ 10
  const soLan10 = Math.floor(vol / 10);
  const soLan1 = vol % 10;

  if (soLan10 > 0) {
    await clickN(page, X_cuoc10, Y_cuoc10, soLan10, icon);
  }

  if (soLan1 > 0) {
    await clickN(page, X_cuoc1, Y_cuoc1, soLan1, icon);
  }
}

async function clickN(page, x, y, n, icon = "🖱️") {
  for (let i = 0; i < n; i++) {
    await UI_MouseClick(page, x, y, icon, 18, "ui-mouse-click", 1000);

    await page.mouse.move(x, y);
    await page.mouse.click(x, y);

    const delay = 50 + Math.floor(Math.random() * 151); // 50 → 200
    await page.waitForTimeout(delay);
  }
}

async function UI_CaiDatVon(page, soDu, soDuMax, percent) {
  await page.evaluate(({ soDu, soDuMax, percent }) => {
    if (document.getElementById("ui-caidat-von")) return;

    const container = document.createElement("div");
    container.id = "ui-caidat-von";
    Object.assign(container.style, {
      position: "fixed",
      top: "33px",
      right: "10px",
      width: "210px",
      backgroundColor: "#fff",
      border: "1px solid #000",
      borderRadius: "8px",
      padding: "10px 16px 14px 16px",
      fontSize: "12px",
      fontFamily: "monospace",
      zIndex: 9999,
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    });

    // ✅ SỬA LOGIC % Ở ĐÂY
    const tienGD = percent ? Math.floor(soDuMax * percent / 100) : 0;
    container.innerHTML = `
      <style>
        #ui-caidat-von input[type=number]::-webkit-inner-spin-button,
        #ui-caidat-von input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        #ui-caidat-von input[type=number] {
          -moz-appearance: textfield;
        }
      </style>

      <div style="font-weight:bold;margin-bottom:10px;text-align:center">
        ⚙️ CÀI ĐẶT VỐN
      </div>

      <div style="margin-bottom:8px">
        Số dư hiện tại
        <input id="inp-sodu" type="number"
          style="width:100%;box-sizing:border-box;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px"
          value="${soDu}" />
      </div>

      <div style="margin-bottom:8px">
        Số dư lớn nhất
        <input id="inp-max" type="number"
          style="width:100%;box-sizing:border-box;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px"
          value="${soDuMax}" />
      </div>

      <div style="margin-bottom:10px">
        % giao dịch
        <input id="inp-percent" type="number"
          style="width:100%;box-sizing:border-box;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px"
          value="${percent}" />
      </div>

      <div style="margin-bottom:10px">
        💰 Tiền giao dịch:
        <span style="color:#dc3545;font-weight:bold;font-size:13px">
          ${tienGD}
        </span>
      </div>

      <div style="margin-bottom:10px">
        🚫 Chặn ID giao dịch
        <input id="inp-stop-id" type="number"
          placeholder="Ví dụ: 1"
          style="width:100%;box-sizing:border-box;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px" />
      </div>

      <button id="btn-apply"
        style="width:100%;padding:7px;background:#007bff;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold">
        Cài đặt
      </button>
    `;

    // ===== TOGGLE =====
    const toggleBtn = document.createElement("div");
    toggleBtn.innerText = "▼";
    Object.assign(toggleBtn.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      fontSize: "14px",
      padding: "3px 7px",
      cursor: "pointer",
      background: "#fff",
      border: "1px solid #999",
      borderRadius: "4px",
      userSelect: "none",
      zIndex: 10000,
    });


    let isHidden = false;
    toggleBtn.onclick = () => {
      isHidden = !isHidden;
      container.style.display = isHidden ? "none" : "block";
      toggleBtn.innerText = isHidden ? "▲" : "▼";
    };

    document.body.appendChild(toggleBtn);
    document.body.appendChild(container);

    // ===== APPLY =====
    document.getElementById("btn-apply").onclick = () => {
      const stopId = Number(document.getElementById("inp-stop-id").value || 0);

      window.applyCaiDatVon(
        Number(document.getElementById("inp-sodu").value || 0),
        Number(document.getElementById("inp-max").value || 0),
        Number(document.getElementById("inp-percent").value || 0),
        stopId
      );
    };
  }, { soDu, soDuMax, percent });
}

async function UI_Update_CaiDatVon(page, soDu, soDuMax, percent) {
  await page.evaluate(({ soDu, soDuMax, percent }) => {
    const box = document.getElementById("ui-caidat-von");
    if (!box) return;

    const inpSoDu = document.getElementById("inp-sodu");
    const inpMax = document.getElementById("inp-max");
    const inpPercent = document.getElementById("inp-percent");

    if (inpSoDu) inpSoDu.value = soDu;
    if (inpMax) inpMax.value = soDuMax;
    if (inpPercent) inpPercent.value = percent;

    const spanTien = box.querySelector("span");

    if (spanTien && percent) {
      spanTien.innerText = percent ? Math.floor(soDuMax * percent / 100) : 0;
    }
  }, { soDu, soDuMax, percent });
}

function saveStateTXT() {
  try {
    let lines = [];

    lines.push(`soDuTaiKhoan=${soDuTaiKhoan}`);
    lines.push(`soDuLonNhat=${soDuLonNhat}`);
    lines.push(`phanTramGiaoDich=${phanTramGiaoDich}`);
    lines.push(`profitAll=${profitAll}`);
    lines.push("");

    lines.push(`ArrayKQ=${ArrayKQ.join(",")}`);
    lines.push(`ArrayKQ_XAU=${ArrayKQ_XAU.join(",")}`); // ✅ THÊM NÀY NỮA
    lines.push("");

    // ✅ GHI DẠNG JSON NHIỀU DÒNG
    lines.push("LuutruLongmach=");
    lines.push(JSON.stringify(LuutruLongmach, null, 2));

    fs.writeFileSync(STATE_FILE, lines.join("\n"), "utf8");
  } catch (err) {
    console.error("❌ Save TXT lỗi:", err.message);
  }
}

function loadStateTXT() {
  if (!fs.existsSync(STATE_FILE)) return;

  try {
    const content = fs.readFileSync(STATE_FILE, "utf8");

    // ===== SIMPLE KEY VALUE =====
    const getVal = (key) => {
      const m = content.match(new RegExp(`${key}=(.*)`));
      return m ? m[1].trim() : null;
    };

    soDuTaiKhoan = Number(getVal("soDuTaiKhoan")) || soDuTaiKhoan;
    soDuLonNhat = Number(getVal("soDuLonNhat")) || soDuLonNhat;
    phanTramGiaoDich = Number(getVal("phanTramGiaoDich")) || phanTramGiaoDich;
    profitAll = Number(getVal("profitAll")) || profitAll;

    const arrKQ = getVal("ArrayKQ");
    if (arrKQ) {
      ArrayKQ.length = 0;
      ArrayKQ.push(...arrKQ.split(","));
    }
    const arrXAU = getVal("ArrayKQ_XAU");
    if (arrXAU) {
      ArrayKQ_XAU.length = 0;
      ArrayKQ_XAU.push(...arrXAU.split(","));
    }

    // ===== LUUTRU LONGMACH MULTI LINE JSON =====
    const lmIndex = content.indexOf("LuutruLongmach=");
    if (lmIndex !== -1) {
      const jsonText = content
        .slice(lmIndex + "LuutruLongmach=".length)
        .trim();

      const arr = JSON.parse(jsonText);
      if (Array.isArray(arr)) {
        LuutruLongmach.length = 0;
        LuutruLongmach.push(...arr);
      }
    }

    // console.log("✅ Load state TXT (pretty) OK");
  } catch (err) {
    console.error("❌ Load TXT lỗi → bỏ qua state:", err.message);
  }
}


