// ==========BUTTON COMMON =================

async function UI_Btn_Show_TieuDiem(page) {
  await page.evaluate(() => {
    if (!document.getElementById("show-tieudiem")) {
      const btnShow = document.createElement("button");
      btnShow.id = "show-tieudiem";
      btnShow.innerHTML = '👁️ Bật vị trí'; // ✅ sửa text default
      Object.assign(btnShow.style, {
        position: "fixed",
        bottom: "15px",
        right: "122px",
        zIndex: 9999,
        padding: "10px 15px",
        backgroundColor: "#007bff", // ✅ màu khi đang tắt
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      });
      document.body.appendChild(btnShow);
    }

    // ✅ THÊM: ẩn overlay ngay từ đầu
    const overlays = document.querySelectorAll("[id^='tieudiem-']");
    overlays.forEach(div => {
      div.style.display = "none";
    });
  });

  // Logic bật/tắt overlay chỉ dùng display
  await page.exposeFunction("toggleTieuDiem", async () => {
    await page.evaluate(() => {
      const overlays = document.querySelectorAll("[id^='tieudiem-']");
      overlays.forEach(div => {
        div.style.display = (div.style.display === "none") ? "block" : "none";
      });
    });
  });

  // Gắn sự kiện click và thay đổi text/màu lần đầu
  await page.evaluate(() => {
    const btn = document.getElementById("show-tieudiem");
    let clicked = false; // giữ nguyên

    btn.addEventListener("click", () => {
      window.toggleTieuDiem();

      if (!clicked) {
        btn.innerHTML = '👁️ Tắt vị trí';
        btn.style.backgroundColor = "gray";
        clicked = true;
      } else {
        btn.innerHTML = '👁️ Bật vị trí';
        btn.style.backgroundColor = "#007bff";
        clicked = false;
      }
    });
  });
}

async function UI_Show_SoDu(page, soDu = 0, profit = 0, mdd = 0) {
  await page.evaluate(({ balance, pnl, mddValue }) => {
    let box = document.getElementById("ui-so-du");

    if (!box) {
      box = document.createElement("div");
      box.id = "ui-so-du";
      Object.assign(box.style, {
        position: "fixed",
        bottom: "58px",
        right: "15px",
        zIndex: 10000,

        /* ===== NỀN & TÁCH MÀU ===== */
        background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        padding: "4px 8px",
        borderRadius: "6px",

        /* ===== TEXT ===== */
        fontSize: "16px",
        fontWeight: "700",
        lineHeight: "1.2",
        whiteSpace: "nowrap",

        /* ===== SHADOW ===== */
        boxShadow: `
          0 0 4px rgba(0,0,0,0.45),
          0 0 10px rgba(255,255,255,0.25)
        `,

        userSelect: "none",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        alignItems: "flex-end",
      });

      document.body.appendChild(box);
    }

    const fmtBalance = Number(balance).toLocaleString("vi-VN");
    const fmtProfit = Number(pnl).toLocaleString("vi-VN");

    let profitColor = "#666";
    if (pnl > 0) profitColor = "#0a8f08";
    else if (pnl < 0) profitColor = "#d00000";

    box.innerHTML = `
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="color:#111; text-shadow:0 0 2px #fff, 0 0 4px rgba(0,0,0,0.6);">
          💰 ${fmtBalance}
        </span>
        <span style="color:${profitColor}; text-shadow:0 0 2px #fff, 0 0 4px rgba(0,0,0,0.6);">
          (${pnl > 0 ? "+" : ""}${fmtProfit})
        </span>
      </div>
      <div style="color:#666; font-size:13px; font-weight:800; text-shadow:0 0 1px #fff;">
        Tổn Thất : ${Number(mddValue).toFixed(1)}%
      </div>
    `;

    /* ===== NHẤP NHÁY NHẸ ===== */
    box.style.transform = "scale(1.4)";
    box.style.transition = "transform 0.2s ease";
    setTimeout(() => {
      box.style.transform = "scale(1)";
    }, 200);

  }, { balance: soDu, pnl: profit, mddValue: mdd });
}


async function KetquaTXList_Create(page) {
  await page.evaluate(() => {
    if (document.getElementById("ui-array-kq")) return;

    const box = document.createElement("div");
    box.id = "ui-array-kq";

    Object.assign(box.style, {
      position: "fixed",
      top: "10px",              // cách top 10px
      left: "50%",              // căn giữa ngang
      transform: "translateX(105px)",
      display: "flex",
      gap: "1px",               // sát nhau
      zIndex: 9999,
      background: "rgba(255,255,255,0.9)",
      padding: "6px 8px",
      borderRadius: "6px",
      border: "1px solid #000"
    });

    document.body.appendChild(box);
  });
}

async function KetquaTXList_Update_UI(page, ArrayKQ) {
  await page.evaluate((ArrayKQ) => {
    const box = document.getElementById("ui-array-kq");
    if (!box) return;

    box.innerHTML = "";

    const last10 = ArrayKQ.slice(-20);

    last10.forEach(kq => {
      const dot = document.createElement("div");

      Object.assign(dot.style, {
        width: "15px",
        height: "15px",
        borderRadius: "50%",
        backgroundColor: kq === "T" ? "#000" : "#fff",
        border: "1px solid #000", // để X trắng vẫn thấy
      });

      box.appendChild(dot);
    });
  }, ArrayKQ);
}

async function LongMachList_create(page) {
  await page.evaluate(() => {
    if (document.getElementById("ui-array-kq2")) return;

    const box = document.createElement("div");
    box.id = "ui-array-kq2";

    Object.assign(box.style, {
      position: "fixed",
      top: "43px",              // cách top 10px
      left: "50%",              // căn giữa ngang
      transform: "translateX(105px)",
      display: "flex",
      gap: "1px",               // sát nhau
      zIndex: 9999,
      background: "rgba(255,255,255,0.9)",
      padding: "6px 8px",
      borderRadius: "6px",
      border: "1px solid #fff"
    });

    document.body.appendChild(box);
  });
}

async function LongMachList_Update_UI(page, ArrayKQ) {
  await page.evaluate((ArrayKQ) => {
    const box = document.getElementById("ui-array-kq2");
    if (!box) return;

    box.innerHTML = "";

    const last10 = ArrayKQ.slice(-20);

    last10.forEach(kq => {
      const dot = document.createElement("div");

      Object.assign(dot.style, {
        width: "15px",
        height: "15px",
        borderRadius: "10px",
        backgroundColor: kq === "A" ? "#20f70d" : "#f80404",
        border: "1px solid #fff", // để X trắng vẫn thấy
      });

      box.appendChild(dot);
    });
  }, ArrayKQ);
}

async function SignalIndicator_Create(page) {
  await page.evaluate(() => {
    if (document.getElementById("ui-active-signals")) return;

    // Inject animation
    if (!document.getElementById("signal-style")) {
      const style = document.createElement("style");
      style.id = "signal-style";
      style.innerHTML = `
        @keyframes signalPulse {
          0%   { box-shadow: 0 0 6px 2px rgba(255,220,0,0.7); }
          50%  { box-shadow: 0 0 18px 6px rgba(255,220,0,1); }
          100% { box-shadow: 0 0 6px 2px rgba(255,220,0,0.7); }
        }
      `;
      document.head.appendChild(style);
    }

    const box = document.createElement("div");
    box.id = "ui-active-signals";
    Object.assign(box.style, {
      position: "fixed",
      top: "105px",
      left: "285px",
      transform: "translate(-50%, -50%)",
      zIndex: 9999,
      background: "rgba(30,30,30,0.92)",
      color: "#aaa",
      padding: "6px 14px",
      borderRadius: "8px",
      fontSize: "18px",
      fontWeight: "bold",
      fontFamily: "monospace",
      border: "2px solid #555",
      minWidth: "200px",
      textAlign: "center",
      letterSpacing: "1px",
      userSelect: "none",
      pointerEvents: "none",
    });
    box.innerText = "⏳ Chờ tín hiệu...";
    document.body.appendChild(box);
  });
}

async function SignalIndicator_Update(page, signals = []) {
  await page.evaluate((sigs) => {
    const box = document.getElementById("ui-active-signals");
    if (!box) return;
    if (sigs.length === 0) {
      box.innerText = "⏳ Chờ tín hiệu...";
      box.style.color = "#888";
      box.style.background = "rgba(30,30,30,0.92)";
      box.style.border = "2px solid #555";
      box.style.animation = "";
    } else {
      const s = sigs[0];
      const isTai = s.huong === "X";
      box.style.color = isTai ? "#ffffff" : "#222222"; // Chữ trắng trên nền đen, chữ đen trên nền trắng
      box.style.background = isTai
        ? "linear-gradient(135deg, #0f0f0f, #2c2c2c)" // Đen sâu, dịu
        : "linear-gradient(135deg, #ffffff, #e8e8e8)"; // Trắng sứ, giảm chói
      box.style.border = isTai ? "2px solid #444444" : "2px solid #cccccc";
      box.style.animation = "signalPulse 1s ease-in-out infinite";
      box.innerText = (isTai ? "⚫ TÀI" : "⚪ XỈU") + "  |  " + s.type;
    }
  }, signals);
}


module.exports = {
  UI_Btn_Show_TieuDiem,
  UI_Show_SoDu,
  KetquaTXList_Create,
  KetquaTXList_Update_UI,
  LongMachList_create,
  LongMachList_Update_UI,
  SignalIndicator_Create,
  SignalIndicator_Update
};
