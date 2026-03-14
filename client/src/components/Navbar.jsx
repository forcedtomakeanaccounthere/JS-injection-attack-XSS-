import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiCode, HiMenu, HiX, HiChevronDown, HiSun, HiMoon } from 'react-icons/hi';
import { FaSkullCrossbones, FaShieldAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'Home', to: '/' },
  {
    label: 'Stored XSS',
    children: [
      { label: 'Vulnerable', icon: 'skull', to: '/stored-xss/vulnerable' },
      { label: 'Secure', icon: 'shield', to: '/stored-xss/secure' },
    ],
  },
  {
    label: 'Reflected XSS',
    children: [
      { label: 'Vulnerable', icon: 'skull', to: '/reflected-xss/vulnerable' },
      { label: 'Secure', icon: 'shield', to: '/reflected-xss/secure' },
    ],
  },
  {
    label: 'DOM XSS',
    children: [
      { label: 'Vulnerable', icon: 'skull', to: '/dom-xss/vulnerable' },
      { label: 'Secure', icon: 'shield', to: '/dom-xss/secure' },
    ],
  },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const timerRef = useRef(null);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (children) => children?.some((c) => location.pathname === c.to);

  const handleMouseEnter = (label) => {
    clearTimeout(timerRef.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  const renderIcon = (icon) =>
    icon === 'skull' ? (
      <FaSkullCrossbones className={`w-3.5 h-3.5 ${dark ? 'text-red-400' : 'text-red-600'}`} />
    ) : (
      <FaShieldAlt className={`w-3.5 h-3.5 ${dark ? 'text-green-400' : 'text-green-600'}`} />
    );

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors ${dark ? 'bg-dark-900/95 border-dark-700' : 'bg-white/95 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-400 transition-colors">
              <HiCode className="text-white text-lg" />
            </div>
            <span className={`text-lg font-bold hidden sm:block ${dark ? 'text-white' : 'text-gray-900'}`}>
              XSS Demo
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isGroupActive(link.children)
                        ? (dark ? 'text-primary-400 bg-primary-500/10' : 'text-primary-600 bg-primary-50')
                        : dark
                        ? 'text-dark-300 hover:text-white hover:bg-dark-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                    <HiChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === link.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-1">
                      <div className={`w-48 rounded-lg shadow-xl overflow-hidden border ${dark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                        {link.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                              isActive(child.to)
                                ? 'bg-primary-500/10 text-primary-400'
                                : dark
                                ? 'text-dark-300 hover:bg-dark-700 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            {renderIcon(child.icon)}
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? (dark ? 'text-primary-400 bg-primary-500/10' : 'text-primary-600 bg-primary-50')
                      : dark
                      ? 'text-dark-300 hover:text-white hover:bg-dark-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className={`ml-2 p-2 rounded-lg transition-colors ${dark ? 'text-dark-300 hover:text-white hover:bg-dark-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggle}
              className={`p-2 rounded-lg ${dark ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <button
              className={`p-2 ${dark ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${dark ? 'border-dark-700 bg-dark-900' : 'border-gray-200 bg-white'}`}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${dark ? 'text-dark-500' : 'text-gray-500'}`}>
                    {link.label}
                  </p>
                  {link.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 pl-6 rounded-lg text-sm ${
                        isActive(child.to)
                          ? (dark ? 'text-primary-400 bg-primary-500/10' : 'text-primary-600 bg-primary-50')
                          : dark
                          ? 'text-dark-300 hover:text-white hover:bg-dark-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {renderIcon(child.icon)}
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm ${
                    isActive(link.to)
                      ? (dark ? 'text-primary-400 bg-primary-500/10' : 'text-primary-600 bg-primary-50')
                      : dark
                      ? 'text-dark-300 hover:text-white hover:bg-dark-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
