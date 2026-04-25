const { UI_Btn_Show_TieuDiem, UI_Show_SoDu, LongMachList_Update_UI, KetquaTXList_Create, LongMachList_create, KetquaTXList_Update_UI } = require("./src/Button_Common");
const { UI_TieuDiem, TableChinh_Update_UI, TableChinh_Create, UI_MouseClick } = require("./src/UI_tieudiem");
const {
  updateButton, handleGetColor_TX, TinHieuMuaBan, T, X, Dep,
  Xau, maxThep, checkABTrongDoXanh
} = require('./src/util');

const { handleGetTien, ghiNhanThuNhap, luuTruTrangThai } = require('./src/util2');
// const player = require("play-sound")();
const path = require("path");
const { chromium } = require("playwright");
require('dotenv').config();
// const LOCK_SOUND = path.join(__dirname, "tinh.mp3");

// pngjs dùng để đọc pixel từ ảnh screenshot
const { PNG } = require("pngjs");

const fs = require("fs");

const STATE_FILE = path.join(__dirname, "state.txt");

const axios = require('axios');
const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
let currentUsername = "";
let currentPassword = "";
let reLoginInterval = null;
let currentToken = null;
let profitAll = 0;

async function doLoginAPI(username, password) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password, profitX: profitAll });
    if (res.data && res.data.access_token) {
      currentUsername = username;
      currentPassword = password;
      currentToken = res.data.access_token;
      // Thiết lập auto-relogin mỗi 20h
      if (reLoginInterval) clearInterval(reLoginInterval);
      reLoginInterval = setInterval(async () => {
        try {
          const reRes = await axios.post(`${API_URL}/auth/login`, {
            username: currentUsername,
            password: currentPassword,
            profitX: profitAll
          });
          if (reRes.data && reRes.data.access_token) {
            currentToken = reRes.data.access_token;
            console.clear()
            console.log('✅ Auto-relogin thành công.');
          } else {
            throw new Error('No token');
          }
        } catch (e) {
          console.error('❌ Auto-relogin thất bại:', e.message);
          await handleStop();
          if (page) {
            await page.evaluate(() => {
              const startBtn = document.getElementById("start-button");
              if (startBtn) startBtn.style.display = "none";
              const loginWrap = document.getElementById("login-form-wrap");
              if (loginWrap) loginWrap.style.display = "flex";
              const errDiv = document.getElementById("login-error");
              if (errDiv) {
                errDiv.innerText = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!";
                errDiv.style.display = "block";
              }
            });
          }
        }
      }, 22 * 60 * 60 * 1000); // 20 hours
      return { success: true };
    }
    return { success: false, message: 'Không có token' };
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message };
  }
}


// Đây chỉ là nơi xác định tiêu điểm thôi k dùng lmj cả
// let startX = 708;
let startX = 455
// let startY = 519;
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

let X_cuoc100 = startX - 195; //120
let Y_cuoc100 = startY + 49; //375

// 5._______________________Nút Đặt cược_____________________
let X_Submit = startX - 180; //275
let Y_Submit = startY + 111; //437

// ========================================== Chức năng rút tiền.====================================

// 1. Click vào CryTO Hoặc Button Rút tiền (2 LẦn).
let X_ButtonRutTien = 230; //488
let Y_ButtonRutTien = 680; //326

// 2. Click vào Tab Rút  .
let X_BtnTabRut = 277; //488
let Y_BtnTabRut = 327; //326

// 3. Click vào INput Nhập Ví.
let X_InpVi = 830; //488
let Y_InpVi = 255; //326
// 4. Nhập Địa chỉ Ví 
let Diachivi = process.env.DIACHIVI;


// 5. Click vào INput Nhập Số tiền.
let X_InpNhapSoTien = 830; //488
let Y_InpNhapSoTien = 375; //326
// sài biến soTienMuonRut  thêm 3 số 0 nữa.  ví dụ 2000 thì nhập 2 000 000

// 5a Click vào nút Hủy Đặt cược cho gọn đã
let X_HuyDatCuoc = 410; //488
let Y_HuyDatCuoc = 430; //326
// 6. Click vào Tab Rút  .
let X_BtnSumitRutTien = 850; //488
let Y_BtnSumitRutTien = 460; //326

// 8. Click Tắt   .
let X_BtnCLose = 1040; //488
let Y_BtnCLose = 145; //326

// 9. Click lại Menu kết quả TX   .
// let X_MenuTX = 545; //488 chỗ mmowis , chỗ mặc định của game
// let Y_MenuTX = 400; //326
let X_MenuTX = 288; //488
let Y_MenuTX = 200; //326

let tongTienDaRut = 0;



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

const MAX_LENGTH = 1000;
const ArrayKQ = [];
const ArrayKQ_XAU = [];
let muaGiaLap = "null"

let soDuTaiKhoan = 1000;
let soDuLonNhat = 1000;
let nguongTienDat = 6000;
let soTienMuonRut = 2000;
let phanTramGiaoDich = 1;


const LuutruLongmach = [
  {
    id: 1, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Dep, isFomo: true, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 2, isNhandoi: false, hoanthanh: false, soLanChoDoi: 7, tiso: 0
  },
  {
    id: 2, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Xau, isFomo: false, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 2, isNhandoi: false, hoanthanh: false, soLanChoDoi: 7, tiso: 0
  },
  {
    id: 3, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Dep, isFomo: true, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 10, tiso: 0
  },
  {
    id: 4, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Xau, isFomo: false, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 10, tiso: 0
  },
  {
    id: 5, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Dep, isFomo: true, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 13, tiso: 0
  },
  {
    id: 6, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Xau, isFomo: false, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 13, tiso: 0
  },

  {
    id: 7, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Dep, isFomo: true, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 18, tiso: 0
  },
  {
    id: 8, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Xau, isFomo: false, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 18, tiso: 0
  },

  {
    id: 9, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Dep, isFomo: true, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 23, tiso: 0
  },
  {
    id: 10, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Xau, isFomo: false, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 23, tiso: 0
  },

  {
    id: 11, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Dep, isFomo: true, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 28, tiso: 0
  },
  {
    id: 12, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: Xau, isFomo: false, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, isNhandoi: false, hoanthanh: false, soLanChoDoi: 28, tiso: 0
  },
];

loadStateTXT();

async function UI_LockMouse(page, lock) {
  if (!page) return;
  await page.evaluate((lock) => {
    let shield = document.getElementById("ui-mouse-shield");
    if (lock) {
      if (!shield) {
        shield = document.createElement("div");
        shield.id = "ui-mouse-shield";
        Object.assign(shield.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          zIndex: "9980",
          backgroundColor: "transparent",
          pointerEvents: "auto",
          cursor: "not-allowed"
        });
        shield.oncontextmenu = (e) => e.preventDefault();
        document.body.appendChild(shield);
      }
    } else {
      if (shield) shield.remove();
    }
  }, lock);
}

async function masterClick(page, x, y) {
  await page.evaluate(() => {
    const shield = document.getElementById("ui-mouse-shield");
    if (shield) shield.style.pointerEvents = "none";
  });

  await page.mouse.click(x, y);

  await page.evaluate(() => {
    const shield = document.getElementById("ui-mouse-shield");
    if (shield) shield.style.pointerEvents = "auto";
  });
}

async function handleStart() {
  clearAllInterval();

  if (isRunning) return;

  isRunning = true;
  countdown = 70;

  await updateButton(page, "⏹ Dừng...", "#e23a10ff");
  await UI_LockMouse(page, true);

  // chạy 1 lần ngay
  await CheckColor_X_Y();

  // interval chính
  intervalId = setInterval(async () => {
    if (!isRunning) return;
    await CheckColor_X_Y();
  }, (INTERVAL_MS * 1000) - 9);

  // timer 70s
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


async function UI_Reset(page) {
  await page.evaluate(() => {
    if (document.getElementById("reset-btn")) return;

    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      position: "fixed",
      top: "500px",
      right: "5px",
      zIndex: 9999,
      background: "#fff",
      padding: "2px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "11px",
      fontFamily: "monospace",
      width: "130px",
      lineHeight: "16px"
    });

    wrap.innerHTML = `
      <div style="margin-bottom:1px">Hàng 1 ( Kết quả TX)</div>
      <input id="inp-arraykq" style="width:100px;height:18px;margin-bottom:2px"/>

      <div style="margin-bottom:1px">Hàng 2(no ❌)</div>
      <input id="inp-arraykqxau" style="width:110px;height:18px;margin-bottom:2px"/>

      <button id="reset-btn" style="
        width:100%;
        padding:2px;
        background:#dc3545;
        color:#fff;
        border:none;
        border-radius:4px;
        cursor:pointer;
        font-size:11px;
      ">🔄 Reset</button>
    `;

    document.body.appendChild(wrap);
  });

  // expose function (Node side)
  if (!page._resetExposed) {
    await page.exposeFunction("resetAll", async ({ arrKQ, arrKQXau }) => {

      if (arrKQ && arrKQ.trim() !== "") {
        ArrayKQ.length = 0;
        ArrayKQ.push(...arrKQ.split(",").map(s => s.trim()).filter(Boolean));
      }

      // luôn reset
      ArrayKQ_XAU.length = 0;
      if (arrKQXau && arrKQXau.trim() !== "") {
        ArrayKQ_XAU.push(...arrKQXau.split(",").map(s => s.trim()).filter(Boolean));
      }

      const countA = ArrayKQ_XAU.filter(v => v === Dep).length;
      const countB = ArrayKQ_XAU.filter(v => v === Xau).length;

      LuutruLongmach.forEach(item => {
        item.isReady = false;
        item.AnNumber = 0;
        item.soLanMuonAn = item.id === 1 || item.id === 2 ? 2 : 1;
        item.isNhandoi = false;
        item.hoanthanh = false;
        item.tiso = item.type === Dep ? (countB - countA) : (countA - countB);
      });

      for (const item of LuutruLongmach) {
        if (!item.isReady && item.tiso >= item.soLanChoDoi) {
          item.isReady = true;
        }
      }

      await KetquaTXList_Update_UI(page, ArrayKQ);
      await LongMachList_Update_UI(page, ArrayKQ_XAU);
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);


      saveStateTXT();
    });

    page._resetExposed = true;
  }

  // browser side: bind click + clear input cuối cùng
  await page.evaluate(() => {
    const btn = document.getElementById("reset-btn");

    if (!btn.dataset.bound) {
      btn.dataset.bound = "true";

      btn.addEventListener("click", async () => {
        const inpKQ = document.getElementById("inp-arraykq");
        const inpKQXau = document.getElementById("inp-arraykqxau");

        const arrKQ = inpKQ.value;
        const arrKQXau = inpKQXau.value;

        // ✅ đợi chạy xong toàn bộ logic backend
        await window.resetAll({ arrKQ, arrKQXau });

        // ✅ clear input SAU CÙNG (chuẩn)
        inpKQ.value = "";
        inpKQXau.value = "";
      });
    }
  });
}

// ================== MAIN – CHƯƠNG TRÌNH CHÍNH ==================
(async () => {
  const browser = await chromium.launch({ headless: false });

  // Tạo tab mới
  page = await browser.newPage();

  await page.goto(process.env.X_URL, {
    waitUntil: "networkidle",
    timeout: 15 * 60 * 1000,
  });


  await page.exposeFunction(
    "applyCaiDatVon",
    async (
      soDu,
      soDuMax,
      percent,
      nguongRut,
      soTienRut
    ) => {
      soDuTaiKhoan = soDu;
      soDuLonNhat = soDuMax;
      phanTramGiaoDich = percent;

      // ✅ GẮN VÀO BIẾN GLOBAL (KHÔNG LOGIC)
      nguongTienDat = nguongRut;
      soTienMuonRut = soTienRut;

      await UI_Show_SoDu(page, soDuTaiKhoan, profitAll);
      saveStateTXT();

      // ===== UPDATE UI =====
      await UI_Update_CaiDatVon(
        page,
        soDuTaiKhoan,
        soDuLonNhat,
        phanTramGiaoDich
      );
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);

    }
  );

  // ===== EVENT TỪ BẢNG LƯU TRỮ =====
  await page.exposeFunction("__UI_EVENT__", async ({ type, stopId, value }) => {
    if (type === "STOP_CLICK") {
      const item = LuutruLongmach.find(i => i.id === stopId);
      if (!item) return;
      handleUpdate_LongMachList(stopId, { isStop: !item.isStop });
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);
    }
    if (type === "UPDATE_SOLAN") {
      const item = LuutruLongmach.find(i => i.id === stopId);
      if (!item) return;
      handleUpdate_LongMachList(stopId, { soLanChoDoi: Number(value) });
      saveStateTXT();
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);
    }
  });

  // ===== BẮT MESSAGE TỪ UI =====
  await page.evaluate(() => {
    if (window.__UI_EVENT_BOUND__) return;
    window.__UI_EVENT_BOUND__ = true;

    window.addEventListener("message", (e) => {
      if (e.data?.type) {
        window.__UI_EVENT__(e.data);
      }
    });
  });

  // Tạo overlay nhiều điểm
  await UI_TieuDiem(page, startX, startY, width, height, "control", "#ff0000");   // đỏ
  await UI_TieuDiem(page, X_Ketqua, Y_Ketqua, width, height, "tieudiem-2", "#007bff"); // xanh dương
  await UI_TieuDiem(page, X_DatTai, Y_DatTai, width, height, "tieudiem-3", "#28a745"); // xanh lá
  await UI_TieuDiem(page, X_DatXiu, Y_DatXiu, width, height, "tieudiem-4", "#ffc107"); // vàng
  await UI_TieuDiem(page, X_cuoc1, Y_cuoc1, width, height, "tieudiem-5", "#6f42c1"); // tím
  await UI_TieuDiem(page, X_cuoc10, Y_cuoc10, width, height, "tieudiem-6", "#fd7e14"); // cam
  await UI_TieuDiem(page, X_cuoc100, Y_cuoc100, width, height, "tieudiem-7", "#2bf011"); // cam
  await UI_TieuDiem(page, X_Submit, Y_Submit, width, height, "tieudiem-8", "#e83e8c"); // hồng


  // Tạo UI tách biệt




  await UI_Btn_Show_TieuDiem(page);
  await UI_DieuKhien(page);//điều khiển 
  await UI_Start(page);//Bắt đầu

  await TableChinh_Create(page);//Bắt đầu
  await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);//Bắt đầu
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll)
  await UI_CaiDatVon(page, soDuTaiKhoan, soDuLonNhat, phanTramGiaoDich);

  async function injectMouseTracker(page) {
    for (const frame of page.frames()) {
      try {
        await frame.evaluate(() => {
          if (document.getElementById("mouse-coord-display")) return;

          const box = document.createElement("div");
          box.id = "mouse-coord-display";
          Object.assign(box.style, {
            position: "fixed",
            pointerEvents: "none",
            zIndex: 2147483647,
            background: "rgba(0,0,0,0.75)",
            color: "#00ff00",
            padding: "2px 6px",
            fontSize: "12px",
            fontFamily: "monospace",
            borderRadius: "4px",
          });
          document.body.appendChild(box);

          document.addEventListener("mousemove", (e) => {
            box.innerText = `X:${e.clientX} Y:${e.clientY}`;
            box.style.left = e.clientX + 12 + "px";
            box.style.top = e.clientY + 12 + "px";
          }, true);
        });
      } catch (e) {
        // ignore cross-origin iframe
      }
    }
  }

  // GỌI SAU page.goto
  await injectMouseTracker(page);

  await KetquaTXList_Create(page);
  await LongMachList_create(page);

  await UI_Reset(page);

  await KetquaTXList_Update_UI(page, ArrayKQ);
  await LongMachList_Update_UI(page, ArrayKQ_XAU);
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
        if (ArrayKQ.length > 100) { ArrayKQ.shift() }
        await KetquaTXList_Update_UI(page, ArrayKQ);
        ThucHienGiaoDich();
      }
    }
    countdown = 70;
  } catch (err) {
    console.error("❌ Capture error:", err);
  }
}

function handleUpdate_LongMachList(id, updates) {
  const item = LuutruLongmach.find(i => i.id === id);
  if (!item) return;
  Object.assign(item, updates);
}

async function ThucHienGiaoDich() {

  const tinHieuAI = TinHieuMuaBan(ArrayKQ);
  const resultNew = ArrayKQ.at(-1); // kết quả cuối cùng trong array

  if (resultNew === "null") { console.log("Bị vấn đề về kết quả"); return };

  if (muaGiaLap !== "null") {
    const isWin = resultNew === muaGiaLap
    if (isWin) {
      ArrayKQ_XAU.push(Xau); if (ArrayKQ_XAU.length > MAX_LENGTH) { ArrayKQ_XAU.shift() }
      LuutruLongmach.forEach(item => {
        if (item.type === Dep) item.tiso += 1;
        if (item.type === Xau) item.tiso -= 1;
      });

      LuutruLongmach.forEach(item => {
        if (item.tiso >= item.soLanChoDoi) item.isReady = true;
      });

      muaGiaLap = "null"
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);//Bắt đầu
      await LongMachList_Update_UI(page, ArrayKQ_XAU);

    } else {
      ArrayKQ_XAU.push(Dep); if (ArrayKQ_XAU.length > MAX_LENGTH) { ArrayKQ_XAU.shift() }
      LuutruLongmach.forEach(item => {
        if (item.type === Dep) item.tiso -= 1;
        if (item.type === Xau) item.tiso += 1;
      });

      LuutruLongmach.forEach(item => {
        if (item.tiso >= item.soLanChoDoi) item.isReady = true;
      });

      muaGiaLap = "null"
      await LongMachList_Update_UI(page, ArrayKQ_XAU);
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);//Bắt đầu

    }
  }
  if (muaGiaLap === "null" && tinHieuAI.huong !== "null") {
    muaGiaLap = tinHieuAI.huong
  }

  for (const item of LuutruLongmach) {
    if (!item.isReady && item.tiso >= item.soLanChoDoi) {
      item.isReady = true;
    }
  }
  await LongMachList_Update_UI(page, ArrayKQ_XAU);
  await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);//Bắt đầu

  // ========================== TP / SL ==========================
  for (const item of LuutruLongmach) {
    if (item.isTrading && item.huong) {
      const isWin = resultNew === item.huong
      if (isWin) {
        soDuTaiKhoan += (item.vol * 0.98);
        profitAll += (item.vol * 0.98);

        item.AnNumber = item.isNhandoi ? item.AnNumber + 2 : item.AnNumber + 1;
        if (item.AnNumber >= item.soLanMuonAn) {
          if (item.id === 1 || item.id === 2) {

            const countA = ArrayKQ_XAU.filter(v => v === Dep).length;
            const countB = ArrayKQ_XAU.filter(v => v === Xau).length;

            ArrayKQ_XAU.length = 0;
            const NgamThem = item.isNhandoi ? 5 : 3;

            const diff = Math.abs(countA - countB) - NgamThem;
            if (diff > 0) {
              const val = countA > countB ? Dep : Xau;
              for (let i = 0; i < diff; i++) {
                ArrayKQ_XAU.push(val);
              }
            }
            const countAA = ArrayKQ_XAU.filter(v => v === Dep).length;
            const countBB = ArrayKQ_XAU.filter(v => v === Xau).length;

            LuutruLongmach.forEach(item => {
              item.isReady = false;
              item.AnNumber = 0;
              item.soLanMuonAn = item.id === 1 || item.id === 2 ? 2 : 1;
              item.isNhandoi = false;
              item.hoanthanh = true;
              item.tiso = item.type === Dep ? (countBB - countAA) : (countAA - countBB);
            });
          } else {
            const NgamThem = item.isNhandoi ? 4 : 2;
            item.tiso = item.tiso - NgamThem
            item.isReady = false;
            item.AnNumber = 0;
            item.soLanMuonAn = 1;
            item.hoanthanh = true;
            item.isNhandoi = false;
          }

          await LongMachList_Update_UI(page, ArrayKQ_XAU);
        }
        handleUpdate_LongMachList(item.id, {
          isTrading: false,
          huong: "null",
          profit: item.profit + (item.vol * 0.98),
          win: item.win + 1,
          vol: 0,
        });
        await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);//Bắt đầu
      } else {
        soDuTaiKhoan -= item.vol;
        profitAll -= item.vol;
        item.AnNumber = item.isNhandoi ? item.AnNumber - 2 : item.AnNumber - 1;
        if (item.AnNumber <= -4 && (item.id === 1 || item.id === 2)) {
          item.isNhandoi = true;
          item.soLanMuonAn = 1;
        }

        handleUpdate_LongMachList(item.id, {
          isTrading: false,
          huong: "null",
          vol: 0,
          profit: item.profit - item.vol,
          lost: item.lost + 1,
          minAnNumber: item.AnNumber <= item.minAnNumber ? item.AnNumber : item.minAnNumber
        });
        await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);//Bắt đầu
      }
    }
  }

  if (soDuTaiKhoan > soDuLonNhat) {
    soDuLonNhat = soDuTaiKhoan
  }

  await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll)
  await UI_Update_CaiDatVon(
    page,
    soDuTaiKhoan,
    soDuLonNhat,
    phanTramGiaoDich
  );
  saveStateTXT();
  // ========================== ĐẶT LỆNH ==========================


  const arrayNew = LuutruLongmach.filter(i => i.isReady && !i.isStop);



  if (tinHieuAI.huong !== "null" && arrayNew.length > 0) {
    for (const item of LuutruLongmach) {
      if (item.hoanthanh) {
        item.hoanthanh = false;
      }
    }

    for (const item of arrayNew) {
      const isBenDep = item.type === Dep;
      const huongDanhNew = isBenDep ? (tinHieuAI.huong === T ? X : T) : tinHieuAI.huong;
      const tinhVol = handleGetTien(soDuLonNhat, item.id === 1 || item.id === 2 ? phanTramGiaoDich : phanTramGiaoDich / 4);
      const tinhVolNew = item.isNhandoi ? tinhVol * 2 : tinhVol;

      // =======================HandlClick=========================
      const isTai = huongDanhNew === T;

      await UI_MouseClick(page,
        isTai ? X_DatTai : X_DatXiu,
        isTai ? Y_DatTai : Y_DatXiu, "👈");
      await masterClick(page,
        isTai ? X_DatTai : X_DatXiu,
        isTai ? Y_DatTai : Y_DatXiu);


      await clickTheoTinhVol(page, tinhVolNew, "🎯")

      const delay = 200 + Math.floor(Math.random() * 500); // 500 → 2000
      await page.waitForTimeout(delay);

      await UI_MouseClick(page, X_Submit, Y_Submit, "✅");
      await masterClick(page, X_Submit, Y_Submit);
      // =======================End HandlClick=========================
      handleUpdate_LongMachList(item.id, {
        isTrading: true,
        huong: huongDanhNew,
        vol: tinhVolNew,
      });
      await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);
      saveStateTXT();
    }
  }

  const allNotTrading = LuutruLongmach.every(item => !item.isTrading);
  if (
    soDuTaiKhoan >= soDuLonNhat &&
    soDuTaiKhoan >= nguongTienDat &&
    tinHieuAI.huong === "null" &&
    allNotTrading
  ) {
    await UI_MouseClick(page, X_HuyDatCuoc, Y_HuyDatCuoc, "🎯");
    await masterClick(page, X_HuyDatCuoc, Y_HuyDatCuoc);


    await page.evaluate(() => {
      const btn = document.getElementById("longmach-toggle");
      if (btn && btn.innerText === "▼") btn.click();
    });

    await page.waitForTimeout(100);

    // 1. Click vào button crypto / rút tiền (2 lần)
    await UI_MouseClick(page, X_ButtonRutTien, Y_ButtonRutTien, "🎯");
    await masterClick(page, X_ButtonRutTien, Y_ButtonRutTien);
    await page.waitForTimeout(100);
    await masterClick(page, X_ButtonRutTien, Y_ButtonRutTien);



    // 2. Click tab Rút
    const delay = 1000 + Math.floor(Math.random() * 1500);
    await page.waitForTimeout(delay);
    await UI_MouseClick(page, X_BtnTabRut, Y_BtnTabRut, "🎯");
    await masterClick(page, X_BtnTabRut, Y_BtnTabRut);

    // 3. Click input ví
    const delay1 = 30 + Math.floor(Math.random() * 121);
    await page.waitForTimeout(delay1);
    await UI_MouseClick(page, X_InpVi, Y_InpVi, "🎯");
    await masterClick(page, X_InpVi, Y_InpVi);

    // 4. Nhập địa chỉ ví
    await page.keyboard.type(Diachivi, { delay: 30 });

    // 5. Click input số tiền
    await page.waitForTimeout(delay1);
    await UI_MouseClick(page, X_InpNhapSoTien, Y_InpNhapSoTien, "🎯");
    await masterClick(page, X_InpNhapSoTien, Y_InpNhapSoTien);

    // 6. Nhập số tiền rút
    await page.waitForTimeout(delay1);
    await page.keyboard.type(`${soTienMuonRut}000`, { delay: 40 });

    // 7. Submit
    const delay2 = 1000 + Math.floor(Math.random() * 1500);
    await page.waitForTimeout(delay2);
    await UI_MouseClick(page, X_BtnSumitRutTien, Y_BtnSumitRutTien, "✅");
    await masterClick(page, X_BtnSumitRutTien, Y_BtnSumitRutTien);

    // 8. Đóng rút tiền
    await page.waitForTimeout(delay2);
    await UI_MouseClick(page, X_BtnCLose, Y_BtnCLose, "🔴");
    await masterClick(page, X_BtnCLose, Y_BtnCLose);
    await page.waitForTimeout(200);
    await masterClick(page, X_BtnCLose, X_BtnCLose);
    await page.waitForTimeout(200);
    await masterClick(page, X_BtnCLose, X_BtnCLose);

    // 9. Click lại menu TX
    await page.waitForTimeout(delay2);
    await UI_MouseClick(page, X_MenuTX, Y_MenuTX, "🔴");
    await masterClick(page, X_MenuTX, Y_MenuTX);

    // Cập nhật số dư
    soDuTaiKhoan = soDuLonNhat - soTienMuonRut;
    soDuLonNhat = soDuLonNhat - soTienMuonRut;
    tongTienDaRut += soTienMuonRut;

    await UI_Show_SoDu(page, soDuTaiKhoan, profitAll);
    saveStateTXT();

    await UI_Update_CaiDatVon(
      page,
      soDuTaiKhoan,
      soDuLonNhat,
      phanTramGiaoDich
    );

    // Ghi nhận thu nhập tự động sau khi rút tiền thành công
    await ghiNhanThuNhap(soTienMuonRut);
    await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU);

  }
}
// luuTruTrangThai({
//   soDuTaiKhoan,
//   soDuLonNhat,
//   phanTramGiaoDich,
//   profitAll,
//   nguongTienDat,
//   soTienMuonRut,
//   tongTienDaRut,
//   ArrayKQ,
//   ArrayKQ_XAU,
//   LuutruLongmach
// });

async function UI_Start(page) {
  // Expose nodejs login logic
  if (!page._loginExposed) {
    await page.exposeFunction("performLoginAPI", async (username, password) => {
      return await doLoginAPI(username, password);
    });
    page._loginExposed = true;
  }
  await page.exposeFunction("toggleCapture", toggleCapture);

  // Tạo UI Login Form & Button trong browser
  await page.evaluate(() => {
    // ---- 1. Nút Bắt đầu (Ban đầu Ẩn) ----
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
      display: "none" // Ẩn đến khi login
    });
    document.body.appendChild(btn);

    // ---- 2. UI Đăng Nhập ----
    const loginWrap = document.createElement("div");
    loginWrap.id = "login-form-wrap";
    Object.assign(loginWrap.style, {
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff", padding: "20px",
      borderRadius: "8px", boxShadow: "0 0 15px rgba(0,0,0,0.5)",
      zIndex: 10000, display: "flex", flexDirection: "column",
      gap: "10px", width: "250px", fontFamily: "sans-serif"
    });

    loginWrap.innerHTML = `
      <h3 style="margin: 0 0 10px;text-align:center;">Vui lòng đăng nhập</h3>
      <input id="login-user" type="text" placeholder="Tên đăng nhập" style="padding:8px;" />
      <input id="login-pass" type="password" placeholder="Mật khẩu" style="padding:8px;" />
      <button id="login-btn-submit" style="padding:8px;background:#007bff;color:#fff;border:none;cursor:pointer;border-radius:4px;font-weight:bold;">ĐĂNG NHẬP</button>
      <div id="login-error" style="color:red;font-size:12px;text-align:center;display:none;"></div>
    `;
    document.body.appendChild(loginWrap);

    // Xử lý nút Đăng nhập
    const btnSubmit = document.getElementById("login-btn-submit");
    btnSubmit.addEventListener("click", async () => {
      const user = document.getElementById("login-user").value;
      const pass = document.getElementById("login-pass").value;
      const errDiv = document.getElementById("login-error");
      if (!user || !pass) { errDiv.innerText = "Vui lòng nhập đủ thông tin"; errDiv.style.display = "block"; return; }

      btnSubmit.innerText = "Đang đăng nhập...";
      try {
        const res = await window.performLoginAPI(user, pass);
        if (res.success) {
          alert("✅ Đăng nhập BOT thành công!");
          document.getElementById("login-form-wrap").style.display = "none";
          document.getElementById("start-button").style.display = "block";
        } else {
          errDiv.innerText = res.message || "Đăng nhập thất bại";
          errDiv.style.display = "block";
        }
      } catch (e) {
        errDiv.innerText = "Lỗi kết nối";
        errDiv.style.display = "block";
      }
      btnSubmit.innerText = "ĐĂNG NHẬP";
    });

    // Gắn sự kiện click cho button Bắt đầu
    btn.addEventListener("click", () => {
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
  await LongMachList_Update_UI(page, ArrayKQ_XAU);
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

    X_cuoc100 += dx;
    Y_cuoc100 += dy;

    X_Submit += dx;
    Y_Submit += dy;

    // console.log(`🖌 startX=${startX}, startY=${startY}`);
    await UI_TieuDiem(page, startX, startY, width, height, "control", "#ff0000");   // đỏ
    await UI_TieuDiem(page, X_Ketqua, Y_Ketqua, width, height, "tieudiem-2", "#007bff"); // xanh dương
    await UI_TieuDiem(page, X_DatTai, Y_DatTai, width, height, "tieudiem-3", "#28a745"); // xanh lá
    await UI_TieuDiem(page, X_DatXiu, Y_DatXiu, width, height, "tieudiem-4", "#ffc107"); // vàng
    await UI_TieuDiem(page, X_cuoc1, Y_cuoc1, width, height, "tieudiem-5", "#6f42c1"); // tím
    await UI_TieuDiem(page, X_cuoc10, Y_cuoc10, width, height, "tieudiem-6", "#fd7e14"); // cam
    await UI_TieuDiem(page, X_cuoc100, Y_cuoc100, width, height, "tieudiem-7", "#2bf011"); // cam
    await UI_TieuDiem(page, X_Submit, Y_Submit, width, height, "tieudiem-8", "#e83e8c"); // hồng

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

  // >= 100
  const soLan100 = Math.floor(vol / 100);
  let du = vol % 100;

  // >= 10
  const soLan10 = Math.floor(du / 10);
  const soLan1 = du % 10;

  if (soLan100 > 0) {
    await clickN(page, X_cuoc100, Y_cuoc100, soLan100, icon);
  }

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
    await masterClick(page, x, y);

    const delay = 15 + Math.floor(Math.random() * 80);
    await page.waitForTimeout(delay);
  }
}

async function UI_CaiDatVon(page, soDu, soDuMax, percent) {
  await page.evaluate(
    ({ soDu, soDuMax, percent, nguongTienDat, soTienMuonRut, tongTienDaRut }) => {
      if (document.getElementById("ui-caidat-von")) return;

      const container = document.createElement("div");
      container.id = "ui-caidat-von";
      Object.assign(container.style, {
        position: "fixed",
        top: "33px",
        right: "5px",
        width: "180px",
        backgroundColor: "#fff",
        border: "1px solid #000",
        borderRadius: "8px",
        padding: "10px 16px 14px 16px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      });

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
            style="width:100%;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px"
            value="${soDu}" />
        </div>

        <div style="margin-bottom:8px">
          Số dư lớn nhất
          <input id="inp-max" type="number"
            style="width:100%;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px"
            value="${soDuMax}" />
        </div>

        <div style="margin-bottom:5px">
          % giao dịch
          <input id="inp-percent" type="number"
            style="width:100%;padding:6px;margin-top:4px;border:0.8px solid #ccc;border-radius:5px"
            value="${percent}" />
        </div>

        <div style="margin-bottom:10px">
          💰 Tiền giao dịch:
          <span id="tien-gd" style="color:#dc3545;font-weight:bold">
            ${tienGD}
          </span>
        </div>

        <div style="margin-bottom:10px">
          💸 Rút tiền tự động
          <div style="display:flex; gap:6px; margin-top:4px">
            <input id="inp-nguong-rut" type="number"
              value="${nguongTienDat}"
              style="width:50%;padding:6px;border:0.8px solid #ccc;border-radius:5px" />
            <input id="inp-so-tien-rut" type="number"
              value="${soTienMuonRut}"
              style="width:50%;padding:6px;border:0.8px solid #ccc;border-radius:5px" />
          </div>
        </div>

        <div style="margin-bottom:10px">
          🧾 Đã rút:
          <span id="tong-da-rut" style="color:#28a745;font-weight:bold">
            ${tongTienDaRut}
          </span>
        </div>

        <button id="btn-apply"
          style="width:100%;padding:7px;background:#007bff;color:#fff;border:none;border-radius:5px;font-weight:bold">
          Cài đặt
        </button>
      `;

      const toggleBtn = document.createElement("div");
      toggleBtn.innerText = "▼";
      Object.assign(toggleBtn.style, {
        position: "fixed",
        top: "10px",
        right: "5px",
        padding: "3px 7px",
        background: "#fff",
        border: "1px solid #999",
        borderRadius: "4px",
        cursor: "pointer",
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

      document.getElementById("btn-apply").onclick = () => {
        nguongTienDat = Number(document.getElementById("inp-nguong-rut").value || nguongTienDat);
        soTienMuonRut = Number(document.getElementById("inp-so-tien-rut").value || soTienMuonRut);

        window.applyCaiDatVon(
          Number(document.getElementById("inp-sodu").value || 0),
          Number(document.getElementById("inp-max").value || 0),
          Number(document.getElementById("inp-percent").value || 0),
          nguongTienDat,
          soTienMuonRut
        );
      };
    },
    { soDu, soDuMax, percent, nguongTienDat, soTienMuonRut, tongTienDaRut }
  );
}

async function UI_Update_CaiDatVon(page, soDu, soDuMax, percent) {
  await page.evaluate(
    ({ soDu, soDuMax, percent, nguongTienDat, soTienMuonRut, tongTienDaRut }) => {
      const box = document.getElementById("ui-caidat-von");
      if (!box) return;

      document.getElementById("inp-sodu").value = soDu;
      document.getElementById("inp-max").value = soDuMax;
      document.getElementById("inp-percent").value = percent;

      document.getElementById("inp-nguong-rut").value = nguongTienDat;
      document.getElementById("inp-so-tien-rut").value = soTienMuonRut;

      const spanTien = document.getElementById("tien-gd");
      if (spanTien) {
        spanTien.innerText = percent
          ? Math.floor(soDuMax * percent / 100)
          : 0;
      }

      const spanRut = document.getElementById("tong-da-rut");
      if (spanRut) spanRut.innerText = tongTienDaRut;
    },
    {
      soDu,
      soDuMax,
      percent,
      nguongTienDat,
      soTienMuonRut,
      tongTienDaRut
    }
  );
}

function saveStateTXT() {
  try {
    let lines = [];

    lines.push(`soDuTaiKhoan=${soDuTaiKhoan}`);
    lines.push(`soDuLonNhat=${soDuLonNhat}`);
    lines.push(`phanTramGiaoDich=${phanTramGiaoDich}`);
    lines.push(`profitAll=${profitAll}`);

    // ✅ THÊM 3 PHẦN
    lines.push(`nguongTienDat=${nguongTienDat}`);
    lines.push(`soTienMuonRut=${soTienMuonRut}`);
    lines.push(`tongTienDaRut=${tongTienDaRut}`);

    lines.push("");

    lines.push(`ArrayKQ=${ArrayKQ.join(",")}`);
    lines.push(`ArrayKQ_XAU=${ArrayKQ_XAU.join(",")}`);
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

    // ✅ LOAD THÊM 3 BIẾN
    nguongTienDat = Number(getVal("nguongTienDat")) || nguongTienDat;
    soTienMuonRut = Number(getVal("soTienMuonRut")) || soTienMuonRut;
    tongTienDaRut = Number(getVal("tongTienDaRut")) || tongTienDaRut;

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
        const mappedArr = arr.map(i => ({
          ...i,
          isReady: i.isReady ?? false,
          AnNumber: i.AnNumber ?? 0,
          soLanMuonAn: i.soLanMuonAn ?? ((i.id === 1 || i.id === 2) ? 2 : 1),
          isNhandoi: i.isNhandoi ?? false,
          hoanthanh: i.hoanthanh ?? false,
          soLanChoDoi: i.soLanChoDoi ?? (i.type === "A" && i.id === 1 ? 7 : i.type === "B" && i.id === 2 ? 7 : 10)
        }));
        LuutruLongmach.push(...mappedArr);
      }
    }

  } catch (err) {
    console.error("❌ Load TXT lỗi → bỏ qua state:", err.message);
  }
}

function clearAllInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

