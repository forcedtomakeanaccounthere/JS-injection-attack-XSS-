import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { HiCode, HiLightBulb, HiExternalLink, HiRefresh } from 'react-icons/hi';
import { FaSkullCrossbones, FaShieldAlt } from 'react-icons/fa';
import VersionToggle from '../components/VersionToggle';
import ConsoleLog from '../components/ConsoleLog';
import CodeBlock from '../components/CodeBlock';
import { useTheme } from '../context/ThemeContext';

const PAYLOADS = [
  { label: 'Image onerror', value: `<img src=x onerror="alert('DOM XSS!')">` },
  { label: 'SVG onload', value: `<svg onload="alert('SVG DOM XSS!')">` },
  { label: 'Bold + Script', value: `<b>Hello</b><script>alert('XSS')</script>` },
  { label: 'Iframe injection', value: `<iframe src="javascript:alert('DOM XSS')"></iframe>` },
  { label: 'Marquee + Event', value: `<marquee onstart="alert('XSS')">Hacked!</marquee>` },
  { label: 'Cookie logger', value: `<img src=x onerror="console.log('Cookie: '+document.cookie)">` },
  { label: 'Page redirect', value: `<img src=x onerror="console.log('Would redirect to attacker site')">` },
  { label: 'Style injection', value: `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:red;z-index:9999;color:white;font-size:48px;display:flex;align-items:center;justify-content:center">HACKED!</div>` },
];

export default function DOMXSS() {
  const { mode } = useParams();
  const location = useLocation();
  const { dark } = useTheme();
  const isVulnerable = mode === 'vulnerable';

  const [inputValue, setInputValue] = useState('');
  const [greetingName, setGreetingName] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [logs, setLogs] = useState([]);
  const vulnerableOutputRef = useRef(null);
  const secureOutputRef = useRef(null);

  const addLog = useCallback((type, message, details) => {
    setLogs((prev) => [
      ...prev,
      { type, message, details, timestamp: new Date().toLocaleTimeString() },
    ]);
  }, []);

  useEffect(() => {
    setLogs([
      {
        type: 'system',
        message: `Loaded ${isVulnerable ? 'VULNERABLE' : 'SECURE'} DOM-based XSS demo. ${
          isVulnerable
            ? 'User input is injected into DOM via innerHTML — JavaScript will execute!'
            : 'User input is safely rendered using textContent/React escaping.'
        }`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setGreetingName('');
    setInputValue('');
    setUrlInput('');
    // Clear vulnerable output
    if (vulnerableOutputRef.current) {
      vulnerableOutputRef.current.innerHTML = '';
    }
  }, [mode]);

  // Read from URL hash on load
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash) {
      const decoded = decodeURIComponent(hash);
      setInputValue(decoded);
      setUrlInput(decoded);
      addLog('input', `Read from URL hash: "${decoded}"`);
      renderContent(decoded);
    }
  }, [location.hash, mode]);

  const renderContent = (value) => {
    if (!value.trim()) return;

    const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\.|<img|<svg|<iframe|<div\s+style/i;

    addLog('input', `Input value: "${value}"`);

    if (xssPatterns.test(value)) {
      addLog('warning', `⚠️ Potential XSS payload detected in input!`);
    }

    if (isVulnerable) {
      // ═══ VULNERABLE: Use innerHTML — XSS will execute! ═══
      addLog('info', `Using innerHTML to render content (VULNERABLE)`);

      if (vulnerableOutputRef.current) {
        vulnerableOutputRef.current.innerHTML = `
          <div class="p-4">
            <p class="text-dark-400 text-sm mb-2">Welcome,</p>
            <div class="text-2xl font-bold text-white">${value}</div>
          </div>
        `;
      }

      addLog('danger', `innerHTML was set with raw user input: "${value.substring(0, 100)}"`);

      if (xssPatterns.test(value)) {
        setTimeout(() => {
          addLog('danger', '💀 DOM XSS executed! innerHTML rendered the malicious payload directly in the DOM.');
        }, 300);
      }
    } else {
      // ═══ SECURE: Use textContent — safe rendering ═══
      addLog('info', `Using textContent/React escaping to render content (SECURE)`);

      const sanitized = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
      setGreetingName(sanitized);

      if (value !== sanitized) {
        addLog('success', `✅ XSS payload neutralized! Dangerous HTML removed.`);
        addLog('info', `Raw: "${value}" → Sanitized: "${sanitized}"`);
      } else {
        addLog('success', `Content rendered safely using textContent.`);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Update URL hash to simulate DOM XSS vector
    window.location.hash = encodeURIComponent(inputValue);
    renderContent(inputValue);
  };

  const handleURLSimulation = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    addLog('input', `Simulating URL with hash fragment: #${urlInput}`);
    window.location.hash = encodeURIComponent(urlInput);
    setInputValue(urlInput);
    renderContent(urlInput);
  };

  const handleReset = () => {
    setInputValue('');
    setGreetingName('');
    setUrlInput('');
    window.location.hash = '';
    if (vulnerableOutputRef.current) {
      vulnerableOutputRef.current.innerHTML = '';
    }
    addLog('system', 'DOM output reset.');
  };

  return (
    <div>
      <VersionToggle
        basePath="/dom-xss"
        currentMode={mode}
        title="DOM-based XSS Attack"
        subtitle="The attack payload is executed as a result of modifying the DOM directly in the victim's browser. No server request is needed — the vulnerability exists entirely in client-side JavaScript."
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Input Forms + Payloads ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Direct Input */}
            <div className={`p-6 rounded-2xl border ${isVulnerable ? (dark ? 'border-red-900/30 bg-red-950/10' : 'border-red-200 bg-red-50') : (dark ? 'border-green-900/30 bg-green-950/10' : 'border-green-200 bg-green-50')}`}>
              <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                <HiCode className="text-primary-500" />
                Greeting Page
              </h3>
              <p className={`text-sm mb-4 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                {isVulnerable
                  ? 'Input is rendered using innerHTML — DOM XSS possible!'
                  : 'Input is rendered safely using textContent.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${dark ? 'text-dark-300' : 'text-gray-700'}`}>Enter your name</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type something..."
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm ${dark ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isVulnerable
                      ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30'
                      : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/30'
                  } disabled:cursor-not-allowed`}
                >
                  Render Greeting
                </button>
              </form>

              <button
                onClick={handleReset}
                className={`w-full mt-3 py-2 text-sm flex items-center justify-center gap-1 transition-colors ${dark ? 'text-dark-500 hover:text-dark-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <HiRefresh className="w-4 h-4" /> Reset Output
              </button>
            </div>

            {/* URL Hash Simulation */}
            <div className={`p-6 rounded-2xl border ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${dark ? 'text-dark-300' : 'text-gray-700'}`}>
                <HiExternalLink className="text-primary-500" />
                URL Fragment Injection
              </h3>
              <p className={`text-xs mb-3 ${dark ? 'text-dark-500' : 'text-gray-600'}`}>
                DOM XSS often exploits URL hash fragments (#) that are read by client-side JavaScript.
              </p>
              <form onSubmit={handleURLSimulation} className="space-y-3">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${dark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                  <span className={`text-xs shrink-0 ${dark ? 'text-dark-500' : 'text-gray-400'}`}>.../{mode}#</span>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="payload here"
                    className={`flex-1 bg-transparent text-xs focus:outline-none ${dark ? 'text-primary-400' : 'text-primary-600'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${dark ? 'bg-dark-600 hover:bg-dark-500 text-dark-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Simulate URL Visit
                </button>
              </form>
            </div>

            {/* Quick Payloads */}
            <div className={`p-6 rounded-2xl border ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dark ? 'text-dark-300' : 'text-gray-700'}`}>
                <HiLightBulb className="text-yellow-500" />
                Try These Payloads
              </h3>
              <div className="space-y-2">
                {PAYLOADS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setInputValue(p.value);
                      setUrlInput(p.value);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${dark ? 'bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-dark-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
                  >
                    <span className={`font-semibold ${dark ? 'text-dark-300' : 'text-gray-700'}`}>{p.label}:</span>
                    <br />
                    <code className={`break-all ${dark ? 'text-primary-400/80' : 'text-primary-600/80'}`}>{p.value.substring(0, 55)}{p.value.length > 55 ? '...' : ''}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Output + Console ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* DOM Output */}
            <div className={`rounded-2xl border ${isVulnerable ? (dark ? 'border-red-900/30' : 'border-red-200') : (dark ? 'border-green-900/30' : 'border-green-200')} overflow-hidden`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${dark ? 'border-dark-700' : 'border-gray-200'} ${isVulnerable ? (dark ? 'bg-red-950/10' : 'bg-red-50') : (dark ? 'bg-green-950/10' : 'bg-green-50')}`}>
                <h3 className={`font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {isVulnerable ? (
                    <><FaSkullCrossbones className={dark ? 'text-red-400' : 'text-red-600'} /> DOM Output (Vulnerable — innerHTML)</>
                  ) : (
                    <><FaShieldAlt className={dark ? 'text-green-400' : 'text-green-600'} /> DOM Output (Secure — textContent)</>
                  )}
                </h3>
              </div>

              <div className={`min-h-[200px] ${dark ? 'bg-dark-900/50' : 'bg-gray-50'}`}>
                {isVulnerable ? (
                  <div ref={vulnerableOutputRef} className="vulnerable-output min-h-[200px] flex items-center justify-center">
                    <p className={`text-sm ${dark ? 'text-dark-600' : 'text-gray-400'}`}>Enter a name above to see the greeting...</p>
                  </div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center">
                    {greetingName ? (
                      <div className="p-4 text-center">
                        <p className={`text-sm mb-2 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Welcome,</p>
                        {/* SECURE: React auto-escapes this */}
                        <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{greetingName}</p>
                      </div>
                    ) : (
                      <p className={`text-sm ${dark ? 'text-dark-600' : 'text-gray-400'}`}>Enter a name above to see the greeting...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Current URL hash display */}
              {window.location.hash && (
                <div className={`px-6 py-3 border-t ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <HiExternalLink className={`w-4 h-4 ${dark ? 'text-dark-500' : 'text-gray-400'}`} />
                    <code className={`text-xs overflow-x-auto ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                      <span className={dark ? 'text-dark-600' : 'text-gray-400'}>Current URL hash: </span>
                      <span className={dark ? 'text-primary-400' : 'text-primary-600'}>{decodeURIComponent(window.location.hash)}</span>
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* DOM Comparison */}
            <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className={`px-6 py-4 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>What Happens to the DOM</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={`p-4 border rounded-xl ${dark ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-200'}`}>
                    <h4 className="text-red-500 font-semibold mb-2">innerHTML (Vulnerable)</h4>
                    <p className={`text-xs mb-2 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Browser parses the string as HTML:</p>
                    <div className="bg-dark-900 p-3 rounded-lg">
                      <code className="text-xs text-red-300">
                        element.innerHTML = userInput;<br />
                        <span className="text-dark-600">// &lt;img onerror=...&gt; → creates an img element</span><br />
                        <span className="text-dark-600">// onerror fires → JavaScript executes!</span>
                      </code>
                    </div>
                  </div>
                  <div className={`p-4 border rounded-xl ${dark ? 'bg-green-950/10 border-green-900/30' : 'bg-green-50 border-green-200'}`}>
                    <h4 className="text-green-500 font-semibold mb-2">textContent (Secure)</h4>
                    <p className={`text-xs mb-2 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Browser treats the string as plain text:</p>
                    <div className="bg-dark-900 p-3 rounded-lg">
                      <code className="text-xs text-green-300">
                        element.textContent = userInput;<br />
                        <span className="text-dark-600">// "&lt;img onerror=...&gt;" → displayed as text</span><br />
                        <span className="text-dark-600">// No HTML parsing → No execution!</span>
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Console */}
            <ConsoleLog
              logs={logs}
              onClear={() => setLogs([])}
              title={`DOM XSS Console — ${isVulnerable ? 'Vulnerable' : 'Secure'}`}
            />

            {/* How It Works */}
            <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className={`px-6 py-4 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>How DOM-based XSS Works</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className={`text-sm space-y-2 mb-4 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>1.</strong> Attacker crafts a URL with a payload in the hash fragment (e.g., <code className={dark ? 'text-primary-400 text-xs' : 'text-primary-600 text-xs'}>#&lt;img src=x onerror=alert(1)&gt;</code>)
                  </p>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>2.</strong> Victim clicks the link — the hash is NOT sent to the server
                  </p>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>3.</strong> Client-side JavaScript reads the hash and uses <code className="text-red-500 text-xs">innerHTML</code> to insert it into the DOM
                  </p>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>4.</strong> Browser parses the HTML string, creates elements, and event handlers execute
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`${dark ? 'text-red-400' : 'text-red-600'} font-semibold text-sm mb-2`}>❌ Vulnerable Code</h4>
                    <CodeBlock
                      variant="danger"
                      title="DOM XSS Vulnerable"
                      code={`// Read from URL fragment
const name = location.hash.slice(1);

// DANGEROUS: Injects as HTML
document.getElementById('greeting')
  .innerHTML = "Hello, " + name;

// URL: page.html#<img src=x 
//   onerror="alert('Hacked!')">
// → The img tag is created in the DOM
// → onerror fires → JS executes!`}
                    />
                  </div>
                  <div>
                    <h4 className={`${dark ? 'text-green-400' : 'text-green-600'} font-semibold text-sm mb-2`}>✅ Secure Code</h4>
                    <CodeBlock
                      variant="success"
                      title="DOM XSS Secure"
                      code={`// Read from URL fragment
const name = location.hash.slice(1);

// SAFE: Treats as plain text
document.getElementById('greeting')
  .textContent = "Hello, " + name;

// Or use DOMPurify:
const clean = DOMPurify.sanitize(name);
element.innerHTML = clean;

// Or in React (auto-escapes):
<p>Hello, {name}</p>`}
                    />
                  </div>
                </div>

                {/* Additional info */}
                <div className={`p-4 border rounded-xl ${dark ? 'bg-primary-500/5 border-primary-500/20' : 'bg-orange-50 border-orange-200'}`}>
                  <h4 className={`font-semibold text-sm mb-2 ${dark ? 'text-primary-400' : 'text-primary-600'}`}>Key Difference from Other XSS Types</h4>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                    DOM-based XSS is unique because the <strong className={dark ? 'text-white' : 'text-gray-900'}>payload never reaches the server</strong>.
                    The entire attack happens in the browser. The vulnerability is in client-side JavaScript that takes data
                    from a source (like <code className={dark ? 'text-primary-400' : 'text-primary-600'}>location.hash</code>,{' '}
                    <code className={dark ? 'text-primary-400' : 'text-primary-600'}>document.referrer</code>,{' '}
                    <code className={dark ? 'text-primary-400' : 'text-primary-600'}>postMessage</code>) and passes it to a dangerous sink
                    (<code className="text-red-500">innerHTML</code>, <code className="text-red-500">eval()</code>,{' '}
                    <code className="text-red-500">document.write()</code>).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
