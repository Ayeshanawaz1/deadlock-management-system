# 🔒 Deadlock Management System

> **Operating Systems — University Project**  
> An interactive, browser-based simulation of OS deadlock detection and prevention algorithms.

---

## 📌 Overview

The **Deadlock Management System** is a fully client-side web application built as a university Operating Systems project. It provides two independent, interactive modules to visualize and understand deadlock concepts:

| Module | Technique | Purpose |
|---|---|---|
| 🕸️ Resource Allocation Graph (RAG) | Graph Theory | **Detect** deadlocks visually |
| 🏦 Banker's Algorithm | Matrix Mathematics | **Avoid** deadlocks proactively |

---

## 🚀 Features

### 🕸️ Resource Allocation Graph (RAG)
- **Visual graph** of processes and resources with animated SVG edges
- **Real-time deadlock detection** via cycle detection in the RAG
- **Request / Release** resource interactions with live graph updates
- **Predefined scenarios**: No-deadlock, Single Cycle, Multiple Cycles
- **Deadlock resolution**: Suggest Resolution & Break Deadlock
- **Circular wait prevention** with configurable resource ordering
- **Alarm system** (visual overlay + audio alert) on deadlock detection
- Dynamic add/remove of processes (max 8) and resources (max 6)

### 🏦 Banker's Algorithm
- **Interactive matrices**: Allocation, Max, and computed Need
- **Step-by-step safety algorithm** visualization with auto-play
- **Resource request handling** with detailed feasibility checking
- **Multiple example scenarios** with varied safe/unsafe states
- **Export steps** to download a detailed execution log
- Up to 10 processes × 5 resource types

### 🎨 UI / UX
- Futuristic **cyberpunk-themed** dark UI with neon accents
- Animated intro screen with module selection
- Keyboard shortcuts (ESC, F1, Ctrl+R, Ctrl+L, Space)
- Responsive layout with left/right/bottom panels
- Sound effects on interactions (optional, requires local audio files)

---

## 📁 Project Structure

```
deadlock-management-system/
│
├── index.html        # Main entry point — full UI layout for both modules
├── intro.js          # Intro screen, navigation, and app-wide bootstrapping
├── intro.css         # Intro overlay and navigation button styles
├── rag.js            # Resource Allocation Graph logic (cycle detection, graph rendering, alarm)
├── rag.css           # RAG graph styles (nodes, edges, SVG, panels)
├── banker.js         # Banker's Algorithm (safety check, request algorithm, step visualization)
├── banker.css        # Banker matrix & step-visualization styles
│
├── .gitignore        # Excludes binaries and editor configs
└── README.md         # This file
```

> **Note:** Audio files (`Sci Fi UI Sounds.mp3`, `alarm2.mp3`) are **not included** in this repository (binary assets). Place them in the same directory as `index.html` to enable sound effects. The app works fully without them.

---

## 🛠️ Technologies Used

| Technology | Usage |
|---|---|
| **HTML5** | Semantic page structure, SVG canvas |
| **CSS3** | Animations, grid/flex layout, neon glow effects |
| **Vanilla JavaScript (ES6+)** | All algorithm logic, DOM manipulation |
| **SVG** | Dynamic edge drawing for the RAG |
| **Font Awesome 6** | Icons throughout the UI |
| **Google Fonts** | Orbitron & Rajdhani typefaces |

No build tools, no frameworks, no backend — **runs directly in any modern browser**.

---

## ▶️ How to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayeshanawaz1/deadlock-management-system.git
   cd deadlock-management-system
   ```

2. **Open in browser:**
   ```
   Simply open index.html in any modern browser (Chrome, Firefox, Edge).
   ```
   > Tip: Use VS Code's **Live Server** extension for the best experience.

3. *(Optional)* Add audio files:
   - Place `Sci Fi UI Sounds.mp3` and `alarm2.mp3` in the same folder as `index.html`.

---

## 🎮 Usage Guide

### Starting the App
The app opens with an **intro screen** offering two choices:

- **Resource Allocation Graph** → launches the RAG module
- **Banker's Algorithm** → launches the Banker's module

Press **Home** button (top-left) at any time to return to the intro screen.

### RAG Module
1. Set process and resource counts → click **Apply Configuration**
2. Select a **Process ID** and **Resource ID** from the right panel
3. Click **Request Resource** to create a request/allocation edge
4. Click **Release Resource** to free a resource
5. Deadlock is **auto-detected** — a red alarm overlay appears if a cycle is found
6. Use **Predefined Scenarios** to quickly load classic deadlock examples
7. Use **Suggest / Break Deadlock** to resolve deadlocked states

### Banker's Algorithm
1. Set process and resource counts → click **Apply Configuration**
2. Fill in the **Allocation** and **Max** matrices
3. Set **Available** resource counts
4. Click **Calculate Need** to compute the Need matrix
5. Click **Run Safety Algorithm** to check if the system is in a safe state
6. Use **Auto-play Steps** to animate through the algorithm execution
7. Load pre-built examples via **Load Example**

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `Escape` | Return to main menu / dismiss alarm |
| `Space` | Trigger deadlock detection (RAG) |
| `Ctrl + R` | Request resource (RAG) |
| `Ctrl + L` | Release resource (RAG) |
| `F1` | Show help dialog |

---

## 📐 Algorithm Details

### Resource Allocation Graph — Cycle Detection
The system builds a directed graph where:
- **Process → Resource** = request edge (process is waiting)
- **Resource → Process** = assignment edge (resource is held)

A **Depth-First Search (DFS)** with back-edge detection identifies cycles. In a single-instance RAG, a cycle = deadlock. Multi-instance support shows cycle warnings.

### Banker's Safety Algorithm
Given `n` processes, `m` resource types:
```
Work = Available
Finish[i] = false  for all i

while (∃ i: !Finish[i] && Need[i] ≤ Work):
    Work = Work + Allocation[i]
    Finish[i] = true

Safe ⟺ Finish[i] = true for all i
```

**Need Matrix**: `Need[i][j] = Max[i][j] − Allocation[i][j]`

### Banker's Resource Request Algorithm
When process Pᵢ requests `Request[i]`:
1. If `Request[i] > Need[i]` → Error (exceeded max claim)
2. If `Request[i] > Available` → Wait (insufficient resources)
3. Tentatively allocate, run Safety Algorithm
4. If safe → commit; else → rollback

---

## 👩‍💻 Authors
 
**Ayesha Nawaz Khan**  
Operating Systems — University Project  
Built using HTML, CSS & JavaScript

**Muhammad Umar Saeed**
(https://github.com/Muhammad-UmarX)
---

## 📜 License

This project is submitted as academic coursework. Feel free to reference it for learning purposes.

---

*"A safe state is one from which the system can allocate resources to each process in some order and still avoid deadlock."*
