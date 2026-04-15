
function handleGetTien(monyTong, phantram) {
  const tienPhanTram = monyTong * phantram / 100;
  return Math.floor(tienPhanTram); // làm tròn xuống
}

async function ghiNhanThuNhap(soTienMuonRut) {
  try {
    if (typeof fetch !== "undefined") {
      await fetch("http://localhost:7070/in-come", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "Sun",
          transactionType: "INCOME",
          amount: soTienMuonRut / 27,
          date: new Date().toISOString()
        })
      });
      console.log("✅ Đã ghi nhận thu nhập từ lệnh rút tiền:", soTienMuonRut);
    } else {
      console.warn("⚠️ Môi trường không hỗ trợ fetch, vui lòng nâng cấp Node.js hoặc cấu hình axios.");
    }
  } catch (err) {
    console.error("❌ Lỗi khi gửi dữ liệu thu nhập:", err);
  }
}

async function luuTruTrangThai(data) {
  try {
    // Đảm bảo stateId luôn tồn tại để NestJS thực hiện logic Upsert (Update hoặc Insert)
    const payload = {
      stateId: "main_state_tx", // Định danh duy nhất cho trạng thái này
      ...data
    };

    if (typeof fetch !== "undefined") {
      // Sửa lại URL: Thêm /update (hoặc /sync tùy theo Controller của bạn)
      const response = await fetch("http://localhost:7070/state-tx/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // if (!response.ok) {
      //   const errorText = await response.text();
      //   throw new Error(`Server response error: ${errorText}`);
      // }

      const result = await response.json();
      // console.log("✅ Đã đồng bộ trạng thái State-TX thành công");
      return result;
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi api lưu trạng thái:", err.message);
  }
}

module.exports = { handleGetTien, ghiNhanThuNhap, luuTruTrangThai };
