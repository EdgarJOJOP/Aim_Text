class ReportView {
  constructor(app) { this.app=app; this.charts={}; this._bindTabs(); this._bindExportButtons(); }

  render(model) {
    this.model=model; this.app.exporter.setModel(model);
    this.renderOverview(model); this.renderMouseSensitivity(model);
    this.renderController(model); this.renderScores(model);
    this.renderExportPreview(model);
    setTimeout(()=>this.renderCharts(model),100);
  }

  _bindTabs() {
    document.querySelectorAll('#report-tabs .tab').forEach(tab=>{
      tab.addEventListener('click',()=>{
        document.querySelectorAll('#report-tabs .tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        const id=tab.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
        const pane=document.getElementById(id);
        if(pane) pane.classList.add('active');
      });
    });
  }

  _bindExportButtons() {
    const j=document.getElementById('btn-export-json'), h=document.getElementById('btn-export-html'), p=document.getElementById('btn-print');
    if(j) j.addEventListener('click',()=>this._onExportJSON());
    if(h) h.addEventListener('click',()=>this._onExportHTML());
    if(p) p.addEventListener('click',()=>this._onExportPrint());
    document.querySelectorAll('.btn-export').forEach(b=>{
      b.addEventListener('click',()=>{
        const f=b.dataset.format;
        if(f==='json') this._onExportJSON();
        else if(f==='html') this._onExportHTML();
        else if(f==='print') this._onExportPrint();
      });
    });
  }

  async _onExportJSON() {
    const ok=await this.app.exporter.copyJSON();
    this.app.mainPanel.showToast(ok?'✅ JSON 已复制到剪贴板':'❌ 复制失败','success');
  }
  _onExportHTML() { this.app.exporter.downloadHTML(); this.app.mainPanel.showToast('📄 HTML 报告已下载','success'); }
  _onExportPrint() { this.app.exporter.print(); }

  renderOverview(model) {
    const d=model.toJSON(), hw=d.hardware, ui=d.userInput;
    this._set('ov-date',d.meta.testDate?new Date(d.meta.testDate).toLocaleString('zh-CN'):'—');
    this._set('ov-device',ui.controllerType!=='none'?'鼠标 + 手柄':'鼠标');
    this._set('ov-dpi',ui.dpi+' DPI');
    this._set('ov-polling',(hw.mousePollingRate||'—')+' Hz');
    this._set('ov-connection',hw.mouseConnection||'—');
    const cm={'none':'未使用','xbox':'Xbox 官方手柄','playstation':'PS官方手柄','third-party':'第三方(可自定义)','unsure':'未识别'};
    this._set('ov-controller',cm[ui.controllerType]||'—');
  }

  renderMouseSensitivity(model) {
    const m=model.mouse, d=model.toJSON();
    this._set('ms-cm360',m.cmPer360?m.cmPer360.toFixed(1)+' cm':'—');
    this._set('ms-in360',m.inchesPer360?m.inchesPer360.toFixed(1)+' in':'—');
    this._set('ms-edpi',m.edpi!==null?m.edpi.toString():'—');

    const fc=document.getElementById('sensitivity-format-table');
    if(fc) {
      const f=d.sensitivityFormats;
      if(!f.length) fc.innerHTML='<p style="color:var(--text-muted)">暂无数据</p>';
      else {
        let h='<table><thead><tr><th>格式</th><th>推荐值</th><th>说明</th><th>适用游戏举例</th></tr></thead><tbody>';
        f.forEach(x=>{h+=`<tr><td><strong>${x.format}</strong></td><td>${typeof x.value==='number'?x.value.toFixed(4):x.value}</td><td>${x.description}</td><td style="font-size:0.82rem">${x.games.join('、')}</td></tr>`;});
        h+='</tbody></table>'; fc.innerHTML=h;
      }
    }

    const dc=document.getElementById('dpi-table');
    if(dc) {
      const t=d.dpiTable;
      if(!t.length) dc.innerHTML='<p style="color:var(--text-muted)">暂无数据</p>';
      else {
        let h='<table><thead><tr><th>DPI</th><th>比值灵敏度</th><th>整数灵敏度</th><th>eDPI</th><th>cm/360°</th><th>备注</th></tr></thead><tbody>';
        t.forEach(r=>{h+=`<tr class="${r.isCurrent?'highlight-row':''}"><td>${r.dpi}</td><td>${r.gameSensFloat}</td><td>${r.gameSensInt}</td><td>${r.edpi}</td><td>${r.cm360.toFixed(1)}</td><td>${r.note}</td></tr>`;});
        h+='</tbody></table>'; dc.innerHTML=h;
      }
    }

    // 游戏灵敏度对照表
    var gs=d.gameSensitivityTable||[];
    var gc=document.getElementById('game-sensitivity-table');
    if(gc){
      if(!gs.length){gc.innerHTML='<p style="color:var(--text-muted)">暂无数据</p>';}
      else{
        var h='<table><thead><tr><th>游戏</th><th>格式</th><th>推荐值</th><th>设置路径</th></tr></thead><tbody>';
        gs.forEach(function(g){h+='<tr><td><strong>'+g.game+'</strong></td><td>'+g.format+'</td><td style="font-family:var(--font-mono);color:var(--accent);font-weight:600">'+g.value+'</td><td style="font-size:0.8rem;color:var(--text-muted)">'+g.settingPath+'</td></tr>';});
        h+='</tbody></table>';gc.innerHTML=h;
      }
    }

    const sc=document.getElementById('scope-table');
    if(sc) {
      var adsM=model.adsMultiplier||m.zoomRatio;
      var p=m.perScope;
      if(!p||!p.length){
        var h='<p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:8px;">开镜灵敏度系数 (ADS倍率)</p>';
        h+='<table><thead><tr><th>参数</th><th>值</th></tr></thead><tbody>';
        h+='<tr><td>PSA优化ADS倍率</td><td style="font-weight:600;color:var(--accent)">'+adsM.toFixed(2)+'</td></tr>';
        h+='<tr><td>说明</td><td style="font-size:0.85rem;color:var(--text-muted)">右键开镜时的灵敏度倍率。'+adsM.toFixed(2)+'x 表示开镜后灵敏度降低为原来的 '+(adsM*100).toFixed(0)+'%</td></tr>';
        h+='</tbody></table>';sc.innerHTML=h;
      }else{
        var h='<p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:8px;">开镜灵敏度系数 (PSA优化 ADS倍率: '+adsM.toFixed(2)+')</p><table><thead><tr><th>倍镜</th><th>系数</th></tr></thead><tbody>';
        p.forEach(function(s){h+='<tr><td>'+s.scope+'</td><td>'+(s.multiplier*adsM).toFixed(2)+'</td></tr>';});
        h+='</tbody></table>';sc.innerHTML=h;
      }
    }
  }

  renderController(model) {
    const c=document.getElementById('controller-content');
    if(!c) return;
    const d=model.toJSON(), ctr=d.controller;
    if(!model.isControllerEnabled()) {
      c.innerHTML='<div class="empty-state"><div class="empty-icon">🎮</div><p>未启用控制器测试</p><p class="empty-hint">请在设置页中选择手柄类型后重新测试</p></div>';
      return;
    }
    let h=`<div class="info-grid" style="margin-bottom:20px"><div class="info-item"><span class="info-label">手柄型号</span><span class="info-value">${ctr.model||'检测中...'}</span></div><div class="info-item"><span class="info-label">连接方式</span><span class="info-value">${ctr.connection||'—'}</span></div><div class="info-item"><span class="info-label">响应曲线</span><span class="info-value">${ctr.responseCurveType||'—'}</span></div></div>`;
    if(!model.isControllerCustomizable()) {
      h+=`<div class="card" style="background:var(--bg-primary)"><div class="card-body"><div style="display:flex;gap:12px;align-items:flex-start"><span style="font-size:2rem">ℹ️</span><div><p><strong>官方手柄说明</strong></p><p style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px;">官方手柄的摇杆死区等参数在硬件层面固定，无法在游戏中自定义。</p><div style="margin-top:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:0.9rem"><div>Y轴反转: <strong>${ctr.invertY!==null?(ctr.invertY?'是':'否'):'—'}</strong></div><div>X轴反转: <strong>${ctr.invertX!==null?(ctr.invertX?'是':'否'):'—'}</strong></div><div>振动: <strong>${ctr.vibration!==null?(ctr.vibration?'开启':'关闭'):'—'}</strong></div></div></div></div></div>`;
      if(ctr.apexLookSensitivity) h+=this._apexHTML(ctr);
    } else {
      h+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">`;
      h+=`<div class="card" style="background:var(--bg-primary);margin:0"><div class="card-header">🕹️ 左摇杆</div><div class="card-body"><div class="info-item"><span class="info-label">内死区</span><span class="info-value">${ctr.leftStickInnerDeadzone||'—'}</span></div><div class="info-item"><span class="info-label">外死区</span><span class="info-value">${ctr.leftStickOuterDeadzone||'—'}</span></div></div></div>`;
      h+=`<div class="card" style="background:var(--bg-primary);margin:0"><div class="card-header">🕹️ 右摇杆</div><div class="card-body"><div class="info-item"><span class="info-label">内死区</span><span class="info-value">${ctr.rightStickInnerDeadzone||'—'}</span></div><div class="info-item"><span class="info-label">外死区</span><span class="info-value">${ctr.rightStickOuterDeadzone||'—'}</span></div></div></div>`;
      h+=`<div class="card" style="background:var(--bg-primary);margin:0"><div class="card-header">⚙️ 轴向</div><div class="card-body"><div class="info-item"><span class="info-label">Y轴反转</span><span class="info-value">${ctr.invertY!==null?(ctr.invertY?'是':'否'):'—'}</span></div><div class="info-item"><span class="info-label">X轴反转</span><span class="info-value">${ctr.invertX!==null?(ctr.invertX?'是':'否'):'—'}</span></div><div class="info-item"><span class="info-label">振动强度</span><span class="info-value">${ctr.vibrationIntensity!==null?(ctr.vibrationIntensity*100).toFixed(0)+'%':'—'}</span></div></div></div>`;
      h+=`<div class="card" style="background:var(--bg-primary);margin:0"><div class="card-header">🔫 扳机</div><div class="card-body"><div class="info-item"><span class="info-label">左扳机死区</span><span class="info-value">${ctr.leftTriggerDeadzone||'—'}</span></div><div class="info-item"><span class="info-label">右扳机死区</span><span class="info-value">${ctr.rightTriggerDeadzone||'—'}</span></div></div></div>`;
      h+=`</div>`;
      if(ctr.responseCurveData&&ctr.responseCurveData.length) h+=`<div class="card" style="background:var(--bg-primary);margin-top:16px"><div class="card-header">📈 摇杆响应曲线</div><div class="card-body"><canvas id="curve-chart" style="max-height:300px"></canvas></div></div>`;
      if(ctr.apexLookSensitivity) h+=this._apexHTML(ctr);
    }
    c.innerHTML=h;
  }

  _apexHTML(c) {
    let h=`<div class="card" style="background:var(--bg-primary);margin-top:16px"><div class="card-header">🎯 Apex Legends 等效设置</div><div class="card-body"><div class="info-grid" style="grid-template-columns:repeat(3,1fr)"><div class="info-item"><span class="info-label">Look Sensitivity</span><span class="info-value">${c.apexLookSensitivity}</span></div><div class="info-item"><span class="info-label">Response Curve</span><span class="info-value">${c.apexResponseCurve}</span></div><div class="info-item"><span class="info-label">ADS Multiplier</span><span class="info-value">${c.apexAdsMultiplier}</span></div></div>`;
    if(c.apexPerOptics&&c.apexPerOptics.length) {
      h+=`<h4 style="margin-top:16px;font-size:0.9rem;color:var(--text-secondary)">倍镜独立灵敏度</h4><table><thead><tr><th>倍镜</th><th>推荐值</th></tr></thead><tbody>`;
      c.apexPerOptics.forEach(o=>{h+=`<tr><td>${o.scope}</td><td>${o.value}</td></tr>`;});
      h+='</tbody></table>';
    }
    h+='</div></div>'; return h;
  }

  renderScores(model) {
    const s=model.scores;
    this._set('sc-flick',s.flickAccuracy!==null?(s.flickAccuracy*100).toFixed(1)+'%':'—');
    this._set('sc-tracking',s.trackingDeviation!==null?s.trackingDeviation.toFixed(3):'—');
    this._set('sc-reaction',s.reactionTimeMs!==null?s.reactionTimeMs+' ms':'—');
  }

  renderExportPreview(model) {
    const el=document.getElementById('export-preview-code');
    if(el) el.textContent=this.app.exporter.getPreviewText();
  }

  renderCharts(model) {
    this._renderCurveChart(model); this._renderHitmap(model);
  }

  _renderCurveChart(model) {
    const c=document.getElementById('curve-chart');
    if(!c) return;
    const data=model.controller.responseCurveData;
    if(!data||!data.length) return;
    if(this.charts.curve) this.charts.curve.destroy();
    this.charts.curve=new Chart(c.getContext('2d'),{
      type:'scatter',
      data:{datasets:[
        {label:'你的响应曲线',data:data,showLine:true,borderColor:'#58a6ff',backgroundColor:'#58a6ff',pointRadius:4,tension:0.3},
        {label:'线性(参考)',data:[{x:0,y:0},{x:0.25,y:0.25},{x:0.5,y:0.5},{x:0.75,y:0.75},{x:1,y:1}],showLine:true,borderColor:'#8b949e',backgroundColor:'#8b949e',borderDash:[5,5],pointRadius:0}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8b949e'}}},scales:{x:{title:{display:true,text:'摇杆输入',color:'#8b949e'},min:0,max:1,grid:{color:'#30363d'},ticks:{color:'#8b949e'}},y:{title:{display:true,text:'游戏输出',color:'#8b949e'},min:0,max:1,grid:{color:'#30363d'},ticks:{color:'#8b949e'}}}}
    });
  }

  _renderHitmap(model) {
    const c=document.getElementById('hitmap-canvas');
    if(!c) return;
    const hits=model.scores.hitMap;
    if(!hits||!hits.length) return;
    if(this.charts.hitmap) this.charts.hitmap.destroy();
    const hd=hits.filter(h=>h.hit).map(h=>({x:h.x,y:h.y}));
    const md=hits.filter(h=>!h.hit).map(h=>({x:h.x,y:h.y}));
    this.charts.hitmap=new Chart(c.getContext('2d'),{
      type:'scatter',
      data:{datasets:[
        {label:'命中',data:hd,backgroundColor:'#3fb950',pointRadius:3},
        {label:'未命中',data:md,backgroundColor:'#f85149',pointRadius:3}
      ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8b949e'}},title:{display:true,text:'🎯 命中分布图',color:'#8b949e'}},scales:{x:{min:-1,max:1,grid:{color:'#30363d'},ticks:{color:'#8b949e'}},y:{min:-1,max:1,grid:{color:'#30363d'},ticks:{color:'#8b949e'}}}}
    });
  }

  _set(id,text) { const el=document.getElementById(id); if(el) el.textContent=text; }
}
window.ReportView = ReportView;
