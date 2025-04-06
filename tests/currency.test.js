const { detectCurrencyAndAmount, convertToSEK } = require('../background.js');
const browser = require('./browser.mock');

describe('Currency Detection', () => {
  describe('Symbol before number', () => {
    test('should detect $123', () => {
      const result = detectCurrencyAndAmount('$123');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect $ 123', () => {
      const result = detectCurrencyAndAmount('$ 123');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect $123,4', () => {
      const result = detectCurrencyAndAmount('$123,4');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect $ 123,4', () => {
      const result = detectCurrencyAndAmount('$ 123,4');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect $123.4', () => {
      const result = detectCurrencyAndAmount('$123.4');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect $ 123.4', () => {
      const result = detectCurrencyAndAmount('$ 123.4');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });
  });

  describe('Symbol after number', () => {
    test('should detect 123$', () => {
      const result = detectCurrencyAndAmount('123$');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123 $', () => {
      const result = detectCurrencyAndAmount('123 $');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123,4$', () => {
      const result = detectCurrencyAndAmount('123,4$');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect 123,4 $', () => {
      const result = detectCurrencyAndAmount('123,4 $');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect 123.4$', () => {
      const result = detectCurrencyAndAmount('123.4$');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect 123.4 $', () => {
      const result = detectCurrencyAndAmount('123.4 $');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });
  });

  describe('ISO Code after number', () => {
    test('should detect 123USD', () => {
      const result = detectCurrencyAndAmount('123USD');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });
    test('should detect 123usd', () => {
      const result = detectCurrencyAndAmount('123usd');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123 USD', () => {
      const result = detectCurrencyAndAmount('123 USD');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123,4USD', () => {
      const result = detectCurrencyAndAmount('123,4USD');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });
  });

  describe('ISO Code before number', () => {
    test('should detect USD123', () => {
      const result = detectCurrencyAndAmount('USD123');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });
    test('should detect usd123', () => {
      const result = detectCurrencyAndAmount('usd123');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect USD 123', () => {
      const result = detectCurrencyAndAmount('USD 123');
      expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect USD123,4', () => {
      const result = detectCurrencyAndAmount('USD123,4');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect USD 123,4', () => {
      const result = detectCurrencyAndAmount('USD 123,4');
      expect(result).toEqual({ currency: 'USD', amount: 123.4 });
    });

    test('should detect 123,45 EUR', () => {
      const result = detectCurrencyAndAmount('123,45 EUR');
      expect(result).toEqual({ currency: 'EUR', amount: 123.45 });
    });

    test('should detect EUR 123,45', () => {
      const result = detectCurrencyAndAmount('EUR 123,45');
      expect(result).toEqual({ currency: 'EUR', amount: 123.45 });
    });
  });

  describe('Other currencies', () => {
    test('should detect 123kr', () => {
      const result = detectCurrencyAndAmount('123kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123456789kr', () => {
      const result = detectCurrencyAndAmount('123456789kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123456789 });
    });

    test('should detect 123 kr', () => {
      const result = detectCurrencyAndAmount('123 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123,0kr', () => {
      const result = detectCurrencyAndAmount('123,0kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123.0 });
    });

    test('should detect 123,0 kr', () => {
      const result = detectCurrencyAndAmount('123,0 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123.0 });
    });

    test('should detect 123.0kr', () => {
      const result = detectCurrencyAndAmount('123.0kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123.0 });
    });

    test('should detect 123.0 kr', () => {
      const result = detectCurrencyAndAmount('123.0 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123.0 });
    });

    test('should detect 123.0 KR', () => {
      const result = detectCurrencyAndAmount('123.0 KR');
      expect(result).toEqual({ currency: 'SEK', amount: 123.0 });
    });

    test('should detect 1,234,567.89 kr', () => {
      const result = detectCurrencyAndAmount('1,234,567.89 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 1234567.89 });
    });

    test('should detect 1.234.567,89 kr', () => {
      const result = detectCurrencyAndAmount('1.234.567,89 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 1234567.89 });
    });

    test('should detect 1,234,567 kr', () => {
      const result = detectCurrencyAndAmount('1,234,567 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 1234567 });
    });

    test('should detect 1.234.567 kr', () => {
      const result = detectCurrencyAndAmount('1.234.567 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 1234567 });
    });

    test('should detect 0.5 kr', () => {
      const result = detectCurrencyAndAmount('0.5 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 0.5 });
    });

    test('should detect 0,5 kr', () => {
      const result = detectCurrencyAndAmount('0,5 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 0.5 });
    });

    test('should detect 0 kr', () => {
      const result = detectCurrencyAndAmount('0 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 0 });
    });

    test('should detect 0.0 kr', () => {
      const result = detectCurrencyAndAmount('0.0 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 0 });
    });

    test('should detect 0,0 kr', () => {
      const result = detectCurrencyAndAmount('0,0 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 0 });
    });
  });

  describe(':- symbol', () => {
    test('should detect 123,45 :-', () => {
      const result = detectCurrencyAndAmount('123,45 :-');
      expect(result).toEqual({ currency: 'SEK', amount: 123.45 });
    });

    test('should detect 123,45:-', () => {
      const result = detectCurrencyAndAmount('123,45:-');
      expect(result).toEqual({ currency: 'SEK', amount: 123.45 });
    });
  });

  describe('Double decimals', () => {
    test('should detect 1,000.1 kr', () => {
      const result = detectCurrencyAndAmount('1,000.1 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 1000.1 });
    });
  });

  describe('Invalid formats', () => {
    test('should fail for invalid currency symbol', () => {
      const result = detectCurrencyAndAmount('123@');
      expect(result).toBeNull();
    });

    test('should fail for invalid ISO code', () => {
      const result = detectCurrencyAndAmount('123XYZ');
      expect(result).toBeNull();
    });

    test('should fail for multiple currency symbols', () => {
      const result = detectCurrencyAndAmount('$123$');
      expect(result).toBeNull();
    });

    test('should fail for multiple ISO codes', () => {
      const result = detectCurrencyAndAmount('USD123EUR');
      expect(result).toBeNull();
    });

    test('should fail for mixed currency formats', () => {
      const result = detectCurrencyAndAmount('$123EUR');
      expect(result).toBeNull();
    });

    test('should fail for invalid number format', () => {
      const result = detectCurrencyAndAmount('$123,45,67');
      expect(result).toBeNull();
    });

    test('should fail for text without numbers', () => {
      const result = detectCurrencyAndAmount('USD');
      expect(result).toBeNull();
    });

    test('should fail for empty string', () => {
      const result = detectCurrencyAndAmount('');
      expect(result).toBeNull();
    });

    test('should fail for just spaces', () => {
      const result = detectCurrencyAndAmount('   ');
      expect(result).toBeNull();
    });

    test('should fail for multiple decimal points', () => {
      const result = detectCurrencyAndAmount('123.45.67 kr');
      expect(result).toBeNull();
    });

    test('should fail for multiple decimal commas', () => {
      const result = detectCurrencyAndAmount('123,45,67 kr');
      expect(result).toBeNull();
    });

    test('should fail for invalid thousands separator', () => {
      const result = detectCurrencyAndAmount('1,23,456 kr');
      expect(result).toBeNull();
    });

    test('should fail for non-numeric characters', () => {
      const result = detectCurrencyAndAmount('123abc kr');
      expect(result).toBeNull();
    });

    test('should detect 123.456,789 kr', () => {
      const result = detectCurrencyAndAmount('123.456,789 kr');
      expect(result).toEqual({ currency: 'SEK', amount: 123456.789 });
    });
  });
});

describe('Currency Conversion', () => {
  test('should convert USD to SEK correctly', async () => {
    const result = await convertToSEK(100, 'USD', null, '$100', 0, 0);
    expect(result.converted).toBe('1050.00 SEK');
  });

  test('should convert EUR to SEK correctly', async () => {
    const result = await convertToSEK(100, 'EUR', null, '€100', 0, 0);
    expect(result.converted).toBe('1120.00 SEK');
  });

  test('should convert GBP to SEK correctly', async () => {
    const result = await convertToSEK(100, 'GBP', null, '£100', 0, 0);
    expect(result.converted).toBe('1300.00 SEK');
  });

  test('should handle decimal amounts', async () => {
    const result = await convertToSEK(100.50, 'USD', null, '$100.50', 0, 0);
    expect(result.converted).toBe('1055.25 SEK');
  });

  test('should use default rate for unknown currency', async () => {
    const result = await convertToSEK(100, 'XYZ', null, 'XYZ100', 0, 0);
    expect(result.converted).toBe('1050.00 SEK'); // Defaults to USD rate
  });
});
