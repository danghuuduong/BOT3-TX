async function updateButton(page,text, color) {
  await page.evaluate(({ text, color }) => {
    const btn = document.getElementById("start-button");
    btn.innerText = text;
    btn.style.backgroundColor = color;
  }, { text, color });
}

function handleGetColor_TX(r, g, b) {
    // Chuyển sang tỉ lệ 0-1
    const R = r / 255;
    const G = g / 255;
    const B = b / 255;

    const avg = (R + G + B) / 3;

    // Trắng sáng, trắng kem
    if (avg > 0.95) return "trắng sáng";
    if (avg > 0.85) return "trắng kem";

    // Đen
    if (avg < 0.2) return "đen";
    return "no";
}


module.exports = { updateButton, handleGetColor_TX };
