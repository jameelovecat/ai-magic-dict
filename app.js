// AI魔法词典 — 应用逻辑

const State = {
  view: 'home',
  moduleId: null,
  conceptId: null,
  quizState: null,
  searchQuery: ''
};

const $ = id => document.getElementById(id);
const mod = id => MODULES.find(m => m.id === id);

function findConceptGlobal(cid) {
  for (const m of MODULES) {
    const c = m.concepts.find(c => c.id === cid);
    if (c) return { module: m, concept: c };
  }
  return null;
}

function allConcepts() {
  return MODULES.flatMap(m => m.concepts.map(c => ({ ...c, module: m })));
}

function moduleProgress(m) {
  if (!m.concepts.length) return { learned: 0, total: 0, pct: 0 };
  const learned = m.concepts.filter(c => Progress.isLearned(c.id)).length;
  return { learned, total: m.concepts.length, pct: Math.round(learned / m.concepts.length * 100) };
}

function navigate(view, params = {}) {
  Object.assign(State, { view, ...params });
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 粒子效果 ──
function triggerSparkle(x, y) {
  const container = document.createElement('div');
  container.className = 'sparkle-container';
  document.body.appendChild(container);
  const colors = ['#B8860B', '#C9A84C', '#8B6914', '#D4AA6A', '#fff'];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = 4 + Math.random() * 5;
    const angle = (Math.PI * 2 / 18) * i + Math.random() * 0.4;
    const dist = 50 + Math.random() * 70;
    s.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;animation-delay:${Math.random()*0.15}s`;
    container.appendChild(s);
  }
  setTimeout(() => container.remove(), 1100);
}

// ── 导航栏更新 ──
function updateNavbar() {
  const total = Progress.totalConcepts();
  const learned = Progress.totalLearned();
  const pct = total ? Math.round(learned / total * 100) : 0;
  document.querySelector('.nav-progress-fill').style.width = pct + '%';
  document.querySelector('.nav-progress span').textContent = `${learned}/${total} ${getLang() === 'zh-TW' ? '咒語' : '咒语'}`;
  document.querySelector('.lang-toggle').textContent = t('nav_toggle');
  document.querySelector('.nav-search').placeholder = t('nav_search');
  document.querySelector('.nav-logo').textContent = t('site_name');
}

// ── Toast 提示 ──
function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-show'));
  setTimeout(() => { el.classList.remove('toast-show'); setTimeout(() => el.remove(), 300); }, 1800);
}

// ── 渲染主函数 ──
function render() {
  const app = $('app');
  updateNavbar();
  try {
    switch (State.view) {
      case 'home':    app.innerHTML = renderHome(); break;
      case 'module':  app.innerHTML = renderModule(); break;
      case 'concept': app.innerHTML = renderConcept(); break;
      case 'quiz':    app.innerHTML = renderQuiz(); break;
      case 'search':  app.innerHTML = renderSearch(); break;
    }
  } catch(e) {
    app.innerHTML = `<div style="padding:60px 32px;text-align:center;color:var(--text2)">加载出错，请刷新页面<br><small style="color:var(--text3)">${e.message}</small></div>`;
    return;
  }
  app.classList.remove('page-enter');
  void app.offsetWidth;
  app.classList.add('page-enter');
  attachEvents();
}

// ── 首页 ──
function renderHome() {
  const total = Progress.totalConcepts();
  const learned = Progress.totalLearned();
  const unlockedCount = MODULES.filter(m => m.unlocked).length;

  const moduleCards = MODULES.map(m => {
    const prog = moduleProgress(m);
    const isLocked = !m.unlocked;
    const name = mName(m);
    const subtitle = mSubtitle(m);
    const desc = mDesc(m);

    const progressRing = m.unlocked && m.concepts.length > 0
      ? `<svg class="module-progress-ring" viewBox="0 0 36 36">
          <circle class="ring-bg" cx="18" cy="18" r="14" stroke-width="2.5"/>
          <circle class="ring-fill" cx="18" cy="18" r="14" stroke-width="2.5"
            stroke="${m.color}"
            stroke-dasharray="${2*Math.PI*14}"
            stroke-dashoffset="${2*Math.PI*14*(1-prog.pct/100)}"
            transform="rotate(-90 18 18)"/>
        </svg>`
      : `<span class="module-lock-icon">🔒</span>`;

    const footer = m.unlocked && m.concepts.length > 0
      ? `<span class="module-count">${prog.total} ${t('card_concepts')}</span>
         <span class="module-progress-text" style="color:${m.color}">${prog.learned}/${prog.total} ${t('stat_learned')}</span>`
      : `<span class="module-count">${t('coming_soon')}</span>
         <span class="coming-soon-tag">COMING SOON</span>`;

    return `
      <div class="module-card ${isLocked ? 'locked' : ''}"
           style="--module-color:${m.color}"
           data-module-id="${m.id}"
           role="button" tabindex="${isLocked ? -1 : 0}">
        <div class="module-card-header">
          <span class="module-icon">${m.icon}</span>
          <div>${progressRing}</div>
        </div>
        <div class="module-subtitle">${subtitle}</div>
        <div class="module-name">${name}</div>
        <div class="module-desc">${desc}</div>
        <div class="module-footer">${footer}</div>
      </div>`;
  }).join('');

  return `
    <div class="home-hero">
      <div class="hero-eyebrow">${t('eyebrow')}</div>
      <h1 class="home-hero-title">${t('site_name')}</h1>
      <p class="home-hero-sub">${t('tagline')}</p>
      <div class="home-stats">
        <div class="stat-item"><span class="stat-value">${learned}</span><span class="stat-label">${t('stat_learned')}</span></div>
        <div class="stat-item"><span class="stat-value">${total}</span><span class="stat-label">${t('stat_total')}</span></div>
        <div class="stat-item"><span class="stat-value">${unlockedCount}</span><span class="stat-label">${t('stat_open')}</span></div>
      </div>
      <div class="divider"><div class="divider-line"></div><span class="divider-gem">✦</span><div class="divider-line"></div></div>
    </div>
    <div class="modules-section">
      <div class="section-title">${t('sec_modules')}</div>
      <div class="modules-grid">${moduleCards}</div>
    </div>`;
}

// ── 模块页 ──
function renderModule() {
  const m = mod(State.moduleId);
  if (!m) return '';
  const prog = moduleProgress(m);
  const name = mName(m);
  const subtitle = mSubtitle(m);
  const desc = mDesc(m);

  const conceptRows = m.concepts.map(c => {
    const learned = Progress.isLearned(c.id);
    const displayName = (getLang() === 'zh-TW' && c.nameTW) ? c.nameTW : c.name;
    const displayTagline = cTagline(c);
    const displayZh = cZh(c);
    return `
      <div class="concept-row ${learned ? 'learned' : ''}"
           style="--module-color:${m.color}"
           data-concept-id="${c.id}" data-module-id="${m.id}">
        <div class="concept-status">${learned ? '✓' : ''}</div>
        <div class="concept-row-info">
          <div class="concept-row-name">${displayName}${displayZh ? `<span style="font-family:Inter;font-size:11px;color:var(--text3);font-weight:400;margin-left:8px">${displayZh}</span>` : ''}</div>
          <div class="concept-row-tagline">${displayTagline}</div>
        </div>
        <span class="concept-row-arrow">›</span>
      </div>`;
  }).join('');

  const allLearned = prog.pct === 100;
  return `
    <div class="module-page">
      <div class="breadcrumb">
        <span class="breadcrumb-link" data-nav="home">${t('home')}</span>
        <span class="breadcrumb-sep">›</span>
        <span>${name}</span>
      </div>
      <div class="module-page-header" style="--module-color:${m.color}">
        <div class="module-page-icon">${m.icon}</div>
        <div class="module-page-subtitle">${subtitle}</div>
        <h2 class="module-page-title">${name}</h2>
        <p class="module-page-desc">${desc}</p>
        <div class="module-page-progress">
          <div class="progress-bar-wide">
            <div class="progress-bar-fill" style="width:${prog.pct}%;background:${m.color}"></div>
          </div>
          <span class="progress-label">${prog.learned} / ${prog.total} ${t('stat_learned')}</span>
        </div>
      </div>
      <div class="concepts-list">${conceptRows}</div>
      ${m.concepts.length > 0 ? `
        <button class="quiz-start-btn" data-action="start-quiz" data-module-id="${m.id}">
          ${allLearned ? t('quiz_btn_retry') : t('quiz_btn')}
        </button>` : ''}
    </div>`;
}

// ── 概念页 ──
function renderConcept() {
  const found = findConceptGlobal(State.conceptId);
  if (!found) return '';
  const { module: m, concept: c } = found;
  const learned = Progress.isLearned(c.id);
  const displayName = (getLang() === 'zh-TW' && c.nameTW) ? c.nameTW : c.name;
  const displayZh = cZh(c);
  const displayTagline = cTagline(c);
  const displaySubtitle = mSubtitle(m);

  const challengeHtml = c.challenge ? `
    <div class="challenge-box">
      <div class="challenge-label">${t('challenge_label')}</div>
      <p class="challenge-question">${c.challenge.question}</p>
      <div class="challenge-options">
        ${c.challenge.options.map((opt, i) =>
          `<button class="challenge-option" data-challenge-idx="${i}" data-correct="${c.challenge.correct}">${opt}</button>`
        ).join('')}
      </div>
      <div class="challenge-reveal" id="challenge-reveal">
        <strong style="color:var(--gold2)">${t('challenge_reveal')}</strong><br>
        ${c.challenge.reveal}
      </div>
    </div>` : '';

  const relatedHtml = c.related?.length ? `
    <div class="related-section">
      <div class="related-title">${t('related_title')}</div>
      <div class="related-tags">
        ${c.related.map(rid => {
          const rf = findConceptGlobal(rid);
          if (!rf) return '';
          const rName = (getLang() === 'zh-TW' && rf.concept.nameTW) ? rf.concept.nameTW : rf.concept.name;
          return `<span class="related-tag" data-concept-id="${rid}" data-module-id="${rf.module.id}">${rName}</span>`;
        }).join('')}
      </div>
    </div>` : '';

  const mConcepts = m.concepts;
  const curIdx = mConcepts.findIndex(x => x.id === c.id);
  const nextConcept = mConcepts[curIdx + 1];
  const nextBtn = nextConcept
    ? `<button class="btn-next" data-concept-id="${nextConcept.id}" data-module-id="${m.id}">${t('btn_next')}</button>`
    : '';

  return `
    <div class="concept-page">
      <div class="breadcrumb">
        <span class="breadcrumb-link" data-nav="home">${t('home')}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-link" data-nav="module" data-module-id="${m.id}">${mName(m)}</span>
        <span class="breadcrumb-sep">›</span>
        <span>${displayName}</span>
      </div>
      <div class="concept-header">
        <div class="concept-badge" style="color:${m.color};border:1px solid ${m.color};padding:4px 14px;border-radius:100px;font-family:Cinzel,serif;font-size:9px;letter-spacing:.18em;text-transform:uppercase;display:inline-block;margin-bottom:16px;opacity:.85">${displaySubtitle}</div>
        <h1 class="concept-title">${displayName}</h1>
        ${displayZh ? `<div class="concept-zh">${displayZh}</div>` : ''}
        <p class="concept-tagline">${displayTagline}</p>
      </div>
      ${challengeHtml}
      <div class="concept-tabs">
        <button class="concept-tab active" data-tab="simple">${t('tab_simple')}</button>
        <button class="concept-tab" data-tab="deep">${t('tab_deep')}</button>
        <button class="concept-tab" data-tab="real">${t('tab_real')}</button>
      </div>
      <div class="concept-tab-panel active" id="tab-simple">
        <div class="concept-content"><p>${c.simple}</p></div>
      </div>
      <div class="concept-tab-panel" id="tab-deep">
        <div class="concept-content"><p>${c.deep}</p></div>
      </div>
      <div class="concept-tab-panel" id="tab-real">
        <div class="concept-content"><p>${c.realWorld}</p></div>
        ${relatedHtml}
      </div>
      <div class="homework-box">
        <div class="homework-header">
          <span class="homework-label">${t('homework_label')}</span>
          <span class="homework-time">${t('homework_time_prefix')} ${c.homework.time}</span>
        </div>
        <p class="homework-task">${c.homework.task}</p>
        <a class="github-btn" href="https://github.com/jameelovecat/ai-magic-dict" target="_blank" rel="noopener">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          ${t('github_btn')}
        </a>
      </div>
      <div class="concept-actions">
        <button class="btn-learned ${learned ? 'already-learned' : ''}" data-action="mark-learned" data-concept-id="${c.id}">
          ${learned ? t('btn_already_learned') : t('btn_learned')}
        </button>
        ${nextBtn}
      </div>
    </div>`;
}

// ── 测验页 ──
function renderQuiz() {
  const qs = State.quizState;
  if (qs.done) return renderQuizResult();

  const q = qs.questions[qs.current];
  const m = mod(State.moduleId);
  const dots = qs.questions.map((_, i) =>
    `<div class="quiz-dot ${i < qs.current ? 'done' : i === qs.current ? 'active' : ''}"></div>`
  ).join('');

  return `
    <div class="quiz-page">
      <div class="breadcrumb">
        <span class="breadcrumb-link" data-nav="home">${t('home')}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-link" data-nav="module" data-module-id="${m.id}">${mName(m)}</span>
        <span class="breadcrumb-sep">›</span>
        <span>${t('quiz_title')}</span>
      </div>
      <div class="quiz-header">
        <div class="quiz-title">${m.icon} ${t('quiz_title')}</div>
        <div class="quiz-subtitle">${mName(m)}</div>
        <div class="quiz-progress-dots">${dots}</div>
      </div>
      <div class="quiz-question-card">
        <div class="quiz-q-num">${t('quiz_q_prefix')} ${qs.current + 1} ${t('quiz_q_mid')} ${qs.questions.length} ${t('quiz_q_suffix')}</div>
        <p class="quiz-q-text">${q.question}</p>
        <div class="quiz-options">
          ${q.options.map((opt, i) =>
            `<button class="quiz-option" data-option-idx="${i}" data-correct="${q.correct}">${opt}</button>`
          ).join('')}
        </div>
        <div class="quiz-explanation" id="quiz-explanation">${q.explanation}</div>
        <button class="quiz-next-btn" id="quiz-next-btn" data-action="quiz-next">
          ${qs.current < qs.questions.length - 1 ? t('quiz_next') : t('quiz_finish')}
        </button>
      </div>
    </div>`;
}

function renderQuizResult() {
  const qs = State.quizState;
  const m = mod(State.moduleId);
  const pct = Math.round(qs.score / qs.questions.length * 100);
  let rank, icon;
  if (pct === 100) { rank = t('rank_master'); icon = '🏆'; }
  else if (pct >= 80) { rank = t('rank_senior'); icon = '⭐'; }
  else if (pct >= 60) { rank = t('rank_junior'); icon = '✨'; }
  else { rank = t('rank_novice'); icon = '🌱'; }

  return `
    <div class="quiz-page">
      <div class="quiz-result">
        <div class="quiz-result-icon">${icon}</div>
        <div class="quiz-result-title">${t('quiz_result_title')}</div>
        <div class="quiz-result-score">${t('quiz_score_prefix')} ${qs.score} / ${qs.questions.length} ${t('quiz_score_suffix')}（${pct}%）</div>
        <div class="quiz-result-rank">${rank}</div>
        <div class="quiz-result-actions">
          <button class="btn-primary" data-nav="module" data-module-id="${m.id}">${t('back_to_module')}</button>
          <button class="btn-secondary" data-action="retry-quiz" data-module-id="${m.id}">${t('retry')}</button>
        </div>
      </div>
    </div>`;
}

// ── 搜索页 ──
function renderSearch() {
  const q = State.searchQuery.toLowerCase();
  if (!q) return `<div class="search-results"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">${t('nav_search')}</div></div></div>`;

  const results = allConcepts().filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.zh?.toLowerCase().includes(q) ||
    c.zhTW?.toLowerCase().includes(q) ||
    c.tagline.toLowerCase().includes(q) ||
    c.simple.toLowerCase().includes(q)
  );

  if (!results.length) return `
    <div class="search-results">
      <div class="search-results-title">${t('search_prefix')}${State.searchQuery}${t('search_suffix')} — ${t('search_empty_title')}</div>
      <div class="empty-state"><div class="empty-state-icon">📖</div><div class="empty-state-text">${t('search_empty')}</div></div>
    </div>`;

  const rows = results.map(c => {
    const learned = Progress.isLearned(c.id);
    const displayName = (getLang() === 'zh-TW' && c.nameTW) ? c.nameTW : c.name;
    const displayTagline = cTagline(c);
    return `
      <div class="concept-row ${learned ? 'learned' : ''}"
           style="--module-color:${c.module.color}"
           data-concept-id="${c.id}" data-module-id="${c.module.id}">
        <div class="concept-status">${learned ? '✓' : ''}</div>
        <div class="concept-row-info">
          <div class="concept-row-name">${displayName}<span style="font-family:Inter;font-size:11px;color:var(--text3);margin-left:8px">${mName(c.module)}</span></div>
          <div class="concept-row-tagline">${displayTagline}</div>
        </div>
        <span class="concept-row-arrow">›</span>
      </div>`;
  }).join('');

  return `
    <div class="search-results">
      <div class="search-results-title">${t('search_prefix')}${State.searchQuery}${t('search_suffix')} — ${results.length} ${t('search_count_suffix')}</div>
      <div class="concepts-list">${rows}</div>
    </div>`;
}

// ── 事件绑定 ──
function attachEvents() {
  document.querySelectorAll('[data-module-id]').forEach(el => {
    if (el.classList.contains('locked')) return;
    el.addEventListener('click', e => {
      if (!e.target.closest('[data-concept-id]') && !e.target.closest('[data-action]') && !e.target.closest('[data-nav]')) {
        navigate('module', { moduleId: parseInt(el.dataset.moduleId) });
      }
    });
  });

  document.querySelectorAll('[data-concept-id]').forEach(el => {
    el.addEventListener('click', () => navigate('concept', { conceptId: el.dataset.conceptId }));
  });

  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const nav = el.dataset.nav;
      if (nav === 'home') navigate('home');
      else if (nav === 'module') navigate('module', { moduleId: parseInt(el.dataset.moduleId) });
    });
  });

  document.querySelectorAll('.concept-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.concept-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.concept-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
    });
  });

  document.querySelectorAll('.challenge-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const idx = parseInt(btn.dataset.challengeIdx);
      const correct = parseInt(btn.dataset.correct);
      document.querySelectorAll('.challenge-option').forEach(b => {
        b.disabled = true;
        const i = parseInt(b.dataset.challengeIdx);
        if (i === correct) b.classList.add('correct');
        else if (i === idx && idx !== correct) b.classList.add('wrong');
      });
      document.getElementById('challenge-reveal')?.classList.add('visible');
    });
  });

  document.querySelectorAll('[data-action="mark-learned"]').forEach(btn => {
    btn.addEventListener('click', e => {
      Progress.markLearned(btn.dataset.conceptId);
      const rect = btn.getBoundingClientRect();
      triggerSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
      btn.textContent = t('btn_already_learned');
      btn.classList.add('already-learned');
      updateNavbar();
    });
  });

  document.querySelectorAll('[data-action="start-quiz"], [data-action="retry-quiz"]').forEach(btn => {
    btn.addEventListener('click', () => startQuiz(parseInt(btn.dataset.moduleId)));
  });

  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (opt.disabled) return;
      const idx = parseInt(opt.dataset.optionIdx);
      const correct = parseInt(opt.dataset.correct);
      document.querySelectorAll('.quiz-option').forEach(o => {
        o.disabled = true;
        const i = parseInt(o.dataset.optionIdx);
        if (i === correct) o.classList.add('correct');
        else if (i === idx && idx !== correct) o.classList.add('wrong');
      });
      if (idx === correct) State.quizState.score++;
      document.getElementById('quiz-explanation')?.classList.add('visible');
      document.getElementById('quiz-next-btn')?.classList.add('visible');
    });
  });

  document.querySelectorAll('[data-action="quiz-next"]').forEach(btn => {
    btn.addEventListener('click', () => {
      State.quizState.current++;
      if (State.quizState.current >= State.quizState.questions.length) State.quizState.done = true;
      render();
    });
  });

  document.querySelectorAll('.btn-next[data-concept-id]').forEach(btn => {
    btn.addEventListener('click', () => navigate('concept', { conceptId: btn.dataset.conceptId }));
  });

  document.querySelectorAll('[data-nav="module"][data-action!="start-quiz"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mid = parseInt(btn.dataset.moduleId);
      if (mid) navigate('module', { moduleId: mid });
    });
  });
}

function startQuiz(mid) {
  const m = mod(mid);
  const questions = m.concepts.filter(c => c.quiz).map(c => c.quiz);
  State.moduleId = mid;
  State.quizState = { questions, current: 0, score: 0, done: false };
  navigate('quiz');
}

function initSearch() {
  const input = document.querySelector('.nav-search');
  if (!input) return;
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim();
      State.searchQuery = q;
      q ? navigate('search') : navigate('home');
    }, 300);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; State.searchQuery = ''; navigate('home'); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  initSearch();

  document.querySelector('.nav-logo')?.addEventListener('click', () => navigate('home'));

  document.querySelector('.lang-toggle')?.addEventListener('click', () => {
    toggleLang();
    render();
    showToast(getLang() === 'zh-TW' ? '已切換為繁體中文' : '已切换为简体中文');
  });
});
