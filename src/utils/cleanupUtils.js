
function extractNumber(str) {
  // Remove all non-numeric characters except for '.' and ','
  const cleanedStr = str.replace(/[^0-9.,]/g, '');

  // Count occurrences of '.' and ','
  const dotCount = (cleanedStr.match(/\./g) || []).length;
  const commaCount = (cleanedStr.match(/,/g) || []).length;

  let standardizedStr;

  // Handle cases with no separators
  if (dotCount + commaCount === 0) {
    return parseFloat(cleanedStr);
  }

  // Handle cases with only one separator
  if (dotCount + commaCount === 1) {
    const parts = cleanedStr.split(/[.,]/);
    // If the part after the separator has 3 digits, it's likely a thousands separator
    if (parts[1] && parts[1].length === 3) {
      return parseFloat(parts.join(''));
    } else {
      // Otherwise, treat it as a decimal separator
      return parseFloat(cleanedStr.replace(',', '.'));
    }
  }

  // Handle cases with multiple separators
  const parts = cleanedStr.split(/[.,]/);
  
  // Check if the last part has exactly 2 or 3 digits (common for cents)
  if (parts[parts.length - 1].length === 2 || parts[parts.length - 1].length === 3) {
    // Assume the last separator is the decimal point
    standardizedStr = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
  } else {
    // If not, assume it's a whole number with thousand separators
    standardizedStr = parts.join('');
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

function isPriceCorrect(price, product) {
  productId = product.productId;
  if (productId == "gpu-1") {
    return price >= 125;
  }
  if (productId == "gpu-2") {
    return price >= 250;
  }
  if (productId == "gpu-3") {
    return price >= 450;
  }
  if (productId == "gpu-4") {
    return price >= 750;
  }
  return true;
}

module.exports = {
    extractNumber,
    isCorrectGPU,
    isPriceCorrect
  };