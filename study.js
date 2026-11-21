var STUDY = {};
// NOTE (v149 split): the STUDY data keys used to live in this file as one
// 26 MB literal, over GitHub's 25,000,000-byte web-upload limit. Each key now
// lives in its own file (study-x.js, study-shared.js, study-ix.js, study-viii.js,
// study-vii.js, study-vi.js, study-v.js, study-xi.js), loaded right after this
// file. This file keeps `var STUDY` plus all shared guide-renderer code.

function escHtml(s){ return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
var matTab = "paragraphs";
var matOpen = true;
var matData = null;
var matSubj = null;
var matTabs = [];
var matSubTab = "definitions";
var matSubOpen = true;
var matNoteUnit = 0;
var matNoteOpen = true;
function matItemsHtml(items){
  var html = "";
  items.forEach(function(item, i){
    html += "<div class=\"review\"><div class=\"qq\"><b>" + (i + 1) + ". " + escHtml(item.t) + "</b></div>";
    item.p.forEach(function(para){ html += "<p class=\"note\">" + escHtml(para) + "</p>"; });
    html += "</div>";
  });
  return html;
}
// content HTML for one English material tab (built once, shown inside its own tab)
function matTabHtml(tab){
  var data = matData || STUDY.x;
  if(!data) return "";
  var html = "";
  if(tab === "paragraphs") html = matItemsHtml(data.paragraphs);
  else if(tab === "essays") html = matItemsHtml(data.essays);
  else if(tab === "definitions"){
    data.definitions.filter(function(d){ return d.s === "English"; }).forEach(function(d){
      html += "<p class=\"note\"><b>" + escHtml(d.t) + ":</b> " + escHtml(d.d) + "</p>";
    });
  }
  else if(tab === "synonyms"){
    if(data.synonyms && data.synonyms.length){
      data.synonyms.forEach(function(s){
        html += "<p class=\"note\"><b>" + escHtml(s.w) + ":</b> " + escHtml(s.s) + "</p>";
      });
    } else {
      html = "<p class=\"note\">Synonyms for Class X English will be added here soon.</p>";
    }
  }
  else if(tab === "verbforms"){
    if(data.verbforms && data.verbforms.length){
      html += "<p class=\"note\"><b>Base Form \u2014 Past \u2014 Past Participle</b></p>";
      data.verbforms.forEach(function(v){
        html += "<p class=\"note\"><b>" + escHtml(v.b) + "</b> \u2014 " + escHtml(v.p) + " \u2014 " + escHtml(v.pp) + "</p>";
      });
    } else {
      html = "<p class=\"note\">Verb forms for Class X English will be added here soon.</p>";
    }
  }
  else if(tab === "notes"){
    html += "<p class=\"note\"><b>Chapter-wise notes</b> \u2014 choose a unit below. Each unit has its own tab, separate from the others.</p>";
    if(data.notes && data.notes.length){
      data.notes.forEach(function(n, i){
        html += "<div class=\"matsec\"><button class=\"modebtn\" id=\"notetab-" + i + "\" onclick=\"showNoteUnit(" + i + ")\">" + escHtml(n.u) + "</button><div id=\"notepanel-" + i + "\" class=\"matpanel\" style=\"display:none\"></div></div>";
      });
    }
  }
  return html;
}
function buildMatPanels(){
  matTabs.forEach(function(t){
    var p = document.getElementById("matpanel-" + t[0]);
    if(p) p.innerHTML = matTabHtml(t[0]);
  });
  var data = matData || STUDY.x;
  if(data && data.notes){
    data.notes.forEach(function(n, i){
      var p = document.getElementById("notepanel-" + i);
      if(!p) return;
      var h = "<p class=\"note\"><b>" + escHtml(n.u) + " \u2014 " + escHtml(n.t) + "</b></p>";
      if(n.items && n.items.length){
        n.items.forEach(function(it){ h += "<p class=\"note\">" + escHtml(it) + "</p>"; });
      } else {
        h += "<p class=\"note\">Notes for this unit will be added here.</p>";
      }
      p.innerHTML = h;
    });
  }
}
function buildSubPanels(){
  var p = document.getElementById("subpanel-definitions");
  if(p){
    var defs = matData ? matData.definitions.filter(function(d){ return d.s === matSubj; }) : [];
    if(defs.length){
      var h = "";
      defs.forEach(function(d){ h += "<p class=\"note\"><b>" + escHtml(d.t) + ":</b> " + escHtml(d.d) + "</p>"; });
      p.innerHTML = h;
    } else {
      p.innerHTML = "<p class=\"note\">Study material for this subject is coming soon.</p>";
    }
  }
  var n = document.getElementById("subpanel-notes");
  if(n){ var notes = matData ? (matData.notes || []).filter(function(x){ return x.s === matSubj; }) : []; if(notes.length){ var nh = ""; notes.forEach(function(x){ nh += "<p class=\"note\"><b>" + escHtml(x.u) + " \u2014 " + escHtml(x.t) + "</b></p>"; (x.items || []).forEach(function(it){ nh += "<p class=\"note\">" + escHtml(it) + "</p>"; }); }); n.innerHTML = nh; } else { n.innerHTML = "<p class=\"note\">Study material for this subject is coming soon.</p>"; } }
}
function showMatTab(tab){
  var p = document.getElementById("matpanel-" + tab);
  var open = (matTab === tab) && matOpen && p && p.style.display !== "none";
  matTab = tab; matOpen = !open;
  var si = document.getElementById("matSearch"); if(si) si.value = "";
  matTabs.forEach(function(t){ var b = document.getElementById("mattab-" + t[0]); if(b) b.className = "modebtn" + ((matOpen && matTab === t[0]) ? " sel" : ""); });
  filterMaterial();
}
function showSubjTab(tab){
  var p = document.getElementById("subpanel-" + tab);
  var open = (matSubTab === tab) && matSubOpen && p && p.style.display !== "none";
  matSubTab = tab; matSubOpen = !open;
  var si = document.getElementById("matSearch"); if(si) si.value = "";
  ["definitions", "notes"].forEach(function(t){ var b = document.getElementById("subtab-" + t); if(b) b.className = "modebtn" + ((matSubOpen && matSubTab === t) ? " sel" : ""); });
  filterMaterial();
}
function showNoteUnit(i){
  var p = document.getElementById("notepanel-" + i);
  var open = (matNoteUnit === i) && matNoteOpen && p && p.style.display !== "none";
  matNoteUnit = i; matNoteOpen = !open;
  var si = document.getElementById("matSearch"); if(si) si.value = "";
  var data = matData || STUDY.x;
  if(data && data.notes){
    data.notes.forEach(function(n, j){ var b = document.getElementById("notetab-" + j); if(b) b.className = "modebtn" + ((matNoteOpen && matNoteUnit === j) ? " sel" : ""); });
  }
  filterMaterial();
}
function guideLabel(subj){
  var base = String(subj || "").split(" \u2014 ")[0];
  return "Guide / Complete Notes of " + base;
}
// Language word of a versioned subject name, for the English-guide label.
function guideLangWord(subj){
  if((subj || "").indexOf("Urdu") >= 0) return "Urdu";
  if((subj || "").indexOf("Sindhi") >= 0) return "Sindhi";
  return "";
}
// Label shown when a Maths subject has only the English guide.
function mathsEnglishNote(subj){
  var w = guideLangWord(subj);
  return w ? "English guide \u2014 " + w + " version not available yet." : "English guide.";
}
// Data-selection for one (class, subject) guide — the same selection
// renderSubjectMaterial/openExUnit/openMathUnit use. Search uses it to
// enumerate guide units without touching the page.
function guideDataFor(cls, subj){
  var data = null;
  if(cls === "x") data = STUDY.x;
  else if(subj === "English") data = STUDY.shared;
  else if(cls === "ix") data = STUDY.ix;
  else if(cls === "viii") data = STUDY.viii;
  else if(cls === "vii") data = STUDY.vii;
  else if(cls === "vi") data = STUDY.vi;
  else if(cls === "v") data = STUDY.v;
  else if(cls === "xi") data = STUDY.xi;
  else if(cls === "xii") data = STUDY.xii;
  else if(cls === "iv") data = STUDY.iv;
  else if(cls === "iii") data = STUDY.iii;
  if(subj === "English" && STUDY[cls] && STUDY[cls].exsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].exsolutions});
  if(subj === "Sindhi" && STUDY[cls] && STUDY[cls].sindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].sindhiExsolutions});
  if((subj === "Asan Urdu" || subj === "Urdu Salees") && STUDY[cls] && STUDY[cls].urduExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].urduExsolutions});
  if(subj === "Urdu" && STUDY[cls] && STUDY[cls].urduExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].urduExsolutionsUrdu});
  if(subj === "Asan Sindhi" && STUDY[cls] && STUDY[cls].asanSindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].asanSindhiExsolutions});
  if(subj === "Gulzar-E-Urdu" && STUDY[cls] && STUDY[cls].urduExsolutionsGulzar && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].urduExsolutionsGulzar});
if((subj || "").indexOf("Science") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].sciExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].sciExsolutions});
if((subj || "").indexOf("Science") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].sciExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].sciExsolutionsEn});
if((subj || "").indexOf("Science") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].sciExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].sciExsolutionsUrdu});
if((subj || "").indexOf("Islamiat") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].islExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].islExsolutions});
if((subj || "").indexOf("Islamiat") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].islExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].islExsolutionsEn});
if((subj || "").indexOf("Islamiat") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].islExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].islExsolutionsUrdu});
if((subj || "").indexOf("Pakistan Studies") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].pakExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].pakExsolutions});
if((subj || "").indexOf("Pakistan Studies") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].pakExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].pakExsolutionsEn});
if((subj || "").indexOf("Pakistan Studies") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].pakExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].pakExsolutionsUrdu});
if((subj || "").indexOf("Chemistry") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].chemExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].chemExsolutions});
if((subj || "").indexOf("Chemistry") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].chemExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].chemExsolutionsEn});
if((subj || "").indexOf("Chemistry") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].chemExsolutionsUrdu});
if((subj || "").indexOf("Chemistry") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].chemExsolutionsUrdu});
if((subj || "").indexOf("Physics") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].phyExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].phyExsolutions});
if((subj || "").indexOf("Physics") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].phyExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].phyExsolutionsEn});
if((subj || "").indexOf("Physics") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].phyExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].phyExsolutionsUrdu});
if((subj || "").indexOf("Physics") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].phyExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].phyExsolutionsUrdu});
if((subj || "").indexOf("Biology") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].bioExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].bioExsolutions});
if((subj || "").indexOf("Biology") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].bioExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].bioExsolutionsEn});
if((subj || "").indexOf("Biology") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].bioExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].bioExsolutionsUrdu});
if((subj || "").indexOf("Biology") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].bioExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].bioExsolutionsUrdu});
if((subj || "").indexOf("Computer Science") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].csExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].csExsolutions});
if((subj || "").indexOf("Computer Science") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].csExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].csExsolutionsUrdu});
if((subj || "").indexOf("Computer Science") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].csExsolutionsSindhi && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].csExsolutionsSindhi});
if((subj || "").indexOf("Social Studies") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].socExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].socExsolutions});
if((subj || "").indexOf("Social Studies") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].socExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].socExsolutionsEn});
if((subj || "").indexOf("Social Studies") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].socExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].socExsolutionsUrdu});
if((subj || "").indexOf("General Knowledge") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].gkExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].gkExsolutions});
if((subj || "").indexOf("General Knowledge") === 0 && (subj || "").indexOf("English") >= 0 && STUDY[cls] && STUDY[cls].gkExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].gkExsolutionsEn});
if((subj || "").indexOf("General Knowledge") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].gkExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[cls].gkExsolutionsUrdu});
if((subj || "").indexOf("Mathematics") === 0 && (subj || "").indexOf("Sindhi") >= 0 && STUDY[cls] && STUDY[cls].mathsolutionsSindhi && data) data = Object.assign({}, data, {mathsolutions: STUDY[cls].mathsolutionsSindhi});
if((subj || "").indexOf("Mathematics") === 0 && (subj || "").indexOf("Urdu") >= 0 && STUDY[cls] && STUDY[cls].mathsolutionsUrdu && data) data = Object.assign({}, data, {mathsolutions: STUDY[cls].mathsolutionsUrdu});
  // A subject with no guide of its own used to fall back to the class
  // English guide. Flag it instead, so callers show "No guide yet"
  // (or, for Maths, label the English guide) rather than the wrong lessons.
  var _isMaths = (subj || "").indexOf("Mathematics") === 0;
  var _noGuide = false, _mathsEnglish = false;
  if(data && subj !== "English"){
    if(_isMaths){
      if(data.mathsolutions && data.mathsolutions === (STUDY[cls] && STUDY[cls].mathsolutions) && (subj || "").indexOf("English Version") < 0) _mathsEnglish = true;
      else if(!data.mathsolutions) _noGuide = true;
    } else if(data.exsolutions === (STUDY[cls] && STUDY[cls].exsolutions)){
      _noGuide = true;
    }
  }
  if(data) data = Object.assign({}, data, {noGuide: _noGuide, mathsEnglish: _mathsEnglish});
  return data;
}
function renderSubjectMaterial(cls, subj){
  var box = document.getElementById("subjectmaterial");
  if(!box) return;
  var data = guideDataFor(cls, subj);
  matData = data;
  matSubj = subj;
  matCls = cls;
  var _guideTab = (data && !data.noGuide) ? ["exsolutions", guideLabel(subj)] : null;
  var _gb = document.getElementById("subjectguide");
  if(_gb) _gb.innerHTML = _guideTab ? "<p><button class=\"modebtn\" onclick=\"openMatPage('exsolutions')\">" + escHtml(_guideTab[1]) + "</button></p>" : "";
  var html = "<h3>Study Material</h3>";
  if(data && data.noGuide){
    html += "<p class=\"note\">No guide yet for this subject.</p>";
  } else if(data && data.mathsEnglish){
    html += "<p class=\"note\">" + mathsEnglishNote(subj) + "</p>";
  }
  if(subj === "English"){
    if(!data){ box.innerHTML = ""; return; }
    matTabs = [["paragraphs", "Paragraphs"], ["essays", "Essays"], ["synonyms", "Synonyms"], ["verbforms", "Verb Forms"], ["definitions", "Definitions"]];
    if(data.notes) matTabs.push(["notes", "Notes"]);
    matTabs.forEach(function(t){
      html += "<p><button class=\"modebtn\" onclick=\"openMatPage('" + t[0] + "')\">" + t[1] + "</button></p>";
    });
    box.innerHTML = html;
    return;
  }
  matTabs = [["definitions", "Definitions"], ["notes", "Notes"]];
  matTabs.forEach(function(t){
    html += "<p><button class=\"modebtn\" onclick=\"openMatPage('" + t[0] + "')\">" + t[1] + "</button></p>";
  });
  box.innerHTML = html;
}


// ---- Study material as separate pages ----
// Open one material section (Essays, Paragraphs, Notes, ...) as its own page.
function openMatPage(tab, cls, subj){
  if(cls) matCls = cls;
  if(subj) matSubj = subj;
  if(!matCls) matCls = currentClass;
  if(!matSubj) matSubj = currentSubject;
  var c = matCls, s = matSubj;
  // Guide data not loaded yet (first visit, deep link or back button):
  // show a loading note, load the group, then open the page again.
  var _lg = (typeof lazyGroupForUnit === 'function') ? lazyGroupForUnit(c, s) : null;
  if(_lg && typeof lazyGroupIsReady === 'function' && typeof ensureLazyGroup === 'function' && !lazyGroupIsReady(_lg)){
    var _mp0 = document.getElementById("matpage");
    if(_mp0){
      document.getElementById("mattitle").textContent = (s ? s + " \u2014 " : "") + (tab === "exsolutions" ? guideLabel(s) : tab);
      document.getElementById("matcontent").innerHTML = "<p class=\"note\">Loading\u2026</p>";
      document.getElementById("subjectpage").classList.add("hidden");
      var _gp0 = document.getElementById("grammarpage"); if(_gp0) _gp0.classList.add("hidden");
      _mp0.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
    ensureLazyGroup(_lg).then(function(){ openMatPage(tab, c, s); }, function(){});
    return;
  }
  var data = null;
  if(c === "x") data = STUDY.x;
  else if(c === "grammar") data = STUDY.grammar;
  else if(c === "grammar2") data = STUDY.grammar2;
  else if(s === "English") data = STUDY.shared;
  else if(c === "ix") data = STUDY.ix;
  else if(c === "viii") data = STUDY.viii;
  else if(c === "vii") data = STUDY.vii;
  else if(c === "vi") data = STUDY.vi;
  else if(c === "v") data = STUDY.v;
  else if(c === "xi") data = STUDY.xi;
  else if(c === "xii") data = STUDY.xii;
  else if(c === "iv") data = STUDY.iv;
  else if(c === "iii") data = STUDY.iii;
  if(s === "English" && STUDY[c] && STUDY[c].exsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].exsolutions});
  if(s === "Sindhi" && STUDY[c] && STUDY[c].sindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sindhiExsolutions});
  if((s === "Asan Urdu" || s === "Urdu Salees") && STUDY[c] && STUDY[c].urduExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutions});
  if(s === "Urdu" && STUDY[c] && STUDY[c].urduExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutionsUrdu});
  if(s === "Asan Sindhi" && STUDY[c] && STUDY[c].asanSindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].asanSindhiExsolutions});
  if(s === "Gulzar-E-Urdu" && STUDY[c] && STUDY[c].urduExsolutionsGulzar && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutionsGulzar});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].sciExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutions});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].sciExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutionsEn});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].sciExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutionsUrdu});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].islExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutions});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].islExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutionsEn});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].islExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutionsUrdu});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].pakExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutions});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].pakExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutionsEn});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].pakExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutionsUrdu});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].chemExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutions});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsEn});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsUrdu});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsUrdu});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].phyExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutions});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].phyExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutionsEn});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].phyExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutionsUrdu});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].phyExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutionsUrdu});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].bioExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutions});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].bioExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutionsEn});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].bioExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutionsUrdu});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].bioExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutionsUrdu});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].csExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutions});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].csExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutionsUrdu});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].csExsolutionsSindhi && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutionsSindhi});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].socExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutions});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].socExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutionsEn});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].socExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutionsUrdu});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].gkExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutions});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].gkExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutionsEn});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].gkExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutionsUrdu});
if((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].mathsolutionsSindhi && data) data = Object.assign({}, data, {mathsolutions: STUDY[c].mathsolutionsSindhi});
if((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].mathsolutionsUrdu && data) data = Object.assign({}, data, {mathsolutions: STUDY[c].mathsolutionsUrdu});
  var _gd = guideDataFor(c, s);
  if(data) matData = data;
  if(tab === "exsolutions" && _gd && _gd.noGuide){
    var _mpN = document.getElementById("matpage");
    if(!_mpN) return;
    document.getElementById("mattitle").textContent = (s ? s + " \u2014 " : "") + guideLabel(s);
    var _siN = document.getElementById("matSearchPage");
    if(_siN){ _siN.value = ""; try{ _siN.placeholder = tr('matSearchPlaceholder'); }catch(e){} }
    document.getElementById("matcontent").innerHTML = "<p class=\"note\">No guide yet for this subject.</p>";
    document.getElementById("matcontent").dir = "ltr";
    document.getElementById("matcontent").classList.remove("pro-guide");
    document.getElementById("matcontent").classList.remove("urdu-mat");
    document.getElementById("subjectpage").classList.add("hidden");
    var _gpN = document.getElementById("grammarpage"); if(_gpN) _gpN.classList.add("hidden");
    _mpN.classList.remove("hidden");
    window.scrollTo(0, 0);
    navPush({view:'material', cls:c, subj:s, tab:tab});
    return;
  }
  matExUnit = 0;
  matMathUnit = 0;
  var title = tab;
  if(tab === "exsolutions") title = guideLabel(s);
  else matTabs.forEach(function(t){ if(t[0] === tab) title = t[1]; });
  var h = matSectionHtml(tab);
  if(tab === "exsolutions" && _gd && _gd.mathsEnglish){ h = "<p class=\"note\">" + mathsEnglishNote(s) + "</p>" + h; }
  var mp = document.getElementById("matpage");
  if(!mp) return;
  document.getElementById("mattitle").textContent = (s ? s + " \u2014 " : "") + title;
  var si = document.getElementById("matSearchPage");
  if(si){ si.value = ""; try{ si.placeholder = tr('matSearchPlaceholder'); }catch(e){} }
  document.getElementById("matcontent").innerHTML = h;
  document.getElementById("matcontent").dir = (((s || "").indexOf("Sindhi") === 0 || (s || "") === "Asan Urdu" || (s || "") === "Urdu Salees" || (s || "") === "Gulzar-E-Urdu" || (s || "") === "Urdu" || (s || "") === "Asan Sindhi" || ((s || "").indexOf("Science") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Science") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Urdu") >= 0)) && tab === "exsolutions") ? "rtl" : "ltr";
  document.getElementById("matcontent").classList.toggle("urdu-mat", (s === "Asan Urdu" || s === "Urdu Salees" || s === "Gulzar-E-Urdu" || s === "Urdu" || s === "Asan Sindhi" || (s || "").indexOf("Urdu Version") >= 0));
  document.getElementById("matcontent").classList.toggle("pro-guide", tab === "exsolutions");
  document.getElementById("subjectpage").classList.add("hidden");
  mp.classList.remove("hidden");
  window.scrollTo(0, 0);
  navPush({view:'material', cls:c, subj:s, tab:tab});
}
function backToSubject(){
  var mp = document.getElementById("matpage");
  if(mp) mp.classList.add("hidden");
  if(currentClass && currentSubject) showSubject(currentClass, currentSubject);
  else navFallback();
}
var matExUnit = 0;
// Open one exercise-solution unit as its own page.
function openExUnit(n, cls, subj){
  if(cls) matCls = cls;
  if(subj) matSubj = subj;
  if(!matCls) matCls = currentClass;
  if(!matSubj) matSubj = currentSubject;
  var c = matCls, s = matSubj;
  // Guide data not loaded yet (first visit, deep link or back button):
  // show a loading note, load the group, then open the page again.
  var _lg = (typeof lazyGroupForUnit === 'function') ? lazyGroupForUnit(c, s) : null;
  if(_lg && typeof lazyGroupIsReady === 'function' && typeof ensureLazyGroup === 'function' && !lazyGroupIsReady(_lg)){
    var _mp0 = document.getElementById("matpage");
    if(_mp0){
      document.getElementById("mattitle").textContent = (s ? s + " \u2014 " : "") + "Unit " + n;
      document.getElementById("matcontent").innerHTML = "<p class=\"note\">Loading\u2026</p>";
      document.getElementById("subjectpage").classList.add("hidden");
      var _gp0 = document.getElementById("grammarpage"); if(_gp0) _gp0.classList.add("hidden");
      _mp0.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
    ensureLazyGroup(_lg).then(function(){ openExUnit(n, c, s); }, function(){});
    return;
  }
  var data = null;
  if(c === "x") data = STUDY.x;
  else if(c === "grammar") data = STUDY.grammar;
  else if(c === "grammar2") data = STUDY.grammar2;
  else if(c === "stbb") data = stbbGuideData();
  else if(s === "English") data = STUDY.shared;
  else if(c === "ix") data = STUDY.ix;
  else if(c === "viii") data = STUDY.viii;
  else if(c === "vii") data = STUDY.vii;
  else if(c === "vi") data = STUDY.vi;
  else if(c === "v") data = STUDY.v;
  else if(c === "xi") data = STUDY.xi;
  else if(c === "xii") data = STUDY.xii;
  else if(c === "iv") data = STUDY.iv;
  else if(c === "iii") data = STUDY.iii;
  if(s === "English" && STUDY[c] && STUDY[c].exsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].exsolutions});
  if(s === "Sindhi" && STUDY[c] && STUDY[c].sindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sindhiExsolutions});
  if((s === "Asan Urdu" || s === "Urdu Salees") && STUDY[c] && STUDY[c].urduExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutions});
  if(s === "Urdu" && STUDY[c] && STUDY[c].urduExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutionsUrdu});
  if(s === "Asan Sindhi" && STUDY[c] && STUDY[c].asanSindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].asanSindhiExsolutions});
  if(s === "Gulzar-E-Urdu" && STUDY[c] && STUDY[c].urduExsolutionsGulzar && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutionsGulzar});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].sciExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutions});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].sciExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutionsEn});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].sciExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutionsUrdu});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].islExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutions});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].islExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutionsEn});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].islExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutionsUrdu});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].pakExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutions});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].pakExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutionsEn});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].pakExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutionsUrdu});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].chemExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutions});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsEn});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsUrdu});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsUrdu});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].phyExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutions});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].phyExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutionsEn});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].phyExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutionsUrdu});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].phyExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutionsUrdu});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].bioExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutions});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].bioExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutionsEn});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].bioExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutionsUrdu});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].bioExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutionsUrdu});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].csExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutions});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].csExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutionsUrdu});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].csExsolutionsSindhi && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutionsSindhi});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].socExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutions});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].socExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutionsEn});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].socExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutionsUrdu});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].gkExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutions});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].gkExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutionsEn});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].gkExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutionsUrdu});
if((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].mathsolutionsSindhi && data) data = Object.assign({}, data, {mathsolutions: STUDY[c].mathsolutionsSindhi});
if((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].mathsolutionsUrdu && data) data = Object.assign({}, data, {mathsolutions: STUDY[c].mathsolutionsUrdu});
  var _gd = guideDataFor(c, s);
  if(_gd && _gd.noGuide){ navFallback(); return; }
  if(data) matData = data;
  matExUnit = n;
  var h = exUnitHtml(n);
  var mp = document.getElementById("matpage");
  if(!mp) return;
  var ex = (data && data.exsolutions) || [];
  var u = null;
  ex.forEach(function(x){ if(x.unit === n) u = x; });
  var _ut = u ? ((s === "English" && u.title) ? u.title : (u.display || u.title)) : "";
  document.getElementById("mattitle").textContent = (s ? s + " \u2014 " : "") + "Unit " + n + (u ? " \u2014 " + _ut : "");
  var si = document.getElementById("matSearchPage");
  if(si){ si.value = ""; try{ si.placeholder = tr('matSearchPlaceholder'); }catch(e){} }
  document.getElementById("matcontent").innerHTML = h;
  document.getElementById("matcontent").dir = ((s || "").indexOf("Sindhi") === 0 || ((s || "").indexOf("STBB Grammar") === 0 && window._stbbLang !== "en") || (s || "") === "Asan Urdu" || (s || "") === "Urdu Salees" || (s || "") === "Gulzar-E-Urdu" || (s || "") === "Urdu" || (s || "") === "Asan Sindhi" || ((s || "").indexOf("Science") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Science") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Urdu") >= 0) || ((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Sindhi") >= 0) || ((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Urdu") >= 0)) ? "rtl" : "ltr";
  var _mc=document.getElementById('matcontent'); if(_mc){ var _rp=document.createElement('p'); _rp.className='note'; _rp.style.textAlign='center'; var _rm='Mistake in study material: '+document.getElementById('mattitle').textContent+(typeof studentName!=='undefined'&&studentName?' \u2014 '+studentName:''); _rp.innerHTML='<a href="https://wa.me/923163475767?text='+encodeURIComponent(_rm)+'" target="_blank" rel="noopener">'+tr('reportU')+'</a>'; _mc.appendChild(_rp); }
  document.getElementById("matcontent").classList.toggle("urdu-mat", (s === "Asan Urdu" || s === "Urdu Salees" || s === "Gulzar-E-Urdu" || s === "Urdu" || s === "Asan Sindhi" || (s || "").indexOf("Urdu Version") >= 0 || ((s || "").indexOf("STBB Grammar") === 0 && window._stbbLang === "ur")));
  document.getElementById("matcontent").classList.toggle("pro-guide", true);
  document.getElementById("subjectpage").classList.add("hidden");
  var _gp = document.getElementById("grammarpage"); if(_gp) _gp.classList.add("hidden");
  mp.classList.remove("hidden");
  window.scrollTo(0, 0);
  navPush({view:'material', cls:c, subj:s, tab:'exsolutions', unit:n, stbbCls:(c==='stbb'?window._stbbCls:undefined), stbbLang:(c==='stbb'?window._stbbLang:undefined)});
}
// Break inline list items onto their own lines: (a) (b) ... (i) (ii) ... and 1. 2. ...
function enumLines(t){
  if(!t) return t;
  // Letter markers (a)-(h) and roman (i)-(vi), unless already at a line start.
  t = t.replace(/\s*\(([a-h]|i|ii|iii|iv|v|vi)\)(?=[\s,]|$)/g, function(m, inner, off, str){
    if(off === 0) return m;
    if(/<br\s*\/?>$/.test(str.slice(0, off))) return m;
    return '<br>(' + inner + ')';
  });
  // Numbered markers 1. 2. ... after a sentence end, colon or semicolon, followed by a capital, an Arabic letter or "(".
  t = t.replace(/([.:;]\s+)(\d{1,2})\.(\s+)(?=[^a-z0-9\s.,;:!?])/g, function(m, pre, n, sp){
    return pre + '<br>' + n + '.' + sp;
  });
  return t;
}
// Full HTML for one exercise-solution unit: shortcut links, then all sections, then difficult words.
function exUnitHtml(n){
  var data = matData;
  var ex = (data && data.exsolutions) || [];
  var u = null;
  ex.forEach(function(x){ if(x.unit === n) u = x; });
  if(!u) return "<p class=\"note\">Exercise solutions for this unit will be added here.</p>";
  var html = "";
  var _sci = ((matSubj || "").indexOf("Chemistry") === 0 || (matSubj || "").indexOf("Physics") === 0 || (matSubj || "").indexOf("Biology") === 0 || (matSubj || "").indexOf("Computer Science") === 0 || (matSubj || "").indexOf("Science") === 0);
  if((matSubj === "English" || ((matSubj || "").indexOf("STBB Grammar") === 0 && window._stbbLang === "en")) && u.display) html += "<p class=\"pro-lessons\">" + escHtml(String(u.display).split(" & ").join(" \u00b7 ")) + "</p>";
  html += "<div class=\"pro-toc\"><div class=\"pro-toc-title\">In this unit</div>";
  var _hasSummary = !!(u.summary && u.summary.length);
  if(_hasSummary) html += "<button class=\"pro-toc-row\" onclick=\"jumpExSummary(" + n + ")\"><b>Summary</b> \u062e\u0644\u0627\u0635\u0648</button>";
  if(u.lesson && u.lesson.length) html += "<button class=\"pro-toc-row\" onclick=\"jumpExLesson(" + n + ")\"><b>Lesson</b> Definitions, rules and examples</button>";
  if(_hasSummary && u.words && u.words.length) html += "<button class=\"pro-toc-row\" onclick=\"jumpExWords(" + n + ")\"><b>Words</b> Difficult Words \u2014 " + u.words.length + " words</button>";
  (u.sections || []).forEach(function(sec, i){
    var _cnt = 0; (sec.exercises || []).forEach(function(g){ _cnt += (g.items || []).length; });
    html += "<button class=\"pro-toc-row\" onclick=\"jumpEx(" + n + "," + (i + 1) + ")\"><b>" + escHtml(sec.num) + "</b> " + escHtml(sec.name) + " \u2014 " + _cnt + " questions</button>";
  });
  if(!_hasSummary && u.words && u.words.length) html += "<button class=\"pro-toc-row\" onclick=\"jumpExWords(" + n + ")\"><b>Words</b> Difficult Words \u2014 " + u.words.length + " words</button>";
  html += "</div>";
  if(_hasSummary){
    html += "<div class=\"review\" id=\"ex-" + n + "-summary\"><div class=\"qq exsec\"><b><u>\u062e\u0644\u0627\u0635\u0648</u></b></div><p class=\"note\" dir=\"rtl\">" + escHtml(u.summary) + "</p></div>";
  }
  if(u.lesson && u.lesson.length){
    html += "<div class=\"review\" id=\"ex-" + n + "-lesson\">";
    u.lesson.forEach(function(b){
      var _t = enumLines(escHtml(b.x || "").split("\n").join("<br>"));
      if(b.t === "h") html += "<div class=\"qq exsec\"><b><u>" + _t + "</u></b></div>";
      else if(b.t === "def") html += "<p class=\"note\"><b>Definition:</b> " + _t + "</p>";
      else if(b.t === "rule") html += "<p class=\"note\"><b>Rule:</b> " + _t + "</p>";
      else if(b.t === "ex") html += "<p class=\"note\"><i>" + _t + "</i></p>";
      else if(b.t === "note") html += "<p class=\"note\"><b>Note:</b> " + _t + "</p>";
      else if(b.t === "rl") html += "<p class=\"note\"><b>Real-life example:</b> " + _t + "</p>";
      else html += "<p class=\"note\">" + _t + "</p>";
    });
    html += "</div>";
  }
  var _wordsHtml = ""; if(u.words && u.words.length){
    var wordsTitle = ((matSubj || "").indexOf("Sindhi") === 0) ? "Difficult Words \u2014 Sindhi Meaning and Synonym" : (((matSubj || "") === "Asan Urdu" || (matSubj || "") === "Urdu Salees" || (matSubj || "") === "Gulzar-E-Urdu" || ((matSubj || "").indexOf("STBB Grammar") === 0 && window._stbbLang === "ur")) ? "Difficult Words \u2014 Urdu Meaning and Synonym" : "Difficult Words \u2014 Sindhi Meaning and English Synonym");
    _wordsHtml += "<div class=\"review\" id=\"ex-" + n + "-words\"><div class=\"qq exsec\"><b><u>" + wordsTitle + "</u></b></div>";
    var _enW = (matSubj === "English" || (matSubj || "").indexOf("English Version") >= 0 || ((matSubj || "").indexOf("STBB Grammar") === 0 && window._stbbLang === "en"));
    var _urduW = (matSubj === "Asan Urdu" || matSubj === "Urdu Salees" || matSubj === "Gulzar-E-Urdu" || ((matSubj || "").indexOf("STBB Grammar") === 0 && window._stbbLang === "ur"));
    var _h3 = _enW ? "Sindhi meaning" : ((_urduW || matSubj === "Sindhi") ? "Synonym" : "English");
    _wordsHtml += "<table class=\"pro-words\"><thead><tr><th>Word</th><th>Meaning</th><th>" + _h3 + "</th></tr></thead><tbody>";
    u.words.forEach(function(w){
      var _m = _enW ? w.syn : w.sd, _x = _enW ? w.sd : w.syn;
      _wordsHtml += "<tr><td><b>" + (_sci ? chemHtml(w.w) : escHtml(w.w)) + "</b></td><td>" + (_sci ? chemHtml(_m) : escHtml(_m)) + "</td><td" + (_enW ? " class=\"sd\"" : "") + ">" + (_sci ? chemHtml(_x) : escHtml(_x)) + "</td></tr>";
    });
    _wordsHtml += "</tbody></table>";
    _wordsHtml += "</div>";
  }
  if(_hasSummary) html += _wordsHtml;
  (u.sections || []).forEach(function(sec, i){
    html += "<div class=\"review\" id=\"ex-" + n + "-" + (i + 1) + "\"><div class=\"qq exsec\"><b><u>" + escHtml(sec.num) + " " + escHtml(sec.name) + "</u></b></div>";
    var _isExtras = /additional|وڌيڪ/i.test(sec.name || "");
    (sec.exercises || []).forEach(function(g){
      html += "<div class=\"exhead" + (_isExtras ? " extopic" : "") + "\"><b>" + escHtml(g.label) + "</b></div>";
      (g.items || []).forEach(function(it, qi){
        var _q = enumLines(ltrGuideLines(tableHtml(_sci ? chemHtml(it.q) : escHtml(it.q))));
        var _a = enumLines(ltrGuideLines(tableHtml(_sci ? chemHtml(it.a) : escHtml(it.a))));
        var _qTag = (_q.indexOf('<table') !== -1) ? 'div' : 'p';
        var _aTag = (_a.indexOf('<table') !== -1) ? 'div' : 'p';
        html += "<" + _qTag + " class=\"note pro-q\">" + proQHtml(qi, _q) + "</" + _qTag + ">" + (it.dq ? diagramSvg(it.dq) : "") + "<" + _aTag + " class=\"note pro-a\"><span class=\"exa\">Ans:</span> " + _a + "</" + _aTag + ">" + (it.da ? diagramSvg(it.da) : "");
      });
    });
    html += "</div>";
  });
  if(!_hasSummary) html += _wordsHtml;
  return html;
}
// Jump to one section of an exercise-solution unit page.
function jumpEx(n, m){ var el = document.getElementById("ex-" + n + "-" + m); if(el) el.scrollIntoView(); }
function jumpExLesson(n){ var el = document.getElementById("ex-" + n + "-lesson"); if(el) el.scrollIntoView(); }
function jumpExSummary(n){ var el = document.getElementById("ex-" + n + "-summary"); if(el) el.scrollIntoView(); }
function jumpExWords(n){ var el = document.getElementById("ex-" + n + "-words"); if(el) el.scrollIntoView(); }
// Back from a material page: from a unit page go to the unit list, else to the subject page.
function backFromMatPage(){
  if(matCls === "grammar"){ matExUnit = 0; showGrammarLessons(); return; }
  if(matCls === "grammar2"){ matExUnit = 0; showGrammar2Lessons(); return; }
  if(matCls === "stbb"){ matExUnit = 0; showStbbLessons(window._stbbCls, window._stbbLang); return; }
  if(matExUnit){
    matExUnit = 0;
    openMatPage('exsolutions');
    return;
  }
  if(matMathUnit){
    matMathUnit = 0;
    openMatPage('exsolutions');
    return;
  }
  backToSubject();
}
var matMathUnit = 0;
// Open one Maths exercise-solution unit as its own page.
function openMathUnit(n, cls, subj){
  if(cls) matCls = cls;
  if(subj) matSubj = subj;
  if(!matCls) matCls = currentClass;
  if(!matSubj) matSubj = currentSubject;
  var c = matCls, s = matSubj;
  // Guide data not loaded yet (first visit, deep link or back button):
  // show a loading note, load the group, then open the page again.
  var _lg = (typeof lazyGroupForUnit === 'function') ? lazyGroupForUnit(c, s) : null;
  if(_lg && typeof lazyGroupIsReady === 'function' && typeof ensureLazyGroup === 'function' && !lazyGroupIsReady(_lg)){
    var _mp0 = document.getElementById("matpage");
    if(_mp0){
      document.getElementById("mattitle").textContent = (s ? s + " \u2014 " : "") + "Unit " + n;
      document.getElementById("matcontent").innerHTML = "<p class=\"note\">Loading\u2026</p>";
      document.getElementById("subjectpage").classList.add("hidden");
      var _gp0 = document.getElementById("grammarpage"); if(_gp0) _gp0.classList.add("hidden");
      _mp0.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
    ensureLazyGroup(_lg).then(function(){ openMathUnit(n, c, s); }, function(){});
    return;
  }
  var data = null;
  if(c === "x") data = STUDY.x;
  else if(s === "English") data = STUDY.shared;
  else if(c === "ix") data = STUDY.ix;
  else if(c === "viii") data = STUDY.viii;
  else if(c === "vii") data = STUDY.vii;
  else if(c === "vi") data = STUDY.vi;
  else if(c === "v") data = STUDY.v;
  else if(c === "xi") data = STUDY.xi;
  else if(c === "xii") data = STUDY.xii;
  else if(c === "iv") data = STUDY.iv;
  else if(c === "iii") data = STUDY.iii;
  if(s === "English" && STUDY[c] && STUDY[c].exsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].exsolutions});
  if(s === "Sindhi" && STUDY[c] && STUDY[c].sindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sindhiExsolutions});
  if((s === "Asan Urdu" || s === "Urdu Salees") && STUDY[c] && STUDY[c].urduExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutions});
  if(s === "Urdu" && STUDY[c] && STUDY[c].urduExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutionsUrdu});
  if(s === "Asan Sindhi" && STUDY[c] && STUDY[c].asanSindhiExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].asanSindhiExsolutions});
  if(s === "Gulzar-E-Urdu" && STUDY[c] && STUDY[c].urduExsolutionsGulzar && data) data = Object.assign({}, data, {exsolutions: STUDY[c].urduExsolutionsGulzar});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].sciExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutions});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].sciExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutionsEn});
if((s || "").indexOf("Science") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].sciExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].sciExsolutionsUrdu});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].islExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutions});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].islExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutionsEn});
if((s || "").indexOf("Islamiat") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].islExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].islExsolutionsUrdu});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].pakExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutions});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].pakExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutionsEn});
if((s || "").indexOf("Pakistan Studies") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].pakExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].pakExsolutionsUrdu});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].chemExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutions});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsEn});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsUrdu});
if((s || "").indexOf("Chemistry") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].chemExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].chemExsolutionsUrdu});
if((s || "").indexOf("Physics") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].phyExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].phyExsolutions});
if((s || "").indexOf("Biology") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].bioExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].bioExsolutions});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].csExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutions});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].csExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutionsUrdu});
if((s || "").indexOf("Computer Science") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].csExsolutionsSindhi && data) data = Object.assign({}, data, {exsolutions: STUDY[c].csExsolutionsSindhi});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].socExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutions});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].socExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutionsEn});
if((s || "").indexOf("Social Studies") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].socExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].socExsolutionsUrdu});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].gkExsolutions && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutions});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("English") >= 0 && STUDY[c] && STUDY[c].gkExsolutionsEn && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutionsEn});
if((s || "").indexOf("General Knowledge") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].gkExsolutionsUrdu && data) data = Object.assign({}, data, {exsolutions: STUDY[c].gkExsolutionsUrdu});
if((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Sindhi") >= 0 && STUDY[c] && STUDY[c].mathsolutionsSindhi && data) data = Object.assign({}, data, {mathsolutions: STUDY[c].mathsolutionsSindhi});
if((s || "").indexOf("Mathematics") === 0 && (s || "").indexOf("Urdu") >= 0 && STUDY[c] && STUDY[c].mathsolutionsUrdu && data) data = Object.assign({}, data, {mathsolutions: STUDY[c].mathsolutionsUrdu});
  if(data) matData = data;
  matMathUnit = n;
  var h = mathUnitHtml(n);
  var _gd = guideDataFor(c, s);
  if(_gd && _gd.mathsEnglish){ h = "<p class=\"note\">" + mathsEnglishNote(s) + "</p>" + h; }
  var mp = document.getElementById("matpage");
  if(!mp) return;
  var mx = (data && data.mathsolutions) || [];
  var u = null;
  mx.forEach(function(x){ if(x.unit === n) u = x; });
  document.getElementById("mattitle").textContent = "Mathematics \u2014 Unit " + n + (u ? " \u2014 " + (u.display || u.title) : "");
  var si = document.getElementById("matSearchPage");
  if(si){ si.value = ""; try{ si.placeholder = tr('matSearchPlaceholder'); }catch(e){} }
  document.getElementById("matcontent").innerHTML = h;
  document.getElementById("matcontent").dir = (((s || "").indexOf("Mathematics") === 0 && ((s || "").indexOf("Sindhi") >= 0 || (s || "").indexOf("Urdu") >= 0)) ? "rtl" : "ltr");
  var _mc=document.getElementById('matcontent'); if(_mc){ var _rp=document.createElement('p'); _rp.className='note'; _rp.style.textAlign='center'; var _rm='Mistake in study material: '+document.getElementById('mattitle').textContent+(typeof studentName!=='undefined'&&studentName?' \u2014 '+studentName:''); _rp.innerHTML='<a href="https://wa.me/923163475767?text='+encodeURIComponent(_rm)+'" target="_blank" rel="noopener">'+tr('reportU')+'</a>'; _mc.appendChild(_rp); }
  document.getElementById("matcontent").classList.toggle("pro-guide", true);
  document.getElementById("subjectpage").classList.add("hidden");
  mp.classList.remove("hidden");
  window.scrollTo(0, 0);
  navPush({view:'material', cls:c, subj:s, tab:'exsolutions', unit:n, math:1});
}
// Render maths text: escape HTML, then turn [[a/b]] into a fraction with a horizontal bar.
// Render maths text: escape HTML, turn ^exponents into <sup> (no ^ sign shown,
// as in the book: 2^2 renders as 2 with a raised 2), then turn [[a/b]] into a
// fraction with a horizontal bar. Sup conversion uses control-char markers so
// the </sup> slash cannot break the fraction regex; markers are restored after.
var SUP_OPEN = '\u0001', SUP_CLOSE = '\u0002';
function supConvert(s){
  var out = '', i = 0;
  while(i < s.length){
    if(s[i] === '^'){
      var j = i + 1, exp = '', next = 0;
      if(s[j] === '('){
        var depth = 0, k = j, ok = false;
        while(k < s.length){
          if(s[k] === '(') depth++;
          else if(s[k] === ')'){ depth--; if(depth === 0){ ok = true; k++; break; } }
          k++;
        }
        if(!ok){ out += s[i]; i++; continue; }
        exp = supConvert(s.slice(j + 1, k - 1));
        out += SUP_OPEN + exp + SUP_CLOSE;
        i = k;
      } else if(s[j] === '[' && s[j + 1] === '['){
        var k2 = s.indexOf(']]', j);
        if(k2 === -1){ out += s[i]; i++; continue; }
        exp = supConvert(s.slice(j, k2 + 2));
        out += SUP_OPEN + exp + SUP_CLOSE;
        i = k2 + 2;
      } else {
        var k3 = j;
        if(s[k3] === '-' || s[k3] === '+') k3++;
        if(/[0-9]/.test(s[k3] || '')){
          while(/[0-9]/.test(s[k3] || '')) k3++;
          if(s[k3] === '.' && /[0-9]/.test(s[k3 + 1] || '')){ k3++; while(/[0-9]/.test(s[k3] || '')) k3++; }
          exp = s.slice(j, k3);
          next = k3;
        } else if(/[A-Za-z]/.test(s[k3] || '')){
          exp = s.slice(j, k3 + 1);
          next = k3 + 1;
        } else {
          out += s[i]; i++; continue;
        }
        out += SUP_OPEN + exp + SUP_CLOSE;
        i = next;
      }
    } else {
      out += s[i]; i++;
    }
  }
  return out;
}
var SUB_OPEN = '\u0003', SUB_CLOSE = '\u0004';
function subConvert(s){
  var out = '', i = 0;
  while(i < s.length){
    if(s[i] === '_' && s[i - 1] !== '_' && s[i + 1] !== '_'){
      var j = i + 1, sub = '', next = 0;
      if(/[0-9]/.test(s[j] || '')){
        var k = j;
        while(/[0-9]/.test(s[k] || '')) k++;
        sub = s.slice(j, k);
        next = k;
      } else if(/[A-Za-z]/.test(s[j] || '')){
        sub = s.slice(j, j + 1);
        next = j + 1;
      } else {
        out += s[i]; i++; continue;
      }
      out += SUB_OPEN + sub + SUB_CLOSE;
      i = next;
    } else {
      out += s[i]; i++;
    }
  }
  return out;
}
// Matrices and determinants: [[M]]c11,c12;c21,c22[[/M]] renders as a bracketed
// grid (rows on separate lines, columns aligned), [[D]]...[[/D]] the same with
// | bars (determinants). Token format: rows split by ;, cells by , — cells may
// contain spaces (e.g. "1 + ω") and fractions [[a/b]], powers ^ and subscripts _.
// Runs FIRST on the raw text (right after escHtml), so the caller's later
// sub/sup/fraction passes still convert the cell contents.
function matrixHtml(s){
  function grid(inner, det){
    var rows = inner.split(';');
    var cells = rows.map(function(r){ return r.split(',').map(function(c){ return c.trim(); }); });
    var ncols = 0;
    cells.forEach(function(c){ if(c.length > ncols) ncols = c.length; });
    if(!ncols) return '';
    var out = '<span class="mx' + (det ? ' det' : '') + '" dir="ltr" style="grid-template-columns:repeat(' + ncols + ',auto)">';
    cells.forEach(function(c){
      c.forEach(function(cell){ out += '<span class="mxc">' + cell + '</span>'; });
      for(var i = c.length; i < ncols; i++) out += '<span class="mxc"></span>';
    });
    return out + '</span>';
  }
  s = s.replace(/\[\[M\]\]([\s\S]*?)\[\[\/M\]\]/g, function(m, inner){ return grid(inner, false); });
  s = s.replace(/\[\[D\]\]([\s\S]*?)\[\[\/D\]\]/g, function(m, inner){ return grid(inner, true); });
  return s;
}
function mathHtml(s){
  var h = escHtml(s);
  h = matrixHtml(h);
  h = subConvert(h);
  h = supConvert(h);
  h = h.replace(/\[\[([^\]\/]+)\/([^\]]+)\]\]/g, '<span class="frac"><span class="num">$1</span><span class="den">$2</span></span>');
  return h.split(SUP_OPEN).join('<sup>').split(SUP_CLOSE).join('</sup>').split(SUB_OPEN).join('<sub>').split(SUB_CLOSE).join('</sub>');
}
// Chemistry guide text: mathHtml (fractions, raised powers, subscripts) plus
// equation blocks: [[E]] equation, [[S]] one working step, [[A]] final answer.
// Each block renders as its own coloured line. Used only for Chemistry guides.
function chemHtml(s){
  var h = mathHtml(s);
  function _ltr(t){ return /[\u0600-\u06FF]/.test(t) ? '' : ' dir="ltr"'; }
  h = h.replace(/\[\[E\]\]([\s\S]*?)\[\[\/E\]\]/g, function(m, t){ return '<span class="eq-line"' + _ltr(t) + '>' + t + '</span>'; });
  h = h.replace(/\[\[S\]\]([\s\S]*?)\[\[\/S\]\]/g, function(m, t){ return '<span class="eq-step"' + _ltr(t) + '>' + t + '</span>'; });
  h = h.replace(/\[\[A\]\]([\s\S]*?)\[\[\/A\]\]/g, function(m, t){ return '<span class="eq-ans"' + _ltr(t) + '>' + t + '</span>'; });
  return h;
}
// Is this rendered line a pure equation line joined by the Sindhi conjunction
// '۽' (and)? True only when the line's text contains '۽' AND, after removing
// every '۽', it contains no Arabic letter at all (Sindhi comma '،' and other
// punctuation are not letters, so a comma-separated list of expressions still
// counts) AND there is real maths before the first '۽' (a digit, '=', '{',
// bracket, operator, ... after an optional sub-part label such as "(i)" or
// "2."). Lines that fail any part — a Sindhi word problem, a sentence with
// '۽' in it, or a continuation line that merely starts with '۽' — return
// false and stay RTL, exactly as in v95. The test runs on the tag-stripped
// text, so <sup>/<sub>/fraction markup does not affect it; the strip only
// matches real tags (a letter after "<"), so "<"/">" maths operators survive.
function isEqLine(h){
  var plain = h.replace(/<\/?[A-Za-z][^>]*>/g, '');
  if(plain.indexOf('۽') === -1) return false;
  var before = plain.split('۽')[0].replace(/^\s*(\([ivx]+\)|\([a-z]\)|\d+\.)\s*/, '');
  if(!/[0-9A-Za-z={}()\[\]<>+\-°√^]/.test(before)) return false;
  var rest = plain.replace(/۽/g, '').replace(/[\u0660-\u0669\u06F0-\u06F9]/g, '');
  // Allow-listed measurement units do not stop a line being an equation line (teacher decision 2026-11-14).
  rest = rest.replace(/\u0633\.\u0645\.?/g, '').replace(/\u0631\u064a\u0688\u064a\u0627\u0646\u0646?/g, '');
  if(/[\u0621-\u06D3\u06FA-\u06FF]/.test(rest)) return false;
  return true;
}
// Wrap each pure-Latin/digit line (no Arabic script) in an LTR block span.
// Lines containing Sindhi/Urdu text are returned untouched (stay RTL), EXCEPT
// pure equation lines joined by '۽' (isEqLine): those are wrapped in an LTR
// block too, so a header such as "2. 2x + y = 4 ۽ x² - 2x + y² = 0" reads
// left-to-right with its number first instead of landing mid-line in RTL.
// Applied to the final HTML (after tableHtml/chemHtml); eq-blocks are already
// handled by chemHtml and are skipped. Items containing a [[T]] table are left
// untouched as a whole (2 table tokens in the corpus contain a newline).
function ltrGuideLines(h){
  if(h.indexOf('<table') !== -1) return h;
  return h.split(/(<span class="eq-(?:line|step|ans)"[^>]*>[\s\S]*?<\/span>)/g).map(function(seg){
    if(seg.indexOf('<span class="eq-') === 0) return seg;
    return seg.split('\n').map(function(line){
      if(!line.trim()) return line;
      if(!/[\u0600-\u06FF]/.test(line) || isEqLine(line)) return '<span dir="ltr" class="sum-line">' + line + '</span>';
      return line;
    }).join('\n');
  }).join('');
}
// Build the inner HTML of one guide question header ("Qn:" + rendered question).
// When the question's first line is a Sindhi equation line (a line ltrGuideLines
// newly wrapped LTR because it is pure maths joined by '۽'), the "Qn:" label is
// put INSIDE that first LTR block, so the whole header reads left-to-right as
// one unit: "Qn: <label> <equation> ۽ <equation>". A first line wrapped by the
// v95 pure-Latin rule keeps the old layout ("Qn:" outside the block) unchanged,
// and a first line that stayed RTL (a Sindhi word problem) is untouched.
function proQHtml(qi, q){
  var open = '<span dir="ltr" class="sum-line">';
  if(q.indexOf(open) === 0){
    var first = q.split('\n')[0];
    if(first.indexOf('۽') !== -1){
      return open + '<span class="exq">Q' + (qi + 1) + ':</span> ' + q.slice(open.length);
    }
  }
  return '<span class="exq">Q' + (qi + 1) + ':</span> ' + q;
}
// Tables in guide text: [[T]]Header 1|Header 2;;Row 1a|Row 1b;;Row 2a|Row 2b[[/T]]
// First row is the header; rows split by ;;, cells by |. Cells must not contain | or ;;.
// Applied AFTER escHtml/chemHtml, so fractions and raised powers work inside cells.
function tableHtml(h){
  return h.replace(/\[\[T\]\]([\s\S]*?)\[\[\/T\]\]/g, function(m, body){
    var rows = body.split(';;').map(function(r){ return r.trim(); }).filter(function(r){ return r.length > 0; });
    if(!rows.length) return '';
    var out = '<table class="pro-table"><thead><tr>';
    rows[0].split('|').forEach(function(c){ out += '<th>' + c.trim() + '</th>'; });
    out += '</tr></thead><tbody>';
    rows.slice(1).forEach(function(r){
      out += '<tr>';
      r.split('|').forEach(function(c){ out += '<td>' + c.trim() + '</td>'; });
      out += '</tr>';
    });
    return out + '</tbody></table>';
  });
}
// Full HTML for one Maths exercise-solution unit: shortcut links, then each exercise.
function diagramSvg(d){
  if(!d || !d.type) return "";
  var S = "";
  function esc(s){ return escHtml(String(s)); }
  function el(tag, attrs, inner){
    var a = "";
    for(var k in attrs) a += " " + k + "=\"" + attrs[k] + "\"";
    return "<" + tag + a + ">" + (inner || "") + "</" + tag + ">";
  }
  function line(x1, y1, x2, y2, cls){ return el("line", {x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), "class": cls || "dg"}); }
  function circle(cx, cy, r, cls){ return el("circle", {cx: cx.toFixed(1), cy: cy.toFixed(1), r: r.toFixed(1), "class": cls || "dg"}); }
  function point(x, y, label, cls){
    var s = el("circle", {cx: x.toFixed(1), cy: y.toFixed(1), r: "3.5", "class": "dg-pt"});
    if(label) s += el("text", {x: (x + 7).toFixed(1), y: (y - 6).toFixed(1), "class": cls || "dg-t"}, esc(label));
    return s;
  }
  function text(x, y, s, cls){ return el("text", {x: x.toFixed(1), y: y.toFixed(1), "class": cls || "dg-t"}, esc(s)); }
  function poly(pts, cls){
    var p = pts.map(function(q){ return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ");
    return el("polygon", {points: p, "class": cls || "dg"});
  }
  // Fit data points (y up) into a W x H box with padding; returns {sx, sy, k}.
  function fit(pts, W, H, pad){
    var xs = pts.map(function(p){ return p[0]; }), ys = pts.map(function(p){ return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if(x1 - x0 < 0.001){ x0 -= 1; x1 += 1; }
    if(y1 - y0 < 0.001){ y0 -= 1; y1 += 1; }
    var k = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0));
    var ox = pad + ((W - 2 * pad) - k * (x1 - x0)) / 2 - k * x0;
    var oy = pad + ((H - 2 * pad) - k * (y1 - y0)) / 2 + k * y1;
    return {X: function(x){ return ox + k * x; }, Y: function(y){ return oy - k * y; }, k: k};
  }
  function svgOpen(w, h){ return '<svg class="diagram" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" role="img">'; }
  function svgClose(){ return "</svg>"; }

  // ---- Venn 2 ----
  if(d.type === "venn2"){
    var R = d.regions || {}, sets = d.sets || ["A", "B"];
    S += svgOpen(300, 180);
    S += circle(110, 95, 65) + circle(190, 95, 65);
    S += text(110, 18, sets[0]) + text(190, 18, sets[1]);
    if(R.A) S += text(72, 98, R.A, "dg-t dg-c");
    if(R.B) S += text(228, 98, R.B, "dg-t dg-c");
    if(R.AB) S += text(150, 98, R.AB, "dg-t dg-c");
    if(R.U) S += text(14, 168, R.U, "dg-t");
    S += svgClose();
    return S;
  }
  // ---- Venn 3 ----
  if(d.type === "venn3"){
    var R3 = d.regions || {}, sets3 = d.sets || ["A", "B", "C"];
    S += svgOpen(300, 205);
    S += circle(150, 75, 60) + circle(105, 145, 60) + circle(195, 145, 60);
    S += text(150, 12, sets3[0]) + text(48, 192, sets3[1]) + text(252, 192, sets3[2]);
    if(R3.A) S += text(150, 52, R3.A, "dg-t dg-c");
    if(R3.B) S += text(88, 168, R3.B, "dg-t dg-c");
    if(R3.C) S += text(212, 168, R3.C, "dg-t dg-c");
    if(R3.AB) S += text(122, 108, R3.AB, "dg-t dg-c");
    if(R3.AC) S += text(178, 108, R3.AC, "dg-t dg-c");
    if(R3.BC) S += text(150, 158, R3.BC, "dg-t dg-c");
    if(R3.ABC) S += text(150, 122, R3.ABC, "dg-t dg-c");
    if(R3.U) S += text(14, 196, R3.U, "dg-t");
    S += svgClose();
    return S;
  }
  // ---- Axes / graph / points ----
  if(d.type === "graph" || d.type === "points"){
    var xr = d.x, yr = d.y;
    var W = 320, H = Math.max(170, Math.min(320, Math.round(320 * (yr[1] - yr[0]) / (xr[1] - xr[0]))));
    var X = function(x){ return 28 + (x - xr[0]) / (xr[1] - xr[0]) * (W - 44); };
    var Y = function(y){ return (H - 22) - (y - yr[0]) / (yr[1] - yr[0]) * (H - 40); };
    S += svgOpen(W, H);
    // grid at integers
    for(var gx = Math.ceil(xr[0]); gx <= xr[1]; gx++) S += line(X(gx), Y(yr[0]), X(gx), Y(yr[1]), "dg-grid");
    for(var gy = Math.ceil(yr[0]); gy <= yr[1]; gy++) S += line(X(xr[0]), Y(gy), X(xr[1]), Y(gy), "dg-grid");
    // axes (with arrowheads)
    if(yr[0] <= 0 && 0 <= yr[1]) S += line(X(xr[0]), Y(0), X(xr[1]), Y(0), "dg-ax") + poly([[X(xr[1]), Y(0)], [X(xr[1]) - 8, Y(0) - 3.5], [X(xr[1]) - 8, Y(0) + 3.5]], "dg-axf");
    if(xr[0] <= 0 && 0 <= xr[1]) S += line(X(0), Y(yr[0]), X(0), Y(yr[1]), "dg-ax") + poly([[X(0), Y(yr[1])], [X(0) - 3.5, Y(yr[1]) + 8], [X(0) + 3.5, Y(yr[1]) + 8]], "dg-axf");
    // tick labels (anchor at the axis when it exists, else at the plot edge)
    var xLabY = (yr[0] <= 0 && 0 <= yr[1]) ? Y(0) + 15 : (yr[0] > 0 ? Y(yr[0]) + 15 : Y(yr[1]) - 8);
    var yAxisX = (xr[0] <= 0 && 0 <= xr[1]) ? X(0) : (xr[0] > 0 ? X(xr[0]) : X(xr[1]));
    var yLabX = yAxisX - 8;
    for(var tx = Math.ceil(xr[0]); tx <= xr[1]; tx++){ if(tx !== 0) S += text(X(tx) - 3, xLabY, tx, "dg-tk"); }
    for(var ty = Math.ceil(yr[0]); ty <= yr[1]; ty++){ if(ty !== 0) S += el("text", {x: yLabX.toFixed(1), y: (Y(ty) + 4).toFixed(1), "class": "dg-tk", "text-anchor": "end"}, esc(String(ty))); }
    if(yr[0] <= 0 && 0 <= yr[1] && xr[0] <= 0 && 0 <= xr[1]) S += text(X(0) - 14, Y(0) + 15, "0", "dg-tk");
    if(yr[0] <= 0 && 0 <= yr[1]) S += text(X(xr[1]) - 4, Y(0) - 8, "x", "dg-tk");
    if(xr[0] <= 0 && 0 <= xr[1]) S += text(X(0) + 6, Y(yr[1]) + 4, "y", "dg-tk");
    // lines (clipped to the plot rectangle)
    function clipSeg(x1, y1, x2, y2){
      var t0 = 0, t1 = 1, dx = x2 - x1, dy = y2 - y1;
      var p = [-dx, dx, -dy, dy], q = [x1 - xr[0], xr[1] - x1, y1 - yr[0], yr[1] - y1];
      for(var i = 0; i < 4; i++){
        if(Math.abs(p[i]) < 1e-9){ if(q[i] < 0) return null; }
        else { var r = q[i] / p[i]; if(p[i] < 0){ if(r > t1) return null; if(r > t0) t0 = r; } else { if(r < t0) return null; if(r < t1) t1 = r; } }
      }
      return [[x1 + t0 * dx, y1 + t0 * dy], [x1 + t1 * dx, y1 + t1 * dy]];
    }
    if(d.type === "graph" && d.lines){
      d.lines.forEach(function(L){
        var seg = null, lab = L.label || "";
        if(L.m !== undefined && L.c !== undefined) seg = clipSeg(xr[0], L.m * xr[0] + L.c, xr[1], L.m * xr[1] + L.c);
        else if(L.pts) seg = clipSeg(L.pts[0][0], L.pts[0][1], L.pts[1][0], L.pts[1][1]);
        if(seg){
          S += line(X(seg[0][0]), Y(seg[0][1]), X(seg[1][0]), Y(seg[1][1]), "dg-ln");
          if(lab) S += text(X(seg[1][0]) - 4, Y(seg[1][1]) - 8, lab, "dg-lb");
        }
      });
    }
    // points
    (d.points || []).forEach(function(p){
      S += point(X(p[0]), Y(p[1]), p[2] || "");
    });
    S += svgClose();
    return S;
  }
  // ---- Triangle ----
  if(d.type === "triangle"){
    var pts, labels = d.labels || [];
    if(d.pts) pts = d.pts;
    else if(d.sides){
      var c = d.sides.AB, a = d.sides.BC, b = d.sides.CA;
      var cx = (b * b + c * c - a * a) / (2 * c);
      var cy = Math.sqrt(Math.max(0, b * b - cx * cx));
      pts = [[0, 0], [c, 0], [cx, cy]];
    } else return "";
    var f = fit(pts, 300, 230, 34);
    var P = pts.map(function(p){ return [f.X(p[0]), f.Y(p[1])]; });
    S += svgOpen(300, 230);
    S += poly(P);
    P.forEach(function(p, i){
      if(labels[i]) S += text(p[0] + (i === 0 ? -14 : 8), p[1] + (i === 2 ? -8 : 16), labels[i]);
    });
    // side lengths
    var sl = d.sideLabels || {};
    if(d.sides){
      sl = {AB: String(d.sides.AB), BC: String(d.sides.BC), CA: String(d.sides.CA)};
    }
    [["AB", 0, 1], ["BC", 1, 2], ["CA", 2, 0]].forEach(function(s){
      if(sl[s[0]]) S += text((P[s[1]][0] + P[s[2]][0]) / 2, (P[s[1]][1] + P[s[2]][1]) / 2, sl[s[0]], "dg-t dg-c");
    });
    // angle values
    if(d.angles){
      var an = d.angles;
      ["A", "B", "C"].forEach(function(v, i){
        if(an[v]) S += text(P[i][0] + (i === 0 ? 12 : i === 1 ? -26 : -8), P[i][1] + (i === 2 ? 16 : -12), an[v], "dg-t");
      });
    }
    // right-angle mark
    if(d.right){
      var ri = {A: 0, B: 1, C: 2}[d.right];
      if(ri !== undefined){
        var v0 = P[ri], v1 = P[(ri + 1) % 3], v2 = P[(ri + 2) % 3];
        var u1 = [v1[0] - v0[0], v1[1] - v0[1]], u2 = [v2[0] - v0[0], v2[1] - v0[1]];
        var l1 = Math.hypot(u1[0], u1[1]) || 1, l2 = Math.hypot(u2[0], u2[1]) || 1;
        var m = 14;
        var q1 = [v0[0] + u1[0] / l1 * m, v0[1] + u1[1] / l1 * m];
        var q2 = [v0[0] + u2[0] / l2 * m, v0[1] + u2[1] / l2 * m];
        var q3 = [q1[0] + u2[0] / l2 * m, q1[1] + u2[1] / l2 * m];
        S += el("polyline", {points: q1[0].toFixed(1) + "," + q1[1].toFixed(1) + " " + q3[0].toFixed(1) + "," + q3[1].toFixed(1) + " " + q2[0].toFixed(1) + "," + q2[1].toFixed(1), "class": "dg", fill: "none"});
      }
    }
    S += svgClose();
    return S;
  }
  // ---- Quadrilateral ----
  if(d.type === "quad"){
    var qpts, qlabels = d.labels || [];
    if(d.pts) qpts = d.pts;
    else if(d.kind === "rectangle") qpts = [[0, 0], [d.w, 0], [d.w, d.h], [0, d.h]];
    else if(d.kind === "square") qpts = [[0, 0], [d.s, 0], [d.s, d.s], [0, d.s]];
    else if(d.kind === "parallelogram"){
      var th = (d.angle || 60) * Math.PI / 180;
      var dx = d.side * Math.cos(th), dy = d.side * Math.sin(th);
      qpts = [[0, 0], [d.base, 0], [d.base + dx, dy], [dx, dy]];
    }
    else if(d.kind === "rhombus"){
      var th2 = (d.angle || 60) * Math.PI / 180;
      var dx2 = d.side * Math.cos(th2), dy2 = d.side * Math.sin(th2);
      qpts = [[0, 0], [d.side, 0], [d.side + dx2, dy2], [dx2, dy2]];
    } else return "";
    var f2 = fit(qpts, 300, 230, 34);
    var Q = qpts.map(function(p){ return [f2.X(p[0]), f2.Y(p[1])]; });
    S += svgOpen(300, 230);
    S += poly(Q);
    Q.forEach(function(p, i){
      if(qlabels[i]) S += text(p[0] + (i === 0 ? -14 : 8), p[1] + (i === 2 ? -8 : 16), qlabels[i]);
    });
    var sl2 = d.sideLabels || {};
    if(d.kind === "rectangle") sl2 = {AB: String(d.w), BC: String(d.h)};
    if(d.kind === "square") sl2 = {AB: String(d.s)};
    if(d.kind === "parallelogram") sl2 = {AB: String(d.base), BC: String(d.side)};
    if(d.kind === "rhombus") sl2 = {AB: String(d.side)};
    [["AB", 0, 1], ["BC", 1, 2], ["CD", 2, 3], ["DA", 3, 0]].forEach(function(s){
      if(sl2[s[0]]) S += text((Q[s[1]][0] + Q[s[2]][0]) / 2, (Q[s[1]][1] + Q[s[2]][1]) / 2, sl2[s[0]], "dg-t dg-c");
    });
    S += svgClose();
    return S;
  }
  // ---- Circle ----
  if(d.type === "circle"){
    var r = d.r || 1, W3 = 300, H3 = 260, pad3 = 34;
    var RR = Math.min((W3 - 2 * pad3) / 2, (H3 - 2 * pad3) / 2);
    var CX = W3 / 2, CY = H3 / 2;
    var sc = RR / r;
    function CXx(x){ return CX + x * sc; }
    function CYy(y){ return CY - y * sc; }
    var pmap = {};
    (d.points || []).forEach(function(p){ pmap[p[0]] = [CXx(p[1]), CYy(p[2])]; });
    S += svgOpen(W3, H3);
    S += circle(CX, CY, RR);
    if(d.centre) S += point(CX, CY, d.centre);
    (d.points || []).forEach(function(p){
      var px = CXx(p[1]), py = CYy(p[2]);
      S += point(px, py, p[0]);
    });
    (d.chords || []).forEach(function(ch){
      var a = pmap[ch[0]], b = pmap[ch[1]];
      if(a && b) S += line(a[0], a[1], b[0], b[1]);
    });
    if(d.tangent && d.tangent.at && pmap[d.tangent.at]){
      var tp = pmap[d.tangent.at];
      var vx = tp[0] - CX, vy = tp[1] - CY;
      var vl = Math.hypot(vx, vy) || 1;
      var tx = -vy / vl, ty = vx / vl, TL = 70;
      S += line(tp[0] - tx * TL, tp[1] - ty * TL, tp[0] + tx * TL, tp[1] + ty * TL);
      if(d.tangent.label) S += text(tp[0] + tx * TL + 6, tp[1] + ty * TL - 6, d.tangent.label);
    }
    S += svgClose();
    return S;
  }
  // ---- Number line ----
  if(d.type === "numberline"){
    var W4 = 320, H4 = 110, L4 = 24, R4 = W4 - 24, Y4 = 58;
    var NX = function(x){ return L4 + (x - d.min) / (d.max - d.min) * (R4 - L4); };
    S += svgOpen(W4, H4);
    S += line(L4 - 8, Y4, R4 + 8, Y4, "dg-ax") + poly([[R4 + 8, Y4], [R4, Y4 - 4], [R4, Y4 + 4]], "dg-axf") + poly([[L4 - 8, Y4], [L4, Y4 - 4], [L4, Y4 + 4]], "dg-axf");
    for(var nx = Math.ceil(d.min); nx <= d.max; nx++){
      S += line(NX(nx), Y4 - 4, NX(nx), Y4 + 4, "dg");
      S += text(NX(nx) - 3, Y4 + 20, nx, "dg-tk");
    }
    (d.points || []).forEach(function(p){
      var px = NX(p.x);
      S += el("circle", {cx: px.toFixed(1), cy: Y4, r: "4.5", "class": p.open ? "dg-open" : "dg-pt"});
      if(p.label) S += text(px - 3, Y4 - 12, p.label, "dg-tk");
    });
    (d.rays || []).forEach(function(ray){
      var fx = NX(ray.from);
      var to = ray.dir === "left" ? L4 + 2 : R4 - 2;
      S += line(fx, Y4, to, Y4, "dg-ray");
      S += poly(ray.dir === "left" ? [[to, Y4], [to + 8, Y4 - 4], [to + 8, Y4 + 4]] : [[to, Y4], [to - 8, Y4 - 4], [to - 8, Y4 + 4]], "dg-rayf");
      if(ray.label) S += text((fx + to) / 2 - 10, Y4 - 22, ray.label, "dg-t");
    });
    S += svgClose();
    return S;
  }
  // ---- Generic draw ----
  if(d.type === "draw"){
    var W5 = d.w || 300, H5 = d.h || 200;
    // Expand the canvas to fit TEXT labels: a label placed below (or right of)
    // the declared height/width would otherwise be clipped by the viewBox.
    // Shapes (lines, circles, polys, arcs) are NOT grown — a big circle is
    // often drawn deliberately so only an arc shows.
    var maxTX = W5, maxTY = H5;
    (d.els || []).forEach(function(e){
      if(e.t === "text"){
        var tw = 7 * String(e.s || "").length;
        if(e.x + tw > maxTX) maxTX = e.x + tw;
        if(e.y + 4 > maxTY) maxTY = e.y + 4;
      } else if(e.t === "point" && e.label){
        var pw = 7 * String(e.label).length;
        if(e.x + 7 + pw > maxTX) maxTX = e.x + 7 + pw;
        if(e.y - 6 + 4 > maxTY) maxTY = e.y - 6 + 4;
      }
    });
    W5 = Math.ceil(maxTX) + 6;
    H5 = Math.ceil(maxTY) + 6;
    S += svgOpen(W5, H5);
    (d.els || []).forEach(function(e){
      if(e.t === "line") S += line(e.x1, e.y1, e.x2, e.y2);
      else if(e.t === "circle") S += circle(e.cx, e.cy, e.r);
      else if(e.t === "point") S += point(e.x, e.y, e.label || "");
      else if(e.t === "text") S += text(e.x, e.y, e.s || "");
      else if(e.t === "poly") S += poly(e.pts.map(function(p){ return [p[0], p[1]]; }));
      else if(e.t === "arc"){
        var a1 = e.a1 * Math.PI / 180, a2 = e.a2 * Math.PI / 180;
        var sx = e.cx + e.r * Math.cos(a1), sy = e.cy + e.r * Math.sin(a1);
        var ex = e.cx + e.r * Math.cos(a2), ey = e.cy + e.r * Math.sin(a2);
        var large = (e.a2 - e.a1) > 180 ? 1 : 0;
        S += el("path", {d: "M " + sx.toFixed(1) + " " + sy.toFixed(1) + " A " + e.r + " " + e.r + " 0 " + large + " 1 " + ex.toFixed(1) + " " + ey.toFixed(1), "class": "dg", fill: "none"});
      }
    });
    S += svgClose();
    return S;
  }
  return "";
}
function mathUnitHtml(n){
  var data = matData;
  var mx = (data && data.mathsolutions) || [];
  var u = null;
  mx.forEach(function(x){ if(x.unit === n) u = x; });
  if(!u) return "<p class=\"note\">Exercise solutions for this unit will be added here.</p>";
  var html = "";
  html += "<div class=\"pro-toc\"><div class=\"pro-toc-title\">In this unit</div>";
  (u.exercises || []).forEach(function(g, i){
    html += "<button class=\"pro-toc-row\" onclick=\"jumpMathEx(" + n + "," + (i + 1) + ")\"><b>" + escHtml(g.label.replace(/^Exercise\s+/, "").replace(/^Review Exercise$/, "Review")) + "</b> \u2014 " + (g.items || []).length + " questions</button>";
  });
  html += "</div>";
  (u.exercises || []).forEach(function(g, i){
    html += "<div class=\"review\" id=\"mx-" + n + "-" + (i + 1) + "\"><div class=\"exhead mathex\"><b>" + escHtml(g.label) + "</b></div>";
    (g.items || []).forEach(function(it, qi){
      html += "<p class=\"note pro-q\">" + proQHtml(qi, ltrGuideLines(tableHtml(mathHtml(it.q)))) + "</p>" + (it.dq ? diagramSvg(it.dq) : "") + "<p class=\"note exans pro-a\"><span class=\"exa\">Ans:</span> " + ltrGuideLines(tableHtml(mathHtml(it.a))) + "</p>" + (it.da ? diagramSvg(it.da) : "");
    });
    html += "</div>";
  });
  return html;
}
// Jump to one exercise of a Maths exercise-solution unit page.
function jumpMathEx(n, m){ var el = document.getElementById("mx-" + n + "-" + m); if(el) el.scrollIntoView(); }
// Full HTML for one material section, for the dedicated page.
// Notes are shown fully expanded (every unit with its points).
function matSectionHtml(tab){
  var data = matData;
  if(!data) return "<p class=\"note\">Study material for this subject is coming soon.</p>";
  var html = "";
  if(matSubj === "English"){
    if(tab === "notes"){
      if(data.notes && data.notes.length){
        data.notes.forEach(function(n){
          html += "<div class=\"review\"><div class=\"qq\"><b>" + escHtml(n.u) + " \u2014 " + escHtml(n.t) + "</b></div>";
          (n.items || []).forEach(function(it){ html += "<p class=\"note\">" + escHtml(it) + "</p>"; });
          html += "</div>";
        });
      } else {
        html = "<p class=\"note\">Notes for this subject will be added here.</p>";
      }
      return html;
    }
    if(tab === "exsolutions"){
      var ex = data.exsolutions || [];
      if(ex.length){
        ex.forEach(function(u){
          var _t = u.title || u.display, _d = u.display || "";
          html += "<p><button class=\"modebtn\" onclick=\"openExUnit(" + (typeof u.unit === "string" ? "'" + u.unit + "'" : u.unit) + ")\">Unit " + u.unit + " \u2014 " + escHtml(_t) + ((_d && _d !== _t) ? "<br><small>" + escHtml(_d) + "</small>" : "") + "</button></p>";
        });
      } else {
        html = "<p class=\"note\">Exercise solutions for this subject will be added here.</p>";
      }
      return html;
    }
    return matTabHtml(tab);
  }
  if(tab === "exsolutions" && ((matSubj || "").indexOf("Sindhi") === 0 || (matSubj || "") === "Asan Urdu" || (matSubj || "") === "Urdu Salees" || (matSubj || "") === "Gulzar-E-Urdu" || ((matSubj || "").indexOf("Science") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Science") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Social Studies") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Social Studies") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Islamiat") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Islamiat") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Pakistan Studies") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Pakistan Studies") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Chemistry") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Chemistry") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Physics") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Physics") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Biology") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("Biology") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Computer Science") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("Computer Science") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("General Knowledge") === 0 && (matSubj || "").indexOf("Sindhi") >= 0) || ((matSubj || "").indexOf("General Knowledge") === 0 && (matSubj || "").indexOf("English") >= 0) || ((matSubj || "").indexOf("General Knowledge") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Islamiat") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Science") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Social Studies") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Pakistan Studies") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Chemistry") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Physics") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Biology") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || ((matSubj || "").indexOf("Computer Science") === 0 && (matSubj || "").indexOf("Urdu") >= 0) || (matSubj || "") === "Urdu" || (matSubj || "") === "Asan Sindhi")){
    var sx = data.exsolutions || [];
    if(sx.length){
      sx.forEach(function(u){
        html += "<p><button class=\"modebtn\" onclick=\"openExUnit(" + (typeof u.unit === "string" ? "'" + u.unit + "'" : u.unit) + ")\">Unit " + u.unit + " \u2014 " + escHtml(u.display) + "</button></p>";
      });
    } else {
      html = "<p class=\"note\">Exercise solutions for this subject will be added here.</p>";
    }
    return html;
  }
  if(tab === "exsolutions" && (matSubj || "").indexOf("Mathematics") === 0){
    var mx = data.mathsolutions || [];
    if(mx.length){
      mx.forEach(function(u){
        html += "<p><button class=\"modebtn\" onclick=\"openMathUnit(" + u.unit + ")\">Unit " + u.unit + " \u2014 " + escHtml(u.display) + "</button></p>";
      });
    } else {
      html = "<p class=\"note\">Exercise solutions for this subject will be added here.</p>";
    }
    return html;
  }
  if(tab === "definitions"){
    var defs = (data.definitions || []).filter(function(d){ return d.s === matSubj; });
    if(defs.length){
      defs.forEach(function(d){ html += "<p class=\"note\"><b>" + escHtml(d.t) + ":</b> " + escHtml(d.d) + "</p>"; });
    } else {
      html = "<p class=\"note\">Study material for this subject is coming soon.</p>";
    }
    return html;
  }
  if(tab === "notes"){
    var notes = (data.notes || []).filter(function(x){ return x.s === matSubj; });
    if(notes.length){
      notes.forEach(function(n){
        html += "<div class=\"review\"><div class=\"qq\"><b>" + escHtml(n.u) + " \u2014 " + escHtml(n.t) + "</b></div>";
        (n.items || []).forEach(function(it){ html += "<p class=\"note\">" + escHtml(it) + "</p>"; });
        html += "</div>";
      });
    } else {
      html = "<p class=\"note\">Notes for this subject will be added here.</p>";
    }
    return html;
  }
  return "";
}
// Search within the open material page.
function filterMatPage(){
  var inp = document.getElementById("matSearchPage");
  var box = document.getElementById("matcontent");
  if(!inp || !box) return;
  var q = inp.value.trim().toLowerCase();
  Array.prototype.forEach.call(box.children, function(ch){
    if(ch.classList && ch.classList.contains("pro-toc")){ ch.style.display = ""; return; }
    var show = !q || ch.textContent.toLowerCase().indexOf(q) > -1;
    ch.style.display = show ? "" : "none";
  });
}
function matPanelMatches(panel, q){
  var any = false;
  Array.prototype.forEach.call(panel.children, function(ch){
    if(ch.classList && (ch.classList.contains("matpanel") || ch.classList.contains("matsec"))) return;
    var show = !q || ch.textContent.toLowerCase().indexOf(q) > -1;
    ch.style.display = show ? "" : "none";
    if(show) any = true;
  });
  return any;
}
function filterMaterial(){
  var inp = document.getElementById('matSearch'); if(!inp) return;
  var q = inp.value.trim().toLowerCase();
  var data = matData || STUDY.x;
  // note-unit panels (inside the notes tab)
  var noteAny = false;
  if(data && data.notes){
    data.notes.forEach(function(n, i){
      var p = document.getElementById("notepanel-" + i);
      if(!p) return;
      var any = matPanelMatches(p, q);
      p.style.display = (q ? any : (matNoteOpen && matNoteUnit === i)) ? "" : "none";
      var b = document.getElementById("notetab-" + i);
      if(b && b.parentNode) b.parentNode.style.display = (q ? any : true) ? "" : "none";
      if(any) noteAny = true;
    });
  }
  // English material tabs
  matTabs.forEach(function(t){
    var p = document.getElementById("matpanel-" + t[0]); if(!p) return;
    var any = matPanelMatches(p, q);
    if(t[0] === "notes") any = any || noteAny;
    p.style.display = (q ? any : (matOpen && matTab === t[0])) ? "" : "none";
  });
  // other subjects: definitions / notes tabs
  ["definitions", "notes"].forEach(function(t){
    var p = document.getElementById("subpanel-" + t); if(!p) return;
    var any = matPanelMatches(p, q);
    p.style.display = (q ? any : (matSubOpen && matSubTab === t)) ? "" : "none";
  });
}
