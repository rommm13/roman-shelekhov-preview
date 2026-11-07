(function () {
  try {
    var p = new URLSearchParams(location.search);
    if (p.get('webgpu') === '1') return;
    Object.defineProperty(Navigator.prototype, 'gpu', { configurable: true, get: function () { return undefined; } });
  } catch (e) {}
})();
