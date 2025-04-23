import { vi } from 'vitest';

import { readFileSync } from 'fs';
import { resolve } from 'path';
let storage = {}; // Key-value store to simulate browser.storage.local

beforeAll(() => {
  const browserMock = {
    tabs: {
      query: vi.fn((_queryInfo) => Promise.resolve([{ id: 123 }])),
      create: vi.fn(({ url }) => Promise.resolve({ id: 456 })),
      sendMessage: vi.fn(() => Promise.resolve()),
    },
    contextMenus: {
      create: vi.fn(),
      onClicked: {
        addListener: vi.fn(),
      },
      remove: vi.fn(),
    },
    storage: {
      local: {
        get: vi.fn((keys) => {
          if (!keys) {
            // Return all storage if no keys are specified
            return Promise.resolve(storage);
          }
          if (typeof keys === 'string') {
            // Return a single key
            return Promise.resolve({ [keys]: storage[keys] });
          }
          if (Array.isArray(keys)) {
            // Return multiple keys
            const result = {};
            keys.forEach((key) => {
              result[key] = storage[key];
            });
            return Promise.resolve(result);
          }
          return Promise.resolve({});
        }),
        set: vi.fn((items) => {
          Object.assign(storage, items); // Merge new items into the storage
         // console.log('Updated storage:', storage); // Log the updated storage
          return Promise.resolve();
        }),
        remove: vi.fn((keys) => {
          if (typeof keys === 'string') {
            delete storage[keys];
          } else if (Array.isArray(keys)) {
            keys.forEach((key) => delete storage[key]);
          }
          //console.log('Updated storage after removal:', storage); // Log the updated storage
          return Promise.resolve();
        }),
        clear: vi.fn(() => {
          storage = {}; // Clear all storage
          //console.log('Storage cleared'); // Log the cleared storage
          return Promise.resolve();
        }),
      },
      onChanged: {
        addListener: vi.fn(),
      },
    },
    runtime: {
      lastError: null,
    },
    onChanged: {
      addListener: vi.fn(),
    },
  };
  // load the files content
  const exchangeRatesPath = resolve(__dirname, 'exchange-rates.json');
  const exchangeRatesContent = JSON.parse(readFileSync(exchangeRatesPath, 'utf-8'));
  storage['exchangeRates'] = exchangeRatesContent; // Set the content in the mock storage

  vi.stubGlobal('browser', browserMock);
});
