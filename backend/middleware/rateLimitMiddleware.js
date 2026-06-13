const Redis = require('ioredis');

const LIMITS = {
  signup: { windowMs: 60 * 60 * 1000, max: 5, message: 'Signup limit exceeded. Max 5 requests per hour.' },
  login: { windowMs: 15 * 60 * 1000, max: 10, message: 'Login limit exceeded. Max 10 requests per 15 minutes.' },
  forgotPassword: { windowMs: 60 * 60 * 1000, max: 3, message: 'Forgot password limit exceeded. Max 3 requests per hour.' },
  upload: { windowMs: 24 * 60 * 60 * 1000, max: 20, message: 'Resume upload limit exceeded. Max 20 uploads per day.' },
  analysis: { windowMs: 24 * 60 * 60 * 1000, max: 50, message: 'Resume analysis limit exceeded. Max 50 analyses per day.' },
  recommend: { windowMs: 24 * 60 * 60 * 1000, max: 50, message: 'Career recommendation limit exceeded. Max 50 requests per day.' },
  quiz: { windowMs: 24 * 60 * 60 * 1000, max: 30, message: 'Quiz generation limit exceeded. Max 30 requests per day.' },
  interview: { windowMs: 24 * 60 * 60 * 1000, max: 30, message: 'Interview generation limit exceeded. Max 30 requests per day.' },
  simulate: { windowMs: 24 * 60 * 60 * 1000, max: 2000, message: 'Career simulation limit exceeded. Max 2000 requests per day.' },
  jobsearch: { windowMs: 24 * 60 * 60 * 1000, max: 50, message: 'Live job search limit exceeded. Max 50 requests per day.' },
  ats: { windowMs: 24 * 60 * 60 * 1000, max: 100, message: 'ATS analysis limit exceeded. Max 100 requests per day.' }
};

let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    console.log('[rateLimit] Redis rate limiter connected successfully.');
  } catch (err) {
    console.error('[rateLimit] Redis connection failed, falling back to memory store:', err.message);
  }
} else {
  console.log('[rateLimit] No REDIS_URL found. Using in-memory rate limiter.');
}

// Memory fallback store
const memoryStore = new Map();

// Periodic memory store cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

async function checkRedisLimit(key, limitConfig) {
  if (!redisClient) return false;
  const { windowMs, max } = limitConfig;
  try {
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.pexpire(key, windowMs);
    } else {
      const ttl = await redisClient.pttl(key);
      if (ttl < 0) {
        await redisClient.pexpire(key, windowMs);
      }
    }
    return current <= max;
  } catch (err) {
    console.error('[rateLimit] Redis check error, falling back to memory check:', err.message);
    return null; // fallback signal
  }
}

function checkMemoryLimit(key, limitConfig) {
  const { windowMs, max } = limitConfig;
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  record.count += 1;
  if (record.count > max) {
    return false;
  }
  return true;
}

/**
 * Custom Rate Limiter Middleware
 * returns true if allowed, false if limit exceeded and response is sent
 */
async function rateLimiter(req, res, type) {
  const config = LIMITS[type];
  if (!config) {
    console.warn(`[rateLimit] Unknown limit type: ${type}`);
    return true;
  }

  const ip = getClientIp(req);
  let identifier = ip;

  // Rate limit by User ID if authenticated, except auth routes
  const isAuthRoute = ['signup', 'login', 'forgotPassword'].includes(type);
  if (!isAuthRoute && req.user_id) {
    identifier = req.user_id.toString();
  }

  const key = `ratelimit:${type}:${identifier}`;
  let allowed = true;

  if (redisClient) {
    const redisResult = await checkRedisLimit(key, config);
    if (redisResult === null) {
      allowed = checkMemoryLimit(key, config);
    } else {
      allowed = redisResult;
    }
  } else {
    allowed = checkMemoryLimit(key, config);
  }

  if (!allowed) {
    res.status(429).json({ error: config.message });
    return false;
  }

  return true;
}

module.exports = { rateLimiter };
