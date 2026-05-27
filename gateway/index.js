const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const DJANGO_API = process.env.DJANGO_API || 'http://127.0.0.1:8000';

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('combined'));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use(globalLimiter);

function decodeToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.decode(authHeader.split(' ')[1]);
      if (decoded) req.headers['x-user-id'] = String(decoded.user_id || '');
    } catch (_) {}
  }
  next();
}

app.use(decodeToken);
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.path} | ip=${req.ip}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', gateway: 'Express.js', upstream: DJANGO_API, timestamp: new Date().toISOString() }));

const proxyOptions = {
  target: DJANGO_API,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[Gateway] Proxy error:', err.message);
      res.status(502).json({ error: 'Upstream service unavailable.' });
    },
  },
};

app.use('/api/auth', authLimiter, createProxyMiddleware(proxyOptions));
app.use('/api', createProxyMiddleware(proxyOptions));
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found.` }));

app.listen(PORT, () => {
  console.log(`\n🚀 QuizMaster Gateway running on http://localhost:${PORT}`);
  console.log(`   Proxying → ${DJANGO_API}\n`);
});
