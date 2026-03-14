import { useState } from 'react';
import { HiClipboard, HiCheck } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

/**
 * CodeBlock - Styled code display with copy button.
 * Always uses dark terminal aesthetic but adapts border to theme.
 */
export default function CodeBlock({ code, language = 'javascript', title, variant = 'default' }) {
  const [copied, setCopied] = useState(false);
  const { dark } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const borderColor = {
    default: dark ? 'border-dark-700' : 'border-gray-300',
    danger: dark ? 'border-red-900/50' : 'border-red-300',
    success: dark ? 'border-green-900/50' : 'border-green-300',
  }[variant];

  const headerBg = {
    default: 'bg-dark-800',
    danger: 'bg-red-950/30',
    success: 'bg-green-950/30',
  }[variant];

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${headerBg} border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          {/* Terminal dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-dark-400 ml-2">
            {title || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-dark-500 hover:text-dark-300 transition-colors p-1"
          title="Copy code"
        >
          {copied ? (
            <HiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <HiClipboard className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Code */}
      <div className="bg-[#0d1117] p-4 overflow-x-auto">
        <pre className="code-block text-sm leading-relaxed">
          <code className="text-dark-300">{code}</code>
        </pre>
      </div>
    </div>
  );
}
