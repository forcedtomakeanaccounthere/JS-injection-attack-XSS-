# XSS Attack Demonstration

A comprehensive web application demonstrating Cross-Site Scripting (XSS) vulnerabilities and their mitigations. Built for Information Security coursework.

## Overview

This project demonstrates all three types of XSS attacks:

| Type | Description | Demo Feature |
|------|-------------|--------------|
| **Stored XSS** | Payload stored on server, executed when content is viewed | Comment Board |
| **Reflected XSS** | Payload reflected from server in the response | Search Page |
| **DOM-based XSS** | Payload executed via client-side DOM manipulation | Greeting Page |

Each attack type has:
- 🔴 **Vulnerable version** — no input sanitization, XSS executes
- 🟢 **Secure version** — proper sanitization, XSS blocked
- 📋 **Console logs** — real-time display of what's happening
- 📝 **Code comparison** — side-by-side vulnerable vs secure code

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite, DOMPurify
- **Backend**: Node.js, Express
- **Security**: DOMPurify (client), xss library (server), Helmet

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd JS-injection-attack-XSS-

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Application

**Start the backend server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation with dropdowns
│   │   │   ├── Footer.jsx         # Site footer
│   │   │   ├── ConsoleLog.jsx     # Terminal-style log panel
│   │   │   ├── CodeBlock.jsx      # Syntax-highlighted code blocks
│   │   │   └── VersionToggle.jsx  # Vulnerable/Secure mode toggle
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page with overview
│   │   │   ├── StoredXSS.jsx      # Stored XSS demo
│   │   │   ├── ReflectedXSS.jsx   # Reflected XSS demo
│   │   │   └── DOMXSS.jsx         # DOM-based XSS demo
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                    # Express backend
│   ├── server.js              # API routes & in-memory store
│   └── package.json
│
└── README.md
```

## XSS Attack Examples

### Stored XSS Payloads
```html
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<svg onload="alert('XSS')">
```

### Reflected XSS
Visit: `http://localhost:5173/reflected-xss/vulnerable?q=<script>alert('XSS')</script>`

### DOM-based XSS
Visit: `http://localhost:5173/dom-xss/vulnerable#<img src=x onerror="alert('XSS')">`

## Defense Mechanisms Demonstrated

1. **Input Sanitization** — DOMPurify (client) + xss library (server)
2. **Output Encoding** — React's auto-escaping + textContent vs innerHTML
3. **Content Security Policy** — Helmet CSP headers
4. **Safe DOM APIs** — textContent instead of innerHTML

## Contributors

- Abhishek Anand
- Aku Rishita

## Disclaimer

⚠️ **This project is for educational purposes only.** The vulnerable components are intentionally insecure to demonstrate XSS attacks. Do not deploy vulnerable code in production or use these techniques against real applications without authorization.

## License

MIT
