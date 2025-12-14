# 💱 QC Tax & CAD → EUR Converter (Browser Extension)

A lightweight browser extension that allows you to **convert Canadian Dollar prices (CAD) to Euro (€)**, including **Quebec taxes (TPS + TVQ)**, directly from any webpage.

Simply select a price, right-click, and instantly see:
- Price with Quebec taxes
- Live CAD → EUR conversion
- A clean, animated overlay panel

---

## ✨ Features
- Context menu integration (right-click on selected price)
- Automatic TPS (5%) + TVQ (9.975%) calculation
- Live CAD → EUR exchange rate
- Fallback exchange rate if APIs are unavailable
- Smooth animated UI panel
- No tracking, no data collection, no ads

---

## 🧠 How it works
1. Select a price on any webpage (e.g. `149.99 $`)
2. Right-click → **"Calculate taxes + €"**
3. The extension:
   - Parses the selected value
   - Adds Quebec taxes
   - Fetches the CAD → EUR rate
   - Displays the converted total in a floating panel

---

## 🧮 Taxes & Conversion
- **TPS (GST)**: 5%
- **TVQ (QST)**: 9.975%
- **Total tax rate**: 14.975%

Exchange rates are fetched from:
- `open.er-api.com`
- `exchangerate-api.com` (fallback)

If both APIs fail, a static fallback rate is used.

---

## 🔐 Privacy
This extension:
- Does **not** collect personal data
- Does **not** store browsing activity
- Uses only public exchange-rate APIs
- Runs entirely on the client side

---

## 📦 Installation (Developer mode)

### Chrome / Edge / Opera / Brave
1. Clone or download this repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder

---

### Firefox (manual test)
Firefox requires minor adjustments for Manifest V3.
Recommended mainly for Chromium-based browsers.

---

## 🛠️ Files overview
| File | Description |
|----|----|
| `manifest.json` | Extension metadata & permissions |
| `background.js` | Core logic, APIs, UI injection |
| `assets/icon.png` | Extension icon (optional) |

---

## 📜 License
MIT License – free to use, modify.

---

## 👨‍💻 Author
**Jason Vachier**  
GitHub: https://github.com/JASON-VACHIER
