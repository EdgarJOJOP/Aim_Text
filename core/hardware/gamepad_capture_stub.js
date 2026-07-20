/**
 * gamepad_capture.js - 鎵嬫焺閲囬泦妯″潡锛圙amepad API锛? *
 * - 妫€娴嬫墜鏌勮繛鎺?鏂紑
 * - 璇诲彇鎽囨潌/鎵虫満/鎸夐敭鐘舵€侊紙甯︽鍖猴級
 * - 璁板綍鎵嬫焺浜嬩欢鏃堕棿鎴崇敤浜庤绠楄疆璇㈢巼
 * - 鎻愪緵 buttonJustPressed / axisJustActive 渚?UI 瀵艰埅鍜屽満鏅娇鐢? */

class GamepadCapture {
  constructor() {
    this.connected = false;
    this.index = -1;
    this.prevButtons = {};
    this.buttons = {};
    this.axes = [0, 0, 0, 0];
    this.prevAxes = [0, 0, 0, 0];
    this.eventTimestamps = [];
    this.id = '';
    this._onConnect = null;
    this._onDisconnect = null;

    this._boundConnect = this._handleConnect.bind(this);
    this._boundDisconnect = this._handleDisconnect.bind(this);
    window.addEventListener('gamepadconnected', this._boundConnect);
    window.addEventListener('gamepaddisconnected', this._boundDisconnect);
  }

  onConnect(fn) { this._onConnect = fn; }
  onDisconnect(fn) { this._onDisconnect = fn; }

  _getGamepad() {
    var g = navigator.getGamepads();
    if (this.index >= 0 && g[this.index]) return g[this.index];
    for (var i = 0; i < g.length; i++) {
      if (g[i]) { this.index = i; this.connected = true; return g[i]; }
    }
    return null;
  }

  _handleConnect(e) {
    this.connected = true;
    this.index = e.gamepad.index;
    this.id = e.gamepad.id;
    if (this._onConnect) this._onConnect(e.gamepad);
  }
  _handleDisconnect(e) {
    this.connected = false;
    this.index = -1;
    this.id = '';
    if (this._onDisconnect) this._onDisconnect(e.gamepad);
  }

  poll() {
    var gp = this._getGamepad();
    if (!gp) { this.connected = false; return null; }
    this.connected = true;
    this.id = gp.id;

    this.prevAxes = this.axes.slice();
    this.prevButtons = {};
    for (var k in this.buttons) this.prevButtons[k] = this.buttons[k];

    var deadZone = 0.15;
    this.axes = [
      Math.abs(gp.axes[0]) < deadZone ? 0 : gp.axes[0],
      Math.abs(gp.axes[1]) < deadZone ? 0 : gp.axes[1],
      Math.abs(gp.axes[2]) < deadZone ? 0 : gp.axes[2],
      Math.abs(gp.axes[3]) < deadZone ? 0 : gp.axes[3]
    ];

    var map = {
      a: 0, b: 1, x: 2, y: 3,
      lb: 4, rb: 5, lt: 6, rt: 7,
      back: 8, start: 9, l3: 10, r3: 11,
      up: 12, down: 13, left: 14, right: 15
    };
    this.buttons = {};
    var changed = false;
    for (var name in map) {
      var idx = map[name];
      var val = idx < gp.buttons.length ? gp.buttons[idx].pressed : false;
      this.buttons[name] = val;
      if (val !== this.prevButtons[name]) changed = true;
    }

    if (changed) {
      this.eventTimestamps.push(performance.now());
      if (this.eventTimestamps.length > 500) this.eventTimestamps.shift();
    }

    return {
      connected: this.connected,
      axes: this.axes,
      buttons: this.buttons,
      id: gp.id,
      index: gp.index
    };
  }

  buttonJustPressed(name) {
    return this.buttons[name] && !this.prevButtons[name];
  }

  buttonJustReleased(name) {
    return !this.buttons[name] && this.prevButtons[name];
  }

  axisJustActive(axisIndex, positive) {
    var cur = this.axes[axisIndex];
    var prev = this.prevAxes[axisIndex];
    var threshold = 0.5;
    if (positive) return cur > threshold && prev <= threshold;
    else return cur < -threshold && prev >= -threshold;
  }

  getPollingRate() {
    if (this.eventTimestamps.length < 5) return null;
    var t = this.eventTimestamps;
    var d = [];
    for (var i = 1; i < t.length; i++) {
      var diff = t[i] - t[i - 1];
      if (diff > 0) d.push(diff);
    }
    if (d.length < 4) return null;
    d.sort(function(a, b) { return a - b; });
    var st = Math.floor(d.length * 0.1);
    var en = Math.ceil(d.length * 0.9);
    var mid = d.slice(st, en);
    var avg = mid.reduce(function(a, b) { return a + b; }, 0) / mid.length;
    return avg > 0 ? Math.round(1000 / avg) : null;
  }

  destroy() {
    window.removeEventListener('gamepadconnected', this._boundConnect);
    window.removeEventListener('gamepaddisconnected', this._boundDisconnect);
  }
}

window.GamepadCapture = GamepadCapture;