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

async function UI_Show_SoDu(page, soDu = 0, profit = 0) {
  await page.evaluate(({ balance, pnl }) => {
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
        background: "rgba(255,255,255,0.55)",
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
        gap: "6px",
        alignItems: "center",
      });

      document.body.appendChild(box);
    }

    const fmtBalance = Number(balance).toLocaleString("vi-VN");
    const fmtProfit = Number(pnl).toLocaleString("vi-VN");

    let profitColor = "#666";
    if (pnl > 0) profitColor = "#0a8f08";
    else if (pnl < 0) profitColor = "#d00000";

    box.innerHTML = `
      <span style="
        color:#111;
        text-shadow:
          0 0 2px #fff,
          0 0 4px rgba(0,0,0,0.6);
      ">
        💰 ${fmtBalance}
      </span>
      <span style="
        color:${profitColor};
        text-shadow:
          0 0 2px #fff,
          0 0 4px rgba(0,0,0,0.6);
      ">
        (${pnl > 0 ? "+" : ""}${fmtProfit})
      </span>
    `;

    /* ===== NHẤP NHÁY NHẸ ===== */
    box.style.transform = "scale(1.4)";
    box.style.transition = "transform 0.2s ease";
    setTimeout(() => {
      box.style.transform = "scale(1)";
    }, 200);

  }, { balance: soDu, pnl: profit });
}


async function UI_ArrayKQ(page) {
  await page.evaluate(() => {
    if (document.getElementById("ui-array-kq")) return;

    const box = document.createElement("div");
    box.id = "ui-array-kq";

    Object.assign(box.style, {
      position: "fixed",
      top: "10px",              // cách top 10px
      left: "50%",              // căn giữa ngang
      transform: "translateX(15px)",
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


async function UI_Update_ArrayKQ(page, ArrayKQ) {
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

async function UI_ArrayKQ2(page) {
  await page.evaluate(() => {
    if (document.getElementById("ui-array-kq2")) return;

    const box = document.createElement("div");
    box.id = "ui-array-kq2";

    Object.assign(box.style, {
      position: "fixed",
      top: "43px",              // cách top 10px
      left: "50%",              // căn giữa ngang
      transform: "translateX(15px)",
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

async function UI_Update_KetQua_XauDep_Array(page, ArrayKQ) {
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

async function UI_ChienThoi(page) {
  await page.evaluate(() => {
    if (document.getElementById("ui-chienthoi")) return;

    const box = document.createElement("div");
    box.id = "ui-chienthoi";

    Object.assign(box.style, {
      position: "fixed",
      bottom: "5px",              // nằm dưới ui-array-kq2
      right: "240px",
      transform: "translateY(-5px)",
      zIndex: 9999,
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",

      padding: "8px 10px",
      borderRadius: "6px",
      border: "1px solid #fff",
      fontSize: "12px",
      lineHeight: "1.6",
      minWidth: "140px",
      fontFamily: "Arial, sans-serif",
    });

    document.body.appendChild(box);
  });
}

async function UI_Update_ChienThoi(page, chienthoi, ArrayKQ_XAU, soLanChoDoi = 0) {
  await page.evaluate(({ ct, array, soLanChoDoi }) => {
    const box = document.getElementById("ui-chienthoi");
    if (!box) return;

    const Dep = "A";
    const Xau = "B";

    const countA = array?.filter(v => v === Dep).length || 0;
    const countB = array?.filter(v => v === Xau).length || 0;

    const check = (v) => v ? `<span style="color:green">✅</span>` : "";

    let colorSolai = "black";
    if (ct.solai > 0) colorSolai = "green";
    else if (ct.solai < 0) colorSolai = "red";

    box.innerHTML = `
      <div>🟢 Bên đẹp: ${countB - countA > 0 ? countB - countA : 0}/${soLanChoDoi} ${check(ct.bendep)}</div>
      <div>🔴 Bên xấu: ${countA - countB > 0 ? countA - countB : 0}/${soLanChoDoi} ${check(ct.benxau)}</div>
      <div>Điều kiện: ${ct.AnNumber} / ${ct.soLanMuonAn} ${check(ct.hoanthanh)}</div>
      <div>💰 Số lãi: <span style="color:${colorSolai}">${ct.solai.toFixed(2)}</span></div>
      <div>♻️ Nhân đôi: ${check(ct.isNhandoi)}</div>
    `;
  }, { ct: chienthoi, array: ArrayKQ_XAU, soLanChoDoi });
}

module.exports = { UI_Btn_Show_TieuDiem, UI_Show_SoDu, UI_ArrayKQ, UI_Update_ArrayKQ, UI_ArrayKQ2, UI_Update_KetQua_XauDep_Array, UI_ChienThoi, UI_Update_ChienThoi };
