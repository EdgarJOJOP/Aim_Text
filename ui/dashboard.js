/**
 * dashboard.js — 实时仪表盘（桩模块）
 * 
 * 占位文件，后续实现：
 * - 实时轮询率折线图
 * - 命中分布热力图
 * - 灵敏度收敛曲线
 * - PSA 迭代进度
 */

export class Dashboard {
  constructor(container) {
    this.container = container;
    this.charts = {};
  }

  init() {
    console.log('[Dashboard] 仪表盘初始化（桩模块）');
    // TODO: 使用 Chart.js 构建实时图表
  }

  updatePollingRate(rate) {
    // 更新轮询率图表
  }

  updatePSAProgress(iteration, value) {
    // 更新PSA收敛曲线
  }

  updateHitDistribution(hits) {
    // 更新命中分布
  }

  destroy() {
    Object.values(this.charts).forEach(c => {
      if (c && c.destroy) c.destroy();
    });
    this.charts = {};
  }
}
