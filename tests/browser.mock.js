const browser = {
  contextMenus: {
    create: jest.fn()
  },
  tabs: {
    sendMessage: jest.fn()
  }
};

module.exports = browser; 