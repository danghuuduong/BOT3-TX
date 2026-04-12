

async function UI_TieuDiem(page, X, Y, width, height, id, color = "red") {
  await page.evaluate(({ X, Y, width, height, id, color }) => {
    let div = document.getElementById(id);
    if (!div) {
      div = document.createElement("div");
      div.id = id;
      div.style.position = "absolute";
      div.style.zIndex = 9999;
      div.style.pointerEvents = "none";
      document.body.appendChild(div);
    }

    Object.assign(div.style, {
      left: X + "px",
      top: Y + "px",
      width: width + "px",
      height: height + "px",
      opacity: 1,
      transform: "translate(-50%, -50%)",
      border: `2px solid ${color}`,
      backgroundColor: color,
      display: "block",
      borderRadius: "50%"
    });
  }, { X, Y, width, height, id, color });
}

async function TableChinh_Create(page) {
  await page.evaluate(() => {
    if (!document.getElementById("longmach-table-container")) {
      const container = document.createElement("div");
      container.id = "longmach-table-container";
      // Wrapper
      const wrapper = document.createElement("div");
      wrapper.id = "ui-wrapper-longmach";
      Object.assign(wrapper.style, {
        position: "fixed",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      });

      Object.assign(container.style, {
        maxHeight: "200px",
        maxWidth: "95vw",
        overflowY: "auto",
        overflowX: "auto",
        background: "#fff",
      });

      // ===== TOGGLE BUTTON =====
      const toggleBtn = document.createElement("div");
      toggleBtn.id = "longmach-toggle";
      toggleBtn.innerText = "▼";
      Object.assign(toggleBtn.style, {
        fontSize: "14px",
        padding: "2px 6px",
        cursor: "pointer",
        background: "#FFFFFF",     // xanh dương nhạt
        border: "1px solid #000",
        borderRadius: "3px",
        userSelect: "none",
        zIndex: 10000,
        marginBottom: "2px",
      });

      let isHidden = false;

      const box = document.getElementById("ui-chienthoi");
      toggleBtn.onclick = () => {
        isHidden = !isHidden;
        if (isHidden) {
          if (box) box.style.display = "none";
          container.style.display = "none";
          toggleBtn.innerText = "▲";
        } else {
          container.style.display = "block";
          if (box) box.style.display = "block";
          toggleBtn.innerText = "▼";
        }
      };

      wrapper.appendChild(toggleBtn);
      wrapper.appendChild(container);

      // ===== TABLE =====
      const table = document.createElement("table");
      table.id = "longmach-table";
      Object.assign(table.style, {
        width: "100%",
        background: "#fff",
        borderCollapse: "collapse",
        fontSize: "12px",
        tableLayout: "fixed",
      });

      const headers = [
        "ID", "Bên", "Lực", "Ăn", "x2",
        "Giao dịch", "Vol", "W/L", "Lãi",
        "MIN", "STOP"
      ];


      const widths = [
        "20px", "40px", "65px", "45px", "25px",
        "60px", "45px", "80px", "60px",
        "30px", "30px"
      ];


      const thead = document.createElement("thead");
      const tr = document.createElement("tr");

      headers.forEach((h, i) => {
        const th = document.createElement("th");
        th.innerText = h;
        Object.assign(th.style, {
          border: "1px solid #000",
          padding: "4px 6px",
          background: "#eee",
          textAlign: "center",
          whiteSpace: "nowrap",
          width: widths[i],
        });
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      tbody.id = "longmach-body";
      table.appendChild(tbody);

      container.appendChild(table);
      document.body.appendChild(wrapper);
    }
  });
}

async function TableChinh_Update_UI(page, data, ArrayKQ_XAU) {
  await page.evaluate(({ rows, arrayKQ }) => {
    const tbody = document.getElementById("longmach-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const countA = arrayKQ?.filter(v => v === "A").length || 0;
    const countB = arrayKQ?.filter(v => v === "B").length || 0;

    rows.forEach(item => {
      const tr = document.createElement("tr");
      const lucStrInput = `<span style="display:inline-block; min-width:12px; text-align:right">${item.tiso}</span>/<input type="number" data-id="${item.id}" value="${item.soLanChoDoi}" style="width:25px; height:18px; font-size:11px; padding:0; text-align:center; border:1px solid #999; border-radius:2px; background:transparent;"> ${item.isReady ? '✅' : ''}`;

      // ===== CÁC CỘT CHUẨN (GIỮ NGUYÊN LOGIC CŨ) =====
      const cols = [
        item.id,
        item.isFomo === "null" ? " " : item.isFomo ? "Đẹp" : "Xấu🔥",
        "LUC_COLUMN",
        `${item.AnNumber}/${item.soLanMuonAn}${item.hoanthanh ? '😍' : ''}`,
        item.isNhandoi ? "✅" : " ",
        item.isTrading ? (item.huong === "T" ? "⚫" : "⚪") : "Chưa",
        item.vol,
        `${item.win}/${item.lost}`,
        item.profit.toFixed(2),
        item.minAnNumber
      ];


      cols.forEach(v => {
        const td = document.createElement("td");
        if (v === "LUC_COLUMN") {
          td.innerHTML = lucStrInput;
          const inp = td.querySelector("input");
          if (inp) {
            inp.addEventListener("change", (e) => {
              window.postMessage({ type: "UPDATE_SOLAN", stopId: item.id, value: e.target.value }, "*");
            });
          }
        } else {
          td.innerText = v;
        }
        Object.assign(td.style, {
          border: "1px solid #000",  // màu đen
          padding: "2px 4px",
          color: "#000",              // text màu đen
          textAlign: "center",
        });
        tr.appendChild(td);
      });

      // ===== STOP (CLICK ĐƯỢC) =====
      const stopTd = document.createElement("td");
      stopTd.innerText = item.isStop ? "🔴" : "🟢";

      Object.assign(stopTd.style, {
        border: "1px solid #000",
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
        fontWeight: "bold",
      });

      stopTd.addEventListener("click", (e) => {
        e.stopPropagation();
        window.postMessage({
          type: "STOP_CLICK",
          stopId: item.id   // ✅ QUAN TRỌNG
        }, "*");
      });

      tr.appendChild(stopTd);

      tbody.appendChild(tr);
    });
  }, { rows: data, arrayKQ: ArrayKQ_XAU });
}

async function UI_MouseClick(page, x, y, icon, size = 16, id = "tieudiem", timeoutMs = 2000) {
  await page.evaluate(({ x, y, size, icon, id, timeoutMs }) => {
    // xóa cũ nếu còn
    const old = document.getElementById(id);
    if (old) old.remove();

    // inject keyframes (chỉ inject 1 lần)
    if (!document.getElementById("ui-click-style")) {
      const style = document.createElement("style");
      style.id = "ui-click-style";
      style.innerHTML = `
        @keyframes clickPulse {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
          50%  { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }

    // tạo icon
    const el = document.createElement("div");
    el.id = id;
    el.innerText = icon || "🖱️";

    Object.assign(el.style, {
      position: "fixed",
      left: x + "px",
      top: y + "px",
      fontSize: size + "px",
      zIndex: 9999,
      pointerEvents: "none",
      userSelect: "none",
      transform: "translate(-50%, -50%)",
      animation: "clickPulse 0.4s ease-in-out infinite",
    });

    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, timeoutMs);

  }, { x, y, size, icon, id, timeoutMs });
}

module.exports = { UI_MouseClick, TableChinh_Update_UI, TableChinh_Create, UI_TieuDiem };
