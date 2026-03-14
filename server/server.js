const express = require('express');
const cors = require('cors');
const xss = require('xss');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ─── In-Memory Data Store ───────────────────────────────────────────────────
let vulnerableComments = [
  {
    id: 1,
    username: 'Alice',
    comment: 'Great website! Love the design.',
    timestamp: new Date('2026-02-25T10:30:00').toISOString(),
  },
  {
    id: 2,
    username: 'Bob',
    comment: 'Very informative content about web security.',
    timestamp: new Date('2026-02-26T14:15:00').toISOString(),
  },
];

let secureComments = [
  {
    id: 1,
    username: 'Alice',
    comment: 'Great website! Love the design.',
    timestamp: new Date('2026-02-25T10:30:00').toISOString(),
  },
  {
    id: 2,
    username: 'Bob',
    comment: 'Very informative content about web security.',
    timestamp: new Date('2026-02-26T14:15:00').toISOString(),
  },
];

let vulnerableMessages = [
  {
    id: 1,
    sender: 'Admin',
    receiver: 'all',
    message: 'Welcome to the platform! Feel free to explore.',
    timestamp: new Date('2026-02-25T09:00:00').toISOString(),
  },
];

let secureMessages = [
  {
    id: 1,
    sender: 'Admin',
    receiver: 'all',
    message: 'Welcome to the platform! Feel free to explore.',
    timestamp: new Date('2026-02-25T09:00:00').toISOString(),
  },
];

const searchData = [
  { id: 1, title: 'Introduction to Web Security', category: 'Security', content: 'Web security is a critical aspect of modern web development...' },
  { id: 2, title: 'Understanding Cross-Site Scripting', category: 'XSS', content: 'Cross-Site Scripting (XSS) is one of the most common web vulnerabilities...' },
  { id: 3, title: 'React Security Best Practices', category: 'React', content: 'React provides built-in XSS protection by escaping values...' },
  { id: 4, title: 'Node.js Security Guide', category: 'Node.js', content: 'Securing Node.js applications requires attention to input validation...' },
  { id: 5, title: 'OWASP Top 10 Vulnerabilities', category: 'Security', content: 'The OWASP Top 10 is a standard awareness document for web security...' },
  { id: 6, title: 'Content Security Policy (CSP)', category: 'Security', content: 'CSP is an added layer of security that helps detect and mitigate XSS...' },
  { id: 7, title: 'JavaScript Event Handlers', category: 'JavaScript', content: 'Event handlers like onclick, onerror, and onload can be exploited in XSS attacks...' },
  { id: 8, title: 'HTML Sanitization Techniques', category: 'Security', content: 'Sanitizing HTML input is crucial for preventing stored XSS attacks...' },
  { id: 9, title: 'DOM Manipulation Security', category: 'DOM', content: 'Unsafe DOM manipulation using innerHTML can introduce XSS vulnerabilities...' },
  { id: 10, title: 'Cookie Security and HttpOnly', category: 'Security', content: 'HttpOnly cookies cannot be accessed via JavaScript, preventing XSS cookie theft...' },
];

let nextVulnCommentId = 3;
let nextSecureCommentId = 3;
let nextVulnMsgId = 2;
let nextSecureMsgId = 2;

// ─── Logging Middleware ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('  Query:', JSON.stringify(req.query));
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
//  STORED XSS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Vulnerable: Comments stored and returned as-is ─────────────────────
app.get('/api/comments/vulnerable', (req, res) => {
  console.log('  [VULNERABLE] Returning raw comments without sanitization');
  res.json({
    comments: vulnerableComments,
    log: {
      type: 'info',
      message: 'Server returned comments WITHOUT any sanitization. Raw HTML/JS will be rendered.',
    },
  });
});

app.post('/api/comments/vulnerable', (req, res) => {
  const { username, comment } = req.body;

  console.log(`  [VULNERABLE] Storing comment as-is: "${comment}"`);
  console.log('  [VULNERABLE] ⚠️  No input validation or sanitization applied!');

  const newComment = {
    id: nextVulnCommentId++,
    username: username || 'Anonymous',
    comment: comment, // NO SANITIZATION - stored as-is
    timestamp: new Date().toISOString(),
  };

  vulnerableComments.push(newComment);

  // Detect if the input contains potential XSS
  const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\./i;
  const isXSS = xssPatterns.test(comment) || xssPatterns.test(username);

  res.json({
    comment: newComment,
    log: {
      type: isXSS ? 'danger' : 'info',
      message: isXSS
        ? `⚠️ STORED XSS: Malicious payload stored in database without sanitization! Input: "${comment.substring(0, 100)}"`
        : `Comment stored as-is. No sanitization applied.`,
      raw_input: comment,
      stored_value: comment,
      sanitized: false,
    },
  });
});

// ─── Secure: Comments sanitized before storing ──────────────────────────
app.get('/api/comments/secure', (req, res) => {
  console.log('  [SECURE] Returning sanitized comments');
  res.json({
    comments: secureComments,
    log: {
      type: 'success',
      message: 'Server returned comments that were sanitized before storage.',
    },
  });
});

app.post('/api/comments/secure', (req, res) => {
  const { username, comment } = req.body;

  const sanitizedUsername = xss(username || 'Anonymous');
  const sanitizedComment = xss(comment);

  console.log(`  [SECURE] Original input: "${comment}"`);
  console.log(`  [SECURE] Sanitized output: "${sanitizedComment}"`);
  console.log('  [SECURE] ✅  Input sanitized with xss library');

  const newComment = {
    id: nextSecureCommentId++,
    username: sanitizedUsername,
    comment: sanitizedComment, // SANITIZED before storage
    timestamp: new Date().toISOString(),
  };

  secureComments.push(newComment);

  const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\./i;
  const wasXSS = xssPatterns.test(comment) || xssPatterns.test(username);

  res.json({
    comment: newComment,
    log: {
      type: wasXSS ? 'success' : 'info',
      message: wasXSS
        ? `✅ XSS BLOCKED: Malicious payload was sanitized before storage!`
        : `Comment sanitized and stored safely.`,
      raw_input: comment,
      stored_value: sanitizedComment,
      sanitized: true,
      changes: comment !== sanitizedComment ? 'Dangerous HTML tags/attributes were removed' : 'No changes needed',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  REFLECTED XSS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Vulnerable: Search term reflected without sanitization ─────────────
app.get('/api/search/vulnerable', (req, res) => {
  const { q } = req.query;

  console.log(`  [VULNERABLE] Search query reflected as-is: "${q}"`);

  const results = q
    ? searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(q.toLowerCase()) ||
          item.category.toLowerCase().includes(q.toLowerCase()) ||
          item.content.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\.|<img|<svg|<iframe/i;
  const isXSS = xssPatterns.test(q);

  res.json({
    query: q, // RAW query returned - no sanitization
    results,
    resultCount: results.length,
    // Vulnerable: server constructs HTML with raw user input
    htmlResponse: `<p>Showing results for: <strong>${q}</strong></p>`,
    log: {
      type: isXSS ? 'danger' : 'info',
      message: isXSS
        ? `⚠️ REFLECTED XSS: Search query "${q.substring(0, 80)}" reflected in response without sanitization!`
        : `Search query reflected as-is in response. No sanitization.`,
      raw_input: q,
      reflected_output: q,
      sanitized: false,
    },
  });
});

// ─── Secure: Search term sanitized before reflection ────────────────────
app.get('/api/search/secure', (req, res) => {
  const { q } = req.query;

  const sanitizedQuery = xss(q || '');

  console.log(`  [SECURE] Original query: "${q}"`);
  console.log(`  [SECURE] Sanitized query: "${sanitizedQuery}"`);

  const results = q
    ? searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(q.toLowerCase()) ||
          item.category.toLowerCase().includes(q.toLowerCase()) ||
          item.content.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\.|<img|<svg|<iframe/i;
  const wasXSS = xssPatterns.test(q);

  res.json({
    query: sanitizedQuery, // SANITIZED query returned
    results,
    resultCount: results.length,
    htmlResponse: `<p>Showing results for: <strong>${sanitizedQuery}</strong></p>`,
    log: {
      type: wasXSS ? 'success' : 'info',
      message: wasXSS
        ? `✅ REFLECTED XSS BLOCKED: Malicious query was sanitized before reflection!`
        : `Search query sanitized and reflected safely.`,
      raw_input: q,
      reflected_output: sanitizedQuery,
      sanitized: true,
      changes: q !== sanitizedQuery ? 'Dangerous HTML tags/attributes were removed' : 'No changes needed',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  MESSAGE BOARD ENDPOINTS (for additional stored XSS demo)
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/messages/vulnerable', (req, res) => {
  res.json({ messages: vulnerableMessages });
});

app.post('/api/messages/vulnerable', (req, res) => {
  const { sender, message } = req.body;
  const newMsg = {
    id: nextVulnMsgId++,
    sender: sender || 'Anonymous',
    receiver: 'all',
    message: message, // NO SANITIZATION
    timestamp: new Date().toISOString(),
  };
  vulnerableMessages.push(newMsg);
  res.json({ message: newMsg });
});

app.get('/api/messages/secure', (req, res) => {
  res.json({ messages: secureMessages });
});

app.post('/api/messages/secure', (req, res) => {
  const { sender, message } = req.body;
  const newMsg = {
    id: nextSecureMsgId++,
    sender: xss(sender || 'Anonymous'),
    receiver: 'all',
    message: xss(message), // SANITIZED
    timestamp: new Date().toISOString(),
  };
  secureMessages.push(newMsg);
  res.json({ message: newMsg });
});

// ═══════════════════════════════════════════════════════════════════════════
//  DOM XSS SUPPORT ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/user-profile', (req, res) => {
  const { name } = req.query;
  res.json({
    greeting: `Welcome, ${name}!`,
    rawName: name,
    sanitizedName: xss(name || ''),
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  RESET ENDPOINTS (for demo purposes)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/reset/comments', (req, res) => {
  vulnerableComments = [
    { id: 1, username: 'Alice', comment: 'Great website! Love the design.', timestamp: new Date('2026-02-25T10:30:00').toISOString() },
    { id: 2, username: 'Bob', comment: 'Very informative content about web security.', timestamp: new Date('2026-02-26T14:15:00').toISOString() },
  ];
  secureComments = [
    { id: 1, username: 'Alice', comment: 'Great website! Love the design.', timestamp: new Date('2026-02-25T10:30:00').toISOString() },
    { id: 2, username: 'Bob', comment: 'Very informative content about web security.', timestamp: new Date('2026-02-26T14:15:00').toISOString() },
  ];
  nextVulnCommentId = 3;
  nextSecureCommentId = 3;
  console.log('  [RESET] Comments reset to initial state');
  res.json({ message: 'Comments reset successfully' });
});

app.post('/api/reset/messages', (req, res) => {
  vulnerableMessages = [
    { id: 1, sender: 'Admin', receiver: 'all', message: 'Welcome to the platform! Feel free to explore.', timestamp: new Date('2026-02-25T09:00:00').toISOString() },
  ];
  secureMessages = [
    { id: 1, sender: 'Admin', receiver: 'all', message: 'Welcome to the platform! Feel free to explore.', timestamp: new Date('2026-02-25T09:00:00').toISOString() },
  ];
  nextVulnMsgId = 2;
  nextSecureMsgId = 2;
  console.log('  [RESET] Messages reset to initial state');
  res.json({ message: 'Messages reset successfully' });
});

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 XSS Demo Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /api/comments/vulnerable     - Get raw comments`);
  console.log(`   POST /api/comments/vulnerable     - Store raw comment`);
  console.log(`   GET  /api/comments/secure          - Get sanitized comments`);
  console.log(`   POST /api/comments/secure          - Store sanitized comment`);
  console.log(`   GET  /api/search/vulnerable?q=     - Reflected search (raw)`);
  console.log(`   GET  /api/search/secure?q=         - Reflected search (sanitized)`);
  console.log(`   GET  /api/user-profile?name=       - DOM XSS support`);
  console.log(`   POST /api/reset/comments           - Reset comment data`);
  console.log(`   POST /api/reset/messages           - Reset message data`);
  console.log(`   GET  /api/health                   - Health check\n`);
});
