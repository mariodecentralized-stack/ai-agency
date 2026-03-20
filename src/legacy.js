
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://aibymario.com/#organization",
      "name": "AgentCy",
      "url": "https://aibymario.com",
      "email": "hello@aibymario.com",
      "description": "Done-for-you AI automations for growing businesses — chatbots, lead follow-up, voice AI, content pipelines and more.",
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "@id": "https://aibymario.com/#website",
      "url": "https://aibymario.com",
      "name": "AgentCy",
      "publisher": { "@id": "https://aibymario.com/#organization" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do I need to know anything about AI or tech?",
          "acceptedAnswer": { "@type": "Answer", "text": "Not at all. We handle 100% of the technical setup. You just describe your business and what you want to solve — we build everything. You'll get a plain-English walkthrough at the end." }
        },
        {
          "@type": "Question",
          "name": "How long does it take to go live?",
          "acceptedAnswer": { "@type": "Answer", "text": "Most projects go live within 7–14 business days from your discovery call. The Scale package takes up to 21 days. You'll receive regular progress updates throughout the build." }
        },
        {
          "@type": "Question",
          "name": "What if it doesn't work for my business?",
          "acceptedAnswer": { "@type": "Answer", "text": "We offer a 30-day results guarantee. If the system doesn't perform as promised after we've worked to fix it, we'll refund your full setup fee. No questions asked." }
        },
        {
          "@type": "Question",
          "name": "What tools do you use — and do I pay for them?",
          "acceptedAnswer": { "@type": "Answer", "text": "We use Make, n8n, Claude API, Voiceflow, Vapi, GoHighLevel, and others. Some have free tiers; most cost $20–$100/month. We give you the full cost breakdown before we start." }
        },
        {
          "@type": "Question",
          "name": "Can I add more automations later?",
          "acceptedAnswer": { "@type": "Answer", "text": "Absolutely — most clients start with one and add more after seeing results. Existing clients get discounted rates on all additional automations added to their retainer." }
        },
        {
          "@type": "Question",
          "name": "What types of businesses do you work with?",
          "acceptedAnswer": { "@type": "Answer", "text": "Clinics, gyms, restaurants, real estate agencies, coaches, marketing agencies, and e-commerce brands. If you have repetitive tasks and customer touchpoints, we can automate them." }
        }
      ]
    }
  ]
}



/* ── REDUCED MOTION ── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── BACK TO TOP LOGIC ── */
const backToTopBtn = document.getElementById('back-to-top');
if(backToTopBtn) {
  window.addEventListener('scroll', () => {
    if(window.scrollY > window.innerHeight * 0.5) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, {passive:true});
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── NAV SCROLL ── */
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('stuck',scrollY>30);
},{passive:true});

/* ── MOBILE MENU ── */
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
toggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.textContent = open ? '✕' : '☰';
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  });
});

/* ── SCROLL REVEAL ── */
if (!prefersReducedMotion) {
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  },{threshold:0.08});
  document.querySelectorAll('[data-s],[data-stagger]').forEach(el=>io.observe(el));
  
  // Timeline Fill Scroll Logic
  const timeline = document.getElementById('process-timeline');
  const fill = document.getElementById('timeline-fill');
  const stepNodes = document.querySelectorAll('.step-node');
  
  if (timeline && fill) {
    window.addEventListener('scroll', () => {
      const rect = timeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Start filling when timeline enters bottom third of screen
      const startTrigger = viewportHeight * 0.7;
      
      let progress = 0;
      if (rect.top < startTrigger) {
        const totalDist = rect.height;
        const currentDist = startTrigger - rect.top;
        progress = Math.min(Math.max((currentDist / totalDist) * 100, 0), 100);
      }
      fill.style.height = progress + '%';
      
      // Highlight dots
      stepNodes.forEach(node => {
        const nRect = node.getBoundingClientRect();
        if (nRect.top < startTrigger) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      });
    }, {passive:true});
  }
} else {
  document.querySelectorAll('[data-s],[data-stagger]').forEach(el=>el.classList.add('vis'));
}

/* ── COUNTER ── */
function countUp(el, target, suffix, duration, dollar){
  if (!el) return;
  if (prefersReducedMotion) {
    el.textContent=(dollar?'$':'')+target.toLocaleString()+(suffix||'');
    return;
  }
  let start=null;
  const step=ts=>{
    if(!start) start=ts;
    const p=Math.min((ts-start)/duration,1);
    const ease=1-Math.pow(1-p,4);
    const val=Math.round(target*ease);
    el.textContent=(dollar?'$':'')+val.toLocaleString()+(suffix||'');
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const mObs=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){
    countUp(document.getElementById('m1'),20,'+',1600);
    countUp(document.getElementById('m2'),90,'%',1100);
    countUp(document.getElementById('m3'),60,'s',1300);
    countUp(document.getElementById('m4'),7,'',900);
    mObs.disconnect();
  }
},{threshold:0.4});
const metricsEl=document.querySelector('.metrics');
if(metricsEl) mObs.observe(metricsEl);

/* ── SUMMON AI WIDGET LOGIC ── */
const widgetToggle = document.getElementById('ai-widget-toggle');
const widgetPanel = document.getElementById('ai-widget-panel');
const widgetClose = document.getElementById('ai-widget-close');
const widgetMessages = document.getElementById('ai-widget-messages');
const widgetContainer = document.getElementById('ai-widget-container');

let widgetOpen = false;
let widgetInitialized = false;

widgetToggle.addEventListener('click', () => {
  widgetOpen = !widgetOpen;
  if(widgetOpen) {
    widgetPanel.classList.add('open');
    widgetContainer.setAttribute('aria-hidden', 'false');
    if(!widgetInitialized) {
      widgetInitialized = true;
      runSimulatedChat();
    }
  } else {
    widgetPanel.classList.remove('open');
    widgetContainer.setAttribute('aria-hidden', 'true');
  }
});

widgetClose.addEventListener('click', () => {
  widgetOpen = false;
  widgetPanel.classList.remove('open');
  widgetContainer.setAttribute('aria-hidden', 'true');
});

// Helper for simulated chat
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showTyping() {
  const typingId = 'typing-' + Date.now();
  const html = `<div class="chat-typing" id="${typingId}"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  widgetMessages.insertAdjacentHTML('beforeend', html);
  widgetMessages.scrollTop = widgetMessages.scrollHeight;
  return typingId;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if(el) el.remove();
}

function showThought(text) {
  const thoughtId = 'thought-' + Date.now();
  const html = `<div class="chat-thought" id="${thoughtId}">[ ${text} ]</div>`;
  widgetMessages.insertAdjacentHTML('beforeend', html);
  widgetMessages.scrollTop = widgetMessages.scrollHeight;
  return thoughtId;
}

function removeThought(id) {
  const el = document.getElementById(id);
  if(el) el.remove();
}

function addMsg(text, type='ai') {
  const html = `<div class="chat-msg ${type}">${text}</div>`;
  widgetMessages.insertAdjacentHTML('beforeend', html);
  widgetMessages.scrollTop = widgetMessages.scrollHeight;
}

function addChoices(choices, callback) {
  const wrapId = 'choices-' + Date.now();
  let html = `<div class="chat-choices" id="${wrapId}">`;
  choices.forEach((c, i) => {
    html += `<button class="chat-choice-btn" data-idx="${i}">${c}</button>`;
  });
  html += `</div>`;
  widgetMessages.insertAdjacentHTML('beforeend', html);
  widgetMessages.scrollTop = widgetMessages.scrollHeight;
  
  const wrap = document.getElementById(wrapId);
  wrap.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wrap.remove();
      const choiceText = e.target.textContent;
      addMsg(choiceText, 'user');
      callback(e.target.getAttribute('data-idx'), choiceText);
    });
  });
}

// Hardcoded chat flow
async function runSimulatedChat() {
  const th1 = showThought("Initializing agent context...");
  await sleep(600);
  removeThought(th1);
  const t1 = showTyping();
  await sleep(800);
  removeTyping(t1);
  addMsg("Hi there! I'm an example AI agent built by AgentCy. 👋");
  
  const th2 = showThought("Retrieving knowledge base...");
  await sleep(400);
  removeThought(th2);
  const t2 = showTyping();
  await sleep(800);
  removeTyping(t2);
  addMsg("I live on this page 24/7 to capture leads, answer questions, and book calls.");
  
  const t3 = showTyping();
  await sleep(600);
  removeTyping(t3);
  addMsg("How can I help you today? You can select an option or type below.");
  
  addChoices(["I want to save time", "I need more leads", "Just browsing"], async (idx) => {
    const th3 = showThought("Analyzing user intent...");
    await sleep(500);
    removeThought(th3);
    const th4 = showThought("Generating personalized response...");
    await sleep(600);
    removeThought(th4);
    
    const t4 = showTyping();
    await sleep(1000);
    removeTyping(t4);
    
    if(idx == 0) {
      addMsg("Perfect. Our clients save 20+ hours a week on average by automating emails, lead follow-ups, and admin. Want to see the packages?");
      addChoices(["Yes, take me there", "No thanks"], (idx2) => {
        if(idx2 == 0) window.location.hash = "#pricing";
      });
    } else if(idx == 1) {
      addMsg("You're in the right place. An AI agent like me can respond to every new lead in under 60 seconds, day or night. Speed to lead means more closed deals.");
      addChoices(["See services", "No thanks"], (idx2) => {
        if(idx2 == 0) window.location.hash = "#services";
      });
    } else {
      addMsg("No problem! Feel free to look around. Don't miss our packages section to see how much we can save you.");
    }
  });
}

// Custom written input handling
const chatForm = document.getElementById('ai-chat-form');
const chatInput = document.getElementById('ai-chat-input');
if(chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const txt = chatInput.value.trim();
    if(!txt) return;
    chatInput.value = '';
    
    // Remove existing choice buttons if any
    const existingChoices = document.querySelector('.chat-choices');
    if (existingChoices) existingChoices.remove();

    addMsg(txt, 'user');
    
    // Simulate AI processing
    const th1 = showThought("Analyzing query...");
    await sleep(700);
    removeThought(th1);
    
    const th2 = showThought("Searching knowledge base...");
    await sleep(600);
    removeThought(th2);
    
    const t1 = showTyping();
    await sleep(1200);
    removeTyping(t1);
    
    // Simple logic
    const lower = txt.toLowerCase();
    if(lower.includes('price') || lower.includes('cost') || lower.includes('much')) {
      addMsg("Our packages range from $997 to $4,997 for setup, depending on complexity. Want to see the full pricing breakdown?");
      addChoices(["Yes, jump to pricing", "No thanks"], (idx) => {
        if(idx == 0) window.location.hash = "#pricing";
      });
    } else if(lower.includes('service') || lower.includes('do') || lower.includes('build')) {
      addMsg("We build custom chatbots, voice AI agents, and internal automations. Ready to explore our services?");
      addChoices(["View services", "Not right now"], (idx) => {
        if(idx == 0) window.location.hash = "#services";
      });
    } else {
      addMsg("That's an excellent question! An AI agent like me can be customized to answer specifics about your business 24/7. Want to book a strategy call to discuss further?");
      addChoices(["Yes, book call", "No thanks"], (idx) => {
        if(idx == 0) window.open("https://calendly.com/mariodecentralize/30min", "_blank");
      });
    }
  });
}

const metricsEl2=document.querySelector('.metrics');
if(metricsEl2) mObs.observe(metricsEl2);

const hcObs=new IntersectionObserver(entries=>{
  if(entries[0].isIntersecting){
    countUp(document.getElementById('hc1'),20,'',1400);
    setTimeout(()=>countUp(document.getElementById('hc2'),60,'s',1200),200);
    setTimeout(()=>countUp(document.getElementById('hc3'),5800,'',1400,true),400);
    if (!prefersReducedMotion) {
      setTimeout(()=>{ document.getElementById('hb1').style.width='85%'; },600);
      setTimeout(()=>{ document.getElementById('hb2').style.width='65%'; },800);
      setTimeout(()=>{ document.getElementById('hb3').style.width='75%'; },1000);
    } else {
      document.getElementById('hb1').style.width='85%';
      document.getElementById('hb2').style.width='65%';
      document.getElementById('hb3').style.width='75%';
    }
    hcObs.disconnect();
  }
},{threshold:0.4});
const hcEl=document.querySelector('.hero-cards');
if(hcEl) hcObs.observe(hcEl);
/* ── ROI CALCULATOR LOGIC ── */
const rTeam = document.getElementById('roi-team');
const rWage = document.getElementById('roi-wage');
const rHours = document.getElementById('roi-hours');

/* ── PLAYGROUND LOGIC ── */
const pgRun = document.getElementById('pg-run-btn');
const nodes = [0,1,2,3].map(i => document.getElementById(`node-${i}`));
const lines = [1,2,3].map(i => document.getElementById(`pg-l${i}`));
const dataBoxes = [0,1,2,3].map(i => document.getElementById(`nd-${i}`));

if(pgRun) {
  pgRun.addEventListener('click', async () => {
    // Reset state
    nodes.forEach(n => { n.className = 'pg-node'; });
    lines.forEach(l => { l.className = 'pg-line-segment'; });
    pgRun.disabled = true;
    pgRun.innerHTML = 'Processing...';

    const mockData = [
      "Payload:\\n{\\n  email: 'sarah@example.com',\\n  text: 'I need pricing...'\\n}",
      "Intent: Sales Inquiry\\nAction: Draft Quote Template\\nConfidence: 98%",
      "Contact Created.\\nID: 94821\\nStatus: New Lead\\nAssigned: AI Agent",
      "Slack:\\n'New lead Sarah requesting pricing. Agent replied. View deal ->'"
    ];

    for(let i=0; i<4; i++) {
        nodes[i].classList.add('active');
        dataBoxes[i].innerHTML = mockData[i].replace(/\\n/g, '<br>');
        
        await sleep(600);
        nodes[i].classList.add('show-data');
        await sleep(1400); // let user read
        nodes[i].classList.remove('show-data');
        nodes[i].classList.replace('active', 'done');

        if(i < 3) {
            lines[i].classList.add('active');
            await sleep(600); // line animation time
            lines[i].classList.replace('active', 'done');
        }
    }

    pgRun.disabled = false;
    pgRun.innerHTML = 'Run Automation <span class="arr" aria-hidden="true">→</span>';
  });
}

const rTeamV = document.getElementById('roi-team-val');
const rWageV = document.getElementById('roi-wage-val');
const rHoursV = document.getElementById('roi-hours-val');
const rCostV = document.getElementById('roi-cost-val');
const rSaveV = document.getElementById('roi-save-val');

function calcROI() {
  const team = parseInt(rTeam.value);
  const wage = parseInt(rWage.value);
  const hours = parseInt(rHours.value);

  rTeamV.textContent = team;
  rWageV.textContent = "$" + wage + "/hr";
  rHoursV.textContent = hours + " hrs";

  // cost = team * wage * hours * 4 weeks
  const monthlyCost = team * wage * hours * 4;
  rCostV.textContent = "$" + monthlyCost.toLocaleString();

  // conservative estimate: AI handles 90% of those tasks
  const savings = Math.max(0, (monthlyCost * 0.9) - 500); // minus roughly $500/mo AI fee
  rSaveV.textContent = "$" + savings.toLocaleString();
}

[rTeam, rWage, rHours].forEach(el => {
  if(el) el.addEventListener('input', calcROI);
});
if(rTeam) calcROI();



