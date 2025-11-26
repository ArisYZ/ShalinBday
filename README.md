# Shalin's Birthday To-Do List 🎉

A beautiful, personalized desktop to-do list application created as a birthday gift!

## Features

- ✨ Beautiful gradient design with modern UI
- 🖼️ Image gallery on the left (supports static images and GIFs)
- ✅ Full-featured to-do list with add, complete, and delete functionality
- 🔍 Filter tasks by All, Active, or Completed
- 💾 Automatic local storage - your tasks are saved automatically
- 🖥️ Standalone desktop application - no browser needed!
- 📱 Responsive design that works on all screen sizes

## Installation & Setup

### First Time Setup

1. **Install Node.js** (if you don't have it):
   - Download from [nodejs.org](https://nodejs.org/)
   - Install the LTS version
   - This is required to run the desktop application

2. **Install dependencies**:
   - Open a terminal/command prompt in this folder
   - Run: `npm install`
   - This will install Electron and other required packages

### Running the Application

**Option 1: Development Mode** (for testing)
```bash
npm start
```

**Option 2: Create a Standalone Executable** (for distribution)
```bash
# For Windows
npm run build-win

# For Mac
npm run build-mac

# For Linux
npm run build-linux
```

After building, you'll find the executable in the `dist/` folder. You can distribute this folder - no installation needed!

### Image Setup

The app automatically looks for images in:
- `Background/shalin_room.png` (background image - displayed as the base)
- `Background/Bone.png` (bone reward image)
- `Picasso/picassoIdle.gif` (overlay GIF - displayed on top of the background)
- `Picasso/picassoAnim.gif` (animation GIF - plays when bone is given)

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
   - Run `npm start` to launch the app
   - Or use the built executable from the `dist/` folder

2. **Use the to-do list**:
   - Type a task in the input box and click "Add Task" or press Enter
   - Click the checkbox to mark tasks as completed
   - **Earn bones**: Each time you complete a task, you earn 1 bone! 🦴
   - Click "Delete" to remove a task
   - Use the filter buttons to view All, Active, or Completed tasks
   - Click "Clear Completed" to remove all completed tasks at once

3. **View the composite image**:
   - The background image from `Background/shalin_room.png` is displayed
   - The `picassoIdle.gif` is overlaid on top at the position specified in `config.js`

4. **Use your bones**:
   - Bones appear in the inventory below the image
   - **Drag a bone** from the inventory and **drop it on the picassoIdle.gif**
   - The GIF will switch to `picassoAnim.gif` and play the animation once
   - After the animation completes, it automatically switches back to `picassoIdle.gif`
   - The bone is consumed after use

## File Structure

```
ShalinBday/
├── index.html          # Main HTML file
├── styles.css          # Styling and layout
├── script.js           # Application logic
├── config.js           # Overlay position configuration
├── main.js             # Electron main process
├── package.json        # Node.js dependencies
├── Background/         # Background image folder
│   ├── shalin_room.png
│   └── Bone.png
├── Picasso/            # GIF images folder
│   ├── picassoAnim.gif (animation - plays when bone is given)
│   └── picassoIdle.gif (overlay - default state)
└── README.md          # This file
```

## Building for Distribution

To create a standalone application that can be shared:

1. **Build the application**:
   ```bash
   npm run build-win    # Creates Windows installer and portable exe
   ```

2. **Find your executable**:
   - Windows: Check the `dist/` folder for `.exe` files
   - The portable version doesn't require installation - just run it!

3. **Share the application**:
   - You can share the entire `dist/` folder
   - Or just the portable executable (no installation needed)

## Technical Details

- **Built with Electron** - Cross-platform desktop app framework
- **HTML/CSS/JavaScript** - Modern web technologies
- **Local Storage** - All tasks saved automatically
- **No Internet Required** - Works completely offline
- **Cross-Platform** - Works on Windows, Mac, and Linux

## Customization

You can customize the colors and styling by editing `styles.css`. The main gradient colors are defined in the `body` and button styles.

## Troubleshooting

- **"npm is not recognized"**: Install Node.js from nodejs.org
- **Images not showing**: Make sure images are in `Background/` and `Picasso/` folders
- **App won't start**: Run `npm install` first to install dependencies

## Notes

- Your tasks are saved automatically in the app's local storage
- The app works completely offline
- To clear all data, you can delete the app's data folder (location varies by OS)

---

**Happy Birthday, Shalin! 🎂🎈🎉**

Enjoy your personalized desktop to-do list!
