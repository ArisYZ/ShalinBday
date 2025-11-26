# Shalin's Birthday To-Do List

A beautiful, personalized desktop to-do list application created as a birthday gift!

## Features

- Beautiful pixel-art design with modern UI
- Image gallery on the left (supports static images and GIFs)
- Full-featured to-do list with add, complete, and delete functionality
- Filter tasks by All, Active, or Completed
- Automatic local storage - your tasks are saved automatically
- Standalone desktop application - no browser needed
- Responsive design that works on all screen sizes
- Bone reward system - earn bones by completing tasks
- Drag and drop bones to trigger animations
- Theme customization with preset themes and custom color picker
- Dark mode support
- Custom pixel-art calendar for due dates
- Priority levels for tasks
- Clock display showing local system time
- Window resizing with state persistence
- Zoom controls (Ctrl/Cmd + Plus, Minus, 0)

## Installation & Setup

### Prerequisites

1. **Install Node.js** (if you don't have it):
   - Download from [nodejs.org](https://nodejs.org/)
   - Install the LTS version (recommended)
   - This is required to build the desktop application

2. **Install dependencies**:
   - Open a terminal/command prompt in this folder
   - Run: `npm install`
   - This will install Electron and other required packages

### Running the Application

**Development Mode** (for testing):
```bash
npm start
```

This will launch the application in development mode. Use this for testing and development.

## Building Executables

The application can be built into standalone executables for Windows and Mac. These executables can be distributed and run without requiring Node.js or any additional installation.

### Building for Windows

To create a Windows executable:

```bash
npm run build-win
```

This will create:
- **Installer**: `dist/Shalin's Birthday To-Do Setup X.X.X.exe` - A full installer that can be distributed
- **Portable**: `dist/Shalin's Birthday To-Do X.X.X.exe` - A portable executable that runs without installation

**Output Location**: All files will be in the `dist/` folder.

**Distribution**: 
- Share the installer for users who want a standard installation
- Share the portable executable for users who want to run it without installing
- The portable version can be run directly from any location

### Building for Mac

To create a Mac executable:

```bash
npm run build-mac
```

This will create:
- **DMG File**: `dist/Shalin's Birthday To-Do-X.X.X.dmg` - A disk image that can be distributed

**Output Location**: The DMG file will be in the `dist/` folder.

**Distribution**:
- Share the DMG file
- Users can double-click the DMG to mount it, then drag the app to their Applications folder
- The app will work on both Intel (x64) and Apple Silicon (arm64) Macs

### Building for Both Platforms

If you want to build for both Windows and Mac, you can run:

```bash
npm run build-win
npm run build-mac
```

Note: You must build on the target platform (build Windows executables on Windows, Mac executables on Mac).

### Build Requirements

- **Windows Build**: Must be run on a Windows machine
- **Mac Build**: Must be run on a Mac
- **Node.js**: Version 14 or higher recommended
- **Disk Space**: At least 500MB free space for build artifacts

### Icon Files (Optional)

The build configuration references icon files:
- `icon.ico` for Windows
- `icon.icns` for Mac
- `icon.png` for Linux

If these files are not present, the build will still work but will use default Electron icons. To add custom icons:

1. Create or obtain icon files in the required formats
2. Place them in the project root directory
3. Rebuild the application

## Image Setup

The app automatically looks for images in:
- `Background/shalin_room.png` (background image - displayed as the base)
- `Background/Bone.png` (bone reward image)
- `Picasso/picassoIdle.gif` (overlay GIF - displayed on top of the background)
- `Picasso/picassoAnim.gif` (animation GIF - plays when bone is given)
- `Picasso/Bark.mp3` (sound effect played when bone is given)

The `picassoIdle.gif` will be overlaid on top of the background image at a specific position.

### Configuring Overlay Position

To adjust where the overlay GIF appears on the background image, edit `config.js`:

```javascript
const OVERLAY_CONFIG = {
    x: 100,  // X position in pixels (from left edge)
    y: 100,  // Y position in pixels (from top edge)
    scale: null,  // Optional: scale factor (null = auto-scale)
    animationDuration: 4000  // Animation duration in milliseconds
};
```

- **x**: Horizontal position from the left edge of the background image (in pixels)
- **y**: Vertical position from the top edge of the background image (in pixels)
- **scale**: Optional scale factor (1.0 = original size, 0.5 = half size, 2.0 = double size). Leave as `null` for automatic scaling.
- **animationDuration**: How long to wait before switching back to idle GIF (in milliseconds). Adjust based on your `picassoAnim.gif` length.

The coordinates are relative to the original background image size and will automatically scale when the display size changes.

## How to Use

1. **Start the application**:
   - Run `npm start` to launch the app in development mode
   - Or use the built executable from the `dist/` folder

2. **Use the to-do list**:
   - Type a task in the input box and click "Add Task" or press Enter
   - Click the checkbox to mark tasks as completed
   - Earn bones: Each time you complete a task, you earn 1 bone
   - Unchecking a task removes the most recently earned bone
   - Click "Delete" to remove a task (completed tasks keep their bones when deleted)
   - Use the filter buttons to view All, Active, or Completed tasks
   - Click "Clear Completed" to remove all completed tasks at once

3. **Add due dates and priorities**:
   - Click the date field to open a calendar picker
   - Select a priority level from the dropdown
   - Tasks are automatically sorted by due date and urgency

4. **View the composite image**:
   - The background image from `Background/shalin_room.png` is displayed
   - The `picassoIdle.gif` is overlaid on top at the position specified in `config.js`

5. **Use your bones**:
   - Bones appear in the counter overlay on the image
   - Drag a bone from the inventory and drop it on the picassoIdle.gif
   - The GIF will switch to `picassoAnim.gif` and play the animation once
   - After the animation completes, it automatically switches back to `picassoIdle.gif`
   - A sound effect (Bark.mp3) plays 2 seconds after giving a bone
   - The bone is consumed after use

6. **Customize themes**:
   - Click on the "Themes" tab
   - Select from preset rainbow themes
   - Click "Custom" to open a color picker and create your own theme
   - Toggle dark mode using the slider in the Themes tab

7. **Window controls**:
   - Resize the window by dragging the edges or corners
   - Window size and position are saved automatically
   - Use Ctrl/Cmd + Plus to zoom in
   - Use Ctrl/Cmd + Minus to zoom out
   - Use Ctrl/Cmd + 0 to reset zoom

## File Structure

```
ShalinBday/
├── index.html          # Main HTML file
├── styles.css          # Styling and layout
├── script.js           # Application logic
├── config.js           # Overlay position configuration
├── main.js             # Electron main process
├── package.json        # Node.js dependencies and build config
├── Background/         # Background image folder
│   ├── shalin_room.png
│   └── Bone.png
├── Picasso/            # GIF images and sound folder
│   ├── picassoAnim.gif (animation - plays when bone is given)
│   ├── picassoIdle.gif (overlay - default state)
│   └── Bark.mp3        (sound effect)
├── dist/               # Build output folder (created after building)
└── README.md          # This file
```

## Distribution Instructions

### For Windows Users

1. **Build the executable**:
   ```bash
   npm run build-win
   ```

2. **Find the executables**:
   - Navigate to the `dist/` folder
   - You'll find two files:
     - `Shalin's Birthday To-Do Setup X.X.X.exe` - Full installer
     - `Shalin's Birthday To-Do X.X.X.exe` - Portable version

3. **Distribute**:
   - Share either file (or both) with the recipient
   - The portable version can be run immediately without installation
   - The installer version provides a standard Windows installation experience

### For Mac Users

1. **Build the executable**:
   ```bash
   npm run build-mac
   ```

2. **Find the DMG**:
   - Navigate to the `dist/` folder
   - You'll find: `Shalin's Birthday To-Do-X.X.X.dmg`

3. **Distribute**:
   - Share the DMG file with the recipient
   - The recipient can double-click the DMG to mount it
   - They can then drag the app to their Applications folder
   - The app works on both Intel and Apple Silicon Macs

### Testing Before Distribution

Before sharing the executable:

1. Build the application on the target platform
2. Test the executable on a clean machine (or VM) without Node.js installed
3. Verify all images load correctly
4. Test all features (to-do list, bones, themes, etc.)
5. Check that window resizing and zoom work properly

## Technical Details

- **Built with Electron** - Cross-platform desktop app framework
- **HTML/CSS/JavaScript** - Modern web technologies
- **Local Storage** - All tasks, bones, themes, and preferences saved automatically
- **No Internet Required** - Works completely offline
- **Cross-Platform** - Works on Windows, Mac, and Linux
- **Window State Persistence** - Window size and position are remembered
- **Pixel-Art Styling** - Custom pixel-art font and styling throughout

## Troubleshooting

- **"npm is not recognized"**: Install Node.js from nodejs.org
- **Images not showing**: Make sure images are in `Background/` and `Picasso/` folders with correct filenames
- **App won't start**: Run `npm install` first to install dependencies
- **Build fails**: Make sure you have enough disk space and are on the correct platform (Windows for Windows builds, Mac for Mac builds)
- **Executable doesn't run**: Make sure you're sharing the correct file from the `dist/` folder
- **Icons not showing**: Icon files are optional. The app will work with default Electron icons if custom icons are not provided

## Notes

- Your tasks, bones, themes, and preferences are saved automatically in the app's local storage
- The app works completely offline
- Window size and position preferences are saved and restored on restart
- To clear all data, you can delete the app's data folder (location varies by OS)
- The portable Windows executable can be run from any location without installation

---

**Happy Birthday, Shalin!**

Enjoy your personalized desktop to-do list!
