const supportedCurrencies = ["SEK", "EUR", "USD", "GBP", "JPY", "CNY"]; // Add more as needed

document.addEventListener('DOMContentLoaded', () => {
  const targetCurrencySelect = document.getElementById('targetCurrency');

  // Load exchangeRates from storage and populate the dropdown with the key in the exchangeRates.rates object
  browser.storage.local.get("exchangeRates").then((result) => {
    if (result.exchangeRates) {
      const exchangeRates = result.exchangeRates.rates;

      // Clear loading message
      targetCurrencySelect.innerHTML = ''; // Det här kan rensa default-options
      // Populate the dropdown with exchange rates
      Object.keys(exchangeRates).forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        targetCurrencySelect.appendChild(option);
      });
    }}).catch(error => {
      console.error('Error loading exchange rates:', error);
      // Optionally, you can handle the error here, e.g., show a message to the user
      // If this occurs it sould be partly populated, or have the default options specced in the HTML
    }
  );
  // Populate the dropdown, nytt
  /*targetCurrencySelect.innerHTML = ''; // Det här kan rensa default-options
  supportedCurrencies.forEach(currency => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    targetCurrencySelect.appendChild(option);
});*/

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
