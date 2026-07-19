/**
 * parameter_model.js — 全动态灵敏度参数模型
 */
class ParameterModel {
  constructor() { this.reset(); }
  reset() {
    this.userInput = { dpi: 400, controllerType: 'none' };
    this.hardware = { mousePollingRate: null, mouseConnection: null, controllerModel: null, controllerConnection: null, controllerFirmware: null };
    this.mouse = { cmPer360: null, inchesPer360: null, edpi: null, gameSensitivityFloat: null, gameSensitivityInt: null, gameSensitivityRaw: null, zoomRatio: 0.85, perScope: [] };
    this.controller = { leftStickInnerDeadzone: null, leftStickOuterDeadzone: null, leftStickAxialDeadzone: null, rightStickInnerDeadzone: null, rightStickOuterDeadzone: null, rightStickAxialDeadzone: null, responseCurveType: null, responseCurveData: [], invertY: null, invertX: null, vibration: null, vibrationIntensity: null, leftTriggerDeadzone: null, rightTriggerDeadzone: null, triggerResponseCurve: null, apexLookSensitivity: null, apexResponseCurve: null, apexAdsMultiplier: null, apexPerOptics: [] };
    this.scores = { flickAccuracy: null, flickAvgTimeMs: null, trackingDeviation: null, trackingScore: null, reactionTimeMs: null, reactionAccuracy: null, hitMap: [] };
    this.meta = { testDate: new Date().toISOString(), testDuration: null, iterations: 0 };
  }
  setDpi(dpi) { this.userInput.dpi = parseInt(dpi) || 400; }
  setControllerType(type) { this.userInput.controllerType = type; }
  isControllerCustomizable() { return this.userInput.controllerType === 'third-party'; }
  isControllerEnabled() { return this.userInput.controllerType !== 'none'; }
  calculateFromGameSensitivity(gameSens) {
    const dpi = this.userInput.dpi;
    this.mouse.gameSensitivityFloat = gameSens;
    this.mouse.edpi = dpi * gameSens;
    this.mouse.cmPer360 = (360 * 2.54) / (dpi * gameSens * 0.022);
    this.mouse.inchesPer360 = this.mouse.cmPer360 / 2.54;
    this.mouse.gameSensitivityInt = Math.max(1, Math.round(gameSens));
    this.mouse.gameSensitivityRaw = this.mouse.edpi;
  }
  generateDpiTable() {
    if (!this.mouse.edpi) return [];
    const t = this.mouse.edpi, cur = this.userInput.dpi;
    return [400,800,1200,1600,2400,3200].map(d => {
      const f = t / d;
      return { dpi:d, gameSensFloat: parseFloat(f.toFixed(4)), gameSensInt: Math.max(1, Math.round(f)), edpi:t, cm360:(360*2.54)/(d*f*0.022), isCurrent:d===cur, note: d===cur?'⭐ 当前 DPI':(d>cur?'更平滑':'更粗糙') };
    });
  }
  generateSensitivityFormatTable() {
    if (!this.mouse.gameSensitivityFloat) return [];
    return [
      { format:'比值 (float)', value:this.mouse.gameSensitivityFloat, description:'大多数现代射击游戏使用的小数灵敏度', games:['Valorant','Apex Legends','Overwatch 2','Battlefield','Call of Duty'] },
      { format:'整数 (int)', value:this.mouse.gameSensitivityInt, description:'部分老式引擎游戏使用整数', games:['CS2 (近似值)','Half-Life 2','老式引擎游戏'] },
      { format:'eDPI (原始)', value:this.mouse.edpi, description:'DPI × 灵敏度 - 跨DPI等效基准值', games:['Quake Live','自定义引擎','通用参考'] },
      { format:'cm/360°', value:parseFloat(this.mouse.cmPer360.toFixed(1)), description:'鼠标垫移动一整圈的距离', games:['通用物理基准','所有FPS游戏'] }
    ];
  }
  fromTestResults(td) {
    if (!td) return;
    if (td.hardware) Object.assign(this.hardware, td.hardware);
    if (td.mouse && td.mouse.gameSensitivityFloat) {
      this.calculateFromGameSensitivity(td.mouse.gameSensitivityFloat);
      if (td.mouse.zoomRatio) this.mouse.zoomRatio = td.mouse.zoomRatio;
      if (td.mouse.perScope) this.mouse.perScope = td.mouse.perScope;
    }
    if (td.controller) Object.assign(this.controller, td.controller);
    if (td.scores) Object.assign(this.scores, td.scores);
    if (td.meta) Object.assign(this.meta, td.meta);
    this.meta.iterations = (this.meta.iterations||0) + 1;
  }
  loadDemoData(dpi=400, ctrl='none') {
    this.reset(); this.setDpi(dpi); this.setControllerType(ctrl);
    this.hardware.mousePollingRate=1000; this.hardware.mouseConnection='wired';
    this.hardware.controllerModel=ctrl!=='none'?'Xbox Elite Series 2':null;
    this.hardware.controllerConnection='bluetooth';
    this.calculateFromGameSensitivity(0.80);
    this.mouse.zoomRatio=0.85;
    this.mouse.perScope=[{scope:'1x / 红点',multiplier:0.85},{scope:'2x',multiplier:0.75},{scope:'4x',multiplier:0.65},{scope:'8x',multiplier:0.55}];
    if(this.isControllerCustomizable()){
      this.controller.leftStickInnerDeadzone=0.12; this.controller.leftStickOuterDeadzone=0.95;
      this.controller.rightStickInnerDeadzone=0.10; this.controller.rightStickOuterDeadzone=0.95;
      this.controller.responseCurveType='custom';
      this.controller.responseCurveData=[{input:0,output:0},{input:0.1,output:0.02},{input:0.2,output:0.05},{input:0.3,output:0.10},{input:0.5,output:0.25},{input:0.7,output:0.50},{input:0.9,output:0.80},{input:1,output:1}];
      this.controller.invertY=false; this.controller.invertX=false; this.controller.vibration=true; this.controller.vibrationIntensity=0.7;
      this.controller.leftTriggerDeadzone=0.05; this.controller.rightTriggerDeadzone=0.05;
      this.controller.apexLookSensitivity='4'; this.controller.apexResponseCurve='5'; this.controller.apexAdsMultiplier='1.0';
      this.controller.apexPerOptics=[{scope:'1x HCOG',value:'1.2'},{scope:'2x HCOG',value:'1.1'},{scope:'3x HCOG',value:'1.0'},{scope:'4x-8x VVR',value:'0.9'}];
    }
    if(this.isControllerEnabled()&&!this.isControllerCustomizable()){
      this.controller.invertY=false; this.controller.invertX=false; this.controller.vibration=true;
      this.controller.responseCurveType='linear (硬件固定)';
    }
    this.scores.flickAccuracy=0.87; this.scores.flickAvgTimeMs=285;
    this.scores.trackingDeviation=0.12; this.scores.trackingScore=0.82;
    this.scores.reactionTimeMs=198; this.scores.reactionAccuracy=0.91;
    this.scores.hitMap=Array.from({length:200},()=>({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,hit:Math.random()>0.15}));
    this.meta.iterations=8; this.meta.testDuration=360;
  }
  toJSON() {
    return {meta:this.meta, userInput:this.userInput, hardware:this.hardware, mouse:this.mouse, controller:this.controller, scores:this.scores, dpiTable:this.generateDpiTable(), sensitivityFormats:this.generateSensitivityFormatTable(), gameSensitivityTable:this.gameSensitivityTable||[]};
  }
}
window.ParameterModel = ParameterModel;
