# ✨ Focus Flow • Meditative Productivity

A beautiful, calming productivity application designed to help you achieve deep focus while maintaining mental well-being.

![Focus Flow](https://img.shields.io/badge/version-1.0.0-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### 🎯 Pomodoro Timer
- **Deep Focus Mode**: 25-minute focused work sessions
- **Short Break**: 5-minute rest periods
- **Long Break**: 15-minute extended breaks
- Beautiful circular progress indicator
- Customizable session lengths
- Audio notifications when sessions complete

### 🎵 Ambient Soundscapes
Layer different ambient sounds to create your perfect focus environment:
- 🌧️ Rain
- 🌲 Forest
- 🌊 Waves
- ☕ Café ambience
- 💨 Wind
- 🔥 Fireplace
- 🐦 Birds
- 📻 White Noise

**Quick Presets:**
- Deep Work
- Relaxation
- Nature
- Coffee Shop

### 🫁 Breathing Exercises
Center yourself before or after focused work with guided breathing exercises:
- **Box Breathing** (4-4-4-4): Balanced technique for focus
- **4-7-8 Relaxation**: Calming technique for stress relief
- **Energizing**: Quick energy boost
- **Calming** (5-5-5-5): Extended relaxation

### ✅ Task Management
- Add tasks you want to focus on during each session
- Check off completed tasks
- Visual progress tracking
- Achievements for task completion

### 📊 Progress Tracking
Comprehensive statistics to track your productivity journey:
- Total focus time
- Sessions completed
- Current day streak
- Today's sessions
- Weekly activity chart
- Achievement system

### 🏆 Achievements
Unlock achievements as you build healthy productivity habits:
- First Session
- Five Sessions
- Ten Sessions
- Hour of Focus
- Five Hours of Focus
- Week Streak
- Task Master

### 🎨 Beautiful Design
- Dark mode interface optimized for focus
- Animated particle background
- Smooth transitions and animations
- Responsive design for all devices
- Glassmorphism UI elements

## 🚀 Getting Started

### Installation
No installation required! Simply open `index.html` in any modern web browser.

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 support

## 💡 Usage Tips

1. **Start Your Session**: Select a timer mode and click "Begin Flow"
2. **Add a Task**: Write down what you'll focus on during this session
3. **Set the Mood**: Adjust ambient sound volumes or use a preset
4. **Stay Focused**: Work until the timer completes
5. **Take Breaks**: Use short and long breaks to rest
6. **Breathe**: Use the breathing exercise to center yourself
7. **Track Progress**: Check your stats to see your improvement

## 🎹 Keyboard Shortcuts

- `Enter`: Add task (when input is focused)
- `Space`: Start/Pause timer (when timer section is active)

## 📁 File Structure

```
focus-flow/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── app.js          # Application logic
└── README.md       # This file
```

## 🔧 Technical Details

- **Pure Vanilla JavaScript**: No frameworks or dependencies
- **CSS Variables**: Easy theme customization
- **LocalStorage**: Persistent data storage
- **Canvas API**: Animated particle background
- **Web Audio API**: Audio notifications
- **Responsive Design**: Mobile-friendly layout

## 🎨 Customization

You can easily customize the color scheme by editing the CSS variables in `styles.css`:

```css
:root {
    --color-accent-primary: #6366f1;  /* Main accent color */
    --color-accent-secondary: #8b5cf6; /* Secondary accent */
    --color-bg-primary: #0a0e14;      /* Background color */
    /* ... more variables */
}
```

## 📝 Data Storage

All your data is stored locally in your browser using localStorage:
- Focus session statistics
- Completed tasks
- Unlocked achievements
- Sound preferences
- Timer settings

To reset all data, go to the Progress tab and click "Reset All Data".

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Custom timer durations
- More ambient sounds
- Additional breathing patterns
- Export/import data functionality
- Themes/color schemes

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Inspired by:
- Pomodoro Technique® 
- Mindfulness meditation practices
- Modern productivity research

---

**Made with ❤️ for better focus and well-being**

*Remember: Productivity isn't about doing more—it's about doing what matters with full presence.*
