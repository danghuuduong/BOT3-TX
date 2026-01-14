function handleGetTien(thep, monyTong, phantram = 10) {
  const tienPhanTram = monyTong * (phantram / 100);
  const level = Math.floor(tienPhanTram / 85);
  if (level === 0) return 0;

  const base = level * 85;

  switch (thep) {
    case 1:  return Math.floor(base / 42.5);
    case 2:  return Math.floor(base / 17);
    case 3:  return Math.floor(base / 7.72727272727);
    case 4:  return Math.floor(base / 3.86363636364);
    case 5:  return Math.floor(base / 1.88888888889);

    case 6:  return Math.floor(base / 0.94444444444);
    case 7:  return Math.floor(base / 0.47222222222);
    case 8:  return Math.floor(base / 0.23611111111);
    case 9:  return Math.floor(base / 0.11805555556);
    case 10: return Math.floor(base / 0.05902777778);

    default:
      return 0;
  }
}


module.exports = {
  handleGetTien
};