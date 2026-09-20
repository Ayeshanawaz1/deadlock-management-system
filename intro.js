// ========== INTRO PAGE FUNCTIONALITY ==========

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Hide tabs immediately to prevent flash
    const tabs = document.querySelector('.tabs');
    if (tabs) {
        tabs.style.display = 'none';
    }
    // Create intro overlay
    const introOverlay = document.createElement('div');
    introOverlay.className = 'intro-overlay';
    introOverlay.id = 'introOverlay';
    
    introOverlay.innerHTML = `
        <div class="intro-container">
            <h1 class="intro-title">DEADLOCK MANAGEMENT <br> SYSTEM</h1>
            <p class="intro-subtitle">Advanced OS Deadlock Detection & Prevention</p>
            
            <div class="intro-buttons">
                <button class="intro-button" onclick="enterApp('rag')">
                    <i class="fas fa-project-diagram intro-icon"></i>
                    Resource Allocation Graph
                </button>
                <button class="intro-button banker" onclick="enterApp('bankers')">
                    <i class="fas fa-calculator intro-icon"></i>
                    Banker's Algorithm
                </button>
            </div>
            
            <div class="intro-description">
                <p>This system provides comprehensive deadlock management through two powerful approaches:</p>
                <p><strong>RAG (Resource Allocation Graph):</strong> Visual deadlock detection using graph theory</p>
                <p><strong>Banker's Algorithm:</strong> Mathematical deadlock avoidance using resource allocation matrices</p>
            </div>
            
<!--
            <div class="intro-tech">
                <span class="tech-badge">HTML5</span>
                <span class="tech-badge">CSS3</span>
                <span class="tech-badge">JavaScript</span>
                <span class="tech-badge">SVG Graphics</span>
                <span class="tech-badge">OS Algorithms</span>
            </div>
-->
            
            <div class="intro-footer">
                <p><i class="fas fa-code"></i> Operating Systems Project | Deadlock Management System</p>
            </div>
            
            <div class="intro-loading" id="introLoading">
                <div class="spinner"></div>
                <p style="margin-top: 10px; color: #66a3ff;">Loading...</p>
            </div>
        </div>
    `;
    
    // Insert at the beginning of body
    document.body.insertBefore(introOverlay, document.body.firstChild);
    
    // Initialize sound effects
    initializeIntroSounds();
});

// ========== ENTER APPLICATION ==========
function enterApp(section) {
    const introOverlay = document.getElementById('introOverlay');
    const introLoading = document.getElementById('introLoading');
    
    if (!introOverlay) return;
    
    // Show loading spinner
    if (introLoading) {
        introLoading.style.display = 'block';
    }
    
    // Play transition sound
    playIntroSound('click');
    
    // Hide intro with fade effect
    setTimeout(() => {
        introOverlay.classList.add('hidden');
        
        // Show main app after transition
        setTimeout(() => {
            showMainApp(section);
            
            // Hide intro overlay completely
            introOverlay.style.display = 'none';
        }, 1000);
    }, 300);
}

function showMainApp(section) {
    // Hide intro overlay
    const introOverlay = document.getElementById('introOverlay');
    if (introOverlay) {
        introOverlay.style.display = 'none';
    }
    
    // Show all main app containers
    const mainContainer = document.querySelector('.main-container');
    const titleBar = document.querySelector('.title-bar');
    const pageBoundary = document.getElementById('pageBoundary');
    const decorationStar = document.querySelector('.decoration-star');
    
    if (mainContainer) mainContainer.style.display = 'grid';
    if (titleBar) titleBar.style.display = 'block';
    if (pageBoundary) pageBoundary.style.display = 'block';
    if (decorationStar) decorationStar.style.display = 'block';
    
    // Hide the tabs since we're navigating directly
    const tabs = document.querySelector('.tabs');
    if (tabs) tabs.style.display = 'none';
    
    if (section === 'rag') {
        // Show only RAG content
        showOnlyRAG();
    } else if (section === 'bankers') {
        // Show only Banker's content
        showOnlyBanker();
    }
    
    // Create and show navigation buttons
    createNavigationButtons(section);
    
    // Initialize the selected section
    setTimeout(() => {
        if (section === 'rag') {
            // Ensure RAG is initialized
            if (typeof initializeGraph === 'function') {
                initializeGraph();
            }
        } else if (section === 'bankers') {
            // Ensure Banker's is initialized
            if (typeof initializeBankersWithRequests === 'function') {
                initializeBankersWithRequests();
            }
        }
    }, 100);
    
    // Add to log
    if (typeof addToLog === 'function') {
        addToLog(`🎮 Entered ${section === 'rag' ? 'Resource Allocation Graph' : "Banker's Algorithm"} mode`);
    }
}

function createNavigationButtons(currentSection) {
    // Remove existing navigation buttons
    const existingNav = document.querySelector('.app-navigation');
    if (existingNav) existingNav.remove();
    
    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'app-navigation';
    
    // Create buttons
    const homeBtn = document.createElement('button');
    homeBtn.className = 'nav-button home';
    homeBtn.innerHTML = '<i class="fas fa-home"></i> Home';
    homeBtn.onclick = backToIntro;
    
    /* const ragBtn = document.createElement('button');
    ragBtn.className = 'nav-button rag';
    ragBtn.innerHTML = '<i class="fas fa-project-diagram"></i> RAG';
    ragBtn.onclick = () => navigateToSection('rag');
    if (currentSection === 'rag') {
        ragBtn.style.opacity = '0.6';
        ragBtn.style.cursor = 'default';
        ragBtn.onclick = null;
    } */
    
    const bankerBtn = document.createElement('button');
    bankerBtn.className = 'nav-button banker';
    bankerBtn.innerHTML = '<i class="fas fa-calculator"></i> Banker\'s';
    bankerBtn.onclick = () => navigateToSection('bankers');
    if (currentSection === 'bankers') {
        bankerBtn.style.opacity = '0.6';
        bankerBtn.style.cursor = 'default';
        bankerBtn.onclick = null;
    }
    
    // Add buttons to container
    navContainer.appendChild(homeBtn);
    navContainer.appendChild(ragBtn);
    navContainer.appendChild(bankerBtn);
    
    // Add to body
    document.body.appendChild(navContainer);
}

function navigateToSection(section) {
    if (section === 'rag') {
        showOnlyRAG();
        createNavigationButtons('rag');
        
        // Initialize RAG
        if (typeof initializeGraph === 'function') {
            setTimeout(() => initializeGraph(), 50);
        }
        
        // Add to log
        if (typeof addToLog === 'function') {
            addToLog('🔄 Switched to Resource Allocation Graph');
        }
        
    } else if (section === 'bankers') {
        showOnlyBanker();
        createNavigationButtons('bankers');
        
        // Initialize Banker's
        if (typeof initializeBankersWithRequests === 'function') {
            setTimeout(() => initializeBankersWithRequests(), 50);
        }
        
        // Add to log
        if (typeof addToLog === 'function') {
            addToLog('🔄 Switched to Banker\'s Algorithm');
        }
    }
}

function showOnlyRAG() {
    // Hide Banker's content
    const bankerContent = document.getElementById('bankers-tab');
    if (bankerContent) bankerContent.style.display = 'none';
    
    // Show RAG content
    const ragContent = document.getElementById('rag-tab');
    if (ragContent) {
        ragContent.style.display = 'block';
        ragContent.classList.add('active');
    }
    
    // Show side panels for RAG
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    if (leftPanel) leftPanel.style.display = 'block';
    if (rightPanel) rightPanel.style.display = 'block';
    
    // Remove banker mode class
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) mainContainer.classList.remove('banker-mode');
}

function showOnlyBanker() {
    // Hide RAG content
    const ragContent = document.getElementById('rag-tab');
    if (ragContent) {
        ragContent.style.display = 'none';
        ragContent.classList.remove('active');
    }
    
    // Show Banker's content
    const bankerContent = document.getElementById('bankers-tab');
    if (bankerContent) {
        bankerContent.style.display = 'block';
        bankerContent.classList.add('active');
    }
    
    // Hide side panels for Banker's
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    if (leftPanel) leftPanel.style.display = 'none';
    if (rightPanel) rightPanel.style.display = 'none';
    
    // Add banker mode class
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) mainContainer.classList.add('banker-mode');
}

// ========== SOUND MANAGEMENT ==========
function initializeIntroSounds() {
    // Create audio elements for intro
    const introClickSound = document.createElement('audio');
    introClickSound.id = 'introClickSound';
    introClickSound.innerHTML = '<source src="https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3" type="audio/mpeg">';
    document.body.appendChild(introClickSound);
}

function playIntroSound(type) {
    try {
        if (type === 'click') {
            const sound = document.getElementById('introClickSound');
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log("Audio play failed:", e));
            }
        }
    } catch (e) {
        console.log("Sound error:", e);
    }
}

// ========== BACK TO INTRO FUNCTION ==========
function backToIntro() {
    // Hide main app
    const mainContainer = document.querySelector('.main-container');
    const titleBar = document.querySelector('.title-bar');
    const pageBoundary = document.getElementById('pageBoundary');
    const decorationStar = document.querySelector('.decoration-star');
    
    if (mainContainer) mainContainer.style.display = 'none';
    if (titleBar) titleBar.style.display = 'none';
    if (pageBoundary) pageBoundary.style.display = 'none';
    if (decorationStar) decorationStar.style.display = 'none';
    
    // Remove navigation buttons
    const navContainer = document.querySelector('.app-navigation');
    if (navContainer) navContainer.remove();
    
    // Show tabs again (hidden by default, will be shown when needed)
    const tabs = document.querySelector('.tabs');
    if (tabs) tabs.style.display = 'flex';
    
    // Show intro
    const introOverlay = document.getElementById('introOverlay');
    if (introOverlay) {
        introOverlay.style.display = 'flex';
        introOverlay.classList.remove('hidden');
    }
}

function addBackButtonToInterface() {
    // Check if back button already exists
    if (document.getElementById('backToIntroBtn')) return;
    
    // Add back button to title bar
    const titleBar = document.querySelector('.title-bar');
    if (titleBar) {
        const backBtn = document.createElement('button');
        backBtn.id = 'backToIntroBtn';
        backBtn.className = 'back-intro-btn';
        backBtn.innerHTML = '<i class="fas fa-home"></i> Main Menu';
        backBtn.onclick = backToIntro;
        backBtn.style.cssText = `
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 170, 255, 0.2);
            border: 1px solid var(--cyber-blue);
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
            font-weight: bold;
            transition: all 0.3s ease;
            z-index: 100;
        `;
        
        backBtn.addEventListener('mouseover', () => {
            backBtn.style.background = 'rgba(0, 170, 255, 0.4)';
            backBtn.style.transform = 'translateY(-50%) scale(1.05)';
        });
        
        backBtn.addEventListener('mouseout', () => {
            backBtn.style.background = 'rgba(0, 170, 255, 0.2)';
            backBtn.style.transform = 'translateY(-50%) scale(1)';
        });
        
        titleBar.appendChild(backBtn);
    }
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function(e) {
    // Escape key to go back to intro (only when in app)
    if (e.key === 'Escape' && document.querySelector('.main-container').style.display !== 'none') {
        if (confirm('Return to main menu?')) {
            backToIntro();
        }
    }
    
    // F1 for help
    if (e.key === 'F1') {
        e.preventDefault();
        alert('Deadlock Management System\n\nNavigation:\n• F1: This help\n• ESC: Return to main menu\n• Tab: Switch between sections\n\nSelect a method to begin.');
    }
});

// Initialize back button when entering app
window.addEventListener('load', function() {
    setTimeout(addBackButtonToInterface, 1000);
});