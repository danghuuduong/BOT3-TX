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
      }else{
        btn.innerHTML = '👁️ Tắt vị trí';
        btn.style.backgroundColor = "gray";
        clicked = false;
      }
    });
  });
}

module.exports = { UI_Btn_Show_TieuDiem };
