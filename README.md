# VapePunch 🥊💨

> "Punch your bad habits in the face."

**VapePunch** is a sleek, dark-themed web application designed to help users quit vaping through gamification, rigorous biometric tracking, and AI-powered coaching.

It transforms the intangible urge to vape into a physical interaction—a 3D digital box you "punch" to log relapses or resistance.

**Repository:** [github.com/lalomorales22/vape-punch](https://github.com/lalomorales22/vape-punch)

## 🌑 Features

### 👊 Interactive 3D Tracking
- **The Red Box (Relapse):** Represents the urge. Click to "punch" it when you slip up. It takes visible damage, squashing, flashing, and shaking to visually represent the impact of the habit.
- **The Green Box (Resist):** Represents resistance. Click to build the habit. It releases a flutter of positive particles (hearts, sparkles, muscle emojis) to reward your willpower.

### 🧬 Biometric & Habit Analysis
- **Body Status Visualization:** Animated human silhouettes track your **Hydration** (Blue) and **Fuel/Hunger** (Amber) levels in real-time. The levels fluctuate based on the thirst and hunger metrics you log.
- **Detailed Metrics:** Logs Stress, Hunger, Stomach Health, Thirst, and Sleep quality for every interaction.
- **Analytics Dashboard:**
  - **Triggers:** Compare biometric states (Stress, Hunger) during relapses vs. wins.
  - **Danger Zones:** Hourly breakdown of when you are most vulnerable during the day.
  - **Sleep Impact:** Correlate poor sleep duration with increased vaping frequency.

### 🧠 AI Coach "Punch"
- Powered by **Google Gemini API**.
- A dark-humored, no-nonsense AI coach that analyzes your specific data points.
- **Context-Aware:** It knows your history. If you vape every time you are stressed, it will call you out and suggest breathing exercises instead.
- **Habit Breaking:** Provides specific, actionable advice based on your logged patterns.

### 🖥️ Mini Mode
- Minimizes the entire application into a compact, unobtrusive widget.
- Perfect for keeping in the corner of your screen while you work, ensuring tracking is always just one click away.

## 🚀 Getting Started

### Prerequisites
- A modern web browser.
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudiocdn.com/)).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lalomorales22/vape-punch.git
   cd vape-punch
   ```

2. **Configure API Key**
   The application requires a Google Gemini API key to power the AI coach.
   *Note: Since this is a client-side application, ensure your environment provides `process.env.API_KEY` or configure the `services/geminiService.ts` file securely.*

3. **Run the Application**
   Open `index.html` in your browser.
   
   *For the best development experience, use a local server:*
   ```bash
   npx http-server .
   ```

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS (Configured for Dark Mode)
- **AI:** Google Gemini Web SDK (`@google/genai`)
- **Visualization:** Recharts (Analytics), Custom SVG Animations
- **Icons:** Lucide React
- **Persistence:** LocalStorage (Simulating a local database for privacy and offline capability)

## 📸 Usage

1. **Log an Event:** 
   - Feel an urge? **Punch Red**. 
   - Fought it off? **Punch Green**.
2. **Capture Context:** A modal appears. Use the sliders to log your current Stress, Hunger, Thirst, and Sleep levels.
3. **View Analytics:** Watch the Dashboard update. See your "Danger Zones" and biometric triggers.
4. **Talk to Coach:** Chat with the AI. It reads your logs and gives you tough love and strategy.

## 📄 License

[MIT](LICENSE)
