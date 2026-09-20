// ============================
// GLOBAL VARIABLES
// ============================
let processes = [];
let resources = [];
let edges = [];
let deadlockDetected = false;
let cycles = [];
let isAlarmActive = false;
let alarmManuallyDismissed = false;
let currentAlgorithm = 'avoidance';

// Circular wait prevention
let preventCircularWaitEnabled = false;
let resourceOrder = [];

// ============================
// INITIALIZATION
// ============================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initializing Deadlock Management System - RAG Module...");
    
    // Initialize tabs
    initTabs();
    
    // Initialize RAG
    initializeGraph();
    
    // Initialize process table
    updateProcessTable();
    
    // Initialize resource table
    updateResourceTable();
    
    // Initialize system info
    updateSystemInfo();
    
    // Initialize dropdowns
    updateProcessDropdown();
    updateResourceDropdown();
    
    // Initialize sound system
    initSoundSystem();

    // Initialize circle glow
    updateCircleGlow();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to dismiss alarm
        if (e.key === 'Escape' && isAlarmActive) {
            e.preventDefault();
            stopDeadlockAlarm();
            addToLog("Alarm dismissed with Escape key");
        }
        
        // Space bar to trigger deadlock detection
        if (e.key === ' ') {
            e.preventDefault();
            detectDeadlock();
        }
        
        // Ctrl+R to request resource
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            requestResource();
        }
        
        // Ctrl+L to release resource
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            releaseResource();
        }
    });
    
    // Add to log
    addToLog('✅ RAG System initialized successfully!');
    addToLog('📋 Ready to simulate deadlock scenarios.');
    addToLog('💡 Select process & resource from right panel, then click Request/Release');
    
    // Initial deadlock check
    setTimeout(() => {
        detectDeadlock();
    }, 500);
});

// ============================
// SOUND SYSTEM
// ============================
function initSoundSystem() {
    console.log("🎵 Initializing sound system...");
    
    // Get audio elements
    const normalSound = document.getElementById('normal-sound');
    const alarmSound = document.getElementById('deadlock-alarm-sound');
    
    // Check if audio elements exist
    if (!normalSound) {
        console.error("❌ Normal sound audio element not found");
    }
    
    if (!alarmSound) {
        console.error("❌ Alarm sound audio element not found");
    }
    
    // Add click event to ALL buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = (this.textContent || '').toLowerCase();
            const buttonId = (this.id || '').toLowerCase();
            
            console.log(`🔄 Button clicked: ${this.textContent || this.id}`);
            
            // ⭐⭐ CHECK IF THIS IS REQUEST/RELEASE BUTTON ⭐⭐
            const isRequestRelease = buttonText.includes('request') || 
                                    buttonText.includes('release') ||
                                    buttonId.includes('request') || 
                                    buttonId.includes('release');
            
            // ⭐⭐ CHECK IF THIS IS A DEADLOCK SCENARIO BUTTON ⭐⭐
            const isScenarioButton = buttonText.includes('scenario') || 
                                    buttonText.includes('cycle') ||
                                    this.onclick && this.onclick.toString().includes('loadScenario');
            
            // ⭐⭐ CHECK IF THIS IS A DEADLOCK RESOLUTION BUTTON ⭐⭐
            const isDeadlockResolution = buttonText.includes('break deadlock') ||
                                        buttonText.includes('suggest resolution') ||
                                        buttonText.includes('auto-break');
            
            // ⭐⭐ ONLY STOP ALARM FOR CERTAIN BUTTONS ⭐⭐
            // DON'T stop alarm for Request/Release buttons - let them handle it
            // DON'T stop alarm for scenario buttons - they should trigger alarms
            // DO stop alarm for resolution buttons - they're fixing the deadlock
            if (isDeadlockResolution || (!isRequestRelease && !isScenarioButton)) {
                // Stop any playing alarm for these buttons
                stopDeadlockAlarm();
                console.log(`🔄 Stopped alarm for button: ${this.textContent || this.id}`);
            }
            
            // SECOND: Only play normal sound if:
            // 1. NOT a deadlock button (data-sound="none")
            // 2. NOT a Request/Release button (they handle their own sound)
            if (this.getAttribute('data-sound') !== 'none' && !isRequestRelease && !isScenarioButton && !isDeadlockResolution) {
                console.log(`🔊 Playing normal sound for: ${this.textContent || this.id}`);
                
                // Play normal sound for regular buttons
                if (normalSound) {
                    try {
                        normalSound.currentTime = 0;
                        normalSound.volume = 0.3;
                        normalSound.play().catch(e => {
                            console.log("Normal sound play failed:", e.name);
                        });
                    } catch (error) {
                        console.error("Error playing normal sound:", error);
                    }
                }
            } else if (isRequestRelease) {
                console.log(`🔇 Request/Release button: ${this.textContent || this.id} (handles own sound)`);
            } else if (isScenarioButton) {
                console.log(`🔇 Scenario button: ${this.textContent || this.id} (handles own alarm)`);
            } else if (isDeadlockResolution) {
                console.log(`🔇 Deadlock resolution button: ${this.textContent || this.id} (no sound)`);
            } else {
                console.log(`🔇 Deadlock button: ${this.textContent || this.id} (no sound)`);
            }
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
    
    console.log("🎵 Sound system ready!");
}

function playSuccessSound() {
    console.log("🔊 Playing success sound (Sci Fi UI Sounds.mp3)");
    
    // Get the normal sound element
    const normalSound = document.getElementById('normal-sound');
    
    if (!normalSound) {
        console.error("❌ Normal sound element not found for success notification");
        return;
    }
    
    try {
        // Stop any currently playing sound
        normalSound.pause();
        normalSound.currentTime = 0;
        
        // Play the Sci Fi sound
        normalSound.volume = 0.3;
        normalSound.play().catch(e => {
            console.log("Success sound play failed:", e.name);
        });
    } catch (error) {
        console.error("Error playing success sound:", error);
    }
}

function playNormalSound() {
    console.log("🔊 Playing normal UI sound");
    
    const normalSound = document.getElementById('normal-sound');
    if (!normalSound) {
        console.error("❌ Normal sound element not found");
        return;
    }
    
    try {
        normalSound.currentTime = 0;
        normalSound.volume = 0.3;
        normalSound.play().catch(e => {
            console.log("Normal sound play failed:", e.name);
        });
    } catch (error) {
        console.error("Error playing normal sound:", error);
    }
}

// ============================
// TAB SYSTEM
// ============================
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    const mainContainer = document.querySelector('.main-container');
    const bottomPanel = document.getElementById('bottomPanel');
    const body = document.body;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Adjust layout based on active tab
            if (tabId === 'bankers') {
                mainContainer.classList.add('banker-mode');
                body.classList.add('banker-active');
                bottomPanel.innerHTML = `
                    <h3><i class="fas fa-clipboard-list"></i> BANKER'S ALGORITHM LOG</h3>
                    <div class="log-content" id="logContent">
                        ${document.getElementById('logContent').innerHTML}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="neon-button small" onclick="clearLog()">
                            <i class="fas fa-trash"></i> Clear Log
                        </button>
                        <button class="neon-button small" onclick="showExampleSelection()">
                            <i class="fas fa-vial"></i> Load Example
                        </button>
                    </div>
                `;
setTimeout(() => {
                    if (typeof initializeBankers === 'function') {
                        initializeBankers();
                        console.log("✅ Banker's Algorithm initialized");
                    } else {
                        console.error("❌ initializeBankers function not found!");
                    }
                }, 100);
                
            } else {
                mainContainer.classList.remove('banker-mode');
                body.classList.remove('banker-active');
                bottomPanel.innerHTML = `
                    <h3><i class="fas fa-clipboard-list"></i> AVOIDANCE / DETECTION LOG</h3>
                    <div class="log-content" id="logContent">
                        ${document.getElementById('logContent').innerHTML}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="neon-button small" onclick="clearLog()">
                            <i class="fas fa-trash"></i> Clear Log
                        </button>
                        <button class="neon-button small" onclick="testEdgeCreation()">
                            <i class="fas fa-vial"></i> Test Edge Creation
                        </button>
                    </div>
                `;
            }
            
            // Update page boundary glow
            updatePageBoundaryGlow(tabId);
            
            addToLog(`📁 Switched to ${tabId} tab`);
        });
    });
}

function updatePageBoundaryGlow(tabId) {
    const pageBoundary = document.getElementById('pageBoundary');
    if (!pageBoundary) return;
    
    // Reset all animations
    const borders = pageBoundary.querySelectorAll('.page-border');
    borders.forEach(border => {
        border.style.animation = 'none';
        void border.offsetWidth; // Trigger reflow
    });
    
    // Restart animations with tab-specific timing
    setTimeout(() => {
        if (tabId === 'bankers') {
            borders.forEach(border => {
                if (border.classList.contains('top')) {
                    border.style.animation = 'topGlow 8s linear infinite';
                } else if (border.classList.contains('right')) {
                    border.style.animation = 'rightGlow 8s linear infinite 2s';
                } else if (border.classList.contains('bottom')) {
                    border.style.animation = 'bottomGlow 8s linear infinite 4s';
                } else if (border.classList.contains('left')) {
                    border.style.animation = 'leftGlow 8s linear infinite 6s';
                }
            });
        } else {
            borders.forEach(border => {
                if (border.classList.contains('top')) {
                    border.style.animation = 'topGlow 8s linear infinite';
                } else if (border.classList.contains('right')) {
                    border.style.animation = 'rightGlow 8s linear infinite 2s';
                } else if (border.classList.contains('bottom')) {
                    border.style.animation = 'bottomGlow 8s linear infinite 4s';
                } else if (border.classList.contains('left')) {
                    border.style.animation = 'leftGlow 8s linear infinite 6s';
                }
            });
        }
    }, 100);
}

// ============================
// GRAPH INITIALIZATION
// ============================
function initializeGraph() {
    console.log("📊 Initializing graph...");
    
    // Clear existing nodes and edges
    const graphCircle = document.getElementById('graphCircle');
    graphCircle.querySelectorAll('.graph-node').forEach(node => node.remove());
    document.getElementById('edgesSVG').innerHTML = '';
    
    // Create nodes in circular layout
    createNodesInCircle();
    
    // Create default edges
    createDefaultEdges();
    
    // Add drag functionality to all nodes
    addDragFunctionality();
    
    // Ensure any active alarm is stopped
    stopDeadlockAlarm();
    
    addToLog('✅ Graph initialized');
}

function createNodesInCircle() {
    const processCount = parseInt(document.getElementById('processCount').value) || 3;
    const resourceCount = parseInt(document.getElementById('resourceCount').value) || 2;
    
    const centerX = 300;
    const centerY = 300;
    const processRadius = 250;
    const resourceRadius = 150;
    
    // Clear existing arrays
    processes = [];
    resources = [];
    
    // Create processes (outer circle)
    for (let i = 0; i < processCount; i++) {
        const angle = (i * 2 * Math.PI) / processCount;
        const x = centerX + Math.cos(angle) * processRadius;
        const y = centerY + Math.sin(angle) * processRadius;
        
        const processId = `P${i + 1}`;
        const node = createNodeElement(processId, x, y, 'process', `process-p${i + 1}`);
        processes.push({
            id: processId,
            element: node,
            x: x,
            y: y,
            type: 'process'
        });
    }
    
    // Create resources (inner circle)
    for (let i = 0; i < resourceCount; i++) {
        const angle = (i * 2 * Math.PI) / resourceCount;
        const x = centerX + Math.cos(angle) * resourceRadius;
        const y = centerY + Math.sin(angle) * resourceRadius;
        
        const resourceId = `R${i + 1}`;
        const node = createNodeElement(resourceId, x, y, 'resource', `resource-r${i + 1}`);
        resources.push({
            id: resourceId,
            element: node,
            x: x,
            y: y,
            type: 'resource',
            instances: 1
        });
        
        // Update instance display
        updateResourceInstanceDisplay(resourceId);
    }
}

function createNodeElement(id, x, y, type, className) {
    const graphCircle = document.getElementById('graphCircle');
    
    const node = document.createElement('div');
    node.className = `graph-node ${className}`;
    node.textContent = id;
    node.style.left = `${x - 30}px`;
    node.style.top = `${y - 30}px`;
    node.dataset.id = id;
    node.dataset.type = type;
    node.title = `${type} ${id}`;
    
    graphCircle.appendChild(node);
    return node;
}

function updateResourceInstanceDisplay(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    const node = document.querySelector(`[data-id="${resourceId}"]`);
    
    if (resource && node) {
        node.setAttribute('data-instances', `${resource.instances} instances`);
    }
}

function createDefaultEdges() {
    console.log("Creating default edges");
    edges = [
        { from: 'R1', to: 'P1', type: 'allocation', instances: 1 },
        { from: 'R2', to: 'P2', type: 'allocation', instances: 1 },
        { from: 'P3', to: 'R1', type: 'request', instances: 1 }
    ];
    
    updateEdges();
}

function updateEdges() {
    const edgesSVG = document.getElementById('edgesSVG');
    edgesSVG.innerHTML = '';
    
    edges.forEach(edge => {
        createEdgeVisual(edge);
    });
}

function createEdgeVisual(edge) {
    const edgesSVG = document.getElementById('edgesSVG');
    const fromNode = document.querySelector(`[data-id="${edge.from}"]`);
    const toNode = document.querySelector(`[data-id="${edge.to}"]`);
    
    if (!fromNode || !toNode) {
        console.error(`Nodes not found for edge: ${edge.from} → ${edge.to}`);
        return;
    }
    
    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();
    const svgRect = edgesSVG.getBoundingClientRect();
    
    const fromX = fromRect.left + fromRect.width / 2 - svgRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - svgRect.top;
    const toX = toRect.left + toRect.width / 2 - svgRect.left;
    const toY = toRect.top + toRect.height / 2 - svgRect.top;
    
    // Create line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromX);
    line.setAttribute('y1', fromY);
    line.setAttribute('x2', toX);
    line.setAttribute('y2', toY);
    line.setAttribute('class', `edge ${edge.type}-edge`);
    line.setAttribute('data-from', edge.from);
    line.setAttribute('data-to', edge.to);
    line.setAttribute('stroke', edge.type === 'allocation' ? '#00ff00' : '#0099ff');
    line.setAttribute('stroke-width', edge.type === 'allocation' ? '3' : '2');
    if (edge.type === 'request') {
        line.setAttribute('stroke-dasharray', '5,5');
    }
    edgesSVG.appendChild(line);
    
    // Create arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10;
    
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = [
        [toX - arrowLength * Math.cos(angle - Math.PI / 6), 
         toY - arrowLength * Math.sin(angle - Math.PI / 6)],
        [toX, toY],
        [toX - arrowLength * Math.cos(angle + Math.PI / 6), 
         toY - arrowLength * Math.sin(angle + Math.PI / 6)]
    ];
    arrow.setAttribute('points', points.map(p => p.join(',')).join(' '));
    arrow.setAttribute('class', `edge ${edge.type}-edge`);
    arrow.setAttribute('fill', edge.type === 'allocation' ? '#00ff00' : '#0099ff');
    arrow.setAttribute('data-from', edge.from);
    arrow.setAttribute('data-to', edge.to);
    edgesSVG.appendChild(arrow);
    
    // Add instance label for multiple instances
    if (edge.instances > 1) {
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', '0.3em');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '10px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('stroke', 'black');
        text.setAttribute('stroke-width', '0.5');
        text.textContent = edge.instances;
        text.setAttribute('data-from', edge.from);
        text.setAttribute('data-to', edge.to);
        edgesSVG.appendChild(text);
    }
}

// ============================
// SIMPLE REQUEST/RESOURCE SYSTEM
// ============================
function requestResource() {
    const processId = document.getElementById('processId').value;
    const resourceId = document.getElementById('resourceId').value;
    const instances = parseInt(document.getElementById('requestInstances').value) || 1;
    
    console.log(`📝 Requesting: ${processId} wants ${instances} of ${resourceId}`);
    
    // ⭐⭐ CHECK CIRCULAR WAIT PREVENTION FIRST ⭐⭐
    if (preventCircularWaitEnabled) {
        const canRequest = checkResourceOrder(processId, resourceId);
        if (!canRequest) {
            // Circular wait prevention violation - block the request
            addToLog(`❌ CIRCULAR WAIT PREVENTION: ${processId} cannot request ${resourceId} due to resource order violation`);
            addToLog(`💡 Resource order: ${resourceOrder.join(' < ')}`);
            
            // Show visual feedback
            const resolutionInfo = document.getElementById('resolutionInfo');
            resolutionInfo.innerHTML = `
                <strong style="color: #ff9900;">⚠️ Circular Wait Prevention Active</strong><br>
                <small>Process ${processId} cannot request ${resourceId} while holding higher-numbered resources.</small><br>
                <small>Resource order: ${resourceOrder.join(' < ')}</small>
            `;
            
            // Play warning sound
            playWarningSound();
            return; // Stop the request
        }
    }
    
    // ⭐⭐ CHECK CURRENT DEADLOCK STATE BEFORE REQUEST ⭐⭐
    const hadDeadlockBefore = deadlockDetected;
    
    // Check if process and resource exist
    const process = processes.find(p => p.id === processId);
    const resource = resources.find(r => r.id === resourceId);
    
    if (!process || !resource) {
        addToLog('❌ Invalid process or resource ID');
        return;
    }
    
    // Check if instances are valid
    if (instances < 1 || instances > 3) {
        addToLog('❌ Instances must be between 1 and 3');
        return;
    }
    
    // Check if resource is already allocated to this process
    const existingAllocation = edges.find(e => 
        e.from === resourceId && e.to === processId && e.type === 'allocation'
    );
    
    if (existingAllocation) {
        // Already allocated, check if we can add more instances
        const totalAllocated = edges
            .filter(e => e.from === resourceId && e.type === 'allocation')
            .reduce((sum, e) => sum + e.instances, 0);
        
        const available = resource.instances - totalAllocated;
        
        if (available >= instances) {
            // Can allocate more instances
            existingAllocation.instances += instances;
            updateEdges();
            addToLog(`✅ ${processId} allocated ${instances} more instance(s) of ${resourceId}`);
        } else {
            // Not enough instances available, create request
            const existingRequest = edges.find(e => 
                e.from === processId && e.to === resourceId && e.type === 'request'
            );
            
            if (existingRequest) {
                existingRequest.instances += instances;
                updateEdges();
                addToLog(`⚠️ ${processId} added ${instances} more request(s) for ${resourceId} (waiting)`);
            } else {
                edges.push({
                    from: processId,
                    to: resourceId,
                    type: 'request',
                    instances: instances
                });
                updateEdges();
                addToLog(`⚠️ ${processId} requested ${instances} instance(s) of ${resourceId} (waiting)`);
            }
        }
    } else {
        // Not allocated yet, check availability
        const totalAllocated = edges
            .filter(e => e.from === resourceId && e.type === 'allocation')
            .reduce((sum, e) => sum + e.instances, 0);
        
        const available = resource.instances - totalAllocated;
        
        if (available >= instances) {
            // Resource available, allocate it
            edges.push({
                from: resourceId,
                to: processId,
                type: 'allocation',
                instances: instances
            });
            updateEdges();
            addToLog(`✅ ${processId} allocated ${instances} instance(s) of ${resourceId}`);
        } else {
            // Resource not available, create request
            const existingRequest = edges.find(e => 
                e.from === processId && e.to === resourceId && e.type === 'request'
            );
            
            if (existingRequest) {
                existingRequest.instances += instances;
                updateEdges();
                addToLog(`⚠️ ${processId} added ${instances} more request(s) for ${resourceId} (waiting)`);
            } else {
                edges.push({
                    from: processId,
                    to: resourceId,
                    type: 'request',
                    instances: instances
                });
                updateEdges();
                addToLog(`⚠️ ${processId} requested ${instances} instance(s) of ${resourceId} (waiting)`);
            }
        }
    }
    
    // ⭐⭐ ALWAYS CHECK FOR DEADLOCK AFTER REQUEST ⭐⭐
    // This ensures manual operations trigger the alarm
    const createsDeadlock = detectDeadlock();
    
    // ⭐⭐ DECIDE WHICH SOUND TO PLAY ⭐⭐
    if (createsDeadlock && !hadDeadlockBefore) {
        // This request CREATED a new deadlock
        console.log("🚨 Request created a DEADLOCK!");
        // Alarm will be triggered by detectDeadlock() automatically
    } else {
        // Normal request (no deadlock or deadlock already existed)
        console.log("✅ Normal request, playing UI sound...");
        playNormalSound();
    }
    
    // Update UI
    updateProcessTable();
    updateResourceTable();
    updateSystemInfo();
}

function releaseResource() {
    const processId = document.getElementById('processId').value;
    const resourceId = document.getElementById('resourceId').value;
    const instances = parseInt(document.getElementById('requestInstances').value) || 1;
    
    console.log(`🔄 Releasing: ${processId} releases ${instances} of ${resourceId}`);
    
    // ⭐⭐ CHECK CURRENT DEADLOCK STATE BEFORE RELEASE ⭐⭐
    const hadDeadlockBefore = deadlockDetected;
    
    // Find allocation edge
    const allocationEdgeIndex = edges.findIndex(e => 
        e.from === resourceId && e.to === processId && e.type === 'allocation'
    );
    
    if (allocationEdgeIndex === -1) {
        addToLog(`❌ ${processId} does not have ${resourceId} allocated`);
        return;
    }
    
    const allocationEdge = edges[allocationEdgeIndex];
    
    if (allocationEdge.instances < instances) {
        addToLog(`❌ ${processId} only has ${allocationEdge.instances} instance(s) of ${resourceId}. Cannot release ${instances}.`);
        return;
    }
    
    if (allocationEdge.instances > instances) {
        // Reduce allocation
        allocationEdge.instances -= instances;
        updateEdges();
        addToLog(`✅ ${processId} released ${instances} instance(s) of ${resourceId}. ${allocationEdge.instances} instance(s) remain.`);
    } else {
        // Remove allocation completely
        edges.splice(allocationEdgeIndex, 1);
        updateEdges();
        addToLog(`✅ ${processId} released all ${instances} instance(s) of ${resourceId}`);
    }
    
    // Check if there are pending requests for this resource
    checkPendingRequests(resourceId);
    
    // ⭐⭐ ALWAYS CHECK FOR DEADLOCK AFTER RELEASE ⭐⭐
    // This ensures manual operations trigger the alarm
    const stillHasDeadlock = detectDeadlock();
    
    // ⭐⭐ DECIDE WHICH SOUND TO PLAY ⭐⭐
    if (hadDeadlockBefore && !stillHasDeadlock) {
        // Release RESOLVED a deadlock!
        console.log("🎉 Release resolved deadlock! Playing success sound...");
        playSuccessSound();
        showSuccessNotification(`Deadlock resolved by releasing ${resourceId} from ${processId}`);
    } else if (!hadDeadlockBefore && !stillHasDeadlock) {
        // Normal release (no deadlock involved)
        console.log("✅ Normal release, playing UI sound...");
        playNormalSound();
    }
    // If stillHasDeadlock = true, don't play any sound (alarm is already playing)
    
    // Update UI
    updateProcessTable();
    updateResourceTable();
    updateSystemInfo();
}

function checkPendingRequests(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    // Get all pending requests for this resource
    const pendingRequests = edges.filter(e => 
        e.to === resourceId && e.type === 'request'
    );
    
    if (pendingRequests.length === 0) return;
    
    // Calculate currently allocated instances
    const allocatedInstances = edges
        .filter(e => e.from === resourceId && e.type === 'allocation')
        .reduce((sum, e) => sum + e.instances, 0);
    
    const available = resource.instances - allocatedInstances;
    
    // Try to satisfy pending requests
    pendingRequests.forEach(request => {
        if (available >= request.instances) {
            // Remove request edge
            const requestIndex = edges.findIndex(e => 
                e.from === request.from && e.to === resourceId && e.type === 'request'
            );
            if (requestIndex !== -1) {
                edges.splice(requestIndex, 1);
            }
            
            // Add allocation edge
            edges.push({
                from: resourceId,
                to: request.from,
                type: 'allocation',
                instances: request.instances
            });
            
            updateEdges();
            addToLog(`✅ Auto-allocated ${request.instances} instance(s) of ${resourceId} to ${request.from}`);
            
            // Check if this creates a deadlock
            detectDeadlock();
        }
    });
}

// ============================
// RESOURCE INSTANCE MANAGEMENT
// ============================
function updateResourceInstances() {
    const resourceId = document.getElementById('resourceInstanceSelect').value;
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource) {
        document.getElementById('resourceInstanceCount').value = resource.instances;
    }
}

function changeResourceInstances() {
    const resourceId = document.getElementById('resourceInstanceSelect').value;
    const newCount = parseInt(document.getElementById('resourceInstanceCount').value) || 1;
    
    if (newCount < 1 || newCount > 5) {
        addToLog('❌ Resource instances must be between 1 and 5');
        return;
    }
    
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
        addToLog(`❌ Resource ${resourceId} not found`);
        return;
    }
    
    // Check if new count is less than currently allocated instances
    const totalAllocated = edges
        .filter(e => e.from === resourceId && e.type === 'allocation')
        .reduce((sum, e) => sum + e.instances, 0);
    
    if (newCount < totalAllocated) {
        addToLog(`❌ Cannot reduce instances to ${newCount} because ${totalAllocated} are currently allocated`);
        return;
    }
    
    resource.instances = newCount;
    updateResourceInstanceDisplay(resourceId);
    updateResourceTable();
    updateSystemInfo();
    
    addToLog(`✅ ${resourceId} instances changed to ${newCount}`);
    
    // Check if we can now satisfy pending requests
    checkPendingRequests(resourceId);
}

// ============================
// DROPDOWN MANAGEMENT
// ============================
function updateProcessDropdown() {
    const processSelect = document.getElementById('processId');
    if (!processSelect) return;
    
    // Store current value
    const currentValue = processSelect.value;
    
    // Clear options
    processSelect.innerHTML = '';
    
    // Add all processes
    processes.forEach(process => {
        const option = document.createElement('option');
        option.value = process.id;
        option.textContent = process.id;
        processSelect.appendChild(option);
    });
    
    // Restore selection if still valid
    if (processes.some(p => p.id === currentValue)) {
        processSelect.value = currentValue;
    } else if (processes.length > 0) {
        processSelect.value = processes[0].id;
    }
}

function updateResourceDropdown() {
    const resourceSelect = document.getElementById('resourceId');
    const resourceInstanceSelect = document.getElementById('resourceInstanceSelect');
    
    if (!resourceSelect || !resourceInstanceSelect) return;
    
    // Store current values
    const currentValue = resourceSelect.value;
    const currentInstanceValue = resourceInstanceSelect.value;
    
    // Clear options
    resourceSelect.innerHTML = '';
    resourceInstanceSelect.innerHTML = '';
    
    // Add all resources
    resources.forEach(resource => {
        const option1 = document.createElement('option');
        option1.value = resource.id;
        option1.textContent = resource.id;
        resourceSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = resource.id;
        option2.textContent = resource.id;
        resourceInstanceSelect.appendChild(option2);
    });
    
    // Restore selections if still valid
    if (resources.some(r => r.id === currentValue)) {
        resourceSelect.value = currentValue;
    } else if (resources.length > 0) {
        resourceSelect.value = resources[0].id;
    }
    
    if (resources.some(r => r.id === currentInstanceValue)) {
        resourceInstanceSelect.value = currentInstanceValue;
    } else if (resources.length > 0) {
        resourceInstanceSelect.value = resources[0].id;
    }
    
    // Update instance count display
    updateResourceInstances();
}

// ============================
// GRAPH CONTROLS
// ============================
function applyConfiguration() {
    console.log("Applying configuration");
    const processCount = parseInt(document.getElementById('processCount').value);
    const resourceCount = parseInt(document.getElementById('resourceCount').value);
    
    // Clear existing nodes and edges
    const graphCircle = document.getElementById('graphCircle');
    graphCircle.querySelectorAll('.graph-node').forEach(node => node.remove());
    document.getElementById('edgesSVG').innerHTML = '';
    
    // Reset arrays
    processes = [];
    resources = [];
    edges = [];
    deadlockDetected = false;
    cycles = [];
    alarmManuallyDismissed = false;
    
    // Reset prevention system
    if (preventCircularWaitEnabled) {
        // Re-initialize resource order with new resources
        resourceOrder = [];
        for (let i = 1; i <= resourceCount; i++) {
            resourceOrder.push(`R${i}`);
        }
        document.getElementById('resourceOrder').value = resourceOrder.join(',');
    }
    
    // Stop any active alarm
    stopDeadlockAlarm();
    
    // Create new nodes
    createNodesInCircle();
    createDefaultEdges();
    addDragFunctionality();
    
    // Update UI
    updateProcessDropdown();
    updateResourceDropdown();
    updateProcessTable();
    updateResourceTable();
    updateSystemInfo();
    updateStatus('SAFE');
    
    addToLog(`✅ Configuration applied: ${processCount} processes, ${resourceCount} resources`);
}

function addProcess() {
    const processCount = processes.length;
    const angle = Math.random() * 2 * Math.PI;
    const radius = 250;
    const centerX = 300;
    const centerY = 300;
    
    const processId = `P${processCount + 1}`;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const node = createNodeElement(processId, x, y, 'process', `process-p${processCount + 1}`);
    processes.push({
        id: processId,
        element: node,
        x: x,
        y: y,
        type: 'process'
    });
    
    // Add drag functionality
    node.addEventListener('mousedown', startDrag);
    
    // Update UI
    document.getElementById('processCount').value = processes.length;
    updateProcessDropdown();
    updateProcessTable();
    updateSystemInfo();
    addToLog(`✅ Process ${processId} added`);
}

function addResource() {
    const resourceCount = resources.length;
    const angle = Math.random() * 2 * Math.PI;
    const radius = 150;
    const centerX = 300;
    const centerY = 300;
    
    const resourceId = `R${resourceCount + 1}`;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const node = createNodeElement(resourceId, x, y, 'resource', `resource-r${resourceCount + 1}`);
    resources.push({
        id: resourceId,
        element: node,
        x: x,
        y: y,
        type: 'resource',
        instances: 1
    });
    
    // Update instance display
    updateResourceInstanceDisplay(resourceId);
    
    // Add drag functionality
    node.addEventListener('mousedown', startDrag);
    
    // Update UI
    document.getElementById('resourceCount').value = resources.length;
    updateResourceDropdown();
    updateResourceTable();
    updateSystemInfo();
    addToLog(`✅ Resource ${resourceId} added with 1 instance`);
}

function clearEdges() {
    edges = [];
    document.getElementById('edgesSVG').innerHTML = '';
    deadlockDetected = false;
    cycles = [];
    alarmManuallyDismissed = false;
    
    // Stop any active alarm
    stopDeadlockAlarm();
    
    updateStatus('SAFE');
    updateSystemInfo();
    updateProcessTable();
    updateResourceTable();
    addToLog('✅ All edges cleared');
}

function clearGraph() {
    edges = [];
    document.getElementById('edgesSVG').innerHTML = '';
    deadlockDetected = false;
    cycles = [];
    alarmManuallyDismissed = false;
    
    // Stop any active alarm
    stopDeadlockAlarm();
    
    // Reset to default configuration
    applyConfiguration();
    
    addToLog('✅ Graph completely cleared');
}

function clearLog() {
    document.getElementById('logContent').innerHTML = '';
    addToLog('📋 Log cleared');
    addToLog('✅ System ready');
}

// ============================
// DRAG FUNCTIONALITY
// ============================
function addDragFunctionality() {
    const nodes = document.querySelectorAll('.graph-node');
    
    nodes.forEach(node => {
        node.addEventListener('mousedown', startDrag);
    });
}

function startDrag(e) {
    // Only start dragging on left mouse button
    if (e.button !== 0) return;
    
    e.stopPropagation();
    
    const node = e.currentTarget;
    let isDragging = true;
    
    const offsetX = e.clientX - node.getBoundingClientRect().left;
    const offsetY = e.clientY - node.getBoundingClientRect().top;
    
    function drag(e) {
        if (!isDragging) return;
        
        const graphCircle = document.getElementById('graphCircle');
        const circleRect = graphCircle.getBoundingClientRect();
        
        let x = e.clientX - circleRect.left - offsetX;
        let y = e.clientY - circleRect.top - offsetY;
        
        // Keep within circle bounds
        const centerX = 300;
        const centerY = 300;
        const radius = 290;
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        if (dist > radius) {
            const angle = Math.atan2(y - centerY, x - centerX);
            x = centerX + Math.cos(angle) * radius;
            y = centerY + Math.sin(angle) * radius;
        }
        
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        // Update edges
        updateEdges();
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('mouseleave', stopDrag);
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mouseleave', stopDrag);
}

// ============================
// DEADLOCK DETECTION
// ============================
function detectDeadlock() {
    console.log("🔍 Detecting deadlock...");
    
    // Build adjacency matrix
    const graph = {};
    edges.forEach(edge => {
        if (!graph[edge.from]) graph[edge.from] = [];
        graph[edge.from].push(edge.to);
    });
    
    // Detect cycles using DFS
    cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const path = [];
    
    function dfs(node) {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);
        
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            } else if (recursionStack.has(neighbor)) {
                // Cycle detected
                const cycleStart = path.indexOf(neighbor);
                const cycle = path.slice(cycleStart);
                cycles.push([...cycle, neighbor]);
            }
        }
        
        recursionStack.delete(node);
        path.pop();
    }
    
    for (const node in graph) {
        if (!visited.has(node)) {
            dfs(node);
        }
    }
    
    // Store previous state for comparison
    const wasDeadlockDetected = deadlockDetected;
    
    // Update status
    if (cycles.length > 0) {
        deadlockDetected = true;
        updateStatus('DEADLOCK DETECTED');
        highlightCycles();
        
        let cycleText = cycles.map((cycle, i) => 
            `Cycle ${i + 1}: ${cycle.join(' → ')}`
        ).join('<br>');
        addToLog(`🚨 DEADLOCK DETECTED! Cycles found:<br>${cycleText}`);
        
        // ⭐⭐ CRITICAL FIX: ALWAYS TRIGGER ALARM WHEN DEADLOCK IS DETECTED ⭐⭐
        // Only don't trigger if alarm was manually dismissed
        if (!alarmManuallyDismissed) {
            triggerDeadlockAlarm();
        } else {
            // Alarm was dismissed, just update status
            updateStatus('DEADLOCK DETECTED (Alarm Muted)');
        }
        
        // ⭐⭐ ADDED: Ensure alarm panel is shown ⭐⭐
        if (!window.alarmPanel || !document.body.contains(window.alarmPanel)) {
            showAlarmPanel();
        }
    } else {
        deadlockDetected = false;
        updateStatus('SAFE');
        clearHighlights();
        
        // Stop alarm if it was active
        stopDeadlockAlarm();
        
        // Reset alarm dismissal flag when deadlock is cleared
        alarmManuallyDismissed = false;
    }
    
    updateProcessTable();
    return deadlockDetected;
}

function triggerDeadlockAlarm() {
    if (deadlockDetected) {
        // Always ensure alarm is active when deadlock is detected
        isAlarmActive = true;
        
        console.log("🚨 DEADLOCK ALARM ACTIVATED!");
        
        // Visual effects
        const overlay = document.getElementById('deadlockOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
        
        // Status bar
        const statusStrip = document.getElementById('statusStrip');
        const statusText = document.getElementById('statusText');
        if (statusStrip) {
            statusStrip.classList.add('deadlock');
            statusText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 🚨 DEADLOCK DETECTED!';
        }
        
        // Play alarm sound - ALWAYS PLAY WHEN ALARM IS TRIGGERED
        playAlarmSound();
        
        // ⭐⭐ CRITICAL: Always show alarm panel when deadlock is detected ⭐⭐
        // Only create new panel if one doesn't exist
        if (!window.alarmPanel || !document.body.contains(window.alarmPanel)) {
            showAlarmPanel();
        }
        
        addToLog("🚨 DEADLOCK ALARM ACTIVATED!");
    }
}

function stopDeadlockAlarm() {
    isAlarmActive = false;
    
    // Stop alarm sound
    const alarmSound = document.getElementById('deadlock-alarm-sound');
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        console.log("✅ Alarm sound stopped");
    }
    
    // Remove visual effects
    const overlay = document.getElementById('deadlockOverlay');
    if (overlay) overlay.classList.remove('active');
    
    // Hide alarm panel
    hideAlarmPanel();
}

function playAlarmSound() {
    console.log("🚨 Playing deadlock alarm sound: alarm2.mp3");
    
    // Stop normal sound first if playing
    const normalSound = document.getElementById('normal-sound');
    if (normalSound) {
        normalSound.pause();
        normalSound.currentTime = 0;
    }
    
    // Play alarm sound
    const alarmSound = document.getElementById('deadlock-alarm-sound');
    
    if (!alarmSound) {
        console.error("❌ Alarm sound element not found");
        return;
    }
    
    try {
        alarmSound.currentTime = 0;
        alarmSound.loop = true;
        alarmSound.volume = 0.3;
        
        const playPromise = alarmSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Alarm sound blocked:", error.message);
                // Even if sound is blocked, still show visual alarm
            });
        }
    } catch (error) {
        console.error("Error playing alarm sound:", error);
    }
}

function showAlarmPanel() {
    // Remove existing panel if any
    hideAlarmPanel();
    
    // Create alarm panel
    const alarmPanel = document.createElement('div');
    alarmPanel.className = 'deadlock-alarm-panel';
    alarmPanel.innerHTML = `
        <h3>
            <i class="fas fa-skull-crossbones"></i>
            CRITICAL DEADLOCK DETECTED!
        </h3>
        <p style="color: white; margin-bottom: 20px;">
            System is in a deadlock state with ${cycles.length} cycle(s) detected.
            Immediate action required!
        </p>
        <div class="alarm-resolve-buttons">
            <button class="alarm-resolve-btn auto" id="autoBreakDeadlock">
                <i class="fas fa-robot"></i> Auto-Break Deadlock
            </button>
            <button class="alarm-resolve-btn manual" id="suggestDeadlockFix">
                <i class="fas fa-lightbulb"></i> Show Resolution Options
            </button>
            <button class="alarm-resolve-btn dismiss" id="dismissAlarm">
                <i class="fas fa-times"></i> Dismiss Alarm (Ignore)
            </button>
        </div>
    `;
    
    document.body.appendChild(alarmPanel);
    
    // Add event listeners
    document.getElementById('autoBreakDeadlock').addEventListener('click', function() {
        autoBreakDeadlock();
        stopDeadlockAlarm();
        alarmManuallyDismissed = false;
    });
    
    document.getElementById('suggestDeadlockFix').addEventListener('click', function() {
        suggestResolution();
    });
    
    document.getElementById('dismissAlarm').addEventListener('click', function() {
        alarmManuallyDismissed = true;
        isAlarmActive = false;
        
        const audio = document.getElementById('deadlock-alarm-sound');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        
        const overlay = document.getElementById('deadlockOverlay');
        if (overlay) overlay.classList.remove('active');
        
        updateStatus('DEADLOCK DETECTED (Alarm Muted)');
        
        hideAlarmPanel();
        
        addToLog("🔕 Alarm dismissed manually. Deadlock still exists but alarm muted.");
    });
    
    // Store reference
    window.alarmPanel = alarmPanel;
}

function hideAlarmPanel() {
    if (window.alarmPanel && window.alarmPanel.parentNode) {
        window.alarmPanel.parentNode.removeChild(window.alarmPanel);
        window.alarmPanel = null;
    }
}

function highlightCycles() {
    const statusStrip = document.getElementById('statusStrip');
    const statusText = document.getElementById('statusText');
    
    if (!alarmManuallyDismissed) {
        statusStrip.classList.add('deadlock');
        statusText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 🚨 DEADLOCK DETECTED';

 // First clear any previous highlights
        document.querySelectorAll('.graph-node').forEach(node => {
            // Reset to normal glow using CSS variable
            node.style.setProperty('--node-glow-color', '');
        });

        
        // Highlight cycle nodes
        cycles.forEach(cycle => {
            cycle.forEach(nodeId => {
                const node = document.querySelector(`[data-id="${nodeId}"]`);
                if (node) {
                    node.style.setProperty('--node-glow-color', '#ff2a6d');
                }
            });
        });
    }
}

function clearHighlights() {
    console.log("🔄 Clearing all deadlock highlights");
    
    const statusStrip = document.getElementById('statusStrip');
    const statusText = document.getElementById('statusText');
    
    if (statusStrip) {
        statusStrip.classList.remove('deadlock');
        statusText.innerHTML = '<i class="fas fa-shield-alt"></i> SYSTEM STATE: SAFE';
    }
    
    // Clear all node highlights
    document.querySelectorAll('.graph-node').forEach(node => {
        // Remove deadlock highlight by resetting the CSS variable
        node.style.setProperty('--node-glow-color', '');
        
        // Remove any deadlock-specific classes
        node.classList.remove('deadlock-highlight');
        node.classList.remove('cycle-node');
        
        // Reset any inline styles that might be overriding colors
        node.style.boxShadow = '';
        node.style.filter = '';
        node.style.border = '';
    });
    
    // Clear any edge highlights
    const edgesSVG = document.getElementById('edgesSVG');
    if (edgesSVG) {
        edgesSVG.querySelectorAll('.edge').forEach(edge => {
            edge.classList.remove('cycle-highlight');
            edge.style.filter = '';
            edge.style.stroke = '';
        });
    }
    
    // Also update circle glow
    updateCircleGlow();
    
    // Force a re-render
    setTimeout(() => {
        updateEdges();
        updateProcessTable();
    }, 100);
}

// ============================
// DEADLOCK RESOLUTION
// ============================
function findCriticalEdges() {
    const criticalEdges = [];
    
    // Test each edge to see if removing it would break all cycles
    edges.forEach(edge => {
        // Create a copy of edges without this one
        const testEdges = edges.filter(e => 
            !(e.from === edge.from && e.to === edge.to)
        );
        
        // Check if cycles still exist without this edge
        const cyclesWithoutEdge = findCyclesInEdges(testEdges);
        
        if (cyclesWithoutEdge.length < cycles.length) {
            criticalEdges.push({
                from: edge.from,
                to: edge.to,
                cyclesBroken: cycles.length - cyclesWithoutEdge.length,
                edgeObject: edge
            });
        }
    });

    // Sort by most cycles broken
    return criticalEdges.sort((a, b) => b.cyclesBroken - a.cyclesBroken);
}

function findCyclesInEdges(testEdges) {
    const graph = {};
    testEdges.forEach(edge => {
        if (!graph[edge.from]) graph[edge.from] = [];
        graph[edge.from].push(edge.to);
    });

    const testCycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const path = [];

    function dfs(node) {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);

        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            } else if (recursionStack.has(neighbor)) {
                const cycleStart = path.indexOf(neighbor);
                const cycle = path.slice(cycleStart);
                testCycles.push([...cycle, neighbor]);
            }
        }

        recursionStack.delete(node);
        path.pop();
    }

    for (const node in graph) {
        if (!visited.has(node)) {
            dfs(node);
        }
    }

    return testCycles;
}

function suggestResolution() {
    if (!deadlockDetected) {
        document.getElementById('resolutionInfo').innerHTML = '<em>No deadlock detected. No resolution needed.</em>';
        return;
    }
    
    const criticalEdges = findCriticalEdges();
    let suggestions = '<strong>Suggested resolutions:</strong><br>';
    
    if (criticalEdges.length === 0) {
        suggestions += '<em>No single edge removal can break all cycles. Consider terminating a process.</em>';
    } else {
        criticalEdges.forEach((edge, index) => {
            suggestions += `
                <div class="resolution-suggestion" onclick="removeEdgeManually('${edge.from}', '${edge.to}')" 
                     style="cursor: pointer; padding: 5px; margin: 5px 0; background: rgba(255, 42, 109, 0.1); border-radius: 4px;">
                    Remove edge: <span class="edge-to-remove" style="color: #ff2a6d;">${edge.from} → ${edge.to}</span>
                    (breaks ${edge.cyclesBroken} cycle${edge.cyclesBroken > 1 ? 's' : ''})
                </div>
            `;
        });
    }
    
    document.getElementById('resolutionInfo').innerHTML = suggestions;
}

function removeEdgeManually(from, to) {
    const edgeIndex = edges.findIndex(edge => 
        edge.from === from && edge.to === to
    );
    
    if (edgeIndex !== -1) {
        const removedEdge = edges[edgeIndex];
        edges.splice(edgeIndex, 1);
        
        // Update edges display
        updateEdges();
        
        // Update resolution info
        document.getElementById('resolutionInfo').innerHTML = 
            `<em>Removed edge: ${from} → ${to}</em>`;
        
        // Re-check for deadlocks
        detectDeadlock();
        updateSystemInfo();
        updateProcessTable();
        updateResourceTable();
        
        // Show success message if resolved
        if (!deadlockDetected) {
            document.getElementById('resolutionInfo').innerHTML += 
                '<br><strong style="color: #00ff00;">✅ Deadlock resolved!</strong>';
            
            // Clear the red highlights
            clearHighlights();
            
            showSuccessNotification(`Deadlock resolved by removing edge: ${from} → ${to}`);
            alarmManuallyDismissed = false;
        }
    }
}

function autoBreakDeadlock() {
    if (!deadlockDetected) {
        addToLog('No deadlock detected. No action needed.');
        return;
    }

    const criticalEdges = findCriticalEdges();
    
    if (criticalEdges.length === 0) {
        addToLog('Cannot automatically break this deadlock. Try manual resolution.');
        return;
    }

    // Remove the edge that breaks the most cycles
    const bestEdge = criticalEdges[0];
    removeEdgeManually(bestEdge.from, bestEdge.to);

}

function breakDeadlock() {
    if (!deadlockDetected) {
        addToLog('No deadlock to break.');
        return;
    }
    
    // Find a process in a cycle to terminate
    const processesInCycles = new Set();
    cycles.forEach(cycle => {
        cycle.forEach(nodeId => {
            if (nodeId.startsWith('P')) {
                processesInCycles.add(nodeId);
            }
        });
    });
    
    if (processesInCycles.size === 0) {
        addToLog('No processes found in cycles.');
        return;
    }
    
    // Terminate the first process in a cycle
    const processToTerminate = Array.from(processesInCycles)[0];
    
    // Remove all edges connected to this process
    edges = edges.filter(e => e.from !== processToTerminate && e.to !== processToTerminate);
    
    // Update edges
    updateEdges();
    
    // Re-check for deadlocks
    detectDeadlock();
    updateSystemInfo();

    // Clear highlights if deadlock is resolved
    if (!deadlockDetected) {
        clearHighlights();
    }
    
    addToLog(`✅ Process ${processToTerminate} terminated to break deadlock.`);
    showSuccessNotification(`Process ${processToTerminate} terminated to break deadlock.`);
    
    alarmManuallyDismissed = false;
}

function showSuccessNotification(message) {
    console.log("🎉 Success notification: " + message);
    
    // Play Sci Fi music when notification appears
    playSuccessSound();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'cyber-notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// ============================
// TERMINATE PROCESS
// ============================
function terminateProcess() {
    const processId = document.getElementById('processId').value;
    
    console.log(`💀 Terminating process: ${processId}`);
    
    const processNode = document.querySelector(`[data-id="${processId}"]`);
    if (!processNode) {
        addToLog(`❌ Process ${processId} not found`);
        return;
    }
    
    // Release all resources allocated to this process
    const processAllocations = edges.filter(e => 
        e.to === processId && e.type === 'allocation'
    );
    
    processAllocations.forEach(allocation => {
        const resourceId = allocation.from;
        const instances = allocation.instances;
        
        // Remove allocation
        const allocationIndex = edges.findIndex(e => 
            e.from === resourceId && e.to === processId && e.type === 'allocation'
        );
        if (allocationIndex !== -1) {
            edges.splice(allocationIndex, 1);
        }
        
        addToLog(`✅ Released ${instances} instance(s) of ${resourceId} from ${processId}`);
        
        // Check pending requests for this resource
        checkPendingRequests(resourceId);
    });
    
    // Remove all requests from this process
    edges = edges.filter(e => e.from !== processId);
    
    // Remove process node
    processNode.remove();
    processes = processes.filter(p => p.id !== processId);
    
    // Update edges and UI
    updateEdges();
    updateProcessDropdown();
    updateProcessTable();
    updateResourceTable();
    updateSystemInfo();
    detectDeadlock();
    
    addToLog(`✅ Process ${processId} terminated`);
}

// ============================
// SCENARIO LOADING
// ============================
function loadScenario(scenario) {
    applyConfiguration();
    
    // If circular wait prevention is enabled, disable it temporarily for scenarios
    const wasPreventionEnabled = preventCircularWaitEnabled;
    if (wasPreventionEnabled) {
        document.getElementById('preventCircularWait').checked = false;
        preventCircularWaitEnabled = false;
        addToLog('⚠️ Circular wait prevention temporarily disabled for scenario loading');
    }
    
    setTimeout(() => {
        switch(scenario) {
            case 'no-deadlock':
                edges = [
                    { from: 'R1', to: 'P1', type: 'allocation', instances: 1 },
                    { from: 'R2', to: 'P2', type: 'allocation', instances: 1 },
                    { from: 'P3', to: 'R1', type: 'request', instances: 1 }
                ];
                addToLog('✅ Loaded: No Deadlock Scenario');
                break;
                
            case 'single-cycle':
                edges = [
                    { from: 'R1', to: 'P1', type: 'allocation', instances: 1 },
                    { from: 'P1', to: 'R2', type: 'request', instances: 1 },
                    { from: 'R2', to: 'P2', type: 'allocation', instances: 1 },
                    { from: 'P2', to: 'R1', type: 'request', instances: 1 }
                ];
                addToLog('✅ Loaded: Single Cycle Deadlock Scenario');
                break;
                
            case 'multiple-cycles':
                edges = [
                    { from: 'R1', to: 'P1', type: 'allocation', instances: 1 },
                    { from: 'P1', to: 'R2', type: 'request', instances: 1 },
                    { from: 'R2', to: 'P2', type: 'allocation', instances: 1 },
                    { from: 'P2', to: 'R1', type: 'request', instances: 1 },
                    { from: 'P2', to: 'R2', type: 'request', instances: 1 },
                    { from: 'P3', to: 'R1', type: 'request', instances: 1 }
                ];
                addToLog('✅ Loaded: Multiple Cycles Scenario');
                break;
        }
        
        // Redraw edges
        updateEdges();
        detectDeadlock();
        updateSystemInfo();
        updateProcessTable();
        updateResourceTable();
        
        // Re-enable prevention if it was enabled
        if (wasPreventionEnabled) {
            setTimeout(() => {
                document.getElementById('preventCircularWait').checked = true;
                toggleCircularWait();
                addToLog('✅ Circular wait prevention re-enabled');
                
                // Check for violations in the loaded scenario
                checkAndFixResourceOrder();
            }, 500);
        }
    }, 100);
}

// ============================
// PROCESS & RESOURCE TABLES
// ============================
function updateProcessTable() {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';
    
    processes.forEach(process => {
        // Find allocation and request edges for this process
        const allocatedResources = edges
            .filter(e => e.to === process.id && e.type === 'allocation')
            .map(e => `${e.from}(${e.instances})`);
        
        const requestedResources = edges
            .filter(e => e.from === process.id && e.type === 'request')
            .map(e => `${e.to}(${e.instances})`);
        
        const allocationText = allocatedResources.length > 0 ? allocatedResources.join(', ') : 'None';
        const requestText = requestedResources.length > 0 ? requestedResources.join(', ') : 'None';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${process.id}</strong></td>
            <td>${allocationText}</td>
            <td>${requestText}</td>
            <td style="color: ${deadlockDetected ? '#ff3333' : '#00ff00'}; font-weight: bold;">
                ${deadlockDetected ? '⛔ BLOCKED' : '✅ READY'}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateResourceTable() {
    const tbody = document.getElementById('resourceTableBody');
    tbody.innerHTML = '';
    
    resources.forEach(resource => {
        // Calculate allocations for this resource
        const allocatedEdges = edges.filter(e => 
            e.from === resource.id && e.type === 'allocation'
        );
        
        const allocatedInstances = allocatedEdges.reduce((sum, edge) => sum + edge.instances, 0);
        const available = (resource.instances || 1) - allocatedInstances;
        
        // Count pending requests
        const pendingRequests = edges.filter(e => 
            e.to === resource.id && e.type === 'request'
        );
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${resource.id}</strong></td>
            <td>${resource.instances || 1}</td>
            <td>${available}</td>
            <td>${allocatedInstances}</td>
            <td>${pendingRequests.length}</td>
        `;
        
        // Color code based on availability
        if (available <= 0) {
            row.cells[2].style.color = '#ff3333';
        } else if (available < (resource.instances || 1)) {
            row.cells[2].style.color = '#ff9900';
        } else {
            row.cells[2].style.color = '#00ff00';
        }
        
        tbody.appendChild(row);
    });
}

// ============================
// CIRCULAR WAIT PREVENTION
// ============================
function toggleCircularWait() {
    preventCircularWaitEnabled = document.getElementById('preventCircularWait').checked;
    
    if (preventCircularWaitEnabled) {
        const orderText = document.getElementById('resourceOrder').value.trim();
        if (orderText) {
            resourceOrder = orderText.split(',').map(r => r.trim());
        } else {
            resourceOrder = resources.map(r => r.id);
            document.getElementById('resourceOrder').value = resourceOrder.join(',');
        }
        addToLog(`✅ Circular Wait Prevention ENABLED. Resource order: ${resourceOrder.join(' < ')}`);
    } else {
        addToLog(`❌ Circular Wait Prevention DISABLED`);
    }
}

function applyResourceOrder() {
    const orderText = document.getElementById('resourceOrder').value.trim();
    if (!orderText) {
        addToLog('❌ Please enter resource order (e.g., R1,R2,R3)');
        return;
    }
    
    resourceOrder = orderText.split(',').map(r => r.trim());
    
    // Validate that all resources exist
    const invalidResources = resourceOrder.filter(r => !resources.some(res => res.id === r));
    if (invalidResources.length > 0) {
        addToLog(`❌ Invalid resources in order: ${invalidResources.join(', ')}`);
        return;
    }
    
    // If prevention is enabled, update it
    if (preventCircularWaitEnabled) {
        addToLog(`✅ Resource order applied: ${resourceOrder.join(' < ')}`);
        
        // Check if current edges violate the order
        checkAndFixResourceOrder();
    } else {
        addToLog(`✅ Resource order saved: ${resourceOrder.join(' < ')}`);
        addToLog('💡 Enable "Prevent Circular Wait" to activate this ordering');
    }
}

function checkAndFixResourceOrder() {
    if (!preventCircularWaitEnabled) return;
    
    let violations = [];
    
    // Check each allocation edge
    edges.forEach(edge => {
        if (edge.type === 'allocation') {
            // Find the process that has this resource allocated
            const processId = edge.to;
            
            // Check all request edges from this process
            const processRequests = edges.filter(e => 
                e.from === processId && e.type === 'request'
            );
            
            processRequests.forEach(request => {
                const allocatedResource = edge.from;
                const requestedResource = request.to;
                
                // Check if the order is violated
                const allocatedIndex = resourceOrder.indexOf(allocatedResource);
                const requestedIndex = resourceOrder.indexOf(requestedResource);
                
                if (allocatedIndex !== -1 && requestedIndex !== -1) {
                    if (allocatedIndex >= requestedIndex) {
                        violations.push({
                            process: processId,
                            allocated: allocatedResource,
                            requested: requestedResource,
                            message: `Process ${processId} has ${allocatedResource} (position ${allocatedIndex + 1}) and requests ${requestedResource} (position ${requestedIndex + 1})`
                        });
                    }
                }
            });
        }
    });
    
    if (violations.length > 0) {
        addToLog(`⚠️ Resource order violations detected (${violations.length})`);
        violations.forEach(violation => {
            addToLog(`   ⚠️ ${violation.message}`);
        });
        
        // Suggest fixes
        suggestOrderFixes(violations);
    }
}

function suggestOrderFixes(violations) {
    const resolutionInfo = document.getElementById('resolutionInfo');
    let suggestions = '<strong>Resource Order Violations:</strong><br>';
    
    violations.forEach((violation, index) => {
        suggestions += `
            <div class="violation-suggestion" style="padding: 5px; margin: 5px 0; background: rgba(255, 153, 0, 0.1); border-radius: 4px;">
                <strong>Violation ${index + 1}:</strong> ${violation.message}<br>
                <small>Fix: Release ${violation.allocated} from ${violation.process} first</small>
                <div style="margin-top: 5px;">
                    <button class="neon-button small" onclick="autoFixViolation('${violation.process}', '${violation.allocated}')" 
                            style="padding: 3px 8px; font-size: 10px;">
                        <i class="fas fa-wrench"></i> Auto-Fix
                    </button>
                </div>
            </div>
        `;
    });
    
    suggestions += `<br><small><i class="fas fa-info-circle"></i> Circular wait prevention requires processes to request resources in ascending order.</small>`;
    
    resolutionInfo.innerHTML = suggestions;
}

function autoFixViolation(processId, resourceId) {
    // Release the violating resource
    document.getElementById('processId').value = processId;
    document.getElementById('resourceId').value = resourceId;
    
    // Find allocation edge
    const allocationEdge = edges.find(e => 
        e.from === resourceId && e.to === processId && e.type === 'allocation'
    );
    
    if (allocationEdge) {
        // Release all instances
        const instances = allocationEdge.instances;
        
        // Remove allocation
        const allocationIndex = edges.findIndex(e => 
            e.from === resourceId && e.to === processId && e.type === 'allocation'
        );
        
        if (allocationIndex !== -1) {
            edges.splice(allocationIndex, 1);
            updateEdges();
            
            addToLog(`✅ Auto-released ${instances} instance(s) of ${resourceId} from ${processId} to fix order violation`);
            
            // Check pending requests
            checkPendingRequests(resourceId);
            
            // Update UI
            updateProcessTable();
            updateResourceTable();
            updateSystemInfo();
            detectDeadlock();
            
            // Check for new violations
            checkAndFixResourceOrder();
        }
    }
}

function checkResourceOrder(processId, requestedResourceId) {
    if (!preventCircularWaitEnabled) return true;
    
    // Get all resources currently allocated to this process
    const allocatedResources = edges
        .filter(e => e.to === processId && e.type === 'allocation')
        .map(e => e.from);
    
    if (allocatedResources.length === 0) {
        // Process has no resources, can request any
        return true;
    }
    
    // Check if requested resource is in the order
    const requestedIndex = resourceOrder.indexOf(requestedResourceId);
    if (requestedIndex === -1) {
        // Resource not in order, allow request
        return true;
    }
    
    // Check each allocated resource
    for (const allocatedResource of allocatedResources) {
        const allocatedIndex = resourceOrder.indexOf(allocatedResource);
        
        if (allocatedIndex !== -1) {
            // Both resources are in the order
            if (allocatedIndex >= requestedIndex) {
                // Violation: allocated resource has equal or higher number
                addToLog(`⚠️ Order violation: ${processId} has ${allocatedResource} (position ${allocatedIndex + 1}) and requests ${requestedResourceId} (position ${requestedIndex + 1})`);
                return false;
            }
        }
    }
    
    return true;
}

// ============================
// UTILITY FUNCTIONS
// ============================
function updateStatus(state) {
    const statusStrip = document.getElementById('statusStrip');
    const statusText = document.getElementById('statusText');
    
    if (state === 'DEADLOCK DETECTED') {
        statusStrip.classList.add('deadlock');
        statusText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 🚨 DEADLOCK DETECTED';
    } else if (state === 'DEADLOCK DETECTED (Alarm Muted)') {
        statusStrip.classList.remove('deadlock');
        statusText.innerHTML = '<i class="fas fa-volume-mute"></i> DEADLOCK (Alarm Muted)';
    } else {
        statusStrip.classList.remove('deadlock');
        statusText.innerHTML = '<i class="fas fa-shield-alt"></i> SYSTEM STATE: SAFE';
    }
}

function updateSystemInfo() {
    const infoDiv = document.getElementById('systemInfo');
    const processCount = processes.length;
    const resourceCount = resources.length;
    const edgeCount = edges.length;
    let state = 'Safe';
    
    if (deadlockDetected) {
        state = alarmManuallyDismissed ? 'Deadlock (Alarm Muted)' : 'Deadlock';
    }
    
    infoDiv.innerHTML = `
        <i class="fas fa-microchip"></i> Processes: ${processCount}<br>
        <i class="fas fa-database"></i> Resources: ${resourceCount}<br>
        <i class="fas fa-project-diagram"></i> Edges: ${edgeCount}<br>
        <i class="fas fa-shield-alt"></i> State: <span style="color: ${state === 'Safe' ? '#00ff00' : '#ff3333'}">${state}</span>
    `;
}

function addToLog(message) {
    const logContent = document.getElementById('logContent');
    const timestamp = new Date().toLocaleTimeString();
    logContent.innerHTML += `[${timestamp}] ${message}<br>`;
    logContent.scrollTop = logContent.scrollHeight;
}

// ============================
// TEST FUNCTION
// ============================
function testEdgeCreation() {
    addToLog('🧪 Testing edge creation...');
    
    // Test 1: Request resource when available
    document.getElementById('processId').value = 'P1';
    document.getElementById('resourceId').value = 'R1';
    document.getElementById('requestInstances').value = 1;
    
    addToLog('Test 1: P1 requests R1 (should allocate if available)');
    
    // Test 2: Request resource when not available
    setTimeout(() => {
        document.getElementById('processId').value = 'P2';
        document.getElementById('resourceId').value = 'R1';
        addToLog('Test 2: P2 requests R1 (should create request edge)');
    }, 1000);
    
    // Test 3: Release resource
    setTimeout(() => {
        document.getElementById('processId').value = 'P1';
        addToLog('Test 3: P1 releases R1 (should auto-allocate to P2)');
    }, 2000);
}

// ============================
// CIRCLE GLOW
// ============================
function updateCircleGlow() {
    console.log("✨ Updating circle glow");
    const graphCircle = document.getElementById('graphCircle');
    if (graphCircle) {
        if (deadlockDetected) {
            graphCircle.classList.add('deadlock-mode');
        } else {
            graphCircle.classList.remove('deadlock-mode');
        }
    }
}

function playWarningSound() {
    console.log("⚠️ Playing warning sound");
    const normalSound = document.getElementById('normal-sound');
    if (normalSound) {
        normalSound.currentTime = 0;
        normalSound.volume = 0.3;
        normalSound.play().catch(e => console.log("Warning sound play failed:", e.name));
    }
}

function resetAllVisuals() {
    // Reset all nodes
    document.querySelectorAll('.graph-node').forEach(node => {
        const nodeId = node.dataset.id;
        const nodeType = node.dataset.type;
        
        // Reset to original styling
        node.style.setProperty('--node-glow-color', '');
        node.style.boxShadow = '';
        node.style.filter = '';
        node.style.border = '';
        node.style.transform = '';
        node.classList.remove('deadlock-highlight');
        node.classList.remove('cycle-node');
        
        // Reapply original color based on type and ID
        if (nodeType === 'process') {
            // Process nodes already have color classes applied
        } else if (nodeType === 'resource') {
            // Resource nodes have color classes too
        }
    });
    
    // Reset edges
    const edgesSVG = document.getElementById('edgesSVG');
    if (edgesSVG) {
        edgesSVG.querySelectorAll('.edge').forEach(edge => {
            edge.classList.remove('cycle-highlight');
            edge.style.filter = '';
            edge.style.stroke = '';
        });
    }
    
    // Reset circle glow
    const circleGlow = document.querySelector('.circle-glow-container');
    if (circleGlow) {
        circleGlow.style.animation = '';
    }
    
    // Update edges to ensure proper colors
    setTimeout(updateEdges, 50);
}