/**
 * gamepad_capture_stub.js — 手柄采集桩模块
 * 
 * 占位文件，后续实现：
 * - WebHID API: navigator.hid.requestDevice()
 * - Gamepad API: navigator.getGamepads()
 * - 手柄类型/连接方式识别
 */

export class GamepadCapture {
  constructor() {
    this.gamepadConnected = false;
    this.gamepadInfo = null;
    this.isCapturing = false;
  }

  async detectGamepad() {
    // TODO: 实现 WebHID + Gamepad API 检测
    console.log('[GamepadCapture] 检测手柄（桩模块）');
    return null;
  }

  startCapture() {
    this.isCapturing = true;
    console.log('[GamepadCapture] 开始采集手柄数据（桩模块）');
  }

  stopCapture() {
    this.isCapturing = false;
  }

  getState() {
    return {
      connected: this.gamepadConnected,
      info: this.gamepadInfo
    };
  }
}
