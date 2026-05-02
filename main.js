const { UI_Btn_Show_TieuDiem, UI_Show_SoDu, KetquaTXList_Create, LongMachList_create, KetquaTXList_Update_UI } = require("./src/Button_Common");
const { UI_TieuDiem, TableChinh_Update_UI, TableChinh_Create, UI_MouseClick } = require("./src/UI_tieudiem");
const {
  updateButton, handleGetColor_TX, TinHieuMuaBan, T, X, Dep,
  Xau,
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
let taiCount = 0;
let xiuCount = 0;

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
let muaGiaLap = "null"

let soDuTaiKhoan = 1000;
let soDuLonNhat = 1000;
let maxDrawdown = 0; // Tổn thất lớn nhất (%)
let nguongTienDat = 6000;
let soTienMuonRut = 2000;
let phanTramGiaoDich = 0.05;


const LuutruLongmach = [];
for (let i = 1; i <= 200; i++) {
  LuutruLongmach.push({
    id: i, isTrading: false, huong: "null", profit: 0, vol: 0, win: 0, lost: 0,
    isStop: false, type: (i % 2 !== 0) ? T : X, minAnNumber: 0,
    isReady: false, AnNumber: 0, soLanMuonAn: 1, hoanthanh: false, soLanChoDoi: Math.ceil(i / 2), tiso: 0,
    phiGD: 0
  });
}


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

async function toggleCapture() {
  if (isRunning) {
    await handleStop();
  } else {
    await handleStart();
  }
}

async function UI_Reset(page) {
  await page.evaluate(() => {
    if (document.getElementById("reset-btn")) return;

    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      position: "fixed",
      top: "500px",
      right: "15px",
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
      <div style="margin-bottom:1px">Tài:</div>
      <input id="inp-tai" type="number" style="width:100px;height:18px;margin-bottom:2px"/>

      <div style="margin-bottom:1px">Xỉu:</div>
      <input id="inp-xiu" type="number" style="width:110px;height:18px;margin-bottom:2px"/>

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
    await page.exposeFunction("resetAll", async ({ valTai, valXiu }) => {

      let scoreTai = parseInt(valTai) || 0;
      let scoreXiu = parseInt(valXiu) || 0;

      let disadvantageType = null;
      let difference = Math.abs(scoreTai - scoreXiu);

      if (scoreTai > scoreXiu) {
        disadvantageType = X; // Xỉu đang thất thế
      } else if (scoreXiu > scoreTai) {
        disadvantageType = T; // Tài đang thất thế
      }

      LuutruLongmach.forEach(item => {
        item.isReady = false;
        item.AnNumber = 0;
        item.soLanMuonAn = 1;
        item.hoanthanh = false;
        item.tiso = 0;
        item.isTrading = false;

        if (disadvantageType !== null) {
          if (item.type === disadvantageType) {
            item.tiso = difference;
            if (item.tiso >= item.soLanChoDoi) {
              item.isReady = true; // Kích hoạt nếu đạt đủ số lần chờ
            }
          } else if (item.type === (disadvantageType === T ? X : T)) {
            item.tiso = -difference; // Bên chiếm ưu thế sẽ bị trừ tỉ số
          }
        }
      });

      taiCount = scoreTai;
      xiuCount = scoreXiu;
      await UI_Show_TiSo_TX(page, taiCount, xiuCount);

      await TableChinh_Update_UI(page, LuutruLongmach);

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
        const inpTai = document.getElementById("inp-tai");
        const inpXiu = document.getElementById("inp-xiu");

        const valTai = inpTai.value;
        const valXiu = inpXiu.value;

        // ✅ đợi chạy xong toàn bộ logic backend
        await window.resetAll({ valTai, valXiu });

        // ✅ clear input SAU CÙNG (chuẩn)
        inpTai.value = "";
        inpXiu.value = "";
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
      phanTramGiaoDich = percent > 1 ? 1 : percent;

      // ✅ GẮN VÀO BIẾN GLOBAL (KHÔNG LOGIC)
      nguongTienDat = nguongRut;
      soTienMuonRut = soTienRut;

      await UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown);
      saveStateTXT();

      // ===== UPDATE UI =====
      await UI_Update_CaiDatVon(
        page,
        soDuTaiKhoan,
        soDuLonNhat,
        phanTramGiaoDich
      );
      await TableChinh_Update_UI(page, LuutruLongmach);

    }
  );

  // ===== EVENT TỪ BẢNG LƯU TRỮ =====
  await page.exposeFunction("__UI_EVENT__", async ({ type, stopId, value }) => {
    if (type === "STOP_CLICK") {
      const item = LuutruLongmach.find(i => i.id === stopId);
      if (!item) return;
      handleUpdate_LongMachList(stopId, { isStop: !item.isStop });
      await TableChinh_Update_UI(page, LuutruLongmach);
    }
    if (type === "UPDATE_SOLAN") {
      const item = LuutruLongmach.find(i => i.id === stopId);
      if (!item) return;
      handleUpdate_LongMachList(stopId, { soLanChoDoi: Number(value) });
      saveStateTXT();
      await TableChinh_Update_UI(page, LuutruLongmach);
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
  await UI_Show_TiSo_TX(page, taiCount, xiuCount);
  await UI_Start(page);//Bắt đầu

  await TableChinh_Create(page);//Bắt đầu
  await TableChinh_Update_UI(page, LuutruLongmach);//Bắt đầu
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown)
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
        await ThucHienGiaoDich();
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

  // Cập nhật tiso dựa trên resultNew
  if (resultNew === T) {
    taiCount++;
    LuutruLongmach.forEach(item => {
      if (item.type === X) item.tiso += 1;
      if (item.type === T) item.tiso -= 1;
    });
  } else if (resultNew === X) {
    xiuCount++;
    LuutruLongmach.forEach(item => {
      if (item.type === T) item.tiso += 1;
      if (item.type === X) item.tiso -= 1;
    });
  }

  await TableChinh_Update_UI(page, LuutruLongmach);//Bắt đầu

  // ======================================================================= TP / SL =======================================================================
  for (const item of LuutruLongmach) {
    if (item.isTrading && item.huong) {
      const isWin = resultNew === item.huong
      if (isWin) {
        // TP: Cộng lại vol đã trừ + lãi (tổng là vol * 2 * 0.98)
        const winAmount = item.vol * 2 * 0.99;
        const feeAmount = item.vol * 2 * 0.01;

        soDuTaiKhoan += winAmount;
        profitAll += winAmount;
        item.phiGD += feeAmount;

        item.AnNumber += 1;
        if (item.AnNumber >= item.soLanMuonAn) {
          item.AnNumber = 0;
          item.hoanthanh = true;
        }
        handleUpdate_LongMachList(item.id, {
          isTrading: false,
          huong: "null",
          profit: item.profit + winAmount,
          win: item.win + 1,
          vol: 0,
          phiGD: item.phiGD
        });
        await TableChinh_Update_UI(page, LuutruLongmach);
      } else {
        // SL: Không trừ nữa vì đã trừ khi vào lệnh
        item.AnNumber -= 1;

        handleUpdate_LongMachList(item.id, {
          isTrading: false,
          huong: "null",
          vol: 0,
          // profit: item.profit - item.vol, // Đã trừ khi vào lệnh
          lost: item.lost + 1,
          minAnNumber: item.AnNumber <= item.minAnNumber ? item.AnNumber : item.minAnNumber
        });
        await TableChinh_Update_UI(page, LuutruLongmach);
      }
    }
  }

  await UI_Show_TiSo_TX(page, taiCount, xiuCount);

  // Cập nhật lại isReady sau khi đã xử lý TP/SL (để reset tiso có hiệu lực ngay)
  for (const item of LuutruLongmach) {
    if (item.tiso >= item.soLanChoDoi) {
      item.isReady = true;
    } else {
      item.isReady = false;
    }
  }

  // Tính Drawdown (chỉ tính khi số dư hiện tại thấp hơn đỉnh)
  if (soDuTaiKhoan > soDuLonNhat) {
    soDuLonNhat = soDuTaiKhoan;
  } else if (soDuLonNhat > 0) {
    const currentDrawdown = ((soDuLonNhat - soDuTaiKhoan) / soDuLonNhat) * 100;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
  }

  await TableChinh_Update_UI(page, LuutruLongmach);
  await UI_Show_TiSo_TX(page, taiCount, xiuCount);
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown)
  await UI_Update_CaiDatVon(
    page,
    soDuTaiKhoan,
    soDuLonNhat,
    phanTramGiaoDich
  );
  saveStateTXT();
  // =========================================================================== ĐẶT LỆNH ================================================================

  const arrayNew = LuutruLongmach.filter(i => i.isReady && !i.isStop);

  if (arrayNew.length > 0) {
    // 1. Reset hoanthanh logic
    for (const item of arrayNew) {
      if (item.hoanthanh) {
        if (item.id === 1 || item.id === 2) {
          for (const itm of LuutruLongmach) {
            itm.hoanthanh = false;
          }
          break; // Đã reset toàn bộ thì thoát loop
        } else {
          item.hoanthanh = false;
        }
      }
    }

    // 2. Phân loại theo hướng Tài/Xỉu
    const taiItems = arrayNew.filter(item => item.type === T);
    const xiuItems = arrayNew.filter(item => item.type === X);

    const processBatch = async (items, isTai) => {
      if (items.length === 0) return;

      // Click chọn hướng (Tài hoặc Xỉu)
      await UI_MouseClick(page,
        isTai ? X_DatTai : X_DatXiu,
        isTai ? Y_DatTai : Y_DatXiu, "👈");
      await masterClick(page,
        isTai ? X_DatTai : X_DatXiu,
        isTai ? Y_DatTai : Y_DatXiu);

      // Tính tổng Volume và gán cho từng item
      let totalVol = 0;
      for (const item of items) {
        const group = Math.ceil(item.id / 10);
        const baseVol = handleGetTien(soDuLonNhat, phanTramGiaoDich);
        const itemVol = Math.floor(baseVol * (1 + (group - 1) * 0.25));
        item.tempVol = itemVol; // Lưu tạm volume để update state sau batch submit
        totalVol += itemVol;
      }

      // Click volume (Chạy đồng loạt cho tổng volume của cả nhóm)
      await clickTheoTinhVol(page, totalVol, "🎯");

      const delay = 50 + Math.floor(Math.random() * 200);
      await page.waitForTimeout(delay);

      // Click Submit 1 lần duy nhất cho cả batch
      await UI_MouseClick(page, X_Submit, Y_Submit, "✅");
      await masterClick(page, X_Submit, Y_Submit);

      // Trừ luôn số dư và lợi nhuận khi vào lệnh
      soDuTaiKhoan -= totalVol;
      profitAll -= totalVol;

      // Cập nhật trạng thái giao dịch cho từng item trong nhóm
      for (const item of items) {
        handleUpdate_LongMachList(item.id, {
          isTrading: true,
          huong: item.type,
          vol: item.tempVol,
          profit: item.profit - item.tempVol // Trừ luôn vào profit của từng item
        });
        delete item.tempVol;
      }

      // Cập nhật UI ngay lập tức
      await UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown);
      await TableChinh_Update_UI(page, LuutruLongmach);
    };

    // Thực hiện đặt cược cho nhóm Tài và nhóm Xỉu
    await processBatch(taiItems, true);
    await processBatch(xiuItems, false);

    await TableChinh_Update_UI(page, LuutruLongmach);
    await UI_Show_TiSo_TX(page, taiCount, xiuCount);
    saveStateTXT();
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

    await page.waitForTimeout(10);

    // 1. Click vào button crypto / rút tiền (2 lần)
    await UI_MouseClick(page, X_ButtonRutTien, Y_ButtonRutTien, "🎯");
    await masterClick(page, X_ButtonRutTien, Y_ButtonRutTien);
    await page.waitForTimeout(10);
    await masterClick(page, X_ButtonRutTien, Y_ButtonRutTien);



    // 2. Click tab Rút
    const delay = 300 + Math.floor(Math.random() * 500);
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

    await UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown);
    saveStateTXT();

    await UI_Update_CaiDatVon(
      page,
      soDuTaiKhoan,
      soDuLonNhat,
      phanTramGiaoDich
    );

    // Ghi nhận thu nhập tự động sau khi rút tiền thành công
    await ghiNhanThuNhap(soTienMuonRut);
    await TableChinh_Update_UI(page, LuutruLongmach);

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
//   ArrayKQ,
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

    // Đếm ngược 70s
    countdown--;
    if (countdown < 0) {
      countdown = 70;
    }

    await page.evaluate((c) => {
      const timerDiv = document.getElementById("timer-display");
      if (timerDiv) {
        timerDiv.innerText = c;
        timerDiv.style.display = "block";
      }
    }, countdown);
  }, 1000);
}

/**
 * Hiển thị tỉ số Tài/Xỉu
 */
async function UI_Show_TiSo_TX(page, t = 0, x = 0) {
  const totalPhi = LuutruLongmach.reduce((acc, item) => acc + (item.phiGD || 0), 0);
  const totalLai = LuutruLongmach.filter(item => item.profit > 0).reduce((acc, item) => acc + item.profit, 0);
  const totalLo = LuutruLongmach.filter(item => item.profit < 0).reduce((acc, item) => acc + item.profit, 0);

  const totalVolUocTinh = LuutruLongmach.filter(item => item.isTrading).reduce((acc, item) => acc + (item.vol || 0), 0);
  const totalPhiUocTinh = totalVolUocTinh * 0.02;

  await page.evaluate(({ tai, xiu, phi, lai, lo, volUT, phiUT }) => {
    let box = document.getElementById("ui-tiso-tx");
    if (!box) {
      box = document.createElement("div");
      box.id = "ui-tiso-tx";
      Object.assign(box.style, {
        position: "fixed",
        bottom: "10px",
        left: "10px",
        zIndex: 10000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600",
        pointerEvents: "none",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      });
      document.body.appendChild(box);
    }
    box.innerHTML = `
      <div style="display:flex; gap:15px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">
        <span style="color:#ff4d4d; font-size:18px; font-weight:800;">⚫: ${tai}</span>
        <span style="color:#4da6ff; font-size:18px; font-weight:800;">⚪: ${xiu}</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:2px; padding-top: 2px;">
        <div style="display:flex; justify-content: space-between; gap: 10px;">
          <span style="color:#ccc">Tổng Phí:</span>
          <span style="color:#ffcc00">${phi.toFixed(1)}</span>
        </div>
        <div style="display:flex; justify-content: space-between; gap: 10px;">
          <span style="color:#ccc">Item Lãi:</span>
          <span style="color:#00ff00">${lai.toFixed(1)}</span>
        </div>
        <div style="display:flex; justify-content: space-between; gap: 10px;">
          <span style="color:#ccc">Item Lỗ:</span>
          <span style="color:#ff4d4d">${lo.toFixed(1)}</span>
        </div>
        <div style="display:flex; justify-content: space-between; gap: 10px; border-top: 1px dashed rgba(255,255,255,0.2); margin-top: 2px; padding-top: 2px;">
          <span style="color:#ccc">Vol đánh :</span>
          <span style="color:#fff">${volUT.toFixed(1)}</span>
        </div>
        <div style="display:flex; justify-content: space-between; gap: 10px;">
          <span style="color:#ccc">Phí chịu:</span>
          <span style="color:#ffcc00">${phiUT.toFixed(2)}</span>
        </div>
      </div>
    `;
  }, { tai: t, xiu: x, phi: totalPhi, lai: totalLai, lo: totalLo, volUT: totalVolUocTinh, phiUT: totalPhiUocTinh });
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
    await UI_MouseClick(page, x, y, icon, 18, "ui-mouse-click", 100);

    await page.mouse.move(x, y);
    await masterClick(page, x, y);

    const delay = 30 + Math.floor(Math.random() * 100);
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
        let pVal = Number(document.getElementById("inp-percent").value || 0);
        if (pVal > 1) {
          pVal = 1;
          document.getElementById("inp-percent").value = 1;
        }

        nguongTienDat = Number(document.getElementById("inp-nguong-rut").value || nguongTienDat);
        soTienMuonRut = Number(document.getElementById("inp-so-tien-rut").value || soTienMuonRut);

        window.applyCaiDatVon(
          Number(document.getElementById("inp-sodu").value || 0),
          Number(document.getElementById("inp-max").value || 0),
          pVal,
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
    lines.push(`maxDrawdown=${maxDrawdown}`);
    lines.push(`taiCount=${taiCount}`);
    lines.push(`xiuCount=${xiuCount}`);

    lines.push("");

    lines.push(`ArrayKQ=${ArrayKQ.join(",")}`);
    lines.push(`ArrayKQ=${ArrayKQ.join(",")}`);
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
    maxDrawdown = Number(getVal("maxDrawdown")) || maxDrawdown;
    taiCount = Number(getVal("taiCount")) || 0;
    xiuCount = Number(getVal("xiuCount")) || 0;

    const arrKQ = getVal("ArrayKQ");
    if (arrKQ) {
      ArrayKQ.length = 0;
      ArrayKQ.push(...arrKQ.split(","));
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
          phiGD: i.phiGD ?? 0,

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

