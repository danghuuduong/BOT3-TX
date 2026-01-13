
function handleGetTien(thep, monyTong, phantram = 10) {
  // Lấy phần trăm của monyTong
  const tienPhanTram = monyTong * (phantram / 100);
  
  // Tính ga thực tế chia cho 85
  const level = Math.floor(tienPhanTram / 85);
  if(level === 0) return 0;

  switch (thep) {
    case 1: return (level * 85) / 42.5;
    case 2: return (level * 85) / 17;
    case 3: return (level * 85) / 7.72727272727;
    case 4: return (level * 85) / 3.86363636364;
    case 51: return (level * 85) / 1.88888888889;
    default:
      return 0;
  }
}




module.exports = {
  handleGetTien
};