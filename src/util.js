const T = "T";
const X = "X";
const maxThep = 10
// ================= TYPES =================

const TYPES = {
  TYPE_1_create: "1_CREATE", // new

  TYPE_1_1: "1-1",
  TYPE_1_1_PLUS: "1-1 Plus",


  TYPE_2_create: "2_CREATE", // new
  TYPE_2_2: "2-2",
  TYPE_2_2_PLUS: "2-2 Plus",


  TYPE_3_create: "3_CREATE", // new
  TYPE_3_3: "3-3",
  TYPE_3_3_PLUS: "3-3 Plus",

  TYPE_2_1: "2-1",
  TYPE_2_1_PLUS: "2-1 Plus",

  TYPE_3_1: "3-1",
  TYPE_3_1_PLUS: "3-1 Plus",

  TYPE_123: "123",
  TYPE_123_PLUS: "123 Plus",

  TYPE_4: "4",
  TYPE_5: "5",

};

// ================= LOCK STATE =================
const lockState = {
  [TYPES.TYPE_1_create]: false,
  [TYPES.TYPE_1_1]: false,
  [TYPES.TYPE_1_1_PLUS]: false,

  [TYPES.TYPE_2_create]: false,
  [TYPES.TYPE_2_2]: false,
  [TYPES.TYPE_2_2_PLUS]: false,


  [TYPES.TYPE_3_create]: false,
  [TYPES.TYPE_3_3]: false,
  [TYPES.TYPE_3_3_PLUS]: false,

  [TYPES.TYPE_2_1]: false,
  [TYPES.TYPE_2_1_PLUS]: false,

  [TYPES.TYPE_3_1]: false,
  [TYPES.TYPE_3_1_PLUS]: false,

  [TYPES.TYPE_123]: false,
  [TYPES.TYPE_123_PLUS]: false,

  [TYPES.TYPE_4]: false,
  [TYPES.TYPE_5]: false,

};


// ================= HELPERS =================
function getLastTX(array, n) {
  if (!Array.isArray(array) || array.length < n) return null;
  return array.slice(-n).join("");
}

// ================= VALID STRUCTURE =================
function isValid_1_Create(s3) { return s3 === "TXT" || s3 === "XTX"; }
function isValid_2_Create(s5) { return s5 === "XTXXT" || s5 === "TXTTX"; }

function isValid_4(s4) { return s4 === "TTTT" || s4 === "XXXX"; }
function isValid_5(s5) { return s5 === "TTTTT" || s5 === "XXXXX"; }



function isValid_1_1(s4) { return s4 === "TXTX" || s4 === "XTXT"; }
function isValid_2_2(s4, s5) { return s4 === "TTXX" || s4 === "XXTT" || s5 === "TTXXT" || s5 === "XXTTX"; }
function isValid_3_3(s6, s7, s8) {
  return s6 === "TTTXXX" || s6 === "XXXTTT"
    || s7 === "TTTXXXT" || s7 === "XXXTTTX"
    || s8 === "TTTXXXTT" || s8 === "XXXTTTXX";
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

function isValid_123(s6, s7) {
  return s6 === "XTTXXX" || s6 === "TXXTTT"
    || s7 === "XTTXXXT" || s7 === "TXXTTTX"
}

// ================= MAIN =================
function TinHieuMuaBan(ArrayKQ) {
  if (!Array.isArray(ArrayKQ) || ArrayKQ.length < 10) {
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



  // ==================================================================== 1-Create =============================================
  if (lockState[TYPES.TYPE_1_create]) {
    if (!isValid_1_Create(s3)) lockState[TYPES.TYPE_1_create] = false;
  } else {
    if (s3 === "XTX" || s3 === "TXT") {
      lockState[TYPES.TYPE_1_create] = true;
      return {
        huong: s3 === "XTX" ? X : T,
        type: TYPES.TYPE_1_create
      };
    }
  }

  // ==================================================================== 1-1 =============================================
  if (lockState[TYPES.TYPE_1_1]) {
    if (!isValid_1_1(s4)) lockState[TYPES.TYPE_1_1] = false;
  } else {
    if (s4 === "XTXT" || s4 === "TXTX") {
      lockState[TYPES.TYPE_1_1] = true;
      return {
        huong: s4 === "XTXT" ? T : X,
        type: TYPES.TYPE_1_1
      };
    }
  }
  //             1-1 Plus
  if (lockState[TYPES.TYPE_1_1_PLUS]) {
    if (!isValid_1_1(s4)) {
      lockState[TYPES.TYPE_1_1] = false
      lockState[TYPES.TYPE_1_1_PLUS] = false
    };
  } else {
    if (s5 === "TXTXT" || s5 === "XTXTX") {
      lockState[TYPES.TYPE_1_1_PLUS] = true;
      return {
        huong: s5 === "TXTXT" ? T : X,
        type: TYPES.TYPE_1_1_PLUS
      };
    }
  }





  // ==================================================================== 2- 2 =============================================


  if (lockState[TYPES.TYPE_2_2]) {
    if (!isValid_2_2(s4, s5)) lockState[TYPES.TYPE_2_2] = false;
  } else {
    if (s6 === "XTXXTT" || s6 === "TXTTXX") {
      lockState[TYPES.TYPE_2_2] = true;
      return {
        huong: s6 === "XTXXTT" ? T : X,
        type: TYPES.TYPE_2_2
      };
    }
  }
  // Plus
  if (lockState[TYPES.TYPE_2_2_PLUS]) {
    if (!isValid_2_2(s4, s5)) lockState[TYPES.TYPE_2_2_PLUS] = false;
  } else {
    if (s7 === "XTXXTTX" || s7 === "TXTTXXT") {
      lockState[TYPES.TYPE_2_2_PLUS] = true;
      return {
        huong: s7 === "XTXXTTX" ? T : X,
        type: TYPES.TYPE_2_2_PLUS
      };
    }
  }


  // ==================================================================== 3-Create =============================================
  if (lockState[TYPES.TYPE_3_create]) {
    if (!isValid_3_3(s6, s7, s8)) lockState[TYPES.TYPE_3_create] = false;
  } else {
    if (s7 === "XTXXXTT" || s7 === "TXTTTXX") {
      lockState[TYPES.TYPE_3_create] = true;
      return {
        huong: s7 === "XTXXXTT" ? X : T,
        type: TYPES.TYPE_3_create
      };
    }
  }


  // ==================================================================== 3- 3 =============================================
  if (lockState[TYPES.TYPE_3_3]) {
    if (!isValid_3_3(s6, s7, s8)) lockState[TYPES.TYPE_3_3] = false;
  } else {
    if (s8 === "XTXXXTTT" || s8 === "TXTTTXXX") {
      lockState[TYPES.TYPE_3_3] = true;
      return {
        huong: s8 === "XTXXXTTT" ? T : X,
        type: TYPES.TYPE_3_3
      };
    }
  }

  if (lockState[TYPES.TYPE_3_3_PLUS]) {
    if (!isValid_3_3(s6, s7, s8)) lockState[TYPES.TYPE_3_3_PLUS] = false;
  } else {
    if (s9 === "XTXXXTTTX" || s9 === "TXTTTXXXT") {
      lockState[TYPES.TYPE_3_3_PLUS] = true;
      return {
        huong: s9 === "XTXXXTTTX" ? T : X,
        type: TYPES.TYPE_3_3_PLUS
      };
    }
  }

  // ==================================================================== 2- 1 2 =============================================

  if (lockState[TYPES.TYPE_2_1]) {
    if (!isValid_2_1_2(s5, s6, s7)) lockState[TYPES.TYPE_2_1] = false;
  } else {
    if (s6 === "TXXTXX" || s6 === "XTTXTT") {
      lockState[TYPES.TYPE_2_1] = true;
      return {
        huong: s6 === "TXXTXX" ? X : T,
        type: TYPES.TYPE_2_1
      };
    }
  }

  if (lockState[TYPES.TYPE_2_1_PLUS]) {
    if (!isValid_2_1_2(s5, s6, s7)) lockState[TYPES.TYPE_2_1_PLUS] = false;
  } else {
    if (s7 === "TXXTXXT" || s7 === "XTTXTTX") {
      lockState[TYPES.TYPE_2_1_PLUS] = true;
      return {
        huong: s7 === "TXXTXXT" ? T : X,
        type: TYPES.TYPE_2_1_PLUS
      };
    }
  }


  // ==================================================================== 2-Create =============================================
  if (lockState[TYPES.TYPE_2_create]) {
    if (!isValid_2_Create(s5) && !isValid_2_1_2(s5, s6, s7)) lockState[TYPES.TYPE_2_create] = false;
  } else {
    if (s5 === "XTXXT" || s5 === "TXTTX") {
      lockState[TYPES.TYPE_2_create] = true;
      return {
        huong: s5 === "XTXXT" ? X : T,
        type: TYPES.TYPE_2_create
      };
    }
  }
  // ==================================================================== 3- 1 3=============================================


  if (lockState[TYPES.TYPE_3_1]) {
    if (!isValid_3_1_3(s7, s8, s9, s10)) lockState[TYPES.TYPE_3_1] = false;
  } else {
    if (s8 === "TXXXTXXX" || s8 === "XTTTXTTT") {
      lockState[TYPES.TYPE_3_1] = true;
      return {
        huong: s8 === "TXXXTXXX" ? X : T,
        type: TYPES.TYPE_3_1
      };
    }
  }

  if (lockState[TYPES.TYPE_3_1_PLUS]) {
    if (!isValid_3_1_3(s7, s8, s9, s10)) lockState[TYPES.TYPE_3_1_PLUS] = false;
  } else {
    if (s9 === "TXXXTXXXT" || s9 === "XTTTXTTTX") {
      lockState[TYPES.TYPE_3_1_PLUS] = true;
      return {
        huong: s9 === "TXXXTXXXT" ? T : X,
        type: TYPES.TYPE_3_1_PLUS
      };
    }
  }

  // ==================================================================== 123 =============================================

  if (lockState[TYPES.TYPE_123]) {
    if (!isValid_123(s6, s7)) lockState[TYPES.TYPE_123] = false;
  } else {
    if (s7 === "TXTTXXX" || s7 === "XTXXTTT") {
      lockState[TYPES.TYPE_123] = true;
      return {
        huong: s7 === "TXTTXXX" ? X : T,
        type: TYPES.TYPE_123
      };
    }
  }

  if (lockState[TYPES.TYPE_123_PLUS]) {
    if (!isValid_123(s6, s7)) lockState[TYPES.TYPE_123_PLUS] = false;
  } else {
    if (s8 === "TXTTXXXT" || s8 === "XTXXTTTX") {
      lockState[TYPES.TYPE_123_PLUS] = true;
      return {
        huong: s8 === "TXTTXXXT" ? X : T,
        type: TYPES.TYPE_123_PLUS
      };
    }
  }
  // ========================================================================== type 4 ===========================================
  if (lockState[TYPES.TYPE_4]) {
    if (!isValid_4(s4)) lockState[TYPES.TYPE_4] = false;
  } else {
    if (s4 === "TTTT" || s4 === "XXXX") {
      lockState[TYPES.TYPE_4] = true;
      return {
        huong: s4 === "TTTT" ? X : T,
        type: TYPES.TYPE_4
      };
    }
  }

  if (lockState[TYPES.TYPE_5]) {
    if (!isValid_5(s5)) lockState[TYPES.TYPE_5] = false;
  } else {
    if (s5 === "TTTTT" || s5 === "XXXXX") {
      lockState[TYPES.TYPE_5] = true;
      return {
        huong: s5 === "TTTTT" ? X : T,
        type: TYPES.TYPE_5
      };
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

function getHuongForItem(item, huongGoc) {
  if (huongGoc == "null") return "null"
  if (item.isFomo) {
    return huongGoc === T ? X : T;
  }
  return huongGoc;
}

// ================= EXPORT =================
module.exports = {
  TinHieuMuaBan,
  updateButton,
  handleGetColor_TX,
  getHuongForItem,
  TYPES,
  maxThep,
  T,
  X,
};
