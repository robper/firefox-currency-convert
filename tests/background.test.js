import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { detectCurrencyAndAmount, convertToX, initializeBackgroundScript, parseNumber } from '../background.js'
beforeAll(() => {
    initializeBackgroundScript();
});

describe('Browser Mock', () => {
    it('should mock the browser object', () => {
        expect(global.browser).toBeDefined();
        expect(global.browser.contextMenus.create).toBeInstanceOf(Function);
    });
});
describe('Browser Mock, exchange-rates storage', () => {
    it('should load exchange rates into storage', async () => {
        const result = await browser.storage.local.get('exchangeRates');
        // console.log('Result:', result); // Log the result for debugging
        expect(result['exchangeRates']).toBeDefined();
        expect(result['exchangeRates'].rates.SEK).toBeDefined(); // Example assertion
    });
});
describe('ISO Code after number', () => {
    test('should detect 123USD', async () => {
        const result = await detectCurrencyAndAmount('123USD');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });
    test('should detect 123 USD', async () => {
        const result = await detectCurrencyAndAmount('123 USD');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });
    test('should detect 123usd', async () => {
        const result = await detectCurrencyAndAmount('123usd');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123 usd', async () => {
        const result = await detectCurrencyAndAmount('123 usd');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });
    test('should fail for invalid ISO code 123XYZ', async () => {
        const result = await detectCurrencyAndAmount('123XYZ');
        expect(result).toBeNull();
    });

});
describe('ISO Code before number', () => {
    test('should detect USD123', async () => {
        const result = await detectCurrencyAndAmount('USD123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect USD 123', async () => {
        const result = await detectCurrencyAndAmount('USD 123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect usd123', async () => {
        const result = await detectCurrencyAndAmount('usd123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect usd 123', async () => {
        const result = await detectCurrencyAndAmount('usd 123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

});
describe('Symbol before number', () => {
    test('should detect $123', async () => {
        const result = await detectCurrencyAndAmount('$123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect $ 123', async () => {
        const result = await detectCurrencyAndAmount('$ 123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect €123', async () => {
        const result = await detectCurrencyAndAmount('€123');
        expect(result).toEqual({ currency: 'EUR', amount: 123 });
    });

    test('should detect € 123', async () => {
        const result = await detectCurrencyAndAmount('€ 123');
        expect(result).toEqual({ currency: 'EUR', amount: 123 });
    });

    test('should detect :- 123,45 ', async () => {
        const result = await detectCurrencyAndAmount(':- 123');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });
    test('should detect :-123', async () => {
        const result = await detectCurrencyAndAmount(':-123');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should fail for invalid symbol {123', async () => {
        const result = await detectCurrencyAndAmount('{123');
        expect(result).toBeNull();
    });

});
describe('Symbol after number', () => {
    test('should detect 123$', async () => {
        const result = await detectCurrencyAndAmount('123$');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123 $', async () => {
        const result = await detectCurrencyAndAmount('123 $');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should detect 123 :-', async () => {
        const result = await detectCurrencyAndAmount('123 :-');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123:-', async () => {
        const result = await detectCurrencyAndAmount('123:-');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123kr', async () => {
        const result = await detectCurrencyAndAmount('123kr');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123 kr', async () => {
        const result = await detectCurrencyAndAmount('123 kr');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123 KR', async () => {
        const result = await detectCurrencyAndAmount('123 KR');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });

    test('should detect 123 KR', async () => {
        const result = await detectCurrencyAndAmount('123 KR');
        expect(result).toEqual({ currency: 'SEK', amount: 123 });
    });
    test('should detect US$123', async () => {
        const result = await detectCurrencyAndAmount('US$123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });
    test('should detect us$123', async () => {
        const result = await detectCurrencyAndAmount('us$123');
        expect(result).toEqual({ currency: 'USD', amount: 123 });
    });

    test('should fail for invalid currency symbol 123@', async () => {
        const result = await detectCurrencyAndAmount('123@');
        expect(result).toBeNull();
    });
});
describe('Etc', () => {
    test('should fail for multiple same currency symbols $123$', async () => {
        const result = await detectCurrencyAndAmount('$123$');
        expect(result).toBeNull();
    });

    test('should fail for multiple different currency symbols', async () => {
        const result = await detectCurrencyAndAmount('$123€');
        expect(result).toBeNull();
    });

    test('should fail for multiple ISO codes USD123EUR', async () => {
        const result = await detectCurrencyAndAmount('USD123EUR');
        expect(result).toBeNull();
    });

    test('should fail for multiple ISO and symbol $123EUR', async () => {
        const result = await detectCurrencyAndAmount('$123EUR');
        expect(result).toBeNull();
    });

    // Exisists in parseNumber tests
    test('should fail for invalid number format', async () => {
        const result = await detectCurrencyAndAmount('$123,45,67');
        expect(result).toBeNull();
    });

    test('should fail for text without numbers USD', async () => {
        const result = await detectCurrencyAndAmount('USD');
        expect(result).toBeNull();
    });
    test('should fail for text without currency identifier', async () => {
        const result = await detectCurrencyAndAmount('123');
        expect(result).toBeNull();
    });

    test('should fail for empty string', async () => {
        const result = await detectCurrencyAndAmount('');
        expect(result).toBeNull();
    });

    test('should fail for just spaces', async () => {
        const result = await detectCurrencyAndAmount('   ');
        expect(result).toBeNull();
    });
    test('should detect 123.456,789 kr', async () => {
        const result = await detectCurrencyAndAmount('123.456,789 kr');
        expect(result).toEqual({ currency: 'SEK', amount: 123456.789 });
    });
})
describe('Number parsing', () => {
    test('should parse 123.45', () => {
        const result = parseNumber('123.45');
        expect(result).toBe(123.45);
    });
    test('should parse 123,45', () => {
        const result = parseNumber('123,45');
        expect(result).toBe(123.45);
    });
    test('should parse 1,234.56', () => {
        const result = parseNumber('1,234.56');
        expect(result).toBe(1234.56);
    });
    test('should parse 1.234,56', () => {
        const result = parseNumber('1.234,56');
        expect(result).toBe(1234.56);
    });
    test('should parse 1,234,567.89', () => {
        const result = parseNumber('1,234,567.89');
        expect(result).toBe(1234567.89);
    });
    test('should fail for invalid thousands separator 1,234,567,89', () => {
        const result = parseNumber('1,234,567,89');
        expect(result).toBeNaN();
    });
    test('should parse 1.234.567,89', () => {
        const result = parseNumber('1.234.567,89');
        expect(result).toBe(1234567.89);
    });
    test('should fail invalid thousands separator 1.234.567.89', () => {
        const result = parseNumber('1.234.567.89');
        expect(result).toBeNaN();
    });
    test('should parse 1234567.89', () => {
        const result = parseNumber('1234567.89');
        expect(result).toBe(1234567.89);
    });
    test('should parse 1234567,89', () => {
        const result = parseNumber('1234567,89');
        expect(result).toBe(1234567.89);
    });
    test('should parse 1234567', () => {
        const result = parseNumber('1234567');
        expect(result).toBe(1234567);
    });
    test('should parse 0.5', () => {
        const result = parseNumber('0.5');
        expect(result).toBe(0.5);
    });
    test('should parse 0,5', () => {
        const result = parseNumber('0,5');
        expect(result).toBe(0.5);
    });
    test('should parse 0', () => {
        const result = parseNumber('0');
        expect(result).toBe(0);
    });
    test('should parse 0.0', () => {
        const result = parseNumber('0.0');
        expect(result).toBe(0);
    });
    test('should parse 0,0', () => {
        const result = parseNumber('0,0');
        expect(result).toBe(0);
    });
    test('should parse 1,234.1', () => {
        const result = parseNumber('1,234.1');
        expect(result).toBe(1234.1);
    });
    test('should parse 1.234,1', () => {
        const result = parseNumber('1.234,1');
        expect(result).toBe(1234.1);
    });
    test('should parse 1,234.10', () => {
        const result = parseNumber('1,234.10');
        expect(result).toBe(1234.1);
    });
    test('should parse 1.234,10', () => {
        const result = parseNumber('1.234,10');
        expect(result).toBe(1234.1);
    });
    test('should parse 1,234,567', () => {
        const result = parseNumber('1,234,567');
        expect(result).toBe(1234567);
    });
    test('should parse 1.234.567', () => {
        const result = parseNumber('1.234.567');
        expect(result).toBe(1234567);
    });
    test('should fail ambigous format 1.234.56', () => {
        const result = parseNumber('1.234.56');
        expect(result).toBeNaN();
    });
    test('should fail char at end 123x', () => {
        const result = parseNumber('123x');
        expect(result).toBeNaN();
    });
    test('should fail char at beginning a123', () => {
        const result = parseNumber('a123');
        expect(result).toBeNaN();
    });
    test('should fail char in string 1a23', () => {
        const result = parseNumber('1a23');
        expect(result).toBeNaN;
    });
    test('should fail for invalid number format 123,45,678', () => {
        const result = parseNumber('123,45,678');
        expect(result).toBeNaN();
    });
    test('should fail for invalid number format 123.45.678', () => {
        const result = parseNumber('123.45.678');
        expect(result).toBeNaN();
    });
});
describe('Currency Conversion', () => {
    beforeEach(() => {
        // Mock the exchange rates in storage
        // Antingen tar vi det här, eller filen som ligger i mock. Tydligare med den här
        const mockExchangeRates = {
            provider: "mock",
            time_next_update_utc: "Fri, 11 Apr 2025 00:33:02 +0000",
            rates:
            {
                SEK: 1,
                USD: 0.10,
                EUR: 0.09,
                GBP: 0.07,
            }
        };
        browser.storage.local.set({ 'exchangeRates': mockExchangeRates });
    }
    );
    test('should convert USD to SEK correctly', async () => {
        const result = await convertToX(100, 'USD', null, '$100');
        expect(result.converted).toBe('1000.00 SEK');
    });

    test('should convert EUR to SEK correctly', async () => {
        const result = await convertToX(100, 'EUR', null, '€100');
        expect(result.converted).toBe('1111.11 SEK');
    });

    test('should convert GBP to SEK correctly', async () => {
        const result = await convertToX(100, 'GBP', null, '£100');
        expect(result.converted).toBe('1428.57 SEK');
    });
    test('should convert SEK to SEK correctly', async () => {
        const result = await convertToX(100, 'SEK', null, '100');
        expect(result.converted).toBe('100.00 SEK');
    });

    test('should handle decimal amounts', async () => {
        const result = await convertToX(100.50, 'USD', null, '$100.50');
        expect(result.converted).toBe('1005.00 SEK');
    });

    // Den här bör bli fel
    test('should fail for unknown currency', async () => {
        const result = await convertToX(100, 'XYZ', null, 'XYZ100');
        expect(result.converted).toBe('NaN SEK');
    });
});
