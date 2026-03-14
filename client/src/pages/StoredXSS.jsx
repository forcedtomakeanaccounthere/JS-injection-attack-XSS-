import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { HiChat, HiRefresh, HiLightBulb } from 'react-icons/hi';
import { FaSkullCrossbones, FaShieldAlt } from 'react-icons/fa';
import VersionToggle from '../components/VersionToggle';
import ConsoleLog from '../components/ConsoleLog';
import CodeBlock from '../components/CodeBlock';
import { useTheme } from '../context/ThemeContext';

const PAYLOADS = [
  { label: 'Script Alert', value: `<script>alert('XSS Stored!')</script>` },
  { label: 'Image onerror', value: `<img src=x onerror="alert('XSS via img!')">` },
  { label: 'SVG onload', value: `<svg onload="alert('SVG XSS!')">` },
  { label: 'Body background', value: `<body background="javascript:alert('XSS')">` },
  { label: 'Styled div', value: `<div style="background:url('javascript:alert(1)')">Click me</div>` },
  { label: 'Cookie Stealer', value: `<img src=x onerror="console.log('Stolen cookie: ' + document.cookie)">` },
  { label: 'Keylogger', value: `<img src=x onerror="document.onkeypress=function(e){console.log('Key logged: '+e.key)}">` },
  { label: 'DOM Defacement', value: `<img src=x onerror="document.querySelector('h1').textContent='HACKED!'">` },
];

export default function StoredXSS() {
  const { mode } = useParams();
  const { dark } = useTheme();
  const isVulnerable = mode === 'vulnerable';
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const outputRef = useRef(null);

  const addLog = useCallback((type, message, details) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        message,
        details,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Fetch comments on mount and mode change
  useEffect(() => {
    fetchComments();
    setLogs([
      {
        type: 'system',
        message: `Loaded ${isVulnerable ? 'VULNERABLE' : 'SECURE'} Stored XSS demo. ${
          isVulnerable
            ? 'Comments are rendered without sanitization — XSS payloads will execute!'
            : 'Comments are sanitized with DOMPurify (client) + xss library (server).'
        }`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [mode]);

  const fetchComments = async () => {
    try {
      const endpoint = isVulnerable ? '/api/comments/vulnerable' : '/api/comments/secure';
      const res = await fetch(endpoint);
      const data = await res.json();
      setComments(data.comments || []);
      if (data.log) {
        addLog(data.log.type, data.log.message);
      }
    } catch (err) {
      addLog('danger', `Failed to fetch comments: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);

    addLog('input', `User submitted — Username: "${username || 'Anonymous'}", Comment: "${comment}"`);

    // Check if it looks like XSS
    const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\./i;
    if (xssPatterns.test(comment) || xssPatterns.test(username)) {
      addLog('warning', `⚠️ Potential XSS payload detected in input!`);
    }

    try {
      const endpoint = isVulnerable ? '/api/comments/vulnerable' : '/api/comments/secure';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || 'Anonymous', comment }),
      });
      const data = await res.json();

      if (data.log) {
        addLog(data.log.type, data.log.message, data.log.changes);
        if (data.log.raw_input !== data.log.stored_value) {
          addLog(
            'info',
            `Raw input: "${data.log.raw_input}" → Stored as: "${data.log.stored_value}"`
          );
        }
      }

      // Refresh comments
      await fetchComments();

      // If vulnerable, note that XSS may have executed
      if (isVulnerable && xssPatterns.test(comment)) {
        setTimeout(() => {
          addLog('danger', '💀 XSS payload was stored and rendered without sanitization. Malicious code executed in the browser!');
        }, 500);
      }

      setComment('');
      setUsername('');
    } catch (err) {
      addLog('danger', `Failed to post comment: ${err.message}`);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    try {
      await fetch('/api/reset/comments', { method: 'POST' });
      await fetchComments();
      addLog('system', 'Comments reset to initial state.');
    } catch (err) {
      addLog('danger', `Reset failed: ${err.message}`);
    }
  };

  // Render a comment based on mode
  const renderComment = (c) => {
    if (isVulnerable) {
      // VULNERABLE: Use dangerouslySetInnerHTML — XSS will execute
      return (
        <div
          className={`vulnerable-output text-sm ${dark ? 'text-dark-300' : 'text-gray-600'}`}
          dangerouslySetInnerHTML={{ __html: c.comment }}
        />
      );
    } else {
      // SECURE: Sanitize with DOMPurify before rendering
      const clean = DOMPurify.sanitize(c.comment, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      return <p className={`text-sm ${dark ? 'text-dark-300' : 'text-gray-600'}`}>{clean}</p>;
    }
  };

  return (
    <div>
      <VersionToggle
        basePath="/stored-xss"
        currentMode={mode}
        title="Stored XSS Attack"
        subtitle="Malicious scripts are permanently stored on the server and execute whenever a user views the content. This demo uses a comment board to demonstrate the attack."
      />

      <div className={`max-w-6xl mx-auto px-4 py-10 ${dark ? '' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Comment Form ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-2xl border ${isVulnerable ? (dark ? 'border-red-900/30 bg-red-950/10' : 'border-red-200 bg-red-50') : (dark ? 'border-green-900/30 bg-green-950/10' : 'border-green-200 bg-green-50')}`}>
              <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                <HiChat className={dark ? 'text-primary-400' : 'text-primary-600'} />
                Post a Comment
              </h3>
              <p className={`text-sm mb-4 ${dark ? 'text-dark-500' : 'text-gray-600'}`}>
                {isVulnerable
                  ? 'No sanitization applied — try injecting XSS!'
                  : 'Input is sanitized before storage and rendering.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dark ? 'text-dark-300' : 'text-gray-700'}`}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm ${dark ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dark ? 'text-dark-300' : 'text-gray-700'}`}>Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment..."
                    rows={4}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm resize-none ${dark ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isVulnerable
                      ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30'
                      : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/30'
                  } disabled:cursor-not-allowed`}
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              <button
                onClick={handleReset}
                className={`w-full mt-3 py-2 text-sm flex items-center justify-center gap-1 transition-colors ${dark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <HiRefresh className="w-4 h-4" /> Reset Comments
              </button>
            </div>

            {/* Quick XSS Payloads */}
            <div className={`p-6 rounded-2xl border ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dark ? 'text-dark-300' : 'text-gray-700'}`}>
                <HiLightBulb className="text-yellow-400" />
                Try These Payloads
              </h3>
              <div className="space-y-2">
                {PAYLOADS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setComment(p.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${dark ? 'bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-dark-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
                  >
                    <span className={`font-semibold ${dark ? 'text-dark-300' : 'text-gray-700'}`}>{p.label}:</span>
                    <br />
                    <code className={`break-all ${dark ? 'text-primary-400/80' : 'text-primary-600/90'}`}>{p.value.substring(0, 60)}{p.value.length > 60 ? '...' : ''}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Comments Display + Console ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comments List */}
            <div className={`rounded-2xl border ${isVulnerable ? (dark ? 'border-red-900/30' : 'border-red-200') : (dark ? 'border-green-900/30' : 'border-green-200')} overflow-hidden`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${dark ? 'border-dark-700' : 'border-gray-200'} ${isVulnerable ? (dark ? 'bg-red-950/10' : 'bg-red-50') : (dark ? 'bg-green-950/10' : 'bg-green-50')}`}>
                <h3 className={`font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {isVulnerable ? (
                    <><FaSkullCrossbones className={dark ? 'text-red-400' : 'text-red-600'} /> Comments (Vulnerable)</>
                  ) : (
                    <><FaShieldAlt className={dark ? 'text-green-400' : 'text-green-600'} /> Comments (Secure)</>
                  )}
                </h3>
                <span className={`text-sm ${dark ? 'text-dark-500' : 'text-gray-400'}`}>{comments.length} comments</span>
              </div>

              <div ref={outputRef} className={`divide-y max-h-[28rem] overflow-y-auto ${dark ? 'bg-dark-900/50 divide-dark-800' : 'bg-gray-50 divide-gray-200'}`}>
                {comments.length === 0 ? (
                  <p className={`text-sm p-6 text-center ${dark ? 'text-dark-500' : 'text-gray-400'}`}>No comments yet. Be the first to post!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center ${dark ? 'text-primary-400' : 'text-primary-600'} text-sm font-bold`}>
                          {(c.username || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                            {isVulnerable ? (
                              <span dangerouslySetInnerHTML={{ __html: c.username }} />
                            ) : (
                              DOMPurify.sanitize(c.username, { ALLOWED_TAGS: [] })
                            )}
                          </span>
                          <span className={`text-xs ml-2 ${dark ? 'text-dark-600' : 'text-gray-400'}`}>
                            {new Date(c.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {renderComment(c)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Console Log */}
            <ConsoleLog
              logs={logs}
              onClear={() => setLogs([])}
              title={`Stored XSS Console — ${isVulnerable ? 'Vulnerable' : 'Secure'}`}
            />

            {/* How It Works */}
            <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className={`px-6 py-4 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>How Stored XSS Works</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`${dark ? 'text-red-400' : 'text-red-600'} font-semibold text-sm mb-2`}>❌ Vulnerable Code</h4>
                    <CodeBlock
                      variant="danger"
                      title="Vulnerable Rendering"
                      code={`// Server: No sanitization
app.post('/api/comments', (req, res) => {
  const { comment } = req.body;
  db.store(comment); // Stored as-is!
});

// Client: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{
  __html: comment  // XSS executes!
}} />`}
                    />
                  </div>
                  <div>
                    <h4 className={`${dark ? 'text-green-400' : 'text-green-600'} font-semibold text-sm mb-2`}>✅ Secure Code</h4>
                    <CodeBlock
                      variant="success"
                      title="Secure Rendering"
                      code={`// Server: Sanitize before storage
const xss = require('xss');
app.post('/api/comments', (req, res) => {
  const clean = xss(req.body.comment);
  db.store(clean); // Sanitized!
});

// Client: DOMPurify + textContent
const clean = DOMPurify.sanitize(comment);
<p>{clean}</p> // Safe rendering`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
