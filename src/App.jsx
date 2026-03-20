import React, { useEffect } from 'react';
import './index.css';

export default function App() {
  useEffect(() => {
    // Injecting legacy JS directly for phase 1 of migration
    
    
    
    
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
    
    
    
    
  }, []);

  return (
    <>
      

{/* Skip to content */}
<a href="#main" className="skip-link">Skip to main content</a>



{/* AURORA */}
<div className="aurora" aria-hidden="true">
  <div className="aurora-orb ao1"></div>
  <div className="aurora-orb ao2"></div>
  <div className="aurora-orb ao3"></div>
</div>

{/* ── BACK TO TOP BUTTON ── */}
<button id="back-to-top" className="back-to-top" aria-label="Back to top">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
</button>



{/* ── FLOATING AI WIDGET ── */}
<div id="ai-widget-container" aria-label="Simulated AI Chat Demo" role="dialog" aria-hidden="true">
  <div className="ai-widget-bubble" id="ai-widget-toggle" aria-label="Open AI Demo" role="button" tabIndex="0">
    <span className="ai-icon">🤖</span>
    <span className="ai-dot"></span>
  </div>
  <div className="ai-widget-panel" id="ai-widget-panel">
    <div className="ai-widget-header">
      <div className="ai-widget-title">
        <span className="ai-icon-sm">🤖</span> AgentCy Demo
      </div>
      <button className="ai-widget-close" id="ai-widget-close" aria-label="Close AI Demo">✕</button>
    </div>
    <div className="ai-widget-body" id="ai-widget-messages">
      {/* Messages injected via JS */}
    </div>
    <div className="ai-widget-footer">
      <form className="ai-widget-input-form" id="ai-chat-form">
        <input type="text" id="ai-chat-input" placeholder="Type a message..." aria-label="Chat input" autoComplete="off"/>
        <button type="submit" className="ai-widget-send" aria-label="Send message">↑</button>
      </form>
    </div>
  </div>
</div>



{/* ── NAV ── */}
<nav id="nav" aria-label="Main navigation">
  <div className="nav-inner">
    <a href="#" className="nav-logo" aria-label="AgentCy — Home">Agent<em className="logo-accent">Cy</em></a>
    <div className="nav-center" role="list">
      <a href="#why" className="nav-link" role="listitem">Why AI</a>
      <a href="#services" className="nav-link" role="listitem">Services</a>
      <a href="#process" className="nav-link" role="listitem">Process</a>
      <a href="#pricing" className="nav-link" role="listitem">Pricing</a>
      <a href="#faq" className="nav-link" role="listitem">FAQ</a>
    </div>
    <div className="nav-right">
      <a href="https://calendly.com/mariodecentralize/30min" target="_blank" className="btn btn-outline btn-sm">Book a Call</a>
      <a href="#pricing" className="btn btn-white btn-sm">Get started <span className="arr" aria-hidden="true">→</span></a>
      <button className="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">☰</button>
    </div>
  </div>
</nav>

{/* Mobile menu */}
<div id="mobile-menu" className="mobile-menu" role="dialog" aria-label="Navigation menu">
  <a href="#why">Why AI</a>
  <a href="#services">Services</a>
  <a href="#process">Process</a>
  <a href="#pricing">Pricing</a>
  <a href="#faq">FAQ</a>
  <a href="https://calendly.com/mariodecentralize/30min" target="_blank">Book a Call</a>
</div>

{/* ── HERO ── */}
<main id="main">
<section className="hero" aria-labelledby="hero-heading">
  <div className="hero-grid-bg" aria-hidden="true"></div>
  <div className="hero-beam" aria-hidden="true"></div>

  <div className="hero-eyebrow">
    <div className="chip" role="status"><span className="chip-pulse" aria-hidden="true"></span>Now open for new clients</div>
  </div>

  <h1 className="t-hero hero-title" id="hero-heading">
    <span className="g1">Your business,</span><br/>
    <span className="g2">running on AI.</span>
  </h1>

  <p className="t-body hero-sub">
    AI agents never call in sick, never clock out, and cost 90% less than hiring. We deploy them inside your business in under 14 days — so you earn more without spending more.
  </p>

  <div className="hero-ctas">
    <a href="#pricing" className="btn btn-white btn-lg">See packages <span className="arr" aria-hidden="true">→</span></a>
    <a href="#services" className="btn btn-outline btn-lg">Explore services</a>
  </div>

  <div className="hero-trust">
    <ul className="trust-row" aria-label="Key benefits" style={{ listStyle: 'none',  }}>
      <li className="trust-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Works 24/7, 365 days a year
      </li>
      <li className="trust-sep" aria-hidden="true"></li>
      <li className="trust-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        90% cheaper than hiring staff
      </li>
      <li className="trust-sep" aria-hidden="true"></li>
      <li className="trust-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Live in 7–14 days
      </li>
      <li className="trust-sep" aria-hidden="true"></li>
      <li className="trust-item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        30-day money-back guarantee
      </li>
    </ul>
  </div>

  {/* Dashboard stat cards */}
  <div className="hero-cards" aria-label="Key performance metrics">
    <div className="hc hc1">
      <div className="hc-label">Hours saved / week</div>
      <div className="hc-val g2" id="hc1" aria-live="polite">0</div>
      <div className="hc-sub">per client, on average</div>
      <div className="hc-bar-wrap" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" aria-label="85% capacity"><div className="hc-bar" id="hb1"></div></div>
      <div className="hc-status"><div className="hc-dot" aria-hidden="true"></div><div className="hc-status-text">Agents running right now</div></div>
    </div>
    <div className="hc hc2">
      <div className="hc-label">Response time to leads</div>
      <div className="hc-val" style={{ background: 'linear-gradient(95deg,var(--teal),var(--green))', webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent', backgroundClip: 'text',  }} id="hc2" aria-live="polite">0s</div>
      <div className="hc-sub">vs. 8–24 hrs without AI</div>
      <div className="hc-bar-wrap" role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" aria-label="65% speed metric"><div className="hc-bar" id="hb2"></div></div>
      <div className="hc-status"><div className="hc-dot" aria-hidden="true"></div><div className="hc-status-text">All systems operational</div></div>
    </div>
    <div className="hc hc3">
      <div className="hc-label">Saved vs. hiring staff</div>
      <div className="hc-val" style={{ background: 'linear-gradient(95deg,var(--amber),var(--teal))', webkitBackgroundClip: 'text', webkitTextFillColor: 'transparent', backgroundClip: 'text',  }} id="hc3" aria-live="polite">$0</div>
      <div className="hc-sub">avg monthly saving per client</div>
      <div className="hc-bar-wrap" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" aria-label="90% cost saving"><div className="hc-bar" id="hb3" style={{ background: 'linear-gradient(90deg,var(--amber),var(--teal))',  }}></div></div>
      <div className="hc-status"><div className="hc-dot" aria-hidden="true"></div><div className="hc-status-text">Cost optimised</div></div>
    </div>
  </div>
</section>

{/* ── MARQUEE ── */}
<div className="marquee-band" aria-label="Tools and platforms we use" role="region">
  <div className="marquee-track" aria-hidden="true">
    <div className="m-item"><span aria-hidden="true">⚙️</span>&nbsp; Make</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🔄</span>&nbsp; n8n</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🤖</span>&nbsp; Claude AI</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">💬</span>&nbsp; Voiceflow</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📈</span>&nbsp; GoHighLevel</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🎙️</span>&nbsp; Vapi</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📞</span>&nbsp; Bland.ai</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🧠</span>&nbsp; OpenAI</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📊</span>&nbsp; HubSpot</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🤝</span>&nbsp; Botpress</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">⚡</span>&nbsp; Zapier</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📋</span>&nbsp; Airtable</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📅</span>&nbsp; Cal.com</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">✉️</span>&nbsp; Gmail API</div><div className="m-sep"></div>
    {/* Duplicate for seamless loop */}
    <div className="m-item"><span aria-hidden="true">⚙️</span>&nbsp; Make</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🔄</span>&nbsp; n8n</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🤖</span>&nbsp; Claude AI</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">💬</span>&nbsp; Voiceflow</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📈</span>&nbsp; GoHighLevel</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🎙️</span>&nbsp; Vapi</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📞</span>&nbsp; Bland.ai</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🧠</span>&nbsp; OpenAI</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📊</span>&nbsp; HubSpot</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">🤝</span>&nbsp; Botpress</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">⚡</span>&nbsp; Zapier</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📋</span>&nbsp; Airtable</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">📅</span>&nbsp; Cal.com</div><div className="m-sep"></div>
    <div className="m-item"><span aria-hidden="true">✉️</span>&nbsp; Gmail API</div><div className="m-sep"></div>
  </div>
</div>

{/* ── WHY AI AGENTS ── */}
<section className="section" id="why" aria-labelledby="why-heading">
  <div className="wrap">
    <div data-s style={{ textAlign: 'center', marginBottom: '72px',  }}>
      <div className="eyebrow" aria-hidden="true" style={{ justifyContent: 'center',  }}>Why AI agents</div>
      <h2 className="t-h2" id="why-heading" style={{ textAlign: 'center',  }}>
        <span className="g1">Why every business</span><br/>
        <span className="g2">needs AI agents now.</span>
      </h2>
      <p className="t-body" style={{ marginTop: '16px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto',  }}>Your competitors are already automating. AI agents don't sleep, don't quit, and cost a fraction of what you pay staff. The businesses that deploy them now will be impossible to compete with in 3 years.</p>
    </div>
    <div className="why-grid" data-stagger>
      <div className="why-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
        <div className="why-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue-l)',  }}>🌙</div>
        <h3>They never sleep</h3>
        <p>Your AI agents are active at 3am on a Sunday just as effectively as Monday morning at 9. Every lead captured, every question answered — around the clock, without overtime pay.</p>
      </div>
      <div className="why-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
        <div className="why-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)',  }}>💰</div>
        <h3>A fraction of the cost</h3>
        <p>A full-time employee costs $3,000–$8,000/month. An AI agent handling the same workload runs for under $300/month. That's not a small saving — that's a structural advantage.</p>
      </div>
      <div className="why-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
        <div className="why-icon" style={{ background: 'var(--teal-dim)', color: 'var(--teal)',  }}>⚡</div>
        <h3>10× faster than humans</h3>
        <p>AI responds in seconds, not hours. Studies show 78% of buyers go with the first business that responds. Speed wins deals. AI gives you that speed, every single time.</p>
      </div>
      <div className="why-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
        <div className="why-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)',  }}>📈</div>
        <h3>Scales without limits</h3>
        <p>Handle 10 customers or 10,000 simultaneously — with zero extra cost. As your business grows, your AI agents grow with it. No hiring, no training, no lag time.</p>
      </div>
      <div className="why-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
        <div className="why-icon" style={{ background: 'var(--pur-dim)', color: 'var(--purple)',  }}>🎯</div>
        <h3>Zero human error</h3>
        <p>Agents follow your process perfectly, every time. No forgotten follow-ups, no incorrect data entry, no missed appointments. Consistent quality that builds trust with your customers.</p>
      </div>
      <div className="why-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
        <div className="why-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue-l)',  }}>🔮</div>
        <h3>Every business needs this</h3>
        <p>In 3 years, businesses without AI agents will struggle to compete on price, speed, or service quality. The question isn't whether to implement AI — it's whether to do it now or too late.</p>
      </div>
    </div>
  </div>
</section>

{/* ── PROBLEM / SOLUTION ── */}
<section className="section section-bg-alt" aria-labelledby="problem-heading">
  <div className="wrap">
    <div data-s>
      <div className="eyebrow" aria-hidden="true">The problem</div>
      <h2 className="t-h2" id="problem-heading"><span className="g1">Manual work is</span><br/><span className="g2">costing you thousands.</span></h2>
      <p className="t-body" style={{ marginTop: '16px', maxWidth: '480px',  }}>Most businesses waste 20+ hours a week — and $3,000–$8,000/month — on tasks AI handles in seconds. Here's exactly what changes when you work with us.</p>
    </div>
    <div className="ps-wrap" data-stagger>
      <div className="ps-col ps-col-a">
        <div className="ps-title bad" aria-label="Without AI">✗  Without AI</div>
        <div className="ps-row"><div className="ps-ico x" aria-hidden="true">✕</div>Manually answering the same customer questions every single day</div>
        <div className="ps-row"><div className="ps-ico x" aria-hidden="true">✕</div>Missing leads because nobody responded fast enough</div>
        <div className="ps-row"><div className="ps-ico x" aria-hidden="true">✕</div>Paying staff to copy-paste data between tools all week</div>
        <div className="ps-row"><div className="ps-ico x" aria-hidden="true">✕</div>Writing content from scratch every single week</div>
        <div className="ps-row"><div className="ps-ico x" aria-hidden="true">✕</div>Paying $3,000–$8,000/mo per employee for repetitive tasks</div>
        <div className="ps-row"><div className="ps-ico x" aria-hidden="true">✕</div>Losing clients to faster, smarter competitors</div>
      </div>
      <div className="ps-col ps-col-b">
        <div className="ps-title good" aria-label="With AgentCy">✓  With AgentCy</div>
        <div className="ps-row"><div className="ps-ico ok" aria-hidden="true">✓</div>AI chatbot handles 80% of questions instantly, 24/7</div>
        <div className="ps-row"><div className="ps-ico ok" aria-hidden="true">✓</div>Every lead gets a personalised reply within 60 seconds</div>
        <div className="ps-row"><div className="ps-ico ok" aria-hidden="true">✓</div>Workflows sync your tools automatically — zero manual effort</div>
        <div className="ps-row"><div className="ps-ico ok" aria-hidden="true">✓</div>AI generates and schedules a week of content in minutes</div>
        <div className="ps-row"><div className="ps-ico ok" aria-hidden="true">✓</div>Replace costly roles with agents running for under $300/mo</div>
        <div className="ps-row"><div className="ps-ico ok" aria-hidden="true">✓</div>Stay ahead — while competitors are still figuring AI out</div>
      </div>
    </div>
  </div>
</section>

{/* ── METRICS & ROI CALCULATOR ── */}
<section className="section-sm" style={{ paddingTop: '0',  }} aria-label="Key statistics">
  <div className="wrap">
    <div className="metrics" data-stagger style={{ marginBottom: '72px',  }}>
      <div className="metric"><div className="metric-num" id="m1" aria-live="polite">0+</div><div className="metric-label">Hours saved per<br/>week, per client</div></div>
      <div className="metric"><div className="metric-num" id="m2" aria-live="polite">0%</div><div className="metric-label">Cheaper than a<br/>full-time hire</div></div>
      <div className="metric"><div className="metric-num" id="m3" aria-live="polite">0s</div><div className="metric-label">Average AI response<br/>time to new leads</div></div>
      <div className="metric"><div className="metric-num" id="m4" aria-live="polite">0</div><div className="metric-label">Days average time<br/>to go live</div></div>
    </div>

    <div data-s>
      <div className="eyebrow" aria-hidden="true" style={{ justifyContent: 'center',  }}>Calculate your savings</div>
      <h2 className="t-h2" style={{ textAlign: 'center', marginBottom: '40px',  }}>
        <span className="g1">How much are you</span><br/>
        <span className="g2">losing to manual work?</span>
      </h2>
    </div>

    <div className="roi-wrap" data-s>
      <div className="roi-controls">
        <h3 className="t-h3" style={{ marginBottom: '8px',  }}>Your current metrics</h3>
        
        <div className="roi-group">
          <div className="roi-label">
            <span>Team size (employees)</span>
            <span className="roi-val" id="roi-team-val">5</span>
          </div>
          <input type="range" id="roi-team" min="1" max="50" value="5"/>
        </div>

        <div className="roi-group">
          <div className="roi-label">
            <span>Avg. hourly wage ($)</span>
            <span className="roi-val" id="roi-wage-val">$25/hr</span>
          </div>
          <input type="range" id="roi-wage" min="10" max="100" value="25" step="5"/>
        </div>

        <div className="roi-group">
          <div className="roi-label">
            <span>Hours spent on admin/repetitive tasks (per employee/week)</span>
            <span className="roi-val" id="roi-hours-val">10 hrs</span>
          </div>
          <input type="range" id="roi-hours" min="2" max="30" value="10"/>
        </div>
      </div>

      <div className="roi-results">
        <div className="roi-result-item">
          <div className="roi-result-label">You are currently spending</div>
          <div className="roi-result-val" style={{ background: 'linear-gradient(95deg, var(--red) 0%, var(--amber) 100%)', webkitBackgroundClip: 'text', backgroundClip: 'text',  }} id="roi-cost-val">$5,000</div>
          <div className="roi-result-sub">every month on tasks AI could do instantly.</div>
        </div>
        
        <div style={{ height: '1px', background: 'var(--border-2)', margin: '8px 0',  }}></div>

        <div className="roi-result-item">
          <div className="roi-result-label">Estimated AI Savings</div>
          <div className="roi-result-val" id="roi-save-val">$4,500</div>
          <div className="roi-result-sub">per month (assuming 90% automation at a fraction of the cost).</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ── AUTOMATION PLAYGROUND ── */}
<section className="section" id="playground" aria-labelledby="playground-heading">
  <div className="wrap">
    <div data-s style={{ textAlign: 'center', marginBottom: '64px',  }}>
      <div className="eyebrow" aria-hidden="true" style={{ justifyContent: 'center',  }}>Live Simulation</div>
      <h2 className="t-h2" id="playground-heading" style={{ textAlign: 'center',  }}>
        <span className="g1">See it in action.</span><br/>
        <span className="g2">Build your workflow.</span>
      </h2>
      <p className="t-body" style={{ marginTop: '16px', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto',  }}>Watch how our agents instantly process an inbound lead, query the knowledge base, draft a response, and update your CRM — all in seconds.</p>
    </div>

    <div className="pg-container" data-s>
      <div className="pg-input-zone">
        <label htmlFor="pg-input" className="t-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--ink-2)',  }}>Simulate New Inbound Lead:</label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap',  }}>
          <input type="text" id="pg-input" className="pg-input" value="Hi, I need pricing for a 3-page website. Do you guys do SEO as well? - Sarah" aria-label="Simulate lead text"/>
          <button id="pg-run-btn" className="btn btn-blue">Run Automation <span className="arr" aria-hidden="true">→</span></button>
        </div>
      </div>
      
      <div className="pg-nodes-wrap">
        <div className="pg-lines">
          <div className="pg-line-segment" id="pg-l1"></div>
          <div className="pg-line-segment" id="pg-l2"></div>
          <div className="pg-line-segment" id="pg-l3"></div>
        </div>

        <div className="pg-nodes">
          <div className="pg-node" id="node-0">
            <div className="pg-node-icon">📥</div>
            <div className="pg-node-title">Webhook</div>
            <div className="pg-node-sub">Email received</div>
            <div className="pg-node-status"></div>
            <div className="pg-node-data" id="nd-0"></div>
          </div>
          <div className="pg-node" id="node-1">
            <div className="pg-node-icon">🧠</div>
            <div className="pg-node-title">OpenAI Request</div>
            <div className="pg-node-sub">Analyze & Draft</div>
            <div className="pg-node-status"></div>
            <div className="pg-node-data" id="nd-1"></div>
          </div>
          <div className="pg-node" id="node-2">
            <div className="pg-node-icon">📋</div>
            <div className="pg-node-title">HubSpot CRM</div>
            <div className="pg-node-sub">Create Contact</div>
            <div className="pg-node-status"></div>
            <div className="pg-node-data" id="nd-2"></div>
          </div>
          <div className="pg-node" id="node-3">
            <div className="pg-node-icon">💬</div>
            <div className="pg-node-title">Slack/SMS</div>
            <div className="pg-node-sub">Notify Team</div>
            <div className="pg-node-status"></div>
            <div className="pg-node-data" id="nd-3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ── SERVICES ── */}
<section className="section section-bg-alt" id="services" aria-labelledby="services-heading">
  <div className="wrap">
    <div data-s>
      <div className="eyebrow" aria-hidden="true">Services</div>
      <h2 className="t-h2" id="services-heading"><span className="g1">A digital workforce.</span><br/><span className="g2">That never sleeps.</span></h2>
      <p className="t-body" style={{ marginTop: '16px', maxWidth: '500px',  }}>Every agent is fully built and deployed by us — no technical knowledge needed on your end. You describe the problem. We solve it. You pocket the time and money saved.</p>
    </div>
    <div className="svc-grid" data-stagger>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">🤖</div><span className="svc-n">01</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>AI Chatbot Setup</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>A fully trained chatbot lives on your website — answering questions, capturing leads, and booking calls 24/7 without you lifting a finger.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">Voiceflow</span><span className="tag">Botpress</span><span className="tag">Claude API</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $500<span className="svc-price-s">· $200/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">✍️</div><span className="svc-n">02</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>AI Content Pipeline</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>Your entire content workflow automated. Blog posts, social captions, email newsletters — generated and posted on schedule, every week.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">Make</span><span className="tag">n8n</span><span className="tag">Claude API</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $300<span className="svc-price-s">· $300/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">⚡</div><span className="svc-n">03</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>Lead Follow-Up</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>New lead in your CRM — AI sends a personalised reply in 60 seconds. Clinics, gyms, real estate, coaches — anyone who needs fast responses.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">GoHighLevel</span><span className="tag">HubSpot</span><span className="tag">Make</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $500<span className="svc-price-s">· $300/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">📱</div><span className="svc-n">04</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>Social Media Automation</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>Trending topics → AI-written posts → auto-scheduled across all platforms. Your brand stays active and consistent with zero manual work.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">Make</span><span className="tag">Buffer</span><span className="tag">Claude</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $400<span className="svc-price-s">· $400/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">📧</div><span className="svc-n">05</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>Email &amp; Doc Automation</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>AI reads, sorts, summarises, and drafts replies to your inbox. Extracts data from contracts and documents. Saves 5–10 hrs of admin weekly.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">Claude API</span><span className="tag">Gmail</span><span className="tag">Make</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $300<span className="svc-price-s">· $200/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">📞</div><span className="svc-n">06</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>Voice AI Agent</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>An AI phone agent that answers calls, handles FAQs, and books appointments into your calendar. Clinics, salons, restaurants. Zero code needed.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">Vapi</span><span className="tag">Bland.ai</span><span className="tag">Cal.com</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $500<span className="svc-price-s">· $200/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">🧠</div><span className="svc-n">07</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>Knowledge Base Bot</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>SOPs, policies, and FAQs — an internal AI your team queries instantly. New staff onboarded in days. No more repeating the same answers.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">CustomGPT</span><span className="tag">Claude + RAG</span><span className="tag">Notion</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $800<span className="svc-price-s">· $300/mo</span></div>
      </div>
      <div className="svc" data-tilt data-tilt-max="3" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="svc-head" style={{ transform: 'translateZ(20px)',  }}><div className="svc-icon" aria-hidden="true">🎬</div><span className="svc-n">08</span></div>
        <h3 style={{ transform: 'translateZ(30px)',  }}>Content Repurposing</h3>
        <p style={{ transform: 'translateZ(20px)',  }}>Upload a video or podcast — AI generates Shorts scripts, blog posts, tweets, and email recaps. One piece of content becomes ten, automatically.</p>
        <div className="svc-tags" style={{ transform: 'translateZ(25px)',  }}><span className="tag">Whisper</span><span className="tag">Claude</span><span className="tag">n8n</span></div>
        <div className="svc-price" style={{ transform: 'translateZ(35px)',  }}>From $300<span className="svc-price-s">· $300/mo</span></div>
      </div>
      <div className="svc svc-cta">
        <h3 className="t-h3">Not sure where<br/>to start?</h3>
        <p>Book a free 30-min strategy call. We'll tell you exactly which automation gives you the best return first — no commitment required.</p>
        <a href="https://calendly.com/mariodecentralize/30min" target="_blank" className="btn btn-blue">Book free call <span className="arr" aria-hidden="true">→</span></a>
      </div>
    </div>
  </div>
</section>

{/* ── PROCESS ── */}
<section className="section" id="process" aria-labelledby="process-heading">
  <div className="wrap">
    <div data-s>
      <div className="eyebrow" aria-hidden="true">How it works</div>
      <h2 className="t-h2" id="process-heading"><span className="g1">Up and running</span><br/><span className="g2">in under 14 days.</span></h2>
      <p className="t-body" style={{ marginTop: '16px', maxWidth: '460px',  }}>We handle 100% of the technical build. You just show up for two calls — we do everything in between.</p>
    </div>
    <div className="process-timeline" id="process-timeline" data-stagger>
      <div className="process-timeline-fill" id="timeline-fill"></div>
      
      <div className="tstep step-node">
        <div className="pstep-tag">Day 1–2</div>
        <span className="pstep-icon" aria-hidden="true">🎯</span>
        <h3>Discovery & Strategy</h3>
        <p>A focused 30-minute call to map your current workflows, identify your biggest bottlenecks, and blueprint the automations that will deliver the highest ROI within the first 30 days.</p>
      </div>
      
      <div className="tstep step-node">
        <div className="pstep-tag">Day 3–12</div>
        <span className="pstep-icon" aria-hidden="true">⚙️</span>
        <h3>Build & Integration</h3>
        <p>Our engineers construct your custom AI systems using best-in-class models (Claude, OpenAI) and logic engines (Make, Voiceflow). We handle 100% of the build, testing, and API integrations securely.</p>
      </div>
      
      <div className="tstep step-node">
        <div className="pstep-tag">Day 14 onward</div>
        <span className="pstep-icon" aria-hidden="true">🚀</span>
        <h3>Deployment & Optimization</h3>
        <p>Your new digital workforce goes live. We walk you through the dashboard, provide documentation, and continuously monitor analytics to optimize token usage and accuracy every single month.</p>
      </div>
    </div>
  </div>
</section>

{/* ── TECH STACK ── */}
<section className="section section-bg-alt" id="tech" aria-labelledby="tech-heading">
  <div className="wrap">
    <div data-s>
      <div className="eyebrow" aria-hidden="true">The Engine Room</div>
      <h2 className="t-h2" id="tech-heading"><span className="g1">Powered by the best</span><br/><span className="g2">AI models on Earth.</span></h2>
    </div>
    <div className="bento-grid" data-stagger>
      <div className="bento-box bento-wide" data-tilt data-tilt-max="2" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.05">
        <span className="bento-icon" aria-hidden="true">🌌</span>
        <h3>OpenAI & Claude</h3>
        <p>We leverage GPT-4o and Claude 3.5 Sonnet to power your custom agents, ensuring they have the deepest reasoning capabilities and fastest response times available worldwide.</p>
        <div className="bento-bg" aria-hidden="true">🧠</div>
      </div>
      <div className="bento-box" data-tilt data-tilt-max="2" data-tilt-speed="400">
        <span className="bento-icon" aria-hidden="true">⚡</span>
        <h3>Make & n8n</h3>
        <p>Enterprise-grade logic engines that seamlessly string together your CRM, Slack, and email.</p>
        <div className="bento-bg" aria-hidden="true">🔗</div>
      </div>
      <div className="bento-box" data-tilt data-tilt-max="2" data-tilt-speed="400">
        <span className="bento-icon" aria-hidden="true">🗣️</span>
        <h3>Voiceflow & Vapi</h3>
        <p>The architecture behind our conversational text and voice agents, enabling flawless dialogue.</p>
        <div className="bento-bg" aria-hidden="true">🔊</div>
      </div>
    </div>
  </div>
</section>

{/* ── TESTIMONIALS ── */}
<section className="section-sm" style={{ padding: '80px 0',  }} aria-labelledby="testimonials-heading">
  <div className="wrap">
    <div data-s style={{ marginBottom: '64px',  }}>
      <div className="eyebrow" aria-hidden="true">Client results</div>
      <h2 className="t-h2" id="testimonials-heading"><span className="g1">Real businesses,</span><br/><span className="g2">real results.</span></h2>
    </div>
    <div className="testimonials" data-stagger>
      <article className="tcard">
        <div className="tcard-stars" role="img" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote className="tcard-quote">"We were manually following up with every single lead. AgentCy built us an AI that responds in under a minute, 24/7. Our conversion rate went up 40% in the first month."</blockquote>
        <div className="tcard-author">
          <div className="tcard-avatar" aria-label="James D.">JD</div>
          <div><div className="tcard-name">James D.</div><div className="tcard-role">Real Estate Agent, Miami</div></div>
        </div>
      </article>
      <article className="tcard">
        <div className="tcard-stars" role="img" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote className="tcard-quote">"The chatbot handles 80% of our customer questions now. My team was spending 3 hours a day on the same FAQs. That time is now spent on actual growth work."</blockquote>
        <div className="tcard-author">
          <div className="tcard-avatar" aria-label="Sofia R.">SR</div>
          <div><div className="tcard-name">Sofia R.</div><div className="tcard-role">Clinic Owner, London</div></div>
        </div>
      </article>
      <article className="tcard">
        <div className="tcard-stars" role="img" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote className="tcard-quote">"Our content pipeline runs completely on autopilot now. Blog posts, socials, email newsletter — all AI-generated and published. Saves me 15+ hours a week."</blockquote>
        <div className="tcard-author">
          <div className="tcard-avatar" aria-label="Marcus K.">MK</div>
          <div><div className="tcard-name">Marcus K.</div><div className="tcard-role">Online Coach, Sydney</div></div>
        </div>
      </article>
    </div>
  </div>
</section>

{/* ── PRICING ── */}
<section className="section" id="pricing" aria-labelledby="pricing-heading">
  <div className="wrap">
    <div data-s>
      <div className="eyebrow" aria-hidden="true">Pricing</div>
      <h2 className="t-h2" id="pricing-heading"><span className="g1">Simple, transparent.</span><br/><span className="g2">No surprises.</span></h2>
      <p className="t-body" style={{ marginTop: '16px', maxWidth: '480px',  }}>Pick the package that fits your stage. Or purchase any service individually above — each is available standalone.</p>
    </div>
    <div className="pricing-grid" data-stagger>
      <div className="pcard" data-tilt data-tilt-max="2" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.05" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="ptier" style={{ transform: 'translateZ(20px)',  }}>Pilot Phase</div>
        <div className="pprice" style={{ transform: 'translateZ(40px)',  }}><sup>$</sup>997</div>
        <div className="pbill" style={{ transform: 'translateZ(30px)',  }}>setup + $297/mo</div>
        <div className="pdesc" style={{ transform: 'translateZ(20px)',  }}>Start saving time immediately with one high-impact, custom AI automation.</div>
        <ul className="pfeats" aria-label="Pilot plan features" style={{ transform: 'translateZ(30px)',  }}>
          <li><div className="pck" aria-hidden="true">✓</div>1 custom AI workflow</li>
          <li><div className="pck" aria-hidden="true">✓</div>Dedicated lead capture bot</li>
          <li><div className="pck" aria-hidden="true">✓</div>Full integration & testing</li>
          <li><div className="pck" aria-hidden="true">✓</div>Monthly performance tuning</li>
          <li><div className="pck" aria-hidden="true">✓</div>Email support within 48hr</li>
        </ul>
        <a href="https://whop.com/checkout/plan_5ciITbC6hi77w" target="_blank" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', transform: 'translateZ(40px)',  }}>Launch Pilot <span className="arr" aria-hidden="true">→</span></a>
        
        <div className="whop-secured" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', fontSize: '11px', color: 'var(--ink-4)', letterSpacing: '0.5px', transform: 'translateZ(20px)',  }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secured by Whop
        </div>
      </div>

      <div className="pcard pcard-featured" data-tilt data-tilt-max="2" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="pbadge" style={{ transform: 'translateZ(50px) translateX(-50%)',  }}>Most popular</div>
        <div className="ptier ptier-f" style={{ transform: 'translateZ(20px)',  }}>Autonomous Growth</div>
        <div className="pprice" style={{ transform: 'translateZ(40px)',  }}><sup>$</sup>2,497</div>
        <div className="pbill" style={{ transform: 'translateZ(30px)',  }}>setup + $697/mo</div>
        <div className="pdesc" style={{ transform: 'translateZ(20px)',  }}>A multi-agent system designed to handle your top-of-funnel and admin operations.</div>
        <ul className="pfeats" aria-label="Growth plan features" style={{ transform: 'translateZ(30px)',  }}>
          <li><div className="pck pck-b" aria-hidden="true">✓</div>Up to 3 custom AI workflows</li>
          <li><div className="pck pck-b" aria-hidden="true">✓</div>Multi-channel integration (CRM, SMS)</li>
          <li><div className="pck pck-b" aria-hidden="true">✓</div>Advanced lead qualification logic</li>
          <li><div className="pck pck-b" aria-hidden="true">✓</div>Quarterly strategy deep-dives</li>
          <li><div className="pck pck-b" aria-hidden="true">✓</div>Priority Slack support</li>
        </ul>
        <a href="https://whop.com/checkout/plan_7OVA1Y4jMjon8" target="_blank" className="btn btn-blue" style={{ width: '100%', justifyContent: 'center', transform: 'translateZ(40px)',  }}>Start Growing <span className="arr" aria-hidden="true">→</span></a>
        
        <div className="whop-secured" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', fontSize: '11px', color: 'var(--ink-4)', letterSpacing: '0.5px', transform: 'translateZ(20px)',  }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secured by Whop
        </div>
      </div>

      <div className="pcard" data-tilt data-tilt-max="2" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.05" style={{ transformStyle: 'preserve-3d',  }}>
        <div className="ptier" style={{ transform: 'translateZ(20px)',  }}>Enterprise AI</div>
        <div className="pprice" style={{ transform: 'translateZ(40px)',  }}><sup>$</sup>4,997</div>
        <div className="pbill" style={{ transform: 'translateZ(30px)',  }}>setup + $1,497/mo</div>
        <div className="pdesc" style={{ transform: 'translateZ(20px)',  }}>Complete digital transformation. An army of AI agents running your operations.</div>
        <ul className="pfeats" aria-label="Enterprise plan features" style={{ transform: 'translateZ(30px)',  }}>
          <li><div className="pck" aria-hidden="true">✓</div>Unlimited custom automations</li>
          <li><div className="pck" aria-hidden="true">✓</div>Voice AI & Inbound Call Routing</li>
          <li><div className="pck" aria-hidden="true">✓</div>Complete internal Knowledge Base</li>
          <li><div className="pck" aria-hidden="true">✓</div>Weekly optimisation sprints</li>
          <li><div className="pck" aria-hidden="true">✓</div>Dedicated AI success manager</li>
          <li><div className="pck" aria-hidden="true">✓</div>24/7 VIP support coverage</li>
        </ul>
        <a href="https://whop.com/checkout/plan_hpZ0B1wh7sgWx" target="_blank" className="btn btn-white" style={{ width: '100%', justifyContent: 'center', transform: 'translateZ(40px)',  }}>Transform Now <span className="arr" aria-hidden="true">→</span></a>
        
        <div className="whop-secured" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', transform: 'translateZ(20px)',  }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secured by Whop
        </div>
      </div>
    </div>

    <div className="guarantee" data-s role="note" aria-label="Money-back guarantee">
      <div className="g-icon" aria-hidden="true">🛡️</div>
      <div>
        <div className="g-title">30-day money-back guarantee</div>
        <div className="g-body">If the automation we build doesn't perform as promised after we've done our best to fix it, we'll refund your full setup fee. No questions asked, no awkward conversations, no small print.</div>
      </div>
    </div>

    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--ink-3)',  }}>
      Need just one service?&nbsp;<a href="#services" style={{ color: 'var(--blue-l)', textDecoration: 'none', borderBottom: '1px solid rgba(123,148,255,0.3)', paddingBottom: '1px',  }}>Browse individual services →</a>
    </p>
  </div>
</section>

{/* ── FAQ ── */}
<section className="section section-bg-alt" id="faq" aria-labelledby="faq-heading">
  <div className="wrap">
    <div data-s>
      <div className="eyebrow" aria-hidden="true">FAQ</div>
      <h2 className="t-h2" id="faq-heading"><span className="g1">Common</span> <span className="g2">questions.</span></h2>
    </div>
    <div className="faq-grid" data-stagger>
      <div className="faq-item">
        <h4>Do I need to know anything about AI or tech?</h4>
        <p>Not at all. We handle 100% of the technical setup. You just describe your business and what you want to solve — we build everything. You'll get a plain-English walkthrough at the end.</p>
      </div>
      <div className="faq-item">
        <h4>How long does it take to go live?</h4>
        <p>Most projects go live within 7–14 business days from your discovery call. The Scale package takes up to 21 days. You'll receive regular progress updates throughout the build.</p>
      </div>
      <div className="faq-item">
        <h4>What if it doesn't work for my business?</h4>
        <p>We offer a 30-day results guarantee. If the system doesn't perform as promised after we've worked to fix it, we'll refund your full setup fee. No questions asked.</p>
      </div>
      <div className="faq-item">
        <h4>What tools do you use — and do I pay for them?</h4>
        <p>We use Make, n8n, Claude API, Voiceflow, Vapi, GoHighLevel, and others. Some have free tiers; most cost $20–$100/month. We give you the full cost breakdown before we start.</p>
      </div>
      <div className="faq-item">
        <h4>Can I add more automations later?</h4>
        <p>Absolutely — most clients start with one and add more after seeing results. Existing clients get discounted rates on all additional automations added to their retainer.</p>
      </div>
      <div className="faq-item">
        <h4>What types of businesses do you work with?</h4>
        <p>Clinics, gyms, restaurants, real estate agencies, coaches, marketing agencies, and e-commerce brands. If you have repetitive tasks and customer touchpoints, we can automate them.</p>
      </div>
    </div>
  </div>
</section>

{/* ── FINAL CTA ── */}
<div className="final" aria-labelledby="cta-heading">
  <div className="final-grid-bg" aria-hidden="true"></div>
  <div className="final-beam" aria-hidden="true"></div>
  <div className="wrap" style={{ position: 'relative', zIndex: '1',  }}>
    <h2 className="t-h2 final-title" id="cta-heading" data-s>
      <span className="g1">Stop paying humans</span><br/>
      <span className="g2">for what AI does better.</span>
    </h2>
    <p className="t-body final-sub" data-s>
      Book a free 30-minute strategy call. We'll show you exactly which agent gives you the fastest return — and how much you'll save in month one.
    </p>
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',  }} data-s>
      <a href="#pricing" className="btn btn-white btn-lg">See packages <span className="arr" aria-hidden="true">→</span></a>
      <a href="https://calendly.com/mariodecentralize/30min" target="_blank" className="btn btn-blue btn-lg">Book free strategy call</a>
    </div>
  </div>
</div>
</main>

{/* ── FOOTER ── */}
<footer>
  <div className="footer-inner">
    <a href="#" className="nav-logo" aria-label="AgentCy — back to top" style={{ fontSize: '16px',  }}>Agent<em className="logo-accent">Cy</em></a>
    <nav className="footer-links" aria-label="Footer navigation">
      <a href="#services">Services</a>
      <a href="#process">Process</a>
      <a href="#pricing">Pricing</a>
      <a href="https://calendly.com/mariodecentralize/30min" target="_blank">Book a Call</a>
    </nav>
    <span className="footer-copy">© 2025 AgentCy · Built with AI</span>
  </div>
</footer>




    </>
  );
}
