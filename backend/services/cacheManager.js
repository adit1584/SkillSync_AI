const crypto = require('crypto');
const mongoose = require('mongoose');

// In-process roadmap cache (used when MongoDB is offline)
const memoryCache = new Map();

// Cache schema (only registered if mongoose is connected)
let RoadmapCache;
try {
  RoadmapCache = mongoose.model('RoadmapCache');
} catch {
  const roadmapCacheSchema = new mongoose.Schema({
    hash: { type: String, required: true, unique: true, index: true },
    target_role: String,
    roadmap: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }
  });
  try {
    RoadmapCache = mongoose.model('RoadmapCache', roadmapCacheSchema);
  } catch (e) {
    RoadmapCache = null;
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Generate a deterministic MD5 hash from skills + target role
 */
function getSkillHash(skills, targetRole) {
  const key = [...skills].sort().join(',') + '|' + targetRole;
  return crypto.createHash('md5').update(key).digest('hex');
}

/**
 * Get a cached roadmap or generate a new one
 */
async function getRoadmapCached(skillHash, generateFn) {
  // 1. Check in-memory cache first (fastest)
  if (memoryCache.has(skillHash)) {
    console.log(`[cacheManager] Memory cache HIT for ${skillHash.slice(0, 8)}...`);
    return { roadmap: memoryCache.get(skillHash), fromCache: true };
  }

  // 2. Try MongoDB cache
  if (isDbConnected() && RoadmapCache) {
    try {
      const cached = await RoadmapCache.findOne({ hash: skillHash });
      if (cached) {
        console.log(`[cacheManager] MongoDB cache HIT for ${skillHash.slice(0, 8)}...`);
        memoryCache.set(skillHash, cached.roadmap); // warm memory cache
        return { roadmap: cached.roadmap, fromCache: true };
      }
    } catch (err) {
      console.warn('[cacheManager] MongoDB cache lookup failed:', err.message);
    }
  }

  // 3. Cache miss — generate via AI
  console.log(`[cacheManager] Cache MISS for ${skillHash.slice(0, 8)}... calling AI`);
  const roadmap = await generateFn();

  // Store in memory cache always
  memoryCache.set(skillHash, roadmap);

  // Store in MongoDB if connected (fire-and-forget)
  if (isDbConnected() && RoadmapCache) {
    RoadmapCache.create({ hash: skillHash, roadmap }).catch(err => {
      console.warn('[cacheManager] MongoDB cache store failed:', err.message);
    });
  }

  return { roadmap, fromCache: false };
}

// ─────────────────────────────────────────────────────────────────
// Courses Cache schema
// ─────────────────────────────────────────────────────────────────
let CoursesCache;
try {
  CoursesCache = mongoose.model('CoursesCache');
} catch {
  const coursesCacheSchema = new mongoose.Schema({
    hash: { type: String, required: true, unique: true, index: true },
    courses: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }
  });
  try {
    CoursesCache = mongoose.model('CoursesCache', coursesCacheSchema);
  } catch (e) {
    CoursesCache = null;
  }
}

/**
 * Get cached course recommendations or generate new ones
 */
async function getCoursesCached(skillHash, generateFn) {
  // 1. Check in-memory cache first
  if (memoryCache.has(skillHash)) {
    console.log(`[cacheManager] Memory cache HIT for courses ${skillHash.slice(0, 8)}...`);
    return { courses: memoryCache.get(skillHash), fromCache: true };
  }

  // 2. Try MongoDB cache
  if (isDbConnected() && CoursesCache) {
    try {
      const cached = await CoursesCache.findOne({ hash: skillHash });
      if (cached) {
        console.log(`[cacheManager] MongoDB cache HIT for courses ${skillHash.slice(0, 8)}...`);
        memoryCache.set(skillHash, cached.courses); // warm memory cache
        return { courses: cached.courses, fromCache: true };
      }
    } catch (err) {
      console.warn('[cacheManager] MongoDB courses cache lookup failed:', err.message);
    }
  }

  // 3. Cache miss — generate via AI
  console.log(`[cacheManager] Cache MISS for courses ${skillHash.slice(0, 8)}... calling AI`);
  const courses = await generateFn();

  // Store in memory cache
  memoryCache.set(skillHash, courses);

  // Store in MongoDB if connected
  if (isDbConnected() && CoursesCache) {
    CoursesCache.create({ hash: skillHash, courses }).catch(err => {
      console.warn('[cacheManager] MongoDB courses cache store failed:', err.message);
    });
  }

  return { courses, fromCache: false };
}

module.exports = { getSkillHash, getRoadmapCached, getCoursesCached };
