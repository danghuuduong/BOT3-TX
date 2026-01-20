const T = "T";
const X = "X";
const Dep = "A";
const Xau = "B";
const maxThep = 10;

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

  TYPE_KHOI_CHAN: "KHOI_CHAN"

};
const TYPES2 = {
  typeBeThangDep: "beDep",
  typeBeThangXau: "beXau",
  typeSenke: "senke",
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
  [TYPES.TYPE_KHOI_CHAN]: false

};


// ================= HELPERS =================
function getLastTX(array, n) {
  if (!Array.isArray(array) || array.length < n) return null;
  return array.slice(-n).join("");
}

function detectKhoiChanEarly_TX(str) {
  if (!str || str.length < 5) return null;

  let blocks = [];
  let count = 1;

  for (let i = 1; i <= str.length; i++) {
    if (str[i] === str[i - 1]) {
      count++;
    } else {
      blocks.push({ char: str[i - 1], len: count });
      count = 1;
    }
  }

  if (blocks.length < 3) return null;

  const b1 = blocks[blocks.length - 3]; // block chẵn 1
  const b2 = blocks[blocks.length - 2]; // block chẵn 2
  const b3 = blocks[blocks.length - 1]; // block quay đầu

  // 2 block chẵn + quay đầu đúng 1
  if (
    b1.len >= 2 &&
    b2.len >= 2 &&
    b1.char !== b2.char &&
    b3.len === 1 &&
    b3.char === b1.char
  ) {
    return {
      huong: b1.char === T ? X : T
    };
  }

  return null;
}




// ================= VALID STRUCTURE =================
// function isValid_1_Create(s3) { return s3 === "TXT" || s3 === "XTX"; }
// function isValid_2_Create(s5) { return s5 === "XTXXT" || s5 === "TXTTX"; }

// function isValid_4(s4) { return s4 === "TTTT" || s4 === "XXXX"; }
// function isValid_5(s5) { return s5 === "TTTTT" || s5 === "XXXXX"; }


function isStillInKhoiChan_TX(str) {
  return /(T{2,}X{2,}T+|X{2,}T{2,}X+)/.test(str);
}

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
    if (s6 === "TXXTTX" || s6 === "XTTXXT") {
      lockState[TYPES.TYPE_2_2_PLUS] = true;
      return {
        huong: s6 === "TXXTTX" ? T : X,
        type: TYPES.TYPE_2_2_PLUS
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
    if (s6 === "XXTXXT" || s6 === "TTXTTX") {
      lockState[TYPES.TYPE_2_1_PLUS] = true;
      return {
        huong: s6 === "XXTXXT" ? T : X,
        type: TYPES.TYPE_2_1_PLUS
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




  // ==================================================================== KHOI CHAN =============================================

  const sKC = ArrayKQ.slice(-20).join("");

  if (lockState[TYPES.TYPE_KHOI_CHAN]) {
    if (!isStillInKhoiChan_TX(sKC)) {
      lockState[TYPES.TYPE_KHOI_CHAN] = false;
    }
  } else {
    const signal = detectKhoiChanEarly_TX(sKC);
    if (signal) {
      lockState[TYPES.TYPE_KHOI_CHAN] = true;
      return {
        huong: signal.huong,
        type: TYPES.TYPE_KHOI_CHAN
      };
    }
  }




  return { huong: "null", type: "null" };
}

function TinHieuMuaBanNew(ArrayKQ_XAU) {
  if (!Array.isArray(ArrayKQ_XAU) || ArrayKQ_XAU.length < 2) {
    return { huong: "null", type: "null" };
  }

  const s2= getLastTX(ArrayKQ_XAU, 2);


  // ==================================================================== 1-1 =============================================
  if (s2 === "AA") {
    return {
      isPheDep: false,
      type: TYPES2.typeBeThangDep
    };
  }

  if (s2 === "BB") {
    return { 
      isPheDep: true,
      type: TYPES2.typeBeThangXau };
  }

  if (!Array.isArray(ArrayKQ_XAU) || ArrayKQ_XAU.length < 4) {
    return { huong: "null", type: "null" };
  }
  const s4 = getLastTX(ArrayKQ_XAU, 4);


  if (s4 === "ABAB" || s4 === "BABA") {
    return {
      isPheDep: s4 === "BABA" ? true : false,
      type: TYPES2.typeSenke
    };
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

function getHuongForItem(tinHieuAINew, huongGoc) {
  if (huongGoc == "null") return "null"
  if (tinHieuAINew.isPheDep) {
    return huongGoc === T ? X : T;
  }
  return huongGoc;
}

// ================= EXPORT =================
module.exports = {
  TinHieuMuaBan,
  TinHieuMuaBanNew,
  updateButton,
  handleGetColor_TX,
  getHuongForItem,
  TYPES,
  T,
  X,
  Dep,
  Xau,
  maxThep
};
