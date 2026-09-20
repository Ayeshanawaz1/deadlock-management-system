// ============================
// BANKER'S ALGORITHM VARIABLES
// ============================
let bankerProcessCount = 3;
let bankerResourceCount = 2;
let bankerAvailable = [3, 3];
let bankerAllocation = [
    [1, 0],
    [1, 0],
    [0, 0]
];
let bankerMax = [
    [3, 2],
    [2, 0],
    [2, 0]
];

// Step tracking variables
let bankerSteps = [];
let currentStep = 0;
let isAnimating = false;

// ============================
// BANKER'S ALGORITHM INITIALIZATION
// ============================

function applyBankerConfig() {
    applyBankerConfigWithRequests();
}

function updateBankerResources() {
    const container = document.getElementById('bankerResources');
    container.innerHTML = '';
    
    for (let i = 0; i < bankerResourceCount; i++) {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label>R${i + 1} Available:</label>
            <input type="number" id="availR${i + 1}" value="${bankerAvailable[i]}" min="0" onchange="updateAvailable(${i})">
        `;
        container.appendChild(div);
    }
}

function updateAvailable(index) {
    bankerAvailable[index] = parseInt(document.getElementById(`availR${index + 1}`).value) || 0;
}

function updateAllocationMatrix() {
    const container = document.getElementById('allocationMatrix');
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'matrix-header';
    let headerHTML = '<div class="matrix-cell process">Process</div>';
    for (let j = 0; j < bankerResourceCount; j++) {
        headerHTML += `<div class="matrix-cell">R${j + 1}</div>`;
    }
    header.innerHTML = headerHTML;
    container.appendChild(header);
    
    // Create rows
    for (let i = 0; i < bankerProcessCount; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        let rowHTML = `<div class="matrix-cell process">P${i + 1}</div>`;
        
        for (let j = 0; j < bankerResourceCount; j++) {
            rowHTML += `
                <div class="matrix-cell" id="allocCell_${i}_${j}">
                    <input type="number" id="alloc${i}_${j}" value="${bankerAllocation[i][j]}" 
                           min="0" onchange="updateAllocation(${i}, ${j})">
                </div>
            `;
        }
        
        row.innerHTML = rowHTML;
        container.appendChild(row);
    }
}

function updateAllocation(i, j) {
    bankerAllocation[i][j] = parseInt(document.getElementById(`alloc${i}_${j}`).value) || 0;
}

function updateMaxMatrix() {
    const container = document.getElementById('maxMatrix');
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'matrix-header';
    let headerHTML = '<div class="matrix-cell process">Process</div>';
    for (let j = 0; j < bankerResourceCount; j++) {
        headerHTML += `<div class="matrix-cell">R${j + 1}</div>`;
    }
    header.innerHTML = headerHTML;
    container.appendChild(header);
    
    // Create rows
    for (let i = 0; i < bankerProcessCount; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        let rowHTML = `<div class="matrix-cell process">P${i + 1}</div>`;
        
        for (let j = 0; j < bankerResourceCount; j++) {
            rowHTML += `
                <div class="matrix-cell" id="maxCell_${i}_${j}">
                    <input type="number" id="max${i}_${j}" value="${bankerMax[i][j]}" 
                           min="0" onchange="updateMax(${i}, ${j})">
                </div>
            `;
        }
        
        row.innerHTML = rowHTML;
        container.appendChild(row);
    }
}

function updateMax(i, j) {
    bankerMax[i][j] = parseInt(document.getElementById(`max${i}_${j}`).value) || 0;
}

function updateNeedMatrix() {
    const container = document.getElementById('needMatrix');
    container.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'matrix-header';
    let headerHTML = '<div class="matrix-cell process">Process</div>';
    for (let j = 0; j < bankerResourceCount; j++) {
        headerHTML += `<div class="matrix-cell">R${j + 1}</div>`;
    }
    header.innerHTML = headerHTML;
    container.appendChild(header);
    
    // Create rows
    for (let i = 0; i < bankerProcessCount; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        let rowHTML = `<div class="matrix-cell process">P${i + 1}</div>`;
        
        for (let j = 0; j < bankerResourceCount; j++) {
            const need = Math.max(0, bankerMax[i][j] - bankerAllocation[i][j]);
            rowHTML += `<div class="matrix-cell" id="needCell_${i}_${j}">${need}</div>`;
        }
        
        row.innerHTML = rowHTML;
        container.appendChild(row);
    }
}

function calculateNeed() {
    updateNeedMatrix();
    saveStep("Need Matrix Calculated", "Calculated Need = Max - Allocation for all processes");
    addToLog('✅ Need matrix calculated: Need = Max - Allocation');
}

// ============================
// SAFETY ALGORITHM
// ============================


function calculateNeedMatrix() {
    const need = [];
    for (let i = 0; i < bankerProcessCount; i++) {
        const row = [];
        for (let j = 0; j < bankerResourceCount; j++) {
            row.push(Math.max(0, bankerMax[i][j] - bankerAllocation[i][j]));
        }
        need.push(row);
    }
    return need;
}

// ============================
// STEP TRACKING SYSTEM
// ============================
function initBankerStepTracking() {
    bankerSteps = [];
    currentStep = 0;
    isAnimating = false;
    
    console.log("✅ Banker step tracking initialized");
}

function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= bankerSteps.length) return;
    
    currentStep = stepIndex;
    const step = bankerSteps[stepIndex];
    
    console.log(`🔍 Showing step ${stepIndex + 1}:`, step.title);
    
    // Clear all highlights
    clearHighlights();
    
    // IMPORTANT: Don't update matrix values! They don't change.
    // Only update the work vector display
    if (step.work) {
        updateWorkVectorDisplay(step.work);
    } else {
        updateWorkVectorDisplay(bankerAvailable);
    }
    
    // Update calculation display
    updateCalculationDisplay(step);
    
    // Apply matrix highlights (visual only, no value changes)
    if (step.highlightCells && step.highlightCells.length > 0) {
        step.highlightCells.forEach(cell => {
            highlightCell(cell);
        });
    }
    
    // Update step history and controls
    updateStepHistory();
    updateStepControls();
    
    // Log step
    addToLog(`📋 Step ${stepIndex + 1}: ${step.title}`);
}

function updateMatricesFromStep(step) {
    console.log(`🔄 Updating matrices for step: ${step.title}`);
    console.log("Available:", step.available);
    console.log("Allocation:", step.allocation);
    console.log("Max:", step.max);
    
    // Update global variables to match step
    bankerAvailable = [...step.available];
    bankerAllocation = step.allocation.map(row => [...row]);
    bankerMax = step.max.map(row => [...row]);
    
    // Update available resources display
    for (let j = 0; j < bankerResourceCount; j++) {
        const input = document.getElementById(`availR${j + 1}`);
        if (input) {
            input.value = step.available[j];
        }
    }
    
    // Update allocation matrix display
    for (let i = 0; i < bankerProcessCount; i++) {
        for (let j = 0; j < bankerResourceCount; j++) {
            const cell = document.getElementById(`allocCell_${i}_${j}`);
            const input = document.getElementById(`alloc${i}_${j}`);
            if (cell && input) {
                input.value = step.allocation[i][j];
                // Also update the cell text if it's not an input
                const textElements = cell.querySelectorAll(':not(input)');
                textElements.forEach(el => {
                    if (el.tagName !== 'INPUT') {
                        el.textContent = step.allocation[i][j];
                    }
                });
            }
        }
    }
    
    // Update max matrix display
    for (let i = 0; i < bankerProcessCount; i++) {
        for (let j = 0; j < bankerResourceCount; j++) {
            const cell = document.getElementById(`maxCell_${i}_${j}`);
            const input = document.getElementById(`max${i}_${j}`);
            if (cell && input) {
                input.value = step.max[i][j];
                const textElements = cell.querySelectorAll(':not(input)');
                textElements.forEach(el => {
                    if (el.tagName !== 'INPUT') {
                        el.textContent = step.max[i][j];
                    }
                });
            }
        }
    }
    
    // Update need matrix display
    updateNeedMatrixFromStep(step);
    
    // Force UI update
    updateNeedMatrix();
}

function updateNeedMatrixFromStep(step) {
    const container = document.getElementById('needMatrix');
    if (!container) return;
    
    const cells = container.querySelectorAll('.matrix-cell:not(.process)');
    let cellIndex = 0;
    
    for (let i = 0; i < bankerProcessCount; i++) {
        for (let j = 0; j < bankerResourceCount; j++) {
            if (cells[cellIndex]) {
                cells[cellIndex].textContent = step.need[i][j];
                cellIndex++;
            }
        }
    }
}

function highlightCell(cellInfo) {
    let cellElement;
    
    switch(cellInfo.type) {
        case 'allocation':
            cellElement = document.getElementById(`allocCell_${cellInfo.process}_${cellInfo.resource}`);
            break;
        case 'max':
            cellElement = document.getElementById(`maxCell_${cellInfo.process}_${cellInfo.resource}`);
            break;
        case 'need':
            cellElement = document.getElementById(`needCell_${cellInfo.process}_${cellInfo.resource}`);
            break;
        case 'available':
            cellElement = document.querySelector(`[id^="availR${cellInfo.index + 1}"]`)?.parentNode;
            break;
        case 'work':
            // This is for the work vector display
            const workDisplay = document.getElementById('workDisplay');
            if (workDisplay) {
                workDisplay.classList.add('highlight');
            }
            return;
    }
    
    if (cellElement) {
        cellElement.classList.add('highlight');
    }
}

function updateStepControls() {
    const stepControls = document.getElementById('stepControls');
    if (!stepControls) {
        console.warn("Step controls container not found!");
        return;
    }
    
    const currentStepData = bankerSteps[currentStep];
    
    stepControls.innerHTML = `
        <div class="step-info">
            <strong>Step ${currentStep + 1} of ${bankerSteps.length}:</strong>
            ${currentStepData?.title || 'No steps'}
        </div>
        <div class="step-navigation">
            <button class="neon-button small" onclick="previousStep()" ${currentStep === 0 ? 'disabled' : ''}>
                <i class="fas fa-step-backward"></i> Previous
            </button>
            <button class="neon-button small" onclick="nextStep()" ${currentStep >= bankerSteps.length - 1 ? 'disabled' : ''}>
                Next <i class="fas fa-step-forward"></i>
            </button>
            <button class="neon-button small" onclick="goToStep(0)" ${currentStep === 0 ? 'disabled' : ''}>
                <i class="fas fa-fast-backward"></i> First
            </button>
            <button class="neon-button small" onclick="goToStep(bankerSteps.length - 1)" ${currentStep === bankerSteps.length - 1 ? 'disabled' : ''}>
                Last <i class="fas fa-fast-forward"></i>
            </button>
            <button class="neon-button small" id="autoPlayBtn" onclick="${isAnimating ? 'pauseAutoPlay()' : 'autoPlaySteps()'}">
                <i class="fas fa-${isAnimating ? 'pause' : 'play'}"></i> ${isAnimating ? 'Pause' : 'Auto-play'}
            </button>
        </div>
        <div class="step-description">
            ${currentStepData?.description || 'No description available'}
        </div>
    `;
}

function createStepControls() {
    const controls = document.createElement('div');
    controls.id = 'stepControls';
    controls.className = 'step-controls';
    
    const bankerContainer = document.querySelector('.banker-container');
    const resultsSection = document.querySelector('.banker-container .panel-section:last-child');
    
    if (resultsSection) {
        resultsSection.parentNode.insertBefore(controls, resultsSection);
    } else {
        bankerContainer.appendChild(controls);
    }
    
    return controls;
}

function previousStep() {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

function nextStep() {
    if (currentStep < bankerSteps.length - 1) {
        showStep(currentStep + 1);
    }
}

function goToStep(index) {
    if (index >= 0 && index < bankerSteps.length) {
        showStep(index);
    }
}

function updateStepHistory() {
    const stepHistory = document.getElementById('stepHistory');
    if (!stepHistory) return;
    
    stepHistory.innerHTML = '';
    
    bankerSteps.forEach((step, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = `step-history-item ${index === currentStep ? 'active' : ''}`;
        historyItem.innerHTML = `
            <span class="step-history-step">Step ${index + 1}:</span>
            <span class="step-history-title">${step.title}</span>
        `;
        historyItem.onclick = () => showStep(index);
        stepHistory.appendChild(historyItem);
    });
    
    // Scroll to active item
    const activeItem = stepHistory.querySelector('.active');
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ============================
// AUTO-PLAY AND VISUALIZATION
// ============================
function autoPlaySteps() {
    if (isAnimating) return;
    
    isAnimating = true;
    const playButton = document.querySelector('#autoPlayBtn');
    if (playButton) {
        playButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        playButton.onclick = pauseAutoPlay;
    }
    
    let step = currentStep;
    const playInterval = setInterval(() => {
        if (step < bankerSteps.length - 1 && isAnimating) {
            step++;
            showStep(step);
        } else {
            clearInterval(playInterval);
            isAnimating = false;
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i> Auto-play';
                playButton.onclick = autoPlaySteps;
            }
        }
    }, 1500);
}

function pauseAutoPlay() {
    isAnimating = false;
    const playButton = document.querySelector('#autoPlayBtn');
    if (playButton) {
        playButton.innerHTML = '<i class="fas fa-play"></i> Auto-play';
        playButton.onclick = autoPlaySteps;
    }
}

// ============================
// WORK VECTOR DISPLAY
// ============================
function updateWorkVectorDisplay(workValues) {
    console.log("🔄 Updating work vector display:", workValues);
    
    // Update global available for consistency
    if (workValues && workValues.length === bankerAvailable.length) {
        bankerAvailable = [...workValues];
    }
    
    const workValuesDiv = document.getElementById('workValues');
    if (!workValuesDiv) {
        // Create if doesn't exist
        const workSection = document.querySelector('.work-vector-section');
        if (workSection) {
            const newDiv = document.createElement('div');
            newDiv.id = 'workValues';
            newDiv.className = 'work-values';
            workSection.appendChild(newDiv);
        } else {
            console.warn("Work section not found!");
            // Create a new section if it doesn't exist
            const bankerContainer = document.querySelector('.banker-container');
            if (bankerContainer) {
                const workSection = document.createElement('div');
                workSection.className = 'work-vector-section';
                workSection.innerHTML = `
                    <h4><i class="fas fa-cogs"></i> Work Vector</h4>
                    <div id="workValues" class="work-values"></div>
                `;
                bankerContainer.appendChild(workSection);
            }
        }
    }
    
    // Get the div again in case it was just created
    const updatedWorkDiv = document.getElementById('workValues');
    if (!updatedWorkDiv) {
        console.error("Failed to create work values div!");
        return;
    }
    
    updatedWorkDiv.innerHTML = '';
    
    workValues.forEach((value, index) => {
        const workBox = document.createElement('div');
        workBox.className = 'work-value-box';
        workBox.innerHTML = `
            <div class="resource-label">R${index + 1}</div>
            <div class="work-value-number">${value}</div>
        `;
        workBox.id = `workValue${index}`;
        workBox.dataset.value = value;
        updatedWorkDiv.appendChild(workBox);
    });
}

function highlightWorkValue(index, oldValue, newValue) {
    const workBox = document.getElementById(`workValue${index}`);
    if (workBox) {
        // Store old value
        workBox.dataset.oldValue = oldValue;
        
        // Add highlight animation
        workBox.classList.add('value-updating');
        
        // Update with animation
        setTimeout(() => {
            workBox.innerHTML = `
                <div class="resource-label">R${index + 1}</div>
                <div class="value-change-display">
                    <span class="old-value">${oldValue}</span>
                    <span class="change-arrow">→</span>
                    <span class="new-value">${newValue}</span>
                </div>
            `;
            workBox.dataset.value = newValue;
            
            // Remove highlight after animation
            setTimeout(() => {
                workBox.classList.remove('value-updating');
                workBox.innerHTML = `
                    <div class="resource-label">R${index + 1}</div>
                    <div class="work-value-number">${newValue}</div>
                `;
            }, 1500);
        }, 300);
    }
}

// ============================
// CALCULATION DISPLAY
// ============================
function updateCalculationDisplay(step) {
    console.log("📊 Updating calculation display for step:", step.title);
    
    // Update current formula
    const calcFormula = document.getElementById('calcFormula');
    if (calcFormula) {
        if (step.calculations && step.calculations.length > 0) {
            // Use the first calculation as the main formula
            const mainFormula = step.calculations[0] || step.description || 'No calculation';
            calcFormula.innerHTML = formatFormula(mainFormula);
            console.log("Set formula:", mainFormula);
        } else if (step.description) {
            calcFormula.innerHTML = formatFormula(step.description);
            console.log("Using description as formula:", step.description);
        } else {
            calcFormula.innerHTML = '<em>No calculation for this step</em>';
            console.log("No calculation data");
        }
    } else {
        console.warn("calcFormula element not found!");
    }
    
    // Update step details section
    const stepDetails = document.getElementById('stepDetails');
    if (stepDetails) {
        if (step.description) {
            const cleanDesc = step.description.replace(/<[^>]*>/g, '');
            stepDetails.innerHTML = `
                <div class="step-detail-item main-detail">${cleanDesc}</div>
            `;
            
            // Add calculation steps if available
            if (step.calculations && step.calculations.length > 1) {
                stepDetails.innerHTML += step.calculations.slice(1).map(calc => 
                    `<div class="step-detail-item sub-detail">${cleanFormula(calc)}</div>`
                ).join('');
            }
            console.log("Updated step details with:", cleanDesc);
        } else {
            stepDetails.innerHTML = '<div class="step-detail-item main-detail">No step details available</div>';
        }
    }
    
    // Update value changes section
    const valueChanges = document.getElementById('calcValueChanges');
    if (valueChanges) {
        if (step.valueChanges && step.valueChanges.length > 0) {
            valueChanges.innerHTML = step.valueChanges.map(change => 
                `<div class="value-change-item">${formatFormula(change)}</div>`
            ).join('');
            console.log("Updated value changes:", step.valueChanges.length, "changes");
        } else {
            valueChanges.innerHTML = '<div class="no-changes">No value changes in this step</div>';
        }
    }
}

function formatFormula(formula) {
    if (!formula) return '';
    
    // Debug: log what we're receiving
    console.log("Original formula:", formula);
    
    // If it already contains span tags, just return it
    if (formula.includes('<span') || formula.includes('formula-')) {
        console.log("Formula already contains HTML, returning as-is");
        return formula;
    }
    
    // Simple formatting - don't overcomplicate it
    let result = formula
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(P\d+)/g, '<span class="formula-process">$1</span>')
        .replace(/(R\d+)/g, '<span class="formula-resource">$1</span>')
        .replace(/\b(Need|Work|Allocation|Max|Available)\b/gi, '<span class="formula-keyword">$1</span>')
        .replace(/(\d+)/g, '<span class="formula-number">$1</span>');
    
    console.log("Formatted result:", result);
    return result;
}

function cleanFormula(formula) {
    if (!formula) return '';
    // Just strip HTML tags and return
    return formula.replace(/<[^>]*>/g, '');
}

// ============================
// BANKER'S ALGORITHM EXAMPLES
// ============================
function generateExample(exampleNumber) {
    console.log(`Generating example ${exampleNumber}`);
    
    switch(exampleNumber) {
        case 1:
            // Safe state example
            bankerProcessCount = 3;
            bankerResourceCount = 2;
            bankerAvailable = [3, 3];
            bankerAllocation = [
                [1, 0],
                [1, 0],
                [0, 0]
            ];
            bankerMax = [
                [3, 2],
                [2, 0],
                [2, 0]
            ];
            addToLog('📊 Generated Example 1: Safe state with 3 processes, 2 resources');
            break;
            
        case 2:
            // Another safe state example
            bankerProcessCount = 4;
            bankerResourceCount = 3;
            bankerAvailable = [2, 3, 3];
            bankerAllocation = [
                [0, 1, 0],
                [2, 0, 0],
                [0, 0, 2],
                [1, 0, 1]
            ];
            bankerMax = [
                [1, 2, 1],
                [3, 1, 0],
                [0, 1, 3],
                [2, 0, 2]
            ];
            addToLog('📊 Generated Example 2: Safe state with 4 processes, 3 resources');
            break;
            
        case 3:
            // Unsafe state example
            bankerProcessCount = 3;
            bankerResourceCount = 2;
            bankerAvailable = [1, 1];
            bankerAllocation = [
                [2, 0],
                [0, 2],
                [1, 1]
            ];
            bankerMax = [
                [3, 1],
                [2, 3],
                [2, 2]
            ];
            addToLog('📊 Generated Example 3: Unsafe state (possible deadlock)');
            break;
            
        case 4:
            // More complex safe example
            bankerProcessCount = 5;
            bankerResourceCount = 3;
            bankerAvailable = [3, 3, 2];
            bankerAllocation = [
                [0, 1, 0],
                [2, 0, 0],
                [3, 0, 2],
                [2, 1, 1],
                [0, 0, 2]
            ];
            bankerMax = [
                [7, 5, 3],
                [3, 2, 2],
                [9, 0, 2],
                [2, 2, 2],
                [4, 3, 3]
            ];
            addToLog('📊 Generated Example 4: Complex safe state with 5 processes');
            break;
            
        case 5:
            // Another unsafe example
            bankerProcessCount = 4;
            bankerResourceCount = 2;
            bankerAvailable = [1, 0];
            bankerAllocation = [
                [1, 0],
                [0, 1],
                [1, 0],
                [0, 0]
            ];
            bankerMax = [
                [2, 1],
                [1, 2],
                [2, 1],
                [1, 1]
            ];
            addToLog('📊 Generated Example 5: Unsafe state (resources exhausted)');
            break;
    }
    
    // Update UI
    document.getElementById('bankerProcessCount').value = bankerProcessCount;
    document.getElementById('bankerResourceCount').value = bankerResourceCount;
    
    // Update main matrices
    updateBankerResources();
    updateAllocationMatrix();
    updateMaxMatrix();
    updateNeedMatrix();
    
    // CRITICAL: Also update the request section
    refreshRequestUI();
    
    // Update step tracking
    initBankerStepTracking();
    
    addToLog('✅ Example loaded successfully. Click "Run Safety Algorithm" to test.');
}

function generateRandomValidExample() {
    console.log("🎲 Generating random valid example...");
    
    // Random number of processes (3-6) and resources (2-4)
    bankerProcessCount = Math.floor(Math.random() * 4) + 3; // 3-6
    bankerResourceCount = Math.floor(Math.random() * 3) + 2; // 2-4
    
    // Generate random matrices
    bankerAllocation = [];
    bankerMax = [];
    bankerAvailable = [];
    
    // Generate initial available resources (1-5 each)
    for (let j = 0; j < bankerResourceCount; j++) {
        bankerAvailable.push(Math.floor(Math.random() * 5) + 1);
    }
    
    // Generate allocation and max matrices
    for (let i = 0; i < bankerProcessCount; i++) {
        const allocationRow = [];
        const maxRow = [];
        
        for (let j = 0; j < bankerResourceCount; j++) {
            // Random allocation (0 to available)
            const maxAlloc = Math.floor(bankerAvailable[j] * 0.7);
            const allocation = Math.floor(Math.random() * (maxAlloc + 1));
            allocationRow.push(allocation);
            
            // Max = allocation + random (0-2)
            const additional = Math.floor(Math.random() * 3);
            maxRow.push(allocation + additional);
        }
        
        bankerAllocation.push(allocationRow);
        bankerMax.push(maxRow);
    }
    
    // Update UI
    document.getElementById('bankerProcessCount').value = bankerProcessCount;
    document.getElementById('bankerResourceCount').value = bankerResourceCount;
    
    // Update main matrices
    updateBankerResources();
    updateAllocationMatrix();
    updateMaxMatrix();
    updateNeedMatrix();
    
    // CRITICAL: Also update the request section
    refreshRequestUI();
    
    // Update step tracking
    initBankerStepTracking();
    
    addToLog('🎲 Random valid example generated!');
    addToLog(`📊 Configuration: ${bankerProcessCount} processes, ${bankerResourceCount} resources`);
    addToLog('💡 Click "Run Safety Algorithm" to test safety');
}

function showExampleSelection() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'example-modal';
    modal.style.cssText = `
        background: var(--cyber-panel);
        border: 3px solid var(--cyber-blue);
        border-radius: 15px;
        padding: 30px;
        width: 600px;
        max-width: 90vw;
        box-shadow: 0 0 40px rgba(0, 255, 255, 0.5);
        color: white;
    `;
    
    modal.innerHTML = `
        <h3 style="color: var(--cyber-blue); text-align: center; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <i class="fas fa-vial"></i> Select Example Scenario
        </h3>
        
        <div class="example-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
            <button class="example-btn" onclick="selectExample(1)">
                <div class="example-title">Example 1</div>
                <div class="example-desc">Safe State</div>
                <div class="example-details">3 processes, 2 resources</div>
            </button>
            
            <button class="example-btn" onclick="selectExample(2)">
                <div class="example-title">Example 2</div>
                <div class="example-desc">Safe State</div>
                <div class="example-details">4 processes, 3 resources</div>
            </button>
            
            <button class="example-btn" onclick="selectExample(3)">
                <div class="example-title">Example 3</div>
                <div class="example-desc">Unsafe State</div>
                <div class="example-details">3 processes, 2 resources</div>
            </button>
            
            <button class="example-btn" onclick="selectExample(4)">
                <div class="example-title">Example 4</div>
                <div class="example-desc">Complex Safe</div>
                <div class="example-details">5 processes, 3 resources</div>
            </button>
            
            <button class="example-btn" onclick="selectExample(5)">
                <div class="example-title">Example 5</div>
                <div class="example-desc">Unsafe State</div>
                <div class="example-details">4 processes, 2 resources</div>
            </button>
            
            <button class="example-btn random" onclick="selectRandomExample()">
                <div class="example-title">🎲 Random</div>
                <div class="example-desc">Random Valid</div>
                <div class="example-details">Auto-generated configuration</div>
            </button>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 15px;">
            <button class="close-btn" onclick="closeExampleModal()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Store reference for later removal
    window.exampleModal = overlay;
    
    // Add CSS for example buttons
    const style = document.createElement('style');
    style.textContent = `
        .example-btn {
            background: linear-gradient(135deg, rgba(0, 170, 255, 0.2), rgba(0, 100, 200, 0.2));
            border: 2px solid var(--cyber-blue);
            border-radius: 10px;
            padding: 15px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .example-btn:hover {
            background: linear-gradient(135deg, rgba(0, 170, 255, 0.4), rgba(0, 100, 200, 0.4));
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
        }
        
        .example-btn.random {
            border-color: var(--cyber-purple);
            background: linear-gradient(135deg, rgba(185, 103, 255, 0.2), rgba(128, 0, 255, 0.2));
        }
        
        .example-btn.random:hover {
            background: linear-gradient(135deg, rgba(185, 103, 255, 0.4), rgba(128, 0, 255, 0.4));
            box-shadow: 0 5px 20px rgba(185, 103, 255, 0.3);
        }
        
        .example-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--cyber-blue);
        }
        
        .example-btn.random .example-title {
            color: var(--cyber-purple);
        }
        
        .example-desc {
            font-size: 14px;
            margin: 5px 0;
        }
        
        .example-details {
            font-size: 11px;
            color: #aaa;
            font-style: italic;
        }
        
        .close-btn {
            background: linear-gradient(135deg, #ff3333, #cc0000);
            border: none;
            border-radius: 6px;
            padding: 12px 25px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .close-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 51, 51, 0.4);
        }
    `;
    document.head.appendChild(style);
}

function selectExample(exampleNumber) {
    generateExample(exampleNumber);
    closeExampleModal();
    
    // Force a complete refresh
    refreshRequestUI();
    
    // Show success notification
    showBankerNotification(`Example ${exampleNumber} loaded successfully!`, 'success');
    
    // Also update the work vector section if it exists
    updateWorkVectorDisplay(bankerAvailable);
}

function selectRandomExample() {
    generateRandomValidExample();
    closeExampleModal();
    
    // Force a complete refresh
    refreshRequestUI();
    
    // Show success notification
    showBankerNotification('Random example generated!', 'success');
    
    // Also update the work vector section if it exists
    updateWorkVectorDisplay(bankerAvailable);
}

function closeExampleModal() {
    if (window.exampleModal && window.exampleModal.parentNode) {
        window.exampleModal.parentNode.removeChild(window.exampleModal);
        window.exampleModal = null;
    }
}

function showBankerNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `cyber-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1001;
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
// UTILITY FUNCTIONS
// ============================
function clearHighlights() {
    // Clear all matrix cells highlights
    document.querySelectorAll('.matrix-cell').forEach(cell => {
        cell.classList.remove('highlight', 'value-updated');
        
        // Remove any value change indicators
        const indicators = cell.querySelectorAll('.value-change-indicator');
        indicators.forEach(indicator => indicator.remove());
    });
    
    // Clear highlight from work display
    const workDisplay = document.getElementById('workDisplay');
    if (workDisplay) {
        workDisplay.classList.remove('highlight');
    }
    
    // Clear work value highlights
    document.querySelectorAll('.work-value').forEach(value => {
        value.classList.remove('highlight');
    });
}

// ============================
// KEYBOARD NAVIGATION
// ============================
document.addEventListener('keydown', function(e) {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab && activeTab.dataset.tab === 'bankers') {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousStep();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextStep();
        } else if (e.key === 'Home') {
            e.preventDefault();
            goToStep(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            goToStep(bankerSteps.length - 1);
        } else if (e.key === ' ') {
            e.preventDefault();
            if (isAnimating) {
                pauseAutoPlay();
            } else {
                autoPlaySteps();
            }
        }
    }
});

// ============================
// ENHANCED STEP TRACKING WITH FORMULAS
// ============================
function saveEnhancedStep(title, description, highlights = [], calculations = [], valueChanges = [], workFormula = null) {
    const step = {
        title,
        description: description || '',
        timestamp: new Date().toLocaleTimeString(),
        // IMPORTANT: Matrices NEVER change in safety check!
        available: [...bankerAvailable],  // Original available resources
        allocation: bankerAllocation.map(row => [...row]),  // Original allocation (unchanged)
        max: bankerMax.map(row => [...row]),  // Original max (unchanged)
        need: calculateNeedMatrix(),  // Calculated once (unchanged)
        highlightCells: highlights,
        calculations: calculations || [],
        valueChanges: valueChanges || [],
        workFormula: workFormula,
        work: [...bankerAvailable],  // This will be updated as algorithm progresses
        safeSequence: [],
        stepType: 'safety-check'
    };
    
    bankerSteps.push(step);
    console.log(`📝 Step saved: "${title}"`);
    return step;
}

// ============================
// MATRIX VALUE CHANGE ANIMATIONS
// ============================
function showMatrixValueChange(processIndex, resourceIndex, oldValue, newValue, matrixType) {
    let cellId;
    let cellElement;
    
    switch(matrixType) {
        case 'allocation':
            cellId = `allocCell_${processIndex}_${resourceIndex}`;
            cellElement = document.getElementById(cellId);
            break;
        case 'max':
            cellId = `maxCell_${processIndex}_${resourceIndex}`;
            cellElement = document.getElementById(cellId);
            break;
        case 'need':
            cellId = `needCell_${processIndex}_${resourceIndex}`;
            cellElement = document.getElementById(cellId);
            break;
    }
    
    if (cellElement) {
        // Add visual indicator
        const changeIndicator = document.createElement('div');
        changeIndicator.className = 'value-change-indicator';
        changeIndicator.innerHTML = `
            <span style="color: #ff9900; font-weight: bold;">
                ${oldValue} → ${newValue}
            </span>
        `;
        changeIndicator.style.cssText = `
            position: absolute;
            top: -20px;
            right: -5px;
            background: rgba(0,0,0,0.8);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            z-index: 10;
            border: 1px solid #ff9900;
            animation: floatUp 2s ease-out forwards;
        `;
        
        // Add animation styles
        if (!document.querySelector('#floatAnimation')) {
            const style = document.createElement('style');
            style.id = 'floatAnimation';
            style.textContent = `
                @keyframes floatUp {
                    0% { opacity: 1; transform: translateY(0); }
                    70% { opacity: 1; transform: translateY(-25px); }
                    100% { opacity: 0; transform: translateY(-25px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        cellElement.style.position = 'relative';
        cellElement.appendChild(changeIndicator);
        
        // Remove indicator after animation
        setTimeout(() => {
            if (changeIndicator.parentNode) {
                changeIndicator.parentNode.removeChild(changeIndicator);
            }
        }, 2000);
    }
}

// ============================
// WORK CALCULATION EXPLANATION
// ============================
function explainWorkCalculation(stepData) {
    const container = document.getElementById('workCalculationExplanation');
    if (!container) {
        // Create container if it doesn't exist
        const workSection = document.querySelector('.work-vector-section');
        if (workSection) {
            const explanationDiv = document.createElement('div');
            explanationDiv.id = 'workCalculationExplanation';
            explanationDiv.className = 'work-calculation-explanation';
            workSection.appendChild(explanationDiv);
        } else return;
    }
    
    if (stepData.workFormula) {
        container.innerHTML = `
            <div class="work-formula-title">
                <i class="fas fa-calculator"></i> Work Calculation:
            </div>
            <div class="work-formula">
                ${formatFormula(stepData.workFormula)}
            </div>
            ${stepData.calculations && stepData.calculations.length > 0 ? `
                <div class="calculation-steps">
                    ${stepData.calculations.map(calc => `
                        <div class="calculation-step">${formatFormula(calc)}</div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    } else {
        container.innerHTML = `
            <div class="work-formula-title">
                <i class="fas fa-info-circle"></i> Current Work Vector:
            </div>
            <div class="work-values-display">
                Work = [${(stepData.currentWork || bankerAvailable).join(', ')}]
            </div>
        `;
    }
}

function explainWorkVector() {
    const workSection = document.querySelector('.work-vector-section');
    if (workSection && !workSection.querySelector('.work-explanation')) {
        const explanation = document.createElement('div');
        explanation.className = 'work-explanation';
        explanation.innerHTML = `
            <div class="explanation-content">
                <strong>Work Vector:</strong>
                <small>Formula: Work(new) = Work(old) + Allocation[finished_process]</small>
            </div>
        `;
        workSection.insertBefore(explanation, workSection.querySelector('#workValues'));
    }
}

// ============================
// ENHANCED SAFETY ALGORITHM WITH EXPLANATIONS
// ============================
function checkSafetyWithExplanations() {
    // Reset everything
    bankerSteps = [];
    currentStep = 0;
    isAnimating = false;
    
    // Reset status
    resetBankerStatus();
    
    // Store initial state (these don't change!)
    const initialAllocation = bankerAllocation.map(row => [...row]);
    const initialMax = bankerMax.map(row => [...row]);
    const initialAvailable = [...bankerAvailable];
    
    // Calculate initial Need matrix (this doesn't change!)
    const needMatrix = calculateNeedMatrix();
    
    // Save initial step
    saveEnhancedStep(
        "Initialization",
        "Starting Safety Algorithm - Calculate Need Matrix",
        Array.from({length: bankerProcessCount}, (_, i) => 
            Array.from({length: bankerResourceCount}, (_, j) => ({
                type: 'need', process: i, resource: j
            }))
        ).flat(),
        [
            "Need = Max - Allocation",
            ...Array.from({length: bankerProcessCount}, (_, i) => 
                `P${i+1}: Need = [${initialMax[i].join(',')}] - [${initialAllocation[i].join(',')}] = [${needMatrix[i].join(',')}]`
            ),
            `Initial Work = Available = [${initialAvailable.join(', ')}]`
        ],
        [],
        "Work = Available"
    );
    
    let work = [...initialAvailable];
    const finish = Array(bankerProcessCount).fill(false);
    const safeSequence = [];
    let iteration = 1;
    
    // Update initial work display
    updateWorkVectorDisplay(work);
    
    while (safeSequence.length < bankerProcessCount) {
        let found = false;
        
        for (let i = 0; i < bankerProcessCount; i++) {
            if (!finish[i]) {
                const needRow = needMatrix[i];
                const canFinish = needRow.every((need, j) => need <= work[j]);
                
                // Build condition checks
                const conditionChecks = needRow.map((need, j) => {
                    const result = need <= work[j];
                    return `Need[P${i+1},R${j+1}](${need}) ≤ Work[R${j+1}](${work[j]}) = ${result ? '✓' : '✗'}`;
                });
                
                if (canFinish) {
                    // Save step BEFORE process finishes
                    saveEnhancedStep(
                        `Iteration ${iteration}: Check P${i+1}`,
                        `Process P${i+1} can finish: Need ≤ Work for all resources`,
                        [
                            ...needRow.map((_, j) => ({type: 'need', process: i, resource: j})),
                            ...work.map((_, j) => ({type: 'available', index: j}))
                        ],
                        [
                            `Checking P${i+1}: Need[P${i+1}] ≤ Work?`,
                            `Condition: Need[P${i+1}] ≤ Work`,
                            ...conditionChecks,
                            `Result: ALL CONDITIONS SATISFIED ✓ P${i+1} CAN FINISH`
                        ],
                        [],
                        `Need[P${i+1}] ≤ Work`
                    );
                    
                    // Store old work for animation
                    const oldWork = [...work];
                    const allocationRow = initialAllocation[i];
                    
                    // Save step for the actual execution - WORK VECTOR UPDATES HERE
                    const workChanges = work.map((val, j) => {
                        const newVal = val + allocationRow[j];
                        return `Work[R${j+1}] = ${val} + ${allocationRow[j]} = ${newVal}`;
                    });
                    
                    saveEnhancedStep(
                        `P${i+1} Finishes and Releases Resources`,
                        `Process P${i+1} completes execution and releases all allocated resources back to the system`,
                        [
                            ...allocationRow.map((_, j) => ({type: 'allocation', process: i, resource: j})),
                            ...work.map((_, j) => ({type: 'available', index: j}))
                        ],
                        [
                            `When process finishes:`,
                            `New Work = Current Work + Allocation[P${i+1}]`,
                            `Work(new) = Work(old) + [${allocationRow.join(', ')}]`,
                            ...workChanges
                        ],
                        workChanges,
                        `Work(new) = Work(old) + Allocation[P${i+1}]`
                    );
                    
                    // ACTUALLY UPDATE THE WORK VECTOR (this is the ONLY thing that changes)
                    for (let j = 0; j < bankerResourceCount; j++) {
                        const oldVal = work[j];
                        work[j] += allocationRow[j];
                        
                        // Animate the work value change
                        highlightWorkValue(j, oldVal, work[j]);
                    }
                    
                    // Update the step's work value
                    bankerSteps[bankerSteps.length - 1].work = [...work];
                    
                    finish[i] = true;
                    safeSequence.push(`P${i+1}`);
                    iteration++;
                    found = true;
                    
                    // Update work display
                    updateWorkVectorDisplay(work);
                    
                    // Save the updated state for next step
                    saveEnhancedStep(
                        `State After P${i+1} Finishes`,
                        `Updated Work vector after P${i+1} releases its resources`,
                        [
                            ...work.map((_, j) => ({type: 'available', index: j}))
                        ],
                        [
                            `Work vector updated: [${work.join(', ')}]`,
                            `Processes finished so far: ${safeSequence.join(', ')}`,
                            `Processes remaining: ${finish.filter(f => !f).length}`
                        ],
                        [],
                        null
                    );
                    
                    break;
                } else {
                    // Process cannot finish
                    const failedConditions = conditionChecks.filter((_, j) => needRow[j] > work[j]);
                    
                    saveEnhancedStep(
                        `Iteration ${iteration}: P${i+1} Cannot Finish`,
                        `Process P${i+1} cannot finish: Need > Work for some resources`,
                        [
                            ...needRow.map((_, j) => ({type: 'need', process: i, resource: j})),
                            ...work.map((_, j) => ({type: 'available', index: j}))
                        ],
                        [
                            `Checking P${i+1}: Can it finish?`,
                            `Condition: Need[P${i+1}] ≤ Work`,
                            ...conditionChecks,
                            `Result: CONDITION FAILED - P${i+1} must wait`,
                            `Failed conditions: ${failedConditions.join('; ')}`
                        ],
                        [],
                        null
                    );
                }
            }
        }
        
        if (!found) {
            // Deadlock detected
            const unfinished = finish.map((f, idx) => !f ? `P${idx+1}` : null).filter(Boolean);
            
            saveEnhancedStep(
                "Deadlock Detected - System UNSAFE",
                `No process can finish with current Work vector`,
                [],
                [
                    `All unfinished processes checked: ${unfinished.join(', ')}`,
                    `None satisfy: Need ≤ Work`,
                    `Current Work: [${work.join(', ')}]`,
                    `System is in UNSAFE state ✗`
                ],
                [],
                null
            );
            
            break;
        }
    }
    
    // Save final result
    if (safeSequence.length === bankerProcessCount) {
        saveEnhancedStep(
            "Algorithm Complete - System SAFE",
            `All processes can finish successfully in the sequence shown`,
            [],
            [
                `✅ SAFE SEQUENCE FOUND: ${safeSequence.join(' → ')}`,
                `Final Work vector: [${work.join(', ')}]`,
                `All ${bankerProcessCount} processes can finish without deadlock`,
                `System is in a SAFE state ✓`
            ],
            [],
            null
        );
        
        // Update UI with safe state
        updateStatusHeader(true, `Safe sequence: ${safeSequence.join(' → ')}`);
        updateContainerBoundary(true);
        showSafeSequenceIfAvailable(safeSequence);
        addToLog(`✅ System is in a SAFE state. Safe sequence: ${safeSequence.join(' → ')}`);
    } else {
        saveEnhancedStep(
            "Algorithm Complete - System UNSAFE",
            `Deadlock is possible with current allocation`,
            [],
            [
                `❌ Only ${safeSequence.length} of ${bankerProcessCount} processes can finish`,
                `Partial sequence: ${safeSequence.join(' → ') || 'None'}`,
                `Final Work vector: [${work.join(', ')}]`,
                `System is in UNSAFE state ✗`
            ],
            [],
            null
        );
        
        // Update UI with unsafe state
        updateStatusHeader(false, `Only ${safeSequence.length} of ${bankerProcessCount} processes can finish`);
        updateContainerBoundary(false);
        addToLog(`❌ System is in an UNSAFE state. Only ${safeSequence.length} of ${bankerProcessCount} processes can finish`);
    }
    
    // Initialize step visualization
    updateStepControls();
    showStep(0);
}

// ============================
// ENHANCED STEP DISPLAY
// ============================
function showEnhancedStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= bankerSteps.length) return;
    
    currentStep = stepIndex;
    const step = bankerSteps[stepIndex];
    
    // Clear previous highlights
    clearHighlights();
    
    // Update matrices
    updateMatricesFromStep(step);
    
    // Update displays
    updateCalculationDisplay(step);
    updateWorkVectorDisplay(step.currentWork || bankerAvailable);
    explainWorkCalculation(step);
    updateStepDetails(step);
    
    // Apply highlights
    if (step.highlightCells && step.highlightCells.length > 0) {
        step.highlightCells.forEach(cell => highlightCell(cell));
    }
    
    // Update UI
    updateStepControls();
    updateStepHistory();
    
    // Log step
    addToLog(`📋 Step ${stepIndex + 1}: ${step.title}`);
}

function updateStepDetails(step) {
    const container = document.getElementById('stepDetailsContainer');
    if (!container) {
        // Create container
        const stepControls = document.getElementById('stepControls');
        if (stepControls) {
            const detailsDiv = document.createElement('div');
            detailsDiv.id = 'stepDetailsContainer';
            detailsDiv.className = 'step-details-container';
            stepControls.parentNode.insertBefore(detailsDiv, stepControls.nextSibling);
        } else return;
    }
    
    container.innerHTML = `
        <div class="step-details-section">
            <h4><i class="fas fa-info-circle"></i> Step Details</h4>
            <div class="step-description-box">${step.description}</div>
            
            ${step.calculations && step.calculations.length > 0 ? `
                <div class="calculations-section">
                    <h5><i class="fas fa-calculator"></i> Calculations</h5>
                    <div class="calculation-list">
                        ${step.calculations.map(calc => `
                            <div class="calculation-item">${formatFormula(calc)}</div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${step.valueChanges && step.valueChanges.length > 0 ? `
                <div class="value-changes-section">
                    <h5><i class="fas fa-exchange-alt"></i> Value Changes</h5>
                    <div class="value-changes-list">
                        ${step.valueChanges.map(change => `
                            <div class="value-change-item">${formatFormula(change)}</div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${step.workFormula ? `
                <div class="work-formula-section">
                    <h5><i class="fas fa-code"></i> Formula</h5>
                    <div class="formula-display">
                        ${formatFormula(step.workFormula)}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================
// HELPER FUNCTIONS
// ============================
function displaySafetyResult(isSafe, sequence) {
    const safetyResult = document.getElementById('safetyResult');
    const safeSequenceDiv = document.getElementById('safeSequence');
    
    if (isSafe) {
        safetyResult.className = 'safe';
        safetyResult.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="font-size: 24px; color: #00ff00;"></i>
                <div>
                    <strong>✅ System is in a SAFE state</strong><br>
                    <small>All processes can finish without deadlock</small>
                </div>
            </div>
        `;
        safeSequenceDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-list-ol" style="color: var(--cyber-blue);"></i>
                <div>
                    <strong>Safe sequence:</strong> ${sequence.join(' → ')}
                </div>
            </div>
        `;
    } else {
        safetyResult.className = 'unsafe';
        safetyResult.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ff3333;"></i>
                <div>
                    <strong>❌ System is in an UNSAFE state</strong><br>
                    <small>Deadlock is possible with current allocation</small>
                </div>
            </div>
        `;
        safeSequenceDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle" style="color: #ff9900;"></i>
                <div>
                    <strong>Partial sequence:</strong> ${sequence.join(' → ') || 'None'}
                </div>
            </div>
        `;
    }
}

function ensureWorkVectorSection() {
    const workSection = document.querySelector('.work-vector-section');
    if (!workSection) {
        const bankerContainer = document.querySelector('.banker-container');
        if (bankerContainer) {
            // Find matrices section
            const matrices = document.querySelector('.matrix-container');
            
            const newSection = document.createElement('div');
            newSection.className = 'work-vector-section';
            newSection.innerHTML = `
                <h4><i class="fas fa-cogs"></i> Work Vector (Available Resources)</h4>
                <div id="workValues" class="work-values"></div>
            `;
            
            if (matrices) {
                matrices.parentNode.insertBefore(newSection, matrices.nextSibling);
            } else {
                bankerContainer.appendChild(newSection);
            }
        }
    }
}

const workExplanationCSS = `
    .work-explanation {
        background: rgba(0, 170, 255, 0.1);
        border: 1px solid var(--cyber-blue);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #e6f7ff;
        line-height: 1.5;
    }
    
    .work-explanation .explanation-content {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .work-explanation strong {
        color: var(--cyber-blue);
        font-family: 'Orbitron', monospace;
    }
    
    .work-explanation small {
        color: #88d8ff;
        font-size: 11px;
        font-style: italic;
    }
`;

// Inject the CSS
const styleEl = document.createElement('style');
styleEl.textContent = workExplanationCSS;
document.head.appendChild(styleEl);

// ============================
// UPDATE UI BUTTONS
// ============================
// Replace the checkSafety() call in your HTML/JS with:
// <button class="neon-button" onclick="checkSafetyWithExplanations()">
//     <i class="fas fa-shield-alt"></i> Run Safety Algorithm with Explanations
// </button>

// ============================
// RESOURCE REQUEST ALGORITHM VARIABLES
// ============================
let requestProcess = 0; // Process making request
let requestResources = Array(bankerResourceCount).fill(0); // Request vector
let requestPending = false; // Flag for pending request
let requestSteps = []; // Steps for request algorithm
let requestCurrentStep = 0; // Current step in request algorithm

// ============================
// RESOURCE REQUEST ALGORITHM UI
// ============================
function createRequestSection() {
    const bankerContainer = document.querySelector('.banker-container');
    
    // Check if request section already exists
    if (document.getElementById('requestSection')) {
        // If it exists, update it with current configuration
        generateRequestResourceInputs();
        updateRequestProcessDropdown();
        return;
    }
    
    const requestSection = document.createElement('div');
    requestSection.id = 'requestSection';
    requestSection.className = 'request-section panel-section';
    requestSection.style.cssText = `
        border: 2px solid var(--cyber-purple);
        border-radius: 10px;
        padding: 20px;
        margin-top: 25px;
        background: rgba(128, 0, 255, 0.05);
    `;
    
    requestSection.innerHTML = `
        <h3 style="color: var(--cyber-purple); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-hand-paper"></i> Resource Request Algorithm
        </h3>
        
        <div class="request-controls" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="request-inputs">
                <h4 style="margin-bottom: 15px; color: #e6f7ff;">Make Resource Request</h4>
                
                <div class="input-group" style="margin-bottom: 15px;">
                    <label for="requestProcess"><i class="fas fa-microchip"></i> Process:</label>
                    <select id="requestProcess" class="cyber-input" onchange="updateRequestProcess()">
                        <!-- Process options will be generated dynamically -->
                    </select>
                </div>
                
                <div id="requestResourcesInputs" style="margin-bottom: 15px;">
                    <!-- Resource inputs will be generated here -->
                </div>
                
                <button class="neon-button" onclick="validateAndShowRequest()" style="background: linear-gradient(135deg, var(--cyber-purple), #5a00cc);">
                    <i class="fas fa-search"></i> Validate Request
                </button>
                
                <button class="neon-button" onclick="makeResourceRequest()" style="background: linear-gradient(135deg, var(--cyber-green), #006633);">
                    <i class="fas fa-play-circle"></i> Execute Request
                </button>
            </div>
            
            <div class="request-status">
                <h4 style="margin-bottom: 15px; color: #e6f7ff;">Request Status</h4>
                <div id="requestResult" class="request-result">
                    <div class="no-request">
                        <i class="fas fa-info-circle"></i> No pending request
                    </div>
                </div>
                
                <div id="requestedResources" class="requested-resources" style="margin-top: 15px;">
                    <!-- Requested resources will be displayed here -->
                </div>
            </div>
        </div>
        
        <div class="request-steps-section" style="margin-top: 20px;">
            <h4 style="margin-bottom: 15px; color: #e6f7ff;">
                <i class="fas fa-list-ol"></i> Request Algorithm Steps
            </h4>
            <div id="requestSteps" class="steps-container"></div>
        </div>
    `;
    
    bankerContainer.appendChild(requestSection);
    
    // Initialize with current configuration
    updateRequestProcessDropdown();
    generateRequestResourceInputs();
    resetRequest();
}

function updateRequestProcessDropdown() {
    const select = document.getElementById('requestProcess');
    if (!select) return;
    
    select.innerHTML = '';
    
    for (let i = 0; i < bankerProcessCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `P${i + 1}`;
        select.appendChild(option);
    }
    
    requestProcess = 0; // Reset to first process
}

function generateRequestResourceInputs() {
    const container = document.getElementById('requestResourcesInputs');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Reset request resources array with correct size
    requestResources = Array(bankerResourceCount).fill(0);
    
    // Create a grid for resource inputs - responsive layout
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    container.style.gap = '10px';
    container.style.marginBottom = '15px';
    
    for (let i = 0; i < bankerResourceCount; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.innerHTML = `
            <label style="color: var(--cyber-green); margin-bottom: 5px; display: block;">
                <i class="fas fa-database"></i> R${i + 1}:
            </label>
            <input type="number" id="requestR${i + 1}" 
                   value="0" min="0" step="1"
                   onchange="updateRequestResource(${i})"
                   oninput="validateRequestInput(this, ${i})"
                   style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); 
                          border: 1px solid var(--cyber-blue); color: white; border-radius: 4px;">
            <div class="resource-detail" style="font-size: 11px; margin-top: 3px;">
                <div>Max: ${getProcessMaxForResource(requestProcess, i)}</div>
                <div>Available: ${bankerAvailable[i]}</div>
                <div>Allocated: ${bankerAllocation[requestProcess][i]}</div>
            </div>
        `;
        container.appendChild(inputGroup);
    }
}

function getProcessMaxForResource(processIndex, resourceIndex) {
    if (processIndex >= 0 && processIndex < bankerProcessCount && 
        resourceIndex >= 0 && resourceIndex < bankerResourceCount) {
        return bankerMax[processIndex][resourceIndex];
    }
    return 0;
}

function validateRequestInput(input, resourceIndex) {
    const value = parseInt(input.value) || 0;
    const max = getProcessMaxForResource(requestProcess, resourceIndex);
    const allocated = bankerAllocation[requestProcess][resourceIndex];
    const need = max - allocated;
    
    // Validate bounds
    if (value < 0) {
        input.value = 0;
    } else if (value > need) {
        input.value = need;
        showBankerNotification(`Cannot request more than need (${need}) for R${resourceIndex + 1}`, 'info');
    }
    
    updateRequestResource(resourceIndex);
}

function refreshRequestUI() {
    updateRequestProcessDropdown();
    generateRequestResourceInputs();
    resetRequest();
    
    // Update request status display
    const requestResult = document.getElementById('requestResult');
    if (requestResult) {
        requestResult.innerHTML = `
            <div class="no-request">
                <i class="fas fa-info-circle"></i> 
                ${bankerProcessCount} processes, ${bankerResourceCount} resources configured
            </div>
        `;
    }
}

function updateRequestProcess() {
    const select = document.getElementById('requestProcess');
    requestProcess = parseInt(select.value);
    console.log(`Request process updated to P${requestProcess + 1}`);
}

function updateRequestResource(index) {
    const input = document.getElementById(`requestR${index + 1}`);
    requestResources[index] = parseInt(input.value) || 0;
    console.log(`Request resource R${index + 1} updated to ${requestResources[index]}`);
}

// ============================
// VALIDATION FUNCTIONS
// ============================
function validateRequest() {
    const process = requestProcess;
    const request = requestResources;
    
    console.log(`Validating request for P${process + 1}:`, request);
    
    // Step 1: Check if Request ≤ Need
    const need = calculateNeedMatrix();
    const needRow = need[process];
    
    for (let j = 0; j < bankerResourceCount; j++) {
        if (request[j] > needRow[j]) {
            return {
                valid: false,
                reason: `Request for R${j+1} (${request[j]}) exceeds Need (${needRow[j]})`,
                step: 1
            };
        }
    }
    
    // Step 2: Check if Request ≤ Available
    for (let j = 0; j < bankerResourceCount; j++) {
        if (request[j] > bankerAvailable[j]) {
            return {
                valid: false,
                reason: `Request for R${j+1} (${request[j]}) exceeds Available (${bankerAvailable[j]})`,
                step: 2
            };
        }
    }
    
    return {
        valid: true,
        reason: "Request passes initial validation",
        step: 3
    };
}

function validateAndShowRequest() {
    // Ensure arrays are the right size
    if (requestResources.length !== bankerResourceCount) {
        requestResources = Array(bankerResourceCount).fill(0);
    }
    
    const validation = validateRequest();
    const process = requestProcess;
    const request = requestResources;
    const need = calculateNeedMatrix()[process];
    const max = bankerMax[process];
    
    // Create request visualization
    const requestResult = document.getElementById('requestResult');
    if (requestResult) {
        const requestStr = request.join(', ');
        const needStr = need.join(', ');
        const maxStr = max.join(', ');
        const allocStr = bankerAllocation[process].join(', ');
        
        if (validation.valid) {
            requestResult.innerHTML = `
                <div class="request-valid">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-check-circle" style="color: var(--cyber-green); font-size: 20px;"></i>
                        <strong>Request from P${process + 1} is Valid</strong>
                    </div>
                    <div class="validation-details">
                        <div class="resource-detail">
                            <strong>Request:</strong> [${requestStr}]
                        </div>
                        <div class="resource-detail">
                            <strong>Current Allocation:</strong> [${allocStr}]
                        </div>
                        <div class="resource-detail">
                            <strong>Maximum Need:</strong> [${maxStr}]
                        </div>
                        <div class="resource-detail">
                            <strong>Remaining Need:</strong> [${needStr}]
                        </div>
                        <div class="resource-detail" style="color: var(--cyber-green);">
                            ✓ Request ≤ Need: Valid<br>
                            ✓ Request ≤ Available: Valid<br>
                            ✓ Ready to execute safety check...
                        </div>
                    </div>
                </div>
            `;
        } else {
            requestResult.innerHTML = `
                <div class="request-invalid">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-times-circle" style="color: var(--cyber-red); font-size: 20px;"></i>
                        <strong>Request is Invalid</strong>
                    </div>
                    <div class="validation-details">
                        <div class="resource-detail" style="border-color: var(--cyber-red);">
                            <strong>Error:</strong> ${validation.reason}
                        </div>
                        <div class="resource-detail">
                            <strong>Request:</strong> [${requestStr}]
                        </div>
                        <div class="resource-detail">
                            <strong>Current Need:</strong> [${needStr}]
                        </div>
                        <div class="resource-detail">
                            <strong>Available:</strong> [${bankerAvailable.join(', ')}]
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    requestPending = validation.valid;
    
    if (validation.valid) {
        addToLog(`✅ Request from P${process + 1} validated: [${request.join(', ')}]`);
        addToLog(`📋 Ready to execute request algorithm`);
    } else {
        addToLog(`❌ Request validation failed: ${validation.reason}`);
    }
}

// ============================
// RESOURCE REQUEST ALGORITHM IMPLEMENTATION
// ============================
function makeResourceRequest() {
    if (!requestPending) {
        showRequestNotification("No valid request pending. Validate request first.", "error");
        return;
    }
    
    const process = requestProcess;
    const request = [...requestResources];
    
    console.log(`Executing request algorithm for P${process + 1}:`, request);

    // Validate request dimensions

    if (request.length !== bankerResourceCount) {
        showRequestNotification(`Request vector size (${request.length}) doesn't match number of resources (${bankerResourceCount})`, "error");
        return;
    }
    
    // Reset request steps
    requestSteps = [];
    requestCurrentStep = 0;
    
    // Save initial state
    const initialState = {
        available: [...bankerAvailable],
        allocation: bankerAllocation.map(row => [...row]),
        max: bankerMax.map(row => [...row]),
        need: calculateNeedMatrix(),
        process: process,
        request: request
    };
    
    saveRequestStep(
        "Start Resource Request Algorithm",
        `Process P${process + 1} requests resources: [${request.join(', ')}]`,
        initialState,
        [],
        "initial"
    );
    
    // Step 1: Check if Request ≤ Need
    const need = initialState.need[process];
    const needChecks = request.map((req, idx) => {
        return `Request[R${idx+1}](${req}) ≤ Need[P${process+1},R${idx+1}](${need[idx]}) = ${req <= need[idx] ? '✓' : '✗'}`;
    });
    
    saveRequestStep(
        "Step 1: Validate Request ≤ Need",
        `Check if the request does not exceed the process's declared need`,
        initialState,
        [
            `Condition: Request ≤ Need[P${process+1}]`,
            ...needChecks,
            needChecks.every(check => check.includes('✓')) 
                ? `✅ All conditions satisfied: Request ≤ Need` 
                : `❌ Condition failed: Request exceeds Need`
        ],
        "validation"
    );
    
    // If any request exceeds need, deny request
    if (request.some((req, idx) => req > need[idx])) {
        saveRequestStep(
            "Request Denied",
            `Process P${process + 1} requested more than its declared maximum need`,
            initialState,
            [
                `❌ REQUEST DENIED`,
                `Process cannot request more than its declared maximum need`,
                `Please adjust request or maximum declaration`
            ],
            "denied"
        );
        showRequestResult(false, "Request exceeds declared need");
        showRequestSteps();
        return;
    }
    
    // Step 2: Check if Request ≤ Available
    const availableChecks = request.map((req, idx) => {
        return `Request[R${idx+1}](${req}) ≤ Available[R${idx+1}](${initialState.available[idx]}) = ${req <= initialState.available[idx] ? '✓' : '✗'}`;
    });
    
    saveRequestStep(
        "Step 2: Validate Request ≤ Available",
        `Check if the request can be satisfied with currently available resources`,
        initialState,
        [
            `Condition: Request ≤ Available`,
            ...availableChecks,
            availableChecks.every(check => check.includes('✓')) 
                ? `✅ All conditions satisfied: Request ≤ Available` 
                : `❌ Condition failed: Insufficient available resources`
        ],
        "validation"
    );
    
    // If any request exceeds available, process must wait
    if (request.some((req, idx) => req > initialState.available[idx])) {
        saveRequestStep(
            "Process Must Wait",
            `Insufficient resources available to satisfy request immediately`,
            initialState,
            [
                `⏳ PROCESS P${process + 1} MUST WAIT`,
                `Not enough resources available right now`,
                `Process will wait until resources become available`
            ],
            "wait"
        );
        showRequestResult(false, "Insufficient resources available");
        showRequestSteps();
        return;
    }
    
    // Step 3: Pretend to allocate resources
    const pretendState = {
        available: initialState.available.map((avail, idx) => avail - request[idx]),
        allocation: initialState.allocation.map((row, i) => 
            i === process ? row.map((val, idx) => val + request[idx]) : [...row]
        ),
        max: [...initialState.max],
        need: initialState.need.map((row, i) => 
            i === process ? row.map((val, idx) => val - request[idx]) : [...row]
        )
    };
    
    saveRequestStep(
        "Step 3: Pretend to Allocate Resources",
        `Temporarily allocate requested resources to check if system remains safe`,
        pretendState,
        [
            `Temporary allocation:`,
            `New Available = Available - Request`,
            `New Allocation[P${process+1}] = Allocation[P${process+1}] + Request`,
            `New Need[P${process+1}] = Need[P${process+1}] - Request`,
            `Available becomes: [${pretendState.available.join(', ')}]`,
            `Allocation[P${process+1}] becomes: [${pretendState.allocation[process].join(', ')}]`,
            `Need[P${process+1}] becomes: [${pretendState.need[process].join(', ')}]`
        ],
        "pretend"
    );
    
    // Step 4: Run Safety Algorithm on pretend state
    const safetyResult = runSafetyCheckOnState(pretendState);
    
    saveRequestStep(
        "Step 4: Run Safety Algorithm",
        `Check if system would be in a safe state after allocation`,
        pretendState,
        [
            `Running safety algorithm with new state...`,
            safetyResult.isSafe 
                ? `✅ Safety algorithm result: SYSTEM WOULD BE SAFE` 
                : `❌ Safety algorithm result: SYSTEM WOULD BE UNSAFE`,
            safetyResult.isSafe 
                ? `Safe sequence found: ${safetyResult.sequence.join(' → ')}` 
                : `No safe sequence exists with this allocation`
        ],
        "safety-check"
    );
    
    // Step 5: Decision
    if (safetyResult.isSafe) {
        // Actually allocate the resources
        for (let j = 0; j < bankerResourceCount; j++) {
            bankerAvailable[j] -= request[j];
            bankerAllocation[process][j] += request[j];
        }
        
        saveRequestStep(
            "Step 5: Request Granted",
            `Resources allocated to process P${process + 1}`,
            {
                available: [...bankerAvailable],
                allocation: bankerAllocation.map(row => [...row]),
                max: bankerMax.map(row => [...row]),
                need: calculateNeedMatrix()
            },
            [
                `✅ REQUEST GRANTED`,
                `Resources allocated to P${process + 1}: [${request.join(', ')}]`,
                `New Available: [${bankerAvailable.join(', ')}]`,
                `New Allocation[P${process+1}]: [${bankerAllocation[process].join(', ')}]`,
                `System remains in a safe state`,
                `Safe sequence: ${safetyResult.sequence.join(' → ')}`
            ],
            "granted"
        );
        
        // Update UI with safe state
        updateStatusHeader(true, `Request granted to P${process + 1}`);
        updateContainerBoundary(true);
        showSafeSequenceIfAvailable(safetyResult.sequence);
        
        // Reset request
        resetRequest();
        
        addToLog(`✅ Request granted to P${process + 1}: [${request.join(', ')}] allocated`);
        addToLog(`📊 System updated. New available: [${bankerAvailable.join(', ')}]`);
    } else {
        saveRequestStep(
            "Step 5: Request Denied",
            `Allocation would lead to unsafe state - process must wait`,
            initialState,
            [
                `❌ REQUEST DENIED`,
                `Allocation would make system unsafe`,
                `Process P${process + 1} must wait`,
                `Original state restored`
            ],
            "denied-unsafe"
        );
        
        // Update UI with unsafe state
        updateStatusHeader(false, "Request would cause unsafe state");
        updateContainerBoundary(false);
        
        resetRequest();
        
        addToLog(`❌ Request denied to P${process + 1}: Allocation would cause unsafe state`);
    }
    
    showRequestSteps();
}

// ============================
// SAFETY CHECK ON STATE
// ============================
function runSafetyCheckOnState(state) {
    const work = [...state.available];
    const need = state.need.map(row => [...row]);
    const allocation = state.allocation.map(row => [...row]);
    const finish = Array(state.allocation.length).fill(false);
    const safeSequence = [];
    
    while (safeSequence.length < state.allocation.length) {
        let found = false;
        
        for (let i = 0; i < state.allocation.length; i++) {
            if (!finish[i]) {
                const canFinish = need[i].every((needVal, j) => needVal <= work[j]);
                
                if (canFinish) {
                    for (let j = 0; j < bankerResourceCount; j++) {
                        work[j] += allocation[i][j];
                    }
                    finish[i] = true;
                    safeSequence.push(`P${i+1}`);
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            break;
        }
    }
    
    return {
        isSafe: safeSequence.length === state.allocation.length,
        sequence: safeSequence
    };
}

// ============================
// REQUEST STEP MANAGEMENT
// ============================
function saveRequestStep(title, description, state, calculations, stepType) {
    const step = {
        title,
        description,
        state: JSON.parse(JSON.stringify(state)), // Deep copy
        calculations: calculations || [],
        stepType,
        timestamp: new Date().toLocaleTimeString()
    };
    
    requestSteps.push(step);
    console.log(`📝 Request step saved: "${title}"`);
    return step;
}

function showRequestSteps() {
    const stepsContainer = document.getElementById('requestSteps');
    if (!stepsContainer) return;
    
    stepsContainer.innerHTML = '';
    
    if (requestSteps.length === 0) {
        stepsContainer.innerHTML = '<div class="no-steps">No request steps yet</div>';
        return;
    }
    
    requestSteps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = `request-step ${index === requestCurrentStep ? 'active' : ''}`;
        stepElement.innerHTML = `
            <div class="step-header">
                <span class="step-number">Step ${index + 1}</span>
                <span class="step-title">${step.title}</span>
                <span class="step-type ${step.stepType}">${step.stepType}</span>
            </div>
            <div class="step-description">${step.description}</div>
            ${step.calculations && step.calculations.length > 0 ? `
                <div class="step-calculations">
                    ${step.calculations.map(calc => `<div class="calculation">${calc}</div>`).join('')}
                </div>
            ` : ''}
        `;
        
        stepElement.onclick = () => showRequestStep(index);
        stepsContainer.appendChild(stepElement);
    });
    
    // Scroll to active step
    const activeStep = stepsContainer.querySelector('.active');
    if (activeStep) {
        activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function showRequestStep(index) {
    if (index < 0 || index >= requestSteps.length) return;
    
    requestCurrentStep = index;
    const step = requestSteps[index];
    
    // Highlight the step
    const steps = document.querySelectorAll('.request-step');
    steps.forEach((s, i) => {
        s.classList.toggle('active', i === index);
    });
    
    // Show step details
    showRequestStepDetails(step);
}

function showRequestStepDetails(step) {
    const details = `
        <div class="request-step-details">
            <h5>${step.title}</h5>
            <p>${step.description}</p>
            
            ${step.calculations && step.calculations.length > 0 ? `
                <div class="details-calculations">
                    <h6>Calculations:</h6>
                    ${step.calculations.map(calc => `<div>${calc}</div>`).join('')}
                </div>
            ` : ''}
            
            ${step.state ? `
                <div class="state-details">
                    <h6>System State:</h6>
                    <div>Available: [${step.state.available.join(', ')}]</div>
                    ${step.state.process !== undefined ? `
                        <div>Requesting Process: P${step.state.process + 1}</div>
                        <div>Request: [${step.state.request.join(', ')}]</div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
    
    // Update UI
    const requestResult = document.getElementById('requestResult');
    if (requestResult) {
        requestResult.innerHTML = details;
    }
}

// ============================
// REQUEST RESULT DISPLAY
// ============================
function showRequestResult(granted, details) {
    const requestResult = document.getElementById('requestResult');
    
    if (granted) {
        const sequence = Array.isArray(details) ? details.join(' → ') : details;
        
        requestResult.innerHTML = `
            <div class="request-granted">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-check-circle" style="color: var(--cyber-green); font-size: 24px;"></i>
                    <div>
                        <strong style="font-size: 16px;">REQUEST GRANTED</strong><br>
                        <small>Resources allocated successfully</small>
                    </div>
                </div>
                <div class="result-details">
                    <div><strong>Safe Sequence:</strong> ${sequence}</div>
                    <div><strong>New Available:</strong> [${bankerAvailable.join(', ')}]</div>
                </div>
            </div>
        `;
        
        // Show celebration effect
        showRequestNotification("Request granted! Resources allocated.", "success");
    } else {
        requestResult.innerHTML = `
            <div class="request-denied">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-times-circle" style="color: var(--cyber-red); font-size: 24px;"></i>
                    <div>
                        <strong style="font-size: 16px;">REQUEST DENIED</strong><br>
                        <small>${details}</small>
                    </div>
                </div>
                <div class="result-details">
                    <div>Process must wait for resources</div>
                    <div><strong>Current Available:</strong> [${bankerAvailable.join(', ')}]</div>
                </div>
            </div>
        `;
        
        showRequestNotification("Request denied. " + details, "error");
    }
}

function showRequestNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `cyber-notification request-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// ============================
// UTILITY FUNCTIONS
// ============================
function resetRequest() {
    requestPending = false;
    requestResources = Array(bankerResourceCount).fill(0);
    
    // Reset request inputs
    for (let i = 0; i < bankerResourceCount; i++) {
        const input = document.getElementById(`requestR${i + 1}`);
        if (input) {
            input.value = 0;
        }
    }
}

// ============================
// INTEGRATE INTO EXISTING SYSTEM
// ============================
function initializeBankersWithRequests() {
    updateBankerResources();
    updateAllocationMatrix();
    updateMaxMatrix();
    updateNeedMatrix();
    
    // Initialize step tracking
    initBankerStepTracking();
    
    // Add step controls if not present
    createStepControls();
    
    // Ensure work vector section exists with explanation
    ensureWorkVectorSection();
    explainWorkVector();
    
    // Create request section
    createRequestSection();

const requestSection = document.getElementById('requestSection');
    if (requestSection) {
        requestSection.style.display = 'none';
    }


    // Refresh request UI with current configuration
    refreshRequestUI();

    // Create initial status header
    createStatusHeader();
    
    // Initialize calculation displays
    const calcFormula = document.getElementById('calcFormula');
    const stepDetails = document.getElementById('stepDetails');
    const calcValueChanges = document.getElementById('calcValueChanges');
    
    if (calcFormula) calcFormula.innerHTML = '<em>Run the Safety Algorithm to see calculations</em>';
    if (stepDetails) stepDetails.innerHTML = '<div class="step-detail-item main-detail">Click "Run Safety Algorithm" to start</div>';
    if (calcValueChanges) calcValueChanges.innerHTML = '<div class="no-changes">No calculations yet</div>';
}

// Update applyBankerConfig to handle request section
function applyBankerConfigWithRequests() {
    bankerProcessCount = parseInt(document.getElementById('bankerProcessCount').value) || 3;
    bankerResourceCount = parseInt(document.getElementById('bankerResourceCount').value) || 2;
    
    // Initialize arrays with proper sizes
    bankerAllocation = Array.from({length: bankerProcessCount}, () => 
        Array.from({length: bankerResourceCount}, () => 0)
    );
    bankerMax = Array.from({length: bankerProcessCount}, () => 
        Array.from({length: bankerResourceCount}, () => 0)
    );
    bankerAvailable = Array.from({length: bankerResourceCount}, () => 3);
    
    // Reset request
    requestProcess = 0;
    requestResources = Array(bankerResourceCount).fill(0);
    requestPending = false;
    requestSteps = [];
    requestCurrentStep = 0;
    
    // Update main UI
    updateBankerResources();
    updateAllocationMatrix();
    updateMaxMatrix();
    updateNeedMatrix();
    
    // Initialize step tracking
    initBankerStepTracking();
    
    // Update request section
    refreshRequestUI();
    
    addToLog(`✅ Banker's algorithm configuration applied: ${bankerProcessCount} processes, ${bankerResourceCount} resources`);
}

// ============================
// STYLES FOR REQUEST SECTION
// ============================
function injectRequestStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .request-section {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .request-result {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 15px;
            min-height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .no-request {
            color: #888;
            font-style: italic;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        .request-valid {
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid var(--cyber-green);
            border-radius: 8px;
            padding: 15px;
            width: 100%;
        }
        
        .request-invalid {
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid var(--cyber-red);
            border-radius: 8px;
            padding: 15px;
            width: 100%;
        }
        
        .validation-details {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.5;
        }
        
        .requested-resources {
            background: rgba(128, 0, 255, 0.1);
            border: 1px solid var(--cyber-purple);
            border-radius: 8px;
            padding: 12px;
        }
        
        .resource-comparison {
            font-size: 13px;
        }
        
        .request-steps-section {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 15px;
        }
        
        .steps-container {
            max-height: 300px;
            overflow-y: auto;
            margin-top: 10px;
        }
        
        .request-step {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #333;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .request-step:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--cyber-blue);
        }
        
        .request-step.active {
            background: rgba(0, 170, 255, 0.15);
            border-color: var(--cyber-blue);
            box-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
        }
        
        .step-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }
        
        .step-number {
            background: var(--cyber-purple);
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .step-title {
            font-weight: bold;
            flex-grow: 1;
        }
        
        .step-type {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
        }
        
        .step-type.initial { background: #0066cc; color: white; }
        .step-type.validation { background: #009900; color: white; }
        .step-type.pretend { background: #cc9900; color: white; }
        .step-type.safety-check { background: #6600cc; color: white; }
        .step-type.granted { background: #00cc00; color: white; }
        .step-type.denied, .step-type.wait, .step-type.denied-unsafe { 
            background: #cc0000; color: white; 
        }
        
        .step-description {
            font-size: 13px;
            color: #ccc;
            margin-bottom: 8px;
        }
        
        .step-calculations {
            font-size: 12px;
            color: #aaa;
            padding-left: 15px;
        }
        
        .calculation {
            margin-bottom: 4px;
        }
        
        .request-granted, .request-denied {
            width: 100%;
            padding: 15px;
            border-radius: 8px;
        }
        
        .request-granted {
            background: rgba(0, 255, 0, 0.1);
            border: 2px solid var(--cyber-green);
        }
        
        .request-denied {
            background: rgba(255, 0, 0, 0.1);
            border: 2px solid var(--cyber-red);
        }
        
        .result-details {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            font-size: 13px;
        }
        
        .request-notification {
            background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,40,0.9));
            border: 2px solid;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 0 20px;
        }
        
        .request-notification.success {
            border-color: var(--cyber-green);
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        
        .request-notification.error {
            border-color: var(--cyber-red);
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    
    document.head.appendChild(style);
}

// ============================
// UPDATE HTML BUTTONS
// ============================
// Add this to your HTML or create a function to update the UI
function initializeRequestButton() {
    const toggleBtn = document.getElementById('toggleRequestBtn');
    if (toggleBtn) {
        toggleBtn.onclick = toggleRequestSection;
    }
}

function toggleRequestSection() {
    const requestSection = document.getElementById('requestSection');
    const toggleBtn = document.getElementById('toggleRequestBtn');
    
    if (requestSection && toggleBtn) {
        if (requestSection.style.display === 'none' || !requestSection.style.display) {
            requestSection.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Hide Request Algorithm';
            toggleBtn.classList.add('hide-mode');
        } else {
            requestSection.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Show Request Algorithm';
            toggleBtn.classList.remove('hide-mode');
        }
    }
}

// ============================
// INITIALIZATION
// ============================
// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Inject styles
    injectRequestStyles();
    
    // Initialize request button
    initializeRequestButton();
    
    // Update initialize function
    initializeBankersWithRequests();
});

// ============================
// STATUS HEADER MANAGEMENT
// ============================
function createStatusHeader() {
    // Remove existing header if it exists
    const existingHeader = document.querySelector('.banker-status-header');
    if (existingHeader) {
        existingHeader.remove();
    }
    
    // Create new header
    const header = document.createElement('div');
    header.className = 'banker-status-header';
    header.innerHTML = `
        <i class="fas fa-question-circle status-icon"></i>
        <span class="status-text">STATUS: NOT YET CHECKED</span>
    `;
    
    // Insert at the beginning of banker container
    const bankerContainer = document.querySelector('.banker-container');
    if (bankerContainer) {
        bankerContainer.insertBefore(header, bankerContainer.firstChild);
    }
    
    return header;
}

function updateStatusHeader(isSafe, message = '') {
    let header = document.querySelector('.banker-status-header');
    
    if (!header) {
        header = createStatusHeader();
    }
    
    // Remove previous status classes
    header.classList.remove('safe', 'unsafe', 'status-appear');
    
    // Add new status classes
    if (isSafe === true) {
        header.classList.add('safe', 'status-appear');
        header.innerHTML = `
            <i class="fas fa-check-circle status-icon"></i>
            <span class="status-text">SYSTEM STATUS: SAFE </span>
            ${message ? `<span class="status-message">${message}</span>` : ''}
        `;
    } else if (isSafe === false) {
        header.classList.add('unsafe', 'status-appear');
        header.innerHTML = `
            <i class="fas fa-exclamation-triangle status-icon"></i>
            <span class="status-text">SYSTEM STATUS: UNSAFE </span>
            ${message ? `<span class="status-message">${message}</span>` : ''}
        `;
    } else {
        // Neutral/initial state
        header.innerHTML = `
            <i class="fas fa-question-circle status-icon"></i>
            <span class="status-text">STATUS: NOT YET CHECKED</span>
        `;
    }
}

function updateContainerBoundary(isSafe) {
    const container = document.querySelector('.banker-container');
    if (!container) return;
    
    // Remove previous state classes
    container.classList.remove('safe-state', 'unsafe-state');
    
    // Add new state class
    if (isSafe === true) {
        container.classList.add('safe-state');
        hideUnsafeWarning();
        showSafeSequenceIfAvailable();
    } else if (isSafe === false) {
        container.classList.add('unsafe-state');
        showUnsafeWarning();
        hideSafeSequence();
    } else {
        // Reset to default
        hideUnsafeWarning();
        hideSafeSequence();
    }
}

function showUnsafeWarning() {
    // Remove existing warning
    const existingWarning = document.querySelector('.unsafe-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    const bankerContainer = document.querySelector('.banker-container');
    if (bankerContainer) {
        bankerContainer.style.position = 'relative';
        bankerContainer.appendChild(warning);
    }
}

function hideUnsafeWarning() {
    const warning = document.querySelector('.unsafe-warning');
    if (warning) {
        warning.remove();
    }
}

function showSafeSequenceIfAvailable(sequence = []) {
    // Remove existing sequence display
    const existingDisplay = document.querySelector('.safe-sequence-display');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    // Only create if we have a sequence, but keep it hidden
    if (sequence && sequence.length > 0) {
        const display = document.createElement('div');
        display.className = 'safe-sequence-display active';
        display.style.display = 'none'; // Hide it visually
        display.innerHTML = `
            <h4><i class="fas fa-list-ol"></i> SAFE EXECUTION SEQUENCE</h4>
            <div class="sequence-flow">
                ${sequence.join(' <i class="fas fa-arrow-right"></i> ')}
            </div>
            <p style="margin-top: 10px; font-size: 14px; color: #88ff88;">
                All processes can finish without deadlock
            </p>
        `;
        
        // Insert after the status header
        const statusHeader = document.querySelector('.banker-status-header');
        const bankerContainer = document.querySelector('.banker-container');
        
        if (statusHeader && bankerContainer) {
            bankerContainer.insertBefore(display, statusHeader.nextSibling);
        }
        
        // Store the sequence for later reference if needed
        window.lastSafeSequence = sequence;
    }
}

function hideSafeSequence() {
    const display = document.querySelector('.safe-sequence-display');
    if (display) {
        display.remove();
    }
}

// Add to your control buttons section
function addResetStatusButton() {
    const controls = document.querySelector('.banker-controls');
    if (controls) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'neon-button';
        resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset Status';
        resetBtn.onclick = resetBankerStatus;
        resetBtn.style.background = 'linear-gradient(135deg, #ff9900, #cc6600)';
        
        // Find the controls section and add the button
        const controlDiv = controls.querySelector('div:last-child');
        if (controlDiv) {
            controlDiv.appendChild(resetBtn);
        }
    }
}

// ============================
// RESET FUNCTIONS
// ============================
function resetBankerStatus() {
    updateStatusHeader(null);
    updateContainerBoundary(null);
    hideUnsafeWarning();
    hideSafeSequence();
}

function resetSteps() {
    bankerSteps = [];
    currentStep = 0;
    isAnimating = false;
    resetBankerStatus();
    
    // Clear UI
    const stepControls = document.getElementById('stepControls');
    if (stepControls) {
        stepControls.innerHTML = `
            <div class="step-info">
                <strong>No steps yet</strong>
            </div>
            <div class="step-description">
                Run the Safety Algorithm to see step-by-step visualization
            </div>
        `;
    }
    
    // Clear work vector
    updateWorkVectorDisplay(bankerAvailable);
    
    // Clear calculation displays
    const calcFormula = document.getElementById('calcFormula');
    const stepDetails = document.getElementById('stepDetails');
    const calcValueChanges = document.getElementById('calcValueChanges');
    
    if (calcFormula) calcFormula.innerHTML = '<em>Run the Safety Algorithm to see calculations</em>';
    if (stepDetails) stepDetails.innerHTML = '<div class="step-detail-item main-detail">No step details available</div>';
    if (calcValueChanges) calcValueChanges.innerHTML = '<div class="no-changes">No value changes yet</div>';
    
    addToLog('📋 Step visualization reset');
}

// ============================
// EXPORT FUNCTION
// ============================
function exportSteps() {
    if (bankerSteps.length === 0) {
        showBankerNotification("No steps to export. Run the algorithm first.", "info");
        return;
    }
    
    const data = {
        timestamp: new Date().toISOString(),
        steps: bankerSteps,
        configuration: {
            processes: bankerProcessCount,
            resources: bankerResourceCount,
            available: bankerAvailable,
            allocation: bankerAllocation,
            max: bankerMax
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `banker-algorithm-steps-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showBankerNotification("Steps exported successfully!", "success");
    addToLog('💾 Steps exported to JSON file');
}