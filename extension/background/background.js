// ShieldVPN Background Service Worker
// Manages chrome.proxy settings

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'connect') {
    setProxy(message.server)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open for async response
  }

  if (message.action === 'disconnect') {
    clearProxy()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

function setProxy(server) {
  return new Promise((resolve, reject) => {
    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: 'socks5',
          host: server.proxyHost || server.ipAddress,
          port: parseInt(server.proxyPort) || 1080,
        },
        bypassList: ['localhost', '127.0.0.1', '<local>'],
      },
    };

    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

function clearProxy() {
  return new Promise((resolve, reject) => {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
