class TestControls {
  constructor(a){this.app=a;this.scene=null;this.allResults={};this.phase=0;this.testStartTime=0;}
  init(c){this.container=document.getElementById(c);if(!this.container)return;this._render();this._bindEvents();}
  _render(){this.container.innerHTML=[
    '<div class="tc-header"><div class="tc-status" id="tc-status">🎯 灵敏度自动测试 — 三阶段连测</div></div>',
    '<div class="tc-vpwrapper"><div class="tc-viewport" id="tc-viewport">',
    '  <div class="tc-placeholder" id="tc-placeholder">',
    '    <div class="tc-placeholder-icon">🎮</div><h3>3D 练枪场景</h3>',
    '    <p>点击下方按钮开始三阶段自动测试</p><p class="tc-hint">左键射击 · 右键开镜 · ESC退出锁定 (RT射击 · LT开镜)</p>',
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
    '<div class="tc-controller-help" id="tc-controller-help" style="display:none">🎮 <span id="tc-help-text">右摇杆瞄准 · RT射击 · LT开镜 · RB备用射击</span></div>',
'<div class="tc-footer"><div class="tc-stats">',
    '  <div class="tc-stat"><span class="tc-stat-label">阶段</span><span class="tc-stat-value" id="tc-phase">—</span></div>',
    '  <div class="tc-stat"><span class="tc-stat-label">轮次</span><span class="tc-stat-value" id="tc-round">0/0</span></div>',
    '  <div class="tc-stat"><span class="tc-stat-label">命中</span><span class="tc-stat-value" id="tc-hits">0</span></div>',
    '</div><div class="tc-actions"><button id="tc-btn-start" class="btn btn-primary">▶ 开始测试 (A)</button></div></div>'
  ].join('');}
  _bindEvents(){var s=this;document.getElementById('tc-btn-start').addEventListener('click',function(){s._start();});this._startControllerNav();}
  _start(){
    var ph=document.getElementById('tc-placeholder');if(ph)ph.style.display='none';
    var ch=document.getElementById('tc-crosshair');if(ch)ch.style.display='';
    if(this.scene){this.scene.destroy();}
    this.phase=0;this.allResults={};this.testStartTime=performance.now();
    this.scene=new AimScene('tc-viewport');if(window.__GAMEPAD__&&window.__GAMEPAD__.connected)this.scene.gamepad=window.__GAMEPAD__;this.scene.invertX=!!window.__GAMEPAD_INVERT_X__;this.scene.invertY=!!window.__GAMEPAD_INVERT_Y__;this.scene.leftHanded=!!window.__GAMEPAD_LEFT_HANDED__;var s=this;
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
    var gc=window.__GAMEPAD__;var hp=document.getElementById('tc-controller-help');if(hp&&gc){var st2=gc.poll();hp.style.display=st2?'':'none';}this._showNotice(0);
  }
  _startControllerNav(){var s=this;this._tcNavRAF=null;function poll(){s._pollTcNav();s._tcNavRAF=requestAnimationFrame(poll);}s._tcNavRAF=requestAnimationFrame(poll);}
  _pollTcNav(){if(!document.getElementById('page-test').classList.contains('active'))return;if(!window.__GAMEPAD__)return;var btn=document.getElementById('tc-btn-start');if(!btn||btn.disabled)return;var gp=window.__GAMEPAD__;var st=gp.poll();if(!st)return;if(gp.buttonJustPressed('a')||gp.buttonJustPressed('start')){btn.click();}}
  _showNotice(idx){
    var names=['🎯 拉枪测试','🎯 跟枪测试','🔭 开镜拉枪'];
    if(idx>=3){this._beginPhase(0);return;}
    var n=document.getElementById('tc-phase-notice');var ic=document.getElementById('tcpn-icon');var tx=document.getElementById('tcpn-text');
    if(n)n.style.display='';if(ic)ic.textContent=names[idx].slice(0,2);if(tx)tx.textContent=names[idx];
    document.getElementById('tc-phase').textContent=names[idx];var ht=document.getElementById('tc-help-text');if(ht){var hx=['🎯 右摇杆瞄准目标 → 按RT射击','🎯 右摇杆跟随移动目标','🔭 按LT开镜 → 右摇杆瞄准 → 按RT射击'];ht.textContent=hx[idx]||'🎮 右摇杆瞄准 · RT射击 · LT开镜';}
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
    var fa=0,fn=0,ts=0,tn=0,frt=0,frc=0,arc=0,aa=0,an=0,art=0,tt=0,ttn=0,pr=0,pn=0,gpr=0,gpn=0,ss=null;
    Object.keys(this.allResults).forEach(function(k){var r=this.allResults[k];if(r.flickStats){fa+=r.flickStats.accuracy*r.flickStats.total;fn+=r.flickStats.total;frt+=r.flickStats.avgReactionTime*r.flickStats.total;frc+=r.flickStats.total;}if(r.trackingStats){ts+=r.trackingStats.trackingScore;tn++;if(r.trackingStats.avgTransferTime!=null){tt+=r.trackingStats.avgTransferTime;ttn++;}}if(r.adsStats){aa+=r.adsStats.accuracy*r.adsStats.total;an+=r.adsStats.total;art+=r.adsStats.avgReactionTime*r.adsStats.total;arc+=r.adsStats.total;}if(r.pollingRate){pr+=r.pollingRate;pn++;}if(r.gamepadPollingRate){gpr+=r.gamepadPollingRate;gpn++;}if(r.stickSensitivity)ss=r.stickSensitivity;}.bind(this));
    var afa=fn>0?fa/fn:0,ats=tn>0?ts/tn:0,art=frc>0?frt/frc:200,transferTime=ttn>0?tt/ttn:art,aaa=an>0?aa/an:0,apr=pn>0?Math.round(pr/pn):0,agpr=gpn>0?Math.round(gpr/gpn):0,dpi=this.app.model.userInput.dpi;
    var ctl=this.app.model.userInput.controllerType;var ic=35;if(ats<0.6)ic=45;if(afa<0.6)ic=25;var b=360/(dpi*0.022*ic);var af=1+(afa-0.75)*0.6;af=Math.max(0.6,Math.min(1.4,af));var rf=1;if(art>300)rf=1.15;else if(art<180)rf=0.85;var tf=1;if(ats<0.6)tf=0.85;else if(ats>0.9)tf=1.1;var sens=b*af*rf*tf;sens=Math.max(0.1,Math.min(10,sens));var am=an>0&&fn>0?afa/aaa*0.85:0.85;am=Math.max(0.3,Math.min(2,am));if(ctl!=='none'){sens=3;am=0.85;}
    var gs=[{game:'CS2',format:'sensitivity',value:sens.toFixed(2),sp:'console: sensitivity '+sens.toFixed(2)+'; zoom_sensitivity '+am.toFixed(2)},{game:'Valorant',format:'float',value:(sens/2.22).toFixed(4),sp:'设置→鼠标→灵敏度'},{game:'Apex Legends',format:'float',value:sens.toFixed(2),sp:'设置→鼠标/键盘; ADS倍率: '+am.toFixed(2)},{game:'Overwatch 2',format:'float',value:(sens*3.33).toFixed(2),sp:'设置→控制→灵敏度'},{game:'Call of Duty',format:'int 1-20',value:Math.round(sens*7.5)+'',sp:'设置→鼠标→灵敏度'},{game:'BF2042',format:'%',value:Math.round(sens*15)+'%',sp:'设置→鼠标→灵敏度'},{game:'R6 Siege',format:'int 1-100',value:Math.round(sens*15)+'',sp:'设置→控制→灵敏度'},{game:'Destiny 2',format:'int 1-20',value:Math.round(sens*5)+'',sp:'设置→控制→灵敏度'}];
    var ctrlType=this.app.model.userInput.controllerType;var m=this.app.model;m.reset();m.setDpi(dpi);m.setControllerType(ctrlType);m.calculateFromGameSensitivity(sens);
    if(!this._sd)this._sd={};if(ss){this._sd.ratio=ss.ratio;this._sd.intVal=ss.intVal;this._sd.slope=ss.slope;this._sd.curveData=ss.curveData;}m.hardware.mousePollingRate=apr;m.hardware.mouseConnection=apr>0?apr+' Hz':'—';m.controller.stickRatio=this._sd.ratio||null;m.controller.stickInt=this._sd.intVal||null;m.controller.stickSlope=this._sd.slope||null;m.controller.stickCurve=this._sd.curveData||[];m.hardware.gamepadPollingRate=agpr;if(ctl!=='none'){var gp2=window.__GAMEPAD__;m.hardware.controllerModel=gp2&&gp2.id?gp2.id.split('(')[0].trim():'\u672a\u77e5\u624b\u67c4';m.hardware.controllerConnection=agpr>0?'\u65e0\u7ebf':'\u6709\u7ebf';m.controller.responseCurveType='\u7ebf\u6027';m.controller.invertX=!!window.__GAMEPAD_INVERT_X__;m.controller.invertY=!!window.__GAMEPAD_INVERT_Y__;m.controller.leftStickInnerDeadzone=0.15;m.controller.leftStickOuterDeadzone=0.95;m.controller.rightStickInnerDeadzone=0.15;m.controller.rightStickOuterDeadzone=0.95;m.controller.leftTriggerDeadzone=0.05;m.controller.rightTriggerDeadzone=0.05;}
    m.scores.flickAccuracy=afa;m.scores.flickAvgTimeMs=art;m.scores.trackingScore=ats;m.scores.trackingDeviation=ats>0?(1-ats)*0.5:null;
    m.scores.reactionTimeMs=art;m.scores.reactionAccuracy=afa;m.scores.hitMap=[];if(fn>0){for(var i=0;i<50;i++)m.scores.hitMap.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,hit:Math.random()<afa});}
    m.meta.iterations=3;m.meta.testDuration=(performance.now()-this.testStartTime)/1000;m.gameSensitivityTable=gs;m.adsMultiplier=parseFloat(am.toFixed(2));
    // ★ Apex 控制器适配评估
    if(ctl!=='none'){m.apex=this._calculateApexFit(afa,ats,transferTime,ss,agpr);}
    var ph=document.getElementById('tc-placeholder');if(ph)ph.style.display='';
    if(this.app.reportView){this.app.reportView.render(m);MainPanel.showPage('page-report');}
  }
  // ★ Apex 线性43适配评估 + ACL 参数计算（v2：指数加权惩罚 + 单项门槛 + 80%阈值）
  _calculateApexFit(flickAcc, trackingScore, reactionTime, stickSens, gamepadPollingRate) {
    var rt = reactionTime || 250;
    // — 1. 指数加权评分：低分平方惩罚 —
    // 拉枪准确率：理想基准0.8，低于基准时平方降分
    var flickRaw = Math.min(1, (flickAcc||0) / 0.8);
    var flickScore = flickRaw * flickRaw;
    // 跟枪得分：理想基准0.8
    var trackRaw = Math.min(1, (trackingScore||0) / 0.8);
    var trackScore = trackRaw * trackRaw;
    // 反应时间：理想基准150ms，分母400让变化更平滑
    var reactRaw = rt > 0 ? Math.max(0, 1 - (rt - 150) / 400) : 0.5;
    var reactScore = reactRaw * reactRaw;
    // 摇杆控制评估：使用摇杆峰值(peakStick)和有效斜率(slope)
    // 不再使用 ratio（因为 o=aimX*0.008 固定系数，ratio恒为0.8无区分度）
    var ratioScore = 0.5;
    var peakStick = 0;
    if (stickSens) {
      peakStick = Math.max(
        (stickSens.peakX) || 0,
        (stickSens.peakY) || 0
      );
      // 峰值高→线性控制好，峰值低→推幅不足
      var peakRaw = Math.min(1, peakStick / 0.7);
      ratioScore = peakRaw * peakRaw;
    }

    // — 2. 加权总分 —
    var scoreItems = [
      {score: flickScore, weight: 0.3},
      {score: trackScore, weight: 0.3},
      {score: reactScore, weight: 0.2},
      {score: ratioScore, weight: 0.2}
    ];
    var totalWeight = scoreItems.reduce(function(a, b) { return a + b.weight; }, 0);
    var weightedScore = scoreItems.reduce(function(a, b) { return a + b.score * b.weight; }, 0) / totalWeight;

    // — 3. 单项最低门槛检查（硬性指标）—
    var flickOk = (flickAcc||0) >= 0.6;
    var trackOk = (trackingScore||0) >= 0.6;
    var reactOk = rt <= 350;

    // — 4. 综合判断：总分≥80% 且所有单项达标 —
    var isFit = weightedScore >= 0.8 && flickOk && trackOk && reactOk;

    // — 5. 原因说明 —
    var reason = '';
    var scorePct = Math.round(weightedScore * 100);
    if (isFit) {
      reason = '测试者参数与线性43适配良好（综合评分' + scorePct + '%），所有指标均达标，继续保持当前设置。';
    } else {
      var parts = ['综合评分' + scorePct + '%（需≥80%）'];
      if (!flickOk) parts.push('拉枪准确率' + Math.round((flickAcc||0)*100) + '%（需≥60%）');
      if (!trackOk) parts.push('跟枪得分' + Math.round((trackingScore||0)*100) + '%（需≥60%）');
      if (!reactOk) {
        var rtNote = '反应时间' + Math.round(rt) + 'ms（需≤350ms）';
        if (rt > 1500) rtNote += ' 💡 用手柄跟踪移动目标难度较高，建议先熟悉摇杆瞄准';
        parts.push(rtNote);
      }
      if (peakStick < 0.3) parts.push('摇杆推幅不足(峰值' + peakStick.toFixed(2) + '，需>0.3)');
      reason = '线性43不完全适配：' + parts.join('；') + '。建议切换到ACL模式进行详细优化。';
    }

    // — 6. ACL完整参数（基于PSA动态数据计算，匹配Apex Advanced Look Controls全部项目）—
    var acl = null;
    if (!isFit) {
      // ---- Hipfire (腰射) 参数 ----
      // 基准Yaw Speed从线性43的灵敏度4起步（对应ACL ~150）
      var baseYaw = 150;
      // 根据PSA测试数据调整
      if ((flickAcc||0) < 0.6) baseYaw += 20;        // 拉枪慢→提高转速
      else if ((flickAcc||0) > 0.85) baseYaw -= 10;    // 拉枪准→降低转速更精细
      if ((trackingScore||0) < 0.6) baseYaw -= 15;     // 跟枪差→降低转速增加控制
      else if ((trackingScore||0) > 0.85) baseYaw += 10;
      if (rt > 400) baseYaw += 15;                     // 反应慢→提高转速
      else if (rt < 200) baseYaw -= 10;
      // 摇杆峰值低→输出不足→提高转速补偿
      if (peakStick > 0 && peakStick < 0.3) baseYaw += 25;
      // ★ 轮询率全局因子：低轮询率→所有速度降低（信息少需稳定），高轮询率→可适度提高
      // 基准250Hz，公式 (pollingRate/250)^0.7，范围0.35~1.5
      var pollingFactor = 1.0;
      if (gamepadPollingRate > 0) {
        pollingFactor = Math.max(0.35, Math.min(1.5, Math.pow(gamepadPollingRate / 250, 0.85)));
      }
      var yawSpeed = Math.max(40, Math.min(250, Math.round(baseYaw * pollingFactor)));

      // 垂直速度：水平速度的70-85%
      var pitchRatio = (trackingScore||0) < 0.6 ? 0.70 : ((trackingScore||0) > 0.85 ? 0.85 : 0.78);
      var pitchSpeed = Math.max(30, Math.min(250, Math.round(yawSpeed * pitchRatio)));

      // 转向额外速度（摇杆推到底的额外增量）
      var yawExtraBase = Math.round(yawSpeed * 0.25);
      if ((flickAcc||0) < 0.6) yawExtraBase = Math.round(yawExtraBase * 1.5);
      var yawExtra = Math.max(0, Math.min(250, Math.round(yawExtraBase / 5) * 5));
      var pitchExtra = Math.max(0, Math.min(250, Math.round(Math.round(yawExtra * 0.7) / 5) * 5));

      // 转向启动延迟（Ramp-Up Time）— 反应快→高延迟精细控制，反应慢→低延迟快速加速
      // 转向启动时间 (Ramp Up Time) — 跟枪差→时间短(快速达最大速度辅助跟踪)，跟枪好→时间长(平滑控制)
      var rampUpTime = Math.max(0, Math.min(100, Math.round(60 - (trackingScore||0) * 40)));
      // 转向启动延迟 (Ramp Up Delay) — 跟枪差→延迟短(快速响应)，跟枪好→延迟稍长(精细操作)
      var rampUpDelay = Math.max(0, Math.min(100, Math.round(20 - (trackingScore||0) * 15)));

      // 响应曲线 (1-30)：跟枪差→高曲线辅助，跟枪好→低曲线(接近线性)
      var curveVal = 7; // 默认
      if ((trackingScore||0) > 0.8) curveVal = 3;       // 跟枪好→接近线性
      else if ((trackingScore||0) > 0.6) curveVal = 5;   // 跟枪中→中等
      else if ((trackingScore||0) > 0.4) curveVal = 7;   // 跟枪差→高曲线辅助
      else curveVal = 10;
      // 有效斜率低（输出不成比例）→提高曲线补偿
      if (stickSens && stickSens.slope != null && stickSens.slope < 0.5) curveVal = Math.min(30, curveVal + 3);

      // 死角 (Deadzone %) — 峰值高→死区小(精细控制)，峰值低→死区稍大(防止漂移)
      var deadzonePct = Math.round(4 + (1 - Math.min(peakStick||0.5, 1)) * 6);
      // 跟枪偏差大→死区稍大减少抖动
      if ((trackingScore||0) < 0.5) deadzonePct = Math.min(15, deadzonePct + 2);

      // 外部阈值 (Outer Threshold 0-30%) — 跟枪差→低值(更快加速)，跟枪好→高值(精细控制)
      var outerThreshold = Math.round(15 + (trackingScore||0) * 15);

      // ---- ADS (开镜) 参数 ----
      // ADS速度 = Hipfire减约10%（基于校准数据），额外转向与Hipfire一致
      var adsYawSpeed = Math.round(yawSpeed * 0.9);
      var adsPitchSpeed = Math.round(pitchSpeed * 0.9);
      var adsYawExtra = Math.round(Math.round(yawExtra / 5) * 5);
      var adsPitchExtra = Math.round(Math.round(pitchExtra / 5) * 5);
      var adsRampUpTime = Math.min(100, Math.round(rampUpTime * 0.9));
      var adsRampUpDelay = Math.min(100, Math.round(rampUpDelay * 1.1));

      acl = {
        // 死角
        rightDeadzone: deadzonePct + '%',
        leftDeadzone: deadzonePct + '%',
        outerThreshold: outerThreshold + '%',
        // 响应曲线
        responseCurve: curveVal,
        // Hipfire
        yawSpeed: yawSpeed,
        pitchSpeed: pitchSpeed,
        yawExtra: yawExtra,
        pitchExtra: pitchExtra,
        rampUpTime: rampUpTime + '%',
        rampUpDelay: rampUpDelay + '%',
        // ADS
        adsYawSpeed: adsYawSpeed,
        adsPitchSpeed: adsPitchSpeed,
        adsYawExtra: adsYawExtra,
        adsPitchExtra: adsPitchExtra,
        adsRampUpTime: adsRampUpTime + '%',
        adsRampUpDelay: adsRampUpDelay + '%'
      };
    }

    return {
      linear43Fit: {
        score: parseFloat(weightedScore.toFixed(2)),
        isFit: isFit,
        reason: reason
      },
      aclParams: acl
    };
  }
}
window.TestControls=TestControls;
