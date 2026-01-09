const { chromium } = require("playwright");
const { PNG } = require("pngjs");

// ==== Biến toàn cục để tái sử dụng ====
const colorArray = [];
const startX = 51;
const startY = 51;
const width = 100;
const height = 100;

// ==== Hàm hiển thị màu trên trang ====
async function showColorOnPage(page, r, g, b, x, y, width, height) {
  await page.evaluate(({ r, g, b, x, y, width, height }) => {
    let div = document.getElementById("color-overlay");
    if (!div) {
      div = document.createElement("div");
      div.id = "color-overlay";
      div.style.position = "absolute";
      div.style.zIndex = 9999;
      div.style.pointerEvents = "none"; // không cản click
      document.body.appendChild(div);
    }

    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.backgroundColor = `rgb(${r},${g},${b})`;
    div.style.border = "2px solid red";
    div.style.opacity = 0.5;

    // 👉 căn giữa theo (x, y)
    div.style.transform = "translate(-50%, -50%)";
  }, { r, g, b, x, y, width, height });
}


// ==== Hàm kiểm tra màu và click nếu trùng ====
async function checkColorAndClick(page, hex, x, y, targetHex = "#075be3") {
  console.log(`Kiểm tra màu: ${hex}, so sánh với target: ${targetHex}`);
  if (hex === targetHex) {
    console.log(`Màu trùng! Click vào vị trí (${x}, ${y})`);
    await page.mouse.click(x, y);
  }
}

// ==== Hàm chụp ảnh và lấy màu trung bình ====
async function captureAndGetColor(page) {
  try {
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const png = PNG.sync.read(screenshotBuffer);

    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        const idx = (png.width * y + x) << 2;
        rSum += png.data[idx];
        gSum += png.data[idx + 1];
        bSum += png.data[idx + 2];
        count++;
      }
    }

    const rAvg = Math.round(rSum / count);
    const gAvg = Math.round(gSum / count);
    const bAvg = Math.round(bSum / count);
    const hex = "#" + [rAvg, gAvg, bAvg].map(v => v.toString(16).padStart(2, "0")).join("");

    // Lưu vào array
    colorArray.push({ rgb: [rAvg, gAvg, bAvg], hex });
    console.log(`Mã màu lần ${colorArray.length}: RGB(${rAvg},${gAvg},${bAvg}) HEX ${hex}`);

    // Gọi hàm kiểm tra màu và click
    await checkColorAndClick(page, hex, startX, startY);

    // Hiển thị màu trên trang
    await showColorOnPage(page, rAvg, gAvg, bAvg, startX, startY, width, height);

  } catch (error) {
    console.error("Lỗi khi lấy màu:", error);
  }
}

// ==== Main ====
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.facebook.com", { waitUntil: "networkidle" });

  // Gọi lần đầu
  await captureAndGetColor(page);

  // Sau đó cứ 70 giây gọi lại
  setInterval(() => captureAndGetColor(page),  7 * 1000);
})();



 function cac() {
  console.log(`abc`);
}
cac();

