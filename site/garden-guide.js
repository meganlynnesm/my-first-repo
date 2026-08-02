// ============================================================
// Garden Guide — chat bot for the Green Thumbs project
// ------------------------------------------------------------
// Adapted from the CDW "02 Chat Bot" tutorial (isohale/cdw-public-2026).
// Same core as the tutorial — Firebase Realtime Database for message
// history + the OpenAI Chat Completions API for replies — reshaped into
// a floating widget and given a garden-themed persona so it belongs to
// this project rather than sitting on top of it.
//
// SECURITY NOTE (from the tutorial): the OpenAI key below lives in
// client-side code for LEARNING ONLY. Anyone who opens this page can read
// it. Don't commit a real key to a public repo. The tutorial's "04
// Firebase Functions" example shows the secure production pattern.
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ========================================================
  // STEP 1: FIREBASE CONFIGURATION  (your real project)
  // ========================================================
  const firebaseConfig = {
    apiKey: "AIzaSyBSn-BcM5pkaFafHXBNHMY6TTfzTgksRUQ",
    authDomain: "chatty-garden-bot.firebaseapp.com",
    projectId: "chatty-garden-bot",
    storageBucket: "chatty-garden-bot.firebasestorage.app",
    messagingSenderId: "647378413700",
    appId: "1:647378413700:web:fdc597861682bfff093ad1",

    // ⚠️ REQUIRED for the Realtime Database. Your config from the Firebase
    // "web app" screen does NOT include this line — you have to CREATE a
    // Realtime Database first (Build → Realtime Database → Create database),
    // then copy the exact URL it shows you and paste it here. The value
    // below is the usual default; if your database is in another region
    // Firebase will show something like
    //   https://chatty-garden-bot-default-rtdb.europe-west1.firebasedatabase.app
    databaseURL: "https://chatty-garden-bot-default-rtdb.firebaseio.com"
  };

  // Initialize Firebase (compat SDK, loaded in index.html)
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // ========================================================
  // STEP 2: OPENAI CONFIGURATION
  // ========================================================
  // 👉 Paste your own key from https://platform.openai.com/api-keys
  //    Until you do, Firebase still works and the bot will tell visitors
  //    it isn't fully wired up yet.
  const OPENAI_API_KEY = 'PASTE-YOUR-OPENAI-KEY-HERE';
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  const OPENAI_MODEL   = 'gpt-4o-mini';

  // The persona — this is what gives the bot a ROLE in the project.
  const SYSTEM_PROMPT =
    "You are Garden Guide, a warm, knowledgeable assistant for a Columbia " +
    "GSAPP 'Green Thumbs' project about New York City's GreenThumb community " +
    "gardens. You help visitors understand NYC's 635 community gardens, urban " +
    "and community gardening, native and pollinator plants, composting, and how " +
    "to get involved with a garden near them. Keep answers short (2-4 sentences), " +
    "friendly, and encouraging. If a question is outside gardening or the project, " +
    "gently steer back to the gardens.";

  // Rate limiting (kept from the tutorial)
  let lastApiCall = 0;
  const MIN_CALL_INTERVAL = 1000; // 1s between calls

  // Where messages live in the database (matches the tutorial's structure)
  const MESSAGES_REF = 'chat/messages';

  // The greeting that always sits at the top of the thread
  const GREETING = "Hi! I'm your Garden Guide 🌿 Ask me anything about NYC's " +
    "community gardens — how to find one, what grows well, or how to get involved.";

  // ========================================================
  // STEP 3: ELEMENT REFERENCES
  // ========================================================
  const widget    = document.getElementById('gg-widget');
  const launcher  = document.getElementById('gg-launcher');
  const panel     = document.getElementById('gg-panel');
  const closeBtn  = document.getElementById('gg-close');
  const messages  = document.getElementById('gg-messages');
  const form      = document.getElementById('gg-form');
  const input     = document.getElementById('gg-text');
  const sendBtn   = document.getElementById('gg-send');
  const hint      = document.getElementById('gg-hint');
  const connDot   = document.getElementById('gg-dot');
  const connLabel = document.getElementById('gg-conn');

  // ========================================================
  // STEP 4: OPEN / CLOSE THE WIDGET
  // ========================================================
  function openPanel() {
    panel.hidden = false;
    launcher.classList.add('gg-hidden');
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }
  function closePanel() {
    panel.hidden = true;
    launcher.classList.remove('gg-hidden');
  }
  launcher.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  // ========================================================
  // STEP 5: REAL-TIME DATABASE LISTENER
  // ========================================================
  // Runs every time the chat history changes in Firebase, so the
  // conversation stays in sync and survives a page reload.
  database.ref(MESSAGES_REF).on('value', function (snapshot) {
    const stored = snapshot.val() || {};

    messages.innerHTML = '';
    addBubble(GREETING, 'bot'); // greeting always first

    Object.keys(stored).forEach(function (id) {
      const m = stored[id];
      addBubble(m.text, m.sender);
    });

    // Re-add the typing indicator if a reply is still in flight, so this
    // rebuild doesn't wipe it out mid-request.
    renderTyping();

    messages.scrollTop = messages.scrollHeight;
  });

  // ========================================================
  // STEP 6: SEND A MESSAGE
  // ========================================================
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage();
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    setSending(true);
    setHint('Sending…');

    try {
      // 1) Save the visitor's message to Firebase
      await saveMessage(text, 'user');
      input.value = '';

      // 2) Ask the Garden Guide (OpenAI) for a reply
      setHint('Garden Guide is thinking…');
      showTyping(true);
      const reply = await getGardenGuideResponse(text);
      showTyping(false);

      // 3) Save the reply to Firebase (the listener renders it)
      await saveMessage(reply, 'bot');
      setHint('Ready');

    } catch (error) {
      showTyping(false);
      console.error('Garden Guide error:', error);
      setHint('Something went wrong');
      // Surface a friendly message in the thread instead of crashing
      await saveMessage('🌱 Sorry — I hit a snag: ' + error.message, 'bot');
    } finally {
      setSending(false);
      input.focus();
    }
  }

  // ========================================================
  // STEP 7: FIREBASE WRITE
  // ========================================================
  async function saveMessage(text, sender) {
    await database.ref(MESSAGES_REF).push({
      text: text,
      sender: sender,
      timestamp: Date.now()
    });
  }

  // ========================================================
  // STEP 8: OPENAI CALL  (with rate limiting + retry, from tutorial)
  // ========================================================
  async function getGardenGuideResponse(userMessage) {
    const now = Date.now();
    const sinceLast = now - lastApiCall;
    if (sinceLast < MIN_CALL_INTERVAL) {
      await new Promise(r => setTimeout(r, MIN_CALL_INTERVAL - sinceLast));
    }
    lastApiCall = Date.now();

    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await makeApiCall(userMessage);
      } catch (error) {
        attempt++;
        if (error.message.includes('429') && attempt < maxRetries) {
          const wait = Math.pow(2, attempt) * 1000;
          setHint('Rate limited — retrying in ' + (wait / 1000) + 's…');
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        throw error;
      }
    }
  }

  async function makeApiCall(userMessage) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'PASTE-YOUR-OPENAI-KEY-HERE') {
      throw new Error(
        "I'm connected to Firebase, but my OpenAI key hasn't been added yet — " +
        "so I can't generate answers. (Add it in garden-guide.js.)"
      );
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      if (response.status === 401) throw new Error('Invalid OpenAI API key (401).');
      if (response.status === 429) throw new Error('Rate limit / quota exceeded (429).');
      throw new Error('API request failed: ' + response.status + ' ' + detail);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected API response: ' + JSON.stringify(data));
    }
    return data.choices[0].message.content.trim();
  }

  // ========================================================
  // STEP 9: UI HELPERS
  // ========================================================
  function addBubble(text, sender) {
    const wrap = document.createElement('div');
    wrap.className = 'gg-msg ' + (sender === 'user' ? 'gg-user' : 'gg-bot');
    const bubble = document.createElement('div');
    bubble.className = 'gg-bubble';
    bubble.textContent = text; // textContent avoids HTML injection from chat text
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
  }

  let isTyping = false;
  // Draw the animated "…" bubble (only when a reply is in flight). Safe to
  // call repeatedly — it never creates a duplicate.
  function renderTyping() {
    if (!isTyping) return;
    if (messages.querySelector('.gg-typing')) return; // already showing
    const el = document.createElement('div');
    el.className = 'gg-msg gg-bot gg-typing';
    el.innerHTML = '<div class="gg-bubble"><i></i><i></i><i></i></div>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }
  function showTyping(on) {
    isTyping = on;
    if (on) {
      renderTyping();
    } else {
      const el = messages.querySelector('.gg-typing');
      if (el) el.remove();
    }
  }

  function setSending(disabled) {
    sendBtn.disabled = disabled;
    input.disabled = disabled;
  }
  function setHint(text) { hint.textContent = text; }

  // ========================================================
  // STEP 10: CONNECTION STATUS  (proves Firebase is connected)
  // ========================================================
  database.ref('.info/connected').on('value', function (snapshot) {
    if (snapshot.val() === true) {
      connDot.classList.remove('gg-off');
      connDot.classList.add('gg-on');
      connLabel.textContent = 'Connected';
      console.log('Garden Guide: connected to Firebase ✅');
    } else {
      connDot.classList.remove('gg-on');
      connDot.classList.add('gg-off');
      connLabel.textContent = 'Offline';
      console.log('Garden Guide: disconnected from Firebase ❌');
    }
  });

  // ========================================================
  // STEP 11: INIT
  // ========================================================
  // Draw the greeting right away so the panel is never empty, even if
  // Firebase hasn't connected yet. The real-time listener above re-draws
  // it (greeting first, then history) once the database responds.
  addBubble(GREETING, 'bot');
  setHint('Ready');

  // Only show the widget AFTER the landing page. Watch the hero section:
  // while it's on screen the launcher stays hidden; once the visitor
  // scrolls past it, the launcher fades in.
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        widget.classList.toggle('gg-revealed', !entry.isIntersecting);
      });
    }, { threshold: 0.4 });
    observer.observe(hero);
  } else {
    // No hero or no observer support → just show it.
    widget.classList.add('gg-revealed');
  }

  console.log('Garden Guide initialized 🌱');
});
