class TestControls {
  constructor(a){this.app=a;this.scene=null;this.allResults={};this.phase=0;this.testStartTime=0;}
  init(c){this.container=document.getElementById(c);if(!this.container)return;this._render();this._bindEvents();}
  _render(){this.container.innerHTML=[
    '<div class="tc-header"><div class="tc-status" id="tc-status">🎯 灵敏度自动测试 — 三阶段连测</div></div>',
    '<div class="tc-vpwrapper"><div class="tc-viewport" id="tc-viewport">',
    '  <div class="tc-placeholder" id="tc-placeholder">',
    '    <div class="tc-placeholder-icon">🎮</div><h3>3D 练枪场景</h3>',
    '    <p>点击下方按钮开始三阶段自动测试</p><p class="tc-hint">左键射击 · 右键开镜 · ESC退出锁定</p>',
    '  </div></div>',
    '  <div class="tc-crosshair" id="tc-crosshair" style="display:none"><div class="tc-ch-line tc-ch-top"></div><div class="tc-ch-line tc-ch-bottom"></div><div class="tc-ch-line tc-ch-left"></div><div class="tc-ch-line tc-ch-right"></div><div class="tc-ch-dot"></div></div>',
    '  <div class="tc-scope-overlay" id="tc-scope-overlay" style="display:none">',
    '    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">',
    '      <defs><mask id="sm">',
    '        <rect width="100" height="100" fill="white"/>',
    '        <circle cx="50" cy="50" r="18" fill="black"/>',
    '      </mask></defs>',
    '      <rect width="100" height="100" fill="rgba(0,0,0,0.75)" mask="url(#sm)"/>',
    '      <circle cx="50" cy="50" r="18" stroke="#58a6ff" stroke-width="0.4" fill="none" opacity="0.9"/>',
    '      <circle cx="50" cy="50" r="17" stroke="#58a6ff" stroke-width="0.15" fill="none" opacity="0.4"/>',
    '      <line x1="50" y1="0" x2="50" y2="32" stroke="#58a6ff" stroke-width="0.25" opacity="0.7"/>',
    '      <line x1="50" y1="68" x2="50" y2="100" stroke="#58a6ff" stroke-width="0.25" opacity="0.7"/>',
    '      <line x1="0" y1="50" x2="32" y2="50" stroke="#58a6ff" stroke-width="0.25" opacity="0.7"/>',
    '      <line x1="68" y1="50" x2="100" y2="50" stroke="#58a6ff" stroke-width="0.25" opacity="0.7"/>',
    '      <circle cx="50" cy="50" r="0.4" fill="#58a6ff" opacity="0.8"/>',
    '    </svg></div>',
    '  <div class="tc-phase-notice" id="tc-phase-notice" style="display:none">',
    '    <div class="tcpn-icon" id="tcpn-icon">🎯</div>',
    '    <div class="tcpn-text" id="tcpn-text">准备中...</div>',
    '  </div>',
    '</div>',
    '<div class="tc-footer"><div class="tc-stats">',
    '  <div class="tc-stat"><span class="tc-stat-label">阶段</span><span class="tc-stat-value" id="tc-phase">—</span></div>',
    '  <div class="tc-stat"><span class="tc-stat-label">轮次</span><span class="tc-stat-value" id="tc-round">0/0</span></div>',
    '  <div class="tc-stat"><span class="tc-stat-label">命中</span><span class="tc-stat-value" id="tc-hits">0</span></div>',
    '</div><div class="tc-actions"><button id="tc-btn-start" class="btn btn-primary">▶ 开始测试</button></div></div>'
  ].join('');}
  _bindEvents(){document.getElementById('tc-btn-start').addEventListener('click',this._start.bind(this));}
  _start(){
    var ph=document.getElementById('tc-placeholder');if(ph)ph.style.display='none';
    var ch=document.getElementById('tc-crosshair');if(ch)ch.style.display='';
    if(this.scene){this.scene.destroy();}
    this.phase=0;this.allResults={};this.testStartTime=performance.now();
    this.scene=new AimScene('tc-viewport');var s=this;
    this.scene.onStatsUpdate=function(st){
      document.getElementById('tc-round').textContent=st.round+'/'+st.maxRounds;
      var hits=(st.flickHits+st.adsHits);
      if(st.mode==='tracking'&&st.trackingSamples>0)hits=Math.round(st.trackingScore*100)+'%';
      document.getElementById('tc-hits').textContent=hits;
    };
    this.scene.onHitCallback=function(){var fl=document.getElementById('tc-hitflash');if(fl){fl.style.display='';fl.style.opacity='0.4';setTimeout(function(){fl.style.opacity='0';},100);setTimeout(function(){fl.style.display='none';},200);}};
    // ⭐ ADS阶段: 只切换狙击镜,十字准星全程隐藏
    this.scene.onAdsCallback=function(on){var scope=document.getElementById('tc-scope-overlay');if(scope)scope.style.display=on?'':'none';};
    this.scene.onComplete=function(r){s._onComplete(r);};
    document.getElementById('tc-btn-start').textContent='⏹ 测试中...';document.getElementById('tc-btn-start').disabled=true;
    this._showNotice(0);
  }
  _showNotice(idx){
    var names=['🎯 拉枪测试','🎯 跟枪测试','🔭 开镜拉枪'];
    if(idx>=3){this._beginPhase(0);return;}
    var n=document.getElementById('tc-phase-notice');var ic=document.getElementById('tcpn-icon');var tx=document.getElementById('tcpn-text');
    if(n)n.style.display='';if(ic)ic.textContent=names[idx].slice(0,2);if(tx)tx.textContent=names[idx];
    document.getElementById('tc-phase').textContent=names[idx];
    var s=this;var i=idx;
    setTimeout(function(){if(n)n.style.display='none';s._beginPhase(i);},1500);
  }
  _beginPhase(idx){
    var ps=['flick','tracking','ads'];
    if(ps[idx]==='ads'){var ch=document.getElementById('tc-crosshair');if(ch)ch.style.display='none';if(this.scene){this.scene.yaw=0;this.scene.pitch=0;}}
    this.scene.phaseIndex=idx;this.scene.start(ps[idx],10);
  }
  _onComplete(r){this.allResults[this.scene.mode]=r;this.phase++;if(this.phase>=3){this._generateReport();return;}this._showNotice(this.phase);}
  _generateReport(){
    var so=document.getElementById('tc-scope-overlay');if(so)so.style.display='none';
    var ch=document.getElementById('tc-crosshair');if(ch)ch.style.display='none';
    document.getElementById('tc-btn-start').textContent='✅ 完成';document.getElementById('tc-btn-start').disabled=false;
    if(this.scene){this.scene.stop();this.scene.destroy();this.scene=null;}
    var fa=0,fn=0,ts=0,tn=0,rt=0,rc=0,aa=0,an=0,pr=0,pn=0;
    Object.keys(this.allResults).forEach(function(k){var r=this.allResults[k];if(r.flickStats){fa+=r.flickStats.accuracy*r.flickStats.total;fn+=r.flickStats.total;rt+=r.flickStats.avgReactionTime*r.flickStats.total;rc+=r.flickStats.total;}if(r.trackingStats){ts+=r.trackingStats.trackingScore;tn++;}if(r.adsStats){aa+=r.adsStats.accuracy*r.adsStats.total;an+=r.adsStats.total;rt+=r.adsStats.avgReactionTime*r.adsStats.total;rc+=r.adsStats.total;}if(r.pollingRate){pr+=r.pollingRate;pn++;}}.bind(this));
    var afa=fn>0?fa/fn:0,ats=tn>0?ts/tn:0,art=rc>0?rt/rc:200,aaa=an>0?aa/an:0,apr=pn>0?Math.round(pr/pn):0,dpi=this.app.model.userInput.dpi;
    var ic=35;if(ats<0.6)ic=45;if(afa<0.6)ic=25;var b=360/(dpi*0.022*ic);var af=1+(afa-0.75)*0.6;af=Math.max(0.6,Math.min(1.4,af));var rf=1;if(art>300)rf=1.15;else if(art<180)rf=0.85;var tf=1;if(ats<0.6)tf=0.85;else if(ats>0.9)tf=1.1;var sens=b*af*rf*tf;sens=Math.max(0.1,Math.min(10,sens));var am=an>0&&fn>0?afa/aaa*0.85:0.85;am=Math.max(0.3,Math.min(2,am));
    var gs=[{game:'CS2',format:'sensitivity',value:sens.toFixed(2),sp:'console: sensitivity '+sens.toFixed(2)+'; zoom_sensitivity '+am.toFixed(2)},{game:'Valorant',format:'float',value:(sens/2.22).toFixed(4),sp:'设置→鼠标→灵敏度'},{game:'Apex Legends',format:'float',value:sens.toFixed(2),sp:'设置→鼠标/键盘; ADS倍率: '+am.toFixed(2)},{game:'Overwatch 2',format:'float',value:(sens*3.33).toFixed(2),sp:'设置→控制→灵敏度'},{game:'Call of Duty',format:'int 1-20',value:Math.round(sens*7.5)+'',sp:'设置→鼠标→灵敏度'},{game:'BF2042',format:'%',value:Math.round(sens*15)+'%',sp:'设置→鼠标→灵敏度'},{game:'R6 Siege',format:'int 1-100',value:Math.round(sens*15)+'',sp:'设置→控制→灵敏度'},{game:'Destiny 2',format:'int 1-20',value:Math.round(sens*5)+'',sp:'设置→控制→灵敏度'}];
    var m=this.app.model;m.reset();m.setDpi(dpi);m.setControllerType(m.userInput.controllerType);m.calculateFromGameSensitivity(sens);
    m.hardware.mousePollingRate=apr;m.hardware.mouseConnection=apr>800?'wired':(apr>200?'wireless':'bluetooth');
    m.scores.flickAccuracy=afa;m.scores.flickAvgTimeMs=art;m.scores.trackingScore=ats;m.scores.trackingDeviation=ats>0?(1-ats)*0.5:0;
    m.scores.reactionTimeMs=art;m.scores.reactionAccuracy=afa;m.scores.hitMap=[];if(fn>0){for(var i=0;i<50;i++)m.scores.hitMap.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,hit:Math.random()<afa});}
    m.meta.iterations=3;m.meta.testDuration=(performance.now()-this.testStartTime)/1000;m.gameSensitivityTable=gs;m.adsMultiplier=parseFloat(am.toFixed(2));
    var ph=document.getElementById('tc-placeholder');if(ph)ph.style.display='';
    this.app.reportView.render(m);MainPanel.showPage('page-report');
  }
}
window.TestControls=TestControls;
