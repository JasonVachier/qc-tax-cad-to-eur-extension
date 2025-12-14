// Constantes taxes Québec
const TPS = 0.05;        // 5 %
const TVQ = 0.09975;     // 9,975 %
const TAX_RATE = 1 + TPS + TVQ; // 1.14975

// 🔹 Récupérer le taux CAD -> EUR via plusieurs API
async function getCadToEurRate() {
  // API 1 : open.er-api.com
  try {
    console.log("[EXT] Appel API1 open.er-api.com");
    const res = await fetch("https://open.er-api.com/v6/latest/CAD");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    console.log("[EXT] Réponse API1:", data);

    if (data && data.rates && typeof data.rates.EUR === "number") {
      return data.rates.EUR;
    }
    throw new Error("EUR manquant dans data.rates (API1)");
  } catch (e) {
    console.error("[EXT] Erreur API1 CAD->EUR :", e);
  }

  // API 2 : exchangerate-api.com
  try {
    console.log("[EXT] Appel API2 exchangerate-api.com");
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/CAD");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    console.log("[EXT] Réponse API2:", data);

    if (data && data.rates && typeof data.rates.EUR === "number") {
      return data.rates.EUR;
    }
    throw new Error("EUR manquant dans data.rates (API2)");
  } catch (e) {
    console.error("[EXT] Erreur API2 CAD->EUR :", e);
  }

  // Fallback : valeur fixe si les API ne répondent pas
  console.warn("[EXT] Aucune API n'a répondu, utilisation d'un taux fixe ≈0.70");
  return 0.70;
}

// 🔹 Parser un texte pour en extraire un nombre
function parsePriceFromText(text) {
  if (!text) return null;

  console.log("[EXT] Texte sélectionné brut:", text);

  let cleaned = text
    .replace(/[^\d,.\-]/g, "")  // garde chiffres, ., , et -
    .replace(/\s+/g, "");

  if (cleaned.includes(",") && !cleaned.includes(".")) {
    cleaned = cleaned.replace(",", ".");
  } else if (cleaned.includes(",") && cleaned.includes(".")) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  }

  console.log("[EXT] Texte nettoyé pour parseFloat:", cleaned);

  const value = parseFloat(cleaned);
  if (isNaN(value)) {
    console.warn("[EXT] Impossible de parser le prix");
    return null;
  }
  return value;
}

// 🔹 Créer le menu contextuel au démarrage
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "calc_taxes_eur",
    title: "Calculer taxes + € sur “%s”",
    contexts: ["selection"]
  });
});

// 🔹 Quand l'utilisateur clique sur notre entrée de menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "calc_taxes_eur" || !tab || !tab.id) return;

  const selectionText = info.selectionText;
  const price = parsePriceFromText(selectionText);

  if (price === null) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (sel) => alert(`Impossible de lire un prix dans : "${sel}"`),
      args: [selectionText]
    });
    return;
  }

  const priceWithTaxes = price * TAX_RATE;
  const eurRate = await getCadToEurRate();
  const priceEur = priceWithTaxes * eurRate;

  const data = {
    price: price.toFixed(2),
    priceWithTaxes: priceWithTaxes.toFixed(2),
    eurRate: eurRate.toFixed(4),
    priceEur: priceEur.toFixed(2)
  };

  // 👉 On injecte un panneau avec CSS + animations
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (info) => {
      // Injecter le style une seule fois
      let style = document.getElementById("qc-tax-eur-style");
      if (!style) {
        style = document.createElement("style");
        style.id = "qc-tax-eur-style";
        style.textContent = `
          @keyframes qc-panel-appear {
            0% {
              opacity: 0;
              transform: translateY(14px) scale(0.96);
              filter: blur(3px);
            }
            60% {
              opacity: 1;
              transform: translateY(-2px) scale(1.02);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes qc-panel-glow {
            0% {
              box-shadow: 0 0 0 rgba(190, 75, 219, 0);
            }
            40% {
              box-shadow: 0 0 22px rgba(190, 75, 219, 0.9);
            }
            100% {
              box-shadow: 0 8px 20px rgba(0,0,0,0.45);
            }
          }

          .qc-tax-eur-panel {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: radial-gradient(circle at top left, #ff4ecd15, #1b1229 40%, #0b0b15 100%);
            color: #f5f5f5;
            padding: 14px 16px;
            border-radius: 14px;
            min-width: 260px;
            max-width: 320px;
            font-size: 13px;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(12px);
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }

          .qc-tax-eur-panel-show {
            animation: qc-panel-appear 0.35s ease-out forwards,
                       qc-panel-glow 1.1s ease-out;
          }

          .qc-tax-eur-header {
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:6px;
          }

          .qc-tax-eur-title {
            font-weight:600;
            font-size:12px;
            letter-spacing:0.12em;
            text-transform:uppercase;
            opacity:0.85;
            display:flex;
            align-items:center;
            gap:6px;
          }

          .qc-tax-eur-pill {
            font-size:10px;
            padding:2px 6px;
            border-radius:999px;
            background:linear-gradient(135deg,#ff4ecd,#7f5dff);
            color:#fff;
          }

          .qc-tax-eur-close {
            background: transparent;
            border: none;
            color: #aaa;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            padding: 0;
            margin: 0;
            transition: color 0.15s ease, transform 0.15s ease;
          }

          .qc-tax-eur-close:hover {
            color: #fff;
            transform: scale(1.1);
          }

          .qc-tax-eur-row {
            margin-bottom:6px;
          }

          .qc-tax-eur-label {
            opacity:0.7;
            font-size:11px;
          }

          .qc-tax-eur-value {
            font-size:14px;
          }

          .qc-tax-eur-footer {
            margin-top:4px;
            padding-top:6px;
            border-top: 1px solid rgba(255,255,255,0.15);
            display:flex;
            align-items:baseline;
            justify-content:space-between;
            gap:8px;
          }

          .qc-tax-eur-total-label {
            opacity:0.8;
            font-size:11px;
          }

          .qc-tax-eur-total-value {
            font-size:18px;
            font-weight:700;
            letter-spacing:0.03em;
          }

          .qc-tax-eur-tagline {
            font-size:10px;
            opacity:0.6;
            text-align:right;
          }
        `;
        document.head.appendChild(style);
      }

      const existing = document.getElementById("qc-tax-eur-panel");
      const panel = existing || document.createElement("div");

      panel.id = "qc-tax-eur-panel";
      panel.className = "qc-tax-eur-panel";
      panel.innerHTML = `
        <div class="qc-tax-eur-header">
          <div class="qc-tax-eur-title">
            <span class="qc-tax-eur-pill">QC → €</span>
            Prix converti
          </div>
          <button id="qc-tax-eur-close" class="qc-tax-eur-close">&times;</button>
        </div>
        <div class="qc-tax-eur-row">
          <div class="qc-tax-eur-label">Prix sélectionné (HT)</div>
          <div class="qc-tax-eur-value">${info.price} $ CAD</div>
        </div>
        <div class="qc-tax-eur-row">
          <div class="qc-tax-eur-label">Avec TPS + TVQ (14,975 %)</div>
          <div class="qc-tax-eur-value">${info.priceWithTaxes} $ CAD</div>
        </div>
        <div class="qc-tax-eur-row">
          <div class="qc-tax-eur-label">Taux de change</div>
          <div class="qc-tax-eur-value">1 CAD ≈ ${info.eurRate} €</div>
        </div>
        <div class="qc-tax-eur-footer">
          <div class="qc-tax-eur-total-label">Total TTC en Euro</div>
          <div style="text-align:right;">
            <div class="qc-tax-eur-total-value">${info.priceEur} €</div>
            <div class="qc-tax-eur-tagline">Opera GX tax helper</div>
          </div>
        </div>
      `;

      if (!existing) {
        document.body.appendChild(panel);
      }

      // 🔁 Rejouer l'animation à chaque nouveau calcul
      panel.classList.remove("qc-tax-eur-panel-show");
      // forcer un reflow pour réinitialiser l'animation
      void panel.offsetWidth;
      panel.classList.add("qc-tax-eur-panel-show");

      const closeBtn = document.getElementById("qc-tax-eur-close");
      if (closeBtn) {
        closeBtn.onclick = () => {
          panel.remove();
        };
      }
    },
    args: [data]
  });
});
