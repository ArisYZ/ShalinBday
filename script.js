// To-Do List Application
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.bones = []; // Array of bone objects with unique IDs
        this.currentOverlayState = 'idle'; // 'idle' or 'animating'
        this.currentTheme = 'indigo'; // Default theme
        // Overlay position - loaded from config.js or defaults
        this.overlayPosition = {
            x: typeof OVERLAY_CONFIG !== 'undefined' ? OVERLAY_CONFIG.x : 100,
            y: typeof OVERLAY_CONFIG !== 'undefined' ? OVERLAY_CONFIG.y : 100,
            scale: typeof OVERLAY_CONFIG !== 'undefined' ? OVERLAY_CONFIG.scale : null
        };
        
        // Theme definitions for rainbow colors
        this.themes = {
            red: {
                primary: '#ff6b6b',
                primaryDark: '#ee5a6f',
                secondary: '#ff6b6b',
                accent: '#ff6b6b'
            },
            orange: {
                primary: '#ff8c42',
                primaryDark: '#ff6b35',
                secondary: '#ff8c42',
                accent: '#ff8c42'
            },
            yellow: {
                primary: '#ffd93d',
                primaryDark: '#f6c23e',
                secondary: '#ffd93d',
                accent: '#ffd93d'
            },
            green: {
                primary: '#6bcf7f',
                primaryDark: '#4caf50',
                secondary: '#6bcf7f',
                accent: '#6bcf7f'
            },
            blue: {
                primary: '#4dabf7',
                primaryDark: '#339af0',
                secondary: '#4dabf7',
                accent: '#4dabf7'
            },
            indigo: {
                primary: '#667eea',
                primaryDark: '#764ba2',
                secondary: '#667eea',
                accent: '#667eea'
            },
            violet: {
                primary: '#9775fa',
                primaryDark: '#845ef7',
                secondary: '#9775fa',
                accent: '#9775fa'
            }
        };
        
        this.init();
    }

    init() {
        this.loadTodos();
        this.loadBones();
        this.loadTheme();
        this.loadImages();
        this.setupEventListeners();
        this.setupColorPicker();
        this.setupCalendar();
        this.setupClock();
        this.render();
        this.renderBones();
        this.applyTheme(this.currentTheme);
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
    
    // Theme Management
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            themeName = 'indigo'; // Default fallback
        }
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        // Apply CSS variables
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--primary-dark', theme.primaryDark);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        
        // Update active theme preset
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.classList.remove('active');
            if (preset.dataset.theme === themeName) {
                preset.classList.add('active');
            }
        });
        
        // Clear custom theme active state if switching to preset
        if (themeName !== 'custom') {
            const customPreset = document.getElementById('customThemePreset');
            if (customPreset) {
                customPreset.classList.remove('active');
            }
        }
        
        this.saveTheme();
    }
    
    // Generate darker shade of a color
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) - (num >> 16) * percent / 100));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - ((num >> 8) & 0x00FF) * percent / 100));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) - (num & 0x0000FF) * percent / 100));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    // Apply custom theme from color picker
    applyCustomTheme(color) {
        const primary = color;
        const primaryDark = this.darkenColor(color, 20); // 20% darker for gradient
        
        // Apply CSS variables
        document.documentElement.style.setProperty('--primary-color', primary);
        document.documentElement.style.setProperty('--primary-dark', primaryDark);
        document.documentElement.style.setProperty('--secondary-color', primary);
        document.documentElement.style.setProperty('--accent-color', primary);
        
        // Remove active state from preset themes and set custom as active
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        const customPreset = document.getElementById('customThemePreset');
        if (customPreset) {
            customPreset.classList.add('active');
        }
        
        // Save custom theme
        this.currentTheme = 'custom';
        localStorage.setItem('shalinTheme', 'custom');
        localStorage.setItem('shalinCustomTheme', JSON.stringify({
            primary: primary,
            primaryDark: primaryDark,
            secondary: primary,
            accent: primary
        }));
    }
    
    // Update custom theme preview
    updateCustomPreview(color) {
        const previewBox = document.getElementById('customPreview');
        const gridPreview = document.getElementById('customPreviewGrid');
        const primaryDark = this.darkenColor(color, 20);
        const gradient = `linear-gradient(135deg, ${color} 0%, ${primaryDark} 100%)`;
        
        if (previewBox) {
            previewBox.style.background = gradient;
        }
        if (gridPreview) {
            gridPreview.style.background = gradient;
        }
    }
    
    // Custom Pixel-Art Color Picker
    openCustomColorPicker(e) {
        const modal = document.getElementById('customColorPickerModal');
        if (!modal) return;
        
        // Get current custom color or default
        const currentColor = this.getCurrentCustomColor();
        this.initColorPicker(currentColor);
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    getCurrentCustomColor() {
        const customTheme = localStorage.getItem('shalinCustomTheme');
        if (customTheme) {
            try {
                const theme = JSON.parse(customTheme);
                return theme.primary || '#667eea';
            } catch (e) {
                return '#667eea';
            }
        }
        return '#667eea';
    }
    
    initColorPicker(color) {
        // Convert hex to RGB and HSL
        const rgb = this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Update UI
        document.getElementById('colorR').value = rgb.r;
        document.getElementById('colorG').value = rgb.g;
        document.getElementById('colorB').value = rgb.b;
        
        // Update saturation cursor
        this.updateSaturationCursor(hsl.s, hsl.l);
        this.updateHueCursor(hsl.h);
        this.updateColorPreview(color);
        this.updateSaturationBackground(hsl.h);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 102, g: 126, b: 234 };
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    updateSaturationCursor(s, l) {
        const cursor = document.getElementById('saturationCursor');
        if (cursor) {
            cursor.style.left = (s / 100 * 100) + '%';
            // Convert lightness back to y position
            // l = maxLightness * (1 - y), where maxLightness = 100 - (s/100 * 50)
            // So: y = 1 - (l / maxLightness)
            const maxLightness = 100 - (s / 100 * 50);
            const y = maxLightness > 0 ? 1 - (l / maxLightness) : 0;
            cursor.style.top = (y * 100) + '%';
        }
    }
    
    updateHueCursor(h) {
        const cursor = document.getElementById('hueCursor');
        if (cursor) {
            cursor.style.left = (h / 360 * 100) + '%';
        }
    }
    
    updateSaturationBackground(h) {
        const saturation = document.getElementById('colorPickerSaturation');
        if (saturation) {
            const rgb = this.hslToRgb(h, 100, 50);
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            // Set the base background color to the hue
            saturation.style.background = hex;
        }
    }
    
    updateColorPreview(color) {
        const preview = document.getElementById('colorPickerSelected');
        if (preview) {
            preview.style.background = color;
        }
    }
    
    setupColorPicker() {
        const modal = document.getElementById('customColorPickerModal');
        const saturation = document.getElementById('colorPickerSaturation');
        const hue = document.getElementById('colorPickerHue');
        const closeBtn = document.getElementById('closeColorPicker');
        const applyBtn = document.getElementById('applyColorBtn');
        const cancelBtn = document.getElementById('cancelColorBtn');
        const rInput = document.getElementById('colorR');
        const gInput = document.getElementById('colorG');
        const bInput = document.getElementById('colorB');
        
        let currentHue = 240;
        let currentSaturation = 50;
        let currentLightness = 50;
        
        const updateColor = () => {
            const rgb = this.hslToRgb(currentHue, currentSaturation, currentLightness);
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            rInput.value = rgb.r;
            gInput.value = rgb.g;
            bInput.value = rgb.b;
            this.updateColorPreview(hex);
        };
        
        // Saturation/Lightness picker
        if (saturation) {
            saturation.addEventListener('mousedown', (e) => {
                const rect = saturation.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                currentSaturation = x * 100;
                // Calculate lightness: 
                // - When saturation is 0 (left): lightness ranges 0-100% (black to white)
                // - When saturation is 100% (right): lightness ranges 0-50% (black to pure color)
                // Interpolate between these based on saturation
                const maxLightness = 100 - (x * 50); // 100% at left, 50% at right
                currentLightness = maxLightness * (1 - y);
                this.updateSaturationCursor(currentSaturation, currentLightness);
                updateColor();
                
                const move = (e) => {
                    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                    currentSaturation = x * 100;
                    // Calculate lightness: 
                    // - When saturation is 0 (left): lightness ranges 0-100% (black to white)
                    // - When saturation is 100% (right): lightness ranges 0-50% (black to pure color)
                    // Interpolate between these based on saturation
                    const maxLightness = 100 - (x * 50); // 100% at left, 50% at right
                    currentLightness = maxLightness * (1 - y);
                    this.updateSaturationCursor(currentSaturation, currentLightness);
                    updateColor();
                };
                
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });
        }
        
        // Hue picker
        if (hue) {
            hue.addEventListener('mousedown', (e) => {
                const rect = hue.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                currentHue = x * 360;
                this.updateSaturationBackground(currentHue);
                this.updateHueCursor(currentHue);
                updateColor();
                
                const move = (e) => {
                    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    currentHue = x * 360;
                    this.updateSaturationBackground(currentHue);
                    this.updateHueCursor(currentHue);
                    updateColor();
                };
                
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });
        }
        
        // RGB inputs
        [rInput, gInput, bInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    const r = parseInt(rInput.value) || 0;
                    const g = parseInt(gInput.value) || 0;
                    const b = parseInt(bInput.value) || 0;
                    const hsl = this.rgbToHsl(r, g, b);
                    currentHue = hsl.h;
                    currentSaturation = hsl.s;
                    currentLightness = hsl.l;
                    this.updateSaturationBackground(currentHue);
                    this.updateSaturationCursor(currentSaturation, currentLightness);
                    this.updateHueCursor(currentHue);
                    const hex = this.rgbToHex(r, g, b);
                    this.updateColorPreview(hex);
                });
            }
        });
        
        // Close/Apply/Cancel buttons
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const r = parseInt(rInput.value) || 0;
                const g = parseInt(gInput.value) || 0;
                const b = parseInt(bInput.value) || 0;
                const hex = this.rgbToHex(r, g, b);
                this.applyCustomTheme(hex);
                this.updateCustomPreview(hex);
                modal.style.display = 'none';
            });
        }
        
        // Close on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    saveTheme() {
        localStorage.setItem('shalinTheme', this.currentTheme);
    }
    
    loadTheme() {
        const saved = localStorage.getItem('shalinTheme');
        if (saved === 'custom') {
            const customTheme = localStorage.getItem('shalinCustomTheme');
            if (customTheme) {
                try {
                    const theme = JSON.parse(customTheme);
                    document.documentElement.style.setProperty('--primary-color', theme.primary);
                    document.documentElement.style.setProperty('--primary-dark', theme.primaryDark);
                    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
                    document.documentElement.style.setProperty('--accent-color', theme.accent);
                    this.currentTheme = 'custom';
                    // Set color picker to saved color
                    const colorPicker = document.getElementById('customColorPicker');
                    if (colorPicker) {
                        colorPicker.value = theme.primary;
                        this.updateCustomPreview(theme.primary);
                    }
                    // Mark custom preset as active
                    setTimeout(() => {
                        const customPreset = document.getElementById('customThemePreset');
                        if (customPreset) {
                            customPreset.classList.add('active');
                        }
                    }, 100);
                } catch (e) {
                    this.currentTheme = 'indigo';
                }
            }
        } else if (saved && this.themes[saved]) {
            this.currentTheme = saved;
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
            
            // Give a bone when a task is completed
            if (!wasCompleted && todo.completed) {
                this.addBone();
            }
            // Remove a bone when a task is unchecked (prevents spam checking/unchecking)
            else if (wasCompleted && !todo.completed && this.bones.length > 0) {
                // Remove the most recently added bone
                this.bones.pop();
                this.saveBones();
                this.renderBones();
            }
            
            this.saveTodos();
            this.render();
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Show/hide content areas based on filter
        const todoContent = document.getElementById('todoContent');
        const themesContent = document.getElementById('themesContent');
        if (filter === 'themes') {
            todoContent.style.display = 'none';
            themesContent.style.display = 'block';
            // Initialize custom preview if needed
            const colorPicker = document.getElementById('customColorPicker');
            const gridPreview = document.getElementById('customPreviewGrid');
            if (colorPicker && colorPicker.value) {
                this.updateCustomPreview(colorPicker.value);
            } else if (gridPreview && !gridPreview.style.background) {
                // Initialize with default gradient if not set
                gridPreview.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        } else {
            todoContent.style.display = 'block';
            themesContent.style.display = 'none';
            this.render();
        }
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
                    ${this.currentFilter === 'all' ? 'No tasks yet. Add one above!' : 
                      this.currentFilter === 'active' ? 'No active tasks. Great job!' : 
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
        // Handle both YYYY-MM-DD and MM/DD/YYYY formats
        let date;
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
            date = new Date(dateString);
        }
        
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
            const dateValue = this.parseDateInput(todoDate.value);
            this.addTodo(todoInput.value, dateValue, urgency);
            todoInput.value = '';
            todoDate.value = '';
            todoUrgency.value = '';
            todoInput.focus();
        });
        
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const urgency = todoUrgency.value || 'medium';
                const dateValue = this.parseDateInput(todoDate.value);
                this.addTodo(todoInput.value, dateValue, urgency);
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
        
        // Theme presets
        document.querySelectorAll('.theme-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const themeName = preset.dataset.theme;
                if (themeName === 'custom') {
                    // Open custom pixel-art color picker
                    this.openCustomColorPicker(e);
                } else {
                    this.applyTheme(themeName);
                }
            });
        });
        
        // Custom color picker
        const colorPicker = document.getElementById('customColorPicker');
        
        if (colorPicker) {
            // Update preview when color changes
            colorPicker.addEventListener('input', (e) => {
                this.updateCustomPreview(e.target.value);
            });
            
            // Apply custom theme when color picker value changes (after selection)
            colorPicker.addEventListener('change', (e) => {
                // Auto-apply when user selects a color
                this.applyCustomTheme(e.target.value);
                
                // Move color picker back to themes section after use
                const themesContent = document.getElementById('themesContent');
                if (themesContent && colorPicker.parentElement === document.body) {
                    themesContent.appendChild(colorPicker);
                    colorPicker.style.position = '';
                    colorPicker.style.left = '';
                    colorPicker.style.top = '';
                    colorPicker.style.width = '';
                    colorPicker.style.height = '';
                    colorPicker.style.zIndex = '';
                }
            });
        }
        
        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });
    }
    
    // Calendar Management
    setupCalendar() {
        this.calendarDate = new Date();
        this.selectedDate = null;
        
        const dateInput = document.getElementById('todoDate');
        const calendar = document.getElementById('customCalendar');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const todayBtn = document.getElementById('calendarToday');
        const clearBtn = document.getElementById('calendarClear');
        const calendarDays = document.getElementById('calendarDays');
        
        // Open calendar
        const openCalendar = () => {
            if (dateInput.value) {
                // Parse existing date
                const parts = dateInput.value.split('/');
                if (parts.length === 3) {
                    this.calendarDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                }
            }
            this.renderCalendar();
            calendar.style.display = 'flex';
        };
        
        if (dateInput) {
            dateInput.addEventListener('click', openCalendar);
        }
        
        // Month navigation
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
                this.renderCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
                this.renderCalendar();
            });
        }
        
        // Today button
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                const today = new Date();
                this.selectDate(today);
                this.closeCalendar();
            });
        }
        
        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                dateInput.value = '';
                this.selectedDate = null;
                this.closeCalendar();
            });
        }
        
        // Close on background click
        if (calendar) {
            calendar.addEventListener('click', (e) => {
                if (e.target === calendar) {
                    this.closeCalendar();
                }
            });
        }
        
        // Render initial calendar
        this.renderCalendar();
    }
    
    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const monthYear = document.getElementById('calendarMonthYear');
        if (!calendarDays || !monthYear) return;
        
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthYear.textContent = `${monthNames[month].toUpperCase()} ${year}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get previous month's days to fill the grid
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        calendarDays.innerHTML = '';
        
        // Previous month's days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        }
        
        // Current month's days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const date = new Date(year, month, day);
            
            // Check if it's today
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Check if it's selected
            if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            dayElement.addEventListener('click', () => {
                this.selectDate(date);
                this.closeCalendar();
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        // Next month's days to fill the grid (always 42 cells total)
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        }
    }
    
    selectDate(date) {
        this.selectedDate = date;
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        const dateInput = document.getElementById('todoDate');
        if (dateInput) {
            dateInput.value = `${month}/${day}/${year}`;
        }
        this.renderCalendar();
    }
    
    closeCalendar() {
        const calendar = document.getElementById('customCalendar');
        if (calendar) {
            calendar.style.display = 'none';
        }
    }
    
    parseDateInput(dateString) {
        if (!dateString) return null;
        // Parse MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const month = parseInt(parts[0]) - 1;
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            const date = new Date(year, month, day);
            // Return in YYYY-MM-DD format for storage
            return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        return null;
    }
    
    setupClock() {
        const clockDisplay = document.getElementById('clockDisplay');
        if (!clockDisplay) return;
        
        // Update clock immediately
        this.updateClock();
        
        // Update clock every second
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    updateClock() {
        const clockDisplay = document.getElementById('clockDisplay');
        if (!clockDisplay) return;
        
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        hours = hours.toString().padStart(2, '0');
        
        clockDisplay.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
    
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Load saved dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        // Toggle dark mode
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
});

