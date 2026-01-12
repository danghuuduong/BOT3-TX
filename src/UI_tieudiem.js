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
      // Container để scroll
      const container = document.createElement("div");
      container.id = "longmach-table-container";
      Object.assign(container.style, {
        position: "fixed",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        maxHeight: "200px",   // hiển thị khoảng 8 hàng (~25px mỗi hàng)
        overflowY: "auto",
        zIndex: 9999,
      });

      // Tạo table
      const table = document.createElement("table");
      table.id = "longmach-table";
      Object.assign(table.style, {
        width: "100%",
        background: "#fff",   // nền trắng
        borderCollapse: "collapse",
        fontSize: "12px",
      });

      // Thêm thead
      const thead = document.createElement("thead");
      const tr = document.createElement("tr");
      ["ID", "Type", "FOMO", "Vô", "Hướng", "Ngầm", "Thếp", "Số Tiền", "Win", "Lost", "Lãi", "A", "B", "C", "D", "E", "Cháy"]
        .forEach(h => {
          const th = document.createElement("th");
          th.innerText = h;
          Object.assign(th.style, {
            border: "1px solid #000",
            padding: "4px 6px",
            color: "#000",
            background: "#eee",
            textAlign: "center",
          });
          tr.appendChild(th);
        });
      thead.appendChild(tr);
      table.appendChild(thead);

      // Thêm tbody
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
      const cols = [
        item.id,
        item.type,
        item.isFomo ? "" : "🔥",
        item.isTrading ? "ON" : "Chưa",
        item.huong,
        `${item.thepDanhChoNgam}/${item.ngam}`,
        item.thep,
        item.vol,
        item.win,
        item.lost,
        item.profit.toFixed(2),
        item.A, item.B, item.C, item.D, item.E,
        item.deal,
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

      tbody.appendChild(tr);
    });
  }, data);


}



async function UI_History(page) {
  await page.evaluate(() => {
    if (!document.getElementById("history-container")) {
      const container = document.createElement("div");
      container.id = "history-container";
      Object.assign(container.style, {
        position: "fixed",
        top: "50%",
        right: "5px",
        transform: "translateY(-50%)",
        width: "200px",
        maxHeight: "330px",
        minHeight: "200px",
        overflowY: "auto",
        backgroundColor: "#fff",
        border: "1px solid #000",
        borderRadius: "5px",
        padding: "5px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
      });
      document.body.appendChild(container);
    }
  });
}

async function UI_Update_History(page, history) {
  await page.evaluate((history) => {
    const container = document.getElementById("history-container");
    if (!container) return;

    container.innerHTML = ""; // xóa cũ

    // Render theo yêu cầu: chia 2 dòng
    history.forEach(item => {
      const div = document.createElement("div");
      div.style.marginBottom = "6px";
      div.style.borderBottom = "1px dashed #ccc";
      div.style.paddingBottom = "2px";

      div.innerHTML = `
        <div>${item.time}: ${item.type} - ${item.huong}</div>
        <div>- Tại thép: ${item.thep}, Số tiền: ${item.vol} (k)</div>
      `;
      container.appendChild(div);
    });

    // Tự scroll xuống dưới mỗi khi update
    container.scrollTop = container.scrollHeight;

  }, history);
}


module.exports = { UI_TieuDiem, UI_Update_Table, UI_Table_LuuTru, UI_Update_History, UI_History };
