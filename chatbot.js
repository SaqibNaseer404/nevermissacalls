/* Never Miss Calls — on-site assistant widget (rule-based, no backend, no cost) */
(function () {
  'use strict';

  var CAL_URL = 'https://cal.com/saqib-naseer/never-miss-calls-intro-call';
  var DEMO_URL = '/demo/';
  var EMAIL = 'hello@nevermissacalls.com';

  var CSS = [
    '.nmc-chat-btn{position:fixed;right:20px;bottom:20px;z-index:9998;width:60px;height:60px;border-radius:50%;border:0;background:#f05a28;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(240,90,40,.4);transition:transform .15s}',
    '.nmc-chat-btn:hover{transform:scale(1.07)}',
    '.nmc-chat-btn svg{width:28px;height:28px;fill:#fff}',
    '.nmc-chat-btn .nmc-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff}',
    '.nmc-nudge{position:fixed;right:92px;bottom:30px;z-index:9998;max-width:250px;background:#fff;color:#10212d;border:1px solid #cfd6d7;border-radius:12px;padding:10px 14px;font:14px/1.45 "Source Sans 3","Segoe UI",system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.15);cursor:pointer}',
    '.nmc-nudge b{color:#f05a28}',
    '.nmc-panel{position:fixed;right:20px;bottom:92px;z-index:9999;width:370px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 130px);background:#fff;border:1px solid #cfd6d7;border-radius:16px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.22);font-family:"Source Sans 3","Segoe UI",system-ui,sans-serif}',
    '.nmc-panel.open{display:flex}',
    '.nmc-head{background:#f05a28;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}',
    '.nmc-head .nmc-avatar{width:36px;height:36px;border-radius:50%;background:#fff;color:#f05a28;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:18px}',
    '.nmc-head .nmc-title{font-weight:700;font-size:16px;line-height:1.2}',
    '.nmc-head .nmc-sub{font-size:12px;opacity:.9}',
    '.nmc-head .nmc-close{margin-left:auto;background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:4px}',
    '.nmc-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#f6f7f4}',
    '.nmc-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;animation:nmcIn .2s ease}',
    '@keyframes nmcIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '.nmc-bot{background:#fff;border:1px solid #e2e6e6;border-bottom-left-radius:4px;align-self:flex-start;color:#10212d}',
    '.nmc-user{background:#f05a28;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '.nmc-msg a{color:#f05a28;font-weight:600}',
    '.nmc-linkbtn{display:inline-block;margin-top:8px;background:#f05a28;color:#fff!important;text-decoration:none;font-weight:700;padding:9px 16px;border-radius:9px;font-size:14px}',
    '.nmc-quick{display:flex;flex-wrap:wrap;gap:8px;padding:4px 14px 8px;background:#f6f7f4}',
    '.nmc-quick button{background:#fff;border:1px solid #f05a28;color:#f05a28;border-radius:20px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}',
    '.nmc-quick button:hover{background:#f05a28;color:#fff}',
    '.nmc-input{display:flex;border-top:1px solid #cfd6d7;background:#fff}',
    '.nmc-input input{flex:1;border:0;padding:13px 14px;font-size:14px;font-family:inherit;outline:none;background:transparent;color:#10212d}',
    '.nmc-input button{border:0;background:#f05a28;color:#fff;padding:0 18px;font-size:16px;cursor:pointer;font-weight:700}',
    '.nmc-typing{align-self:flex-start;background:#fff;border:1px solid #e2e6e6;border-radius:14px;border-bottom-left-radius:4px;padding:10px 14px;color:#4f5f67;font-size:13px}',
    '@media (prefers-color-scheme:dark){.nmc-nudge{background:#142128;color:#f6f8f4;border-color:#35454d}.nmc-panel{background:#142128;border-color:#35454d}.nmc-msgs,.nmc-quick{background:#0c151a}.nmc-bot{background:#1d2c34;border-color:#35454d;color:#f6f8f4}.nmc-input{background:#142128;border-color:#35454d}.nmc-input input{color:#f6f8f4}.nmc-quick button{background:#1d2c34}}'
  ].join('\n');

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MENU = [
    { t: 'How it works', k: 'how' },
    { t: 'See the demo', k: 'demo' },
    { t: 'The $500 pilot', k: 'pilot' },
    { t: 'Book a call', k: 'book' }
  ];

  var panel, msgs, quick, input, sendBtn, chatBtn, nudge;

  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }

  function addMsg(text, who) {
    var m = el('div', 'nmc-msg nmc-' + who, text);
    msgs.appendChild(m);
    scrollDown();
  }
  function addUser(text) { addMsg(esc(text), 'user'); }

  function setQuick(buttons) {
    quick.innerHTML = '';
    buttons.forEach(function (b) {
      var btn = el('button', null, esc(b.t));
      btn.type = 'button';
      btn.onclick = function () { addUser(b.t); setTimeout(function () { answer(b.k); }, 350); };
      quick.appendChild(btn);
    });
  }

  function linkBtn(label, url) {
    return '<br><a class="nmc-linkbtn" href="' + url + '" target="_blank" rel="noopener">' + esc(label) + '</a>';
  }

  function answer(key) {
    showTyping(function () {
      switch (key) {
        case 'how':
          addMsg('Simple, 3 steps:<br>1) A call hits voicemail while you\u2019re on a job.<br>2) We <b>text the caller in under a minute</b>.<br>3) The text asks what\u2019s wrong and <b>books the job on your calendar</b>.<br><br>You stay on the tools. Your number doesn\u2019t change.', 'bot');
          setQuick([{ t: 'See the demo', k: 'demo' }, { t: 'The $500 pilot', k: 'pilot' }, { t: 'Book a call', k: 'book' }]);
          break;
        case 'demo':
          addMsg('Here\u2019s the 90-second demo \u2014 watch exactly what your customer would experience:' + linkBtn('\u25b6 Watch the demo', DEMO_URL), 'bot');
          setQuick([{ t: 'Book a call', k: 'book' }, { t: 'The $500 pilot', k: 'pilot' }]);
          break;
        case 'book':
          addMsg('Pick a time that suits you \u2014 relaxed 15-minute chat, zero pressure:' + linkBtn('\ud83d\udcc5 Book my call', CAL_URL), 'bot');
          setQuick([{ t: 'See the demo', k: 'demo' }, { t: 'Start over', k: 'start' }]);
          break;
        case 'pilot':
          addMsg('I\u2019m onboarding the first few shops on a <b>$500 pilot</b> \u2014 the full missed-call text-back + booking system, set up for your business. It\u2019s <b>credited toward the full setup</b> if you stay.', 'bot');
          setQuick([{ t: 'Book a call', k: 'book' }, { t: 'See the demo', k: 'demo' }]);
          break;
        case 'whatsapp':
          addMsg('Good question \u2014 WhatsApp auto-reply sends <b>one static message and goes quiet</b>. Nobody books from that.<br><br>We hold a <b>real conversation</b> \u2014 ask what\u2019s wrong, where the job is \u2014 and <b>book it on your calendar</b>. Different league.', 'bot');
          setQuick([{ t: 'How it works', k: 'how' }, { t: 'Book a call', k: 'book' }]);
          break;
        case 'human':
          addMsg('You can reach Saqib directly at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> \u2014 or book a call and talk face to face:' + linkBtn('\ud83d\udcc5 Book my call', CAL_URL), 'bot');
          setQuick([{ t: 'Start over', k: 'start' }]);
          break;
        case 'start':
        default:
          addMsg('\ud83d\udc4b Hey! Losing jobs to calls you can\u2019t pick up? I can walk you through it.', 'bot');
          setQuick(MENU);
          break;
      }
    });
  }

  function showTyping(done) {
    var t = el('div', 'nmc-typing', 'typing\u2026');
    msgs.appendChild(t);
    scrollDown();
    setTimeout(function () { t.remove(); done(); }, 600);
  }

  function freeText(raw) {
    var text = raw.toLowerCase();
    var key = 'start';
    if (/(price|cost|much|pilot|500)/.test(text)) key = 'pilot';
    else if (/(demo|video|watch|see it|show)/.test(text)) key = 'demo';
    else if (/(book|call|talk|speak|schedule|appointment|meet)/.test(text)) key = 'book';
    else if (/(how|work|does it|what is)/.test(text)) key = 'how';
    else if (/(whatsapp)/.test(text)) key = 'whatsapp';
    else if (/(human|person|someone|real|contact|email|owner|saqib)/.test(text)) key = 'human';
    else if (/(hi|hello|hey|salam|aoa)\b/.test(text)) key = 'start';
    if (key === 'start' && !/(hi|hello|hey|salam|aoa)/.test(text)) {
      showTyping(function () {
        addMsg('I can help with <b>how it works</b>, the <b>demo</b>, the <b>$500 pilot</b>, or <b>booking a call</b> \u2014 tap one below.', 'bot');
        setQuick(MENU);
      });
      return;
    }
    answer(key);
  }

  function toggle(open) {
    var willOpen = open == null ? !panel.classList.contains('open') : open;
    panel.classList.toggle('open', willOpen);
    if (nudge) nudge.style.display = 'none';
    if (willOpen && !msgs.children.length) answer('start');
    if (willOpen) setTimeout(function () { input.focus(); }, 150);
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    chatBtn = el('button', 'nmc-chat-btn', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg><span class="nmc-dot"></span>');
    chatBtn.setAttribute('aria-label', 'Chat with us');
    chatBtn.onclick = function () { toggle(); };
    document.body.appendChild(chatBtn);

    panel = el('div', 'nmc-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Never Miss Calls');
    panel.innerHTML =
      '<div class="nmc-head"><div class="nmc-avatar">N</div>' +
      '<div><div class="nmc-title">NMC Assistant</div><div class="nmc-sub">Typically replies instantly</div></div>' +
      '<button class="nmc-close" aria-label="Close chat">&times;</button></div>' +
      '<div class="nmc-msgs"></div><div class="nmc-quick"></div>' +
      '<form class="nmc-input"><input type="text" placeholder="Type your question\u2026" aria-label="Type your question" maxlength="300"><button type="submit" aria-label="Send">\u27a4</button></form>';
    document.body.appendChild(panel);

    msgs = panel.querySelector('.nmc-msgs');
    quick = panel.querySelector('.nmc-quick');
    var form = panel.querySelector('.nmc-input');
    input = form.querySelector('input');

    panel.querySelector('.nmc-close').onclick = function () { toggle(false); };
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      input.value = '';
      addUser(v);
      setTimeout(function () { freeText(v); }, 350);
    };

    // one-time proactive nudge
    try {
      if (!sessionStorage.getItem('nmc_nudged')) {
        setTimeout(function () {
          if (panel.classList.contains('open')) return;
          nudge = el('div', 'nmc-nudge', '<b>Missed calls</b> costing you jobs? Chat with me \u2014 it takes 30 seconds.');
          nudge.onclick = function () {
            try { sessionStorage.setItem('nmc_nudged', '1'); } catch (e) {}
            toggle(true);
          };
          document.body.appendChild(nudge);
          setTimeout(function () { if (nudge && nudge.parentNode) nudge.style.display = 'none'; }, 15000);
        }, 10000);
      }
    } catch (e) { /* storage unavailable — skip nudge */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
