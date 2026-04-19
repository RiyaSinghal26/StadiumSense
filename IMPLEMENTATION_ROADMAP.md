# StadiumSense - Quick Implementation Guide

## Phase 1: Foundation (Weeks 1-4)

### Week 1: Architecture & Setup
```bash
# Initialize project
mkdir stadiumsense-platform
cd stadiumsense-platform

# Backend setup
mkdir backend ml-engine mobile-app web-dashboard
cd backend
npm init -y
npm install express socket.io mongoose redis kafkajs cors helmet

# ML setup
cd ../ml-engine
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install tensorflow xgboost scikit-learn pandas numpy fastapi uvicorn

# Frontend setup
cd ../mobile-app
npx create-react-native-app stadiumsense
cd ../web-dashboard
npx create-react-app stadiumsense-admin
```

### Week 2: Database & Models
```javascript
// backend/models/Queue.js
const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    venueName: String,
    currentLength: { type: Number, default: 0 },
    capacity: Number,
    averageServiceTime: Number,
    status: { type: String, enum: ['open', 'closed', 'full'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

queueSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model('Queue', queueSchema);
```

### Week 3: Core APIs
```javascript
// backend/routes/queues.js
const express = require('express');
const Queue = require('../models/Queue');
const router = express.Router();

router.get('/:eventId/all', async (req, res) => {
    const queues = await Queue.find({ eventId: req.params.eventId });
    res.json(queues);
});

router.post('/:queueId/virtual-join', async (req, res) => {
    // Virtual queue logic
    res.status(201).json({ virtualQueueId: '...' });
});

module.exports = router;
```

### Week 4: WebSocket Real-Time
```javascript
// backend/websocket/handlers.js
module.exports = (io) => {
    const userNamespace = io.of('/user');
    
    userNamespace.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('queue:subscribe', (queueId) => {
            socket.join(`queue_${queueId}`);
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
```

---

## Phase 2: ML & Intelligence (Weeks 5-8)

### Week 5: Queue Prediction Model
```python
# ml-engine/models/queue_predictor.py
import xgboost as xgb
import numpy as np
from sklearn.preprocessing import StandardScaler

class QueuePredictionModel:
    def __init__(self):
        self.model = xgb.XGBRegressor(n_estimators=500, max_depth=8)
        self.scaler = StandardScaler()
    
    def train(self, X, y):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
    
    def predict(self, features):
        X_scaled = self.scaler.transform([features])
        return self.model.predict(X_scaled)[0]

# API Endpoint
from fastapi import FastAPI
app = FastAPI()
predictor = QueuePredictionModel()

@app.post("/predict/queue-wait")
async def predict_queue_wait(queue_data: dict):
    features = [
        queue_data['current_length'],
        queue_data['service_rate'],
        queue_data['hour_of_day'],
        queue_data['capacity_percent']
    ]
    wait_time = predictor.predict(features)
    return {"predicted_wait_minutes": int(wait_time)}
```

### Week 6: Anomaly Detection
```python
# ml-engine/models/anomaly_detector.py
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05)
    
    def fit(self, data):
        self.model.fit(data)
    
    def detect(self, data_point):
        prediction = self.model.predict([data_point])
        return prediction[0] == -1  # -1 is anomaly
```

### Week 7: LSTM Crowd Forecasting
```python
# ml-engine/models/crowd_lstm.py
import tensorflow as tf
from tensorflow.keras.layers import LSTM, Dense

def build_crowd_model(sequence_length=60):
    model = tf.keras.Sequential([
        LSTM(128, activation='relu', input_shape=(sequence_length, 10)),
        Dense(64, activation='relu'),
        Dense(32, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='mse')
    return model
```

### Week 8: API Integration
```javascript
// backend/services/mlService.js
const axios = require('axios');

class MLService {
    async predictQueueWait(queueData) {
        const response = await axios.post(
            'http://ml-engine:5000/predict/queue-wait',
            queueData
        );
        return response.data;
    }
    
    async detectAnomalies(crowdData) {
        const response = await axios.post(
            'http://ml-engine:5000/detect/anomalies',
            crowdData
        );
        return response.data;
    }
}

module.exports = new MLService();
```

---

## Phase 3: Frontend & UX (Weeks 9-12)

### Week 9: React Components
```typescript
// mobile-app/screens/QueueScreen.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useSocket } from '../hooks/useSocket';

const QueueScreen: React.FC = () => {
    const [queues, setQueues] = useState([]);
    const socket = useSocket();
    
    useEffect(() => {
        socket.on('queue:update', (data) => {
            setQueues(data);
        });
        
        return () => socket.off('queue:update');
    }, []);
    
    return (
        <FlatList
            data={queues}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text>{item.venueName}</Text>
                    <Text>{item.estimatedWaitTime} min</Text>
                </View>
            )}
        />
    );
};
```

### Week 10: Navigation Maps
```typescript
// web-dashboard/components/StadiumHeatmap.tsx
import React from 'react';
import HeatmapJS from 'heatmap.js';

interface HeatmapProps {
    data: Array<{ x: number; y: number; value: number }>;
}

const StadiumHeatmap: React.FC<HeatmapProps> = ({ data }) => {
    const containerRef = React.useRef(null);
    
    React.useEffect(() => {
        if (containerRef.current) {
            const h337 = HeatmapJS.create({
                container: containerRef.current,
                radius: 40,
                maxOpacity: 1,
                minOpacity: 0.2,
                blur: 85
            });
            
            h337.setData({ max: 100, min: 0, data });
        }
    }, [data]);
    
    return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />;
};

export default StadiumHeatmap;
```

### Week 11: Admin Dashboard
```typescript
// web-dashboard/pages/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '../services/api';

const AdminDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState(null);
    
    useEffect(() => {
        api.getAnalytics().then(setMetrics);
    }, []);
    
    return (
        <div className="dashboard">
            <h1>Stadium Analytics</h1>
            <LineChart data={metrics?.queueTrends}>
                <XAxis />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="waitTime" stroke="#8884d8" />
            </LineChart>
        </div>
    );
};
```

### Week 12: Mobile App Polish
- Implement push notifications
- Add offline mode
- Optimize performance
- Add accessibility features

---

## Phase 4: Deployment (Weeks 13-16)

### Week 13: Containerization
```dockerfile
# Dockerfile (Backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### Week 14: Kubernetes Setup
```bash
# Create namespace
kubectl create namespace stadiumsense

# Deploy MongoDB
helm install mongo bitnami/mongodb -n stadiumsense

# Deploy Redis
helm install redis bitnami/redis -n stadiumsense

# Deploy application
kubectl apply -f kubernetes/deployment.yaml
```

### Week 15: CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
      - run: docker build -t app:latest .
      - run: kubectl apply -f kubernetes/
```

### Week 16: Production Hardening
- Setup monitoring (Prometheus, Grafana)
- Configure logging (ELK Stack)
- Implement backup strategy
- Load testing
- Security audit

---

## Key Features Checklist

### Authentication
- [ ] User registration & login
- [ ] JWT token management
- [ ] Role-based access control
- [ ] OAuth integration (optional)

### Queue Management
- [ ] Real-time queue status
- [ ] Virtual queue joining
- [ ] Wait time prediction
- [ ] Queue reassignment

### Navigation
- [ ] Route calculation
- [ ] Real-time updates
- [ ] Offline maps
- [ ] Accessibility routing

### Analytics
- [ ] Real-time dashboard
- [ ] Historical data
- [ ] Predictive insights
- [ ] Revenue reports

### Safety
- [ ] Incident reporting
- [ ] Emergency alerts
- [ ] Evacuation mode
- [ ] Staff coordination

### Admin
- [ ] Event management
- [ ] Staff scheduling
- [ ] Pricing management
- [ ] Report generation

---

## Testing Strategy

### Unit Tests
```javascript
describe('Queue Service', () => {
    it('should calculate correct wait time', () => {
        const service = new QueueService();
        const waitTime = service.calculateWaitTime(50, 2);
        expect(waitTime).toBe(25);
    });
});
```

### Integration Tests
```javascript
describe('API Integration', () => {
    it('should return queue list', async () => {
        const response = await request(app).get('/api/queues');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
```

### Load Tests
```bash
# Using k6
k6 run --vus 100 --duration 30s load-test.js
# Expected: 10,000+ req/s, < 100ms latency
```

---

## Monitoring & Alerts

### Key Metrics to Monitor
- API response time (target: < 100ms)
- Error rate (target: < 0.1%)
- Database query time (target: < 50ms)
- WebSocket latency (target: < 500ms)
- Queue prediction accuracy (target: ±2 min)

### Alert Thresholds
- Response time > 500ms: Warning
- Error rate > 1%: Critical
- Prediction error > 5 min: Warning
- System uptime < 99.9%: Critical

---

## Go-Live Checklist

- [ ] All tests passing (100% pass rate)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Disaster recovery plan documented
- [ ] Staff training completed
- [ ] Documentation finalized
- [ ] Backup systems verified
- [ ] Monitoring alerts configured
- [ ] Escalation procedures defined
- [ ] Marketing launch prepared

---

## Common Issues & Solutions

### Issue: High Queue Prediction Error
**Solution:** Retrain model with recent data, increase feature engineering

### Issue: WebSocket Connection Drops
**Solution:** Implement auto-reconnection with exponential backoff

### Issue: Database Slow Queries
**Solution:** Add indexes, implement query caching, use read replicas

### Issue: ML Model Overfitting
**Solution:** Cross-validation, regularization, ensemble methods

---

## Cost Optimization Tips

1. **Use spot instances** for non-critical workloads (30% savings)
2. **Implement caching aggressively** (70% reduction in DB queries)
3. **Schedule scaling** based on event times (40% savings)
4. **Use CDN for static content** (60% bandwidth reduction)
5. **Batch database operations** (50% fewer queries)

---

## Resources

- **Node.js Docs:** https://nodejs.org/docs/
- **MongoDB Docs:** https://docs.mongodb.com/
- **React Docs:** https://react.dev/
- **TensorFlow Docs:** https://tensorflow.org/
- **Kubernetes Docs:** https://kubernetes.io/docs/
