/* ============================================================
   발표용 PDF 엔진 (공용)
   - 상세 페이지(.prd-page)의 실제 내용을 읽어 16:9 발표 슬라이드로 자동 생성 → PDF 다운로드
   - 제목/내용이 랜딩(상세 페이지)과 자동으로 일치
   - 사용법: 각 상세 페이지에 <script src="pres-pdf.js" defer></script> 한 줄만 추가
   ============================================================ */
(function () {
  "use strict";
  if (window.__presPdfLoaded) return;
  window.__presPdfLoaded = true;

  /* ---------- 0. 스타일 주입 ---------- */
  var CSS = [
    '.pres-pdf-btn{position:fixed;top:132px;right:24px;z-index:90;display:inline-flex;align-items:center;gap:8px;background:#191919;color:#fff;border:none;border-radius:999px;padding:10px 18px;font-family:"Pretendard",system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:.01em;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.2);transition:background .18s,transform .18s,opacity .18s;}',
    '.pres-pdf-btn:hover{background:#000;transform:translateY(-1px);}',
    '.pres-pdf-btn:disabled{opacity:.6;cursor:default;transform:none;}',
    '@media(max-width:760px){.pres-pdf-btn{top:auto;bottom:84px;right:16px;}}',
    '.pres-deck{position:absolute;left:-10000px;top:0;width:1280px;}',
    '.pres-slide{width:1280px;height:720px;background:#fff;color:#191919;font-family:"Pretendard",system-ui,sans-serif;position:relative;overflow:hidden;}',
    '.pres-slide .ps-inner{position:absolute;top:50px;left:76px;right:76px;bottom:60px;overflow:hidden;}',
    '.pres-slide .ps-eyebrow{font-size:16px;font-weight:700;letter-spacing:.06em;color:#767676;text-transform:uppercase;margin-bottom:8px;}',
    '.pres-slide .ps-title{font-size:36px;font-weight:700;letter-spacing:-.02em;line-height:1.12;color:#191919;margin-bottom:14px;}',
    '.pres-slide .ps-subhead{font-size:19px;font-weight:700;color:#545454;margin:-4px 0 12px;}',
    '.pres-slide .ps-meta{font-size:14px;color:#a1a1a1;margin:-12px 0 16px;}',
    '.pres-slide .ps-lede{font-size:18px;line-height:1.55;color:#545454;margin-bottom:10px;font-weight:500;}',
    '.pres-slide .ps-lede b{color:#191919;font-weight:700;}',
    '.pres-slide .ps-foot{position:absolute;left:76px;right:76px;bottom:22px;display:flex;justify-content:space-between;font-size:13px;color:#a1a1a1;border-top:1px solid #ededed;padding-top:8px;}',
    '.pres-slide .ps-stats{display:grid;gap:1px;background:#e3e3e3;border:1px solid #e3e3e3;margin:6px 0 16px;}',
    '.pres-slide .ps-stat{background:#fff;padding:20px 20px;}',
    '.pres-slide .ps-stat .v{font-size:32px;font-weight:700;color:#191919;line-height:1.1;letter-spacing:-.02em;}',
    '.pres-slide .ps-stat .v .unit{font-size:18px;font-weight:600;color:#545454;margin-left:2px;}',
    '.pres-slide .ps-stat .l{font-size:15px;color:#767676;margin-top:10px;line-height:1.4;}',
    '.pres-slide .ps-flow{display:flex;align-items:stretch;gap:0;margin:8px 0 16px;}',
    '.pres-slide .ps-step{flex:1;background:#f7f7f7;border:1px solid #e3e3e3;padding:16px 10px;text-align:center;}',
    '.pres-slide .ps-step .n{font-size:14px;font-weight:700;color:#767676;}',
    '.pres-slide .ps-step .t{font-size:18px;font-weight:700;color:#191919;margin-top:8px;}',
    '.pres-slide .ps-step .d{font-size:12.5px;color:#545454;margin-top:6px;line-height:1.4;}',
    '.pres-slide .ps-arrow{display:flex;align-items:center;padding:0 6px;color:#a1a1a1;font-size:24px;font-weight:700;}',
    '.pres-slide .ps-cards{display:grid;gap:1px;background:#e3e3e3;border:1px solid #e3e3e3;margin:6px 0 16px;}',
    '.pres-slide .ps-card{background:#fff;padding:18px 22px;}',
    '.pres-slide .ps-card .rt{font-size:20px;font-weight:700;color:#191919;}',
    '.pres-slide .ps-card .rs{font-size:14px;color:#767676;font-weight:600;margin:6px 0 12px;text-transform:uppercase;letter-spacing:.03em;}',
    '.pres-slide .ps-card .rd{font-size:15px;color:#545454;line-height:1.55;}',
    '.pres-slide .ps-card .rd b{color:#191919;font-weight:700;}',
    '.pres-slide .ps-note{padding:16px 22px;margin:6px 0 12px;background:rgba(252,246,131,.30);}',
    '.pres-slide .ps-note.note{background:rgba(15,128,246,.08);}',
    '.pres-slide .ps-note.important{background:rgba(235,69,61,.08);}',
    '.pres-slide .ps-note .nl{font-size:13px;font-weight:600;color:#767676;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}',
    '.pres-slide .ps-note p{font-size:17px;line-height:1.55;color:#191919;}',
    '.pres-slide .ps-note p b{color:#191919;font-weight:700;}',
    '.pres-slide .ps-table{width:100%;border-collapse:collapse;margin:6px 0 12px;font-size:15px;border-top:1px solid #191919;border-bottom:1px solid #191919;}',
    '.pres-slide .ps-table thead th{text-align:left;background:#efefef;color:#191919;font-weight:600;text-transform:uppercase;letter-spacing:.03em;font-size:13px;padding:9px 14px;}',
    '.pres-slide .ps-table thead th.num{text-align:right;}',
    '.pres-slide .ps-table tbody td{padding:9px 14px;border-bottom:1px solid #ededed;color:#2e2e2e;line-height:1.4;}',
    '.pres-slide .ps-table tbody td.num{text-align:right;}',
    '.pres-slide .ps-table tbody td.lbl-cell{font-weight:700;color:#191919;white-space:nowrap;}',
    '.pres-slide .ps-table tbody tr:last-child td{border-bottom:none;}',
    '.pres-slide .ps-figwrap{margin:8px 0 14px;}',
    '.pres-slide .ps-fig{background:#f0f0f0;border:1px solid #e3e3e3;display:flex;align-items:center;justify-content:center;overflow:hidden;height:300px;}',
    '.pres-slide .ps-fig.med{height:240px;}',
    '.pres-slide .ps-fig img{max-width:100%;max-height:100%;width:auto;height:auto;display:block;}',
    '.pres-slide .ps-figcap{font-size:14px;color:#767676;margin-top:10px;text-align:center;line-height:1.5;}',
    '.pres-slide .ps-fig.vid{position:relative;background:#000;height:300px;}',
    '.pres-slide .ps-figrow .ps-fig.vid{height:230px;}',
    '.pres-slide .ps-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;padding-left:3px;box-sizing:border-box;}',
    '.pres-slide .ps-figrow{display:grid;gap:18px;margin:8px 0 14px;}',
    '.pres-slide .ps-figrow figure{margin:0;}',
    '.pres-slide .ps-figrow .ps-fig{height:265px;}',
    '.pres-slide .ps-problems{display:grid;gap:1px;background:#e3e3e3;border:1px solid #e3e3e3;margin:6px 0 16px;}',
    '.pres-slide .ps-prob{background:#fff;padding:16px 18px;}',
    '.pres-slide .ps-prob .pn{font-size:14px;font-weight:700;color:#767676;}',
    '.pres-slide .ps-prob .pt{font-size:18px;font-weight:700;color:#191919;margin-top:6px;line-height:1.25;}',
    '.pres-slide .ps-prob .pd{font-size:14px;color:#545454;line-height:1.5;margin-top:8px;}',
    '.pres-slide .ps-links{margin:8px 0 14px;border-top:1px solid #191919;border-bottom:1px solid #191919;}',
    '.pres-slide .ps-links .row{display:flex;gap:22px;align-items:center;padding:14px 16px;border-bottom:1px solid #ededed;}',
    '.pres-slide .ps-links .row:last-child{border-bottom:none;}',
    '.pres-slide .ps-links .k{width:120px;font-weight:700;color:#191919;font-size:15px;text-transform:uppercase;letter-spacing:.02em;}',
    '.pres-slide .ps-links .t{flex:1;font-weight:600;font-size:18px;color:#191919;}',
    '.pres-slide .ps-links .u{color:#767676;font-size:15px;}',
    '.pres-slide.cover{background:#1e1e1e;color:#fff;}',
    '.pres-slide.cover .ps-inner{display:flex;flex-direction:column;justify-content:center;}',
    '.pres-slide.cover .cv-badge{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.10);color:#fff;font-size:14px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:11px 20px;border-radius:999px;margin-bottom:26px;}',
    '.pres-slide.cover .cv-badge::before{content:"";width:7px;height:7px;border-radius:50%;background:#fff;}',
    '.pres-slide.cover .cv-title{font-size:80px;font-weight:700;letter-spacing:-.03em;line-height:1.04;color:#fff;}',
    '.pres-slide.cover .cv-sub{font-size:26px;font-weight:500;color:rgba(255,255,255,.7);margin-top:14px;}',
    '.pres-slide.cover .cv-sum{font-size:22px;color:rgba(255,255,255,.72);line-height:1.6;margin-top:22px;max-width:980px;}',
    '.pres-slide.cover .cv-meta{display:flex;gap:46px;margin-top:46px;}',
    '.pres-slide.cover .cv-meta .ml{font-size:13px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em;}',
    '.pres-slide.cover .cv-meta .mv{font-size:20px;font-weight:600;margin-top:7px;color:rgba(255,255,255,.92);}',
    '.pres-slide.cover .ps-foot{color:#777;border-top-color:#3a3a3a;}',
    '.pres-slide.divider{background:#1e1e1e;color:#fff;}',
    '.pres-slide.divider .ps-inner{display:flex;flex-direction:column;justify-content:center;}',
    '.pres-slide.divider .dv-eyebrow{font-size:18px;font-weight:700;letter-spacing:.18em;color:#a5b4fc00;color:rgba(255,255,255,.6);text-transform:uppercase;margin-bottom:18px;}',
    '.pres-slide.divider .dv-title{font-size:64px;font-weight:700;letter-spacing:-.03em;color:#fff;}',
    '.pres-slide.divider .dv-meta{font-size:20px;color:rgba(255,255,255,.6);margin-top:18px;}',
    '.pres-slide.divider .ps-foot{color:#777;border-top-color:#3a3a3a;}'
  ].join('\n');

  function injectStyle() {
    if (document.getElementById('pres-pdf-style')) return;
    var st = document.createElement('style');
    st.id = 'pres-pdf-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- 1. 의존성 로드 (jsPDF / html2canvas) ---------- */
  function depsReady() {
    var C = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    return typeof window.html2canvas === 'function' && typeof C === 'function';
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = src; sc.onload = res; sc.onerror = function () { rej(new Error('load fail ' + src)); };
      document.head.appendChild(sc);
    });
  }
  async function loadDeps() {
    if (depsReady()) return;
    if (typeof window.html2canvas !== 'function')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    var C = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (typeof C !== 'function')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    var t = 0;
    while (!depsReady() && t < 8000) { await new Promise(function (r) { setTimeout(r, 100); }); t += 100; }
    if (!depsReady()) throw new Error('jsPDF/html2canvas 로드 실패');
  }

  /* ---------- 2. DOM 헬퍼 ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function txt(node) { return node ? node.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function authorName() {
    var f = document.querySelector('.prd-footer-sub');
    if (f) { var m = f.textContent.trim().split('·')[0].trim(); if (m) return m; }
    return '윤혜련';
  }

  /* ---------- 3. 슬라이드 빌더 (페이지네이션) ---------- */
  function Builder(deck, projectName) {
    this.deck = deck;
    this.project = projectName;
    this.cur = null;     // current ps-inner
    this.eyebrow = '';
    this.title = '';
    this.subhead = '';
  }
  Builder.prototype.newSlide = function (cont) {
    var slide = el('div', 'pres-slide');
    var inner = el('div', 'ps-inner');
    slide.appendChild(inner);
    if (this.eyebrow !== '' || this.title !== '') {
      inner.appendChild(el('div', 'ps-eyebrow', this.escape(this.eyebrow)));
      inner.appendChild(el('div', 'ps-title', this.escape(this.title) + (cont ? ' <span style="color:#a1a1a1;font-weight:500;font-size:.5em;">(계속)</span>' : '')));
    }
    if (this.subhead) inner.appendChild(el('div', 'ps-subhead', this.escape(this.subhead)));
    var foot = el('div', 'ps-foot');
    foot.appendChild(el('span', null, this.escape(this.project)));
    foot.appendChild(el('span', 'ps-num', ''));
    slide.appendChild(foot);
    this.deck.appendChild(slide);
    this.cur = inner;
    return inner;
  };
  Builder.prototype.escape = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  Builder.prototype.startSection = function (eyebrow, title) {
    this.eyebrow = eyebrow || ''; this.title = title || ''; this.subhead = '';
    this.newSlide(false);
  };
  Builder.prototype.setSubhead = function (sh) {
    this.subhead = sh || '';
    // subhead starts a fresh slide region only if current slide already has body content
    if (this.cur && this.cur.querySelectorAll(':scope > *:not(.ps-eyebrow):not(.ps-title):not(.ps-subhead)').length > 0) {
      this.newSlide(false);
    } else if (this.cur) {
      // append subhead to current (empty) slide
      var ex = this.cur.querySelector('.ps-subhead');
      if (ex) ex.textContent = sh; else this.cur.appendChild(el('div', 'ps-subhead', this.escape(sh)));
    }
  };
  Builder.prototype.overflow = function () { return this.cur.scrollHeight > this.cur.clientHeight + 2; };
  Builder.prototype.place = function (node) {
    this.cur.appendChild(node);
    if (this.overflow()) {
      this.cur.removeChild(node);
      // if current already has body content, new slide; else keep (single oversized block)
      var hasBody = this.cur.querySelectorAll(':scope > *:not(.ps-eyebrow):not(.ps-title):not(.ps-subhead)').length > 0;
      if (hasBody) this.newSlide(true);
      this.cur.appendChild(node);
    }
  };
  Builder.prototype.placeGroup = function (groupClass, gridCols, items, render) {
    var g = el('div', groupClass);
    if (gridCols) g.style.gridTemplateColumns = 'repeat(' + gridCols + ',1fr)';
    this.cur.appendChild(g);
    for (var i = 0; i < items.length; i++) {
      var it = render(items[i], i);
      if (!it) continue;
      g.appendChild(it);
      if (this.overflow()) {
        g.removeChild(it);
        if (g.children.length === 0) { this.cur.removeChild(g); }
        this.newSlide(true);
        g = el('div', groupClass);
        if (gridCols) g.style.gridTemplateColumns = 'repeat(' + gridCols + ',1fr)';
        this.cur.appendChild(g);
        g.appendChild(it);
      }
    }
    if (g.children.length === 0 && g.parentNode) g.parentNode.removeChild(g);
  };

  /* ---------- 4. 컴포넌트 매퍼 ---------- */
  function arr(nl) { return Array.prototype.slice.call(nl); }

  function mapLede(p) { return el('div', 'ps-lede', p.innerHTML); }

  function mapKpiRow(b, row) {
    var kpis = arr(row.querySelectorAll('.prd-kpi'));
    var cols = Math.min(kpis.length, 4) || 1;
    b.placeGroup('ps-stats', cols, kpis, function (k) {
      var v = k.querySelector('.prd-kpi-value'), l = k.querySelector('.prd-kpi-label');
      var c = el('div', 'ps-stat');
      c.appendChild(el('div', 'v', v ? v.innerHTML : ''));
      c.appendChild(el('div', 'l', l ? l.innerHTML : ''));
      return c;
    });
  }

  function mapCallout(b, c) {
    var cls = 'ps-note';
    if (c.classList.contains('note')) cls += ' note';
    else if (c.classList.contains('important')) cls += ' important';
    var lbl = c.querySelector('.lbl');
    var node = el('div', cls);
    if (lbl) node.appendChild(el('div', 'nl', lbl.innerHTML));
    arr(c.querySelectorAll('p')).forEach(function (p) { node.appendChild(el('p', null, p.innerHTML)); });
    b.place(node);
  }

  function mapTable(b, wrap) {
    var t = wrap.querySelector('table');
    if (!t) return;
    var clone = t.cloneNode(true);
    clone.className = 'ps-table';
    b.place(clone);
  }

  function mapInsights(b, list) {
    var rows = arr(list.querySelectorAll('.prd-insight-row'));
    b.placeGroup('ps-cards', 1, rows, function (r) {
      var title = r.querySelector('.prd-insight-title');
      var ps = arr(r.querySelectorAll('p'));
      var card = el('div', 'ps-card');
      if (title) card.appendChild(el('div', 'rt', title.innerHTML));
      var body = ps.map(function (p) { return p.innerHTML; }).join('<br><br>');
      if (body) card.appendChild(el('div', 'rd', body));
      return card;
    });
  }

  function mapProblems(b, grid) {
    var cards = arr(grid.querySelectorAll('.prd-problem-card'));
    var cols = Math.min(cards.length, 3) || 1;
    b.placeGroup('ps-problems', cols, cards, function (c) {
      var n = c.querySelector('.pc-num'), h = c.querySelector('h3'), p = c.querySelector('p');
      var node = el('div', 'ps-prob');
      if (n) node.appendChild(el('div', 'pn', n.innerHTML));
      if (h) node.appendChild(el('div', 'pt', h.innerHTML));
      if (p) node.appendChild(el('div', 'pd', p.innerHTML));
      return node;
    });
  }

  function figImg(figure) {
    // returns an <img> element (from <img src> or <canvas>) or null
    var canvas = figure.querySelector('canvas');
    if (canvas) {
      try { var im = el('img'); im.src = canvas.toDataURL('image/png'); return im; } catch (e) { return null; }
    }
    var img = figure.querySelector('img');
    if (img && img.getAttribute('src')) { var i2 = el('img'); i2.src = img.currentSrc || img.src; return i2; }
    return null;
  }

  function mapFigure(b, figure) {
    if (figure.querySelector('.img-frame.empty')) return; // 빈 placeholder 제외
    var im = figImg(figure);
    if (!im) return;
    var cap = figure.querySelector('figcaption');
    var wrap = el('div', 'ps-figwrap');
    var fr = el('div', 'ps-fig'); fr.appendChild(im); wrap.appendChild(fr);
    if (cap) wrap.appendChild(el('div', 'ps-figcap', cap.innerHTML));
    b.place(wrap);
  }

  function mapGallery(b, gal) {
    var figs = arr(gal.querySelectorAll('figure')).filter(function (f) { return !f.querySelector('.img-frame.empty') && figImg(f); });
    if (!figs.length) return;
    var cols = Math.min(figs.length, 3) || 1;
    b.placeGroup('ps-figrow', cols, figs, function (f) {
      var fig = el('figure');
      var fr = el('div', 'ps-fig'); fr.appendChild(figImg(f)); fig.appendChild(fr);
      var cap = f.querySelector('figcaption');
      if (cap) fig.appendChild(el('div', 'ps-figcap', cap.innerHTML));
      return fig;
    });
  }

  function mapFlow(b, flow) {
    var steps = arr(flow.querySelectorAll('.prd-flow-step'));
    var node = el('div', 'ps-flow');
    steps.forEach(function (s, idx) {
      if (idx > 0) node.appendChild(el('div', 'ps-arrow', '→'));
      var n = s.querySelector('.prd-flow-num'), nm = s.querySelector('.prd-flow-name'), d = s.querySelector('.prd-flow-desc');
      var st = el('div', 'ps-step');
      if (n) st.appendChild(el('div', 'n', n.innerHTML));
      if (nm) st.appendChild(el('div', 't', nm.innerHTML));
      if (d) st.appendChild(el('div', 'd', d.innerHTML));
      node.appendChild(st);
    });
    b.place(node);
  }

  function mapToolStack(b, ts) {
    var cards = arr(ts.querySelectorAll('.prd-tool-card'));
    var cols = Math.min(cards.length, 3) || 1;
    b.placeGroup('ps-cards', cols, cards, function (c) {
      var name = c.querySelector('.tool-name'), role = c.querySelector('.tool-role'), p = c.querySelector('p');
      var card = el('div', 'ps-card');
      if (name) card.appendChild(el('div', 'rt', name.innerHTML));
      if (role) card.appendChild(el('div', 'rs', role.innerHTML));
      if (p) card.appendChild(el('div', 'rd', p.innerHTML));
      return card;
    });
  }

  function mapCharts(b, container) {
    var charts = container.classList.contains('prd-chart') ? [container] : arr(container.querySelectorAll('.prd-chart'));
    charts.forEach(function (ch) {
      var canvas = ch.querySelector('canvas');
      var capEl = ch.querySelector('.chart-caption');
      if (!canvas) return;
      var im;
      try { im = el('img'); im.src = canvas.toDataURL('image/png'); } catch (e) { return; }
      var wrap = el('div', 'ps-figwrap');
      var fr = el('div', 'ps-fig med'); fr.appendChild(im); wrap.appendChild(fr);
      if (capEl) wrap.appendChild(el('div', 'ps-figcap', capEl.innerHTML));
      b.place(wrap);
    });
  }

  function mapOneCanvas(b, canvas, capText) {
    var im; try { im = el('img'); im.src = canvas.toDataURL('image/png'); } catch (e) { return; }
    var wrap = el('div', 'ps-figwrap');
    var fr = el('div', 'ps-fig med'); fr.appendChild(im); wrap.appendChild(fr);
    if (capText) wrap.appendChild(el('div', 'ps-figcap', capText));
    b.place(wrap);
  }
  function mapUtPies(b, node) {
    var items = arr(node.querySelectorAll('.ut-pie-item'));
    var figs = items.filter(function (it) { return it.querySelector('canvas'); });
    var cols = Math.min(figs.length, 3) || 1;
    b.placeGroup('ps-figrow', cols, figs, function (it) {
      var cv = it.querySelector('canvas'); var cap = it.querySelector('.ut-pie-cap');
      var im; try { im = el('img'); im.src = cv.toDataURL('image/png'); } catch (e) { return null; }
      var fig = el('figure'); var fr = el('div', 'ps-fig'); fr.appendChild(im); fig.appendChild(fr);
      if (cap) fig.appendChild(el('div', 'ps-figcap', cap.innerHTML));
      return fig;
    });
  }
  function mapVideos(b, container) {
    var ifr = arr(container.querySelectorAll('iframe'));
    if (!ifr.length) return;
    var yt = [], other = [];
    ifr.forEach(function (f) {
      var fig = f.closest('figure');
      var cap = fig ? fig.querySelector('figcaption') : null;
      var src = f.getAttribute('src') || '';
      var title = cap ? cap.textContent.split('—')[0].trim() : '영상';
      var m = src.match(/youtube\.com\/embed\/([\w-]+)/);
      if (m) { yt.push({ id: m[1], url: 'youtu.be/' + m[1], title: title }); return; }
      var vm = src.match(/player\.vimeo\.com\/video\/(\d+)/);
      var url = vm ? 'vimeo.com/' + vm[1] : src.replace(/^https?:\/\//, '').split('?')[0];
      other.push({ url: url, title: title });
    });
    if (yt.length) {
      var cols = Math.min(yt.length, 2) || 1;
      b.placeGroup('ps-figrow', cols, yt, function (v) {
        var fig = el('figure');
        var fr = el('div', 'ps-fig vid');
        var im = el('img'); im.crossOrigin = 'anonymous';
        im.src = 'https://img.youtube.com/vi/' + v.id + '/maxresdefault.jpg';
        im.setAttribute('data-fb', 'https://img.youtube.com/vi/' + v.id + '/hqdefault.jpg');
        im.addEventListener('error', function () { var fb = this.getAttribute('data-fb'); if (fb && this.src !== fb) this.src = fb; });
        fr.appendChild(im);
        fr.appendChild(el('div', 'ps-play', '\u25B6'));
        fig.appendChild(fr);
        var capEl = el('div', 'ps-figcap');
        var t1 = el('div'); t1.style.cssText = 'color:#191919;font-weight:700;'; t1.textContent = v.title;
        var t2 = el('div'); t2.style.cssText = 'margin-top:4px;'; t2.textContent = '\u25B6 ' + v.url;
        capEl.appendChild(t1); capEl.appendChild(t2);
        fig.appendChild(capEl);
        return fig;
      });
    }
    if (other.length) {
      var box = el('div', 'ps-links');
      other.forEach(function (v) {
        var row = el('div', 'row');
        row.appendChild(el('div', 'k', '영상'));
        var t = el('div', 't'); t.textContent = v.title; row.appendChild(t);
        var u = el('div', 'u'); u.textContent = v.url; row.appendChild(u);
        box.appendChild(row);
      });
      b.place(box);
    }
  }

  // 일반 블록 내부 순회
  function processBlock(b, block) {
    var head = block.querySelector(':scope > .prd-block-head');
    if (head) {
      var h3 = head.querySelector('h3');
      if (h3) b.setSubhead(txt(h3));
      var meta = head.querySelector('.meta');
      if (meta && b.cur) b.cur.appendChild(el('div', 'ps-meta', meta.innerHTML));
    }
    arr(block.children).forEach(function (c) {
      if (c.matches('.prd-block-head')) return;
      dispatch(b, c);
    });
  }

  function dispatch(b, node) {
    try {
      if (node.matches('.prd-lede')) return b.place(mapLede(node));
      if (node.matches('.prd-kpi-row')) return mapKpiRow(b, node);
      if (node.matches('.prd-callout')) return mapCallout(b, node);
      if (node.matches('.prd-table-wrap')) return mapTable(b, node);
      if (node.matches('.prd-insight-list')) return mapInsights(b, node);
      if (node.matches('.prd-problem-grid')) return mapProblems(b, node);
      if (node.matches('.prd-gallery')) return mapGallery(b, node);
      if (node.matches('.prd-flow')) return mapFlow(b, node);
      if (node.matches('.prd-tool-stack')) return mapToolStack(b, node);
      if (node.matches('.prd-chart-grid') || node.matches('.prd-chart')) return mapCharts(b, node);
      if (node.matches('.ut-pies')) return mapUtPies(b, node);
      if (node.matches('canvas')) return mapOneCanvas(b, node, null);
      if (node.matches('.prd-video-grid') || node.matches('.prd-video')) return mapVideos(b, node);
      if (node.matches('figure')) {
        if (node.querySelector('iframe')) return mapVideos(b, node);
        return mapFigure(b, node);
      }
      if (node.matches('.prd-block')) return processBlock(b, node);
      // 컨테이너면 내부 탐색
      if (node.querySelector && node.querySelector('.prd-lede,.prd-table-wrap,.prd-callout,.prd-kpi-row,.prd-insight-list,.prd-problem-grid,.prd-gallery,figure,.prd-flow,.prd-tool-stack,.prd-chart,.prd-video,iframe,canvas')) {
        arr(node.children).forEach(function (c) { dispatch(b, c); });
      }
    } catch (e) { console.warn('pres-pdf dispatch skip', node, e); }
  }

  /* ---------- 5. 덱 생성 ---------- */
  function buildDeck() {
    var page = document.querySelector('.prd-page');
    var coverTitle = txt(document.querySelector('.prd-cover-title')) || document.title;
    var deck = el('div', 'pres-deck'); deck.id = 'presDeck';
    document.body.appendChild(deck); // 측정(페이지네이션)을 위해 DOM에 부착(offscreen)
    var b = new Builder(deck, coverTitle);

    // COVER
    var cover = el('div', 'pres-slide cover');
    var ci = el('div', 'ps-inner');
    var badge = document.querySelector('.prd-cover-badge');
    if (badge) ci.appendChild(el('div', 'cv-badge', b.escape(txt(badge))));
    ci.appendChild(el('div', 'cv-title', b.escape(coverTitle)));
    var sub = document.querySelector('.prd-cover-subtitle');
    if (sub && txt(sub)) ci.appendChild(el('div', 'cv-sub', sub.innerHTML));
    var sum = document.querySelector('.prd-cover-summary');
    if (sum && txt(sum)) ci.appendChild(el('div', 'cv-sum', sum.innerHTML));
    var metaItems = arr(document.querySelectorAll('.prd-cover-meta-item'));
    if (metaItems.length) {
      var mw = el('div', 'cv-meta');
      metaItems.forEach(function (mi) {
        var l = mi.querySelector('.prd-cover-meta-label'), v = mi.querySelector('.prd-cover-meta-value');
        var m = el('div'); m.appendChild(el('div', 'ml', l ? l.innerHTML : '')); m.appendChild(el('div', 'mv', v ? v.innerHTML : ''));
        mw.appendChild(m);
      });
      ci.appendChild(mw);
    }
    cover.appendChild(ci);
    var cfoot = el('div', 'ps-foot');
    cfoot.appendChild(el('span', null, b.escape(coverTitle)));
    cfoot.appendChild(el('span', 'ps-num', b.escape(authorName())));
    cover.appendChild(cfoot);
    deck.appendChild(cover);

    // SECTIONS & DIVIDERS (문서 순서대로)
    var nodes = arr(page.querySelectorAll('.prd-section, .prd-part-divider'));
    nodes.forEach(function (sec) {
      if (sec.classList.contains('prd-part-divider')) {
        var ey = txt(sec.querySelector('.prd-part-eyebrow'));
        var h1 = txt(sec.querySelector('h1'));
        var pm = txt(sec.querySelector('.prd-part-meta'));
        var d = el('div', 'pres-slide divider');
        var di = el('div', 'ps-inner');
        if (ey) di.appendChild(el('div', 'dv-eyebrow', b.escape(ey)));
        di.appendChild(el('div', 'dv-title', b.escape(h1)));
        if (pm) di.appendChild(el('div', 'dv-meta', b.escape(pm)));
        d.appendChild(di);
        var df = el('div', 'ps-foot'); df.appendChild(el('span', null, b.escape(coverTitle))); df.appendChild(el('span', 'ps-num', '')); d.appendChild(df);
        deck.appendChild(d);
        return;
      }
      var inner = sec.querySelector('.prd-section-inner') || sec;
      var h2 = sec.querySelector('.prd-section-head h2');
      var numEl = h2 ? h2.querySelector('.num-prefix') : null;
      var num = numEl ? txt(numEl) : '';
      var title = h2 ? txt(h2).replace(num, '').trim() : '';
      b.startSection(num, title);
      // section-head ledes
      var head = inner.querySelector(':scope > .prd-section-head');
      if (head) arr(head.querySelectorAll(':scope > .prd-lede')).forEach(function (p) { b.place(mapLede(p)); });
      // remaining children
      arr(inner.children).forEach(function (c) {
        if (c.matches('.prd-section-tag') || c.matches('.prd-section-head')) return;
        dispatch(b, c);
      });
    });

    // 페이지 번호 매기기 (커버=작성자, 이후 02..)
    var n = 1;
    arr(deck.querySelectorAll('.pres-slide')).forEach(function (sl, i) {
      var numSpan = sl.querySelector('.ps-foot .ps-num');
      if (i === 0) return; // cover keeps author
      n++;
      if (numSpan) numSpan.textContent = ('0' + n).slice(-2);
    });
    return deck;
  }

  /* ---------- 6. PDF 생성 ---------- */
  async function generate(btn) {
    var label = btn.querySelector('.pres-pdf-label');
    var orig = label ? label.textContent : '';
    btn.disabled = true; if (label) label.textContent = '생성 중…';
    var deck = null;
    try {
      await loadDeps();
      deck = buildDeck(); // 이미 body에 부착됨(offscreen)
      // 이미지 로딩 대기
      var imgs = arr(deck.querySelectorAll('img'));
      await Promise.all(imgs.map(function (im) {
        return new Promise(function (res) {
          var t = 0;
          (function chk() {
            if (im.complete && im.naturalWidth > 0) return res();
            t += 100; if (t > 9000) return res();
            setTimeout(chk, 100);
          })();
        });
      }));
      await new Promise(function (r) { setTimeout(r, 200); });

      var jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      var slides = arr(deck.querySelectorAll('.pres-slide'));
      var pdf = null;
      for (var i = 0; i < slides.length; i++) {
        var canvas = await window.html2canvas(slides[i], {
          scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
          width: 1280, height: 720, windowWidth: 1280, windowHeight: 720, scrollX: 0, scrollY: 0
        });
        var img = canvas.toDataURL('image/jpeg', 0.92);
        if (!pdf) pdf = new jsPDFCtor({ unit: 'mm', format: [297, 167], orientation: 'landscape', compress: true });
        else pdf.addPage([297, 167], 'landscape');
        var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
        pdf.addImage(img, 'JPEG', 0, 0, pw, ph, '', 'FAST');
      }
      var name = (txt(document.querySelector('.prd-cover-title')) || 'portfolio').replace(/\s+/g, '-');
      pdf.save(name + '-발표용-' + new Date().toISOString().slice(0, 10) + '.pdf');
    } catch (e) {
      console.error('발표용 PDF error:', e);
      alert('발표용 PDF 생성 중 오류가 발생했습니다.\n' + ((e && e.message) ? e.message : String(e)));
    } finally {
      if (deck && deck.parentNode) deck.parentNode.removeChild(deck);
      if (label) label.textContent = orig;
      btn.disabled = false;
    }
  }

  /* 디버그용 노출 (덱만 생성, PDF 미저장) */
  window.presPdfBuildDeck = buildDeck;

  /* ---------- 7. 초기화 ---------- */
  function init() {
    if (!document.querySelector('.prd-page')) return; // 상세 페이지에서만
    injectStyle();
    if (document.getElementById('presPdfBtn')) return;
    var btn = el('button', 'pres-pdf-btn');
    btn.id = 'presPdfBtn'; btn.type = 'button';
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="12" height="8" rx="1"></rect><path d="M6 13.5h4M8 11v2.5"></path></svg><span class="pres-pdf-label">발표용 PDF</span>';
    btn.addEventListener('click', function () { generate(btn); });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
