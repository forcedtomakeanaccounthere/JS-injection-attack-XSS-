import { useEffect, useRef } from 'react';
import { HiTerminal, HiTrash } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

/**
 * ConsoleLog - A terminal-style console panel for displaying XSS demo logs.
 * Always uses dark terminal aesthetic.
 */
export default function ConsoleLog({ logs = [], onClear, title = 'Console Output' }) {
  const bottomRef = useRef(null);
  const { dark } = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type) => {
    switch (type) {
      case 'danger':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'input':
        return 'text-blue-400';
      case 'system':
        return 'text-purple-400';
      default:
        return 'text-dark-400';
    }
  };

  const getLogPrefix = (type) => {
    switch (type) {
      case 'danger':
        return '✗ ERROR';
      case 'success':
        return '✓ SAFE ';
      case 'warning':
        return '⚠ WARN ';
      case 'input':
        return '→ INPUT';
      case 'system':
        return '● SYS  ';
      default:
        return 'ℹ INFO ';
    }
  };

  return (
    <div className={`bg-[#0d1117] rounded-xl border overflow-hidden ${dark ? 'border-dark-700' : 'border-gray-300'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <HiTerminal className="text-primary-500" />
          <span className="text-sm font-medium text-dark-300">{title}</span>
          <span className="text-xs bg-dark-700 text-dark-400 px-2 py-0.5 rounded-full">
            {logs.length} entries
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-dark-500 hover:text-dark-300 transition-colors p-1"
          title="Clear console"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Log entries */}
      <div className="console-panel p-4 max-h-72 overflow-y-auto min-h-[120px]">
        {logs.length === 0 ? (
          <p className="text-dark-600 italic text-sm">
            Waiting for actions... Try submitting a form or searching to see logs here.
          </p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1.5 flex gap-2">
              <span className="text-dark-600 shrink-0 text-xs mt-0.5">
                {log.timestamp || new Date().toLocaleTimeString()}
              </span>
              <span className={`shrink-0 font-semibold text-xs mt-0.5 ${getLogColor(log.type)}`}>
                [{getLogPrefix(log.type)}]
              </span>
              <span className={`${getLogColor(log.type)} text-xs leading-relaxed`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        {logs.length > 0 && logs[logs.length - 1].details && (
          <div className="mt-2 p-2 bg-dark-900/50 rounded border border-dark-800 text-xs">
            <p className="text-dark-500 mb-1 font-semibold">Details:</p>
            <pre className="text-dark-400 whitespace-pre-wrap">{logs[logs.length - 1].details}</pre>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
