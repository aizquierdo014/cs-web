// src/client/custom-rcon-panel/cs-info-overlay.ts

(function () {
  function waitForBody(retries: number) {
    if (document.body) {
      initInfoPanel();
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => waitForBody(retries - 1), 500);
  }

  function initInfoPanel() {
    console.log("[CS-INFO] Inicializando panel de ayuda...");

    const style = document.createElement("style");
    style.textContent = `
      #csInfoToggle {
        position: fixed;
        top: 10px;
        right: 64px;
        z-index: 999998;
        width: 44px;
        height: 44px;
        padding: 0;
        font-size: 24px;
        font-weight: bold;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        background: #111827ee;
        color: #60a5fa;
        font-family: system-ui, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #csInfoToggle:hover {
        background: #1f2937;
        color: #93c5fd;
      }
      #csInfoPanel {
        position: fixed;
        top: 32px;
        right: 40px;
        background: #111827dd;
        padding: 14px;
        border-radius: 12px;
        z-index: 999999;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, sans-serif;
        width: 320px;
        font-size: 13px;
        display: none;
        border: 1px solid #374151;
        max-height: 80vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #4b5563 #111827;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      }
      
      #csInfoPanel h3 {
        margin: 0 0 10px 0;
        font-size: 15px;
        border-bottom: 1px solid #374151;
        padding-bottom: 6px;
        color: #60a5fa;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 20px; /* Espacio para la X */
      }

      /* Estilo del enlace a Discord */
      .cs-discord-link {
        font-size: 11px;
        color: #5865F2;
        text-decoration: none;
        font-weight: normal;
        background: rgba(88, 101, 242, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        transition: all 0.2s;
        margin-left: auto; 
        margin-right: 8px;
      }
      .cs-discord-link:hover {
        background: #5865F2;
        color: white;
      }

      /* Botón de Cerrar (X) */
      #csInfoCloseBtn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 2px;
      }
      #csInfoCloseBtn:hover {
        color: white;
      }

      .cs-info-section { margin-bottom: 12px; }
      .cs-info-subtitle {
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        color: #9ca3af;
        margin-bottom: 4px;
      }
      .cs-key-list {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 12px;
        align-items: center;
      }
      .cs-key {
        background: #374151;
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
        text-align: center;
        min-width: 20px;
        border-bottom: 2px solid #1f2937;
        display: inline-block;
      }
      .cs-desc { font-size: 12px; opacity: 0.9; }
      .cs-key-group { display: flex; gap: 4px; }
    `;
    document.head.appendChild(style);

    const toggle = document.createElement("button");
    toggle.id = "csInfoToggle";
    toggle.textContent = "?";
    document.body.appendChild(toggle);

    const panel = document.createElement("div");
    panel.id = "csInfoPanel";
    panel.innerHTML = `
      <button id="csInfoCloseBtn" title="Cerrar">×</button>

      <h3>
        Ayuda / Controles
        <a href="https://discord.gg/GbXyJGYSPa" target="_blank" class="cs-discord-link">Discord ⬈</a>
      </h3>

      <div class="cs-info-section">
        <div class="cs-info-subtitle">Movimiento</div>
        <div class="cs-key-list">
          <span class="cs-key">W</span> <span class="cs-desc">Avanzar</span>
          <span class="cs-key">S</span> <span class="cs-desc">Retroceder</span>
          <span class="cs-key">A</span> <span class="cs-desc">Izquierda</span>
          <span class="cs-key">D</span> <span class="cs-desc">Derecha</span>
          <span class="cs-key">SPACE</span> <span class="cs-desc">Saltar</span>
          <span class="cs-key">CTRL</span> <span class="cs-desc">Agacharse</span>
          <span class="cs-key">SHIFT</span> <span class="cs-desc">Caminar (Silencio)</span>
        </div>
      </div>

      <div class="cs-info-section">
        <div class="cs-info-subtitle">Combate</div>
        <div class="cs-key-list">
          <span class="cs-key">CLICK</span> <span class="cs-desc">Disparar</span>
          <span class="cs-key">R</span> <span class="cs-desc">Recargar</span>
          <span class="cs-key">1-5</span> <span class="cs-desc">Cambiar arma</span>
          <span class="cs-key">Q</span> <span class="cs-desc">Última arma</span>
          <span class="cs-key">G</span> <span class="cs-desc">Soltar arma</span>
        </div>
      </div>

      <div class="cs-info-section">
        <div class="cs-info-subtitle">Interacción</div>
        <div class="cs-key-list">
          <div class="cs-key-group">
            <span class="cs-key">B</span>
            <span class="cs-key">,</span>
            <span class="cs-key">.</span>
          </div>
          <span class="cs-desc">Tienda / Munición</span>
          <span class="cs-key">E</span> <span class="cs-desc">Usar / Rescatar / C4</span>
          <span class="cs-key">F</span> <span class="cs-desc">Linterna</span>
          <span class="cs-key">T</span> <span class="cs-desc">Spray</span>
          <span class="cs-key">TAB</span> <span class="cs-desc">Puntuaciones</span>
          <span class="cs-key">Y</span> <span class="cs-desc">Chat</span>
        </div>
      </div>

      <div class="cs-info-section">
        <div class="cs-info-subtitle">Sistema</div>
        <div class="cs-key-list">
          <span class="cs-key">º</span> <span class="cs-desc">Consola</span>
        </div>
      </div>

      <div style="margin-top:10px; font-size:11px; opacity:0.6; text-align:center;">
        Usa el icono ⚙ para opciones de servidor/bots.
      </div>
    `;
    document.body.appendChild(panel);

    // --- LÓGICA DE CIERRE ---
    const closeBtn = panel.querySelector("#csInfoCloseBtn") as HTMLButtonElement;
    
    // Toggle normal
    toggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que el click llegue al document
      panel.style.display = (panel.style.display === "none" || !panel.style.display) ? "block" : "none";
    });

    // Cerrar con la X
    closeBtn.addEventListener("click", () => {
        panel.style.display = "none";
    });

    // Cerrar al hacer click fuera
    document.addEventListener("click", (e) => {
        // Si el panel está abierto
        if (panel.style.display === "block") {
            const target = e.target as HTMLElement;
            // Si el click NO fue dentro del panel Y NO fue en el botón toggle
            if (!panel.contains(target) && target !== toggle) {
                panel.style.display = "none";
            }
        }
    });
  }

  waitForBody(20);
})();
