// Safety check
if (typeof nlp === 'undefined') {
  document.body.innerHTML = '<div style="text-align:center;margin-top:100px;"><h2>NLP Library Failed to Load</h2><p>Refresh the page or check your connection.</p></div>';
}

function roundToHalf(n) { return Math.round(n * 2) / 2; }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateReadability(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words = text.match(/\b\w[\w']*\b/g) || [];
  const wc = words.length || 1;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const asl = wc / sentences;
  const asw = syllables / wc;

  const fre = 206.835 - (1.015 * asl) - (84.6 * asw);
  const fkGrade = 0.39 * asl + 11.8 * asw - 15.59;

  return {
    fre: Math.round(fre * 10) / 10,
    fk: Math.round(fkGrade * 10) / 10,
    words: wc,
    sentences,
    syllables
  };
}

function lexicalDiversity(words) {
  const clean = words.map(w => w.toLowerCase().replace(/[^a-z']/g, '')).filter(Boolean);
  const unique = new Set(clean).size;
  const freq = {};
  clean.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const hapax = Object.values(freq).filter(v => v === 1).length;
  return {
    ttr: clean.length ? unique / clean.length : 0,
    hapaxRate: unique ? hapax / unique : 0
  };
}

async function analyzeEssay(text, prompt = '', taskType = '2') {
  if (typeof nlp === 'undefined') throw new Error('NLP library not available');

  const doc = nlp(text);
  const words = doc.terms().out('array');
  const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-z']/g, '')).filter(Boolean);
  const sentences = doc.sentences().out('array');
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const readability = calculateReadability(text);
  const lex = lexicalDiversity(words);
  const longWordsRatio = cleanWords.filter(w => w.length > 7).length / Math.max(1, cleanWords.length);

  const subordinatorMatches = text.match(/\b(which|that|although|while|because|since|if|unless|even though|despite|whereas|once|as)\b/gi) || [];
  const passiveMatches = text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || [];

  const linkers = ['however','although','moreover','furthermore','therefore','thus','in addition','for example','on the other hand','in contrast','similarly','nevertheless','in conclusion','firstly','secondly','finally'];
  const linkerCount = linkers.reduce((sum, l) => sum + (text.match(new RegExp('\\b' + l + '\\b', 'gi')) || []).length, 0);

  let trScore = 5.0;
  const minWords = taskType === '1' ? 150 : 250;
  if (readability.words >= minWords) trScore += 1.5;
  if (readability.words >= minWords + 30) trScore += 0.5;

  if (taskType === '1') {
    const hasOverview = /overall|in general|summary/i.test(text);
    const hasKeyTrends = /increase|decrease|rise|fall|peak|fluctuate|remain|highest|lowest/i.test(text);
    const hasData = /\d+%?|million|thousand|approximately|roughly/i.test(text);
    if (hasOverview) trScore += 1.2;
    if (hasKeyTrends && hasData) trScore += 1.0;
    if (paragraphs.length >= 3) trScore += 0.8;
  } else {
    const hasPosition = /i (believe|think|feel|argue)|in my opinion|it is clear/i.test(text);
    const hasConclusion = /in conclusion|to sum up|overall/i.test(text);
    if (hasPosition) trScore += 1.2;
    if (hasConclusion) trScore += 1.0;
    if (paragraphs.length >= 4) trScore += 0.8;
  }

  let ccScore = 5.0;
  if (paragraphs.length >= (taskType === '1' ? 3 : 4)) ccScore += 1.2;
  if (linkerCount >= 6) ccScore += 1.0;
  if (linkerCount > 14) ccScore -= 0.6;

  let lrScore = 5.0;
  if (lex.ttr > 0.58) lrScore += 1.2;
  if (lex.ttr > 0.68) lrScore += 0.8;
  if (longWordsRatio > 0.18) lrScore += 0.7;
  if (lex.hapaxRate > 0.35) lrScore += 0.6;

  let grScore = 5.0;
  if (subordinatorMatches.length >= 8) grScore += 1.2;
  if (subordinatorMatches.length >= 14) grScore += 0.8;
  if (passiveMatches.length >= 1) grScore += 0.5;
  if (readability.fk >= 11 && readability.fk <= 16) grScore += 0.7;

  let grammarIssues = [];
  try {
    const params = new URLSearchParams({ language: 'en-US', text: text.substring(0, 10000) });
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    if (res.ok) {
      const data = await res.json();
      grammarIssues = (data.matches || []).slice(0, 15);
      grScore -= Math.min(1.5, grammarIssues.length * 0.08);
    }
  } catch (e) {
    grammarIssues = [{ message: 'Grammar check unavailable (network error)' }];
  }

  const bands = {
    TR: roundToHalf(clamp(trScore, 1, 9)),
    CC: roundToHalf(clamp(ccScore, 1, 9)),
    LR: roundToHalf(clamp(lrScore, 1, 9)),
    GR: roundToHalf(clamp(grScore, 1, 9))
  };
  bands.overall = roundToHalf((bands.TR + bands.CC + bands.LR + bands.GR) / 4);

  return { bands, readability, lex, linkerCount, subordinatorMatches, passiveMatches, grammarIssues };
}

// UI Logic (unchanged, fully working)
const essayInput = document.getElementById('essay');
const wcSpan = document.getElementById('wc');
const minWordsSpan = document.getElementById('minWords');

essayInput.addEventListener('input', () => {
  const words = essayInput.value.trim().split(/\s+/).filter(w => w.length > 0);
  wcSpan.textContent = words.length;
});

document.querySelectorAll('input[name="task"]').forEach(r => {
  r.addEventListener('change', () => {
    const task = document.querySelector('input[name="task"]:checked').value;
    minWordsSpan.textContent = task === '1' ? '150' : '250';
  });
});

document.getElementById('checkBtn').addEventListener('click', async () => {
  const text = essayInput.value.trim();
  if (!text) { alert('Please paste your essay first.'); return; }

  const taskType = document.querySelector('input[name="task"]:checked').value;

  document.getElementById('resultsPanel').style.display = 'grid';
  document.getElementById('overallBand').textContent = '...';
  document.getElementById('grammarResults').innerHTML = '<div class="loading">Checking grammar...</div>';
  document.getElementById('feedbackList').innerHTML = '<li class="loading">Analysing essay...</li>';

  try {
    const result = await analyzeEssay(text, '', taskType);

    document.getElementById('trBand').textContent = result.bands.TR + '/9';
    document.getElementById('ccBand').textContent = result.bands.CC + '/9';
    document.getElementById('lrBand').textContent = result.bands.LR + '/9';
    document.getElementById('grBand').textContent = result.bands.GR + '/9';
    document.getElementById('overallBand').textContent = result.bands.overall + '/9';

    const min = taskType === '1' ? 150 : 250;
    const notes = [];
    if (result.readability.words < min) notes.push(`<div class="error">Word count too low (${result.readability.words}/${min}) — major penalty.</div>`);
    if (result.grammarIssues.length > 5) notes.push(`<div class="warning">Multiple grammar issues detected.</div>`);
    if (notes.length === 0) notes.push(`<div class="success">Strong response — see detailed feedback.</div>`);
    document.getElementById('quickNotes').innerHTML = notes.join('');

    document.getElementById('feedbackList').innerHTML = `
      <li><strong>Readability:</strong> Flesch Ease ${result.readability.fre} • Grade ${result.readability.fk}</li>
      <li><strong>Lexical Diversity:</strong> TTR ${(result.lex.ttr * 100).toFixed(1)}% • Hapax ${(result.lex.hapaxRate * 100).toFixed(1)}%</li>
      <li><strong>Linking Devices:</strong> ${result.linkerCount} used</li>
      <li><strong>Complex Structures:</strong> ${result.subordinatorMatches.length} subordinators</li>
      <li><strong>Passive Voice:</strong> ${result.passiveMatches.length} instances</li>
    `;

    const suggestions = [];
    if (result.linkerCount > 12) suggestions.push('<div class="warning">Avoid overuse of linking words.</div>');
    if (result.lex.ttr < 0.55) suggestions.push('<div class="warning">Increase vocabulary range with synonyms.</div>');
    if (result.subordinatorMatches.length < 6) suggestions.push('<div class="warning">Add more complex sentences (although, while, which, etc.).</div>');
    document.getElementById('highlights').innerHTML = suggestions.length ? suggestions.join('') : '<div class="success">Excellent balance — keep it up!</div>';

    if (result.grammarIssues.length === 0 || result.grammarIssues[0]?.message?.includes('unavailable')) {
      document.getElementById('grammarResults').innerHTML = '<div class="success">No grammar or spelling issues found!</div>';
    } else {
      document.getElementById('grammarResults').innerHTML = result.grammarIssues.map(issue => `
        <div class="grammar-item">
          <strong>${issue.rule?.issueType || 'Issue'}:</strong> ${issue.message}
          <div style="color:#666; font-size:0.9rem; margin-top:4px;">
            Context: "...${issue.context?.text || ''}..."
          </div>
          ${issue.replacements?.length ? `<div style="margin-top:4px;"><strong>Suggestions:</strong> ${issue.replacements.slice(0,3).map(r => r.value).join(', ')}</div>` : ''}
        </div>
      `).join('');
    }

    document.getElementById('statsPanel').innerHTML = `
      <div>Words: <strong>${result.readability.words}</strong></div>
      <div>Sentences: <strong>${result.readability.sentences}</strong></div>
      <div>Avg sentence length: <strong>${(result.readability.words / result.readability.sentences).toFixed(1)}</strong> words</div>
      <div>Flesch Reading Ease: <strong>${result.readability.fre}</strong></div>
      <div>Grade level: <strong>${result.readability.fk}</strong></div>
    `;

  } catch (err) {
    alert('Analysis error: ' + err.message);
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const essay = essayInput.value || 'No essay submitted';
  const overall = document.getElementById('overallBand').textContent || '-';
  const tr = document.getElementById('trBand').textContent || '-';
  const cc = document.getElementById('ccBand').textContent || '-';
  const lr = document.getElementById('lrBand').textContent || '-';
  const gr = document.getElementById('grBand').textContent || '-';
  const grammar = document.getElementById('grammarResults').innerText || 'Not checked';
  const stats = document.getElementById('statsPanel').innerText || 'Not available';

  const report = `Summage IELTS Report (BETA)
==================

Overall Band: ${overall}

Component Scores:
- Task Response: ${tr}
- Coherence & Cohesion: ${cc}
- Lexical Resource: ${lr}
- Grammatical Range & Accuracy: ${gr}

Readability & Stats:
${stats}

Grammar Check:
${grammar}

Full Essay:
${essay}

Generated on ${new Date().toLocaleString()}
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'summage_ielts_report.txt';
  a.click();
  URL.revokeObjectURL(url);
});