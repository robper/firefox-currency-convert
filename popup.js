document.addEventListener('DOMContentLoaded', () => {
  const targetCurrencySelect = document.getElementById('targetCurrency');
  
  // Load saved target currency
  browser.storage.local.get("targetCurrency").then((result) => {
    if (result.targetCurrency) {
      targetCurrencySelect.value = result.targetCurrency;
    }
  });
  
  // Save target currency when changed
  targetCurrencySelect.addEventListener('change', () => {
    browser.storage.local.set({
      targetCurrency: targetCurrencySelect.value
    });
  });
}); 