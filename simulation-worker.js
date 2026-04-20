/**
 * SmartVenue simulation worker
 * Keeps crowd dots and queue wait times moving without blocking the main thread.
 */

let simulationPoints = [];
let workerQueues = [];
let crowdTimer = null;
let queueTimer = null;

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function emitCrowdUpdate() {
    if (!simulationPoints.length) return;

    const positions = Array.from({ length: 15 }, () => {
        const point = simulationPoints[Math.floor(Math.random() * simulationPoints.length)];
        return {
            x: point.x + randomBetween(-12, 12),
            y: point.y + randomBetween(-12, 12)
        };
    });

    self.postMessage({
        type: 'updateCrowd',
        positions
    });
}

function emitQueueUpdate() {
    if (!workerQueues.length) return;

    workerQueues = workerQueues.map((queue) => {
        const nextTime = Math.max(0, queue.time + Math.floor(randomBetween(-2, 4)));
        let status = 'smooth';
        const capacityValue = Math.max(10, Math.min(99, Math.round(nextTime * 3.5)));

        if (nextTime >= 18) status = 'congested';
        else if (nextTime >= 8) status = 'busy';

        return {
            ...queue,
            time: nextTime,
            status,
            capacity: `${capacityValue}%`
        };
    });

    self.postMessage({
        type: 'updateWaitTimes',
        waitTimes: workerQueues
    });
}

function startSimulation() {
    if (!crowdTimer) {
        crowdTimer = setInterval(emitCrowdUpdate, 2500);
    }

    if (!queueTimer) {
        queueTimer = setInterval(emitQueueUpdate, 6000);
    }
}

self.onmessage = (event) => {
    const payload = event.data || {};

    if (payload.type === 'initialize') {
        simulationPoints = Array.isArray(payload.points) ? payload.points : [];
        workerQueues = Array.isArray(payload.queues) ? payload.queues : [];
        startSimulation();
        emitCrowdUpdate();
        emitQueueUpdate();
    }
};
