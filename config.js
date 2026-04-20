/**
 * SmartVenue Configuration File
 * @fileoverview Centralized application configuration for easy management
 * @version 2.0
 */

/**
 * Application Configuration Object
 * Manage all application settings from this single source
 */
const SmartVenueConfig = {
    /**
     * Application version
     */
    APP_VERSION: '2.0.0',

    /**
     * Environment (development, staging, production)
     */
    ENV: 'production',

    /**
     * Timing configurations (all in milliseconds)
     */
    TIMING: {
        ALERT_TIMEOUT: 8000,
        ALERT_INITIAL_DELAY: 5000,
        ALERT_SECOND_DELAY: 25000,
        QUEUE_UPDATE_INTERVAL: 10000,
        MATCH_UPDATE_INTERVAL: 10000,
        CROWD_SIMULATION_INTERVAL: 10000,
        MAP_UPDATE_INTERVAL: 10000,
        PROACTIVE_ALERT_INITIAL: 15000,
        PROACTIVE_ALERT_INTERVAL: 45000,
        AR_CALIBRATION_DELAY: 3000,
        IN_SEAT_ORDER_DELIVERY_TIME: 30000,
        GOAL_SPIKE_RECOVERY_TIME: 10000,
        COMMAND_EXECUTION_DELAY: 1500,
        VOICE_COMMAND_DURATION: 2500,
        STAFF_MOVEMENT_DURATION: 4000,
        DEBOUNCE_DELAY: 300
    },

    /**
     * Security configurations
     */
    SECURITY: {
        enableCSP: true,
        enableXSSProtection: true,
        sanitizeInput: true,
        maxQueueNameLength: 100,
        maxMessageLength: 500,
        maxInputLength: 1000
    },

    /**
     * Crowd simulation settings
     */
    CROWD: {
        DOT_COUNT: 15,
        MIN_DOTS: 10,
        MAX_DOTS: 30
    },

    /**
     * Feature flags (enable/disable features)
     */
    FEATURES: {
        ANALYTICS_ENABLED: true,
        AR_SUPPORT: true,
        VOICE_COMMANDS: true,
        MANAGER_MODE: true,
        EMERGENCY_MODE: true,
        HEATMAP_MODE: true,
        HOLO_MODE: true,
        TILT_EFFECT: true,
        IN_SEAT_ORDERING: true,
        FAN_WALL: true
    },

    /**
     * Analytics configuration
     */
    ANALYTICS: {
        GA_ID: 'G-STADIUMSENSE2026', // GA4 ID (dummy) replaced
        TRACK_PAGE_VIEWS: true,
        TRACK_EVENTS: true,
        TRACK_ERRORS: true,
        SESSION_TIMEOUT: 1800000 // 30 minutes
    },

    /**
     * UI/UX Settings
     */
    UI: {
        ANIMATION_ENABLED: true,
        REDUCED_MOTION_RESPECT: true,
        HIGH_CONTRAST_MODE: false,
        DARK_MODE: true,
        FONT_SIZE_DEFAULT: '16px'
    },

    /**
     * Default user profile
     */
    DEFAULT_PROFILE: 'regular',

    /**
     * Profiles with custom settings
     */
    PROFILES: {
        regular: {
            label: 'Regular Fan',
            description: 'Standard experience'
        },
        accessibility: {
            label: 'Accessibility Mode',
            description: 'Enhanced accessibility features',
            features: {
                ENHANCED_KEYBOARD_NAV: true,
                LARGER_TEXT: true,
                HIGH_CONTRAST: true,
                AUDIO_CUES: true
            }
        },
        family: {
            label: 'Family/Stroller',
            description: 'Family-friendly routes',
            features: {
                STROLLER_FRIENDLY_ROUTES: true,
                FAMILY_RESTROOMS: true,
                FAMILY_AREAS: true
            }
        },
        vip: {
            label: 'VIP Access',
            description: 'Premium experience',
            features: {
                PRIORITY_QUEUES: true,
                CONCIERGE_ACCESS: true,
                EXCLUSIVE_AREAS: true
            }
        },
        staff: {
            label: 'Venue Staff',
            description: 'Staff coordination features',
            features: {
                MANAGER_MODE: true,
                STAFF_COORDINATION: true,
                DIGITAL_TWIN_ACCESS: true
            }
        }
    },

    /**
     * API endpoints (for future backend integration)
     */
    API: {
        BASE_URL: 'https://api.smartvenue.local',
        QUEUE_ENDPOINT: '/api/queues',
        CROWD_ENDPOINT: '/api/crowd',
        ALERTS_ENDPOINT: '/api/alerts',
        ANALYTICS_ENDPOINT: '/api/analytics'
    },

    /**
     * Logging configuration
     */
    LOGGING: {
        ENABLED: true,
        LEVEL: 'INFO', // DEBUG, INFO, WARN, ERROR
        LOG_TO_CONSOLE: true,
        LOG_TO_SERVER: false
    }
};

/**
 * Get configuration value
 * @param {string} path - Configuration path (dot notation)
 * @returns {*} Configuration value
 */
function getConfig(path) {
    try {
        const keys = path.split('.');
        let value = SmartVenueConfig;

        for (const key of keys) {
            value = value[key];
            if (value === undefined) return null;
        }

        return value;
    } catch (error) {
        console.error('[SmartVenue] Config retrieval error:', error);
        return null;
    }
}

/**
 * Set configuration value
 * @param {string} path - Configuration path (dot notation)
 * @param {*} value - Value to set
 */
function setConfig(path, value) {
    try {
        const keys = path.split('.');
        let obj = SmartVenueConfig;

        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
            if (obj === undefined) return false;
        }

        obj[keys[keys.length - 1]] = value;
        return true;
    } catch (error) {
        console.error('[SmartVenue] Config setting error:', error);
        return false;
    }
}

/**
 * Check if feature is enabled
 * @param {string} featureName - Feature name
 * @returns {boolean} Is enabled
 */
function isFeatureEnabled(featureName) {
    return SmartVenueConfig.FEATURES[featureName] === true;
}

/**
 * Get profile configuration
 * @param {string} profileName - Profile name
 * @returns {Object} Profile config
 */
function getProfileConfig(profileName) {
    return SmartVenueConfig.PROFILES[profileName] || null;
}

/**
 * Get timing value
 * @param {string} timingKey - Timing key
 * @returns {number} Timing in milliseconds
 */
function getTiming(timingKey) {
    return SmartVenueConfig.TIMING[timingKey] || APP_CONFIG.ALERT_TIMEOUT;
}

/**
 * Log message (respects logging configuration)
 * @param {string} message - Message to log
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 */
function logMessage(message, level = 'INFO') {
    if (!SmartVenueConfig.LOGGING.ENABLED) return;

    const logLevels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    const currentLevel = logLevels[SmartVenueConfig.LOGGING.LEVEL] || 1;
    const incomingLevel = logLevels[level] || 1;

    if (incomingLevel >= currentLevel && SmartVenueConfig.LOGGING.LOG_TO_CONSOLE) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`);
    }
}

/**
 * Enable/Disable feature
 * @param {string} featureName - Feature name
 * @param {boolean} enabled - Enable or disable
 */
function toggleFeature(featureName, enabled) {
    SmartVenueConfig.FEATURES[featureName] = enabled;
    logMessage(`Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`, 'INFO');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SmartVenueConfig,
        getConfig,
        setConfig,
        isFeatureEnabled,
        getProfileConfig,
        getTiming,
        logMessage,
        toggleFeature
    };
}
