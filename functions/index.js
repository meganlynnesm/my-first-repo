// ============================================================
// Garden Guide — secure Cloud Function
// ------------------------------------------------------------
// Based on the CDW "04 Firebase Functions" tutorial. This is the
// server-side half: the browser calls this function, and THIS function
// calls OpenAI using a key that lives only on Google's servers. The key
// is never sent to the browser, so it can't be stolen from the page.
//
// The tutorial used the old `functions.config().openai.key` method, which
// Google retired in 2026. This file uses the current replacement —
// `defineSecret` — which does the same job: keep the key on the server.
// ============================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');

// Run in the default region and cap instances so a runaway loop can't
// quietly rack up a huge bill.
setGlobalOptions({ region: 'us-central1', maxInstances: 5 });

// The OpenAI key, stored as a Firebase secret (set via the CLI, see README).
const OPENAI_KEY = defineSecret('OPENAI_KEY');

// The persona lives on the server now — the browser can't change it.
const SYSTEM_PROMPT =
  "You are Garden Guide, a warm, knowledgeable assistant for a Columbia " +
  "GSAPP 'Green Thumbs' project about New York City's GreenThumb community " +
  "gardens. You help visitors understand NYC's 635 community gardens, urban " +
  "and community gardening, native and pollinator plants, composting, and how " +
  "to get involved with a garden near them. Keep answers short (2-4 sentences), " +
  "friendly, and encouraging. If a question is outside gardening or the project, " +
  "gently steer back to the gardens.";

exports.chatWithAI = onCall({ secrets: [OPENAI_KEY] }, async (request) => {
  // 1) Require a signed-in user (this is what stops strangers from
  //    calling your function and spending your money).
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in to chat with Garden Guide.');
  }

  // 2) Validate the message.
  const message = request.data && request.data.message;
  if (!message || typeof message !== 'string' || message.length > 500) {
    throw new HttpsError('invalid-argument', 'A text message (max 500 characters) is required.');
  }

  // 3) Call OpenAI. Node 20 has fetch built in, so no extra package needed.
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_KEY.value()  // key stays on the server
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', response.status, errText);
      throw new HttpsError('internal', 'OpenAI request failed (' + response.status + ').');
    }

    const data = await response.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message
      && data.choices[0].message.content;
    if (!reply) {
      throw new HttpsError('internal', 'Unexpected response from OpenAI.');
    }

    // Log for monitoring (visible in the Firebase console → Functions → Logs).
    console.log('Garden Guide replied to user ' + request.auth.uid);

    return { reply: reply.trim() };

  } catch (err) {
    if (err instanceof HttpsError) throw err;         // pass our own errors through
    console.error('chatWithAI unexpected error:', err);
    throw new HttpsError('internal', 'Failed to get a reply. Please try again.');
  }
});
