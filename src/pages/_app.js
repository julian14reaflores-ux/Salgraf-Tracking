// src/pages/_app.js
// Archivo de configuración principal de Next.js

import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
