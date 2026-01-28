// function handleGetTien(thep, monyTong, phantram) {
//   const tienPhanTram = monyTong * (phantram / 100);
//   const level = Math.floor(tienPhanTram / 85);
//   if (level === 0) return 0;

//   const base = level * 85;

//   switch (thep) {
//     case 1:  return Math.floor(base / 42.5);
//     case 2:  return Math.floor(base / 17);
//     case 3:  return Math.floor(base / 7.72727272727);
//     case 4:  return Math.floor(base / 3.86363636364);
//     case 5:  return Math.floor(base / 1.88888888889);
//     case 6:  return Math.floor(base / 0.944444444445);
//     case 7:  return Math.floor(base / 0.472222222222);
//     // case 8:  return Math.floor(base / 0.236111111111);
//     // case 9:  return Math.floor(base / 0.118055555556);
//     // case 10: return Math.floor(base / 0.059027777778);
//     default:
//       return 0;
//   }
// }

// module.exports = { handleGetTien };


// function handleGetTien(thep, monyTong, phantram) {
//   const tienPhanTram = monyTong * (phantram / 100);
//   const level = Math.floor(tienPhanTram / 439);
//   if (level === 0) return 0;

//   const base = level * 439;

//   switch (thep) {
//     case 1: return Math.floor(base / 439);              // 1
//     case 2: return Math.floor(base / 146.333333333);    // 3
//     case 3: return Math.floor(base / 73.1666666667);   // 6
//     case 4: return Math.floor(base / 33.7692307692);   // 13
//     case 5: return Math.floor(base / 16.2592592593);   // 27
//     case 6: return Math.floor(base / 7.98181818182);   // 55
//     case 7: return Math.floor(base / 3.95495495495);   // 111
//     case 8: return Math.floor(base / 1.969507489);     // 223
//     default:
//       return 0;
//   }
// }

function handleGetTien(thep, monyTong, phantram) {
  const tienPhanTram = monyTong * phantram / 100;
  const level = Math.floor(tienPhanTram / 439);
  if (level <= 0) return 0;

  const heSo = [1, 3, 6, 13, 27, 55, 111, 223];

  return level * (heSo[thep - 1] || 0);
}



module.exports = { handleGetTien };


