

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
        left: "10px",
        transform: "none",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "fit-content",
      });

      Object.assign(container.style, {
        maxHeight: "200px",
        width: "fit-content",
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
        fontSize: "12px",
        padding: "1px 4px",
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
        width: "auto",
        background: "#fff",
        borderCollapse: "collapse",
        fontSize: "10px",
        tableLayout: "fixed",
      });

      const headers = [
        "ID", "Hướng", "MôHình", "Ngâm", "Vol", "W/L", 
        "Lãi", "LãiMax", "ÂmMax", "Phí", "STOP"
      ];

      const widths = [
        "18px", "35px", "35px", "30px", "35px", "35px",
        "40px", "40px", "40px", "25px", "25px"
      ];


      const thead = document.createElement("thead");
      const tr = document.createElement("tr");

      headers.forEach((h, i) => {
        const th = document.createElement("th");
        th.innerText = h;
        Object.assign(th.style, {
          border: "1px solid #000",
          padding: "2px 2px",
          background: (i === 6 || i === 7) ? "#87CEFA" : "#eee",
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

async function TableChinh_Update_UI(page, data, baseVol = 1) {
  await page.evaluate(({ rows, baseVol }) => {
    const tbody = document.getElementById("longmach-body");
    if (!tbody) return;

    tbody.innerHTML = "";



    rows.forEach(item => {
      const tr = document.createElement("tr");
      if (item.isReady) {
        tr.style.backgroundColor = item.isTrading ? "#fff176" : "#a4c2f4";
        tr.style.fontWeight = "bold";
        tr.style.color = "#000000ff";
      } else {
        tr.style.color = "gray";
      }

      // ===== CÁC CỘT CHUẨN =====
      const huongLabel = !item.isReady
        ? "-"
        : item.huong === "T" ? "⚫ T" : item.huong === "X" ? "⚪ X" : "-";

      const cols = [
        item.id,
        `${huongLabel}${item.hoanthanh ? ' 😍' : ''}`,
        item.soLanChoDoi || 1,
        item.countNgam || 0,
        `${item.vol.toFixed(1)}K`,
        `${item.win}/${item.lost}`,
        item.profit.toFixed(1),
        item.profitMax.toFixed(1),
        (item.maxAm || 0).toFixed(1),
        item.phiGD.toFixed(1),
      ];

      cols.forEach((v, idx) => {
        const td = document.createElement("td");
        td.innerText = v;

        Object.assign(td.style, {
          border: "1px solid #000",  // màu đen
          padding: "1px 2px",
          textAlign: "center",
          color: "inherit" // ✅ Kế thừa màu từ tr
        });

        if (!item.isReady) {
          td.style.opacity = "0.6";
        }

        if (idx === 6 || idx === 7) {
          td.style.backgroundColor = "#f57f8eff"; // xanh nước biển sáng
          td.style.color = "#000"; // chữ đen cho dễ đọc
          td.style.fontWeight = "bold";
          td.style.opacity = "1";
        }

        // ✅ Màu sắc cho cột Lãi (Index 6)
        if (idx === 6) {
          if (item.profit > 0) {
            td.style.color = "#078607ff"; // xanh lá
            td.style.fontWeight = "bold";
          } else if (item.profit < 0) {
            td.style.color = "#d81515ff"; // đỏ
            td.style.fontWeight = "bold";
          }
        }

        tr.appendChild(td);
      });

      // Xóa hoàn toàn việc render cột Tiền Thật, Tiền muốn ăn, Chờ Nhân, Trend

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

      if (!item.isReady) {
        stopTd.style.opacity = "0.6";
      }

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
  }, { rows: data, baseVol });
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

async function UI_ToolTitle_Create(page, titleText) {
  await page.evaluate(({ titleText }) => {
    let titleDiv = document.getElementById("ui-tool-title");
    if (!titleDiv) {
      titleDiv = document.createElement("div");
      titleDiv.id = "ui-tool-title";
      Object.assign(titleDiv.style, {
        position: "fixed",
        top: "3px",
        left: "3px",
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.6)",
        color: "#00ff00",
        padding: "5px 15px",
        fontSize: "18px",
        fontWeight: "bold",
        fontFamily: "Arial, sans-serif",
        borderBottomLeftRadius: "10px",
        borderLeft: "2px solid #00ff00",
        borderBottom: "2px solid #00ff00",
        pointerEvents: "none"
      });
      document.body.appendChild(titleDiv);
    }
    titleDiv.innerText = titleText;
  }, { titleText });
}


module.exports = { UI_MouseClick, TableChinh_Update_UI, TableChinh_Create, UI_TieuDiem, UI_ToolTitle_Create };
