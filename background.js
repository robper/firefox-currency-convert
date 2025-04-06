// Only create context menu if we're not in a test environment
if (typeof module === 'undefined' || !module.exports) {
  browser.contextMenus.create({
    id: "convertToSEK",
    title: "Convert to SEK",
    contexts: ["selection"]
  });
}

// Currency symbols, codes, and patterns
const CURRENCY_INFO = {
  'USD': { symbol: '$', patterns: ['$', 'USD', 'US$'] },
  'EUR': { symbol: '€', patterns: ['€', 'EUR'] },
  'GBP': { symbol: '£', patterns: ['£', 'GBP'] },
  'JPY': { symbol: '¥', patterns: ['¥', 'JPY', 'JP¥'] },
  'SEK': { symbol: 'kr', patterns: ['kr', 'SEK', ':-'] },
  'NOK': { symbol: 'kr', patterns: ['kr', 'NOK'] },
  'DKK': { symbol: 'kr', patterns: ['kr', 'DKK'] },
  'CHF': { symbol: 'Fr', patterns: ['Fr', 'CHF'] },
  'AUD': { symbol: 'A$', patterns: ['A$', 'AUD'] },
  'CAD': { symbol: 'C$', patterns: ['C$', 'CAD'] },
  'CNY': { symbol: '¥', patterns: ['¥', 'CNY', 'CN¥'] },
  'INR': { symbol: '₹', patterns: ['₹', 'INR'] },
  'RUB': { symbol: '₽', patterns: ['₽', 'RUB'] },
  'BRL': { symbol: 'R$', patterns: ['R$', 'BRL'] },
  'ZAR': { symbol: 'R', patterns: ['R', 'ZAR'] },
  'MXN': { symbol: '$', patterns: ['$', 'MXN', 'MX$'] },
  'SGD': { symbol: 'S$', patterns: ['S$', 'SGD'] },
  'HKD': { symbol: 'HK$', patterns: ['HK$', 'HKD'] },
  'NZD': { symbol: 'NZ$', patterns: ['NZ$', 'NZD'] },
  'KRW': { symbol: '₩', patterns: ['₩', 'KRW'] },
  'TRY': { symbol: '₺', patterns: ['₺', 'TRY'] },
  'IDR': { symbol: 'Rp', patterns: ['Rp', 'IDR'] },
  'ILS': { symbol: '₪', patterns: ['₪', 'ILS'] },
  'PHP': { symbol: '₱', patterns: ['₱', 'PHP'] },
  'PLN': { symbol: 'zł', patterns: ['zł', 'PLN'] },
  'THB': { symbol: '฿', patterns: ['฿', 'THB'] },
  'VND': { symbol: '₫', patterns: ['₫', 'VND'] }
};

// Handle context menu clicks
if (typeof module === 'undefined' || !module.exports) {
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convertToSEK") {
      const selectedText = info.selectionText.trim();
      
      // Try to detect the currency and amount
      const result = detectCurrencyAndAmount(selectedText);
      
      if (result) {
        convertToSEK(result.amount, result.currency, tab.id, selectedText, info.selectionStart, info.selectionEnd);
      } else {
        browser.tabs.sendMessage(tab.id, {
          type: "showError",
          message: "Please select a valid currency amount (e.g., $10.00, 10.00 USD, 100kr, SEK 100)",
          selectionStart: info.selectionStart,
          selectionEnd: info.selectionEnd
        });
      }
    }
  });
}

// --- Helper function to validate number format ---
function isValidNumberFormat(numStr) {
    // Allows: 123 | 123.45 | 123,45 | 1,234.56 | 1.234,56 | 1,234,567 | 1.234.567
    // Disallows: 1.234.56 | 1,234,56 | 1.23,45 | 1,23.45 | etc.

    const hasComma = numStr.includes(',');
    const hasPeriod = numStr.includes('.');

    if (hasComma && hasPeriod) {
        const lastComma = numStr.lastIndexOf(',');
        const lastPeriod = numStr.lastIndexOf('.');
        // Case 1: European format 1.234,56
        if (lastComma > lastPeriod) {
            // Period is thousands, comma is decimal
            // Check: Only one comma, all periods must be thousands separators
            if (numStr.split(',').length !== 2) return false; // Must have exactly one comma
            const integerPart = numStr.substring(0, lastComma);
            const decimalPart = numStr.substring(lastComma + 1);
            if (!/^\d+$/.test(decimalPart)) return false; // Decimal part must be digits
            // Check thousands separators
            const thousandsParts = integerPart.split('.');
            if (!/^\d{1,3}$/.test(thousandsParts[0])) return false; // First part 1-3 digits
            for (let i = 1; i < thousandsParts.length; i++) {
                if (!/^\d{3}$/.test(thousandsParts[i])) return false; // Subsequent parts must be 3 digits
            }
            return true;
        }
        // Case 2: US format 1,234.56
        else {
            // Comma is thousands, period is decimal
            // Check: Only one period, all commas must be thousands separators
             if (numStr.split('.').length !== 2) return false; // Must have exactly one period
            const integerPart = numStr.substring(0, lastPeriod);
            const decimalPart = numStr.substring(lastPeriod + 1);
            if (!/^\d+$/.test(decimalPart)) return false; // Decimal part must be digits
            // Check thousands separators
            const thousandsParts = integerPart.split(',');
             if (!/^\d{1,3}$/.test(thousandsParts[0])) return false; // First part 1-3 digits
            for (let i = 1; i < thousandsParts.length; i++) {
                 if (!/^\d{3}$/.test(thousandsParts[i])) return false; // Subsequent parts must be 3 digits
            }
            return true;
        }
    } else if (hasComma || hasPeriod) {
        const separator = hasComma ? ',' : '.';
        const parts = numStr.split(separator);
        // Case 3: Thousands separators only (1,234,567 or 1.234.567)
        if (parts.length > 2) {
             if (!/^\d{1,3}$/.test(parts[0])) return false; // First part 1-3 digits
            for (let i = 1; i < parts.length; i++) {
                 if (!/^\d{3}$/.test(parts[i])) return false; // Subsequent parts must be 3 digits
            }
             // Check that the decimal part, if present, is valid
             if (parts.length > 1 && !/^\d{3}$/.test(parts[parts.length - 1])) {
                 // If the last part isn't 3 digits, it might be a decimal (e.g. 1.234.56) - invalid standalone
                 return false; 
             }

            return true;
        }
        // Case 4: Decimal separator only (123,45 or 123.45)
        else if (parts.length === 2) {
             return /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]); // Both parts must be digits
        } else { // parts.length === 1, should not happen if separator exists
             return false;
        }
    } else {
        // Case 5: No separators (12345)
        return /^\d+$/.test(numStr);
    }
}

// --- Helper function to parse number string ---
function parseNumber(numStr) {
    const hasComma = numStr.includes(',');
    const hasPeriod = numStr.includes('.');

    if (hasComma && hasPeriod) {
        if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
            // European: 1.234,56 -> 1234.56
            return parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
        } else {
            // US: 1,234.56 -> 1234.56
            return parseFloat(numStr.replace(/,/g, ''));
        }
    } else if (hasComma) {
        // Can be 1,234,567 or 123,45
        if (numStr.split(',').length > 2) { // Thousands only
            return parseFloat(numStr.replace(/,/g, ''));
        } else { // Decimal only
            return parseFloat(numStr.replace(',', '.'));
        }
    } else if (hasPeriod) {
        // Can be 1.234.567 or 123.45
        if (numStr.split('.').length > 2) { // Thousands only
             return parseFloat(numStr.replace(/\./g, ''));
        } else { // Decimal only
            return parseFloat(numStr);
        }
    } else {
        // No separators: 12345
        return parseFloat(numStr);
    }
}

// Function to detect currency and amount from text
function detectCurrencyAndAmount(text) {
  // Remove any whitespace
  text = text.replace(/\s+/g, '');

  // Try to match currency patterns
  for (const [currency, info] of Object.entries(CURRENCY_INFO)) {
    for (const pattern of info.patterns) {
      // Escape special regex characters in the pattern
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Define a more general regex for the number part
      const potentialNumberRegex = /([\d.,]+)/;

      // Pattern 1: Symbol before number (e.g., $1,234.56)
      const regex1 = new RegExp(`^${escapedPattern}(${potentialNumberRegex.source})$`, 'i');
      // Pattern 2: Symbol after number (e.g., 1.234,56 €)
      const regex2 = new RegExp(`^(${potentialNumberRegex.source})${escapedPattern}$`, 'i');
      // ISO codes are handled if they are in the patterns list (like 'USD', 'SEK')

      const match1 = text.match(regex1);
      const match2 = text.match(regex2);

      let numberStr = null;
      if (match1) numberStr = match1[1];
      else if (match2) numberStr = match2[1];

      if (numberStr) {
        // Validate the extracted number string format
        if (isValidNumberFormat(numberStr)) {
          // Parse the validated number string
          const amount = parseNumber(numberStr);
          // Ensure parsing was successful (not NaN)
          if (!isNaN(amount)) {
            return { currency, amount };
          }
        }
        // If format is invalid or parsing failed, continue to next pattern/currency
      }
    }
  }

  return null; // No valid currency amount found
}

// Function to convert to SEK
async function convertToSEK(amount, fromCurrency, tabId, selectedText, selectionStart, selectionEnd) {
  try {
    // Using a fixed rate for simplicity (you can replace this with an API call)
    const RATES = {
      'USD': 10.5,  // 1 USD = 10.5 SEK
      'EUR': 11.2,  // 1 EUR = 11.2 SEK
      'GBP': 13.0,  // 1 GBP = 13.0 SEK
      'JPY': 0.08,  // 1 JPY = 0.08 SEK
      'NOK': 1.0,   // 1 NOK = 1.0 SEK
      'DKK': 1.5,   // 1 DKK = 1.5 SEK
      'CHF': 11.8,  // 1 CHF = 11.8 SEK
      'AUD': 7.0,   // 1 AUD = 7.0 SEK
      'CAD': 7.8,   // 1 CAD = 7.8 SEK
      'CNY': 1.5,   // 1 CNY = 1.5 SEK
      'INR': 0.13,  // 1 INR = 0.13 SEK
      'RUB': 0.12,  // 1 RUB = 0.12 SEK
      'BRL': 2.1,   // 1 BRL = 2.1 SEK
      'ZAR': 0.6,   // 1 ZAR = 0.6 SEK
      'MXN': 0.6,   // 1 MXN = 0.6 SEK
      'SGD': 7.8,   // 1 SGD = 7.8 SEK
      'HKD': 1.3,   // 1 HKD = 1.3 SEK
      'NZD': 6.5,   // 1 NZD = 6.5 SEK
      'KRW': 0.008, // 1 KRW = 0.008 SEK
      'TRY': 0.35,  // 1 TRY = 0.35 SEK
      'IDR': 0.0007,// 1 IDR = 0.0007 SEK
      'ILS': 2.8,   // 1 ILS = 2.8 SEK
      'PHP': 0.19,  // 1 PHP = 0.19 SEK
      'PLN': 2.5,   // 1 PLN = 2.5 SEK
      'THB': 0.3,   // 1 THB = 0.3 SEK
      'VND': 0.0004 // 1 VND = 0.0004 SEK
    };
    
    const rate = RATES[fromCurrency] || 10.5; // Default to USD rate if currency not found
    const sekAmount = (amount * rate).toFixed(2);
    
    const result = {
      type: "showConversion",
      original: selectedText,
      converted: `${sekAmount} SEK`,
      selectedText: selectedText,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd
    };

    if (tabId && typeof browser !== 'undefined' && browser.tabs) {
      browser.tabs.sendMessage(tabId, result);
    }
    
    return result;
  } catch (error) {
    const errorResult = {
      type: "showError",
      message: "Failed to convert currency",
      selectionStart: selectionStart,
      selectionEnd: selectionEnd
    };

    if (tabId && typeof browser !== 'undefined' && browser.tabs) {
      browser.tabs.sendMessage(tabId, errorResult);
    }
    
    return errorResult;
  }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectCurrencyAndAmount,
    convertToSEK,
    isValidNumberFormat, // Optionally export helpers if needed for direct testing
    parseNumber
  };
} 