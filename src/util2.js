function handleGetTien(thep, monyTong, phantram) {
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
    case 6:  return Math.floor(base / 0.944444444445);
    case 7:  return Math.floor(base / 0.472222222222);
    case 8:  return Math.floor(base / 0.236111111111);
    case 9:  return Math.floor(base / 0.118055555556);
    case 10: return Math.floor(base / 0.059027777778);
    case 11: return Math.floor(base / 0.029513888889);
    case 12: return Math.floor(base / 0.014756944444);
    case 13: return Math.floor(base / 0.007378472222);
    case 14: return Math.floor(base / 0.003689236111);
    case 15: return Math.floor(base / 0.001844618056);
    default:
      return 0;
  }
}

module.exports = { handleGetTien };
