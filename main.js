const {
  UI_Btn_Show_TieuDiem, UI_Show_SoDu, LongMachList_Update_UI,
  KetquaTXList_Create, LongMachList_create, KetquaTXList_Update_UI,
  SignalIndicator_Create, SignalIndicator_Update
} = require("./src/Button_Common");
const { UI_TieuDiem, TableChinh_Update_UI, TableChinh_Create, UI_MouseClick, UI_ToolTitle_Create } = require("./src/UI_tieudiem");
const {
  updateButton, handleGetColor_TX, TinHieuMuaBan, T, X, Dep,
  Xau, TYPES
} = require('./src/util');

const { ghiNhanThuNhap } = require('./src/util2');
const { chromium } = require("playwright");
const path = require("path");

require('dotenv').config();

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
let totalProfitTP = 0;
let totalWinCount = 0;
let CauDepCount = 0;
let CauXauCount = 0;
let lastTinHieu = { huong: "null", type: "null" }; // dùng riêng cho UI


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
let Diachivi = "";


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
const muaGiaLapMap = {}; // { TYPE_1_1: "T", ... }

let soDuTaiKhoan = 1000;
let soDuLonNhat = 1000;
let nguongTienDat = 6000;
let soTienMuonRut = 2000;
let phanTramGiaoDich = 1;

let maxDrawdown = 0; // Tổn thất lớn nhất (%)




const LuutruLongmach = [];

// Khởi tạo các chiến thuật cho mỗi loại tín hiệu
let itemId = 1;
Object.values(TYPES).forEach(typeKey => {
  // Mỗi loại tín hiệu chỉ tạo 2 item: 1 Dep (Side A) và 1 Xau (Side B)
  [true, false].forEach(isDep => {
    // Vẫn giữ logic chặn như yêu cầu:
    // 1. TYPE_123: Chỉ giữ Dep (bỏ qua Xau)
    // 2. TYPE_1_1_PLUS: Chỉ giữ Xau (bỏ qua Dep)
    // if (typeKey === TYPES.TYPE_123 && !isDep) return;
    // if (typeKey === TYPES.TYPE_1_1_PLUS && isDep) return;

    LuutruLongmach.push({
      id: itemId++,
      isTrading: false,
      huong: "null",
      profit: 0,
      vol: 0,
      win: 0,
      lost: 0,
      isStop: false,
      type: isDep ? Dep : Xau, // Bên hiện tại (A hoặc B)
      strategyType: typeKey,    // Loại tín hiệu mà chiến lược này thuộc về
      isFomo: isDep,
      minAnNumber: 0,
      isReady: false,
      AnNumber: 0,
      soLanMuonAn: 1,
      hoanthanh: false,
      soLanChoDoi: 0,
      tiso: 0,
      phiGD: 0,
      isKhung: false
    });

    LuutruLongmach.push({
      id: itemId++,
      isTrading: false,
      huong: "null",
      profit: 0,
      vol: 0,
      win: 0,
      lost: 0,
      isStop: false,
      type: isDep ? Dep : Xau, // Bên hiện tại (A hoặc B)
      strategyType: typeKey,    // Loại tín hiệu mà chiến lược này thuộc về
      isFomo: isDep,
      minAnNumber: 0,
      isReady: false,
      AnNumber: 0,
      soLanMuonAn: 2,
      hoanthanh: false,
      soLanChoDoi: 8,
      tiso: 0,
      phiGD: 0,
      isKhung: true
    });
  });
  muaGiaLapMap[typeKey] = "null"; // Khởi tạo trạng thái giao dịch ảo cho loại này
});

loadStateTXT();

async function masterClick(page, x, y) {
  await page.mouse.click(x, y);
}


async function handleStart() {
  clearAllInterval();

  if (isRunning) return;

  isRunning = true;
  countdown = 70;

  await updateButton(page, "⏹ Dừng...", "#e23a10ff");


  // chạy 1 lần ngay
  await CheckColor_X_Y();

  // interval chính
  intervalId = setInterval(async () => {
    if (!isRunning) return;
    await CheckColor_X_Y();
  }, (INTERVAL_MS * 1000) - 10);

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

  // Đưa hàm ra ngoài (phía Node)
  if (!page._resetExposed) {
    await page.exposeFunction("resetAll", async ({ arrKQ, arrKQXau }) => {

      if (arrKQ && arrKQ.trim() !== "") {
        ArrayKQ.length = 0;
        const cleanStr = arrKQ.toUpperCase().replace(/,/g, "").trim();
        if (cleanStr !== "CC") {
          ArrayKQ.push(...cleanStr.split(""));
        }
      }

      if (arrKQXau && arrKQXau.trim() !== "") {
        ArrayKQ_XAU.length = 0;
        const cleanStrXau = arrKQXau.toUpperCase().replace(/,/g, "").trim();
        if (cleanStrXau !== "CC") {
          ArrayKQ_XAU.push(...cleanStrXau.split(""));
        }
      }

      const countA = ArrayKQ_XAU.filter(v => v === Dep).length;
      const countB = ArrayKQ_XAU.filter(v => v === Xau).length;
      if (CauDepCount === 0 && CauXauCount === 0) {
        CauDepCount = countA;
        CauXauCount = countB;
      }

      for (const item of LuutruLongmach) {
        if (!item.isReady && item.tiso >= item.soLanChoDoi) {
          item.isReady = true;
          item.hoanthanh = false;
        }
      }

      await KetquaTXList_Update_UI(page, ArrayKQ);
      await LongMachList_Update_UI(page, ArrayKQ_XAU);
      await TableChinh_Update_UI(page, LuutruLongmach);
      await UI_Show_TiSo_TX(page, CauDepCount, CauXauCount);

      saveStateTXT();
    });

    page._resetExposed = true;
  }

  // phía trình duyệt: gán sự kiện click + xóa input cuối cùng
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

// ================== ======================================================================= MAIN – CHƯƠNG TRÌNH CHÍNH ==================
(async () => {
  const browser = await chromium.launch({ headless: false });

  // Tạo tab mới
  page = await browser.newPage();

  await page.goto(process.env.X_URL, {
    waitUntil: "networkidle",
    timeout: 15 * 60 * 1000,
  });

  // =======1  //Cài đặt vốn =====
  await page.exposeFunction(
    "applyCaiDatVon",
    async (
      soDu,
      soDuMax,
      percent,
      nguongRut,
      soTienRut,
      wallet
    ) => {
      soDuTaiKhoan = soDu;
      soDuLonNhat = soDuMax;
      phanTramGiaoDich = percent;
      Diachivi = wallet;

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

  // ===== EVENT TỪ BẢNG LƯU TRỮ  Table . click stop các thứ=====
  await page.exposeFunction("__UI_EVENT__", async ({ type, stopId, value, id }) => {
    if (type === "STOP_CLICK") {
      const item = LuutruLongmach.find(i => i.id === stopId);
      if (!item) return;
      handleUpdate_LongMachList(stopId, { isStop: !item.isStop });
      await TableChinh_Update_UI(page, LuutruLongmach);
    }
    if (type === "UPDATE_SOLAN_CHODOI") {
      const item = LuutruLongmach.find(i => i.id === id);
      if (!item) return;
      handleUpdate_LongMachList(id, { soLanChoDoi: Number(value) });
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
  await SignalIndicator_Create(page);
  await UI_Show_TiSo_TX(page, CauDepCount, CauXauCount);
  await UI_Start(page);//Bắt đầu

  await UI_ToolTitle_Create(page, " Tool 2 -RảiRác-Lẻ");

  await TableChinh_Create(page);//Bắt đầu
  await TableChinh_Update_UI(page, LuutruLongmach, ArrayKQ_XAU, lastTinHieu);//Bắt đầu
  await UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown);
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
        // bỏ qua iframe khác nguồn
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

// ============================================================================== HANDLE LOGIC ===========================================
async function CheckColor_X_Y() {
  if (!isRunning) return;
  countdown = 70; // Reset timer ngay khi bắt đầu để đồng bộ

  try {
    // Chỉ chụp vùng chứa kết quả để tối ưu tốc độ (nhanh hơn chụp toàn màn hình)
    const buffer = await page.screenshot({
      clip: { x: X_Ketqua, y: startY, width: width, height: height }
    });
    const png = PNG.sync.read(buffer);

    let r = 0, g = 0, b = 0, count = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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
  lastTinHieu = tinHieuAI; // cập nhật cho UI

  const resultNew = ArrayKQ.at(-1);

  if (resultNew === "null") { console.log("Bị vấn đề về kết quả"); return };

  // 1. Xử lý kết quả cho tất cả các giao dịch ảo đang hoạt động
  let updatedAny = false;
  for (const typeKey in muaGiaLapMap) {
    const dummyHuong = muaGiaLapMap[typeKey];
    if (dummyHuong !== "null") {
      const isWin = resultNew === dummyHuong;

      if (isWin) {
        CauXauCount++;
        ArrayKQ_XAU.push(Xau);
      } else {
        CauDepCount++;
        ArrayKQ_XAU.push(Dep);
      }
      if (ArrayKQ_XAU.length > MAX_LENGTH) ArrayKQ_XAU.shift();

      // Cập nhật chiến thuật thuộc loại này
      LuutruLongmach.filter(item => item.strategyType === typeKey).forEach(item => {
        if (isWin) {
          if (item.type === Dep) item.tiso += 1;
          if (item.type === Xau) item.tiso -= 1;
          if (item.tiso <= 0 && !item.isKhung) item.tiso = 0;
        } else {
          if (item.type === Dep) item.tiso -= 1;
          if (item.type === Xau) item.tiso += 1;
          if (item.tiso <= 0 && !item.isKhung) item.tiso = 0;
        }
        if (item.tiso >= item.soLanChoDoi || item.AnNumber > 0) item.isReady = true;
        else item.isReady = false;
      });

      muaGiaLapMap[typeKey] = "null";
      updatedAny = true;
    }
  }

  // 2. Lưu tín hiệu mới (nếu có)
  if (tinHieuAI.huong !== "null" && muaGiaLapMap[tinHieuAI.type] === "null") {
    muaGiaLapMap[tinHieuAI.type] = tinHieuAI.huong;
  }



  if (updatedAny) {
    await LongMachList_Update_UI(page, ArrayKQ_XAU);
  }

  // ====================================================================================== TP / SL =======================================================================
  // 1. Tính toán volume đang trading của 2 bên trước khi cập nhật trạng thái
  const volT = LuutruLongmach.filter(item => item.isTrading && item.huong === T).reduce((acc, item) => acc + (item.vol || 0), 0);
  const volX = LuutruLongmach.filter(item => item.isTrading && item.huong === X).reduce((acc, item) => acc + (item.vol || 0), 0);

  // 2. Tính toán netChange và netFee cho tổng tài khoản thực tế
  let netChange = 0;
  let netFee = 0;
  let netVol = 0;

  if (volT > volX) {
    netVol = volT - volX;
    if (resultNew === T) {
      netChange = netVol * 0.98;
      netFee = netVol * 0.02;
    } else if (resultNew === X) {
      netChange = -netVol;
      netFee = 0;
    }
  } else if (volX > volT) {
    netVol = volX - volT;
    if (resultNew === X) {
      netChange = netVol * 0.98;
      netFee = netVol * 0.02;
    } else if (resultNew === T) {
      netChange = -netVol;
      netFee = 0;
    }
  }

  // Cập nhật số dư tài khoản thực tế và profit tổng một lần duy nhất
  soDuTaiKhoan += netChange;
  profitAll += netChange;

  // 3. Cập nhật kết quả ảo cho từng item
  for (const item of LuutruLongmach) {
    if (item.isTrading && item.huong) {
      const isWin = resultNew === item.huong;
      if (isWin) {
        // TP: Cộng lại vol đã trừ + lãi (tổng là vol * 2 * 0.98)
        const winAmount = item.vol * 0.98;

        // Phân bổ phí thực tế cho item thắng này
        let allocatedFee = 0;
        if (netFee > 0) {
          const totalWinningVol = (item.huong === T) ? volT : volX;
          if (totalWinningVol > 0) {
            allocatedFee = item.vol * (netVol / totalWinningVol) * 0.02;
          }
        }
        item.phiGD += allocatedFee;

        // Ghi nhận TP
        let baseVol = Math.floor(soDuLonNhat * (phanTramGiaoDich / 100));

        totalProfitTP += (baseVol - allocatedFee);
        totalWinCount += 1;

        item.AnNumber += 1;
        if (item.AnNumber >= item.soLanMuonAn) {
          item.AnNumber = 0;
          item.hoanthanh = true;

          if (item.isKhung) {
            let depItem = LuutruLongmach.find(i => i.isKhung && i.strategyType === item.strategyType && i.type === Dep);
            let xauItem = LuutruLongmach.find(i => i.isKhung && i.strategyType === item.strategyType && i.type === Xau);

            if (depItem && xauItem) {
              if (item.type === Dep) {
                depItem.soLanChoDoi += 5;
                xauItem.soLanChoDoi -= 5;
              } else if (item.type === Xau) {
                xauItem.soLanChoDoi += 5;
                depItem.soLanChoDoi -= 5;
              }
            }
          }
        }

        handleUpdate_LongMachList(item.id, {
          isTrading: false,
          huong: "null",
          profit: item.profit + winAmount,
          win: item.win + 1,
          vol: 0,
        });
      } else {
        // SL: Không trừ nữa vì đã trừ khi vào lệnh
        item.AnNumber -= 1;

        handleUpdate_LongMachList(item.id, {
          isTrading: false,
          huong: "null",
          vol: 0,
          lost: item.lost + 1,
          profit: item.profit - item.vol,
          minAnNumber: item.AnNumber <= item.minAnNumber ? item.AnNumber : item.minAnNumber
        });
      }
    }
  }

  // Cập nhật lại isReady sau khi đã xử lý TP/SL (để reset tiso có hiệu lực ngay)
  for (const item of LuutruLongmach) {
    if (item.tiso >= item.soLanChoDoi || item.AnNumber > 0) {
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


  // =========================================================================== ĐẶT LỆNH ================================================================

  const readyItems = LuutruLongmach.filter(i => i.isReady && !i.isStop);
  if (tinHieuAI.huong !== "null" && readyItems.length > 0) {
    const itemsForThisSignal = readyItems.filter(i => i.strategyType === tinHieuAI.type);
    if (itemsForThisSignal.length > 0) {
      // Đặt lại logic hoàn thành
      for (const item of itemsForThisSignal) {
        if (item.hoanthanh) { item.hoanthanh = false; }
      }

      // Phân loại theo hướng Tài/Xỉu
      const DepItems = itemsForThisSignal.filter(item => item.type === Dep);
      const XauItems = itemsForThisSignal.filter(item => item.type === Xau);

      const huongDanhNew_Dep = (tinHieuAI.huong === T ? X : T);
      const huongDanhNew_Xau = tinHieuAI.huong;

      let totalVol_Dep = 0;
      for (const item of DepItems) {
        let baseVol = Math.floor(soDuLonNhat * (phanTramGiaoDich / 100));
        let extraVol = Math.floor(baseVol * 1.5);
        let itemVol = 0;

        if (item.isKhung) {
          itemVol = baseVol * 6;
        } else {
          let currentTiso = safeTiso + 1;
          itemVol = (currentTiso <= 50)
            ? (currentTiso * baseVol)
            : (50 * baseVol + (currentTiso - 50) * extraVol);
        }
        item.tempVol = itemVol;
        totalVol_Dep += itemVol;
      }

      let totalVol_Xau = 0;
      for (const item of XauItems) {
        let baseVol = Math.floor(soDuLonNhat * (phanTramGiaoDich / 100));
        let extraVol = Math.floor(baseVol * 1.5);
        let itemVol = 0;
        if (item.isKhung) {
          itemVol = 50;
        } else {
          itemVol = (item.tiso <= 50)
            ? (item.tiso * baseVol)
            : (50 * baseVol + (item.tiso - 50) * extraVol);
        }
        item.tempVol = itemVol;
        totalVol_Xau += itemVol;
      }

      // Xử lý bù trừ (net volume) để vào 1 lệnh duy nhất trên sàn
      let netVol = 0;
      let finalHuongDanh = "null";

      if (totalVol_Dep > totalVol_Xau) {
        netVol = totalVol_Dep - totalVol_Xau;
        finalHuongDanh = huongDanhNew_Dep;
      } else if (totalVol_Xau > totalVol_Dep) {
        netVol = totalVol_Xau - totalVol_Dep;
        finalHuongDanh = huongDanhNew_Xau;
      }

      // if (netVol > 0 && finalHuongDanh !== "null") {
      //   // Click chọn hướng (Tài hoặc Xỉu)
      //   await UI_MouseClick(page, finalHuongDanh === T ? X_DatTai : X_DatXiu, finalHuongDanh === T ? Y_DatTai : Y_DatXiu, "👈");
      //   await masterClick(page, finalHuongDanh === T ? X_DatTai : X_DatXiu, finalHuongDanh === T ? Y_DatTai : Y_DatXiu);

      //   // Click volume (Chạy net volume)
      //   await clickTheoTinhVol(page, netVol, "🎯");

      //   const delay = 50 + Math.floor(Math.random() * 200);
      //   await page.waitForTimeout(delay);

      //   // Click Submit 1 lần duy nhất
      //   await UI_MouseClick(page, X_Submit, Y_Submit, "✅");
      //   await masterClick(page, X_Submit, Y_Submit);
      // }

      // Vẫn cập nhật trạng thái ảo cho cả 2 bên (để tính toán profit như bình thường)
      for (const item of DepItems) {
        handleUpdate_LongMachList(item.id, {
          isTrading: true,
          huong: huongDanhNew_Dep,
          vol: item.tempVol,
        });
        delete item.tempVol;
      }

      for (const item of XauItems) {
        handleUpdate_LongMachList(item.id, {
          isTrading: true,
          huong: huongDanhNew_Xau,
          vol: item.tempVol,
        });
        delete item.tempVol;
      }
    }
  }

  // Cập nhật UI sau khi đã xong phần giao dịch (TP/SL + Đặt lệnh mới)
  // Cập nhật UI chỉ báo tín hiệu
  SignalIndicator_Update(page, tinHieuAI.huong !== "null" ? [tinHieuAI] : []);
  UI_Show_SoDu(page, soDuTaiKhoan, profitAll, maxDrawdown);
  TableChinh_Update_UI(page, LuutruLongmach);
  UI_Update_CaiDatVon(page, soDuTaiKhoan, soDuLonNhat, phanTramGiaoDich);
  UI_Show_TiSo_TX(page, CauDepCount, CauXauCount);
  saveStateTXT();


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

async function UI_Start(page) {
  // Đưa logic đăng nhập của nodejs ra ngoài
  if (!page._loginExposed) {
    await page.exposeFunction("performLoginAPI", async (username, password) => {
      const res = await doLoginAPI(username, password);
      if (res.success) {
        // Tự động click vào X 670 Y 35 sau khi đăng nhập thành công
        setTimeout(async () => {
          try {
            await masterClick(page, 670, 35);

            await page.waitForTimeout(1000);
            await masterClick(page, 500, 305);
          } catch (err) {
          }
        }, 1000);
      }
      return res;
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
      top: "277px",
      left: "289px",
      zIndex: 9999,
      transform: "translateX(-50%)",
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

    // Thêm sự kiện nhấn Enter cho ô pass
    document.getElementById("login-pass").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("login-btn-submit").click();
      }
    });

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
          // alert("✅ Đăng nhập BOT thành công!");
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
  await page.evaluate(() => {
    let timerDiv = document.getElementById("timer-display");
    if (!timerDiv) {
      timerDiv = document.createElement("div");
      timerDiv.id = "timer-display";
      Object.assign(timerDiv.style, {
        position: "fixed", top: "10px", right: "42px", zIndex: 9999,
        padding: "3px 4px", backgroundColor: "#007bff", color: "#fff",
        fontSize: "14px", fontWeight: "bold", borderRadius: "5px",
      });
      document.body.appendChild(timerDiv);
    }
    timerDiv.style.display = "block";

    window.browserCountdown = 70;
    window.resetBrowserTimer = () => { window.browserCountdown = 70; };

    if (window.countdownInterval) clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(() => {
      const div = document.getElementById("timer-display");
      if (div) {
        div.innerText = window.browserCountdown;
        window.browserCountdown--;
        if (window.browserCountdown < 0) window.browserCountdown = 70;
      }
    }, 1000);
  });
}

async function toggleCapture() {
  isRunning ? await handleStop() : await handleStart();
  await LongMachList_Update_UI(page, ArrayKQ_XAU);
}

/**
 * Hiển thị tỉ số Tài/Xỉu
 */
async function UI_Show_TiSo_TX(page, depCount = 0, xauCount = 0) {
  const totalPhi = LuutruLongmach.reduce((acc, item) => acc + (item.phiGD || 0), 0);
  const totalLai = LuutruLongmach.filter(item => item.profit > 0).reduce((acc, item) => acc + item.profit, 0);
  const totalLo = LuutruLongmach.filter(item => item.profit < 0).reduce((acc, item) => acc + item.profit, 0);

  const volT = LuutruLongmach.filter(item => item.isTrading && item.huong === T).reduce((acc, item) => acc + (item.vol || 0), 0);
  const volX = LuutruLongmach.filter(item => item.isTrading && item.huong === X).reduce((acc, item) => acc + (item.vol || 0), 0);
  const totalVolUocTinh = Math.abs(volT - volX);
  const totalPhiUocTinh = totalVolUocTinh * 0.02;

  // Thống kê theo sType, gộp cả Dep và Xau vào cùng 1 đối tượng
  const typeStatsMap = {};
  LuutruLongmach.forEach(item => {
    const sType = item.strategyType || "null";
    if (!typeStatsMap[sType]) {
      typeStatsMap[sType] = {
        sType,
        depProfit: 0,
        depMinAn: 0,
        xauProfit: 0,
        xauMinAn: 0
      };
    }
    if (item.type === Dep) {
      typeStatsMap[sType].depProfit += (item.profit || 0);
      if ((item.minAnNumber || 0) < typeStatsMap[sType].depMinAn) {
        typeStatsMap[sType].depMinAn = item.minAnNumber;
      }
    } else {
      typeStatsMap[sType].xauProfit += (item.profit || 0);
      if ((item.minAnNumber || 0) < typeStatsMap[sType].xauMinAn) {
        typeStatsMap[sType].xauMinAn = item.minAnNumber;
      }
    }
  });

  const statsList = Object.values(typeStatsMap)
    .sort((a, b) => a.sType.localeCompare(b.sType, undefined, { numeric: true }));

  // Đưa hàm ra ngoài cho phía Node
  if (!page._resetTiSoExposed) {
    await page.exposeFunction("resetTiSo", async () => {
      ArrayKQ_XAU.length = 0;
      CauDepCount = 0;
      CauXauCount = 0;

      LuutruLongmach.forEach(item => {
        item.tiso = 0;
        item.isReady = false;
        // Có thể reset thêm profit/phi nếu cần, nhưng tạm thời theo yêu cầu là reset TiSo
      });

      await UI_Show_TiSo_TX(page, CauDepCount, CauXauCount);
      await LongMachList_Update_UI(page, ArrayKQ_XAU);
      await TableChinh_Update_UI(page, LuutruLongmach);
      saveStateTXT();
    });
    page._resetTiSoExposed = true;
  }

  await page.evaluate(({ depCount, xauCount, phi, lai, lo, volUT, phiUT, statsList, tpProfit, winCount }) => {
    let wrapper = document.getElementById("ui-tiso-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "ui-tiso-wrapper";
      Object.assign(wrapper.style, {
        position: "fixed",
        bottom: "10px",
        left: "460px",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
      });
      document.body.appendChild(wrapper);

      // Nút bật tắt
      const toggleBtn = document.createElement("div");
      toggleBtn.id = "ui-tiso-toggle";
      toggleBtn.innerText = "▼";
      Object.assign(toggleBtn.style, {
        fontSize: "10px",
        padding: "0px 4px",
        cursor: "pointer",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "3px",
        userSelect: "none",
        marginBottom: "2px"
      });

      let isHidden = false;
      toggleBtn.onclick = () => {
        isHidden = !isHidden;
        const box = document.getElementById("ui-tiso-tx");
        if (box) box.style.display = isHidden ? "none" : "flex";
        toggleBtn.innerText = isHidden ? "▲" : "▼";
      };
      wrapper.appendChild(toggleBtn);
    }

    let box = document.getElementById("ui-tiso-tx");
    if (!box) {
      box = document.createElement("div");
      box.id = "ui-tiso-tx";
      Object.assign(box.style, {
        background: "#fff",
        color: "#000",
        padding: "3px 6px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: "600",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        border: "1px solid #ccc",
        minWidth: "185px"
      });
      document.getElementById("ui-tiso-wrapper").appendChild(box);
    }

    const getProfitColor = (val) => {
      if (val >= 1) return "#00bb00"; // xanh lá
      if (val < 0) return "#ff0000";  // đỏ
      return "#555";                 // xám/đen cho số 0
    };

    const statsRows = statsList.map(s => `
      <tr style="font-size: 9px; line-height: 1.0;">
        <td style="text-align: left; color: #333; padding: 1px 2px; border: 1px solid #000; white-space: nowrap; width: 38px;">${s.sType}</td>
        <td style="text-align: left; color: #666; padding: 1px 2px; border: 1px solid #000; white-space: nowrap; width: 35px;"><b style="color: ${getProfitColor(s.depProfit)}">${s.depProfit.toFixed(0)}</b></td>
        <td style="text-align: left; color: #886600; padding: 1px 2px; border: 1px solid #000; white-space: nowrap; width: 25px;">${s.depMinAn}</td>
        <td style="text-align: left; color: #444; padding: 1px 2px; border: 1px solid #000; white-space: nowrap; width: 40px;"><b style="color: ${getProfitColor(s.xauProfit)}">${s.xauProfit.toFixed(0)}</b></td>
        <td style="text-align: left; color: #886600; padding: 1px 2px; border: 1px solid #000; white-space: nowrap; width: 25px;">${s.xauMinAn}</td>
      </tr>
    `).join("");

    box.innerHTML = `
      <div style="display:flex; gap:10px; border-bottom: 1px solid #eee; padding-bottom: 2px; justify-content: center; align-items: center;">
        <span style="color:#00bb00; font-size:12px; font-weight:800;">Đẹp: ${depCount}</span>
        <span style="color:#ff0000; font-size:12px; font-weight:800;">Xấu: ${xauCount}</span>
      </div>
      <div style="margin-top: 1px; border-bottom: 1px solid #eee; padding-bottom: 1px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: center;">
          <thead>
            <tr style="color: #666; border-bottom: 1px solid #f9f9f9;">
              <th style="font-weight: normal; padding: 1px;">Lãi</th>
              <th style="font-weight: normal; padding: 1px;">Lỗ</th>
              <th style="font-weight: normal; padding: 1px;">Phí</th>
              <th style="font-weight: normal; padding: 1px;">Vol</th>
              <th style="font-weight: normal; padding: 1px;">Chịu</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-weight: bold;">
              <td style="color: #00bb00;">${lai.toFixed(0)}</td>
              <td style="color: #ff0000;">${lo.toFixed(0)}</td>
              <td style="color: #886600;">${phi.toFixed(0)}</td>
              <td style="color: #333;">${volUT.toFixed(0)}</td>
              <td style="color: #886600;">${phiUT.toFixed(1)}</td>
            </tr>
            <tr style="color: #555; font-size: 9px;">
              <td colspan="2" style="color: #0066cc; font-weight: bold; padding-top: 1px;">TP: ${tpProfit.toFixed(0)}</td>
              <td colspan="3" style="color: #008800; font-weight: bold; padding-top: 1px;">Win: ${winCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="border-top: 1px solid #eee;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="font-size: 8px; color: #000; font-weight: bold;">
              <th style="text-align: left; width: 38px; border: 1px solid #000; padding: 1px;">Cầu</th>
              <th style="text-align: left; width: 35px; border: 1px solid #000; padding: 1px;">Thuận</th>
              <th style="text-align: left; width: 25px; border: 1px solid #000; padding: 1px;">Max</th>
              <th style="text-align: left; width: 40px; border: 1px solid #000; padding: 1px;">Bẻ</th>
              <th style="text-align: left; width: 25px; border: 1px solid #000; padding: 1px;">Max</th>
            </tr>
          </thead>
          <tbody>
            ${statsRows}
          </tbody>
        </table>
      </div>
    `;

  }, { depCount, xauCount, phi: totalPhi, lai: totalLai, lo: totalLo, volUT: totalVolUocTinh, phiUT: totalPhiUocTinh, statsList, tpProfit: totalProfitTP, winCount: totalWinCount });
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
    // Không await UI_MouseClick để tránh block logic vẽ hình
    UI_MouseClick(page, x, y, icon, 18, "ui-mouse-click", 100);

    await page.mouse.move(x, y);
    await masterClick(page, x, y);

    const delay = 10 + Math.floor(Math.random() * 40); // Giảm delay xuống 10-50ms
    await page.waitForTimeout(delay);
  }
}

async function UI_CaiDatVon(page, soDu, soDuMax, percent) {
  await page.evaluate(
    ({ soDu, soDuMax, percent, nguongTienDat, soTienMuonRut, tongTienDaRut, Diachivi }) => {
      if (document.getElementById("ui-caidat-von")) return;

      const container = document.createElement("div");
      container.id = "ui-caidat-von";
      Object.assign(container.style, {
        position: "fixed",
        top: "53px",
        left: "5px",
        width: "216px",
        backgroundColor: "#fff",
        border: "1px solid #000",
        borderRadius: "8px",
        padding: "10px 16px 14px 16px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 10000,
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
            step="0.01"
            value="${percent}" />
        </div>

        <div style="margin-bottom:10px">
          💰 Tiền giao dịch:
          <span id="tien-gd" style="color:#dc3545;font-weight:bold">
            ${tienGD}
          </span>
        </div>

        <div style="margin-bottom:10px">
          <div style="margin-bottom:4px">
            💸 Rút tiền, Địa chỉ ví:
            <input id="inp-wallet" type="text"
              value="${Diachivi}"
              style="width:100%;padding:4px 6px;border:0.8px solid #ccc;border-radius:5px;margin-top:2px;font-size:10px" />
          </div>
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
        top: "30px",
        left: "5px",
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
          soTienMuonRut,
          document.getElementById("inp-wallet").value || ""
        );
      };
    },
    { soDu, soDuMax, percent, nguongTienDat, soTienMuonRut, tongTienDaRut, Diachivi }
  );
}

async function UI_Update_CaiDatVon(page, soDu, soDuMax, percent) {
  await page.evaluate(
    ({ soDu, soDuMax, percent, nguongTienDat, soTienMuonRut, tongTienDaRut, Diachivi }) => {
      const box = document.getElementById("ui-caidat-von");
      if (!box) return;

      document.getElementById("inp-sodu").value = soDu;
      document.getElementById("inp-max").value = soDuMax;
      document.getElementById("inp-percent").value = percent;

      document.getElementById("inp-nguong-rut").value = nguongTienDat;
      document.getElementById("inp-so-tien-rut").value = soTienMuonRut;
      document.getElementById("inp-wallet").value = Diachivi;

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
      tongTienDaRut,
      Diachivi
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
    lines.push(`totalProfitTP=${totalProfitTP}`);
    lines.push(`totalWinCount=${totalWinCount}`);
    lines.push(`maxDrawdown=${maxDrawdown}`);



    // ✅ THÊM 3 PHẦN
    lines.push(`nguongTienDat=${nguongTienDat}`);
    lines.push(`soTienMuonRut=${soTienMuonRut}`);
    lines.push(`tongTienDaRut=${tongTienDaRut}`);

    lines.push(`CauDepCount=${CauDepCount}`);
    lines.push(`CauXauCount=${CauXauCount}`);

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

    // ===== CẶP KHÓA GIÁ TRỊ ĐƠN GIẢN =====
    const getVal = (key) => {
      const m = content.match(new RegExp(`${key}=(.*)`));
      return m ? m[1].trim() : null;
    };

    soDuTaiKhoan = Number(getVal("soDuTaiKhoan")) || soDuTaiKhoan;
    soDuLonNhat = Number(getVal("soDuLonNhat")) || soDuLonNhat;
    phanTramGiaoDich = Number(getVal("phanTramGiaoDich")) || phanTramGiaoDich;
    profitAll = Number(getVal("profitAll")) || profitAll;
    totalProfitTP = Number(getVal("totalProfitTP")) || 0;
    totalWinCount = Number(getVal("totalWinCount")) || 0;
    maxDrawdown = Number(getVal("maxDrawdown")) || 0;


    // ✅ LOAD THÊM 3 BIẾN
    nguongTienDat = Number(getVal("nguongTienDat")) || nguongTienDat;
    soTienMuonRut = Number(getVal("soTienMuonRut")) || soTienMuonRut;
    tongTienDaRut = Number(getVal("tongTienDaRut")) || tongTienDaRut;

    CauDepCount = Number(getVal("CauDepCount")) || 0;
    CauXauCount = Number(getVal("CauXauCount")) || 0;

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

    // ===== LƯU TRỮ LONG MẠCH JSON NHIỀU DÒNG =====
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
          soLanMuonAn: i.soLanMuonAn,
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

