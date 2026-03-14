import { HiCode } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { dark } = useTheme();

  return (
    <footer className={`border-t transition-colors ${dark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <HiCode className="text-white" />
              </div>
              <span className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>XSS Attack Demo</span>
            </div>
            <p className={`text-sm leading-relaxed ${dark ? 'text-dark-400' : 'text-gray-600'}`}>
              A comprehensive demonstration of Cross-Site Scripting (XSS) vulnerabilities
              and their mitigations for educational purposes.
            </p>
          </div>

          {/* Project Links */}
          <div>
            <h4 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Project Repository</h4>
            <a
              href="https://github.com/forcedtomakeanaccounthere/JS-injection-attack-XSS-"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 hover:text-primary-400 transition-colors text-sm ${dark ? 'text-dark-400' : 'text-gray-600'}`}
            >
              <FaGithub className="text-lg" />
              View on GitHub
            </a>
            <div className="mt-4">
              <p className={`text-xs ${dark ? 'text-dark-500' : 'text-gray-500'}`}>
                ⚠️ This project is for educational purposes only.
                <br />
                Do not use these techniques on real applications.
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t text-center ${dark ? 'border-dark-800 text-dark-500' : 'border-gray-200 text-gray-500'}`}>
          <p className="text-sm">
            © {new Date().getFullYear()} XSS Attack Demonstration Project. Built for Information Security coursework.
          </p>
        </div>
      </div>
    </footer>
  );
}
