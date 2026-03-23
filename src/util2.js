
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

function handleGetTien(monyTong, phantram) {
  const tienPhanTram = monyTong * phantram / 100;
  return Math.floor(tienPhanTram); // làm tròn xuống
}



module.exports = { handleGetTien };


