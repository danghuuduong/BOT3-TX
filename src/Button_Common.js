// ==========BUTTON COMMON =================

async function UI_Btn_Show_TieuDiem(page) {
  await page.evaluate(() => {
    if (!document.getElementById("show-tieudiem")) {
      const btnShow = document.createElement("button");
      btnShow.id = "show-tieudiem";
      btnShow.innerHTML = '👁️ Tắt vị trí';
      Object.assign(btnShow.style, {
        position: "fixed",
        bottom: "15px",
        right: "122px",
        zIndex: 9999,
        padding: "10px 15px",
        backgroundColor: "gray",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      });
      document.body.appendChild(btnShow);
    }
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
    let clicked = false; // trạng thái lần đầu
    btn.addEventListener("click", () => {
      window.toggleTieuDiem();

      if (!clicked) {
        btn.innerHTML = '👁️ Bật vị trí';
        btn.style.backgroundColor = "#007bff";
        clicked = true;
      } else {
        btn.innerHTML = '👁️ Tắt vị trí';
        btn.style.backgroundColor = "gray";
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
        bottom: "60px",
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
    const fmtProfit  = Number(pnl).toLocaleString("vi-VN");

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
    box.style.transform = "scale(1.12)";
    box.style.transition = "transform 0.2s ease";
    setTimeout(() => {
      box.style.transform = "scale(1)";
    }, 200);

  }, { balance: soDu, pnl: profit });
}




module.exports = { UI_Btn_Show_TieuDiem, UI_Show_SoDu };
