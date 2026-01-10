
const Tai = "Tai"
const Xiu = "Xiu"
// ============= Cầu 1 - 1 ==================
const type01 = "1-1"
const type02 = "1-1 Plus"
const type03 = "1-1-Fomo"
const type04 = "1-1-Plus-Fomo"


// ============= Cầu 2 - 2 ==================
const type05 = "2-2"
const type06 = "2-2 Plus"
const type07 = "2-2-Fomo"
const type08 = "2-2-Plus-Fomo"


// ============= Cầu 3 - 3 ==================
const type09 = "3-3"
const type10 = "3-3 Plus"
const type11 = "3-3-Fomo"
const type12 = "3-3-Plus-Fomo"

// ============= Cầu 2-1-2==================
const type13 = "2-1"
const type14 = "2-1 Plus"
const type15 = "2-1-Fomo"
const type16 = "2-1-Plus-Fomo"

// ============= Cầu 3-1-3==================
const type17 = "3-1"
const type18 = "3-1 Plus"
const type19 = "3-1-Fomo"
const type20 = "3-1-Plus-Fomo"

// ============= Cầu 1-2-3==================
const type21 = "123"
const type22 = "123 Plus"
const type23 = "123-Fomo"
const type24 = "123-Plus-Fomo"


async function TinHieuMuaBan(ArrayKQ) {
  // console.log("Kết quả", ArrayKQ)
  const length = ArrayKQ.length;
  if(ArrayKQ.length > 13){
      const a6  = ArrayKQ[length-6];
      const a5  = ArrayKQ[length-5];
      const a4  = ArrayKQ[length-4];
      const a3  = ArrayKQ[length-3];
      const a2  = ArrayKQ[length-2];
      const a1  = ArrayKQ[length-1];

      // =========================================================1-1========================
      if(a4 === Xiu && a3 === Tai && a2 === Xiu && a1 === Tai){ return type01 };
      if(a4 === Tai && a3 === Xiu && a2 === Tai && a1 === Xiu){ return type02 };
      // plus
      if(a5 === Tai && a4 === Xiu && a3 === Tai && a2 === Xiu && a1 === Tai){ return type03 };
      if(a5 === Xiu && a4 === Tai && a3 === Xiu && a2 === Tai && a1 === Xiu){ return type04 };
      // =========================================================1-1========================
      if(a4 === Xiu && a3 === Tai && a2 === Xiu && a1 === Tai){ return type05 };
      if(a4 === Tai && a3 === Xiu && a2 === Tai && a1 === Xiu){ return type06 };
      // plus
      if(a5 === Tai && a4 === Xiu && a3 === Tai && a2 === Xiu && a1 === Tai){ return type07 };
      if(a5 === Xiu && a4 === Tai && a3 === Xiu && a2 === Tai && a1 === Xiu){ return type08 };
  }
}

async function updateButton(page,text, color) {
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


module.exports = {
  TinHieuMuaBan,
  updateButton,
  handleGetColor_TX,
  // 1-1
  type01,
  type02,
  type03,
  type04,

  // 2-2
  type05,
  type06,
  type07,
  type08,

  // 3-3
  type09,
  type10,
  type11,
  type12,

  // 2-1-2
  type13,
  type14,
  type15,
  type16,

  // 3-1-3
  type17,
  type18,
  type19,
  type20,

  // 1-2-3
  type21,
  type22,
  type23,
  type24,
};
