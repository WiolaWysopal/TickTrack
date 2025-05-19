import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    cors: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://*.googlesyndication.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.google-analytics.com https://adservice.google.com https://www.googletagservices.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: blob: https: http:;
        font-src 'self' data: https://fonts.gstatic.com;
        frame-src 'self' https://*.doubleclick.net https://*.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;
        connect-src 'self' https://aafmpzffodrspfvbmbkp.supabase.co wss://aafmpzffodrspfvbmbkp.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.doubleclick.net https://*.g.doubleclick.net https://adservice.google.com https://pagead2.googlesyndication.com https://partner.googleadservices.com http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim()
    }
  }
})