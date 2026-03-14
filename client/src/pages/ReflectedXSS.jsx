import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { HiSearch, HiLightBulb, HiExternalLink } from 'react-icons/hi';
import { FaSkullCrossbones, FaShieldAlt } from 'react-icons/fa';
import VersionToggle from '../components/VersionToggle';
import ConsoleLog from '../components/ConsoleLog';
import CodeBlock from '../components/CodeBlock';
import { useTheme } from '../context/ThemeContext';

const PAYLOADS = [
  { label: 'Script Alert', value: `<script>alert('Reflected XSS!')</script>` },
  { label: 'Image onerror', value: `<img src=x onerror="alert('Reflected!')">` },
  { label: 'SVG onload', value: `<svg/onload=alert('SVG!')>` },
  { label: 'Iframe injection', value: `<iframe src="javascript:alert('XSS')">` },
  { label: 'Event handler', value: `"><img src=x onerror=alert('XSS')>` },
  { label: 'Body onload', value: `<body onload="alert('XSS')">` },
  { label: 'Cookie exfiltration', value: `<img src=x onerror="console.log('Cookie: '+document.cookie)">` },
  { label: 'Encoded payload', value: `<img src=x onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;">` },
];

export default function ReflectedXSS() {
  const { mode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dark } = useTheme();
  const isVulnerable = mode === 'vulnerable';

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

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
        message: `Loaded ${isVulnerable ? 'VULNERABLE' : 'SECURE'} Reflected XSS demo. ${
          isVulnerable
            ? 'Search terms are reflected in the page without sanitization!'
            : 'Search terms are sanitized before being reflected back.'
        }`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setResults([]);
    setSearchResponse(null);
    setSearched(false);
    setQuery(searchParams.get('q') || '');
  }, [mode]);

  // Auto-search if URL has query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams.get('q'), mode]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);

    addLog('input', `Search submitted: "${searchQuery}"`);

    const xssPatterns = /<script|onerror|onload|onclick|onmouseover|javascript:|eval\(|document\.|window\.|<img|<svg|<iframe/i;
    if (xssPatterns.test(searchQuery)) {
      addLog('warning', `⚠️ Potential XSS payload detected in search query!`);
    }

    try {
      const endpoint = isVulnerable ? '/api/search/vulnerable' : '/api/search/secure';
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      setResults(data.results || []);
      setSearchResponse(data);

      if (data.log) {
        addLog(data.log.type, data.log.message);
        if (data.log.raw_input !== data.log.reflected_output) {
          addLog('info', `Raw: "${data.log.raw_input}" → Reflected: "${data.log.reflected_output}"`);
        }
      }

      addLog('info', `Found ${data.resultCount} results for query.`);

      // For vulnerable mode, warn about reflection
      if (isVulnerable && xssPatterns.test(searchQuery)) {
        setTimeout(() => {
          addLog('danger', '💀 XSS payload was reflected in the page without sanitization. Malicious code may have executed!');
        }, 300);
      }
    } catch (err) {
      addLog('danger', `Search failed: ${err.message}`);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search query (this is how reflected XSS typically works)
    setSearchParams({ q: query });
    performSearch(query);
  };

  const renderSearchResult = () => {
    if (!searched || !searchResponse) return null;

    return (
      <div className="mt-6">
        {/* Reflected search term display */}
        <div className={`p-4 rounded-xl border mb-6 ${isVulnerable ? (dark ? 'border-red-900/30 bg-red-950/10' : 'border-red-200 bg-red-50') : (dark ? 'border-green-900/30 bg-green-950/10' : 'border-green-200 bg-green-50')}`}>
          <p className={`text-sm mb-2 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Search results for:</p>
          {isVulnerable ? (
            // VULNERABLE: Render raw HTML from server response
            <div
              className={`vulnerable-output text-lg font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}
              dangerouslySetInnerHTML={{ __html: searchResponse.htmlResponse }}
            />
          ) : (
            // SECURE: Sanitize before rendering
            <p className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
              {DOMPurify.sanitize(searchResponse.query, { ALLOWED_TAGS: [] })}
            </p>
          )}
        </div>

        {/* URL preview showing reflected parameter */}
        <div className={`p-3 rounded-lg border mb-6 flex items-center gap-2 overflow-x-auto ${dark ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'}`}>
          <HiExternalLink className={`w-4 h-4 shrink-0 ${dark ? 'text-dark-500' : 'text-gray-400'}`} />
          <code className={`text-xs ${dark ? 'text-dark-400' : 'text-gray-500'}`}>
            <span className={dark ? 'text-dark-600' : 'text-gray-400'}>
              {window.location.origin}{window.location.pathname}
            </span>
            <span className={dark ? 'text-primary-400' : 'text-primary-600'}>?q={encodeURIComponent(query)}</span>
          </code>
        </div>

        {/* Search results */}
        {results.length === 0 ? (
          <div className="text-center py-10">
            <p className={dark ? 'text-dark-500' : 'text-gray-400'}>No articles found matching your search.</p>
            <p className={`text-sm mt-1 ${dark ? 'text-dark-600' : 'text-gray-500'}`}>Try searching for "security", "XSS", "React", or "OWASP"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.id} className={`p-4 border rounded-xl transition-colors ${dark ? 'bg-dark-800 border-dark-700 hover:border-dark-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 bg-primary-500/10 ${dark ? 'text-primary-400' : 'text-primary-600'} rounded-full font-medium`}>{r.category}</span>
                </div>
                <h4 className={`font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {isVulnerable ? (
                    <span dangerouslySetInnerHTML={{ __html: highlightMatch(r.title, searchResponse.query) }} />
                  ) : (
                    highlightMatchSafe(r.title, searchResponse.query)
                  )}
                </h4>
                <p className={`text-sm leading-relaxed ${dark ? 'text-dark-400' : 'text-gray-600'}`}>{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <VersionToggle
        basePath="/reflected-xss"
        currentMode={mode}
        title="Reflected XSS Attack"
        subtitle="The attack payload is part of the URL or form submission and is reflected back in the server's response. This demo uses a search page where the query is reflected without proper encoding."
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Search + Payloads ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-2xl border ${isVulnerable ? (dark ? 'border-red-900/30 bg-red-950/10' : 'border-red-200 bg-red-50') : (dark ? 'border-green-900/30 bg-green-950/10' : 'border-green-200 bg-green-50')}`}>
              <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                <HiSearch className="text-primary-500" />
                Search Articles
              </h3>
              <p className={`text-sm mb-4 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                {isVulnerable
                  ? 'Search term is reflected in the page without encoding!'
                  : 'Search term is sanitized before being displayed.'}
              </p>

              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for articles..."
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-sm pr-10 ${dark ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />
                  <HiSearch className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-dark-500' : 'text-gray-400'}`} />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isVulnerable
                      ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30'
                      : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/30'
                  } disabled:cursor-not-allowed`}
                >
                  {loading ? 'Searching...' : 'Search'}
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
                    onClick={() => setQuery(p.value)}
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

          {/* ── Right: Results + Console ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Results */}
            <div className={`rounded-2xl border ${isVulnerable ? (dark ? 'border-red-900/30' : 'border-red-200') : (dark ? 'border-green-900/30' : 'border-green-200')} overflow-hidden`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${dark ? 'border-dark-700' : 'border-gray-200'} ${isVulnerable ? (dark ? 'bg-red-950/10' : 'bg-red-50') : (dark ? 'bg-green-950/10' : 'bg-green-50')}`}>
                <h3 className={`font-bold flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {isVulnerable ? (
                    <><FaSkullCrossbones className={dark ? 'text-red-400' : 'text-red-600'} /> Search Results (Vulnerable)</>
                  ) : (
                    <><FaShieldAlt className={dark ? 'text-green-400' : 'text-green-600'} /> Search Results (Secure)</>
                  )}
                </h3>
                {searched && (
                  <span className={`text-sm ${dark ? 'text-dark-500' : 'text-gray-400'}`}>{results.length} results</span>
                )}
              </div>
              <div className={`p-6 min-h-[200px] ${dark ? 'bg-dark-900/50' : 'bg-gray-50'}`}>
                {!searched ? (
                  <div className="text-center py-10">
                    <HiSearch className={`w-12 h-12 mx-auto mb-3 ${dark ? 'text-dark-700' : 'text-gray-300'}`} />
                    <p className={dark ? 'text-dark-500' : 'text-gray-500'}>Enter a search term to see results</p>
                    <p className={`text-sm mt-1 ${dark ? 'text-dark-600' : 'text-gray-400'}`}>Try legitimate searches like "security" or XSS payloads</p>
                  </div>
                ) : (
                  renderSearchResult()
                )}
              </div>
            </div>

            {/* Console */}
            <ConsoleLog
              logs={logs}
              onClear={() => setLogs([])}
              title={`Reflected XSS Console — ${isVulnerable ? 'Vulnerable' : 'Secure'}`}
            />

            {/* How It Works */}
            <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className={`px-6 py-4 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>How Reflected XSS Works</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className={`text-sm space-y-2 mb-4 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>1.</strong> Attacker crafts a URL with a malicious script in the query parameter
                  </p>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>2.</strong> Victim clicks the link (e.g., from a phishing email)
                  </p>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>3.</strong> Server reflects the query in the response page without sanitization
                  </p>
                  <p>
                    <strong className={dark ? 'text-white' : 'text-gray-900'}>4.</strong> Browser executes the reflected script in the victim's session
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`${dark ? 'text-red-400' : 'text-red-600'} font-semibold text-sm mb-2`}>❌ Vulnerable Code</h4>
                    <CodeBlock
                      variant="danger"
                      title="Vulnerable Search"
                      code={`// Server reflects raw query
app.get('/search', (req, res) => {
  const q = req.query.q;
  res.send(\`Results for: \${q}\`);
  // No encoding!
});

// Client renders raw HTML
<div dangerouslySetInnerHTML={{
  __html: response.htmlResponse
}} />`}
                    />
                  </div>
                  <div>
                    <h4 className={`${dark ? 'text-green-400' : 'text-green-600'} font-semibold text-sm mb-2`}>✅ Secure Code</h4>
                    <CodeBlock
                      variant="success"
                      title="Secure Search"
                      code={`// Server sanitizes query
const xss = require('xss');
app.get('/search', (req, res) => {
  const q = xss(req.query.q);
  res.send(\`Results for: \${q}\`);
});

// Client uses textContent
<p>{DOMPurify.sanitize(
  query, { ALLOWED_TAGS: [] }
)}</p>`}
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

// ── Helpers ──

function highlightMatch(text, query) {
  if (!query) return text;
  // WARNING: This is intentionally vulnerable - it inserts raw query into HTML
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-primary-500/30 text-primary-300 rounded px-0.5">$1</mark>');
  } catch {
    return text;
  }
}

function highlightMatchSafe(text, query) {
  if (!query) return text;
  const cleanQuery = DOMPurify.sanitize(query, { ALLOWED_TAGS: [] });
  if (!cleanQuery) return text;
  try {
    const parts = text.split(new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === cleanQuery.toLowerCase() ? (
        <mark key={i} className="bg-primary-500/30 text-primary-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
}
