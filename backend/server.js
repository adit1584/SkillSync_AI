require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');

const { handleUpload } = require('./routes/upload');
const { handleQuizGenerate, handleQuizSubmit } = require('./routes/quiz');
const { handleSimulate } = require('./routes/simulate');
const { handleRoadmap } = require('./routes/roadmap');
const { handleInterviewStart, handleInterviewChat } = require('./routes/interview');
const { handleResumeOptimize } = require('./routes/optimize');
const { handleCourses } = require('./routes/courses');
const { handleRecommend } = require('./routes/recommend');
const { handleSelectRole } = require('./routes/selectRole');
const { handleSignup, handleLogin, handleRefresh, handleLogout, handleForgotPassword, handleMe } = require('./routes/auth');
const { handleGetState, handleSaveState } = require('./routes/sessionState');
const { handleJobMatch } = require('./routes/jobscan');
const { handleGetHistory } = require('./routes/history');

const PORT = process.env.PORT || 5000;
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

// Custom multipart binary parser
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      return reject(new Error('No boundary found in Content-Type header'));
    }
    const boundary = '--' + boundaryMatch[1];

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('error', err => reject(err));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const parts = splitBuffer(buffer, Buffer.from(boundary));

      const fields = {};
      let file = null;

      for (const part of parts) {
        if (part.length === 0 || part.equals(Buffer.from('--\r\n')) || part.equals(Buffer.from('--'))) {
          continue;
        }

        const headerEndIndex = part.indexOf('\r\n\r\n');
        if (headerEndIndex === -1) continue;

        const headerText = part.slice(0, headerEndIndex).toString('utf-8');
        let bodyBuffer = part.slice(headerEndIndex + 4);

        if (bodyBuffer.slice(-2).toString() === '\r\n') {
          bodyBuffer = bodyBuffer.slice(0, -2);
        }

        const nameMatch = headerText.match(/name="([^"]+)"/);
        if (!nameMatch) continue;
        const name = nameMatch[1];

        const filenameMatch = headerText.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          const filename = filenameMatch[1];
          const contentTypeMatch = headerText.match(/Content-Type:\s*([^\s;]+)/i);
          const mimeType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
          file = {
            originalname: filename,
            buffer: bodyBuffer,
            mimetype: mimeType,
            size: bodyBuffer.length
          };
        } else {
          fields[name] = bodyBuffer.toString('utf-8');
        }
      }
      resolve({ fields, file });
    });
  });
}

function splitBuffer(buffer, delimiter) {
  const parts = [];
  let index = 0;
  while (true) {
    const nextIndex = buffer.indexOf(delimiter, index);
    if (nextIndex === -1) {
      parts.push(buffer.slice(index));
      break;
    }
    parts.push(buffer.slice(index, nextIndex));
    index = nextIndex + delimiter.length;
  }
  return parts;
}

// Main helper to parse the incoming request body/files
async function parseRequest(req) {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    req.body = await parseJsonBody(req);
  } else if (contentType.includes('multipart/form-data')) {
    const { fields, file } = await parseMultipart(req);
    req.body = fields;
    req.file = file;
  } else {
    req.body = {};
  }
}

// Add express-like API decoration
function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // OPTIONS Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Decorate response object
  decorateResponse(res);

  // Parse path & method
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Read and parse request body (JSON or multipart)
    await parseRequest(req);

    // Global session_id injection from JWT token for authenticated requests
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('./middleware/authMiddleware');
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user_id = decoded.userId;
        if (!req.body) {
          req.body = {};
        }
        if (!req.body.session_id) {
          req.body.session_id = decoded.userId;
        }
      } catch (err) {
        console.warn('[server] Global token validation warning:', err.message);
      }
    }

    // Manual Routing
    if (path === '/api/health' && method === 'GET') {
      res.json({
        status: 'ok',
        service: 'SkillSync AI Backend (Pure Node.js)',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      });
    } else if (path === '/api/upload' && method === 'POST') {
      await handleUpload(req, res);
    } else if (path === '/api/recommend' && method === 'POST') {
      await handleRecommend(req, res);
    } else if (path === '/api/select-role' && method === 'POST') {
      await handleSelectRole(req, res);
    } else if (path === '/api/quiz/generate' && method === 'POST') {
      await handleQuizGenerate(req, res);
    } else if (path === '/api/quiz/submit' && method === 'POST') {
      await handleQuizSubmit(req, res);
    } else if (path === '/api/simulate' && method === 'POST') {
      await handleSimulate(req, res);
    } else if (path === '/api/roadmap' && method === 'POST') {
      await handleRoadmap(req, res);
    } else if (path === '/api/interview/start' && method === 'POST') {
      await handleInterviewStart(req, res);
    } else if (path === '/api/interview/chat' && method === 'POST') {
      await handleInterviewChat(req, res);
    } else if (path === '/api/optimize' && method === 'POST') {
      await handleResumeOptimize(req, res);
    } else if (path === '/api/courses' && method === 'POST') {
      await handleCourses(req, res);
    } else if (path === '/api/auth/signup' && method === 'POST') {
      await handleSignup(req, res);
    } else if (path === '/api/auth/login' && method === 'POST') {
      await handleLogin(req, res);
    } else if (path === '/api/auth/refresh' && method === 'POST') {
      await handleRefresh(req, res);
    } else if (path === '/api/auth/logout' && method === 'POST') {
      await handleLogout(req, res);
    } else if (path === '/api/auth/forgot-password' && method === 'POST') {
      await handleForgotPassword(req, res);
    } else if (path === '/api/auth/me' && method === 'GET') {
      await handleMe(req, res);
    } else if (path === '/api/session/state' && method === 'GET') {
      await handleGetState(req, res);
    } else if (path === '/api/session/save' && method === 'POST') {
      await handleSaveState(req, res);
    } else if (path === '/api/jobmatch' && method === 'POST') {
      await handleJobMatch(req, res);
    } else if (path === '/api/history' && method === 'GET') {
      await handleGetHistory(req, res);
    } else {
      res.status(404).json({ error: 'Route not found' });
    }

  } catch (err) {
    console.error(`[server] Request error on ${method} ${path}:`, err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Start DB & HTTP Server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.warn('MongoDB connection failed:', err.message);
    console.warn('   Running without database — caching and session persistence fallback enabled');
  }

  server.listen(PORT, () => {
    console.log(`SkillSync AI Backend (Pure Node.js) running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
