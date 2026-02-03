

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

async function UI_Table_LuuTru(page) {
  await page.evaluate(() => {
    if (!document.getElementById("longmach-table-container")) {
      const container = document.createElement("div");
      container.id = "longmach-table-container";
      Object.assign(container.style, {
        position: "fixed",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        maxHeight: "200px",
        maxWidth: "95vw",
        overflowY: "auto",
        overflowX: "auto",
        zIndex: 9999,
        background: "#fff",
      });

      // ===== TOGGLE BUTTON =====
      const toggleBtn = document.createElement("div");
      toggleBtn.id = "longmach-toggle";
      toggleBtn.innerText = "▼";
      Object.assign(toggleBtn.style, {
        position: "fixed",          // luôn nằm ngoài table
        bottom: `111px`, // 10px trên table
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "14px",
        padding: "2px 6px",
        cursor: "pointer",
        background: "#FFFFFF",     // xanh dương nhạt
        border: "1px solid #000",
        borderRadius: "3px",
        userSelect: "none",
        zIndex: 10000,
      });

      let isHidden = false;

      toggleBtn.onclick = () => {
        isHidden = !isHidden;
        if (isHidden) {
          container.style.display = "none";
          toggleBtn.style.bottom = "10px";  // xuống dưới màn hình
          toggleBtn.style.top = "auto";     // reset top
          toggleBtn.innerText = "▲";
        } else {
          container.style.display = "block";
          // toggleBtn.style.top = `${container.getBoundingClientRect().top - 10}px`;
          toggleBtn.style.bottom = `91px`;
          toggleBtn.innerText = "▼";
        }
      };

      document.body.appendChild(toggleBtn);

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
        "ID", "Type", "Bên", "Vô", "Số Ngầm", "Thếp",
        "Số Tiền", "Win", "Lost", "Lãi",
        "1", "2", "3", "4", "5",

        // // ✅ BỔ SUNG
        // "A1", "A2", "A3", "A4", "A5",
        "6", "7", "8",

        "Cháy",
        "STOP"
      ];


      const widths = [
        "30px", "70px", "50px", "60px", "60px", "90px",
        "50px", "45px", "45px", "65px",
        "35px", "35px", "35px", "35px", "35px",

        // // ✅ BỔ SUNG
        // "35px", "35px", "35px", "35px", "35px",
        "35px", "35px", "35px",

        "35px",
        "40px",
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
      document.body.appendChild(container);
    }
  });
}



async function UI_Update_Table(page, data) {
  await page.evaluate((rows) => {
    const tbody = document.getElementById("longmach-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    rows.forEach(item => {
      const tr = document.createElement("tr");
      const icon = item.isNgamDone ? '✅' : '';

      // ===== CÁC CỘT CHUẨN (GIỮ NGUYÊN LOGIC CŨ) =====
      const cols = [
        item.id,
        item.type,
        item.isFomo === "null" ? " " : item.isFomo ? "Fomo" : "Bẻ🔥",
        item.isTrading ? item.huong === "T" ? "⚫" : "⚪" : "Chưa",
        `${item.thepChoNgam}/${item.ngam} ${icon}`,
        item.ngam && !item.isNgamDone ? 'Chờ ngầm' : `⭐️ ${item.thep}/8 Thếp`,
        item.ngam && !item.isNgamDone ? 'Chưa Vô' : item.vol,
        item.win,
        item.lost,
        item.profit.toFixed(2),

        item.A, item.B, item.C, item.D, item.E,


        // // ✅ BỔ SUNG
        item.A1,
        item.A2,
        item.A3,
        // item.A4,
        // item.A5,

        item.deal ? `${item.deal} 🐤` : "-",
      ];


      cols.forEach(v => {
        const td = document.createElement("td");
        td.innerText = v;
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
  }, data);
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

module.exports = { UI_MouseClick, UI_Update_Table, UI_Table_LuuTru, UI_TieuDiem };
