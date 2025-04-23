let currentTargetCurrency = 'SEK'; // Default value

console.log('Background script initialized');

function initializeBackgroundScript() {
  console.log('Initializing background script');

  browser.contextMenus.create({
    id: "convert-currency",
    title: "Convert to SEK",
    contexts: ["selection"]
  });

  browser.storage.local.get("targetCurrency").then((result) => {
    console.log('Stored Currency:', result.targetCurrency);
    currentTargetCurrency = result.targetCurrency || 'SEK';
    console.log('Loaded Currency:', currentTargetCurrency);
    getExchangeRates().then(() => { console.log('Exchange rates loaded') }).catch(error => {
      console.error('Error loading exchange rates:', error);
    }
    );
    setupContextMenu();
  }).catch(error => {
    console.error('Error loading target currency from browser store:', error);
  });

  // Listen for changes in storage to update the context menu title dynamically
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.targetCurrency) {
      currentTargetCurrency = changes.targetCurrency.newValue || 'SEK';
      console.log('Updated Currency:', currentTargetCurrency);
      updateContextMenuTitle();
      handleNewCurrency(currentTargetCurrency);
    }
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convert-currency") {
      const selectedText = info.selectionText.trim();

      // Try to detect the currency and amount
      detectCurrencyAndAmount(selectedText).then((result) => {
        console.log('Detected Currency:', result.currency, 'Amount:', result.amount);

        if (result) {
          convertToX(result.amount, result.currency, tab.id, selectedText);
        } else if (currency === currentTargetCurrency) {
          browser.tabs.sendMessage(tab.id, {
            type: "showError",
            message: "Target currency is the same as selected currency",
          });
        }
        else {
          if (browser) {
            browser.tabs.sendMessage(tab.id, {
              type: "showError",
              message: "Please select a valid currency amount (e.g., $10.00, 10.00 USD, 100kr, SEK 100)",
            });
          }
        }
      }
      )
    }
  });
}
const CURRENCY_INFO = {
  'USD': { symbol: '$', patterns: ['$', 'US$'] },
  'EUR': { symbol: '€', patterns: ['€'] },
  'GBP': { symbol: '£', patterns: ['£'] },
  'JPY': { symbol: '¥', patterns: ['¥', 'JP¥'] },
  'SEK': { symbol: 'kr', patterns: ['kr', ':-'] },
  'CNY': { symbol: '¥', patterns: ['CN¥'] },
};
async function getExchangeRates() {
  let storageResp = await browser.storage.local.get("exchangeRates")

  // Check if current date is more than storageResp.time_next_update_utc, which tells us to update the rates
  const timeNextUpdate = new Date(storageResp.time_next_update_utc);
  const currentDate = new Date();

  if (storageResp === undefined || storageResp.exchangeRates === undefined || currentDate > timeNextUpdate) {
    console.log('No exchange rates found, fetching...');
    fetchExchangeRates(currentTargetCurrency).then((data) => {
      storeExchangeRates(data);
      storageResp = data;
    });
  }
  return storageResp.exchangeRates;
}
async function handleNewCurrency(currency) {
  // Fetch the latest exchange rates
  const data = await fetchExchangeRates(currency);
  if (!data) {
    console.error('Failed to fetch exchange rates');
    return;
  }
  // Store the fetched exchange rates in local storage
  await storeExchangeRates(data);
  console.log('Exchange rates updated:', data);
  // Update the context menu title
}
async function storeExchangeRates(data) {
  try {
    await browser.storage.local.set({ exchangeRates: data });
    console.log('Exchange rates stored in local storage');
  } catch (error) {
    console.error('Error storing exchange rates:', error);
  }
}
async function fetchExchangeRates(currency = 'SEK') {
  try {
    console.log('Fetching from', 'https://open.er-api.com/v6/latest/' + currency);
    const response = await fetch('https://open.er-api.com/v6/latest/' + currency);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}
// https://www.youtube.com/watch?v=ZRwn-8QVFl0
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
  if (!isValidNumberFormat(numStr)) {
    return NaN
  }
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
    // Den här ser fel ut? Tar ju bort alla komman
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

const currencySymbols = {
  '$': 'USD',
  'US$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  'JP¥': 'JPY',
  'KR': 'SEK',
  ':-': 'SEK',
  'CN¥': 'CNY'
};

async function detectCurrencyAndAmount(text) {
  console.log('Detect: ', text)
  // Remove any whitespace
  text = text.replace(/\s+/g, '');
  text = text.toUpperCase(); // Convert to uppercase for case-insensitive matching

  // Regex för nummer
  const potentialNumberRegex = /([\d.,]+)/;
  // Regex for symbols, must be updated if we add more to currencySymbols
  const symbolRegex = /(US\$|\$|£|€|KR|:-|JP¥|CN¥|¥)/;

  // getExchangeRates().then((exchangeRates) => {
  let numberStr = null;
  let currency = null;
  let exchangeRates = await getExchangeRates()
  for (const ISOCode in (exchangeRates.rates)) {
    // for (const ISOCode in (newRates.rates)) {
    console.log('ISOs', ISOCode, 'codes', exchangeRates.rates[ISOCode]);

    // Not needed
    const escapedISOCode = ISOCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    console.log('Escaped ISO', escapedISOCode);

    // RegExp.source gets the regex string
    // Pattern 1: ISO code before number (e.g., USD1,234.56)
    const ISOBefore = new RegExp(`^${escapedISOCode}(${potentialNumberRegex.source})$`, 'i');
    // Pattern 2: ISO code after number (e.g., 1.234,56USD)
    const ISOAfter = new RegExp(`^(${potentialNumberRegex.source})${escapedISOCode}$`, 'i');
    // Pattern 3: Symbol before number (e.g., $1,234.56)
    const symbolBefore = new RegExp(`^${potentialNumberRegex.source}(${symbolRegex.source})$`, 'i');
    // Pattern 4: Symbol after number (e.g., 1.234,56$)
    const symbolAfter = new RegExp(`^(${symbolRegex.source})${potentialNumberRegex.source}$`, 'i');


    console.log('Regexes', ISOBefore.source, ISOAfter.source, symbolBefore.source, symbolAfter.source);

    // Den ger tillbaka en array på 4, plus lite metadata, vet inte varför det är 4
    const match1 = text.match(ISOBefore);
    const match2 = text.match(ISOAfter);
    const match3 = text.match(symbolBefore);
    const match4 = text.match(symbolAfter);

    if (match1) {
      console.log('--------------Match1', match1);
      currency = ISOCode;
      numberStr = match1[1];
      break;
    } else if (match2) {
      console.log('-----------------Match2', match2);
      currency = ISOCode;
      numberStr = match2[1];
      break;
    } else if (match3) {
      console.log('------------------Match3', match3);
      // När vi matchat på symbol, översätt till ISO
      currency = currencySymbols[match3[3]];
      numberStr = match3[1];
      break;
    } else if (match4) {
      console.log('---------------Match4', match4);
      // När vi matchat på symbol, översätt till ISO
      currency = currencySymbols[match4[1]];
      numberStr = match4[3];
      console.log('Currency', currency, 'Number', numberStr);
      break;
    }
  }

  if (numberStr) {
    // Validate the extracted number string format
    // Parse the validated number string
    const amount = parseNumber(numberStr);
    // Ensure parsing was successful (not NaN)
    if (!isNaN(amount)) {

      console.log(currency, amount);
      return { currency, amount };
    }
    // If format is invalid or parsing failed, continue to next pattern/currency
  }
  console.log('No match', text);
  return null
}

async function convertToX(amount, fromCurrency, tabId, selectedText) {
  try {

    console.log('Converting to', currentTargetCurrency, 'from', amount, fromCurrency);

    const exchangeRates = await getExchangeRates();
    // Initialize exchange rates if they don't exists in storage

    const rate = exchangeRates.rates[fromCurrency];
    console.log('Current rate', rate);
    // 1/rate 
    const convertedAmount = (amount * 1 / rate).toFixed(2);

    console.log(`Converted ${amount} ${fromCurrency} to ${convertedAmount} ${currentTargetCurrency}`);

    const result = {
      type: "showConversion",
      original: selectedText,
      converted: `${convertedAmount} ${currentTargetCurrency}`,
      amount: convertedAmount,
    };
    // Mabye extract from this function
    if (tabId && typeof browser !== 'undefined' && browser.tabs) {
      browser.tabs.sendMessage(tabId, result);
    }

    return result;
  }
  catch (error) {
    const errorResult = {
      type: "showError",
      message: "Failed to convert currency",
    };

    if (tabId && typeof browser !== 'undefined' && browser.tabs) {
      browser.tabs.sendMessage(tabId, errorResult);
    }

    return errorResult;
  }
}

function updateContextMenuTitle() {
  browser.contextMenus.update("convert-currency", {
    title: `Convert to ${currentTargetCurrency}`
    // You could also keep a generic title: title: "Convert Currency" 
  }).catch(e => console.error("Error updating context menu:", e)); // Add error handling
}

function setupContextMenu() {
  // Ensure context menu is removed before creating it to prevent duplicates on reload
  browser.contextMenus.remove("convert-currency");

  browser.contextMenus.create({
    id: "convert-currency",
    title: `Convert to ${currentTargetCurrency}`, // Initial title
    contexts: ["selection"]
  }, () => {
    if (browser.runtime.lastError) {
      console.error("Error creating context menu:", browser.runtime.lastError);
    }
  });
}

// Check if the script is running in a Node.js environment, this allows for testing using vitest and running in the browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectCurrencyAndAmount,
    convertToX,
    initializeBackgroundScript,
    parseNumber
  };
} else {
  initializeBackgroundScript();
}