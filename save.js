let isStart = false;
let isOpen = false;

function getStart() { return isStart; }
function getOpen() { return isOpen; }
function setStart(value) { isStart = value; }
function setOpen(value) { isOpen = value; }

module.exports = { getStart, getOpen, setStart, setOpen };
