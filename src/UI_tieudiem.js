

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
        "Cầu", "Hướng", "Chờ", "Ngâm", "Vol",
        "L.Thua", "W/L", "T.Cao", "T1", "T2", "T3", "T4", "T5", "T6",
        "In.Tỉa", "Tỉa?", "Lãi.Tỉa", "Lãi.Tầng", "L.ChuKi", "Profit", "Mục Tiêu", "Reset", "STOP"
      ];

      const widths = [
        "40px", "38px", "22px", "45px", "28px",
        "60px", "35px", "35px", "32px", "32px", "32px", "32px", "32px", "32px",
        "40px", "30px", "40px", "50px", "50px", "50px", "50px", "35px", "25px"
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

      // 1. Cột ID
      tr.appendChild(makeTd(`${item.type} ${item.isDaoNguoc ? ' 🔄' : ''}`));

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
      ngamInput.value = item.Ngam !== undefined ? item.Ngam : 2;
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

      // 5. Cột Vol (Tổng vol các tầng đang mở)
      const sumBaseVol = (item.Tangs || []).filter(t => t.isOpen).reduce((sum, t) => sum + t.baseVol, 0);
      const totalVol = Math.floor(sumBaseVol * baseVol);
      const volText = totalVol > 0 ? `${totalVol} k` : "-";
      tr.appendChild(makeTd(volText));

      // 5b. Cột L.Thua (Số lần thua thực tế)
      const lostCountText = item.soLanThuaReal !== undefined ? `${item.soLanThuaReal}` : "0";
      const tdLostCount = makeTd(lostCountText);
      if (item.soLanThuaReal > 0) {
        tdLostCount.style.color = "#d81515ff";
        tdLostCount.style.fontWeight = "bold";
      }
      tr.appendChild(tdLostCount);

      // 5c. Cột T/T (Thắng/Thua)
      const winLossText = `${item.win || 0}/${item.lost || 0}`;
      tr.appendChild(makeTd(winLossText));

      // 5d. Cột T.Cao (Tầng DCA cao nhất)
      const maxTangText = `${item.maxTang || 1}`;
      const tdMaxTang = makeTd(maxTangText);
      if ((item.maxTang || 1) >= 3) {
        tdMaxTang.style.color = "#d81515ff";
        tdMaxTang.style.fontWeight = "bold";
      }
      tr.appendChild(tdMaxTang);

      // 6..12. Các cột T1 .. T6
      const tangsList = item.Tangs || [];
      tangsList.forEach(t => {
        let text = "";
        let color = "inherit";
        let fontWeight = "normal";
        let className = "";
        if (t.isOpen) {
          const profVal = t.profitOfTang || 0;
          if (profVal === 0) {
            text = "";
          } else if (profVal > 0) {
            text = "+" + profVal.toFixed(1);
            color = "#078607ff";
            fontWeight = "bold";
          } else {
            text = profVal.toFixed(1);
            color = "#d81515ff";
            fontWeight = "bold";
          }
          className = "active-floor";
        } else if (t.isTia) {
          text = "✅";
        }
        const tdT = makeTd(text);
        tdT.style.color = color;
        tdT.style.fontWeight = fontWeight;
        if (className) {
          tdT.className = className;
        }
        tr.appendChild(tdT);
      });

      // 12. Cột In.Tỉa (InputTia) - Input chỉnh được
      const tiaTd = document.createElement("td");
      Object.assign(tiaTd.style, {
        border: "1px solid #000",
        padding: "1px 2px",
        textAlign: "center",
      });
      if (!item.isReady) tiaTd.style.opacity = "0.8";

      const tiaInput = document.createElement("input");
      tiaInput.type = "number";
      tiaInput.value = item.InputTia || 4;
      tiaInput.min = 1;
      tiaInput.max = 6;
      Object.assign(tiaInput.style, {
        width: "28px", fontSize: "10px",
        border: "1px solid #aaa", borderRadius: "2px",
        textAlign: "center", padding: "0",
      });
      tiaInput.addEventListener("change", (e) => {
        e.stopPropagation();
        const newVal = parseInt(e.target.value);
        if (!isNaN(newVal) && newVal >= 1)
          window.postMessage({ type: "UPDATE_INPUT_TIA", stopId: item.id, value: newVal }, "*");
      });
      tiaInput.addEventListener("click", e => e.stopPropagation());
      tiaTd.appendChild(tiaInput);
      tr.appendChild(tiaTd);

      // 13. Cột Tỉa? (isTiaLenh)
      const isTiaText = item.isTiaLenh ? "🔥" : "-";
      const tdTiaState = makeTd(isTiaText);
      if (item.isTiaLenh) {
        tdTiaState.style.color = "#ff4d4d";
        tdTiaState.style.fontWeight = "bold";
      }
      tr.appendChild(tdTiaState);

      // 14. Cột L.Tỉa
      const realizedP = item.realizedProfit || 0;
      const realizedText = realizedP === 0 ? "0" : realizedP.toFixed(2);
      const tdRealized = makeTd(realizedText);
      if (realizedP > 0) {
        tdRealized.style.color = "#078607ff";
        tdRealized.style.fontWeight = "bold";
      } else if (realizedP < 0) {
        tdRealized.style.color = "#d81515ff";
        tdRealized.style.fontWeight = "bold";
      }
      tr.appendChild(tdRealized);

      // 14b. Cột Tổng lãi Tầng (Lãi Tầng All)
      const profitTang = (item.Tangs || []).reduce((sum, t) => sum + (t.isOpen ? (t.profitOfTang || 0) : 0), 0);
      const profitTangText = profitTang === 0 ? "0" : profitTang.toFixed(2);
      const tdProfitTang = makeTd(profitTangText);
      if (profitTang > 0) {
        tdProfitTang.style.color = "#078607ff";
        tdProfitTang.style.fontWeight = "bold";
      } else if (profitTang < 0) {
        tdProfitTang.style.color = "#d81515ff";
        tdProfitTang.style.fontWeight = "bold";
      }
      tr.appendChild(tdProfitTang);

      // 14c. Cột Tổng lãi chu kỳ (L.CK)
      const totalProfitCK = (item.realizedProfit || 0) + profitTang;
      const totalProfitCKText = totalProfitCK === 0 ? "0" : totalProfitCK.toFixed(2);
      const tdProfitCK = makeTd(totalProfitCKText);
      if (totalProfitCK > 0) {
        tdProfitCK.style.color = "#078607ff";
        tdProfitCK.style.fontWeight = "bold";
      } else if (totalProfitCK < 0) {
        tdProfitCK.style.color = "#d81515ff";
        tdProfitCK.style.fontWeight = "bold";
      }
      tr.appendChild(tdProfitCK);

      // 15. Cột Tổng Lãi
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

      // 16. Cột Mục Tiêu (profitMongMuon) - editable
      const mucTieuTd = document.createElement("td");
      Object.assign(mucTieuTd.style, {
        border: "1px solid #000",
        padding: "1px",
        textAlign: "center",
      });
      const mucTieuInput = document.createElement("input");
      mucTieuInput.type = "number";
      mucTieuInput.value = item.profitMongMuon || 0;
      Object.assign(mucTieuInput.style, {
        width: "44px",
        fontSize: "11px",
        textAlign: "center",
        border: "1px solid #aaa",
        borderRadius: "3px",
        padding: "1px 2px",
        background: "#fffde7",
      });
      mucTieuInput.addEventListener("change", e => {
        const value = parseFloat(e.target.value) || 0;
        window.postMessage({
          type: "UPDATE_PROFIT_MUON",
          stopId: item.id,
          value
        }, "*");
      });
      mucTieuInput.addEventListener("click", e => e.stopPropagation());
      mucTieuTd.appendChild(mucTieuInput);
      tr.appendChild(mucTieuTd);

      // 17. Cột Reset
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

      // 18. Cột STOP
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
