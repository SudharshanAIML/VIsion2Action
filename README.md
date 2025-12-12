<div align="center">
  <img width="1200" height="475" alt="Vision2Action Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 👁️ VISION2ACTION
  
  **AI-Powered Visual Navigation Assistant for the Visually Impaired**
  
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
  
  [Demo](#demo) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [API Reference](#-api-reference)
</div>

---

## 📖 Overview

**Vision2Action** is a real-time AI-powered visual assistant designed to help blind and visually impaired users navigate their environment safely. Using the device camera and Google's Gemini 2.5 Flash AI model, it provides:

- 🛑 **Hazard Detection** – Immediate warnings for vehicles, stairs, obstacles, and edges
- 📍 **Micro-Navigation** – Step-by-step walking instructions with distance estimates
- 🎙️ **Voice Interaction** – Natural language Q&A about the surroundings
- 🏷️ **Location Memory** – Tag and remember important locations

---

## ✨ Features

### 🔴 Safety Guardian (Priority #1)
Real-time detection and urgent voice warnings for:
- Approaching vehicles
- Staircases (ascending/descending)
- Edges, drops, and wet floors
- Low-hanging obstacles

### 🧭 Precision Navigation
- Executable walking instructions ("Walk forward 2 meters")
- Turn-by-turn guidance with degree estimates
- Path clearance information

### 🎤 Voice Assistant
- Long-press to ask questions about the scene
- Natural language responses
- Speech synthesis with clear, adjustable voice

### 🏷️ Memory Tags
- Voice-tag locations ("Remember this is my chair")
- Get alerts when returning to tagged locations
- Persistent storage across sessions

### ♿ Accessibility First
- High contrast UI design
- Full screen reader compatibility
- Haptic feedback (vibration patterns)
- Audio earcons for status changes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Gemini 2.5 Flash** | Vision AI Model |
| **Web Speech API** | Voice Recognition & TTS |
| **MediaDevices API** | Camera Access |
| **DeviceMotion API** | Movement Detection |
| **LocalStorage** | Persistent Memory Tags |

---

## 🚀 Installation

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn**
- **Gemini API Key** from [Google AI Studio](https://ai.google.dev/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/Vision2Action.git
cd Vision2Action

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Add your Gemini API key to .env.local
# API_KEY=your_gemini_api_key_here

# 5. Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📱 Usage

### Getting Started
1. **Open the app** on your mobile device (works best on smartphones)
2. **Grant permissions** for camera and microphone access
3. **Tap anywhere** on the home screen to start navigation mode

### Navigation Mode
| Action | Result |
|--------|--------|
| **Point camera** | Receive continuous navigation guidance |
| **Long press + speak** | Ask a question about what you see |
| **Say "Remember..."** | Tag current location for future reference |

### Voice Commands
- *"What's in front of me?"*
- *"Is there a door nearby?"*
- *"Remember this is my desk"*
- *"Mark this as the exit"*

---

## 🏗️ Architecture

```
Vision2Action/
├── App.tsx                    # Root component with routing
├── index.tsx                  # Entry point
├── types.ts                   # TypeScript interfaces
│
├── pages/
│   ├── HomeScreen.tsx         # Welcome screen
│   └── ContinuousScreen.tsx   # Main navigation interface
│
├── components/
│   ├── CameraView.tsx         # Camera capture component
│   └── BigButton.tsx          # Accessible button component
│
└── services/
    ├── geminiService.ts       # Gemini AI integration
    ├── accessibilityService.ts # TTS, vibration, earcons
    ├── memoryService.ts       # Location tagging system
    └── sensorService.ts       # Motion & orientation tracking
```

### Data Flow

```
Camera Frame → Base64 Encode → Gemini API → AI Analysis → Speech Output
                                   ↑
                          Sensor Data + Memory Tags
```

---

## 🔌 API Reference

### Gemini Service

```typescript
// Analyze image for navigation guidance
analyzeImage(base64Image: string, tags: MemoryTag[], sensors?: SensorData): Promise<string>

// Ask a question about the current scene
askAboutImage(base64Image: string, question: string): Promise<string>
```

### Accessibility Service

```typescript
speak(text: string, onEnd?: () => void): void    // Text-to-speech
vibrate(pattern: number | number[]): void         // Haptic feedback
playEarcon(type: 'listen' | 'stop' | 'processing'): void  // Audio cues
```

### Memory Service

```typescript
getTags(): MemoryTag[]                            // Get all saved tags
addTag(description: string): { success, message } // Add new tag
clearTags(): void                                 // Remove all tags
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` | Google Gemini API key | ✅ Yes |

### AI System Prompt
The navigation AI is configured with strict priority ordering:
1. **Safety warnings** (highest priority)
2. **Navigation instructions**
3. **Object affordances** (utility descriptions)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the powerful vision AI model
- [Lucide Icons](https://lucide.dev/) for the beautiful icon set
- The accessibility community for invaluable feedback

---

<div align="center">
  <strong>Built with ❤️ for accessibility</strong>
  <br><br>
  <a href="https://ai.studio/apps/drive/1h56I7AWBnWEfj1e4vZ2qLZMK17Q5J8nx">View Demo in AI Studio</a>
</div>
