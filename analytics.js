/**
 * SmartVenue Analytics Integration
 * @fileoverview Google Analytics 4 integration and custom event tracking
 * @version 2.0
 */

/**
 * Initialize Google Analytics 4
 * Replace with your actual Google Analytics ID
 */
(function () {
    // Google Analytics script injection
    const ANALYTICS_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 ID

    // Inject GA script
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', ANALYTICS_ID, {
        'page_path': window.location.pathname,
        'page_title': document.title
    });
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
         * Track manager mode activation
         */
        trackManagerMode: () => {
            if (typeof gtag !== 'function') return;

            gtag('event', 'manager_mode_activated', {
                'timestamp': new Date().toISOString()
            });

            events.push({ event: 'manager_mode_activated', time: Date.now() });
            console.log(`[Analytics] Manager mode activated`);
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
         * Send analytics summary
         */
        sendAnalyticsSummary: () => {
            const summary = AnalyticsManager.getSessionAnalytics();
            console.log('[Analytics] Session Summary:', summary);

            if (typeof gtag === 'function') {
                gtag('event', 'session_summary', {
                    'session_duration': summary.sessionDuration,
                    'total_events': summary.totalEvents
                });
            }
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
    }
};

/**
 * Export for integration
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnalyticsManager, integrationHooks };
}
