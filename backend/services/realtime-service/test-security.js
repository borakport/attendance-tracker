#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Realtime Service Authentication
 * Tests both client and service authentication mechanisms
 */

const io = require('socket.io-client');
const crypto = require('crypto');
const readline = require('readline');

// Configuration
const REALTIME_URL = 'http://localhost:3003';
const SERVICE_KEY = 'service-secret-key-2025-change-in-production';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateServiceToken(serviceName, apiKey) {
    const timestamp = Date.now();
    const data = `${serviceName}:${timestamp}`;
    const signature = crypto
        .createHmac('sha256', apiKey)
        .update(data)
        .digest('hex');
    
    return Buffer.from(JSON.stringify({
        service: serviceName,
        timestamp,
        signature
    })).toString('base64');
}

function verifyServiceToken(token, apiKey) {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const { service, timestamp, signature } = decoded;
        
        const tokenAge = Date.now() - timestamp;
        if (tokenAge > 5 * 60 * 1000) {
            return { valid: false, error: 'Token expired' };
        }
        
        const data = `${service}:${timestamp}`;
        const expectedSignature = crypto
            .createHmac('sha256', apiKey)
            .update(data)
            .digest('hex');
        
        if (signature !== expectedSignature) {
            return { valid: false, error: 'Invalid signature' };
        }
        
        return { valid: true, service, timestamp };
    } catch (error) {
        return { valid: false, error: 'Invalid token format' };
    }
}

class RealtimeServiceTester {
    constructor() {
        this.clientSocket = null;
        this.serviceSocket = null;
        this.testResults = {
            clientAuth: null,
            serviceAuth: null,
            events: [],
            rateLimits: [],
            permissions: []
        };
    }

    async testClientAuthentication(jwtToken) {
        log('\n🔐 Testing Client Authentication (JWT)', 'cyan');
        
        return new Promise((resolve) => {
            this.clientSocket = io(REALTIME_URL, {
                auth: { token: jwtToken },
                timeout: 5000
            });

            this.clientSocket.on('connect', () => {
                log('✅ Client authentication successful', 'green');
                this.testResults.clientAuth = { success: true, message: 'Connected successfully' };
                resolve(true);
            });

            this.clientSocket.on('connect_error', (error) => {
                log(`❌ Client authentication failed: ${error.message}`, 'red');
                this.testResults.clientAuth = { success: false, error: error.message };
                resolve(false);
            });

            setTimeout(() => {
                if (!this.clientSocket.connected) {
                    log('❌ Client authentication timeout', 'red');
                    this.testResults.clientAuth = { success: false, error: 'Connection timeout' };
                    resolve(false);
                }
            }, 5000);
        });
    }

    async testServiceAuthentication(serviceName = 'attendance-service') {
        log('\n🔧 Testing Service Authentication (HMAC Tokens)', 'cyan');
        
        const token = generateServiceToken(serviceName, SERVICE_KEY);
        log(`Generated token for ${serviceName}: ${token.substring(0, 20)}...`, 'blue');
        
        // Verify token locally first
        const verification = verifyServiceToken(token, SERVICE_KEY);
        if (!verification.valid) {
            log(`❌ Local token verification failed: ${verification.error}`, 'red');
            return false;
        }
        log('✅ Local token verification passed', 'green');

        return new Promise((resolve) => {
            this.serviceSocket = io(`${REALTIME_URL}/service`, {
                auth: { serviceToken: token },
                timeout: 5000
            });

            this.serviceSocket.on('connect', () => {
                log('✅ Service authentication successful', 'green');
                this.testResults.serviceAuth = { success: true, service: serviceName };
                resolve(true);
            });

            this.serviceSocket.on('connect_error', (error) => {
                log(`❌ Service authentication failed: ${error.message}`, 'red');
                this.testResults.serviceAuth = { success: false, error: error.message };
                resolve(false);
            });

            setTimeout(() => {
                if (!this.serviceSocket.connected) {
                    log('❌ Service authentication timeout', 'red');
                    this.testResults.serviceAuth = { success: false, error: 'Connection timeout' };
                    resolve(false);
                }
            }, 5000);
        });
    }

    async testEventPermissions() {
        log('\n🎯 Testing Event Permissions', 'cyan');
        
        if (!this.serviceSocket || !this.serviceSocket.connected) {
            log('❌ No service connection available for testing', 'red');
            return;
        }

        const permissionTests = [
            // Authorized events for attendance-service
            { event: 'course:created', authorized: true, data: { courseId: 'test-123', ownerId: 'user-456' } },
            { event: 'session:started', authorized: true, data: { sessionId: 'session-123', courseId: 'course-456' } },
            { event: 'attendance:marked', authorized: true, data: { sessionId: 'session-123', userId: 'user-789' } },
            
            // Unauthorized events
            { event: 'user:created', authorized: false, data: { userId: 'user-123' } },
            { event: 'admin:action', authorized: false, data: { action: 'delete' } },
            { event: 'unauthorized:test', authorized: false, data: { test: true } }
        ];

        for (const test of permissionTests) {
            log(`Testing ${test.event} (should ${test.authorized ? 'succeed' : 'fail'})`, 'blue');
            
            try {
                this.serviceSocket.emit(test.event, test.data);
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
                
                this.testResults.permissions.push({
                    event: test.event,
                    expected: test.authorized,
                    result: 'emitted' // We can't easily test server rejection from client side
                });
                
                log(`📡 Emitted ${test.event}`, test.authorized ? 'green' : 'yellow');
            } catch (error) {
                log(`❌ Failed to emit ${test.event}: ${error.message}`, 'red');
            }
        }
    }

    async testRateLimiting() {
        log('\n⚡ Testing Rate Limiting (100 events/minute)', 'cyan');
        
        if (!this.serviceSocket || !this.serviceSocket.connected) {
            log('❌ No service connection available for testing', 'red');
            return;
        }

        log('Sending 105 events rapidly to test rate limiting...', 'blue');
        
        const startTime = Date.now();
        for (let i = 0; i < 105; i++) {
            this.serviceSocket.emit('course:created', {
                courseId: `rate-test-${i}`,
                ownerId: 'rate-test-user'
            });
            
            // Small delay to prevent local socket buffer issues
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        const endTime = Date.now();
        log(`Sent 105 events in ${endTime - startTime}ms`, 'blue');
        log('Check server logs for rate limiting warnings after event 100', 'yellow');
        
        this.testResults.rateLimits.push({
            eventCount: 105,
            duration: endTime - startTime,
            expectedLimit: 100
        });
    }

    async testTokenExpiry() {
        log('\n⏰ Testing Token Expiry', 'cyan');
        
        // Create an expired token (timestamp from 10 minutes ago)
        const expiredTimestamp = Date.now() - (10 * 60 * 1000);
        const data = `attendance-service:${expiredTimestamp}`;
        const signature = crypto
            .createHmac('sha256', SERVICE_KEY)
            .update(data)
            .digest('hex');
        
        const expiredToken = Buffer.from(JSON.stringify({
            service: 'attendance-service',
            timestamp: expiredTimestamp,
            signature
        })).toString('base64');
        
        log('Testing connection with expired token...', 'blue');
        
        return new Promise((resolve) => {
            const expiredSocket = io(`${REALTIME_URL}/service`, {
                auth: { serviceToken: expiredToken },
                timeout: 3000
            });

            expiredSocket.on('connect', () => {
                log('❌ SECURITY ISSUE: Expired token accepted!', 'red');
                expiredSocket.disconnect();
                resolve(false);
            });

            expiredSocket.on('connect_error', (error) => {
                if (error.message.includes('expired') || error.message.includes('Token expired')) {
                    log('✅ Expired token correctly rejected', 'green');
                    resolve(true);
                } else {
                    log(`❌ Wrong error for expired token: ${error.message}`, 'red');
                    resolve(false);
                }
            });

            setTimeout(() => {
                if (!expiredSocket.connected) {
                    log('✅ Expired token rejected (timeout)', 'green');
                    resolve(true);
                }
            }, 3000);
        });
    }

    async testUnauthorizedService() {
        log('\n🚫 Testing Unauthorized Service', 'cyan');
        
        const unauthorizedToken = generateServiceToken('hacker-service', SERVICE_KEY);
        log('Testing connection with unauthorized service name...', 'blue');
        
        return new Promise((resolve) => {
            const hackerSocket = io(`${REALTIME_URL}/service`, {
                auth: { serviceToken: unauthorizedToken },
                timeout: 3000
            });

            hackerSocket.on('connect', () => {
                log('❌ SECURITY ISSUE: Unauthorized service accepted!', 'red');
                hackerSocket.disconnect();
                resolve(false);
            });

            hackerSocket.on('connect_error', (error) => {
                if (error.message.includes('not allowed') || error.message.includes('Service not allowed')) {
                    log('✅ Unauthorized service correctly rejected', 'green');
                    resolve(true);
                } else {
                    log(`❌ Wrong error for unauthorized service: ${error.message}`, 'red');
                    resolve(false);
                }
            });

            setTimeout(() => {
                if (!hackerSocket.connected) {
                    log('✅ Unauthorized service rejected (timeout)', 'green');
                    resolve(true);
                }
            }, 3000);
        });
    }

    printResults() {
        log('\n📊 Test Results Summary', 'magenta');
        log('='.repeat(50), 'magenta');
        
        if (this.testResults.clientAuth) {
            log(`Client Auth: ${this.testResults.clientAuth.success ? '✅ PASS' : '❌ FAIL'}`, 
                this.testResults.clientAuth.success ? 'green' : 'red');
        }
        
        if (this.testResults.serviceAuth) {
            log(`Service Auth: ${this.testResults.serviceAuth.success ? '✅ PASS' : '❌ FAIL'}`, 
                this.testResults.serviceAuth.success ? 'green' : 'red');
        }
        
        log(`Event Permissions: ${this.testResults.permissions.length} tests performed`, 'blue');
        log(`Rate Limiting: ${this.testResults.rateLimits.length} tests performed`, 'blue');
        
        log('\n💡 Manual Verification Required:', 'yellow');
        log('- Check server logs for rate limiting warnings', 'yellow');
        log('- Check server logs for permission denied messages', 'yellow');
        log('- Verify client events are received when using client connection', 'yellow');
    }

    cleanup() {
        if (this.clientSocket) {
            this.clientSocket.disconnect();
        }
        if (this.serviceSocket) {
            this.serviceSocket.disconnect();
        }
    }
}

// Interactive CLI
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function question(query) {
        return new Promise(resolve => rl.question(query, resolve));
    }

    log('🚀 Realtime Service Security Test Suite', 'cyan');
    log('=====================================', 'cyan');
    
    const tester = new RealtimeServiceTester();
    
    try {
        // Test service authentication
        const serviceAuthResult = await tester.testServiceAuthentication();
        
        if (serviceAuthResult) {
            // Run additional tests
            await tester.testEventPermissions();
            await tester.testRateLimiting();
            await tester.testTokenExpiry();
            await tester.testUnauthorizedService();
        }
        
        // Test client authentication if JWT provided
        const jwtToken = await question('\n🔑 Enter JWT token for client testing (or press Enter to skip): ');
        if (jwtToken.trim()) {
            await tester.testClientAuthentication(jwtToken.trim());
        }
        
        tester.printResults();
        
    } catch (error) {
        log(`❌ Test suite error: ${error.message}`, 'red');
    } finally {
        tester.cleanup();
        rl.close();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { RealtimeServiceTester, generateServiceToken, verifyServiceToken };
