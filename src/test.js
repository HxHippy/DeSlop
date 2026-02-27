// De-Slop Multi-Language Pattern Test Suite
// Verifies that pattern files correctly detect AI slop across all 8 supported languages

'use strict';

// ============================================================
// LANGUAGE ORDER
// ============================================================

const LANGUAGE_ORDER = ['en', 'es', 'fr', 'de', 'it', 'pt', 'sv', 'pl', 'ja', 'ko', 'zh'];

// ============================================================
// TEST SAMPLES
// Crafted to hit real Tier 1, Tier 2, and Tier 3 patterns from each language file.
// Each phrase is drawn directly from the corresponding patterns/{lang}.js.
// ============================================================

const TEST_SAMPLES = {

  en: `Let's delve into the transformative power of paradigm shifts in today's rapidly evolving landscape. It's important to note that a holistic approach requires robust solutions and seamlessly integrated systems. This groundbreaking game-changer is truly unprecedented — leveraging synergy among key stakeholders to foster innovation. Furthermore, a comprehensive guide to navigating the complex landscape will shed light on the key takeaways. In conclusion, moving forward, we must go beyond the realm of possibilities and embrace cutting-edge, state-of-the-art, next-generation technology. This breakthrough is unparalleled. Free guaranteed amazing results — click here to buy now! Sign up today for exclusive access to our proven system. Get started free and transform your life.`,

  es: `Adentrándonos en el panorama en constante evolución, es importante señalar que necesitamos un enfoque holístico para navegar este complejo entorno. El potencial transformador y el cambio de paradigma son sin precedentes. Una solución robusta que aprovecha la sinergia entre las partes interesadas fomentará la innovación. Además, cabe destacar que la guía completa explorará las diversas facetas de este cambiador de juego. En conclusión, de cara al futuro, arrojar luz sobre las conclusiones clave es esencial. Asimismo, sinergias y apalancar las buenas prácticas es clave. ¡Compra ahora! Resultados comprobados, garantizado, increíble y revolucionario. Gratis para siempre. Transforma tu vida hoy.`,

  fr: `Plongeons dans le paysage en constante évolution. Il est important de noter que cette approche holistique permet de naviguer dans ce complexe environnement. Le potentiel transformateur et le changement de paradigme sont sans précédent. Une solution robuste qui exploite la puissance et intègre de manière transparente les parties prenantes favorisera l'innovation. De plus, il convient de souligner que le guide complet explorera les diverses facettes de ce changement qui change la donne. En conclusion, pour résumer, jeter une lumière sur les points clés à retenir est fondamental. Par ailleurs, synergie et trésor d'informations. C'est incroyable, révolutionnaire et fantastique. Cliquez ici ! Achetez maintenant ! Résultats garantis gratuitement.`,

  de: `Tauchen wir ein in die sich ständig wandelnden Landschaft. Es ist wichtig zu beachten dass ein ganzheitlicher Ansatz benötigt wird, um durch die komplexe Landschaft zu navigieren. Das transformative Potenzial und der Paradigmenwechsel sind ohne Präzedenzfall. Eine robuste Lösung die nahtlos integrieren und Synergien nutzt, wird Innovation fördern. Darüber hinaus sei darauf hingewiesen dass der umfassende Leitfaden die verschiedenen Facetten erkunden wird. Abschließend zusammenfassend: vorausblickend müssen wir die wesentlichen Erkenntnisse im Blick behalten. Zudem sind Stakeholder und Empowerment, disruptiv und agil Schlüsselbegriffe. Fantastisch, garantiert, kostenlos — jetzt kaufen! Verwandle dein Leben. Nicht verpassen.`,

  pt: `Mergulhando nas complexidades do cenário em constante evolução, é importante notar que uma abordagem holística é essencial para navegar neste complexo ambiente. O potencial transformador e a mudança de paradigma são sem precedentes. Uma solução robusta que integra de forma transparente as partes interessadas irá fomentar a inovação. Além disso, cabe notar que o guia completo explorará as diversas facetas desta virada de jogo. Em conclusão, para resumir, iluminar as principais conclusões é fundamental. Aprofundar-se em sinergias e otimizar as melhores práticas é essencial. Incrível, revolucionário, garantido e gratuito. Compre agora! Transforme sua vida. Não perca essa oportunidade.`,

  ja: `今日のデジタル化が進む時代において、常に進化するランドスケープを深く掘り下げる必要があります。包括的なガイドを通じて、多面的な側面を探求し、パラダイムシフトとゲームチェンジャーについて考察します。前例のない機会が広がる中、シームレスに統合されたソリューションが求められています。本記事では、変革的な力と画期的な技術についてご紹介します。結論として、まとめると、今後に向けて、明るい未来が広がっています。言うまでもなく、次世代のソリューションと革新的なアプローチが未来を形作ります。さらに加えて、注目すべきは、AIが変える未来です。無料で今すぐ行動してください！素晴らしい機会をお見逃しなく。実証済みの方法で驚くべき結果を！`,

  ko: `오늘날의 디지털 시대에서 끊임없이 변화하는 환경을 깊이 파고들어 살펴보겠습니다. 포괄적인 가이드를 통해 다각적인 측면을 탐구하고 패러다임 전환과 게임 체인저에 대해 분석합니다. 전례 없는 기회가 펼쳐지는 가운데, 원활하게 통합된 솔루션이 필요합니다. 이 글에서는 혁신적인 기술과 견고한 프레임워크를 소개해 보겠습니다. 결론적으로, 요약하자면, 앞으로 나아가며, 밝은 미래가 기다리고 있습니다. 두말할 필요도 없이, 차세대 솔루션과 혁신적인 접근이 미래를 만들어갑니다. 더욱이 또한, 주목해야 할 것은, AI가 바꾸는 미래입니다. 무료로 지금 바로 행동하세요! 놀라운 결과를 놓치지 마세요. 검증된 방법으로 믿을 수 없는 결과를!`,

  it: `Immergiamoci nel panorama in continua evoluzione. È importante notare che un approccio olistico richiede soluzioni robuste e un'integrazione senza soluzione di continuità. Questo rivoluzionario cambio di paradigma è senza precedenti — sfruttando le sinergie tra gli stakeholder chiave per promuovere l'innovazione. Inoltre, vale la pena sottolineare che una guida completa farà luce sui punti chiave. In conclusione, guardando al futuro, dobbiamo sbloccare il potenziale trasformativo. Sono entusiasta di annunciare questa svolta epocale. Ottimizzare e massimizzare le competenze chiave è fondamentale. Incredibile, rivoluzionario, garantito e gratuito. Clicca qui per acquistare ora! Trasforma la tua vita oggi.`,

  sv: `Låt oss fördjupa oss i det ständigt föränderliga landskapet. Det är viktigt att notera att ett holistiskt angreppssätt kräver robusta lösningar och sömlös integration. Detta banbrytande paradigmskifte är utan motstycke — genom att utnyttja synergier mellan nyckelintressenter för att främja innovation. Dessutom bör det påpekas att en omfattande guide kommer att belysa de viktigaste slutsatserna. Sammanfattningsvis, när vi blickar framåt, måste vi frigöra den transformativa potentialen. Jag är glad att kunna meddela detta genombrott. Optimera och maximera kärnkompetenser är avgörande. Fantastisk, revolutionerande, garanterat och gratis. Klicka här för att köpa nu! Förvandla ditt liv idag.`,

  pl: `Zagłębmy się w dynamicznie zmieniający się krajobraz. Warto zauważyć, że holistyczne podejście wymaga solidnych rozwiązań i bezproblemowej integracji. Ta przełomowa zmiana paradygmatu jest bezprecedensowa — wykorzystując synergię między kluczowymi interesariuszami w celu wspierania innowacji. Ponadto warto podkreślić, że kompleksowy przewodnik rzuci światło na kluczowe wnioski. Podsumowując, patrząc w przyszłość, musimy odblokować transformacyjny potencjał. Z radością ogłaszam ten przełom. Optymalizacja i maksymalizacja kluczowych kompetencji jest niezbędna. Niesamowite, rewolucyjne, gwarantowane i za darmo. Kliknij tutaj, aby kupić teraz! Przemień swoje życie już dziś.`,

  zh: `在当今数字化快速发展的时代，不断演变的格局需要我们深入探讨和全面的指南来理解。通过多方面的分析和开创性的解决方案，我们将探讨范式转变和游戏规则改变者。前所未有的机遇正在展开，无缝整合的革命性技术为我们提供了突破性的进展。在本文中，我们将探讨变革性力量与健壮的框架。综上所述，总结一下，展望未来，光明的未来等待着我们。不言而喻，下一代解决方案和革命性的技术将引领新时代。此外，值得注意的是，AI正在改变未来。免费立即行动！令人惊叹的结果不容错过。经过验证的方法带来难以置信的结果！`
};

// ============================================================
// PATTERN COUNT HELPERS
// ============================================================

function getPatternCount(langCode) {
  const source = window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[langCode];
  if (!source) return 0;
  const t1 = (source.tier1 || []).length;
  const t2 = (source.tier2 || []).length;
  const t3 = (source.tier3 || []).length;
  const sw = (source.stopWords || []).length;
  return t1 + t2 + t3 + sw;
}

// ============================================================
// CORE TEST RUNNER
// ============================================================

/**
 * Run pattern tests for a single language.
 * Returns an object with match counts per tier and overall pass/fail.
 *
 * @param {string} langCode
 * @returns {{ passed: boolean, tier1Matches: string[], tier2Matches: string[], tier3Matches: string[], stopWordMatches: string[], totalMatches: number }}
 */
function runTest(langCode) {
  const source = window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[langCode];
  const text = TEST_SAMPLES[langCode] || '';

  if (!source || !text) {
    return {
      passed: false,
      tier1Matches: [],
      tier2Matches: [],
      tier3Matches: [],
      stopWordMatches: [],
      totalMatches: 0,
      error: source ? 'No sample text defined' : 'Pattern file not loaded'
    };
  }

  const tier1Matches = collectMatches(text, source.tier1 || []);
  const stopWordMatches = collectMatches(text, source.stopWords || []);
  const tier2Matches = collectMatches(text, source.tier2 || []);
  const tier3Matches = collectMatches(text, source.tier3 || []);

  const totalMatches = tier1Matches.length + stopWordMatches.length + tier2Matches.length + tier3Matches.length;
  const passed = totalMatches > 0;

  return {
    passed,
    tier1Matches,
    stopWordMatches,
    tier2Matches,
    tier3Matches,
    totalMatches
  };
}

/**
 * Run a set of regex patterns against a text and return all unique matched strings (deduplicated).
 *
 * @param {string} text
 * @param {RegExp[]} patterns
 * @returns {string[]}
 */
function collectMatches(text, patterns) {
  const seen = new Set();
  const results = [];

  for (const pattern of patterns) {
    // Re-create the regex with global flag to avoid lastIndex issues
    let re;
    try {
      re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
    } catch (e) {
      continue;
    }

    let match;
    let iterations = 0;
    const MAX_ITER = 200;

    while ((match = re.exec(text)) !== null && iterations < MAX_ITER) {
      iterations++;
      const matchedText = match[0].trim();
      if (matchedText && !seen.has(matchedText)) {
        seen.add(matchedText);
        results.push(matchedText);
      }
      // Guard against zero-length matches causing infinite loops
      if (re.lastIndex === match.index) {
        re.lastIndex++;
      }
    }
  }

  return results;
}

// ============================================================
// UI HELPERS
// ============================================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.substring(0, max - 1) + '\u2026';
}

/**
 * Update a single language section with test results.
 */
function updateResultsUI(langCode, result) {
  const section = document.querySelector(`.lang-section[data-lang="${langCode}"]`);
  const statusEl = document.getElementById(`status-${langCode}`);
  const verdictEl = document.getElementById(`verdict-${langCode}`);
  const countEl = document.getElementById(`count-${langCode}`);
  const tierResultsEl = document.getElementById(`tier-results-${langCode}`);
  const resultsEl = document.getElementById(`results-${langCode}`);

  if (!section || !statusEl || !verdictEl || !countEl || !tierResultsEl || !resultsEl) return;

  // Update section border
  section.classList.remove('passed', 'failed');
  section.classList.add(result.passed ? 'passed' : 'failed');

  // Status badge in header
  statusEl.textContent = result.passed ? '[ PASS ]' : '[ FAIL ]';
  statusEl.className = 'test-status ' + (result.passed ? 'pass' : 'fail');

  // Verdict in results panel
  verdictEl.textContent = result.passed ? '[ PASS ]' : '[ FAIL ]';
  verdictEl.className = 'results-verdict ' + (result.passed ? 'pass' : 'fail');

  // Total match count
  countEl.textContent = `${result.totalMatches} match${result.totalMatches !== 1 ? 'es' : ''} found`;

  // Tier blocks
  tierResultsEl.innerHTML = '';

  const tiers = [
    { key: 'tier1', label: 'Tier 1 - AI Slop', matches: result.tier1Matches },
    { key: 'stopwords', label: 'Stop Words', matches: result.stopWordMatches },
    { key: 'tier2', label: 'Tier 2 - Corporate Buzzwords', matches: result.tier2Matches },
    { key: 'tier3', label: 'Tier 3 - Marketing Clichés', matches: result.tier3Matches }
  ];

  for (const tier of tiers) {
    const block = document.createElement('div');
    block.className = `tier-block ${tier.key}${tier.matches.length === 0 ? ' no-matches' : ''}`;

    const label = document.createElement('div');
    label.className = 'tier-label';
    label.textContent = `${tier.label} (${tier.matches.length} match${tier.matches.length !== 1 ? 'es' : ''})`;
    block.appendChild(label);

    if (tier.matches.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'tier-matches';

      // Show up to 12 unique matches per tier
      const display = tier.matches.slice(0, 12);
      for (const m of display) {
        const tag = document.createElement('span');
        tag.className = `match-tag ${tier.key}`;
        tag.title = m;
        tag.textContent = truncate(m, 40);
        tagsContainer.appendChild(tag);
      }

      if (tier.matches.length > 12) {
        const more = document.createElement('span');
        more.className = 'tier-no-match';
        more.textContent = `+${tier.matches.length - 12} more`;
        tagsContainer.appendChild(more);
      }

      block.appendChild(tagsContainer);
    } else {
      const none = document.createElement('div');
      none.className = 'tier-no-match';
      none.textContent = 'No matches';
      block.appendChild(none);
    }

    tierResultsEl.appendChild(block);
  }

  resultsEl.style.display = 'block';
}

/**
 * Run all languages and update the global summary.
 */
function runAllTests() {
  let passCount = 0;

  for (const lang of LANGUAGE_ORDER) {
    const result = runTest(lang);
    updateResultsUI(lang, result);
    if (result.passed) passCount++;
  }

  updateSummary(passCount);
}

/**
 * Update the global summary bar.
 */
function updateSummary(passCount) {
  const bar = document.getElementById('summaryBar');
  const count = document.getElementById('summaryCount');
  const total = LANGUAGE_ORDER.length;

  if (!bar || !count) return;

  bar.style.display = 'block';
  count.textContent = `[ ${passCount}/${total} LANGUAGES PASSED ]`;
  count.className = 'summary-count';

  if (passCount === total) {
    count.classList.add('all-pass');
  } else if (passCount > 0) {
    count.classList.add('partial-pass');
  }
}

// ============================================================
// COLLAPSIBLE SECTIONS
// ============================================================

function toggleSection(targetId) {
  const content = document.getElementById(targetId);
  const header = document.querySelector(`.lang-header[data-target="${targetId}"]`);

  if (!content || !header) return;

  const indicator = header.querySelector('.collapse-indicator');
  const isOpen = content.style.display !== 'none';

  if (isOpen) {
    content.style.display = 'none';
    if (indicator) indicator.textContent = '[ + ]';
    header.classList.remove('open');
  } else {
    content.style.display = 'block';
    if (indicator) indicator.textContent = '[ - ]';
    header.classList.add('open');
  }
}

function expandAll() {
  for (const lang of LANGUAGE_ORDER) {
    const content = document.getElementById(`lang-${lang}`);
    const header = document.querySelector(`.lang-header[data-target="lang-${lang}"]`);
    if (content) content.style.display = 'block';
    if (header) {
      const indicator = header.querySelector('.collapse-indicator');
      if (indicator) indicator.textContent = '[ - ]';
      header.classList.add('open');
    }
  }
}

function collapseAll() {
  for (const lang of LANGUAGE_ORDER) {
    const content = document.getElementById(`lang-${lang}`);
    const header = document.querySelector(`.lang-header[data-target="lang-${lang}"]`);
    if (content) content.style.display = 'none';
    if (header) {
      const indicator = header.querySelector('.collapse-indicator');
      if (indicator) indicator.textContent = '[ + ]';
      header.classList.remove('open');
    }
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

function initPatternBadges() {
  for (const lang of LANGUAGE_ORDER) {
    const badge = document.getElementById(`badge-${lang}`);
    if (!badge) continue;

    const count = getPatternCount(lang);
    if (count > 0) {
      badge.textContent = `${count} patterns`;
    } else {
      badge.textContent = 'NOT LOADED';
      badge.style.color = '#FF6B6B';
    }
  }
}

function initSampleTexts() {
  for (const lang of LANGUAGE_ORDER) {
    const el = document.getElementById(`sample-${lang}`);
    if (!el) continue;
    el.textContent = TEST_SAMPLES[lang] || '(no sample defined)';
  }
}

function setupEventListeners() {
  // Global "Test All" button
  const testAllBtn = document.getElementById('testAllBtn');
  if (testAllBtn) {
    testAllBtn.addEventListener('click', () => {
      expandAll();
      runAllTests();
    });
  }

  // Expand / Collapse all
  const expandAllBtn = document.getElementById('expandAllBtn');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', expandAll);
  }

  const collapseAllBtn = document.getElementById('collapseAllBtn');
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', collapseAll);
  }

  // Per-language collapsible headers
  document.querySelectorAll('.lang-header').forEach(header => {
    header.addEventListener('click', () => {
      const target = header.getAttribute('data-target');
      if (target) toggleSection(target);
    });
  });

  // Per-language "Run Test" buttons
  document.querySelectorAll('.btn-test').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = btn.getAttribute('data-lang');
      if (!lang) return;
      const result = runTest(lang);
      updateResultsUI(lang, result);

      // Recount passes for summary
      let passCount = 0;
      for (const l of LANGUAGE_ORDER) {
        const statusEl = document.getElementById(`status-${l}`);
        if (statusEl && statusEl.classList.contains('pass')) passCount++;
      }
      // If summary already visible, update it
      const bar = document.getElementById('summaryBar');
      if (bar && bar.style.display !== 'none') {
        updateSummary(passCount);
      }
    });
  });

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.close());
  }
}

// ============================================================
// DOMCONTENTLOADED
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n (best-effort - won't break if chrome API absent)
  if (window.DESLOP_I18N) {
    try {
      const langSettings = await chrome.storage.sync.get({ patternLanguage: 'auto' });
      await window.DESLOP_I18N.init(langSettings.patternLanguage);
      window.DESLOP_I18N.applyTranslations();
    } catch (e) {
      // Running outside extension context - skip i18n
    }
  }

  initSampleTexts();
  initPatternBadges();
  setupEventListeners();
});
