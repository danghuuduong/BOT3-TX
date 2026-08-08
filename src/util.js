const T = "T";
const X = "X";
const Dep = "A";
const Xau = "B";

// ================= TYPES =================

const TYPES = {

  TYPE_1_1: "1-1",
  TYPE_1_1_PLUS: "1-1 Plus",


  TYPE_2_2: "2-2",
  TYPE_2_2_PLUS: "2-2 Plus",


  TYPE_3_3: "3-3",
  TYPE_3_3_PLUS: "3-3 Plus",


  TYPE_4_4: "4-4",
  TYPE_4_4_PLUS: "4-4 Plus",

  TYPE_2_1: "2-1",
  TYPE_2_1_PLUS: "2-1 Plus",

  TYPE_3_1: "3-1",
  TYPE_3_1_PLUS: "3-1 Plus",

  TYPE_4_1: "4-1",
  TYPE_4_1_PLUS: "4-1 Plus",


  TYPE_123: "123",
  TYPE_123_PLUS: "123 Plus"
};

// ================= LOCK STATE =================
const lockState = {
  [TYPES.TYPE_1_1]: false,
  [TYPES.TYPE_1_1_PLUS]: false,

  [TYPES.TYPE_2_2]: false,
  [TYPES.TYPE_2_2_PLUS]: false,


  [TYPES.TYPE_3_3]: false,
  [TYPES.TYPE_3_3_PLUS]: false,

  [TYPES.TYPE_4_4]: false,
  [TYPES.TYPE_4_4_PLUS]: false,


  [TYPES.TYPE_2_1]: false,
  [TYPES.TYPE_2_1_PLUS]: false,

  [TYPES.TYPE_3_1]: false,
  [TYPES.TYPE_3_1_PLUS]: false,

  [TYPES.TYPE_4_1]: false,
  [TYPES.TYPE_4_1_PLUS]: false,



  [TYPES.TYPE_123]: false,
  [TYPES.TYPE_123_PLUS]: false
};


// ================= HELPERS =================
function getLastTX(array, n) {
  if (!Array.isArray(array) || array.length < n) return null;
  return array.slice(-n).join("");
}


// Hàm nhận diện sớm tín hiệu Khối Chẵn (Dấu hiệu: 2 khối chẵn liên tiếp + 1 đơn bẻ)
function detectKhoiChanEarly_TX(str) {
  if (!str || str.length < 5) return null;

  let blocks = [];
  let count = 1;

  // Tách block
  for (let i = 1; i <= str.length; i++) {
    if (str[i] === str[i - 1]) {
      count++;
    } else {
      blocks.push({ char: str[i - 1], len: count });
      count = 1;
    }
  }

  if (blocks.length < 3) return null;

  // Lấy 3 block cuối
  const b3 = blocks[blocks.length - 1]; // cá bẻ
  const b2 = blocks[blocks.length - 2]; // chẵn 2
  const b1 = blocks[blocks.length - 3]; // chẵn 1

  // Điều kiện: 2 khối chẵn + 1 cá bẻ
  if (
    b1.len >= 2 &&
    b2.len >= 2 &&
    b1.char !== b2.char &&
    b3.len === 1 &&
    b3.char === b1.char
  ) {
    return {
      huong: b1.char === T ? T : X // hoặc đổi theo logic TX của bạn
    };
  }

  return null;
}

// ================= VALID STRUCTURE =================
// Hàm kiểm tra xem vẫn còn đang trong chu kỳ Khối Chẵn hay đã thoát (Exit)
function isStillInKhoiChan_TX(str) {
  if (!str || str.length < 4) return true;

  let blocks = [];
  let count = 1;

  for (let i = 1; i <= str.length; i++) {
    if (str[i] === str[i - 1]) count++;
    else {
      blocks.push({ char: str[i - 1], len: count });
      count = 1;
    }
  }

  if (blocks.length < 4) return true;

  const b1 = blocks[blocks.length - 4];
  const b2 = blocks[blocks.length - 3];
  const b3 = blocks[blocks.length - 2];
  const b4 = blocks[blocks.length - 1];

  const isExit =
    b1.len >= 2 &&
    b2.len >= 2 &&
    b3.len === 1 &&
    b4.len === 1 &&
    b3.char !== b4.char;

  return !isExit;
}

function isValid_1_1(s4) { return s4 === "TXTX" || s4 === "XTXT"; }
function isValid_2_2(s4, s5) { return s4 === "TTXX" || s4 === "XXTT" || s5 === "TTXXT" || s5 === "XXTTX"; }
function isValid_3_3(s6, s7, s8) {
  return s6 === "TTTXXX" || s6 === "XXXTTT"
    || s7 === "TTTXXXT" || s7 === "XXXTTTX"
    || s8 === "TTTXXXTT" || s8 === "XXXTTTXX";
}


function isValid_4_4(s8, s9, s10, s11) {
  return s8 === "TTTTXXXX" || s8 === "XXXXTTTT"
    || s9 === "TTTTXXXXT" || s9 === "XXXXTTTTX"
    || s10 === "TTTTXXXXTT" || s10 === "XXXXTTTTXX"
    || s11 === "TTTTXXXXTTT" || s11 === "XXXXTTTTXXX";
}


function isValid_2_1_2(s5, s6, s7) {
  return s5 === "XXTXX" || s5 === "TTXTT"
    || s6 === "XXTXXT" || s6 === "TTXTTX"
    || s7 === "XXTXXTX" || s7 === "TTXTTXT";
}

function isValid_3_1_3(s7, s8, s9, s10) {
  return s7 === "XXXTXXX" || s7 === "TTTXTTT"
    || s8 === "XXXTXXXT" || s8 === "TTTXTTTX"
    || s9 === "XXXTXXXTX" || s9 === "TTTXTTTXT"
    || s10 === "XXXTXXXTXX" || s10 === "TTTXTTTXTT";
}

function isValid_4_1_4(s9, s10, s11, s12, s13) {
  return s9 === "XXXXTXXXX" || s9 === "TTTTXTTTT"
    || s10 === "XXXXTXXXXT" || s10 === "TTTTXTTTTX"
    || s11 === "XXXXTXXXXTX" || s11 === "TTTTXTTTTXT"
    || s12 === "XXXXTXXXXTXX" || s12 === "TTTTXTTTTXTT"
    || s13 === "XXXXTXXXXTXXX" || s13 === "TTTTXTTTTXTTT";
}

function isValid_123(s6, s7) {
  return s6 === "XTTXXX" || s6 === "TXXTTT"
    || s7 === "XTTXXXT" || s7 === "TXXTTTX"
}





// ================= MAIN =================
function TinHieuMuaBan(ArrayKQ) {
  if (!Array.isArray(ArrayKQ) || ArrayKQ.length < 13) {
    return { huong: "null", type: "null" };
  }

  const s3 = getLastTX(ArrayKQ, 3);
  const s4 = getLastTX(ArrayKQ, 4);
  const s5 = getLastTX(ArrayKQ, 5);
  const s6 = getLastTX(ArrayKQ, 6);
  const s7 = getLastTX(ArrayKQ, 7);
  const s8 = getLastTX(ArrayKQ, 8);
  const s9 = getLastTX(ArrayKQ, 9);
  const s10 = getLastTX(ArrayKQ, 10);
  const s11 = getLastTX(ArrayKQ, 11);
  const s12 = getLastTX(ArrayKQ, 12);
  const s13 = getLastTX(ArrayKQ, 13);
  const sKC = ArrayKQ.slice(-25).join("");

  // ==================================================================== 1-1 =============================================
  if (lockState[TYPES.TYPE_1_1]) {
    if (!isValid_1_1(s4)) lockState[TYPES.TYPE_1_1] = false;
  } else {
    if (s4 === "XTXT" || s4 === "TXTX") {
      lockState[TYPES.TYPE_1_1] = true;
      return { huong: s4 === "XTXT" ? X : T, type: TYPES.TYPE_1_1 };
    }
  }
  // 1-1 Plus
  if (lockState[TYPES.TYPE_1_1_PLUS]) {
    if (!isValid_1_1(s4)) {
      lockState[TYPES.TYPE_1_1] = false;
      lockState[TYPES.TYPE_1_1_PLUS] = false;
    }
  } else {
    if (s5 === "TXTXT" || s5 === "XTXTX") {
      lockState[TYPES.TYPE_1_1_PLUS] = true;
      return { huong: s5 === "TXTXT" ? X : T, type: TYPES.TYPE_1_1_PLUS };
    }
  }

  // ==================================================================== 2-2 =============================================
  if (lockState[TYPES.TYPE_2_2]) {
    if (!isValid_2_2(s4, s5) && !isStillInKhoiChan_TX(sKC)) lockState[TYPES.TYPE_2_2] = false;
  } else {
    if (s5 === "TXXTT" || s5 === "XTTXX") {
      lockState[TYPES.TYPE_2_2] = true;
      return { huong: s5 === "TXXTT" ? X : T, type: TYPES.TYPE_2_2 };
    }
  }
  // 2-2 Plus
  if (lockState[TYPES.TYPE_2_2_PLUS]) {
    if (!isValid_2_2(s4, s5) && !isStillInKhoiChan_TX(sKC)) lockState[TYPES.TYPE_2_2_PLUS] = false;
  } else {
    if (s6 === "TXXTTX" || s6 === "XTTXXT") {
      lockState[TYPES.TYPE_2_2_PLUS] = true;
      return { huong: s6 === "TXXTTX" ? X : T, type: TYPES.TYPE_2_2_PLUS };
    }
  }

  // ==================================================================== 3-3 =============================================
  if (lockState[TYPES.TYPE_3_3]) {
    if (!isValid_3_3(s6, s7, s8) && !isStillInKhoiChan_TX(sKC)) lockState[TYPES.TYPE_3_3] = false;
  } else {
    if (s7 === "TXXXTTT" || s7 === "XTTTXXX") {
      lockState[TYPES.TYPE_3_3] = true;
      return { huong: s7 === "TXXXTTT" ? X : T, type: TYPES.TYPE_3_3 };
    }
  }
  // 3-3 Plus
  if (lockState[TYPES.TYPE_3_3_PLUS]) {
    if (!isValid_3_3(s6, s7, s8) && !isStillInKhoiChan_TX(sKC)) lockState[TYPES.TYPE_3_3_PLUS] = false;
  } else {
    if (s8 === "TXXXTTTX" || s8 === "XTTTXXXT") {
      lockState[TYPES.TYPE_3_3_PLUS] = true;
      return { huong: s8 === "TXXXTTTX" ? X : T, type: TYPES.TYPE_3_3_PLUS };
    }
  }

  // ==================================================================== 4-4 =============================================
  if (lockState[TYPES.TYPE_4_4]) {
    if (!isValid_4_4(s8, s9, s10, s11) && !isStillInKhoiChan_TX(sKC)) lockState[TYPES.TYPE_4_4] = false;
  } else {
    if (s9 === "TXXXXTTTT" || s9 === "XTTTTXXXX") {
      lockState[TYPES.TYPE_4_4] = true;
      return { huong: s9 === "TXXXXTTTT" ? X : T, type: TYPES.TYPE_4_4 };
    }
  }
  // ==================================================================== 4-4 4-4 Plus
  if (lockState[TYPES.TYPE_4_4_PLUS]) {
    if (!isValid_4_4(s8, s9, s10, s11) && !isStillInKhoiChan_TX(sKC)) lockState[TYPES.TYPE_4_4_PLUS] = false;
  } else {
    if (s10 === "TXXXXTTTTX" || s10 === "XTTTTXXXXT") {
      lockState[TYPES.TYPE_4_4_PLUS] = true;
      return { huong: s10 === "TXXXXTTTTX" ? X : T, type: TYPES.TYPE_4_4_PLUS };
    }
  }

  // ==================================================================== 2 _ 1 +====================================


  if (lockState[TYPES.TYPE_2_1]) {
    if (!isValid_2_1_2(s5, s6, s7)) lockState[TYPES.TYPE_2_1] = false;
  } else {
    if (s6 === "TXXTXX" || s6 === "XTTXTT") {
      lockState[TYPES.TYPE_2_1] = true;
      return { huong: s6 === "TXXTXX" ? T : X, type: TYPES.TYPE_2_1 };
    }
  }
  if (lockState[TYPES.TYPE_2_1_PLUS]) {
    if (!isValid_2_1_2(s5, s6, s7)) lockState[TYPES.TYPE_2_1_PLUS] = false;
  } else {
    if (s7 === "TXXTXXT" || s7 === "XTTXTTX") {
      lockState[TYPES.TYPE_2_1_PLUS] = true;
      return { huong: s7 === "TXXTXXT" ? X : T, type: TYPES.TYPE_2_1_PLUS };
    }
  }

  // ==================================================================== 3-1-3 =============================================
  if (lockState[TYPES.TYPE_3_1]) {
    if (!isValid_3_1_3(s7, s8, s9, s10)) lockState[TYPES.TYPE_3_1] = false;
  } else {
    if (s8 === "TXXXTXXX" || s8 === "XTTTXTTT") {
      lockState[TYPES.TYPE_3_1] = true;
      return { huong: s8 === "TXXXTXXX" ? T : X, type: TYPES.TYPE_3_1 };
    }
  }
  if (lockState[TYPES.TYPE_3_1_PLUS]) {
    if (!isValid_3_1_3(s7, s8, s9, s10)) lockState[TYPES.TYPE_3_1_PLUS] = false;
  } else {
    if (s9 === "TXXXTXXXT" || s9 === "XTTTXTTTX") {
      lockState[TYPES.TYPE_3_1_PLUS] = true;
      return { huong: s9 === "TXXXTXXXT" ? X : T, type: TYPES.TYPE_3_1_PLUS };
    }
  }

  // ==================================================================== 4-1-4 =============================================
  if (lockState[TYPES.TYPE_4_1]) {
    if (!isValid_4_1_4(s9, s10, s11, s12, s13)) lockState[TYPES.TYPE_4_1] = false;
  } else {
    if (s10 === "TXXXXTXXXX" || s10 === "XTTTTXTTTT") {
      lockState[TYPES.TYPE_4_1] = true;
      return { huong: s10 === "TXXXXTXXXX" ? T : X, type: TYPES.TYPE_4_1 };
    }
  }
  if (lockState[TYPES.TYPE_4_1_PLUS]) {
    if (!isValid_4_1_4(s9, s10, s11, s12, s13)) lockState[TYPES.TYPE_4_1_PLUS] = false;
  } else {
    if (s11 === "TXXXXTXXXXT" || s11 === "XTTTTXTTTTX") {
      lockState[TYPES.TYPE_4_1_PLUS] = true;
      return { huong: s11 === "TXXXXTXXXXT" ? X : T, type: TYPES.TYPE_4_1_PLUS };
    }
  }

  // ==================================================================== 123 =============================================
  if (lockState[TYPES.TYPE_123]) {
    if (!isValid_123(s6, s7)) lockState[TYPES.TYPE_123] = false;
  } else {
    if (s7 === "TXTTXXX" || s7 === "XTXXTTT") {
      lockState[TYPES.TYPE_123] = true;
      return { huong: s7 === "TXTTXXX" ? T : X, type: TYPES.TYPE_123 };
    }
  }
  if (lockState[TYPES.TYPE_123_PLUS]) {
    if (!isValid_123(s6, s7)) lockState[TYPES.TYPE_123_PLUS] = false;
  } else {
    if (s8 === "TXTTXXXT" || s8 === "XTXXTTTX") {
      lockState[TYPES.TYPE_123_PLUS] = true;
      return { huong: s8 === "TXTTXXXT" ? T : X, type: TYPES.TYPE_123_PLUS };
    }
  }
  // ==================================================================== KHOI CHAN =============================================

  return { huong: "null", type: "null" };
}

// ================= UI =================
async function updateButton(page, text, color) {
  await page.evaluate(
    ({ text, color }) => {
      const btn = document.getElementById("start-button");
      btn.innerText = text;
      btn.style.backgroundColor = color;
    },
    { text, color }
  );
}

// ================= COLOR =================
function handleGetColor_TX(r, g, b) {
  const avg = (r + g + b) / (3 * 255);
  if (avg > 0.85) return "white";
  if (avg < 0.2) return "black";
  return "null";
}


// function handleGetColor_TX(r, g, b) {
//   return Math.random() < 0.5 ? "white" : "black";
// }

const defaultTangs = () => [
  { index: 1, baseVol: 1, isOpen: false, profitOfTang: 0, isTia: false },
  { index: 2, baseVol: 1.2, isOpen: false, profitOfTang: 0, isTia: false },
  { index: 3, baseVol: 3.5, isOpen: false, profitOfTang: 0, isTia: false },
  { index: 4, baseVol: 4.3, isOpen: false, profitOfTang: 0, isTia: false },
  { index: 5, baseVol: 6, isOpen: false, profitOfTang: 0, isTia: false }
];

const defaultItem = {
  isTrading: false,
  huong: "null",
  profit: 0,
  vol: 0,
  win: 0,
  lost: 0,
  isStop: false,
  isFomo: true,
  minAnNumber: 0,
  isReady: false,
  hoanthanh: false,
  Ngam: 2,
  countNgam: 0,
  phiGD: 0,
  soLanChoDoi: 0,
  chay: 0,
  maxAm: 0,
  isTienReal: false,
  // isChanVaoLenh: false,
  // lockType: null,
  profitMongMuon: 3,
  soLanThuaReal: 0,
  // vợ: 3,
  isTiaLenh: false,
  realizedProfit: 0,
  maxTang: 1,
  VanTruoc: "null",
};


// ================= EXPORT =================
module.exports = {
  TinHieuMuaBan,
  updateButton,
  handleGetColor_TX,
  TYPES,
  T,
  X,
  Dep,
  Xau,
  defaultItem,
  defaultTangs,
};
