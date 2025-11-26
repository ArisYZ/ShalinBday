// Configuration for overlay position
// Edit these coordinates to position the picassoIdle.gif overlay
// Coordinates are in pixels relative to the original background image size

const OVERLAY_CONFIG = {
    // X position (from left edge of background image)
    x: 87,
    
    // Y position (from top edge of background image)
    y: 116,
    
    // Optional: Scale factor for the overlay (1.0 = original size, 0.5 = half size, 2.0 = double size)
    // Leave as null to use automatic scaling based on background image
    scale: null,
    
    // Animation duration in milliseconds (how long to wait before switching back to idle)
    // Adjust this based on your picassoAnim.gif length (default: 4000ms = 4 seconds)
    animationDuration: 5000
};

