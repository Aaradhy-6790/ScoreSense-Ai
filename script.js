(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const KEYS = { users: "scoresense_users_v1", session: "scoresense_session_v1", theme: "scoresense_theme_v1" };
  const quotes = ["Consistency beats motivation.","Every mock test is feedback.","Small steps, repeated daily, create remarkable change.","Progress is built one focused session at a time.","Your next score starts with your next decision.","Don't just count the hours. Make the hours count."];
  const subjectMap = {
    "JEE Main": ["Physics","Chemistry","Mathematics"], "JEE Advanced": ["Physics","Chemistry","Mathematics"], "JEE Main + Advanced": ["Physics","Chemistry","Mathematics"],
    "NEET": ["Physics","Chemistry","Biology"], "Boards": ["Physics","Chemistry","Maths","English"]
  };
  const chapterMap = {
    "Class 11": {Physics:["Kinematics","Newton's Laws of Motion","Work, Power & Energy","Rotational Motion","Gravitation"],Chemistry:["Mole Concept","Atomic Structure","Chemical Bonding","Thermodynamics"],Mathematics:["Trigonometry","Sets & Relations","Functions","Sequence & Series"],Maths:["Trigonometry","Sets & Relations","Functions","Sequence & Series"],Biology:["Cell: The Unit of Life","Biomolecules","Plant Physiology"],English:["Reading Comprehension","Writing Skills"]},
    "Class 12": {Physics:["Electrostatics","Current Electricity","Magnetism","Optics","Modern Physics"],Chemistry:["Solutions","Electrochemistry","Chemical Kinetics","Coordination Compounds"],Mathematics:["Applications of Derivatives","Integrals","Probability","Vectors"],Maths:["Applications of Derivatives","Integrals","Probability","Vectors"],Biology:["Genetics","Human Reproduction","Biotechnology"],English:["Reading Comprehension","Writing Skills"]},
    "Foundation": {Physics:["Motion","Force & Laws of Motion","Work & Energy","Light"],Chemistry:["Matter","Atoms & Molecules","Structure of Atom"],Mathematics:["Number Systems","Polynomials","Trigonometry"],Maths:["Number Systems","Polynomials","Trigonometry"],Biology:["Life Processes","Cell Biology"],English:["Grammar","Reading Comprehension"]},
    "Dropper": {Physics:["Mechanics","Electrostatics","Current Electricity","Optics"],Chemistry:["Physical Chemistry","Chemical Bonding","Organic Chemistry"],Mathematics:["Calculus","Coordinate Geometry","Algebra"],Maths:["Calculus","Coordinate Geometry","Algebra"],Biology:["Genetics","Human Physiology","Ecology"],English:["Reading Comprehension"]}
  };
  let user = null, chart = null, authMode = "signup", toastTimer = null;
  const defaultGoals = () => [{id:crypto.randomUUID(),text:"Revise one important concept",done:false},{id:crypto.randomUUID(),text:"Solve 20 practice questions",done:false},{id:crypto.randomUUID(),text:"Analyze mistakes from a test",done:false}];
  const today = () => new Date().toISOString().slice(0,10);
  const safeParse = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
  const getUsers = () => safeParse(localStorage.getItem(KEYS.users), {});
  const saveUsers = users => localStorage.setItem(KEYS.users, JSON.stringify(users));
  const persist = () => { if (!user) return; const users=getUsers(); users[user.name.toLowerCase()]=user; saveUsers(users); };
  const showToast = message => { const el=$("#toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600); };
  const showView = view => { ["landingView","authView","appView"].forEach(id=>$("#"+id).classList.toggle("hidden",id!==view)); };
  const randomQuote = () => quotes[Math.floor(Math.random()*quotes.length)];
  const updateQuote = () => { $("#dashboardQuote").textContent=randomQuote(); $("#landingQuote").textContent=randomQuote(); };
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const subjectsForUser = () => subjectMap[user.exam] || subjectMap["JEE Main"];
  const chaptersForUser = () => { const stage=chapterMap[user.stage]||chapterMap["Class 11"]; return subjectsForUser().flatMap(subject=>(stage[subject]||[]).map(chapter=>({subject,chapter}))); };

  function setTheme(theme) { document.body.classList.toggle("light",theme==="light"); localStorage.setItem(KEYS.theme,theme); $$("[data-theme-toggle]").forEach(btn=>{const label=$("span",btn); if(label)label.textContent=theme==="light"?"Dark mode":"Light mode";}); if(chart) chart.update(); }
  function setAuthMode(mode) { authMode=mode; $("#authTitle").textContent=mode==="signup"?"Create your account.":"Welcome back."; $("#authSubtitle").textContent=mode==="signup"?"A clearer picture of your progress begins with you.":"Pick up where your progress left off."; $("#authSubmit").innerHTML=mode==="signup"?'Create account <span>→</span>':'Log in <span>→</span>'; $("#authSwitchText").textContent=mode==="signup"?"Already have an account?":"New to ScoreSense AI?"; $("#switchAuth").textContent=mode==="signup"?"Log in":"Create account"; $("#authPassword").autocomplete=mode==="signup"?"new-password":"current-password"; }
  function startAuth() { setAuthMode("signup"); showView("authView"); $("#authName").focus(); }
  function login(name,password) {
    const users=getUsers(), key=name.trim().toLowerCase();
    if(!key || password.length<4) return showToast("Enter your name and a password with at least 4 characters.");
    if(authMode==="signup" && users[key]) return showToast("That name already has an account. Please log in.");
    if(authMode==="login" && (!users[key] || users[key].password!==password)) return showToast("Account not found or password doesn't match.");
    if(authMode==="signup") { user={name:name.trim(),password,stage:"Class 11",exam:"JEE Main",target:220,tests:[],goals:defaultGoals(),completedDates:[],createdAt:new Date().toISOString()}; users[key]=user; saveUsers(users); }
    else user=users[key];
    localStorage.setItem(KEYS.session,key); showApp(); showToast("Welcome to ScoreSense, "+user.name+"!");
  }
  function showApp() { if(!user)return; showView("appView"); $("#headerName").textContent=user.name; $("#profileInitial").textContent=user.name.charAt(0).toUpperCase(); $("#todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}); renderDashboard(); navigate("overview"); }
  function navigate(page) { const names={overview:"Overview",tests:"My tests",planner:"Daily goals"}; Object.keys(names).forEach(key=>$("#"+key+"Page").classList.toggle("hidden",key!==page)); $$(".side-link[data-page]").forEach(btn=>btn.classList.toggle("active",btn.dataset.page===page)); $("#breadcrumbPage").textContent=names[page]||"Overview"; $("#sidebar").classList.remove("open"); if(page==="overview") { setTimeout(renderChart,40); } }
  function renderDashboard() {
    $("#welcomeTitle").innerHTML=`Good ${new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, ${escapeHTML(user.name)} <span>✦</span>`;
    $("#targetScoreValue").textContent=user.target; $("#targetTotal").textContent=user.target; $("#examLabel").textContent=user.stage+" · "+user.exam; $("#streakValue").textContent=calculateStreak(); $("#plannerStreak").textContent=calculateStreak();
    const sorted=[...(user.tests||[])].sort((a,b)=>a.date.localeCompare(b.date)); const latest=sorted.at(-1); const current=latest?latest.score:0; const percent=user.target?Math.min(100,Math.round(current/user.target*100)):0;
    $("#latestScoreValue").textContent=latest?latest.score:"—"; $("#latestTestLabel").textContent=latest?latest.name:"Add your first test"; $("#trendPill").textContent=sorted.length>1?(current>=sorted.at(-2).score?"↗ UP":"↘ DOWN"):"START";
    $("#targetProgressValue").textContent=percent+"%"; $("#marksRemaining").textContent=latest?Math.max(0,user.target-current)+" marks to target":"Add a test to begin"; $("#targetProgressBar").style.width=percent+"%";
    $("#targetCurrent").textContent=current; $("#targetPercentText").textContent=percent+"% completed"; $("#needMarks").textContent=Math.max(0,user.target-current)+" to go"; $("#largeProgressBar").style.width=percent+"%";
    $("#leaksList").innerHTML=renderLeaks(); $("#goalPreview").innerHTML=(user.goals||[]).slice(0,3).map(g=>`<label class="goal-item ${g.done?"done":""}"><input type="checkbox" data-goal="${g.id}" ${g.done?"checked":""}><span>${escapeHTML(g.text)}</span></label>`).join("")||'<div class="empty-state">No goals yet. Add one in Daily goals.</div>';
    $("#goalPreview").querySelectorAll("[data-goal]").forEach(input=>input.addEventListener("change",()=>toggleGoal(input.dataset.goal,input.checked)));
    renderTests(); renderGoals(); renderChart();
  }
  function renderLeaks() {
    const totals={}; (user.tests||[]).forEach(test=>(test.leaks||[]).forEach(leak=>{if(leak.chapter && leak.marks>0)totals[leak.chapter]=(totals[leak.chapter]||0)+leak.marks;}));
    const rows=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,4); if(!rows.length)return '<div class="empty-state">Add chapter-level test analysis to see where marks may be slipping.</div>';
    const max=rows[0][1]; return rows.map(([chapter,marks])=>`<div class="leak-row"><b>${escapeHTML(chapter)}</b><span>${marks} marks noted</span><div class="leak-track"><i style="width:${Math.max(8,marks/max*100)}%"></i></div></div>`).join("");
  }
  function renderChart() {
    const canvas=$("#scoreChart"); if(!canvas)return; const tests=[...(user?.tests||[])].sort((a,b)=>a.date.localeCompare(b.date)); const empty=$("#chartEmpty");
    if(!tests.length){empty.classList.add("visible"); if(chart){chart.destroy();chart=null;}return;} empty.classList.remove("visible");
    if(typeof Chart==="undefined"){empty.classList.add("visible");empty.textContent="Chart.js needs an internet connection to load.";return;}
    const css=getComputedStyle(document.body), textColor=css.getPropertyValue("--muted").trim(), grid=css.getPropertyValue("--line").trim();
    if(chart)chart.destroy();
    chart=new Chart(canvas,{type:"line",data:{labels:tests.map(t=>new Date(t.date+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})),datasets:[{label:"Score",data:tests.map(t=>t.score),borderColor:"#7694ff",backgroundColor:"rgba(105,139,255,.13)",fill:true,tension:.36,borderWidth:2.5,pointRadius:4,pointBackgroundColor:"#67d9e6",pointBorderColor:css.getPropertyValue("--surface").trim(),pointBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#18243b",padding:11,displayColors:false,titleFont:{family:"DM Sans"},bodyFont:{family:"DM Sans"}}},scales:{x:{grid:{display:false},ticks:{color:textColor,font:{size:10}}},y:{beginAtZero:true,grid:{color:grid},ticks:{color:textColor,font:{size:10},precision:0}}}}});
  }
  function renderTests() {
    const tests=[...(user.tests||[])].sort((a,b)=>b.date.localeCompare(a.date)); $("#testCount").textContent=tests.length+" TEST"+(tests.length===1?"":"S");
    $("#testsList").innerHTML=tests.length?tests.map(t=>`<div class="test-row"><div class="test-main"><b>${escapeHTML(t.name)}</b><span>${new Date(t.date+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</span></div><div class="test-score">${t.score}<small> / ${t.max}</small></div><div class="test-meta">${Math.round(t.score/t.max*100)}% score</div><div class="test-type">${escapeHTML(t.type)}</div><button class="delete-test" data-delete-test="${t.id}" aria-label="Delete ${escapeHTML(t.name)}">×</button></div>`).join(""):'<div class="empty-state">No tests yet. Add your latest mock test to start tracking progress.</div>';
    $$("[data-delete-test]").forEach(btn=>btn.addEventListener("click",()=>{if(confirm("Delete this test result?")){user.tests=user.tests.filter(t=>t.id!==btn.dataset.deleteTest);persist();renderDashboard();showToast("Test removed.");}}));
  }
  function calculateStreak() {
    const dates=[...new Set(user.completedDates||[])].sort().reverse(); if(!dates.length)return 0;
    let cursor=new Date(today()+"T12:00:00"), first=new Date(dates[0]+"T12:00:00");
    if(Math.round((cursor-first)/86400000)>1)return 0;
    let count=0; for(const date of dates){const expected=new Date(cursor);expected.setDate(cursor.getDate()-count);if(date===expected.toISOString().slice(0,10))count++;else if(date<expected.toISOString().slice(0,10))break;} return count;
  }
  function renderGoals() {
    const goals=user.goals||[]; $("#plannerDate").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}); $("#goalCompletion").textContent=goals.filter(g=>g.done).length+" / "+goals.length+" DONE";
    $("#goalsList").innerHTML=goals.length?goals.map(g=>`<div class="goal-row ${g.done?"done":""}"><input type="checkbox" data-goal="${g.id}" ${g.done?"checked":""} aria-label="Complete goal"><span>${escapeHTML(g.text)}</span><button class="goal-delete" data-delete-goal="${g.id}" aria-label="Delete goal">×</button></div>`).join(""):'<div class="empty-state">No goals yet. Add one small action above.</div>';
    $$("[data-goal]",$("#goalsList")).forEach(input=>input.addEventListener("change",()=>toggleGoal(input.dataset.goal,input.checked)));
    $$("[data-delete-goal]").forEach(btn=>btn.addEventListener("click",()=>{user.goals=user.goals.filter(g=>g.id!==btn.dataset.deleteGoal);persist();renderGoals();renderDashboard();}));
    $("#plannerStreak").textContent=calculateStreak(); $("#streakValue").textContent=calculateStreak();
  }
  function toggleGoal(id,done) { const goal=user.goals.find(g=>g.id===id); if(!goal)return; goal.done=done; if(done){if(!user.completedDates.includes(today()))user.completedDates.push(today());}else if(!user.goals.some(g=>g.done))user.completedDates=user.completedDates.filter(d=>d!==today()); persist(); renderGoals(); renderDashboard(); }
  function populateChapterSuggestions(){
    const datalist=$("#chapterSuggestions");
    if(!datalist)return;
    datalist.innerHTML=chaptersForUser().map(item=>`<option value="${escapeHTML(item.chapter)}">${escapeHTML(item.subject)}</option>`).join("");
  }
  function openModal(id){$("#"+id).classList.remove("hidden");} function closeModals(){$$(".modal-backdrop").forEach(m=>m.classList.add("hidden"));}
  function openProfile(){ $("#profileName").value=user.name; $("#profileClass").value=user.stage; $("#profileExam").value=user.exam; $("#profileTarget").value=user.target; openModal("profileModal"); }
  function addLeakInput(){const row=document.createElement("div");row.className="extra-leak-row";row.innerHTML='<input placeholder="Chapter / topic" maxlength="50" aria-label="Chapter name"><input type="number" min="0" placeholder="Marks lost" aria-label="Marks lost"><button type="button" aria-label="Remove chapter">×</button>';row.querySelector("button").addEventListener("click",()=>row.remove());$("#extraLeaks").append(row);}
  function collectLeaks(){const leaks=[];const chapter=$("#leakChapter").value.trim(),marks=Number($("#leakMarks").value);if(chapter&&marks>0)leaks.push({chapter,marks});$$(".extra-leak-row",$("#extraLeaks")).forEach(row=>{const inputs=$$("input",row);if(inputs[0].value.trim()&&Number(inputs[1].value)>0)leaks.push({chapter:inputs[0].value.trim(),marks:Number(inputs[1].value)});});return leaks;}
  function resetTestForm(){ $("#testForm").reset();$("#testDate").value=today();$("#testMax").value=300;$("#extraLeaks").innerHTML=""; }
  function init() {
    setTheme(localStorage.getItem(KEYS.theme)||"dark"); updateQuote();
    $("#navGetStarted").addEventListener("click",startAuth);$("#heroGetStarted").addEventListener("click",startAuth);$("#backToLanding").addEventListener("click",()=>showView("landingView"));
    $("#switchAuth").addEventListener("click",()=>setAuthMode(authMode==="signup"?"login":"signup"));
    $("#authForm").addEventListener("submit",e=>{e.preventDefault();login($("#authName").value,$("#authPassword").value);});
    $("#demoLogin").addEventListener("click",()=>{const name=$("#authName").value.trim()||"Demo Student";const users=getUsers();if(!users[name.toLowerCase()]){users[name.toLowerCase()]={name,password:"demo1234",stage:"Class 11",exam:"JEE Main",target:220,tests:[{id:"sample1",name:"Mock Test 1",date:"2026-10-10",type:"Full Test",score:145,max:300,leaks:[{chapter:"Trigonometry",marks:8},{chapter:"Mole Concept",marks:5}]},{id:"sample2",name:"Mock Test 2",date:"2026-10-24",type:"Full Test",score:162,max:300,leaks:[{chapter:"Electrostatics",marks:7},{chapter:"Trigonometry",marks:5}]},{id:"sample3",name:"Mock Test 3",date:"2026-11-08",type:"Full Test",score:177,max:300,leaks:[{chapter:"Trigonometry",marks:6},{chapter:"Electrostatics",marks:4}]}],goals:defaultGoals(),completedDates:[]};saveUsers(users);} user=users[name.toLowerCase()];localStorage.setItem(KEYS.session,name.toLowerCase());showApp();showToast("Demo workspace loaded.");});
    $$("[data-theme-toggle]").forEach(btn=>btn.addEventListener("click",()=>setTheme(document.body.classList.contains("light")?"dark":"light")));
    $$(".side-link[data-page]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $("#logoutButton").addEventListener("click",()=>{persist();localStorage.removeItem(KEYS.session);user=null;showView("landingView");showToast("You have logged out.");});
    $("#editProfileButton").addEventListener("click",openProfile);$("#editTarget").addEventListener("click",openProfile);
    $("#profileForm").addEventListener("submit",e=>{e.preventDefault();user.name=$("#profileName").value.trim();user.stage=$("#profileClass").value;user.exam=$("#profileExam").value;user.target=Number($("#profileTarget").value);persist();closeModals();showApp();showToast("Profile updated.");});
    const openTest=()=>{resetTestForm();populateChapterSuggestions();openModal("testModal");};$("#createTestTop").addEventListener("click",openTest);$("#createTestButton").addEventListener("click",openTest);$("#chartCreateTest").addEventListener("click",openTest);$("#addLeak").addEventListener("click",addLeakInput);
    $("#testForm").addEventListener("submit",e=>{e.preventDefault();const score=Number($("#testScore").value),max=Number($("#testMax").value);if(score>max){showToast("Score cannot be greater than maximum marks.");return;}user.tests.push({id:crypto.randomUUID(),name:$("#testName").value.trim(),date:$("#testDate").value,type:$("#testType").value,score,max,leaks:collectLeaks()});persist();closeModals();renderDashboard();showToast("Test result saved. Keep learning!");});
    $("#goalForm").addEventListener("submit",e=>{e.preventDefault();const text=$("#goalInput").value.trim();if(!text)return;user.goals.push({id:crypto.randomUUID(),text,done:false});persist();$("#goalInput").value="";renderGoals();renderDashboard();});
    $("#newQuote").addEventListener("click",()=>{$("#dashboardQuote").textContent=randomQuote();});
    $$("[data-page]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.page)));
    $$("[data-close-modal]").forEach(btn=>btn.addEventListener("click",closeModals));$$(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModals();}));document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals();});
    $("#testDate").value=today();
    const session=localStorage.getItem(KEYS.session), users=getUsers();if(session&&users[session]){user=users[session];showApp();}else showView("landingView");
  }
  init();
})();