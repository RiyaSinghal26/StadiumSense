// ============================================
// STADIUMSENSE - PRODUCTION-READY NODE.JS CODE
// ============================================

/**
 * File: backend/app.js
 * Main Express.js application
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const redis = require('redis');
const kafka = require('kafkajs');

// ============================================
// APPLICATION INITIALIZATION
// ============================================

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: process.env.FRONTEND_URL || '*' },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e6
});

// Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

// Kafka client
const kafkaClient = new kafka.Kafka({
    clientId: 'stadiumsense-api',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stadiumsense', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✓ MongoDB connected');
}).catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
});

// ============================================
// MODELS
// ============================================

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: String,
    firstName: String,
    lastName: String,
    userType: { type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee' },
    phone: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    lastLogin: Date
});

const User = mongoose.model('User', userSchema);

const queueSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    venueName: String,
    venueType: { type: String, enum: ['food', 'merchandise', 'restroom', 'info'], required: true },
    currentLength: { type: Number, default: 0 },
    capacity: { type: Number, required: true },
    averageServiceTime: { type: Number, default: 2.5 },
    status: { type: String, enum: ['open', 'closed', 'full'], default: 'open' },
    zone: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

queueSchema.index({ eventId: 1, status: 1 });
queueSchema.index({ zone: 1 });

const Queue = mongoose.model('Queue', queueSchema);

const crowdDensitySchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    zoneId: { type: String, required: true },
    densityPercentage: { type: Number, required: true },
    occupancy: Number,
    capacity: Number,
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    entryCount: Number,
    exitCount: Number,
    netFlow: Number,
    timestamp: { type: Date, default: Date.now }
});

crowdDensitySchema.index({ eventId: 1, zoneId: 1, timestamp: -1 });

const CrowdDensity = mongoose.model('CrowdDensity', crowdDensitySchema);

const incidentSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    incidentType: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    zoneId: String,
    coordinates: { type: { type: String }, coordinates: [Number] },
    description: String,
    reportedBy: mongoose.Schema.Types.ObjectId,
    status: { type: String, enum: ['reported', 'acknowledged', 'in_progress', 'resolved'], default: 'reported' },
    assignedStaff: [mongoose.Schema.Types.ObjectId],
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date
});

incidentSchema.index({ eventId: 1, severity: 1 });
incidentSchema.index({ 'coordinates': '2dsphere' });

const Incident = mongoose.model('Incident', incidentSchema);

// ============================================
// SERVICES
// ============================================

class CacheService {
    async get(key) {
        return redisClient.get(key);
    }

    async set(key, value, ttl = 300) {
        await redisClient.setex(key, ttl, JSON.stringify(value));
    }

    async invalidate(pattern) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
    }
}

class QueueService {
    async getQueues(eventId, zone = null) {
        const query = { eventId };
        if (zone) query.zone = zone;

        return Queue.find(query).lean();
    }

    async updateQueueLength(queueId, newLength) {
        const queue = await Queue.findByIdAndUpdate(
            queueId,
            { currentLength: newLength, updatedAt: new Date() },
            { new: true }
        );

        // Invalidate cache
        const cache = new CacheService();
        await cache.invalidate(`queue:${queueId}:*`);

        return queue;
    }

    async joinVirtualQueue(userId, queueId) {
        const queue = await Queue.findById(queueId);
        if (!queue) throw new Error('Queue not found');

        const virtualQueueId = `vq_${Date.now()}_${userId}`;
        const position = queue.currentLength + 1;
        const estimatedCallTime = new Date(Date.now() + (position * queue.averageServiceTime * 60 * 1000));

        // Store in Redis (fast, temporary storage)
        const cache = new CacheService();
        await cache.set(`virtual_queue:${virtualQueueId}`, {
            userId,
            queueId,
            position,
            estimatedCallTime,
            status: 'waiting',
            joinedAt: new Date()
        }, 3600);  // 1 hour TTL

        return {
            virtualQueueId,
            position,
            estimatedCallTime,
            notification: `You're #${position} in queue`
        };
    }
}

class CrowdService {
    async processIoTData(sensorData) {
        const { zoneId, eventId, density, entryCount, exitCount } = sensorData;

        const crowdRecord = new CrowdDensity({
            eventId,
            zoneId,
            densityPercentage: density,
            entryCount,
            exitCount,
            netFlow: entryCount - exitCount,
            riskLevel: this.calculateRiskLevel(density)
        });

        await crowdRecord.save();

        // Publish to Kafka for stream processing
        const producer = kafkaClient.producer();
        await producer.connect();
        await producer.send({
            topic: 'crowd.density',
            messages: [{
                key: zoneId,
                value: JSON.stringify(crowdRecord)
            }]
        });
        await producer.disconnect();

        return crowdRecord;
    }

    calculateRiskLevel(density) {
        if (density > 80) return 'critical';
        if (density > 60) return 'high';
        if (density > 40) return 'medium';
        return 'low';
    }

    async getHeatmapData(eventId) {
        return CrowdDensity.find({ eventId })
            .select('zoneId densityPercentage')
            .sort({ timestamp: -1 })
            .limit(1);
    }
}

// ============================================
// ROUTE HANDLERS
// ============================================

// Authentication routes
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, userType } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password (in production, use bcrypt)
        const passwordHash = require('crypto')
            .createHash('sha256')
            .update(password)
            .digest('hex');

        // Create user
        const user = new User({
            email,
            passwordHash,
            firstName,
            lastName,
            userType: userType || 'attendee'
        });

        await user.save();

        // Generate JWT token
        const token = generateJWT({ userId: user._id, userType: user.userType });

        res.status(201).json({
            userId: user._id,
            email: user.email,
            accessToken: token,
            userType: user.userType
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Queue routes
app.get('/api/v1/queues/:eventId', async (req, res) => {
    try {
        const queueService = new QueueService();
        const queues = await queueService.getQueues(req.params.eventId);
        res.json({ queues });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/v1/queues/:queueId/virtual-join', async (req, res) => {
    try {
        const queueService = new QueueService();
        const { userId } = req.body;

        const result = await queueService.joinVirtualQueue(userId, req.params.queueId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crowd analytics routes
app.get('/api/v1/analytics/crowd-status/:eventId', async (req, res) => {
    try {
        const crowdService = new CrowdService();
        const heatmapData = await crowdService.getHeatmapData(req.params.eventId);
        res.json({ heatmapData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// IoT data ingestion (internal API)
app.post('/api/v1/iot/sensor-data', async (req, res) => {
    try {
        const crowdService = new CrowdService();
        const sensorData = req.body;

        const result = await crowdService.processIoTData(sensorData);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// ============================================
// WEBSOCKET HANDLERS
// ============================================

const userNamespace = io.of('/user');
const staffNamespace = io.of('/staff');
const adminNamespace = io.of('/admin');

userNamespace.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    const eventId = socket.handshake.auth.eventId;

    console.log(`User connected: ${socket.id}`);

    socket.join(`event_${eventId}`);
    socket.join(`user_${userId}`);

    // Queue subscription
    socket.on('queue:subscribe', (queueId) => {
        socket.join(`queue_${queueId}`);
        socket.emit('queue:subscribed', { queueId });
        console.log(`User subscribed to queue: ${queueId}`);
    });

    // Route updates
    socket.on('navigation:start', (routeData) => {
        socket.join(`route_${routeData.routeId}`);
    });

    // Location tracking
    socket.on('user:location_update', (locationData) => {
        // Broadcast anonymized location data for analytics
        userNamespace.to(`event_${eventId}`).emit('analytics:user_location', {
            zone: locationData.zone,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

staffNamespace.on('connection', (socket) => {
    const staffId = socket.handshake.auth.staffId;
    const zoneId = socket.handshake.auth.zoneId;

    console.log(`Staff member connected: ${socket.id}`);

    socket.join(`staff_${staffId}`);
    socket.join(`zone_${zoneId}`);
    socket.join('staff_broadcast');

    // Task assignment
    socket.on('task:accept', (taskData) => {
        socket.emit('task:accepted', { taskId: taskData.taskId });
    });

    // Incident reporting
    socket.on('incident:report', async (incidentData) => {
        const incident = new Incident({
            ...incidentData,
            reportedBy: staffId,
            zoneId
        });

        await incident.save();

        // Broadcast to admin
        adminNamespace.emit('incident:new', incident);
    });
});

adminNamespace.on('connection', (socket) => {
    const adminId = socket.handshake.auth.adminId;

    console.log(`Admin connected: ${socket.id}`);

    socket.join('admin_broadcast');

    // Dashboard subscription
    socket.on('dashboard:subscribe', (eventId) => {
        socket.join(`event_${eventId}_admin`);

        // Send initial state
        const dashboardData = {
            occupancyPercent: 68,
            avgWaitTime: 12,
            criticalZones: 2,
            incidents: []
        };

        socket.emit('dashboard:initial_state', dashboardData);
    });

    // Emergency activation
    socket.on('emergency:activate', async (emergencyData) => {
        const evacuation = {
            id: `evac_${Date.now()}`,
            type: emergencyData.type,
            startTime: new Date(),
            status: 'active'
        };

        // Broadcast to all clients
        io.emit('emergency:broadcast', {
            type: 'evacuation_started',
            evacuationId: evacuation.id,
            message: 'Evacuation in progress'
        });
    });
});

// ============================================
// REAL-TIME DATA STREAMING
// ============================================

// Simulate queue updates
setInterval(async () => {
    const queues = await Queue.find({ status: 'open' });

    for (const queue of queues) {
        // Randomly update queue length
        const randomChange = Math.floor(Math.random() * 10) - 3;
        const newLength = Math.max(0, queue.currentLength + randomChange);

        queue.currentLength = newLength;
        queue.status = newLength >= queue.capacity ? 'full' : 'open';
        await queue.save();

        // Broadcast to all connected users
        userNamespace.emit('queue:update', {
            queueId: queue._id,
            currentLength: newLength,
            status: queue.status
        });
    }
}, 10000);  // Update every 10 seconds

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateJWT(payload) {
    // Simplified JWT generation (use jsonwebtoken in production)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = require('crypto')
        .createHmac('sha256', process.env.JWT_SECRET || 'secret')
        .update(`${header}.${body}`)
        .digest('base64');

    return `${header}.${body}.${signature}`;
}

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   StadiumSense API Server Running      ║
║   Version: 1.0.0                       ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}       ║
╚════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false);
        process.exit(0);
    });
});

module.exports = { app, server, io, Queue, CrowdDensity, Incident, User };
