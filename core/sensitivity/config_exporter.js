class ConfigExporter {
  constructor() { this.model = null; }
  setModel(m) { this.model = m; }
  toJSON(pretty=true) { return this.model ? JSON.stringify(this.model.toJSON(), null, pretty?2:0) : '{}'; }
  async copyJSON() {
    try { await navigator.clipboard.writeText(this.toJSON()); return true; }
    catch(e) {
      try { const t=document.createElement('textarea'); t.value=this.toJSON(); document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); return true; }
      catch(e2) { return false; }
    }
  }
  toHTML() {
    if(!this.model) return '<html><body><p>无数据</p></body></html>';
    const d=this.model.toJSON(), m=d.mouse, h=d.hardware, sc=d.scores, ctr=d.controller;
    const msr=d.sensitivityFormats.map(f=>`<tr><td>${f.format}</td><td>${typeof f.value==='number'?f.value.toFixed(4):f.value}</td><td>${f.description}</td><td>${f.games.join(', ')}</td></tr>`).join('');
    const dpiR=d.dpiTable.map(r=>`<tr${r.isCurrent?' class="hl"':''}><td>${r.dpi}</td><td>${r.gameSensFloat}</td><td>${r.gameSensInt}</td><td>${r.edpi}</td><td>${r.cm360.toFixed(1)}</td><td>${r.note}</td></tr>`).join('');
    const sR=(m.perScope||[]).map(s=>`<tr><td>${s.scope}</td><td>${s.multiplier}</td></tr>`).join('');
    const ctrR=d.userInput.controllerType!=='none'?`<h3>🎮 手柄参数</h3><table><tr><th>参数</th><th>值</th></tr>${ctr.responseCurveType?`<tr><td>响应曲线</td><td>${ctr.responseCurveType}</td></tr>`:''}${ctr.invertY!==null?`<tr><td>Y轴反转</td><td>${ctr.invertY?'是':'否'}</td></tr>`:''}${ctr.invertX!==null?`<tr><td>X轴反转</td><td>${ctr.invertX?'是':'否'}</td></tr>`:''}${ctr.leftStickInnerDeadzone!==null?`<tr><td>左摇杆内死区</td><td>${ctr.leftStickInnerDeadzone}</td></tr>`:''}${ctr.rightStickInnerDeadzone!==null?`<tr><td>右摇杆内死区</td><td>${ctr.rightStickInnerDeadzone}</td></tr>`:''}</table>`:'';
    return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>PSA 灵敏度测试报告</title><style>body{font-family:-apple-system,sans-serif;max-width:900px;margin:40px auto;padding:20px;color:#222}h1{font-size:1.8rem;border-bottom:2px solid #333;padding-bottom:10px}h2{font-size:1.3rem;margin-top:30px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5}.hl{background:#e8f4ff;font-weight:600}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.mi{background:#f9f9f9;padding:12px;border-radius:6px}.lbl{font-size:0.8rem;color:#666}.val{font-size:1.2rem;font-weight:700}@media print{body{margin:0;padding:15px}}</style></head><body><h1>🎯 灵敏度测试报告</h1><p>测试日期: ${d.meta.testDate?new Date(d.meta.testDate).toLocaleString('zh-CN'):'—'}</p><div class="meta"><div class="mi"><div class="lbl">DPI</div><div class="val">${d.userInput.dpi}</div></div><div class="mi"><div class="lbl">轮询率</div><div class="val">${h.mousePollingRate||'—'} Hz</div></div><div class="mi"><div class="lbl">cm/360°</div><div class="val">${m.cmPer360?m.cmPer360.toFixed(1):'—'} cm</div></div><div class="mi"><div class="lbl">eDPI</div><div class="val">${m.edpi||'—'}</div></div></div><h2>🖱️ 鼠标灵敏度</h2><h3>灵敏度格式对照</h3><table><tr><th>格式</th><th>值</th><th>说明</th><th>适用游戏</th></tr>${msr}</table><h3>DPI 等效换算</h3><table><tr><th>DPI</th><th>比值</th><th>整数</th><th>eDPI</th><th>cm/360°</th><th>备注</th></tr>${dpiR}</table>${sR?`<h3>开镜灵敏度</h3><table><tr><th>倍镜</th><th>系数</th></tr>${sR}</table>`:''}${ctrR}<h2>📈 测试成绩</h2><table><tr><th>项目</th><th>成绩</th></tr><tr><td>拉枪准确率</td><td>${sc.flickAccuracy!==null?(sc.flickAccuracy*100).toFixed(0)+'%':'—'}</td></tr><tr><td>跟枪得分</td><td>${sc.trackingScore!==null?(sc.trackingScore*100).toFixed(0)+'%':'—'}</td></tr><tr><td>平均反应时间</td><td>${sc.reactionTimeMs!==null?sc.reactionTimeMs+' ms':'—'}</td></tr></table><p style="margin-top:40px;color:#999;font-size:0.85rem;text-align:center;">由 Aim Text 生成</p></body></html>`;
  }
  downloadHTML() {
    const b=new Blob([this.toHTML()],{type:'text/html;charset=utf-8'});
    const u=URL.createObjectURL(b), a=document.createElement('a');
    a.href=u; a.download=`aim-text-report-${Date.now()}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
  }
  print() { window.print(); }
  getPreviewText() {
    if(!this.model) return '暂无数据';
    const d=this.model.toJSON();
    return `{\n  "testDate": "${d.meta.testDate}",\n  "dpi": ${d.userInput.dpi},\n  "mouse": {\n    "cmPer360": ${d.mouse.cmPer360},\n    "sensitivity": ${d.mouse.gameSensitivityFloat},\n    "edpi": ${d.mouse.edpi}\n  }\n}`;
  }
}
window.ConfigExporter = ConfigExporter;
