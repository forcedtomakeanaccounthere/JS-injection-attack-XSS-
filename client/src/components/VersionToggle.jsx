import { Link, useNavigate } from 'react-router-dom';
import { FaSkullCrossbones, FaShieldAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

/**
 * VersionToggle - Toggle between vulnerable and secure versions of a demo page.
 */
export default function VersionToggle({ basePath, currentMode, title, subtitle }) {
  const { dark } = useTheme();
  const isVulnerable = currentMode === 'vulnerable';

  return (
    <div className={`${isVulnerable ? 'gradient-vulnerable' : 'gradient-secure'} py-10 px-4`}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 text-sm font-medium"
          style={{
            borderColor: isVulnerable ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
            backgroundColor: isVulnerable ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            color: isVulnerable ? (dark ? '#f87171' : '#dc2626') : (dark ? '#4ade80' : '#16a34a'),
          }}
        >
          {isVulnerable ? (
            <>
              <FaSkullCrossbones className="w-4 h-4" /> Vulnerable Version
            </>
          ) : (
            <>
              <FaShieldAlt className="w-4 h-4" /> Secure Version
            </>
          )}
        </div>

        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
        {subtitle && <p className={`max-w-2xl mx-auto mb-6 ${dark ? 'text-dark-400' : 'text-gray-600'}`}>{subtitle}</p>}

        {/* Toggle */}
        <div className={`inline-flex rounded-xl overflow-hidden border ${dark ? 'border-dark-700 bg-dark-900' : 'border-gray-300 bg-white'}`}>
          <Link
            to={`${basePath}/vulnerable`}
            className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors border-r ${dark ? 'border-dark-700' : 'border-gray-300'} ${
              isVulnerable
                ? (dark ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600')
                : dark ? 'text-dark-400 hover:text-dark-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaSkullCrossbones className="w-3.5 h-3.5" />
            Vulnerable
          </Link>
          <Link
            to={`${basePath}/secure`}
            className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors ${
              !isVulnerable
                ? (dark ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600')
                : dark ? 'text-dark-400 hover:text-dark-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaShieldAlt className="w-3.5 h-3.5" />
            Secure
          </Link>
        </div>
      </div>
    </div>
  );
}
