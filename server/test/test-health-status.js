/**
 * CREW FORGE - DATABASE HEALTH & RECONNECTION TEST SUITE
 * Verifies that health reporting, URI masking, and reconnect handlers function cleanly.
 */

import { maskMongoURI, getDbStatus, triggerReconnect } from '../config/db.js';
import { checkHealth, reconnectDatabase } from '../controllers/healthController.js';
import { optionalProtect, protect } from '../middleware/authMiddleware.js';

let totalTests = 0;
let passedTests = 0;

const assert = (condition, description) => {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    console.error(`  ❌ FAIL: ${description}`);
  }
};

console.log('\n======================================================');
console.log('🩺 CREW FORGE - DATABASE HEALTH & STATUS VERIFICATION');
console.log('======================================================\n');

// 1. Safe URI Masking Tests
console.log('1. Safe URI Masking & Credential Protection:');
const testUriWithPassword = 'mongodb+srv://test_dummy_user:MockDummyPassword_12345@cluster0.5bg9uxe.mongodb.net/crewforge?retryWrites=true&w=majority';
const masked = maskMongoURI(testUriWithPassword);
assert(!masked.includes('MockDummyPassword_12345'), 'Raw password is removed completely from masked URI');
assert(!masked.includes('test_dummy_user:MockDummyPassword_12345'), 'Auth user:password string is replaced with ***:***@');
assert(masked.includes('mongodb+srv://***:***@cluster0.5bg9uxe.mongodb.net/crewforge'), 'Masked URI preserves protocol, host, and database name');
assert(maskMongoURI('') === 'Not configured (empty)', 'Empty URI returns readable non-empty indicator');

// 2. Database Status Reporting
console.log('\n2. Real-time Database Status Object:');
const status = getDbStatus();
assert(typeof status.isConnected === 'boolean', 'status.isConnected is a strict boolean');
assert(typeof status.status === 'string', 'status.status is a descriptive string state');
assert(typeof status.isAtlas === 'boolean', 'status.isAtlas flags whether target is cloud Atlas');
assert(typeof status.targetCluster === 'string', 'status.targetCluster identifies cluster hostname');
assert(status.name === 'crewforge', 'status.name reflects target database name');
assert(!status.sanitizedURI.includes('SuperSecretPassword123'), 'Sanitized URI in status does not expose password');

// 3. Health Controller Endpoint (GET /api/health)
console.log('\n3. GET /api/health Controller Response:');
let mockRes = {
  statusCode: 0,
  jsonData: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    return this;
  },
};

checkHealth({ query: {} }, mockRes);
assert(mockRes.statusCode === 200, 'GET /api/health returns HTTP 200 OK');
assert(mockRes.jsonData?.status === 'ok', 'Response status is "ok"');
assert(mockRes.jsonData?.database !== undefined, 'Response includes database status block');
assert(typeof mockRes.jsonData?.database?.isConnected === 'boolean', 'Response database.isConnected is boolean');

// 4. Manual Reconnection Endpoint (POST /api/health/reconnect)
console.log('\n4. POST /api/health/reconnect Controller Response:');
let reconRes = {
  statusCode: 0,
  jsonData: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    return this;
  },
};

// Reconnect handler returns structured response without throwing
await reconnectDatabase({}, reconRes);
assert(reconRes.statusCode === 200, 'POST /api/health/reconnect responds with HTTP 200');
assert(typeof reconRes.jsonData?.isConnected === 'boolean', 'Reconnection result provides isConnected boolean');
assert(typeof reconRes.jsonData?.message === 'string', 'Reconnection result provides actionable message');

// 5. Auth Middleware Resilience When DB Disconnected
console.log('\n5. Middleware Resilience Guard (No hanging requests on DB disconnect):');
let nextCalled = false;
let protectRes = {
  statusCode: 0,
  jsonData: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    return this;
  },
};

// If DB is disconnected, protect returns 503 rather than buffering forever
await protect(
  { headers: { authorization: 'Bearer dummy-token' } },
  protectRes,
  () => { nextCalled = true; }
);
assert(
  protectRes.statusCode === 503 || protectRes.statusCode === 401,
  'protect middleware fails fast with 503 (offline) or 401 (invalid) rather than buffering infinitely'
);

let optionalNextCalled = false;
await optionalProtect(
  { headers: { authorization: 'Bearer dummy-token' } },
  {},
  () => { optionalNextCalled = true; }
);
assert(optionalNextCalled === true, 'optionalProtect middleware allows request to continue seamlessly without blocking');

console.log('\n======================================================');
console.log(`🎯 HEALTH SUITE: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}% SUCCESS)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}

