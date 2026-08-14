const { cacheClient } = require('./index');
const crypto = require('crypto');

/**
 * Generates a safe, collision-resistant cache key for a submission result.
 * It is CRITICAL that the execution environment and problem constraints are part of the hash.
 * 
 * @param {Object} params
 * @param {string} params.sourceCode
 * @param {string} params.language
 * @param {string} params.problemId
 * @param {number} params.timeLimitMs
 * @param {number} params.memoryLimitMb
 * @param {string} params.compilerVersion - Useful if you ever upgrade g++ and it changes behavior
 * @returns {string} The Redis cache key
 */
function generateResultCacheKey({
  sourceCode,
  language,
  problemId,
  timeLimitMs,
  memoryLimitMb,
  compilerVersion = 'default'
}) {
  const hash = crypto.createHash('sha256');
  
  hash.update(sourceCode);
  hash.update(language);
  hash.update(problemId);
  hash.update(String(timeLimitMs));
  hash.update(String(memoryLimitMb));
  hash.update(compilerVersion);
  
  return `submission_result:${hash.digest('hex')}`;
}

/**
 * Gets a cached submission verdict.
 */
async function getCachedResult(cacheKey) {
  const result = await cacheClient.get(cacheKey);
  return result ? JSON.parse(result) : null;
}

/**
 * Sets a cached submission verdict with an expiration (e.g., 7 days).
 */
async function setCachedResult(cacheKey, resultPayload, ttlSeconds = 604800) {
  await cacheClient.set(cacheKey, JSON.stringify(resultPayload), 'EX', ttlSeconds);
}

module.exports = {
  generateResultCacheKey,
  getCachedResult,
  setCachedResult
};
