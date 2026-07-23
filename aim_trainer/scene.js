class AimScene {
  constructor(cid){this.invertX=!!window.__GAMEPAD_INVERT_X__;this.invertY=!!window.__GAMEPAD_INVERT_Y__;this.leftHanded=!!window.__GAMEPAD_LEFT_HANDED__;
    this.container=document.getElementById(cid);
    this.scene=null;this.camera=null;this.renderer=null;this.clock=new THREE.Clock();
    this.yaw=0;this.pitch=0;this.isLocked=false;this.sensitivity=0.002;
    this.targets=[];this.activeTarget=null;
    this.running=false;this.mode=null;this.round=0;this.maxRounds=10;
    this.flickShots=[];this.trackingSamples=[];this.trackingTransfers=[];this.adsShots=[];
    this.testStartTime=0;this.targetSpawnTime=0;this.targetTimeout=8;
    this.onStatsUpdate=null;this.onComplete=null;this.onHitCallback=null;this.onAdsCallback=null;
    this.mouseEventTimes=[];this.rawEventCount=0;this._pollingTimeStart=0;
    this.gamepad=null;
    this.gamepadTimestamps=[];this.aimSamples=[];this.aimSamplesX=[];this.aimSamplesY=[];this.peakStickX=0;this.peakStickY=0;this.sampleCount=0;
    this.isAds=false;
    this.trackingElapsed=0;this.trackingDuration=5;
    // ★ 跟枪瞄准转移时间：新目标出现时记录，首次射击时计算差值
    this.trackingTransferStart=0;
    this._hasTransferShot=false;
  }
  init(){
    var c=this.container,w=c.clientWidth,h=c.clientHeight;
    if(w===0||h===0){var s=this;setTimeout(function(){s.init();},50);return;}
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x0d1117);
    this.camera=new THREE.PerspectiveCamera(90,w/h,0.1,50);this.camera.position.set(0,0.5,0);this.camera.rotation.order='YXZ';
    this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setSize(w,h);this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    while(c.firstChild)c.removeChild(c.firstChild);c.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.AmbientLight(0x8080a0,0.8));var dl=new THREE.DirectionalLight(0xffffff,1.0);dl.position.set(5,10,5);this.scene.add(dl);
    this.scene.add(new THREE.HemisphereLight(0x8888ff,0x444422,0.4));
    var g=new THREE.GridHelper(20,20,0x444466,0x333355);g.position.y=-0.5;this.scene.add(g);
    this._bindEvents();var s=this;
    this._resizeHandler=function(){var w2=s.container.clientWidth,h2=s.container.clientHeight;if(w2>0&&h2>0){s.camera.aspect=w2/h2;s.camera.updateProjectionMatrix();s.renderer.setSize(w2,h2);}};
    window.addEventListener('resize',this._resizeHandler);this.initialized=true;this._animate();
  }
  _bindEvents(){
    var s=this;
    this.renderer.domElement.addEventListener('click',function(){if(!s.isLocked&&s.running)s.renderer.domElement.requestPointerLock();});
    document.addEventListener('pointerlockchange',function(){s.isLocked=document.pointerLockElement===s.renderer.domElement;});
    document.addEventListener('pointermove',function(e){
      if(!s.isLocked||!s.running)return;
      var ces=e.getCoalescedEvents&&e.getCoalescedEvents()||[e];
      var now=performance.now();
      if(!s._pollingTimeStart)s._pollingTimeStart=now;
      s.rawEventCount+=ces.length;
      s.mouseEventTimes.push(now);if(s.mouseEventTimes.length>200)s.mouseEventTimes.shift();
      for(var ci=0;ci<ces.length;ci++){
        var ce=ces[ci];
        s.yaw-=ce.movementX*s.sensitivity;s.pitch-=ce.movementY*s.sensitivity;
        s.pitch=Math.max(-Math.PI/2.2,Math.min(Math.PI/2.2,s.pitch));
        if(s.activeTarget&&!s.activeTarget.hit&&s.activeTarget.type==='moving'){
          var d=new THREE.Vector3(0,0,-1),e2=new THREE.Euler(s.pitch,s.yaw,0,'YXZ');d.applyEuler(e2);
          var t=s.activeTarget.getPos().clone().sub(s.camera.position).normalize();
          s.trackingSamples.push({deviation:d.angleTo(t),timestamp:performance.now()});
        }
      }
    });
    document.addEventListener('mousedown',function(e){
      if(!s.isLocked||!s.running)return;
      if(e.button===2){if(s.mode==='tracking')return;s.isAds=!s.isAds;if(s.onAdsCallback)s.onAdsCallback(s.isAds);if(s.isAds){s.yaw=0;s.pitch=0;}return;}
      if(e.button===0)s._fireShot();
    });
    document.addEventListener('contextmenu',function(e){e.preventDefault();});
  }
  _fireShot(){
    if(!this.activeTarget||this.activeTarget.hit)return;
    var d=new THREE.Vector3(0,0,-1),e=new THREE.Euler(this.pitch,this.yaw,0,'YXZ');d.applyEuler(e);
    var r=new THREE.Raycaster(this.camera.position,d,0.1,20),hits=r.intersectObject(this.activeTarget.mesh);
    var now=performance.now(),age=this.activeTarget.getAge(),tType=this.activeTarget.type;
    if(hits.length>0){
      // ★ 跟枪模式：移动目标—记录瞄准转移时间，但不切换目标，不标记hit
      if(tType==='moving'){
        if(!this._hasTransferShot&&this.trackingTransferStart>0){
          var transferMs=now-this.trackingTransferStart;
          this.trackingTransfers.push(transferMs);
          this._hasTransferShot=true;
        }
        // 视觉反馈（命中闪烁）但不改变目标状态
        if(this.onHitCallback)this.onHitCallback();
        return;
      }
      this.activeTarget.onHit();if(this.onHitCallback)this.onHitCallback();
      if(tType==='static'){
        if(this.isAds)this.adsShots.push({hit:true,reactionTime:age*1000,targetPos:this.activeTarget.getPos().clone(),timestamp:now});
        else this.flickShots.push({hit:true,reactionTime:age*1000,targetPos:this.activeTarget.getPos().clone(),hitPos:hits[0].point.clone(),timestamp:now});
      }
      this._nextTarget();
    }else if(tType==='static'&&!this.isAds){
      this.flickShots.push({hit:false,reactionTime:age*1000,targetPos:this.activeTarget.getPos().clone(),timestamp:now});
    }
  }
  _nextTarget(){
    if(this.activeTarget){this.activeTarget.removeFrom(this.scene);var i=this.targets.indexOf(this.activeTarget);if(i>=0)this.targets.splice(i,1);this.activeTarget=null;}
    if(this.mode==='tracking'){
      if(this.round>=this.maxRounds){this._finishScenario();return;}
      this.round++;this.trackingElapsed=0;this._spawn('moving',15);
      // ★ 新目标出现，重置瞄准转移计时
      this.trackingTransferStart=performance.now();
      this._hasTransferShot=false;
      return;
    }
    if(this.round>=this.maxRounds){this._finishScenario();return;}
    this.round++;
    this._spawn('static',8);
    if(this.mode==='ads'){this.isAds=false;this.yaw=0;this.pitch=0;if(this.onAdsCallback)this.onAdsCallback(false);}
  }
  _spawn(type,timeout){
    var x=(Math.random()-0.5)*6,y=(Math.random()-0.5)*3+0.5,z=-(3+Math.random()*4);
    var size=0.2+Math.random()*0.2,target=new AimTarget(type,new THREE.Vector3(x,y,z),size,0);
    this.targets.push(target);this.scene.add(target.mesh);this.scene.add(target.ring);
    this.activeTarget=target;this.targetSpawnTime=performance.now();this.targetTimeout=timeout||8;
    this._emitStats();
  }
  start(mode,rounds){
    if(this.running)return;
    if(!this.initialized){this.init();var s=this;setTimeout(function(){s.start(mode,rounds);},200);return;}
    this.flickShots=[];this.trackingSamples=[];this.trackingTransfers=[];this.adsShots=[];this.mouseEventTimes=[];this.rawEventCount=0;this._pollingTimeStart=0;
    this.round=1;this.mode=mode||'flick';this.maxRounds=rounds||10;
    this.isAds=false;
    this.clock=new THREE.Clock();
    this.running=true;this.testStartTime=performance.now();
    if(!this.isLocked)this.renderer.domElement.requestPointerLock();
    if(this.mode==='ads'){this.yaw=0;this.pitch=0;}
    if(this.mode==='tracking'){this.trackingElapsed=0;this._spawn('moving',15);this.trackingTransferStart=performance.now();this._hasTransferShot=false;}
    else this._spawn('static',8);
    this._emitStats();
  }
  stop(){this.running=false;this.mode=null;this._clear();if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();}
  _clear(){for(var i=0;i<this.targets.length;i++)this.targets[i].removeFrom(this.scene);this.targets=[];this.activeTarget=null;}
  _finishScenario(){this.running=false;this._clear();if(this.onComplete)this.onComplete(this._getResults());}
  _getResults(){
    var r={flickStats:null,trackingStats:null,adsStats:null,pollingRate:null,gamepadPollingRate:null};
    if(this.rawEventCount>2&&this._pollingTimeStart){var elapsed=performance.now()-this._pollingTimeStart;r.pollingRate=elapsed>0?Math.round(this.rawEventCount/elapsed*1000):null;}else if(this.mouseEventTimes.length>2){var t=this.mouseEventTimes,d=[];for(var i=1;i<t.length;i++)d.push(t[i]-t[i-1]);d.sort(function(a,b){return a-b;});var st=Math.floor(d.length*0.1),en=Math.ceil(d.length*0.9),mid=d.slice(st,en),avg=mid.reduce(function(a,b){return a+b;},0)/mid.length;r.pollingRate=avg>0?Math.round(1000/avg):null;}
    if(this.flickShots.length>0){var h=this.flickShots.filter(function(s){return s.hit;}).length;r.flickStats={total:this.flickShots.length,hits:h,accuracy:h/this.flickShots.length,avgReactionTime:this.flickShots.length?this.flickShots.reduce(function(a,s){return a+s.reactionTime;},0)/this.flickShots.length:0};}
    if(this.trackingSamples.length>0){var de=this.trackingSamples.map(function(s){return s.deviation;}),av=de.reduce(function(a,b){return a+b;},0)/de.length;var transAvg=this.trackingTransfers.length>0?this.trackingTransfers.reduce(function(a,b){return a+b;},0)/this.trackingTransfers.length:null;r.trackingStats={samples:this.trackingSamples.length,avgDeviation:av,maxDeviation:Math.max.apply(null,de),timeOnTarget:de.filter(function(d){return d<0.2;}).length/de.length,trackingScore:Math.max(0,Math.min(1,1-av*2)),avgTransferTime:transAvg};}
    if(this.adsShots.length>0){var h2=this.adsShots.filter(function(s){return s.hit;}).length;r.adsStats={total:this.adsShots.length,hits:h2,accuracy:h2/this.adsShots.length,avgReactionTime:this.adsShots.length?this.adsShots.reduce(function(a,s){return a+s.reactionTime;},0)/this.adsShots.length:0};}
    // ★ 改用 GamepadCapture.getPollingRate() — 基于 gamepad.timestamp 的真实硬件轮询率
    if(window.__GAMEPAD__){r.gamepadPollingRate=window.__GAMEPAD__.getPollingRate();}if(this.aimSamplesX.length>0||this.aimSamplesY.length>0){var cs=function(d){if(!d||d.length<1)return null;var s=d.slice().sort(function(a,b){return Math.abs(a.i)-Math.abs(b.i);});var st=Math.floor(s.length*0.1),en=Math.ceil(s.length*0.9),mid=s.slice(st,en);var si=0,so=0,sio=0,sii=0;for(var i=0;i<mid.length;i++){var ai=Math.abs(mid[i].i),ao=Math.abs(mid[i].o);si+=ai;so+=ao;sio+=ai*ao;sii+=ai*ai;}var n=mid.length,sRatio=si>0?(so/n)/(si/n)*100:0,sSlope=sii>0?sio/sii:0;var segs=[],segSize=Math.max(1,Math.floor(s.length/8));for(var si2=0;si2<8;si2++){var a2=si2*segSize,b2=Math.min((si2+1)*segSize,s.length);if(a2>=s.length)break;var ssi=0,sso=0,sc2=0;for(var j2=a2;j2<b2;j2++){ssi+=Math.abs(s[j2].i);sso+=Math.abs(s[j2].o);sc2++;}segs.push({input:sc2?ssi/sc2:0,output:sc2?sso/sc2:0});}return{ratio:parseFloat(sRatio.toFixed(2)),intVal:Math.round(sRatio*15),slope:parseFloat(sSlope.toFixed(4)),curveData:segs,samples:s.length};};var sx=cs(this.aimSamplesX),sy=cs(this.aimSamplesY);if(sx||sy){r.stickSensitivity=sx||sy;r.stickSensitivity.ratioX=sx?sx.ratio:null;r.stickSensitivity.ratioY=sy?sy.ratio:null;r.stickSensitivity.peakX=parseFloat(this.peakStickX.toFixed(2));r.stickSensitivity.peakY=parseFloat(this.peakStickY.toFixed(2));r.stickSensitivity.totalSamples=this.sampleCount;}}
    return r;
  }
  _emitStats(){var ts=0;if(this.trackingSamples.length>0){var d=this.trackingSamples.map(function(s){return s.deviation;});var a=d.reduce(function(x,y){return x+y;},0)/d.length;ts=Math.max(0,Math.min(1,1-a*2));}if(this.onStatsUpdate)this.onStatsUpdate({round:this.round,maxRounds:this.maxRounds,mode:this.mode,flickHits:this.flickShots.filter(function(s){return s.hit;}).length,flickTotal:this.flickShots.length,trackingSamples:this.trackingSamples.length,trackingScore:ts,adsHits:this.adsShots.filter(function(s){return s.hit;}).length,adsTotal:this.adsShots.length});}
  _animate(){
    var s=this;requestAnimationFrame(function(){s._animate();});
    var dt=this.clock.getDelta();this.camera.rotation.y=this.yaw;this.camera.rotation.x=this.pitch;
    if(this.running)this._pollGamepad();
    if(this.running&&this.mode==='tracking'&&this.activeTarget){this.trackingElapsed+=dt;if(this.trackingElapsed>=this.trackingDuration){this._advanceTracking();}}
    if(this.running&&this.activeTarget&&!this.activeTarget.hit&&this.mode!=='tracking'&&(performance.now()-this.targetSpawnTime)/1000>this.targetTimeout){this.activeTarget.removeFrom(this.scene);var i2=this.targets.indexOf(this.activeTarget);if(i2>=0)this.targets.splice(i2,1);this.activeTarget=null;this._nextTarget();}
    this.targets=this.targets.filter(function(t){var a=t.update(dt);if(!a){t.removeFrom(s.scene);return false;}return true;});
    this.renderer.render(this.scene,this.camera);
  }
  _advanceTracking(){
    if(this.activeTarget){this.activeTarget.removeFrom(this.scene);var i=this.targets.indexOf(this.activeTarget);if(i>=0)this.targets.splice(i,1);this.activeTarget=null;}
    this._nextTarget();
  }
  _pollGamepad(){
    if(!window.__GAMEPAD__)return;
    var gp=window.__GAMEPAD__;
    var state=gp.poll();
    if(!state)return;
    if(state.axes[2]||state.axes[3]){
      var lh=this.leftHanded;var aimX=lh?state.axes[0]:state.axes[2];var aimY=lh?state.axes[1]:state.axes[3];var ix=this.invertX?-1:1;var iy=this.invertY?1:-1;if(typeof console!=='undefined')console.log('[DBG] invertX='+this.invertX+' invertY='+this.invertY+' iy='+iy);this.yaw-=aimX*0.008*ix;this.pitch+=aimY*0.008*iy;
      
      this.pitch=Math.max(-Math.PI/2.2,Math.min(Math.PI/2.2,this.pitch));
      this.gamepadTimestamps.push(performance.now());if(this.gamepadTimestamps.length>200)this.gamepadTimestamps.shift();if(Math.abs(aimX)>0.01){this.aimSamplesX.push({i:aimX,o:aimX*0.008*ix});if(this.aimSamplesX.length>2000)this.aimSamplesX.shift();if(Math.abs(aimX)>this.peakStickX)this.peakStickX=Math.abs(aimX);}if(Math.abs(aimY)>0.01){this.aimSamplesY.push({i:aimY,o:aimY*0.008*iy});if(this.aimSamplesY.length>2000)this.aimSamplesY.shift();if(Math.abs(aimY)>this.peakStickY)this.peakStickY=Math.abs(aimY);}this.sampleCount++;
      if(this.activeTarget&&!this.activeTarget.hit&&this.activeTarget.type==='moving'){
        var d2=new THREE.Vector3(0,0,-1),e2=new THREE.Euler(this.pitch,this.yaw,0,'YXZ');d2.applyEuler(e2);
        var t=this.activeTarget.getPos().clone().sub(this.camera.position).normalize();
        this.trackingSamples.push({deviation:d2.angleTo(t),timestamp:performance.now()});
      }
    }
    var now=performance.now();
    if(!this._lastFire)this._lastFire=0;
    var rtVal=state.buttons.rt;
    var rbVal=state.buttons.rb;
    var fire=gp.buttonJustPressed('rt')||gp.buttonJustPressed('rb');
    if(!fire&&(rtVal||rbVal)&&now-this._lastFire>350)fire=true;
    if(fire&&now-this._lastFire>150){this._fireShot();this._lastFire=now;}
    if(gp.buttonJustPressed('lt')&&this.mode!=='tracking'){this.isAds=!this.isAds;if(this.onAdsCallback)this.onAdsCallback(this.isAds);if(this.isAds){this.yaw=0;this.pitch=0;}}
  }
  destroy(){this.running=false;this.initialized=false;this._clear();if(this.renderer){this.renderer.dispose();this.container.innerHTML='';}if(this._resizeHandler)window.removeEventListener('resize',this._resizeHandler);if(document.pointerLockElement===this.renderer&&this.renderer)document.exitPointerLock();}
}
window.AimScene=AimScene;
