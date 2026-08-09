

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
      if (!document.getElementById("ui-floor-pulse-style")) {
        const style = document.createElement("style");
        style.id = "ui-floor-pulse-style";
        style.innerHTML = `
          @keyframes floorPulse {
            0% { background-color: #e3f2fd; }
            50% { background-color: #1bf72eff; }
            100% { background-color: #e3f2fd; }
          }
          .active-floor {
            animation: floorPulse 1s infinite ease-in-out !important;
          }
        `;
        document.head.appendChild(style);
      }
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
        "Type", "V.Trước", "Hướng", "Chờ", "Ngâm", "Vol",
        "Tay Thếp", "W/L", "Profit", "Reset", "STOP"
      ];

      const widths = [
        "65px", "35px", "38px", "25px", "45px", "35px",
        "60px", "45px", "55px", "35px", "25px"
      ];


      const thead = document.createElement("thead");
      const tr = document.createElement("tr");

      headers.forEach((h, i) => {
        const th = document.createElement("th");
        th.innerText = h;
        Object.assign(th.style, {
          border: "1px solid #000",
          padding: "2px 2px",
          background: (h === "Profit") ? "#87CEFA" : "#eee",
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

    // 1. Lưu thông tin input đang được gõ/focus
    const activeEl = document.activeElement;
    let focusedItemId = null;
    let focusedField = null;
    let typedValue = null;
    if (activeEl && activeEl.tagName === "INPUT" && activeEl.dataset.itemId) {
      focusedItemId = Number(activeEl.dataset.itemId);
      focusedField = activeEl.dataset.field;
      typedValue = activeEl.value;
    }

    tbody.innerHTML = "";

    const multiList = [1, 2.4, 5, 11, 20.6];

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

      const makeTd = (v, align = "center") => {
        const td = document.createElement("td");
        td.innerText = v;
        Object.assign(td.style, {
          border: "1px solid #000",
          padding: "1px 2px",
          textAlign: align,
          color: "inherit"
        });
        if (!item.isReady) td.style.opacity = "0.8";
        return td;
      };

      // 1. Cột Type
      tr.appendChild(makeTd(item.type || "-"));

      // 1.5. Cột Ván Trước (Thuận: 🟢, Ngược: 🔴, null: ⚪)
      const vanTruocDot = item.VanTruoc === "Thuận" ? "🟢" : (item.VanTruoc === "Ngược" ? "🔴" : "⚪");
      tr.appendChild(makeTd(vanTruocDot));

      // 2. Cột Hướng
      tr.appendChild(makeTd(`${huongLabel}${item.hoanthanh ? ' 😍' : ''}`));

      // 3. Cột Chờ
      tr.appendChild(makeTd(item.soLanChoDoi || 1));

      // 4. Cột Ngâm (Input chỉnh được)
      const ngamTd = document.createElement("td");
      Object.assign(ngamTd.style, {
        border: "1px solid #000",
        padding: "1px 2px",
        textAlign: "center",
      });
      if (!item.isReady) ngamTd.style.opacity = "0.8";

      const ngamSpan = document.createElement("span");
      ngamSpan.innerText = `${item.countNgam || 0}/`;
      Object.assign(ngamSpan.style, { fontSize: "10px", color: "gray" });

      const ngamInput = document.createElement("input");
      ngamInput.type = "number";
      ngamInput.dataset.itemId = item.id;
      ngamInput.dataset.field = "Ngam";

      const isNgamFocused = item.id === focusedItemId && focusedField === "Ngam";
      ngamInput.value = isNgamFocused ? typedValue : (item.Ngam !== undefined ? item.Ngam : 2);

      ngamInput.min = 0;
      ngamInput.max = 20;
      Object.assign(ngamInput.style, {
        width: "28px", fontSize: "10px",
        border: "1px solid #aaa", borderRadius: "2px",
        textAlign: "center", padding: "0",
      });
      ngamInput.addEventListener("change", (e) => {
        e.stopPropagation();
        const newVal = parseInt(e.target.value);
        if (!isNaN(newVal) && newVal >= 0)
          window.postMessage({ type: "UPDATE_NGAM", stopId: item.id, value: newVal }, "*");
      });
      ngamInput.addEventListener("click", e => e.stopPropagation());
      ngamTd.appendChild(ngamSpan);
      ngamTd.appendChild(ngamInput);
      tr.appendChild(ngamTd);

      // 5. Cột Vol
      let stepIndex = item.stepGapThep || 0;
      let multi = multiList[stepIndex] || 1;
      let totalVol = item.isTienReal ? Math.max(1, Math.floor(multi * baseVol)) : 0;
      const volText = item.isTienReal && totalVol > 0 ? `${totalVol}k` : "";
      tr.appendChild(makeTd(volText));

      // 6. Cột Tay Thếp
      const tayText = item.isTienReal ? `Tay ${stepIndex + 1}/5` : "Ngâm";
      const tdTay = makeTd(tayText);
      if (item.isTienReal && stepIndex > 0) {
        tdTay.style.color = "#d81515ff";
        tdTay.style.fontWeight = "bold";
      }
      tr.appendChild(tdTay);

      // 7. Cột W/L (Thắng/Thua)
      const winLossText = `${item.win || 0}/${item.lost || 0}`;
      tr.appendChild(makeTd(winLossText));

      // 8. Cột Tổng Lãi (Profit)
      const profit = item.profit || 0;
      const totalProfitText = profit === 0 ? "0" : profit.toFixed(2);
      const tdTotal = makeTd(totalProfitText);
      if (profit > 0) {
        tdTotal.style.color = "#078607ff";
        tdTotal.style.fontWeight = "bold";
      } else if (profit < 0) {
        tdTotal.style.color = "#d81515ff";
        tdTotal.style.fontWeight = "bold";
      }
      tr.appendChild(tdTotal);


      // 10. Cột Reset
      const resetTd = document.createElement("td");
      resetTd.innerText = "🔄";
      Object.assign(resetTd.style, {
        border: "1px solid #000",
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
        fontSize: "12px",
      });
      if (!item.isReady) resetTd.style.opacity = "0.8";
      resetTd.addEventListener("click", (e) => {
        e.stopPropagation();
        window.postMessage({
          type: "RESET_ITEM_CLICK",
          stopId: item.id
        }, "*");
      });
      tr.appendChild(resetTd);

      // 11. Cột STOP
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
        stopTd.style.opacity = "0.8";
      }
      stopTd.addEventListener("click", (e) => {
        e.stopPropagation();
        window.postMessage({
          type: "STOP_CLICK",
          stopId: item.id
        }, "*");
      });
      tr.appendChild(stopTd);

      tbody.appendChild(tr);
    });

    // 2. Khôi phục focus và vị trí con trỏ
    if (focusedItemId !== null && focusedField !== null) {
      const newActive = tbody.querySelector(`input[data-item-id="${focusedItemId}"][data-field="${focusedField}"]`);
      if (newActive) {
        newActive.focus();
        try {
          const valLen = newActive.value.length;
          newActive.setSelectionRange(valLen, valLen);
        } catch (e) {}
      }
    }
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
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.8; }
          50%  { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.8; }
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
