# 🎮 Shelved

> **Too many games, not enough time.** Let RNG pick your next Steam game and eliminate backlog decision paralysis.

---

## 🌟 Overview

Digital distribution platforms such as Steam, Epic, Origin, and GOG have transformed how players acquire video games. With frequent seasonal sales, bundles, and deep discounts, players quickly accumulate hundreds of games that far exceed the time available to play them.

When confronted with too many choices at once, gamers often experience **decision paralysis**—a psychological phenomenon linked to choice overload and opportunity cost. Instead of enjoying leisure time, players spend minutes or hours scrolling through endless libraries.

**Shelved** solves this by providing an intelligent, interactive RNG game picker and library manager tailored to your current session length, mood, backlog bias, or group play.

---

## ✨ Features

- 🎰 **Slot-Machine Spin Animation**: Visual roulette spin shuffle animation when rolling games.
- 🔊 **Web Audio Sound Effects**: Zero-dependency Web Audio ticks during roulette spins and a victory chime on roll landing (with Sound ON / Muted toggle).
- 🔗 **"Share Roll" Social Link**: Copy formatted recommendation summaries and links to clipboard for Discord & social sharing.
- 💻 **Multi-Platform & Steam Deck Badges**: Native platform compatibility tags (**WIN**, **MAC**, **LINUX**, **DECK**) displayed on every game card.
- 🏆 **Achievement Completion Badges**: Displays achievement completion % for games in progress.
- 🔑 **Steam OpenID 2.0 SSO**: Secure 1-click authentication via official Steam OpenID 2.0 protocol.
- 👥 **Multi-Steam ID Comparison**: Input a friend's Steam ID to find and pick mutually owned Co-Op games.
- 📚 **Full Library Browse & Grid View**: Switch between RNG Picker mode and a responsive Library Grid with live search and sorting (*Most Played*, *Unplayed*, *Name A-Z*, *Recently Played*).
- ⏱️ **Time Available Filter**: Filter games based on quick 30-minute sessions, 2-hour slots, or all-evening playthroughs.
- ✨ **Accurate Mood & Genre Classifier**: Categorizes games into *Chill*, *Intense*, *Story*, *Quick*, and *Co-Op* using a curated Steam franchise database.
- 🚫 **Exclusion Filters**: Filter out unwanted game categories (*No Horror*, *No VR-Only*).
- 📊 **Backlog Weight Slider**: Adjust 0% to 100% probability bias towards unplayed games without strictly locking out played favorites.
- 🔥 **Shame Mode**: Instantly isolate 100% unplayed games (`0` hours played) to tackle your backlog.
- ⌨️ **Keyboard Shortcuts**: `Space` or `R` to roll, `S` to skip current recommendation, `Esc` to reset filters.
- 🚫 **Session Skip Memory**: Skips rejected games for the active session so the RNG never repeats a game you just passed on.
- 🔒 **Private Profile Detection**: Automatic detection and step-by-step guidance for private Steam game details.
- ⚡ **1-Hour Server & HTTP Caching**: Built-in 1-hour Next.js revalidation & HTTP `Cache-Control` headers for fast response times.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
- **UI / Styling**: React 19 + Glassmorphic Dark Vanilla CSS
- **Audio Engine**: Web Audio API (Zero external assets)
- **Testing**: [Vitest](https://vitest.dev/)
- **Authentication**: Steam OpenID 2.0 Protocol
- **Data Source**: Steam Web API (`IPlayerService/GetOwnedGames`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Steam Web API Key (Get one at [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/klebka/Shelved.git
   cd Shelved
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   STEAM_API_KEY=your_steam_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Build

Run the test suite powered by Vitest:
```bash
npm test
```

Build for production:
```bash
npm run build
```

---

## 📜 License

Created by **klebka**. Distributed under the MIT License.