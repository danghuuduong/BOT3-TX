const T = "T";
const X = "X";

// ================= TYPES =================
const TYPES = {
  TYPE_1_1: "1-1",
  TYPE_1_1_PLUS: "1-1 Plus",
  TYPE_1_1_FOMO: "1-1-Fomo",
  TYPE_1_1_PLUS_FOMO: "1-1-Plus-Fomo",

  TYPE_2_2: "2-2",
  TYPE_2_2_PLUS: "2-2 Plus",
  TYPE_2_2_FOMO: "2-2-Fomo",
  TYPE_2_2_PLUS_FOMO: "2-2-Plus-Fomo",

  TYPE_3_3: "3-3",
  TYPE_3_3_PLUS: "3-3 Plus",
  TYPE_3_3_FOMO: "3-3-Fomo",
  TYPE_3_3_PLUS_FOMO: "3-3-Plus-Fomo",
};

// ================= LOCK STATE =================
const lockState = {
  "1-1": false,
  "1-1Plus": false,
  "2-2": false,
  "3-3": false,
};

// ================= HELPERS =================
function getLastTX(array, n) {
  if (!Array.isArray(array) || array.length < n) return null;
  return array.slice(-n).join("");
}

// ================= VALID STRUCTURE =================
function isValid_1_1(s4) { return s4 === "TXTX" || s4 === "XTXT"; }
function isValid_1_1Plus(s4) { return s4 === "TXTXT" || s4 === "XTXTX"; }
function isValid_2_2(s4) { return s4 === "TTXX" || s4 === "XXTT"; }
function isValid_3_3(s6) { return s6 === "TTTXXX" || s6 === "XXXTTT"; }

// ================= MAIN =================
function TinHieuMuaBan(ArrayKQ) {
  if (!Array.isArray(ArrayKQ) || ArrayKQ.length < 9) {
    return { huong: "null", type: "null" };
  }

  const s4 = getLastTX(ArrayKQ, 4);
  const s5 = getLastTX(ArrayKQ, 5);
  const s6 = getLastTX(ArrayKQ, 6);
  const s7 = getLastTX(ArrayKQ, 7);
  const s8 = getLastTX(ArrayKQ, 8);
  const s9 = getLastTX(ArrayKQ, 9);

  // ================= RESET LOCK (tách riêng – KHÔNG else) =================
  //  Đang mở khóa oder.
  // nếu dell phải 1 1 thì reset . nhưng trong trường hợp này là phải . nên k rơi vào false để reset đuâ. đi xuống dưới
  if (!isValid_1_1(s4)) lockState["1-1"] = false;
  if (!isValid_1_1Plus(s5)) lockState["1-1Plus"] = false;

  if (!isValid_2_2(s4)) lockState["2-2"] = false;
  if (!isValid_3_3(s6)) lockState["3-3"] = false;
  // nếu 1-1 oke thì xuống.  mà k oke thì xử lý trên bằng không khóa ữa false.
  // ================= 1-1 =================
  if (lockState["1-1"]) {
    if (!isValid_1_1(s4)) lockState["1-1"] = false;
  } else {
    if (s4 === "XTXT" || s4 === "TXTX") {
      lockState["1-1"] = true;
      return {
        huong: s4 === "XTXT" ? T : X,
        type: TYPES.TYPE_1_1
      };
    }
  }
  // ================================================

  if (lockState["1-1Plus"]) {
    if (!isValid_1_1(s4)) {
      lockState["1-1"] = false
      lockState["1-1Plus"] = false
    };
  } else {
    if (s5 === "TXTXT" || s5 === "XTXTX") {
      lockState["1-1Plus"] = true;
      return {
        huong: s5 === "TXTXT" ? T : X,
        type: TYPES.TYPE_1_1_PLUS
      };
    }
  }

  // ================= 2-2 =================
  if (!lockState["2-2"]) {
    if (s6 === "XTXXTT") {
      lockState["2-2"] = true;
      return { huong: T, type: TYPES.TYPE_2_2 };
    }
    if (s6 === "TXTTXX") {
      lockState["2-2"] = true;
      return { huong: X, type: TYPES.TYPE_2_2 };
    }
    if (s7 === "XTXXTTX") {
      lockState["2-2"] = true;
      return { huong: T, type: TYPES.TYPE_2_2_PLUS };
    }
    if (s7 === "TXTTXXT") {
      lockState["2-2"] = true;
      return { huong: X, type: TYPES.TYPE_2_2_PLUS };
    }
  }

  // ================= 3-3 =================
  if (!lockState["3-3"]) {
    if (s8 === "XTXXXTTT") {
      lockState["3-3"] = true;
      return { huong: T, type: TYPES.TYPE_3_3 };
    }
    if (s8 === "TXTTTXXX") {
      lockState["3-3"] = true;
      return { huong: X, type: TYPES.TYPE_3_3 };
    }
    if (s9 === "XTXXXTTTX") {
      lockState["3-3"] = true;
      return { huong: T, type: TYPES.TYPE_3_3_PLUS };
    }
    if (s9 === "TXTTTXXXT") {
      lockState["3-3"] = true;
      return { huong: X, type: TYPES.TYPE_3_3_PLUS };
    }
  }

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

// ================= EXPORT =================
module.exports = {
  TinHieuMuaBan,
  updateButton,
  handleGetColor_TX,
  TYPES,
  T,
  X,
};









/*

const T = "T"
const X = "X"
// ============= Cầu 1 - 1 ==================
const TYPES = {
  TYPE_1_1: "1-1",
  TYPE_1_1_PLUS: "1-1 Plus",
  TYPE_1_1_FOMO: "1-1-Fomo",
  TYPE_1_1_PLUS_FOMO: "1-1-Plus-Fomo",

  TYPE_2_2: "2-2",
  TYPE_2_2_PLUS: "2-2 Plus",
  TYPE_2_2_FOMO: "2-2-Fomo",
  TYPE_2_2_PLUS_FOMO: "2-2-Plus-Fomo",

  TYPE_3_3: "3-3",
  TYPE_3_3_PLUS: "3-3 Plus",
  TYPE_3_3_FOMO: "3-3-Fomo",
  TYPE_3_3_PLUS_FOMO: "3-3-Plus-Fomo",

  TYPE_2_1: "2-1",
  TYPE_2_1_PLUS: "2-1 Plus",
  TYPE_2_1_FOMO: "2-1-Fomo",
  TYPE_2_1_PLUS_FOMO: "2-1-Plus-Fomo",

  TYPE_3_1: "3-1",
  TYPE_3_1_PLUS: "3-1 Plus",
  TYPE_3_1_FOMO: "3-1-Fomo",
  TYPE_3_1_PLUS_FOMO: "3-1-Plus-Fomo",

  TYPE_123: "123",
  TYPE_123_PLUS: "123 Plus",
  TYPE_123_FOMO: "123-Fomo",
  TYPE_123_PLUS_FOMO: "123-Plus-Fomo",
};


function TinHieuMuaBan(ArrayKQ) {
  const length = ArrayKQ.length;
  if (ArrayKQ.length > 13) {
    const a9 = ArrayKQ[length - 9];
    const a8 = ArrayKQ[length - 8];
    const a7 = ArrayKQ[length - 7];
    const a6 = ArrayKQ[length - 6];
    const a5 = ArrayKQ[length - 5];
    const a4 = ArrayKQ[length - 4];
    const a3 = ArrayKQ[length - 3];
    const a2 = ArrayKQ[length - 2];
    const a1 = ArrayKQ[length - 1];

    // =========================================================1-1 CẢN TÀU========================
    if (a4 === X && a3 === T && a2 === X && a1 === T) { return { huong: T, type: TYPES.TYPE_1_1 } };
    if (a4 === T && a3 === X && a2 === T && a1 === X) { return { huong: X, type: TYPES.TYPE_1_1 } };
    // plus
    if (a5 === T && a4 === X && a3 === T && a2 === X && a1 === T) { return { huong: T, type: TYPES.TYPE_1_1_PLUS } };
    if (a5 === X && a4 === T && a3 === X && a2 === T && a1 === X) { return { huong: X, type: TYPES.TYPE_1_1_PLUS } };

    // =========================================================1-1 FOMOOOOO========================
    if (a4 === X && a3 === T && a2 === X && a1 === T) { return { huong: X, type: TYPES.TYPE_1_1_FOMO } };
    if (a4 === T && a3 === X && a2 === T && a1 === X) { return { huong: T, type: TYPES.TYPE_1_1_FOMO } };
    // plus
    if (a5 === T && a4 === X && a3 === T && a2 === X && a1 === T) { return { huong: X, type: TYPES.TYPE_1_1_PLUS_FOMO } };
    if (a5 === X && a4 === T && a3 === X && a2 === T && a1 === X) { return { huong: T, type: TYPES.TYPE_1_1_PLUS_FOMO } };

    // =========================================================2-2 CẢN TÀU========================
    if (a6 === X && a5 === T
      && a4 === X && a3 === X
      && a2 === T && a1 === T) { return { huong: T, type: TYPES.TYPE_2_2 } };

    if (a6 === T && a5 === X
      && a4 === T && a3 === T
      && a2 === X && a1 === X) { return { huong: X, type: TYPES.TYPE_2_2 } };

    if (a7 === X && a6 === T
      && a5 === X && a4 === X
      && a3 === T && a2 === T
      && a1 === X) { return { huong: T, type: TYPES.TYPE_2_2_PLUS } };

    if (a7 === T && a6 === X
      && a5 === T && a4 === T
      && a3 === X && a2 === X
      && a1 === T) { return { huong: X, type: TYPES.TYPE_2_2_PLUS } };

    // =========================================================2-2 FOMO ========================

    if (a6 === X && a5 === T
      && a4 === X && a3 === X
      && a2 === T && a1 === T) { return { huong: X, type: TYPES.TYPE_2_2_FOMO } };

    if (a6 === T && a5 === X
      && a4 === T && a3 === T
      && a2 === X && a1 === X) { return { huong: T, type: TYPES.TYPE_2_2_FOMO } };

    if (a7 === X && a6 === T
      && a5 === X && a4 === X
      && a3 === T && a2 === T
      && a1 === X) { return { huong: X, type: TYPES.TYPE_2_2_PLUS_FOMO } };

    if (a7 === T && a6 === X
      && a5 === T && a4 === T
      && a3 === X && a2 === X
      && a1 === T) { return { huong: T, type: TYPES.TYPE_2_2_PLUS_FOMO } };

    // =========================================================3-3 CẢN TÀU========================
    if (a8 === X && a7 === T
      && a6 === X && a5 === X && a4 === X
      && a3 === T && a2 === T && a1 === T) { return { huong: T, type: TYPES.TYPE_3_3 } };

    if (a8 === T && a7 === X
      && a6 === T && a5 === T && a4 === T
      && a3 === X && a2 === X && a1 === X) { return { huong: X, type: TYPES.TYPE_3_3 } };

    if (a9 === X
      && a8 === T
      && a7 === X && a6 === X && a5 === X
      && a4 === T && a3 === T && a2 === T
      && a1 === X) { return { huong: T, type: TYPES.TYPE_3_3_PLUS } };

    if (a9 === T
      && a8 === X
      && a7 === T && a6 === T && a5 === T
      && a4 === X && a3 === X && a2 === X
      && a1 === T) { return { huong: X, type: TYPES.TYPE_3_3_PLUS } };

    // =========================================================3-3 FOMO========================

    if (a8 === X
      && a7 === T
      && a6 === X && a5 === X && a4 === X
      && a3 === T && a2 === T && a1 === T) { return { huong: X, type: TYPES.TYPE_3_3_FOMO } };

    if (a8 === T && a7 === X
      && a6 === T && a5 === T && a4 === T
      && a3 === X && a2 === X && a1 === X) { return { huong: T, type: TYPES.TYPE_3_3_FOMO } };

    if (a9 === X
      && a8 === T
      && a7 === X && a6 === X && a5 === X
      && a4 === T && a3 === T && a2 === T
      && a1 === X) { return { huong: X, type: TYPES.TYPE_3_3_PLUS_FOMO } };

    if (a9 === T
      && a8 === X
      && a7 === T && a6 === T && a5 === T
      && a4 === X && a3 === X && a2 === X
      && a1 === T) { return { huong: T, type: TYPES.TYPE_3_3_PLUS_FOMO } };
    return { huong: "null", type: "null" }
  }
  return { huong: "null", type: "null" }
}

async function updateButton(page, text, color) {
  await page.evaluate(({ text, color }) => {
    const btn = document.getElementById("start-button");
    btn.innerText = text;
    btn.style.backgroundColor = color;
  }, { text, color });
}

function handleGetColor_TX(r, g, b) {
  // Chuyển sang tỉ lệ 0-1
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;

  const avg = (R + G + B) / 3;

  // Trắng sáng, trắng kem
  if (avg > 0.95) return "white";
  if (avg > 0.85) return "white";

  // Đen
  if (avg < 0.2) return "black";
  return "null";
}

function getLastTX(array, n) {
  if (!Array.isArray(array) || array.length < n) {
    return "null";
  }
  // "TXTX"
  return array.slice(-n).join('');
}


module.exports = {
  TinHieuMuaBan,
  updateButton,
  handleGetColor_TX,
  TYPES,
  T,
  X
};
*/