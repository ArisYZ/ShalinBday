// To-Do List Application
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.bones = []; // Array of bone objects with unique IDs
        this.currentOverlayState = 'idle'; // 'idle' or 'animating'
        // Overlay position - loaded from config.js or defaults
        this.overlayPosition = {
            x: typeof OVERLAY_CONFIG !== 'undefined' ? OVERLAY_CONFIG.x : 100,
            y: typeof OVERLAY_CONFIG !== 'undefined' ? OVERLAY_CONFIG.y : 100,
            scale: typeof OVERLAY_CONFIG !== 'undefined' ? OVERLAY_CONFIG.scale : null
        };
        
        this.init();
    }

    init() {
        this.loadTodos();
        this.loadBones();
        this.loadImages();
        this.setupEventListeners();
        this.render();
        this.renderBones();
    }

    // Image Management - Load background and overlay
    async loadImages() {
        const backgroundPath = 'Background/shalin_room.png';
        const overlayPath = 'Picasso/picassoIdle.gif';
        
        const backgroundImg = document.getElementById('backgroundImage');
        const overlayImg = document.getElementById('overlayGif');
        const displayDiv = document.querySelector('.image-display');
        
        // Load background image
        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    backgroundImg.src = backgroundPath;
                    backgroundImg.style.display = 'block';
                    resolve();
                };
                img.onerror = () => {
                    console.warn('Background image not found:', backgroundPath);
                    // Show placeholder
                    this.showPlaceholder(displayDiv);
                    reject();
                };
                img.src = backgroundPath;
            });
        } catch (e) {
            return; // Background failed to load
        }
        
        // Load overlay GIF
        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    overlayImg.src = overlayPath;
                    overlayImg.style.display = 'block';
                    this.positionOverlay(overlayImg, backgroundImg);
                    resolve();
                };
                img.onerror = () => {
                    console.warn('Overlay GIF not found:', overlayPath);
                    // Overlay is optional, so we continue without it
                    resolve();
                };
                img.src = overlayPath;
            });
        } catch (e) {
            // Overlay failed, but that's okay
        }
        
        // Handle window resize to reposition overlay
        window.addEventListener('resize', () => {
            if (overlayImg.style.display !== 'none') {
                this.positionOverlay(overlayImg, backgroundImg);
            }
        });
        
        // Set up drag and drop for overlay
        this.setupOverlayDragDrop(overlayImg);
    }
    
    setupOverlayDragDrop(overlayImg) {
        overlayImg.addEventListener('dragover', (e) => {
            e.preventDefault();
            overlayImg.classList.add('drag-over');
        });
        
        overlayImg.addEventListener('dragleave', () => {
            overlayImg.classList.remove('drag-over');
        });
        
        overlayImg.addEventListener('drop', (e) => {
            e.preventDefault();
            overlayImg.classList.remove('drag-over');
            
            const boneId = e.dataTransfer.getData('text/plain');
            if (boneId && boneId.startsWith('bone-')) {
                this.useBone(boneId);
            }
        });
    }
    
    // Bone Management
    addBone() {
        const bone = {
            id: 'bone-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };
        this.bones.push(bone);
        this.saveBones();
        this.renderBones();
    }
    
    removeBone(boneId) {
        this.bones = this.bones.filter(b => b.id !== boneId);
        this.saveBones();
        this.renderBones();
    }
    
    useBone(boneId) {
        // Don't allow using bones while animation is playing
        if (this.currentOverlayState === 'animating') {
            return;
        }
        
        // Remove the bone
        this.removeBone(boneId);
        
        // Switch to animation
        this.playAnimation();
    }
    
    playAnimation() {
        if (this.currentOverlayState === 'animating') {
            return;
        }
        
        this.currentOverlayState = 'animating';
        const overlayImg = document.getElementById('overlayGif');
        
        // Store original position to maintain it
        const originalLeft = overlayImg.style.left;
        const originalTop = overlayImg.style.top;
        const originalWidth = overlayImg.style.width;
        
        // Switch to animation GIF
        // Add a cache-busting parameter to force reload
        overlayImg.src = 'Picasso/picassoAnim.gif?' + Date.now();
        
        // Play bark sound after 2000ms (2 seconds)
        setTimeout(() => {
            try {
                const barkSound = new Audio('Picasso/Bark.mp3');
                barkSound.play().catch(e => {
                    console.warn('Could not play bark sound:', e);
                });
            } catch (e) {
                console.warn('Could not create bark sound:', e);
            }
        }, 2800);
        
        // For non-looped GIFs, we need to detect when it completes
        // Since we can't easily detect GIF completion, we'll use a combination approach:
        // 1. Preload the animation GIF to get its frame count/duration if possible
        // 2. Use a reasonable timeout (most animations are 1-5 seconds)
        
        // Preload animation to check its properties
        const animGif = new Image();
        animGif.onload = () => {
            // Animation loaded, now we wait for it to complete
            // Since it's non-looped, we'll use a timeout
            const animDuration = typeof OVERLAY_CONFIG !== 'undefined' && OVERLAY_CONFIG.animationDuration 
                ? OVERLAY_CONFIG.animationDuration 
                : 4000;
            setTimeout(() => {
                if (this.currentOverlayState === 'animating') {
                    this.switchBackToIdle(overlayImg, originalLeft, originalTop, originalWidth);
                }
            }, animDuration);
        };
        animGif.src = 'Picasso/picassoAnim.gif';
        
        // Fallback: if image fails to load, switch back after 1 second
        overlayImg.onerror = () => {
            setTimeout(() => {
                if (this.currentOverlayState === 'animating') {
                    this.switchBackToIdle(overlayImg, originalLeft, originalTop, originalWidth);
                }
            }, 1000);
        };
    }
    
    switchBackToIdle(overlayImg, originalLeft, originalTop, originalWidth) {
        // Switch back to idle GIF
        overlayImg.src = 'Picasso/picassoIdle.gif?' + Date.now();
        this.currentOverlayState = 'idle';
        
        // Restore position
        if (originalLeft) overlayImg.style.left = originalLeft;
        if (originalTop) overlayImg.style.top = originalTop;
        if (originalWidth) overlayImg.style.width = originalWidth;
        
        // Reposition overlay after switching to ensure it's correct
        const backgroundImg = document.getElementById('backgroundImage');
        setTimeout(() => {
            this.positionOverlay(overlayImg, backgroundImg);
        }, 200);
    }
    
    
    renderBones() {
        const boneContainer = document.getElementById('boneContainer');
        const boneCount = document.getElementById('boneCount');
        
        boneCount.textContent = this.bones.length;
        
        boneContainer.innerHTML = this.bones.map(bone => `
            <div 
                class="bone-item" 
                id="${bone.id}"
                draggable="true"
            >
                <img src="Background/Bone.png" alt="Bone" />
            </div>
        `).join('');
        
        // Set up drag events for each bone
        this.bones.forEach(bone => {
            const boneElement = document.getElementById(bone.id);
            if (boneElement) {
                boneElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', bone.id);
                    e.dataTransfer.effectAllowed = 'move';
                    boneElement.classList.add('dragging');
                });
                
                boneElement.addEventListener('dragend', () => {
                    boneElement.classList.remove('dragging');
                });
            }
        });
    }
    
    // Local Storage for Bones
    saveBones() {
        localStorage.setItem('shalinBones', JSON.stringify(this.bones));
    }
    
    loadBones() {
        const saved = localStorage.getItem('shalinBones');
        if (saved) {
            try {
                this.bones = JSON.parse(saved);
            } catch (e) {
                this.bones = [];
            }
        }
    }

    positionOverlay(overlayImg, backgroundImg) {
        // Wait for images to load to get their actual dimensions
        if (!backgroundImg.complete || !overlayImg.complete) {
            // Wait for both images to load
            Promise.all([
                new Promise(resolve => {
                    if (backgroundImg.complete) resolve();
                    else backgroundImg.onload = resolve;
                }),
                new Promise(resolve => {
                    if (overlayImg.complete) resolve();
                    else overlayImg.onload = resolve;
                })
            ]).then(() => this.positionOverlay(overlayImg, backgroundImg));
            return;
        }
        
        const displayDiv = backgroundImg.parentElement;
        const displayRect = displayDiv.getBoundingClientRect();
        
        // Get the actual displayed size of the background image
        const bgNaturalWidth = backgroundImg.naturalWidth;
        const bgNaturalHeight = backgroundImg.naturalHeight;
        const bgDisplayWidth = backgroundImg.offsetWidth;
        const bgDisplayHeight = backgroundImg.offsetHeight;
        
        // Calculate scale factor
        const scaleX = bgDisplayWidth / bgNaturalWidth;
        const scaleY = bgDisplayHeight / bgNaturalHeight;
        
        // Scale the overlay position
        const scaledX = this.overlayPosition.x * scaleX;
        const scaledY = this.overlayPosition.y * scaleY;
        
        // Position the overlay
        overlayImg.style.left = scaledX + 'px';
        overlayImg.style.top = scaledY + 'px';
        
        // Scale the overlay
        let overlayScale;
        if (this.overlayPosition.scale !== null) {
            // Use custom scale if specified
            overlayScale = this.overlayPosition.scale * Math.min(scaleX, scaleY);
        } else {
            // Use automatic scaling based on background
            overlayScale = Math.min(scaleX, scaleY); // Use the smaller scale to maintain aspect ratio
        }
        overlayImg.style.width = (overlayImg.naturalWidth * overlayScale) + 'px';
        overlayImg.style.height = 'auto';
    }

    showPlaceholder(displayDiv) {
        let placeholder = displayDiv.querySelector('.placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.style.cssText = 'position: absolute; color: #999; font-size: 18px; text-align: center; padding: 40px; width: 100%;';
            placeholder.innerHTML = `
                <p style="margin-bottom: 10px;">📷</p>
                <p style="font-size: 16px; line-height: 1.6;">
                    Background image not found<br>
                    <span style="font-size: 14px; color: #bbb;">
                        (Background/shalin_room.png)
                    </span>
                </p>
            `;
            displayDiv.appendChild(placeholder);
        }
    }


    // To-Do List Management
    addTodo(text, dueDate = null, urgency = 'medium') {
        if (text.trim() === '') return;
        
        const todo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDate || null,
            urgency: urgency || 'medium'
        };
        
        this.todos.push(todo);
        this.saveTodos();
        this.render();
    }

    removeTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const wasCompleted = todo.completed;
            todo.completed = !todo.completed;
            
            // Give a bone when a task is completed (not when uncompleted)
            if (!wasCompleted && todo.completed) {
                this.addBone();
            }
            
            this.saveTodos();
            this.saveBones();
            this.render();
            this.renderBones();
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    getFilteredTodos() {
        let filtered;
        switch (this.currentFilter) {
            case 'active':
                filtered = this.todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = this.todos.filter(todo => todo.completed);
                break;
            default:
                filtered = this.todos;
        }
        
        // Sort by due date (earliest first), then by urgency (high > medium > low)
        return filtered.sort((a, b) => {
            // First, sort by due date
            if (a.dueDate && b.dueDate) {
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                }
            } else if (a.dueDate && !b.dueDate) {
                return -1; // a has date, b doesn't - a comes first
            } else if (!a.dueDate && b.dueDate) {
                return 1; // b has date, a doesn't - b comes first
            }
            
            // If dates are equal or both null, sort by urgency
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        });
    }

    getActiveCount() {
        return this.todos.filter(todo => !todo.completed).length;
    }

    // Rendering
    render() {
        this.renderTodos();
        this.renderFooter();
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <li style="text-align: center; padding: 40px; color: #999; font-style: italic;">
                    ${this.currentFilter === 'all' ? 'No tasks yet. Add one above! 🎉' : 
                      this.currentFilter === 'active' ? 'No active tasks. Great job! ✨' : 
                      'No completed tasks yet.'}
                </li>
            `;
            return;
        }
        
        todoList.innerHTML = filteredTodos.map(todo => {
            const urgencyClass = `urgency-${todo.urgency}`;
            const urgencyLabel = todo.urgency ? todo.urgency.charAt(0).toUpperCase() + todo.urgency.slice(1) : '';
            const dueDateStr = todo.dueDate ? this.formatDate(todo.dueDate) : '';
            const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
            
            return `
            <li class="todo-item ${todo.completed ? 'completed' : ''} ${urgencyClass} ${isOverdue ? 'overdue' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                />
                <div class="todo-content">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-meta">
                        ${dueDateStr ? `<span class="todo-date-display ${isOverdue ? 'overdue' : ''}">📅 ${dueDateStr}</span>` : ''}
                        ${urgencyLabel ? `<span class="todo-urgency-badge ${urgencyClass}">${urgencyLabel}</span>` : ''}
                    </div>
                </div>
                <button class="todo-delete" onclick="app.removeTodo(${todo.id})">Delete</button>
            </li>
            `;
        }).join('');
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        // Check if it's tomorrow
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        
        // Format as MM/DD/YYYY
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    renderFooter() {
        const activeCount = this.getActiveCount();
        const itemCount = document.getElementById('itemCount');
        const clearBtn = document.getElementById('clearCompleted');
        
        itemCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
        clearBtn.disabled = this.todos.filter(todo => todo.completed).length === 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Local Storage
    saveTodos() {
        localStorage.setItem('shalinTodos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('shalinTodos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                this.todos = [];
            }
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Add todo
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');
        
        const todoDate = document.getElementById('todoDate');
        const todoUrgency = document.getElementById('todoUrgency');
        
        addBtn.addEventListener('click', () => {
            const urgency = todoUrgency.value || 'medium';
            this.addTodo(todoInput.value, todoDate.value || null, urgency);
            todoInput.value = '';
            todoDate.value = '';
            todoUrgency.value = '';
            todoInput.focus();
        });
        
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const urgency = todoUrgency.value || 'medium';
                this.addTodo(todoInput.value, todoDate.value || null, urgency);
                todoInput.value = '';
                todoDate.value = '';
                todoUrgency.value = '';
            }
        });
        
        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setFilter(btn.dataset.filter);
            });
        });
        
        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});

