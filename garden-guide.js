// ============================================================
// Garden Guide — chat bot for the Green Thumbs project (SECURE version)
// ------------------------------------------------------------
// Adapted from the CDW tutorials "02 Chat Bot" + "04 Firebase Functions".
//
// What changed from the earlier version:
//   • The OpenAI key is GONE from this file. Replies now come from a
//     Cloud Function (functions/index.js) that holds the key server-side.
//   • Visitors sign in with Google before chatting, so strangers can't
//     run up the OpenAI bill.
//   • Message history still lives in the Firebase Realtime Database, and
//     the widget still fades in after the landing page.
//
// Uses the Firebase *compat* SDK (app + database + auth + functions),
// loaded in index.html. Do NOT add ES-module `import` lines here.
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ========================================================
  // STEP 1: FIREBASE SETUP  (your real project)
  // ========================================================
  const firebaseConfig = {
    apiKey: "AIzaSyBSn-BcM5pkaFafHXBNHMY6TTfzTgksRUQ",
    authDomain: "chatty-garden-bot.firebaseapp.com",
    projectId: "chatty-garden-bot",
    storageBucket: "chatty-garden-bot.firebasestorage.app",
    messagingSenderId: "647378413700",
    appId: "1:647378413700:web:fdc597861682bfff093ad1",
    databaseURL: "https://chatty-garden-bot-default-rtdb.firebaseio.com"
  };

  firebase.initializeApp(firebaseConfig);
  const database  = firebase.database();
  const auth      = firebase.auth();
  const functions = firebase.functions(); // default region: us-central1

  // ========================================================
  // STEP 2: NO OPENAI KEY HERE
  // ========================================================
  // Replies are produced by the "chatWithAI" Cloud Function. The key lives
  // on the server (set with `firebase functions:secrets:set OPENAI_KEY`),
  // so there is nothing secret in this file anymore.

  // Where messages live in the database (matches the tutorial's structure)
  const MESSAGES_REF = 'chat/messages';

  // The greeting that always sits at the top of the thread
  const GREETING = "Hi! I'm your Garden Guide 🌿 Ask me anything about NYC's " +
    "community gardens - how to find one, what grows well, or how to get involved!";

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
  const signInBtn = document.getElementById('gg-signin');
  const signOutBtn= document.getElementById('gg-signout');
  const userBar   = document.getElementById('gg-userbar');
  const userLabel = document.getElementById('gg-user');

  // ========================================================
  // STEP 4: OPEN / CLOSE THE WIDGET
  // ========================================================
  function openPanel() {
    panel.hidden = false;
    launcher.classList.add('gg-hidden');
    if (!input.disabled) input.focus();
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
  database.ref(MESSAGES_REF).on('value', function (snapshot) {
    const stored = snapshot.val() || {};

    messages.innerHTML = '';
    addBubble(GREETING, 'bot'); // greeting always first

    Object.keys(stored).forEach(function (id) {
      const m = stored[id];
      addBubble(m.text, m.sender);
    });

    renderTyping(); // keep the "thinking…" bubble if a reply is in flight
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

    // Must be signed in (the Cloud Function refuses anonymous requests).
    if (!auth.currentUser) {
      setHint('Please sign in to chat');
      return;
    }

    setSending(true);
    setHint('Sending…');

    try {
      // 1) Save the visitor's message to Firebase
      await saveMessage(text, 'user');
      input.value = '';

      // 2) Ask the secure Cloud Function for a reply
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
      await saveMessage('🌱 Sorry — I hit a snag: ' + error.message, 'bot');
    } finally {
      setSending(false);
      if (auth.currentUser) input.focus();
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
  // STEP 8: SECURE REPLY  (calls the Cloud Function, not OpenAI directly)
  // ========================================================
  async function getGardenGuideResponse(userMessage) {
    const chatWithAI = functions.httpsCallable('chatWithAI');
    try {
      const result = await chatWithAI({ message: userMessage });
      return result.data.reply;
    } catch (error) {
      // Turn Firebase's error codes into friendly messages
      if (error.code === 'functions/unauthenticated') {
        throw new Error('Please sign in to chat with Garden Guide.');
      } else if (error.code === 'functions/resource-exhausted') {
        throw new Error('Rate limit reached — please wait a moment and try again.');
      } else if (error.code === 'functions/invalid-argument') {
        throw new Error('That message could not be sent. Try rephrasing.');
      } else if (error.code === 'functions/not-found') {
        throw new Error('The Garden Guide function isn\'t deployed yet.');
      }
      throw new Error(error.message || 'Failed to get a reply.');
    }
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
  function renderTyping() {
    if (!isTyping) return;
    if (messages.querySelector('.gg-typing')) return;
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
  // STEP 10: CONNECTION STATUS
  // ========================================================
  database.ref('.info/connected').on('value', function (snapshot) {
    if (snapshot.val() === true) {
      connDot.classList.remove('gg-off');
      connDot.classList.add('gg-on');
      connLabel.textContent = 'Connected';
    } else {
      connDot.classList.remove('gg-on');
      connDot.classList.add('gg-off');
      connLabel.textContent = 'Offline';
    }
  });

  // ========================================================
  // STEP 11: GOOGLE SIGN-IN
  // ========================================================
  const provider = new firebase.auth.GoogleAuthProvider();

  signInBtn.addEventListener('click', function () {
    auth.signInWithPopup(provider).catch(function (error) {
      console.error('Sign-in error:', error);
      setHint('Sign-in failed: ' + error.message);
    });
  });
  signOutBtn.addEventListener('click', function () {
    auth.signOut();
  });

  // React to sign-in / sign-out: only signed-in visitors can type.
  auth.onAuthStateChanged(function (user) {
    if (user) {
      signInBtn.hidden = true;
      userBar.hidden = false;
      userLabel.textContent = 'Signed in as ' + (user.displayName || user.email || 'you');
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = 'Ask about NYC gardens…';
      setHint('Ready');
      if (!panel.hidden) input.focus();
    } else {
      signInBtn.hidden = false;
      userBar.hidden = true;
      input.disabled = true;
      sendBtn.disabled = true;
      input.placeholder = 'Sign in to chat…';
      setHint('Sign in to start chatting');
    }
  });

  // ========================================================
  // STEP 12: INIT
  // ========================================================
  addBubble(GREETING, 'bot');

  // Only show the widget AFTER the landing page (watch the hero section).
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        widget.classList.toggle('gg-revealed', !entry.isIntersecting);
      });
    }, { threshold: 0.4 });
    observer.observe(hero);
  } else {
    widget.classList.add('gg-revealed');
  }

  console.log('Garden Guide (secure) initialized 🌱');
});
