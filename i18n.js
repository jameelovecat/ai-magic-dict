// AI魔法词典 — 多语言支持

const LANG_KEY = 'aimd_lang';

const I18N = {
  'zh-CN': {
    site_name: 'AI魔法词典',
    tagline: '解锁 AI 世界的每一道咒语',
    eyebrow: 'Grimoire of Artificial Intelligence',
    stat_learned: '已习得',
    stat_total: '咒语总数',
    stat_open: '开放学院',
    nav_search: '搜索咒语…',
    nav_toggle: '繁體',
    sec_modules: '选择你的魔法学院',
    coming_soon: '即将开放',
    card_concepts: '个咒语',
    tab_simple: '简单说',
    tab_deep: '深入理解',
    tab_real: '真实场景',
    challenge_label: '施法前先猜猜',
    challenge_reveal: '揭晓 ✦',
    homework_label: '✦ 修炼任务',
    homework_time_prefix: '⏱',
    github_btn: '在 GitHub 完成作业',
    btn_learned: '✦ 习得此咒',
    btn_already_learned: '✓ 已习得此咒',
    btn_next: '下一个咒语 ›',
    quiz_btn: '⚡ 开始魔法测验',
    quiz_btn_retry: '✦ 重新测验',
    quiz_title: '魔法测验',
    quiz_q_prefix: '第',
    quiz_q_mid: '题 / 共',
    quiz_q_suffix: '题',
    quiz_next: '下一题 →',
    quiz_finish: '查看结果 ✦',
    quiz_result_title: '测验完成',
    quiz_score_prefix: '答对',
    quiz_score_suffix: '题',
    back_to_module: '返回学院',
    retry: '再试一次',
    home: '首页',
    search_prefix: '搜索「',
    search_suffix: '」',
    search_count_suffix: '个结果',
    search_empty: '此咒语尚未收录于词典',
    search_empty_title: '未找到结果',
    related_title: '关联咒语',
    rank_master: '大法师',
    rank_senior: '高级法师',
    rank_junior: '初级法师',
    rank_novice: '见习巫师',
    all_learned_btn: '✦ 重新测验',
    start_quiz_btn: '⚡ 开始魔法测验',
    learned_badge: '已习得',
    locked_label: '即将开放',
  },
  'zh-TW': {
    site_name: 'AI魔法詞典',
    tagline: '解鎖 AI 世界的每一道咒語',
    eyebrow: 'Grimoire of Artificial Intelligence',
    stat_learned: '已習得',
    stat_total: '咒語總數',
    stat_open: '開放學院',
    nav_search: '搜尋咒語…',
    nav_toggle: '简体',
    sec_modules: '選擇你的魔法學院',
    coming_soon: '即將開放',
    card_concepts: '個咒語',
    tab_simple: '簡單說',
    tab_deep: '深入理解',
    tab_real: '真實場景',
    challenge_label: '施法前先猜猜',
    challenge_reveal: '揭曉 ✦',
    homework_label: '✦ 修煉任務',
    homework_time_prefix: '⏱',
    github_btn: '在 GitHub 完成作業',
    btn_learned: '✦ 習得此咒',
    btn_already_learned: '✓ 已習得此咒',
    btn_next: '下一個咒語 ›',
    quiz_btn: '⚡ 開始魔法測驗',
    quiz_btn_retry: '✦ 重新測驗',
    quiz_title: '魔法測驗',
    quiz_q_prefix: '第',
    quiz_q_mid: '題 / 共',
    quiz_q_suffix: '題',
    quiz_next: '下一題 →',
    quiz_finish: '查看結果 ✦',
    quiz_result_title: '測驗完成',
    quiz_score_prefix: '答對',
    quiz_score_suffix: '題',
    back_to_module: '返回學院',
    retry: '再試一次',
    home: '首頁',
    search_prefix: '搜尋「',
    search_suffix: '」',
    search_count_suffix: '個結果',
    search_empty: '此咒語尚未收錄於詞典',
    search_empty_title: '未找到結果',
    related_title: '關聯咒語',
    rank_master: '大法師',
    rank_senior: '高級法師',
    rank_junior: '初級法師',
    rank_novice: '見習巫師',
    all_learned_btn: '✦ 重新測驗',
    start_quiz_btn: '⚡ 開始魔法測驗',
    learned_badge: '已習得',
    locked_label: '即將開放',
  }
};

function getLang() {
  return localStorage.getItem(LANG_KEY) || 'zh-CN';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function t(key) {
  const lang = getLang();
  return I18N[lang]?.[key] ?? I18N['zh-CN'][key] ?? key;
}

function toggleLang() {
  setLang(getLang() === 'zh-CN' ? 'zh-TW' : 'zh-CN');
}

// 取模块的本地化名称
function mName(m) {
  return getLang() === 'zh-TW' ? (m.nameTW || m.name) : m.name;
}
function mSubtitle(m) {
  return getLang() === 'zh-TW' ? (m.subtitleTW || m.subtitle) : m.subtitle;
}
function mDesc(m) {
  return getLang() === 'zh-TW' ? (m.descTW || m.description) : m.description;
}

// 取概念的本地化字段
function cZh(c) {
  return getLang() === 'zh-TW' ? (c.zhTW || c.zh) : c.zh;
}
function cTagline(c) {
  return getLang() === 'zh-TW' ? (c.taglineTW || c.tagline) : c.tagline;
}
