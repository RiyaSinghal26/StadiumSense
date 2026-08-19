// --- Mock Data & State --- //
const queues = [
    { id: 'q-restroom-1', name: 'Restroom (Sec 104)', time: 2, status: 'smooth', capacity: '20%' },
    { id: 'q-merch-main', name: 'Main Team Store', time: 15, status: 'busy', capacity: '75%' },
    { id: 'q-food-express', name: 'Express Burgers', time: 5, status: 'smooth', capacity: '40%' },
    { id: 'q-food-drinks', name: 'Beverage Stand', time: 25, status: 'congested', capacity: '95%' }
];

const alerts = [
    { title: 'Gate N Congested', message: 'High traffic at North Gate. Please consider using Gate E or W.', type: 'warning' },
    { title: 'Half-time Show prep', message: 'Restrooms will become busy in 10 mins. Plan accordingly.', type: 'info' },
];

const mapSectors = [
    { id: 'sector-north', baseGate: 'Gate N', currentLoad: 'High' },
    { id: 'sector-south', baseGate: 'Gate S', currentLoad: 'Low' },
    { id: 'sector-west', baseGate: 'Gate W', currentLoad: 'Medium' },
    { id: 'sector-east', baseGate: 'Gate E', currentLoad: 'Low' }
];

// --- Initialization --- //
document.addEventListener('DOMContentLoaded', () => {
    initQueues();
    initMapInteractions();
    initRouteButtons();
    initModal();
    initAIChatbot();
    initARSimulator();
    initCrowdSimulation();
    initTicketWallet();
    initHeatmap();
    initMatchStats();
    initLevelSwitcher();
    initHoloVision();
    initFanWall();
    initPOVModal();
    initCommandPalette(); // New: Command Palette logic
    initTiltEffect();     // New: 3D Tilt for cards



    
    // Simulate real-time data incoming
    setInterval(updateQueueTimes, 8000); // Update queues every 8 seconds
    
    // Trigger some alerts sequentially
    setTimeout(() => showAlert(alerts[0]), 5000);
    setTimeout(() => showAlert(alerts[1]), 25000);
});

// --- Queue Management --- //
function initQueues() {
    const list = document.getElementById('queue-list');
    list.innerHTML = ''; // Clear existing
    
    queues.forEach(q => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.dataset.status = q.status;
        item.id = q.id;
        
        item.innerHTML = `
            <div class="queue-details-wrapper">
                <div class="queue-info">
                    <h3>${q.name}</h3>
                    <p>Capacity: <span class="cap-value">${q.capacity}</span></p>
                </div>
                <div class="queue-time">${q.time} min</div>
            </div>
            <div class="queue-action">
                <button class="btn-join" onclick="joinQueue(this, '${q.name}')">Join Virtual Queue</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function updateQueueTimes() {
    // Randomly fluctuate times
    queues.forEach(q => {
        // Change time by -3 to +5 minutes
        const change = Math.floor(Math.random() * 9) - 3; 
        q.time = Math.max(0, q.time + change);
        
        // Update Status based on time
        if(q.time < 8) q.status = 'smooth';
        else if(q.time < 18) q.status = 'busy';
        else q.status = 'congested';
        
        // Update DOM
        const el = document.getElementById(q.id);
        if(el) {
            el.dataset.status = q.status;
            el.querySelector('.queue-time').textContent = `${q.time} min`;
            
            // Artificial capacity update
            let capNum = parseInt(q.capacity);
            capNum = Math.max(10, Math.min(100, capNum + (Math.floor(Math.random() * 10) - 5)));
            el.querySelector('.cap-value').textContent = `${capNum}%`;
        }
    });
}

// --- Map Interaction --- //
function initMapInteractions() {
    const sectors = document.querySelectorAll('.sector');
    const infoBox = document.getElementById('map-info');

    sectors.forEach(sector => {
        sector.addEventListener('mouseenter', (e) => {
            const id = e.target.id;
            const data = mapSectors.find(s => s.id === id);
            if(data) {
                // Determine color based on load
                let color = "var(--status-green)";
                if(data.currentLoad === 'Medium') color = "var(--status-yellow)";
                if(data.currentLoad === 'High') color = "var(--status-red)";
                
                infoBox.innerHTML = `
                    <h3 style="color:${color}">${data.baseGate} Details</h3>
                    <p>Click for full congestion details</p>
                `;
            }
        });

        sector.addEventListener('mouseleave', () => {
            infoBox.innerHTML = `<h3>Select a gate for details</h3>`;
        });
        
        sector.addEventListener('click', (e) => {
            const id = e.target.id;
            const data = mapSectors.find(s => s.id === id);
            if(data) {
                openModal(data);
            }
        });
        
        // Simulate changing color on map to match load
        const data = mapSectors.find(s => s.id === sector.id);
        if(data) {
            if(data.currentLoad === 'High') sector.style.fill = 'rgba(239, 68, 68, 0.4)';
            else if(data.currentLoad === 'Medium') sector.style.fill = 'rgba(245, 158, 11, 0.4)';
            else sector.style.fill = 'rgba(16, 185, 129, 0.4)';
        }
    });
    
    // Periodically change map colors to simulate live network
    setInterval(() => {
        mapSectors.forEach(s => {
            const loads = ['Low', 'Medium', 'High'];
            // 20% chance to change load state
            if(Math.random() > 0.8) {
                s.currentLoad = loads[Math.floor(Math.random() * loads.length)];
                
                // Update SVG fill
                const el = document.getElementById(s.id);
                if(el) {
                    el.style.transition = 'fill 1s ease';
                    if(s.currentLoad === 'High') el.style.fill = 'rgba(239, 68, 68, 0.4)';
                    else if(s.currentLoad === 'Medium') el.style.fill = 'rgba(245, 158, 11, 0.4)';
                    else el.style.fill = 'rgba(16, 185, 129, 0.4)';
                }
            }
        });
    }, 10000);
}

// --- Alert System --- //
function showAlert(alertData) {
    const container = document.getElementById('alert-banner-container');
    
    const toast = document.createElement('div');
    toast.className = 'alert-toast';
    
    // Color code based on type
    let iconClass = 'fa-solid fa-circle-info';
    let borderColor = 'var(--accent-blue)';
    let iconColor = 'var(--accent-blue)';
    
    if (alertData.type === 'warning') {
        iconClass = 'fa-solid fa-triangle-exclamation';
        borderColor = 'var(--status-red)';
        iconColor = 'var(--status-red)';
    }

    toast.style.borderLeftColor = borderColor;

    toast.innerHTML = `
        <div class="alert-content">
            <i class="${iconClass}" style="color: ${iconColor}"></i>
            <div class="alert-text">
                <h4>${alertData.title}</h4>
                <p>${alertData.message}</p>
            </div>
        </div>
        <button class="close-alert" onclick="closeToast(this)">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if(document.body.contains(toast)) {
            closeToast(toast.querySelector('.close-alert'));
        }
    }, 8000);
}

function closeToast(btn) {
    const toast = btn.closest('.alert-toast');
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => {
        if(toast.parentElement) toast.parentElement.removeChild(toast);
    });
}

// --- Interactive Elements (Modal & Routes) --- //

function joinQueue(btn, name) {
    if(btn.classList.contains('joined')) return;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Joined';
    btn.classList.add('joined');
    
    showAlert({
        title: 'Virtual Queue Joined',
        message: `You are now in line for ${name}. We'll notify you when it's your turn.`,
        type: 'info'
    });

    // Special: Trigger In-Seat Ordering if it's food
    if(name.toLowerCase().includes('burger')) {
        startInSeatOrdering(name);
    }
}


function initRouteButtons() {
    const routeBtns = document.querySelectorAll('.route-btn');
    const allPaths = document.querySelectorAll('.route-path');

    routeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset active states
            routeBtns.forEach(b => b.classList.remove('active'));
            allPaths.forEach(p => p.classList.add('hidden'));

            // Set new active state
            btn.classList.add('active');
            const routeId = btn.getAttribute('data-route');
            const targetPath = document.getElementById(routeId);
            if(targetPath) {
                targetPath.classList.remove('hidden');
                
                // Show a confirmation alert so the user knows it worked
                let routeName = btn.querySelector('.route-details span:first-child').innerText;
                showAlert({
                    title: 'Live Route Active',
                    message: `Displaying the optimal path for: ${routeName}. Follow the glowing line.`,
                    type: 'info'
                });

                // Update Map info box
                const infoBox = document.getElementById('map-info');
                infoBox.innerHTML = `
                    <h3 style="color: var(--accent-blue)"><i class="fa-solid fa-location-arrow"></i> Routing Active</h3>
                    <p>${routeName} Path Displayed</p>
                `;
                
                // Scroll the map slightly into view so they see the change
                const mapSection = document.querySelector('.interactive-map');
                if(mapSection) {
                    mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

        });
    });
}

function initModal() {
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeModal);
    
    // Close on clicking outside content
    document.getElementById('interactive-modal').addEventListener('click', (e) => {
        if(e.target.id === 'interactive-modal') {
            closeModal();
        }
    });
}

function openModal(data) {
    const modal = document.getElementById('interactive-modal');
    const modalBody = document.getElementById('modal-body');
    
    let color = "var(--status-green)";
    let icon = "fa-check-circle";
    let estWait = "2 - 5 mins";
    
    if(data.currentLoad === 'Medium') {
        color = "var(--status-yellow)";
        icon = "fa-exclamation-circle";
        estWait = "10 - 15 mins";
    } else if(data.currentLoad === 'High') {
        color = "var(--status-red)";
        icon = "fa-triangle-exclamation";
        estWait = "20+ mins";
    }

    modalBody.innerHTML = `
        <h2 class="modal-title" style="color: ${color}">
            <i class="fa-solid ${icon}"></i> ${data.baseGate} Zone
        </h2>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted)">Detailed current operations layout around the ${data.baseGate} sector.</p>
        
        <div class="modal-stat">
            <span>Overall Congestion</span>
            <span style="color: ${color}">${data.currentLoad}</span>
        </div>
        <div class="modal-stat">
            <span>Security Est. Wait</span>
            <span>${estWait}</span>
        </div>
        <div class="modal-stat">
            <span>Active Staff Config</span>
            <span>Standard</span>
        </div>
        
        <button class="btn-join" style="width: 100%; margin-top: 1rem;" onclick="closeModal()">Close</button>
    `;
    
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('interactive-modal');
    modal.classList.add('hidden');
}

// --- Hackathon Wow Features: AI & AR --- //

function initAIChatbot() {
    const fab = document.getElementById('ai-fab');
    const windowEl = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-chat');
    const input = document.getElementById('chat-input');
    const messagesEl = document.getElementById('chat-messages');

    if(!fab) return;

    // Toggle Chat
    fab.addEventListener('click', () => {
        windowEl.classList.toggle('hidden');
    });
    closeBtn.addEventListener('click', () => {
        windowEl.classList.add('hidden');
    });

    // Send Message Logic
    const handleSend = () => {
        const text = input.value.trim();
        if(!text) return;
        
        // Add User message
        messagesEl.innerHTML += `<div class="message user">${text}</div>`;
        input.value = '';
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Simulate Bot thinking & responding
        setTimeout(() => {
            let response = "I can guide you! Try asking about restrooms, food, or exit routes.";
            const lower = text.toLowerCase();
            
            if(lower.includes('food') || lower.includes('hungry') || lower.includes('burger')) {
                response = "The closest food option is Express Burgers at Sec 103 (about 5 mins wait). Want me to route you there?";
            } else if(lower.includes('restroom') || lower.includes('washroom') || lower.includes('toilet')) {
                response = "Nearest restroom is near Sec 104. Wait time is currently very smooth (2 min).";
            } else if(lower.includes('exit') || lower.includes('leave')) {
                response = "For the fastest exit right now, avoid Gate N (High Congestion). Head towards Gate S or E.";
            }

            messagesEl.innerHTML += `<div class="message bot">${response}</div>`;
            messagesEl.scrollTop = messagesEl.scrollHeight;
            
            // Add a subtle "ping" sound simulation (visual)
            const fab = document.getElementById('ai-fab');
            fab.style.animation = 'pulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2';
        }, 1500);
    };


    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleSend();
    });
}

function initARSimulator() {
    const arBtn = document.getElementById('launch-ar-btn');
    const arOverlay = document.getElementById('ar-overlay');
    const closeArBtn = document.getElementById('close-ar');
    const video = document.getElementById('ar-video');
    let streamRef = null;

    if(!arBtn) return;

    arBtn.addEventListener('click', async () => {
        // Show scanning state first
        arOverlay.classList.remove('hidden');
        const hud = arOverlay.querySelector('.ar-hud');
        const target = arOverlay.querySelector('.ar-target');
        
        target.style.display = 'none';
        hud.insertAdjacentHTML('beforeend', '<div id="ar-scanning">SCANNIG ENVIRONMENT...</div>');
        
        try {
            // Request camera
            streamRef = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            video.srcObject = streamRef;
            
            // Artificial delay for "calibration"
            setTimeout(() => {
                const scanner = document.getElementById('ar-scanning');
                if(scanner) scanner.remove();
                target.style.display = 'flex';
                target.style.animation = 'fadeIn 0.5s ease-out';
            }, 3000);

        } catch (err) {
            console.error('Camera access denied or unavailable', err);
            const scanner = document.getElementById('ar-scanning');
            if(scanner) scanner.innerHTML = '<span style="color:red">CAMERA ERROR: CHECK PERMISSIONS</span>';
            setTimeout(() => arOverlay.classList.add('hidden'), 3000);
        }
    });


    closeArBtn.addEventListener('click', () => {
        arOverlay.classList.add('hidden');
        if(streamRef) {
            streamRef.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            streamRef = null;
        }
    });
}

// --- Winning Feature: Crowd Movement Simulation --- //
function initCrowdSimulation() {
    const layer = document.getElementById('crowd-simulation-layer');
    if(!layer) return;

    // Create a few "dots" that move between points
    const points = [
        {x: 100, y: 150}, {x: 300, y: 150}, {x: 200, y: 50}, {x: 200, y: 250},
        {x: 80, y: 50}, {x: 320, y: 50}, {x: 80, y: 250}, {x: 320, y: 250}
    ];

    for(let i = 0; i < 15; i++) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("r", "2");
        dot.className.baseVal = "crowd-dot";
        
        // Random start point
        const start = points[Math.floor(Math.random() * points.length)];
        dot.setAttribute("cx", start.x);
        dot.setAttribute("cy", start.y);
        
        layer.appendChild(dot);
        moveDot(dot, points);
    }
}

function moveDot(dot, points) {
    // Pick a random target point
    const target = points[Math.floor(Math.random() * points.length)];
    const duration = 2000 + Math.random() * 3000;

    // Animate using transition
    setTimeout(() => {
        dot.style.transition = `all ${duration}ms linear`;
        dot.setAttribute("cx", target.x + (Math.random() * 20 - 10));
        dot.setAttribute("cy", target.y + (Math.random() * 20 - 10));
    }, 100);

    // Repeat
    setTimeout(() => moveDot(dot, points), duration + 500);
}

// --- Winning Feature: Proactive AI Notifications --- //
function triggerProactiveAlert() {
    const randomMsgs = [
        "Queue for Main Team Store just dropped to 5 mins! Now is a great time to go.",
        "Your virtual queue for Express Burgers is almost up! Head there in 2 mins.",
        "Gate E is currently the fastest exit route. Avoid Gate N."
    ];
    
    const msg = randomMsgs[Math.floor(Math.random() * randomMsgs.length)];
    
    // Ping the AI FAB
    const fab = document.getElementById('ai-fab');
    if(fab) {
        fab.style.boxShadow = "0 0 30px var(--accent-purple)";
        setTimeout(() => fab.style.boxShadow = "", 3000);
    }

    showAlert({
        title: 'Smart Recommendation',
        message: msg,
        type: 'info'
    });
}

// Trigger first proactive alert after 15s
setTimeout(triggerProactiveAlert, 15000);
setInterval(triggerProactiveAlert, 45000);

// --- Winning Feature: Digital Ticket Wallet --- //
function initTicketWallet() {
    const viewBtn = document.getElementById('view-ticket-btn');
    const modal = document.getElementById('ticket-modal');
    const closeBtn = document.querySelector('.close-ticket-btn');

    if(!viewBtn) return;

    viewBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.querySelector('.ticket-card').style.animation = 'fadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });
}

// --- Winning Feature: Heatmap Mode --- //
function initHeatmap() {
    const toggle = document.getElementById('heatmap-toggle');
    const mapContainer = document.querySelector('.map-container');

    if(!toggle) return;

    toggle.addEventListener('change', () => {
        if(toggle.checked) {
            mapContainer.classList.add('heatmap-active');
            showAlert({
                title: 'Heatmap Mode Active',
                message: 'Visualizing live attendee density and high-traffic zones.',
                type: 'info'
            });
        } else {
            mapContainer.classList.remove('heatmap-active');
        }
    });
}

// --- Winning Feature: In-Seat Ordering --- //
function startInSeatOrdering(itemName) {
    const tracker = document.getElementById('order-tracker');
    if(!tracker) return;

    tracker.classList.remove('hidden');
    tracker.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const steps = tracker.querySelectorAll('.step');
    const msg = tracker.querySelector('.tracking-msg');

    // Simulate order lifecycle
    setTimeout(() => {
        steps[1].classList.remove('active');
        steps[1].classList.add('completed');
        steps[2].classList.add('active');
        msg.innerText = `Your ${itemName} is out for delivery! A runner is heading to Section 104.`;
        
        showAlert({
            title: 'Order Update',
            message: 'Your food is on the way!',
            type: 'info'
        });
    }, 15000);

    setTimeout(() => {
        steps[2].classList.remove('active');
        steps[2].classList.add('completed');
        msg.innerHTML = `<span style="color: var(--status-green); font-weight: 700;">Order Arrived!</span> Enjoy your meal.`;
        
        showAlert({
            title: 'Order Delivered',
            message: 'Enjoy your food! Rate your experience in the app.',
            type: 'info'
        });
    }, 30000);
}

// --- Winning Feature: Match Stats --- //
function initMatchStats() {
    const timer = document.querySelector('.timer');
    const homeScore = document.querySelector('.team-a .score');
    const awayScore = document.querySelector('.team-b .score');

    if(!timer) return;

    let time = 74;
    setInterval(() => {
        time++;
        if(time <= 90) timer.innerText = `${time}'`;
        
        // Randomly score
        if(Math.random() > 0.95) {
            const isHome = Math.random() > 0.5;
            if(isHome) homeScore.innerText = parseInt(homeScore.innerText) + 1;
            else awayScore.innerText = parseInt(awayScore.innerText) + 1;
            
            showAlert({
                title: 'GOAL!',
                message: `New score update: Warriors ${homeScore.innerText} - Titans ${awayScore.innerText}`,
                type: 'info'
            });
        }
    }, 10000);
}

// --- Platinum Feature: Level Switcher --- //
function initLevelSwitcher() {
    const btns = document.querySelectorAll('.level-btn');
    const sectors = document.querySelectorAll('.sector');

    if(!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const level = btn.dataset.level;
            
            // Visual feedback: Shuffle sectors to simulate different floor plans
            sectors.forEach(sector => {
                const randomFill = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.2)`;
                sector.style.fill = randomFill;
                sector.style.transform = `scale(${0.95 + Math.random()*0.1})`;
            });

            showAlert({
                title: 'Floor Changed',
                message: `Displaying layout for ${level}. Amenities updated.`,
                type: 'info'
            });
        });
    });
}

// --- Platinum Feature: Holographic Vision --- //
function initHoloVision() {
    const toggle = document.getElementById('holo-toggle');
    if(!toggle) return;

    toggle.addEventListener('change', () => {
        if(toggle.checked) {
            document.body.classList.add('holo-mode');
            showAlert({
                title: 'Holo-Vision Activated',
                message: 'Neural interface synced. Stadium grid display active.',
                type: 'info'
            });
        } else {
            document.body.classList.remove('holo-mode');
        }
    });
}

// --- Platinum Feature: Fan Wall --- //
function initFanWall() {
    const feed = document.getElementById('fan-feed');
    if(!feed) return;

    const messages = [
        { name: '@ultra_fan', msg: 'The energy in Section 104 is insane right now! 🙌' },
        { name: '@burger_king', msg: 'Just got the Express Burger. Best 5 min wait ever. 🍔' },
        { name: '@stadium_guru', msg: 'Don\'t forget to check the Heatmap for faster exits! 🗺️' },
        { name: '@titans_rule', msg: 'We can still come back! 2-1 is nothing. ⚽' },
        { name: '@pro_photog', msg: 'Found an amazing angle from Gate E. Check it out!' }
    ];

    setInterval(() => {
        const data = messages[Math.floor(Math.random() * messages.length)];
        const post = document.createElement('div');
        post.className = 'fan-post';
        post.innerHTML = `
            <span class="fan-name">${data.name}</span>
            <p>${data.msg}</p>
        `;
        feed.prepend(post);
        
        // Remove old posts
        if(feed.children.length > 8) {
            feed.removeChild(feed.lastChild);
        }
    }, 6000);
}

// --- Platinum Feature: POV Modal --- //
function initPOVModal() {
    const openBtn = document.getElementById('view-pov-btn');
    const modal = document.getElementById('pov-modal');
    const closeBtn = document.querySelector('.close-pov');

    if(!openBtn) return;

    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });
}

// --- Efficiency Feature: Command Palette --- //
function initCommandPalette() {
    const searchInput = document.getElementById('global-search');
    const aiWindow = document.getElementById('ai-chat-window');
    const aiInput = document.getElementById('chat-input');
    
    if(!searchInput) return;

    // Handle Keyboard Shortcut (/)
    window.addEventListener('keydown', (e) => {
        if(e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            const query = searchInput.value.trim().toLowerCase();
            if(!query) return;

            // Log command
            console.log(`Command Received: ${query}`);
            
            // Bridge to AI Copilot
            aiWindow.classList.remove('hidden');
            aiInput.value = query;
            
            // Trigger AI Send
            document.getElementById('send-chat').click();
            
            // Feedback
            showAlert({
                title: 'Command Executed',
                message: `Forwarding "${query}" to VenueAI Copilot...`,
                type: 'info'
            });

            // Clear search
            searchInput.value = '';
            searchInput.blur();
        }
    });
}

// --- Platinum Feature: 3D Tilt Effect --- //
function initTiltEffect() {
    const cards = document.querySelectorAll('.card, .stats-card, .match-stats-widget');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}
