

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
        left: "1px",
        transform: "none",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "fit-content",
      });

      Object.assign(container.style, {
        maxHeight: "150px",
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
        fontSize: "10px",
        padding: "0px 2px",
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
        fontSize: "9px",
        tableLayout: "fixed",
      });

      const headers = [
        "ID", "Bên", "Tỉ số", "Đợi", "Ăn",
        "Lệnh", "Vol", "W/L", "Lãi", "Phí",
        "MIN", "STOP"
      ];


      const widths = [
        "13px", "35px", "35px", "20px",
        "39px", "30px", "30px", "45px", "45px",
        "25px", "30px", "25px"
      ];


      const thead = document.createElement("thead");
      const tr = document.createElement("tr");

      headers.forEach((h, i) => {
        const th = document.createElement("th");
        th.innerText = h;
        Object.assign(th.style, {
          border: "1px solid #000",
          padding: "1px 1px",
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

async function TableChinh_Update_UI(page, data) {
  // Sắp xếp: Đưa các item đang giao dịch lên đầu
  // const sortedData = [...data].sort((a, b) => {
  //   if (a.isTrading && !b.isTrading) return -1;
  //   if (!a.isTrading && b.isTrading) return 1;
  //   return 0;
  // });

  const active = data;


  await page.evaluate(({ rows }) => {
    const tbody = document.getElementById("longmach-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    rows.forEach(item => {
      const tr = document.createElement("tr");
      // Đơn giản hóa: Cứ đang giao dịch là sáng vàng
      const isFullMatch = item.isTrading;
      // Vẫn giữ isTypeMatch để nếu cần dùng logic khác liên quan tới signalType

      if (isFullMatch) {
        tr.style.backgroundColor = "#fff176"; // vàng nổi bật - khớp cả type + huong
        tr.style.fontWeight = "bold";
        tr.style.color = "#000000ff";
      } else if (item.isReady) {
        tr.style.backgroundColor = "#a4c2f4"; // xanh nhạt
        tr.style.fontWeight = "bold";
        tr.style.color = "#000000ff";
      } else {
        tr.style.color = "gray";
        tr.style.opacity = "0.5";
      }

      const lucStrInput = `${item.tiso}/${item.soLanChoDoi}`;

      // ===== CÁC CỘT CHUẨN (GIỮ NGUYÊN LOGIC CŨ) =====
      const cols = [
        item.id,
        item.isFomo === "null" ? " " : item.isFomo ? "Đẹp" : "Bẻ🔥",
        "LUC_COLUMN",
        "DOI_COLUMN",
        `${item.AnNumber}/${item.soLanMuonAn}${item.hoanthanh ? '😍' : ''}`,
        item.isTrading ? (item.huong === "T" ? "⚫" : "⚪") : "Chưa",
        item.vol,
        `${item.win}/${item.lost}`,
        item.profit.toFixed(1),
        item.phiGD.toFixed(1),
        item.minAnNumber
      ];


      cols.forEach((v, idx) => {
        const td = document.createElement("td");
        if (v === "LUC_COLUMN") {
          // ✅ Nếu tỉ số > 0 thì tô xanh
          if (item.tiso > 0) {
            td.style.fontWeight = "bold";
          }
          td.innerText = lucStrInput;
        } else if (v === "DOI_COLUMN") {
          td.innerText = item.soLanChoDoi ?? 0;
          td.style.cursor = "pointer";
          td.style.color = "blue";
          td.style.textDecoration = "underline";
          td.onclick = (e) => {
            e.stopPropagation();
            const existing = document.getElementById("edit-floating-input");
            if (existing) existing.remove();

            const rect = td.getBoundingClientRect();
            const input = document.createElement("input");
            input.id = "edit-floating-input";
            input.type = "number";
            input.value = item.soLanChoDoi ?? 0;
            Object.assign(input.style, {
              position: "fixed", top: rect.top + "px", left: rect.left + "px",
              width: Math.max(rect.width, 30) + "px", height: rect.height + "px",
              zIndex: 10001, fontSize: "10px", textAlign: "center", outline: "2px solid red"
            });
            document.body.appendChild(input);
            input.focus();
            input.select();

            input.onblur = () => input.remove();
            input.onkeydown = (ev) => {
              if (ev.key === "Enter") {
                window.postMessage({ type: "UPDATE_SOLAN", stopId: item.id, value: parseInt(input.value) }, "*");
                input.remove();
              } else if (ev.key === "Escape") {
                input.remove();
              }
            };
          };
        } else {
          td.innerText = v;
        }

        Object.assign(td.style, {
          border: "1px solid #000",  // màu đen
          padding: "1px 2px",
          textAlign: "center",
          color: "inherit" // ✅ Kế thừa màu từ tr
        });

        // ✅ Màu sắc cho cột Type (Index 1)
        if (idx === 1) {
          td.style.fontSize = "10px";
          td.style.fontWeight = "bold";
          td.style.color = "#5500aaff";
        }

        // ✅ Màu sắc cho cột Lãi (Index 8)
        if (idx === 8) {
          if (item.profit > 0) {
            td.style.color = "#0cb30cff"; // xanh lá
            td.style.fontWeight = "bold";
          } else if (item.profit < 0) {
            td.style.color = "#d81515ff"; // đỏ
            td.style.fontWeight = "bold";
          }
        }


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
  }, { rows: active });
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
        top: "0px",
        left: "2px",
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.7)",
        color: "#00ff00",
        padding: "4px 15px",
        fontSize: "18px",
        fontWeight: "bold",
        fontFamily: "Arial, sans-serif",
        borderBottomLeftRadius: "10px",
        borderRight: "3px solid #00ff00",
        borderBottom: "3px solid #00ff00",
        pointerEvents: "none"
      });
      document.body.appendChild(titleDiv);
    }
    titleDiv.innerText = titleText;
  }, { titleText });
}

module.exports = { UI_MouseClick, TableChinh_Update_UI, TableChinh_Create, UI_TieuDiem, UI_ToolTitle_Create };
