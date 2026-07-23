class GameProfiles {
  constructor() { this.profiles = this._buildProfiles(); }
  _buildProfiles() {
    return [
      { name:'Counter-Strike 2', shortName:'CS2', type:'fps', sensitivityFormat:{ type:'float', range:'0.01~20.00', defaultStep:'0.01', settingPath:'设置 → 键盘/鼠标 → 灵敏度', example:'sensitivity "0.80"' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'zoom_sensitivity_ratio_mouse', format:'float', range:'0.1~2.0', default:0.85, settingPath:'控制台指令' }, edpiNote:'职业选手范围: 200~1600 eDPI' },
      { name:'Valorant', shortName:'VAL', type:'fps', sensitivityFormat:{ type:'float', range:'0.01~10.00', defaultStep:'0.01', settingPath:'设置 → 鼠标 → 灵敏度', example:'0.35 (DPI 800 时)' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'开镜灵敏度', format:'multiplier', range:'0.1~5.0', default:1.0, settingPath:'设置 → 鼠标 → 开镜灵敏度' }, edpiNote:'职业选手范围: 150~500 eDPI' },
      { name:'Apex Legends', shortName:'APEX', type:'battle-royale', sensitivityFormat:{ type:'float', range:'0.1~10.0', defaultStep:'0.1', settingPath:'设置 → 鼠标/键盘 → 灵敏度', example:'1.2' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'Per-Optic Sensitivity', format:'multiplier per scope', range:'0.2~5.0', default:'1.0', settingPath:'设置 → 鼠标/键盘 → 倍镜灵敏度' }, controllerSettings:{ lookSensitivity:{name:'Look Sensitivity',range:'1~10',default:'4'}, responseCurve:{name:'Response Curve',range:'0~10',default:'5'}, adsMultiplier:{name:'ADS Sensitivity Multiplier',range:'0.2~5.0',default:'1.0'}, perOptics:'每倍镜独立设置', deadzone:'不支持游戏内调死区（硬件固定）' }, edpiNote:'职业选手范围: 400~1600 eDPI' },
      { name:'Overwatch 2', shortName:'OW2', type:'fps', sensitivityFormat:{ type:'float', range:'0.01~100.00', defaultStep:'0.01', settingPath:'设置 → 控制 → 灵敏度', example:'3.50' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'Relative Aim Sensitivity While Zoomed', format:'multiplier', range:'0.0~1.0', default:0.5, settingPath:'设置 → 控制 → 开镜灵敏度' }, edpiNote:'职业选手范围: 3000~8000 eDPI' },
      { name:'Battlefield 2042', shortName:'BF2042', type:'fps', sensitivityFormat:{ type:'percentage', range:'1%~100%', defaultStep:'1%', settingPath:'设置 → 鼠标与键盘 → 灵敏度', example:'12%' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'Uniform Soldier Aiming', format:'coefficient', range:'0.0~2.0', default:1.33, settingPath:'设置 → 鼠标与键盘 → 统一瞄准' }, edpiNote:'百分比转换为eDPI需额外计算' },
      { name:'Call of Duty (MW3/WZ)', shortName:'COD', type:'fps', sensitivityFormat:{ type:'int (1~20)', range:'1~20', defaultStep:'1', settingPath:'设置 → 鼠标与键盘 → 灵敏度', example:'6' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'ADS Sensitivity Multiplier', format:'multiplier', range:'0.1~2.0', default:1.0, settingPath:'设置 → 鼠标与键盘 → 开镜灵敏度' }, edpiNote:'COD灵敏度为1~20整数' },
      { name:'Rainbow Six Siege', shortName:'R6S', type:'tactical-fps', sensitivityFormat:{ type:'int', range:'1~100', defaultStep:'1', settingPath:'设置 → 控制 → 灵敏度', example:'12 (垂直) / 12 (水平)' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'ADS Sensitivity', format:'per-scope multiplier', range:'1~100', default:'30 (1x) / 20 (2.5x)', settingPath:'设置 → 控制 → 高级 → 开镜灵敏度' }, edpiNote:'R6S有垂直/水平分离灵敏度' },
      { name:'Destiny 2', shortName:'D2', type:'fps', sensitivityFormat:{ type:'int', range:'1~20', defaultStep:'1', settingPath:'设置 → 控制 → 灵敏度', example:'4' }, dpiSetting:'不支持游戏内调DPI', scopeSetting:{ name:'ADS Sensitivity Modifier', format:'multiplier', range:'0.1~2.0', default:0.7, settingPath:'设置 → 控制 → 开镜灵敏度调节' }, edpiNote:'eDPI = DPI × (灵敏度 × 0.07)' }
    ];
  }
  getAll() { return this.profiles; }
  search(q) { const s=q.toLowerCase(); return this.profiles.filter(p=>p.name.toLowerCase().includes(s)||p.shortName.toLowerCase().includes(s)); }
  getSensitivityFormatGuide() {
    return [
      { format:'float (比值)', description:'最常见格式，一个小数表示的灵敏度值', examples:['Valorant: 0.35','Apex: 1.2','CS2: 0.80'] },
      { format:'int (整数)', description:'1~20或1~100的整数', examples:['COD: 6','Destiny 2: 4','R6S: 12'] },
      { format:'percentage (百分比)', description:'以百分比形式表示', examples:['Battlefield: 12%'] },
      { format:'cm/360° (物理基准)', description:'鼠标移动多少厘米转一整圈', examples:['所有FPS游戏通用'] },
      { format:'eDPI (DPI × 灵敏度)', description:'消除DPI差异的等效灵敏度值', examples:['400 DPI × 0.8 = 320 eDPI','800 DPI × 0.4 = 320 eDPI'] }
    ];
  }
}
window.GameProfiles = GameProfiles;
