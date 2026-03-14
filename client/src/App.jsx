import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import Home from './pages/Home';
import StoredXSS from './pages/StoredXSS';
import ReflectedXSS from './pages/ReflectedXSS';
import DOMXSS from './pages/DOMXSS';

function App() {
  const { dark } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${dark ? 'bg-dark-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stored-xss/:mode" element={<StoredXSS />} />
          <Route path="/reflected-xss/:mode" element={<ReflectedXSS />} />
          <Route path="/dom-xss/:mode" element={<DOMXSS />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

export default App;
