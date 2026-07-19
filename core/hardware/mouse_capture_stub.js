/**
 * mouse_capture_stub.js — 鼠标采集桩模块
 * 
 * 占位文件，后续实现：
 * - PointerEvent.getCoalescedEvents() 高频采集
 * - 轮询率实时计算
 * - DPI 标定
 */

export class MouseCapture {
  constructor() {
    this.isCapturing = false;
    this.pollingRate = null;
    this.eventLog = [];
  }

  async startCapture() {
    this.isCapturing = true;
    console.log('[MouseCapture] 开始采集鼠标事件（桩模块）');
    // TODO: 实现 PointerEvent 高频采集
  }

  stopCapture() {
    this.isCapturing = false;
    console.log('[MouseCapture] 停止采集');
  }

  getStats() {
    return {
      pollingRate: this.pollingRate,
      totalEvents: this.eventLog.length
    };
  }
}
