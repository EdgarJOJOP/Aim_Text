class MainPanel {
  constructor(app) { this.app = app; this._bindSetupPage(); this._bindReportNav(); }

  static showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _bindSetupPage() {
    const btn = document.getElementById('btn-start-test');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const dpi = this._getDpi(), ctrl = this._getControllerType();
      if (!dpi || dpi < 100 || dpi > 25600) {
        this.showToast('⚠️ 请输入有效的 DPI 值（100~25600）', 'error');
        return;
      }
      const app = this.app;
      app.model.setDpi(dpi);
      app.model.setControllerType(ctrl);

      // 初始化测试控制界面
      app.testControls = new TestControls(app);
      app.testControls.init('test-controls-container');

      // 跳转到测试页
      MainPanel.showPage('page-test');
    });
  }

  _getDpi() { const i = document.getElementById('dpi-input'); return i ? parseInt(i.value) : 400; }
  _getControllerType() { const s = document.querySelector('input[name="controller-type"]:checked'); return s ? s.value : 'none'; }

  _bindReportNav() {
    const btn = document.getElementById('btn-back-setup');
    if (btn) btn.addEventListener('click', () => MainPanel.showPage('page-setup'));
  }

  showToast(msg, type = 'info', dur = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.className = 'toast ' + type; t.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('hidden'), dur);
  }
}
window.MainPanel = MainPanel;
