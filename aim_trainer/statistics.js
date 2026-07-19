/**
 * statistics.js — 测试统计模块
 * 
 * 收集并计算瞄准测试数据：
 * - 命中率/准确率
 * - 反应时间
 * - 跟枪偏差
 * - 命中分布
 */

export class AimStatistics {
  constructor() {
    this.reset();
  }

  reset() {
    this.flickShots = [];       // [{ time, aimX, aimY, targetX, targetY, hit }]
    this.trackingSamples = [];  // [{ time, aimDeviation }]
    this.reactionTests = [];    // [{ stimulusTime, reactionTime, hit }]
  }

  recordFlickShot(data) {
    this.flickShots.push(data);
  }

  recordTrackingSample(data) {
    this.trackingSamples.push(data);
  }

  recordReactionTest(data) {
    this.reactionTests.push(data);
  }

  getFlickStats() {
    if (this.flickShots.length === 0) return null;
    const hits = this.flickShots.filter(s => s.hit).length;
    return {
      total: this.flickShots.length,
      hits,
      accuracy: hits / this.flickShots.length,
      avgTime: this.flickShots.reduce((s, f) => s + f.time, 0) / this.flickShots.length
    };
  }

  getTrackingStats() {
    if (this.trackingSamples.length === 0) return null;
    const deviations = this.trackingSamples.map(s => s.aimDeviation);
    return {
      samples: this.trackingSamples.length,
      avgDeviation: deviations.reduce((a, b) => a + b, 0) / deviations.length,
      maxDeviation: Math.max(...deviations),
      minDeviation: Math.min(...deviations)
    };
  }

  getReactionStats() {
    if (this.reactionTests.length === 0) return null;
    const times = this.reactionTests.map(r => r.reactionTime);
    const hits = this.reactionTests.filter(r => r.hit).length;
    return {
      total: this.reactionTests.length,
      hits,
      accuracy: hits / this.reactionTests.length,
      avgReactionTime: times.reduce((a, b) => a + b, 0) / times.length,
      minReactionTime: Math.min(...times),
      maxReactionTime: Math.max(...times)
    };
  }

  getHitMap() {
    return [
      ...this.flickShots.map(s => ({ x: s.aimX, y: s.aimY, hit: s.hit })),
      ...this.reactionTests.map(r => ({ x: r.aimX || 0, y: r.aimY || 0, hit: r.hit }))
    ];
  }
}
