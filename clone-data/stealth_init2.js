Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});
Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
window.chrome = { runtime: {} };
// Neutralize devtool-detection console timing tricks (disable-devtool style libs
// measure elapsed time / getter invocation on console.log/table/clear calls).
['log','table','clear','dir','debug','info','warn','error'].forEach((k) => {
  try { console[k] = function(){}; } catch(e) {}
});
