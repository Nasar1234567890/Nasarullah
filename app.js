// Shared test logic for the MCQ website. Questions come from questions.js only,
// so a future update needs to change that one file, not every page.
(function () {
  var params = new URLSearchParams(window.location.search);
  var testKey = params.get('class') || 'viii';
  if (!QUESTIONS[testKey]) testKey = 'viii';
  var test = QUESTIONS[testKey];
  var idx = 0, answers = new Array(test.questions.length).fill(null);
  var secondsLeft = (test.minutes || 10) * 60, timerId = null, submitted = false;
  var letters = ['A', 'B', 'C', 'D'];

  document.getElementById('testtitle').textContent = test.title;
  document.getElementById('test').dir = test.dir;
  document.getElementById('prevbtn').onclick = function () { move(-1); };
  document.getElementById('nextbtn').onclick = function () { move(1); };
  document.getElementById('submitbtn').onclick = function () { submitTest(false); };

  function optHtml(o) {
    return /[\u0600-\u06FF]/.test(o) ? o : '<span class="m">' + o + '</span>';
  }
  function render() {
    var qs = test.questions;
    document.getElementById('counter').textContent = 'Question ' + (idx + 1) + ' of ' + qs.length;
    document.getElementById('bar').style.width = ((idx + 1) / qs.length * 100) + '%';
    document.getElementById('qtext').innerHTML = qs[idx].q;
    var box = document.getElementById('opts');
    box.innerHTML = '';
    qs[idx].options.forEach(function (o, i) {
      var b = document.createElement('button');
      b.className = 'opt' + (test.dir === 'ltr' ? ' en' : '') + (answers[idx] === i ? ' sel' : '');
      b.innerHTML = '(' + letters[i] + ') ' + optHtml(o);
      b.onclick = (function (i) { return function () { answers[idx] = i; render(); }; })(i);
      box.appendChild(b);
    });
  }
  function move(d) {
    var n = test.questions.length;
    idx = Math.min(n - 1, Math.max(0, idx + d));
    render();
  }
  function tick() {
    secondsLeft--;
    var m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    var s = String(secondsLeft % 60).padStart(2, '0');
    var el = document.getElementById('timer');
    el.textContent = m + ':' + s;
    if (secondsLeft <= 60) el.classList.add('warn');
    if (secondsLeft <= 0) { clearInterval(timerId); submitTest(true); }
  }

  function sendResult(sc, total, title) {
    try {
      var name = '';
      try { name = localStorage.getItem('mcqStudentName') || ''; } catch (e) {}
      if (!name) name = 'No name given';
      var d = new Date();
      var dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      var pct = Math.round(sc/total*100);
      var body = new URLSearchParams();
      body.append('entry.405524197', name);
      body.append('entry.1697901976', title);
      body.append('entry.1716719252', String(sc));
      body.append('entry.270177342', String(pct));
      body.append('entry.1703878082', dateStr);
      body.append('fvv','1'); body.append('draftResponse','[]'); body.append('pageHistory','0'); body.append('fbzx','1284267405081931998');
      fetch('https://docs.google.com/forms/d/e/1FAIpQLSfMGZXvdzqOO_fa2V5AW3sDqa86zWKTEu6UhiFQNGPJ6X-wdw/formResponse', {method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:body});
    } catch (e) {}
  }

  function submitTest(auto) {
    if (submitted) return;
    var unanswered = answers.filter(function (a) { return a === null; }).length;
    if (!auto && unanswered > 0 && !confirm(unanswered + ' question(s) are unanswered. Submit anyway?')) return;
    submitted = true;
    clearInterval(timerId);
    var qs = test.questions, score = 0;
    qs.forEach(function (q, i) { if (answers[i] === q.answer) score++; }); sendResult(score, qs.length, test.title);
    document.getElementById('test').classList.add('hidden');
    var r = document.getElementById('result');
    r.classList.remove('hidden');
    r.dir = test.dir;
    document.getElementById('score').textContent = score + ' / ' + qs.length;
    document.getElementById('scorenote').textContent = (auto ? 'Time up — submitted automatically. ' : '') + Math.round(score / qs.length * 100) + '% correct.';
    var html = '';
    qs.forEach(function (q, i) {
      var yours = answers[i] === null ? 'Not answered' : '(' + letters[answers[i]] + ') ' + optHtml(q.options[answers[i]]);
      var corr = '(' + letters[q.answer] + ') ' + optHtml(q.options[q.answer]);
      var ok = answers[i] === q.answer;
      html += '<div class="review"><div class="qq"><b>Q' + (i + 1) + '.</b> ' + q.q + '</div>'
        + '<div>Your answer: <span class="' + (ok ? 'correct' : 'wrong') + '">' + yours + '</span></div>'
        + '<div>Correct answer: <span class="correct">' + corr + '</span></div></div>';
    });
    document.getElementById('review').innerHTML = html;
    window.scrollTo(0, 0);
  }
  render();
  timerId = setInterval(tick, 1000);
})();
