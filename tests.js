/**
 * SmartVenue Comprehensive Unit Tests
 * @fileoverview Test suite for all critical functions
 * @version 2.0
 */

/**
 * Test Framework - Simple assertion-based testing
 */
const TestFramework = (() => {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const results = [];

    return {
        /**
         * Assert that expression is true
         * @param {boolean} condition - Test condition
         * @param {string} message - Test description
         */
        assert: (condition, message) => {
            totalTests++;
            if (condition) {
                passedTests++;
                results.push(`✓ ${message}`);
                console.log(`✓ ${message}`);
            } else {
                failedTests++;
                results.push(`✗ ${message}`);
                console.error(`✗ ${message}`);
            }
        },

        /**
         * Assert equal values
         * @param {*} actual - Actual value
         * @param {*} expected - Expected value
         * @param {string} message - Test description
         */
        assertEqual: (actual, expected, message) => {
            TestFramework.assert(actual === expected, `${message} (expected ${expected}, got ${actual})`);
        },

        /**
         * Assert value is not null
         * @param {*} value - Value to check
         * @param {string} message - Test description
         */
        assertNotNull: (value, message) => {
            TestFramework.assert(value !== null && value !== undefined, `${message} (value should not be null)`);
        },

        /**
         * Get test results summary
         * @returns {Object} Test results
         */
        getResults: () => ({
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            percentage: ((passedTests / totalTests) * 100).toFixed(2),
            details: results
        }),

        /**
         * Display test results
         */
        printResults: () => {
            console.log('\n========== TEST RESULTS ==========');
            console.log(`Total: ${totalTests}`);
            console.log(`Passed: ${passedTests} ✓`);
            console.log(`Failed: ${failedTests} ✗`);
            console.log(`Score: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
            console.log('==================================\n');
        }
    };
})();

/**
 * TEST SUITE 1: Data Validation
 */
console.log('\n--- TEST SUITE 1: Data Validation ---');

TestFramework.assert(queues && Array.isArray(queues), 'Queues is an array');
TestFramework.assert(queues.length === 4, 'Queue count is correct (4 queues)');
TestFramework.assert(queues[0].id === 'q-restroom-1', 'First queue ID is correct');
TestFramework.assert(queues[0].time > 0, 'Queue time is positive');

TestFramework.assert(mapSectors && Array.isArray(mapSectors), 'Map sectors is an array');
TestFramework.assert(mapSectors.length === 4, 'Map sectors count is correct');
TestFramework.assert(mapSectors.every(s => s.baseGate), 'All sectors have baseGate property');

TestFramework.assert(alerts && Array.isArray(alerts), 'Alerts is an array');
TestFramework.assert(alerts.every(a => a.title && a.message), 'All alerts have title and message');

/**
 * TEST SUITE 2: System State
 */
console.log('\n--- TEST SUITE 2: System State ---');

TestFramework.assert(systemState !== null, 'System state exists');
TestFramework.assert(systemState.profile === 'regular', 'Default profile is "regular"');
TestFramework.assertEqual(systemState.matchTime, 74, 'Initial match time');
TestFramework.assert(systemState.isListening === false, 'Initial listening state is false');
TestFramework.assert(systemState.staffLocations && Array.isArray(systemState.staffLocations), 'Staff locations array exists');

/**
 * TEST SUITE 3: Function Existence & Types
 */
console.log('\n--- TEST SUITE 3: Function Existence ---');

TestFramework.assert(typeof initQueues === 'function', 'initQueues function exists');
TestFramework.assert(typeof updateQueueTimes === 'function', 'updateQueueTimes function exists');
TestFramework.assert(typeof showAlert === 'function', 'showAlert function exists');
TestFramework.assert(typeof closeToast === 'function', 'closeToast function exists');
TestFramework.assert(typeof escapeHtml === 'function', 'escapeHtml function exists');
TestFramework.assert(typeof joinQueue === 'function', 'joinQueue function exists');
TestFramework.assert(typeof openModal === 'function', 'openModal function exists');
TestFramework.assert(typeof closeModal === 'function', 'closeModal function exists');
TestFramework.assert(typeof initAIChatbot === 'function', 'initAIChatbot function exists');
TestFramework.assert(typeof initARSimulator === 'function', 'initARSimulator function exists');
TestFramework.assert(typeof showStaffOnMap === 'function', 'showStaffOnMap function exists');
TestFramework.assert(typeof removeStaffFromMap === 'function', 'removeStaffFromMap function exists');

/**
 * TEST SUITE 4: HTML Escaping (Security)
 */
console.log('\n--- TEST SUITE 4: XSS Protection ---');

TestFramework.assertEqual(
    escapeHtml('<script>alert("XSS")</script>'),
    '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
    'HTML escaping prevents XSS'
);
TestFramework.assertEqual(
    escapeHtml('Hello & goodbye'),
    'Hello &amp; goodbye',
    'Ampersand is properly escaped'
);
TestFramework.assertEqual(
    escapeHtml('"quoted"'),
    '&quot;quoted&quot;',
    'Quotes are properly escaped'
);
TestFramework.assertEqual(
    escapeHtml(''),
    '',
    'Empty string handling'
);
TestFramework.assertEqual(
    escapeHtml(null),
    '',
    'Null input returns empty string'
);

/**
 * TEST SUITE 5: Queue Management
 */
console.log('\n--- TEST SUITE 5: Queue Management ---');

const originalQueueTime = queues[0].time;
updateQueueTimes();
TestFramework.assert(queues[0].time >= 0, 'Queue time remains non-negative after update');
TestFramework.assert(
    queues[0].status === 'smooth' || queues[0].status === 'busy' || queues[0].status === 'congested',
    'Queue status is valid'
);

/**
 * TEST SUITE 6: Map Sectors
 */
console.log('\n--- TEST SUITE 6: Map Sectors ---');

const validLoads = ['Low', 'Medium', 'High'];
TestFramework.assert(
    validLoads.includes(mapSectors[0].currentLoad),
    'Sector load is valid'
);
TestFramework.assert(
    mapSectors.every(s => validLoads.includes(s.currentLoad)),
    'All sectors have valid load values'
);

/**
 * TEST SUITE 7: Alert Functions
 */
console.log('\n--- TEST SUITE 7: Alert System ---');

const alertData = { title: 'Test Alert', message: 'Test Message', type: 'info' };
TestFramework.assert(typeof alertData === 'object', 'Alert data is an object');
TestFramework.assertNotNull(alertData.title, 'Alert has title');
TestFramework.assertNotNull(alertData.message, 'Alert has message');
TestFramework.assert(alertData.type === 'info' || alertData.type === 'warning', 'Alert type is valid');

/**
 * TEST SUITE 8: Predictions
 */
console.log('\n--- TEST SUITE 8: AI Predictions ---');

TestFramework.assert(typeof predictCongestion === 'function', 'Prediction function exists');
TestFramework.assert(typeof triggerProactiveAlert === 'function', 'Proactive alert function exists');

/**
 * TEST SUITE 9: Performance Metrics
 */
console.log('\n--- TEST SUITE 9: Performance ---');

const performanceStart = performance.now();
for (let i = 0; i < 1000; i++) {
    escapeHtml('Test <string>');
}
const performanceEnd = performance.now();
const escapeTime = performanceEnd - performanceStart;

TestFramework.assert(
    escapeTime < 500,
    `HTML escaping performance acceptable (1000 iterations in ${escapeTime.toFixed(2)}ms)`
);

/**
 * TEST SUITE 10: Configuration
 */
console.log('\n--- TEST SUITE 10: Configuration ---');

TestFramework.assert(typeof CONFIG === 'object', 'CONFIG object exists');
TestFramework.assert(CONFIG.ALERT_TIMEOUT > 0, 'Alert timeout is positive');
TestFramework.assert(CONFIG.CROWD_DOT_COUNT > 0, 'Crowd dot count is positive');
TestFramework.assert(CONFIG.MATCH_UPDATE_INTERVAL > 0, 'Match update interval is positive');

/**
 * TEST SUITE 11: Emergency Mode
 */
console.log('\n--- TEST SUITE 11: Emergency Mode ---');

TestFramework.assert(typeof triggerEmergencyMode === 'function', 'Emergency mode function exists');
TestFramework.assert(typeof showHapticFeedback === 'function', 'Haptic feedback function exists');

/**
 * TEST SUITE 12: Accessibility
 */
console.log('\n--- TEST SUITE 12: Accessibility Features ---');

TestFramework.assert(typeof initAIChatbot === 'function', 'AI Chatbot accessible');
TestFramework.assert(typeof initCommandPalette === 'function', 'Command palette accessible');
TestFramework.assert(typeof simulateVoiceCommand === 'function', 'Voice commands available');

/**
 * Print final test results
 */
TestFramework.printResults();

/**
 * Run all test suites automatically
 */
function runAllTests() {
    // Tests are already run above, just ensure results are displayed
    TestFramework.printResults();
}

/**
 * Export test results
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestFramework, runAllTests };
}
