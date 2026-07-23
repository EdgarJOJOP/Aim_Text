class MainPanel {
  constructor(app) { this.app = app; this._bindSetupPage(); this._bindReportNav(); this._startSetupNav(); }
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
      try {
      const dpi = this._getDpi(), ctrl = this._getControllerType();
      if (!dpi || dpi < 100 || dpi > 25600) {
        this.showToast('⚠️ 请输入有效的 DPI 值（100~25600）', 'error');
        return;
      }
      const app = this.app;
      app.model.setDpi(dpi);
      app.model.setControllerType(ctrl);
      window.__GAMEPAD_INVERT_X__=document.getElementById('invert-x')?document.getElementById('invert-x').checked:false;window.__GAMEPAD_INVERT_Y__=document.getElementById('invert-y')?document.getElementById('invert-y').checked:false;var hm=document.querySelector('input[name="hand-mode"]:checked');window.__GAMEPAD_LEFT_HANDED__=hm&&hm.value==='left';app.testControls = new TestControls(app);
      app.testControls.init('test-controls-container');
      MainPanel.showPage('page-test');
      } catch(e) { console.error('[MainPanel] btn error:', e); }    });
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
  }  _startSetupNav() {
    var s = this;
    this._navFocusIndex = -1;
    this._navCooldown = 0;
    this._navRAF = null;
    this._navItems = function() {
      var items = [];
      var r1=document.querySelectorAll('input[name="controller-type"]');for(var i=0;i<r1.length;i++){if(r1[i].parentElement)items.push(r1[i].parentElement);}
      var invx=document.getElementById('invert-x');var invy=document.getElementById('invert-y');if(invx&&invx.parentElement)items.push(invx.parentElement);if(invy&&invy.parentElement)items.push(invy.parentElement);
      var r2=document.querySelectorAll('input[name="hand-mode"]');for(var i=0;i<r2.length;i++){if(r2[i].parentElement)items.push(r2[i].parentElement);}
      var b = document.getElementById('btn-start-test');
      if (b) items.push(b);
      return items;
    };
    function poll() {
      s._pollNav();
      s._navRAF = requestAnimationFrame(poll);
    }
    s._navRAF = requestAnimationFrame(poll);
  }
  _pollNav() {
    if (!document.getElementById('page-setup').classList.contains('active')) return;
    if (!window.__GAMEPAD__) return;
    var gp = window.__GAMEPAD__;
    var state = gp.poll();
    if (!state) return;
    var items = this._navItems();
    if (items.length === 0) return;
    var now = performance.now();
    var curEl=this._navFocusIndex>=0?items[this._navFocusIndex]:null;
    var isCb=curEl&&curEl.querySelector('input[type="checkbox"]');
    if(now-this._navCooldown>250){
      if(isCb){var cbs=[];for(var ci=0;ci<items.length;ci++){if(items[ci].querySelector('input[type="checkbox"]'))cbs.push(ci);}var cidx=cbs.indexOf(this._navFocusIndex);
      if((gp.axisJustActive(0,false)||state.axes[0]<-0.5||gp.buttonJustPressed('left'))&&cbs.length){this._navFocusIndex=cbs[Math.max(0,cidx-1)];this._navCooldown=now;this._applyNavFocus(items);}
      if((gp.axisJustActive(0,true)||state.axes[0]>0.5||gp.buttonJustPressed('right'))&&cbs.length){this._navFocusIndex=cbs[Math.min(cbs.length-1,cidx+1)];this._navCooldown=now;this._applyNavFocus(items);}}
      if(gp.axisJustActive(1,false)||state.axes[1]<-0.5||gp.buttonJustPressed('up')){this._navFocusIndex=Math.max(0,this._navFocusIndex-1);this._navCooldown=now;this._applyNavFocus(items);}
      if(gp.axisJustActive(1,true)||state.axes[1]>0.5||gp.buttonJustPressed('down')){this._navFocusIndex=Math.min(items.length-1,this._navFocusIndex+1);this._navCooldown=now;this._applyNavFocus(items);}
    }
    if (gp.buttonJustPressed('a') || gp.buttonJustPressed('start')) {
      if (this._navFocusIndex >= 0 && this._navFocusIndex < items.length) {
        var el = items[this._navFocusIndex];
        if (el.tagName === 'BUTTON') {
          el.click();
        } else {
          var rb = el.querySelector('input[type="radio"]');var cb = el.querySelector('input[type="checkbox"]');if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change',{bubbles:true}));window.__GAMEPAD_INVERT_X__=document.getElementById('invert-x').checked;window.__GAMEPAD_INVERT_Y__=document.getElementById('invert-y').checked;return;}
          if (rb) { rb.checked = true; rb.dispatchEvent(new Event('change', { bubbles: true })); }
        }
      }
    }
  }
  _applyNavFocus(items) {
    for (var i = 0; i < items.length; i++) {
      items[i].style.outline = (i === this._navFocusIndex) ? '2px solid #0969da' : '';
      items[i].style.outlineOffset = (i === this._navFocusIndex) ? '2px' : '';
    }
    if (this._navFocusIndex >= 0 && this._navFocusIndex < items.length) {
      items[this._navFocusIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}
window.MainPanel = MainPanel;
