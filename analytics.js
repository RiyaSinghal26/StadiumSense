/**
 * SmartVenue Analytics Integration
 * @fileoverview Google Analytics 4 integration and custom event tracking
 * @version 2.0
 */

/**
 * Initialize Google Analytics 4 with standard Google Tag (gtag.js)
 * Replace with your actual Google Analytics ID
 */
(function () {
    // Standard Google Tag (gtag.js) initialization
    const ANALYTICS_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 ID

    // Load Google Tag script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', ANALYTICS_ID, {
        'page_title': document.title,
        'page_location': window.location.href
    });

    console.log('[Analytics] Google Tag (gtag.js) initialized with ID:', ANALYTICS_ID);
})();

/**
 * Analytics Manager Module
 */
const AnalyticsManager = (() => {
    const events = [];
    const sessionStart = Date.now();

    return {
        /**
         * Track page view
         * @param {string} pageName - Page name
         */
        trackPageView: (pageName) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'page_view', {
                'page_title': pageName,
                'page_location': window.location.href
            });

            console.log(`[Analytics] Page view: ${pageName}`);
        },

        /**
         * Track queue join event
         * @param {string} queueName - Queue name
         */
        trackQueueJoin: (queueName) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'queue_joined', {
                'queue_name': queueName,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'queue_joined', data: { queueName }, time: Date.now() });
            console.log(`[Analytics] Queue joined: ${queueName}`);
        },

        /**
         * Track feature usage
         * @param {string} featureName - Feature name
         */
        trackFeatureUsage: (featureName) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'feature_used', {
                'feature_name': featureName,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'feature_used', data: { featureName }, time: Date.now() });
            console.log(`[Analytics] Feature used: ${featureName}`);
        },

        /**
         * Track AI chatbot interaction
         * @param {string} query - User query
         * @param {string} response - Bot response
         */
        trackChatbotInteraction: (query, response) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'chatbot_interaction', {
                'query_length': query.length,
                'has_response': !!response,
                'timestamp': new Date().toISOString()
            });

            events.push({
                event: 'chatbot_interaction',
                data: { queryLength: query.length, hasResponse: !!response },
                time: Date.now()
            });
            console.log(`[Analytics] Chatbot interaction tracked`);
        },

        /**
         * Track user profile selection
         * @param {string} profile - Selected profile
         */
        trackProfileSelection: (profile) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'profile_selected', {
                'profile_type': profile,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'profile_selected', data: { profileType: profile }, time: Date.now() });
            console.log(`[Analytics] Profile selected: ${profile}`);
        },

        /**
         * Track route interaction
         * @param {string} routeName - Route name
         */
        trackRouteUsage: (routeName) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'route_used', {
                'route_name': routeName,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'route_used', data: { routeName }, time: Date.now() });
            console.log(`[Analytics] Route used: ${routeName}`);
        },

        /**
         * Track AR feature activation
         */
        trackARActivation: () => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'ar_activated', {
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'ar_activated', time: Date.now() });
            console.log(`[Analytics] AR activated`);
        },

        /**
         * Track emergency mode trigger
         */
        trackEmergencyMode: () => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'emergency_triggered', {
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'emergency_triggered', time: Date.now() });
            console.log(`[Analytics] Emergency mode triggered`);
        },

        /**
         * Track user reached destination event
         * @param {string} destination - Destination name
         * @param {number} timeTaken - Time taken in minutes
         */
        trackUserReachedDestination: (destination, timeTaken) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'user_reached_destination', {
                'destination': destination,
                'time_taken_minutes': timeTaken,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'user_reached_destination', data: { destination, timeTaken }, time: Date.now() });
            console.log(`[Analytics] User reached destination: ${destination} in ${timeTaken} min`);
        },

        /**
         * Track AR view toggled event
         * @param {boolean} enabled - Whether AR was enabled or disabled
         */
        trackARViewToggled: (enabled) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'ar_view_toggled', {
                'ar_enabled': enabled,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'ar_view_toggled', data: { enabled }, time: Date.now() });
            console.log(`[Analytics] AR view toggled: ${enabled ? 'enabled' : 'disabled'}`);
        },

        /**
         * Track queue wait time checked event
         * @param {string} queueName - Queue name
         * @param {number} waitTime - Wait time in minutes
         */
        trackQueueWaitTimeChecked: (queueName, waitTime) => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'queue_wait_time_checked', {
                'queue_name': queueName,
                'wait_time_minutes': waitTime,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'queue_wait_time_checked', data: { queueName, waitTime }, time: Date.now() });
            console.log(`[Analytics] Queue wait time checked: ${queueName} - ${waitTime} min`);
        },

        /**
         * Track custom user event
         * @param {string} eventName - Event name
         * @param {Object} eventData - Event data
         */
        trackCustomEvent: (eventName, eventData) => {
            if (typeof gtag !== 'function') return;

            gtag('event', eventName, {
                ...eventData,
                'timestamp': new Date().toISOString()
            });

            events.push({ event: eventName, data: eventData, time: Date.now() });
            console.log(`[Analytics] Custom event: ${eventName}`);
        },

        /**
         * Get session analytics
         */
        getSessionAnalytics: () => {
            const sessionDuration = Date.now() - sessionStart;
            return {
                sessionStart: new Date(sessionStart),
                sessionDuration: sessionDuration,
                totalEvents: events.length,
                events: events
            };
        },

        /**
         * Generic event tracking function using window.gtag
         * @param {string} eventName - Event name
         * @param {Object} parameters - Event parameters
         */
        trackEvent: (eventName, parameters = {}) => {
            if (typeof window.gtag !== 'function') {
                console.warn('[Analytics] gtag not available, logging to console');
                console.log(`[Analytics] Event: ${eventName}`, parameters);
                return;
            }

            // Ensure timestamp is included
            const eventParams = {
                ...parameters,
                timestamp: new Date().toISOString()
            };

            window.gtag('event', eventName, eventParams);
            events.push({ event: eventName, data: parameters, time: Date.now() });
            console.log(`[Analytics] Event tracked: ${eventName}`, parameters);
        },

        /**
         * Google Cloud Logging integration for stadium throughput data
         * @param {Object} throughputData - Stadium operational metrics
         */
        logStadiumThroughput: (throughputData) => {
            // Simulate Google Cloud Logging API call
            const logEntry = {
                timestamp: new Date().toISOString(),
                severity: 'INFO',
                labels: {
                    service: 'stadium-sense',
                    version: '2.0'
                },
                jsonPayload: {
                    event: 'stadium_throughput',
                    data: throughputData
                }
            };

            // In production, this would send to Google Cloud Logging
            console.log('[Google Cloud Logging] Stadium Throughput:', logEntry);

            // Also track in GA4 for unified analytics
            if (typeof gtag === 'function') {
                gtag('event', 'stadium_throughput_logged', {
                    'total_attendees': throughputData.totalAttendees || 0,
                    'avg_wait_time': throughputData.avgWaitTime || 0,
                    'peak_density': throughputData.peakDensity || 0,
                    'timestamp': logEntry.timestamp
                });
            }

            events.push({ event: 'stadium_throughput_logged', data: throughputData, time: Date.now() });
        }
    };
})();

/**
 * Automatically track analytics on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    AnalyticsManager.trackPageView('SmartVenue Companion');
    console.log('[Analytics] SmartVenue application loaded');
});

/**
 * Track before unload
 */
window.addEventListener('beforeunload', () => {
    AnalyticsManager.sendAnalyticsSummary();
});

/**
 * Integration hooks - Call these from app.js events
 */
const integrationHooks = {
    /**
     * Called when queue is joined
     */
    onQueueJoin: (queueName) => {
        AnalyticsManager.trackQueueJoin(queueName);
    },

    /**
     * Called when feature is used
     */
    onFeatureUsage: (featureName) => {
        AnalyticsManager.trackFeatureUsage(featureName);
    },

    /**
     * Called when chatbot is used
     */
    onChatBot: (query, response) => {
        AnalyticsManager.trackChatbotInteraction(query, response);
    },

    /**
     * Called when profile changes
     */
    onProfileChange: (profile) => {
        AnalyticsManager.trackProfileSelection(profile);
    },

    /**
     * Called when route is used
     */
    onRouteUsage: (routeName) => {
        AnalyticsManager.trackRouteUsage(routeName);
    },

    /**
     * Called when AR is activated
     */
    onARActivation: () => {
        AnalyticsManager.trackARActivation();
    },

    /**
     * Called during emergency
     */
    onEmergency: () => {
        AnalyticsManager.trackEmergencyMode();
    },

    /**
     * Called when manager mode activates
     */
    onManagerMode: () => {
        AnalyticsManager.trackManagerMode();
    },

    /**
     * Called when user reaches destination
     */
    onUserReachedDestination: (destination, timeTaken) => {
        AnalyticsManager.trackUserReachedDestination(destination, timeTaken);
    },

    /**
     * Called when AR view is toggled
     */
    onARViewToggled: (enabled) => {
        AnalyticsManager.trackARViewToggled(enabled);
    },

    /**
     * Called when queue wait time is checked
     */
    onQueueWaitTimeChecked: (queueName, waitTime) => {
        AnalyticsManager.trackQueueWaitTimeChecked(queueName, waitTime);
    },

    /**
     * Called to log stadium throughput data to Google Cloud Logging
     */
    onLogStadiumThroughput: (throughputData) => {
        AnalyticsManager.logStadiumThroughput(throughputData);
    }
};

/**
 * Export for integration
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnalyticsManager, integrationHooks };
}
