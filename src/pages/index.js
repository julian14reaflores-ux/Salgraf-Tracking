// src/pages/index.js
// Página principal de la aplicación

import Head from 'next/head';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sistema de Tracking LAAR Courier</title>
        <meta name="description" content="Sistema de seguimiento de guías para LAAR Courier" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Dashboard />
      </main>
    </>
  );
}
