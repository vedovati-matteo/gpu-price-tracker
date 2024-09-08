
function extractNumber(str) {
  // Remove all non-numeric characters except for '.' and ','
  const cleanedStr = str.replace(/[^0-9.,]/g, '');

  let standardizedStr;

  // Check if there's more than one decimal separator
  const dotCount = (cleanedStr.match(/\./g) || []).length;
  const commaCount = (cleanedStr.match(/,/g) || []).length;

  if (dotCount <= 1 && commaCount <= 1) {
    if (commaCount === 1 && dotCount === 0) {
      // If there's only one comma and no dots, treat comma as decimal separator
      standardizedStr = cleanedStr.replace(',', '.');
    } else if (commaCount === 1 && dotCount === 1) {
      // If there's both a comma and a dot, assume comma is thousands separator
      standardizedStr = cleanedStr.replace(',', '');
    } else {
      // In all other cases, leave as is
      standardizedStr = cleanedStr;
    }
  } else {
    // If there are multiple dots or commas, assume last one is decimal separator
    standardizedStr = cleanedStr.replace(/[.,]/g, (match, index, original) => 
      index === original.lastIndexOf('.') || index === original.lastIndexOf(',') ? '.' : ''
    );
  }

  // Convert to a number, handling potential NaN
  const num = parseFloat(standardizedStr);

  if (isNaN(num)) {
    console.error("Invalid input string:", str);
    return null;
  }

  return num;
}

function isCorrectGPU(gpuName, product) {
  const lowercaseGpuName = gpuName.toLowerCase();
  const lowercaseProductName = product.name.toLowerCase();
  const lowercaseExpectedVRAM = product.vram.toLowerCase();

  // VRAM check
  const vramVariations = [
    lowercaseExpectedVRAM, // Exact match
    lowercaseExpectedVRAM.replace("gb", "g"), // Replace 'gb' with 'g'
    lowercaseExpectedVRAM.replace(" ", ""), // Remove spaces
    lowercaseExpectedVRAM.replace("gb", " g"), // Add space before 'g'
  ];

  const vramCheck = vramVariations.some(variation => lowercaseGpuName.includes(variation));

  // RTX or GTX check
  const rtxCheck = lowercaseGpuName.includes('rtx') === lowercaseProductName.includes('rtx');
  const gtxCheck = lowercaseGpuName.includes('gtx') === lowercaseProductName.includes('gtx');

  // GPU number check
  const gpuNumberMatch = lowercaseProductName.match(/\d{4}/);
  const gpuNumberCheck = gpuNumberMatch ? lowercaseGpuName.includes(gpuNumberMatch[0]) : false;

  // TI and SUPER check
  const tiCheck = lowercaseGpuName.includes('ti') === lowercaseProductName.includes('ti');
  const superCheck = lowercaseGpuName.includes('super') === lowercaseProductName.includes('super');

  // All checks must pass
  return vramCheck && rtxCheck && gtxCheck && gpuNumberCheck && tiCheck && superCheck;
}

module.exports = {
    extractNumber,
    isCorrectGPU
  };