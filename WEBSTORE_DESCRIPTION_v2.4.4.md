# De-Slop v2.4.4 - Chrome Web Store Description

## Short Description (132 characters max)
Automatically detect and remove AI-generated "slop" content from web pages. 600+ patterns, customizable sensitivity, LinkedIn fixer.

## Detailed Description

**De-Slop** is a Chrome extension that automatically detects and removes AI-generated "slop" content from web pages using advanced pattern matching.

### 🎯 What's New in v2.4.4

**Detection Only Mode**
- NEW toggle to highlight slop instead of removing it
- Red borders with pulsing animation
- Hover tooltips show which patterns triggered (up to 8)
- Perfect for debugging or seeing what would be blocked

**Massively Expanded Emoji Detection (21 → 166 patterns)**
- 80+ emoji + buzzword combinations (🚀 Launching, 💡 Innovating)
- 35+ specific cringe patterns (👇 link below, 🔥 hot take, 💯 perfect)
- Emoji formatting abuse (chains, walls, bullet points)
- Call-to-action spam (Click 👉, Share 📣)

**Simplified UI**
- Removed confusing tier toggles
- Sensitivity slider directly controls which tiers activate
- Collapsible sections for cleaner interface

### ✨ Core Features

**Three-Tier Detection System (600+ patterns)**
- **Tier 1**: AI-specific phrases (3 points) - "delve into", "navigate the landscape"
- **Tier 2**: Corporate buzzwords (2 points) - "synergy", "leverage", "thought leadership"
- **Tier 3**: Marketing spam (1 point) - "guaranteed", "amazing", "limited time offer"

**Configurable Sensitivity (1-5)**
- Level 1-2: Conservative (Tier 1 only - obvious AI)
- Level 3: Balanced (Tiers 1+2 - AI + Corporate) **[DEFAULT]**
- Level 4: Aggressive (All tiers - includes marketing)
- Level 5: Nuclear (maximum detection)

**Interactive Tools**
- **Slop Checker** - Paste text to see what gets flagged, with explanations
- **Slop Machine** - Gamified learning tool with 90+ slop/better alternatives
- **Pattern Customization** - Add your own patterns with custom weights

**LinkedIn Fixer**
- Block auto-play videos
- Block ad tracking
- True black darker mode

**Advanced Detection**
- 166 emoji spam patterns
- Stop-word filtering ("I'm excited to announce")
- Em dash detector (AI loves em dashes)
- Real-time dynamic content scanning

### 🔒 Privacy First

- ✓ Runs entirely locally - no data sent to servers
- ✓ No analytics or tracking
- ✓ No external API calls
- ✓ Open source

### 📊 Platform Support

Works on all websites, with optimized detection for:
- LinkedIn (.feed-shared-update-v2)
- Twitter/X ([data-testid="tweet"])
- Medium (article, .postArticle)
- All sites (generic selectors)

### 🎮 How to Use

1. Install and click the extension icon
2. Toggle on/off, adjust sensitivity slider (1-5)
3. See badge counter for blocked slop on current page
4. Click "IS MY POST SLOP?" to check your own content
5. Click "SLOP MACHINE" to learn better alternatives
6. Click "CUSTOMIZE PATTERNS" to add your own detection rules

### 📝 Detection Examples

**Tier 1 (AI Slop)**
- "delve into", "tapestry of", "realm of possibilities"
- "In today's rapidly evolving landscape..."
- "Furthermore", "Moreover", "Additionally" (excessive transitions)
- "Top 10 ways to...", "Ultimate guide to..."

**Tier 2 (Corporate Buzzwords)**
- "synergy", "leverage", "circle back", "low-hanging fruit"
- "thought leadership", "value proposition", "game-changer"
- "AI-powered", "blockchain-enabled", "digital transformation"

**Tier 3 (Marketing Spam)**
- "free", "guaranteed", "limited time", "buy now"
- "amazing", "incredible", "revolutionary"
- "basically", "essentially", "actually"

**Emoji Slop (166 patterns)**
- 🚀 Revolutionizing, 💡 Innovating, 🔥 Disrupting
- 👇 link below, 👉 click here, 💯 100% perfect
- Multiple emojis (🔥🔥🔥), emoji chains, bullet emojis

### 🛠️ Technical Details

- 600+ detection patterns across 3 tiers
- Weighted scoring system (1-5 points per match)
- Configurable thresholds per sensitivity level
- Real-time MutationObserver for dynamic content
- Chrome sync storage for settings
- Manifest V3 compliant

### ⚙️ Permissions

- `storage` - Save your settings
- `activeTab` - Access current page content
- `declarativeNetRequest` - Block LinkedIn ads (optional)
- `<all_urls>` - Scan any page for slop

### 📚 Resources

- GitHub: https://github.com/HxHippy/DeSlop
- License: GNU GPL-3.0
- Made by Kief Studio (https://kief.studio)
- Developed by HxHippy

### ⚠️ Known Limitations

- Pattern-based detection may have false positives
- Very short content (<100 chars) skipped
- If your entire LinkedIn feed disappears - lower sensitivity!

---

**Version 2.4.4** - Detection Only Mode & Emoji Expansion Release
