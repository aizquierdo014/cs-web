(function () {
  type MapInfo = {
    name: string;
    label: string;
    imageUrl: string;
  };

  // Lista de mapas para el carrusel
  const MAPS: MapInfo[] = [
    {
      name: "fy_pool_day",
      label: "fy_pool_day",
      imageUrl: "/map-previews/fy_pool_day.jpg",
    },
    {
      name: "de_dust2",
      label: "de_dust2",
      imageUrl: "/map-previews/de_dust2.jpg",
    },
    {
      name: "de_inferno",
      label: "de_inferno",
      imageUrl: "/map-previews/de_inferno.jpg",
    },
  ];

  function waitForEngine(retries: number) {
    const anyWindow = window as any;
    if (anyWindow.xash) {
      initPanel(anyWindow.xash);
      return;
    }
    if (retries <= 0) return;
    setTimeout(() => waitForEngine(retries - 1), 500);
  }

  function initPanel(engine: any) {
    console.log("[CS-ADMIN] Engine hook OK:", engine);

    const style = document.createElement("style");
    style.textContent = `
      #csAdminToggle {
        position: fixed;
        top: 6px;
        right: 6px;
        z-index: 999998;
        width: 22px;
        height: 22px;
        padding: 0;
        font-size: 13px;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        background: #111827ee;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #csAdminToggle:hover {
        background: #1f2937;
      }
      #csAdminPanel {
        position: fixed;
        top: 32px;
        right: 10px;
        background: #111827dd;
        padding: 14px;
        border-radius: 12px;
        z-index: 999999;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        width: 260px;
        font-size: 13px;
        display: none; /* empieza oculto */
      }
      #csAdminPanelHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      #csAdminPanelHeaderTitle {
        font-size: 14px;
        font-weight: 600;
      }
      #csAdminPanel button {
        width: 100%;
        margin-top: 4px;
        padding: 6px;
        border: none;
        background: #1f2937;
        color: white;
        border-radius: 6px;
        cursor: pointer;
      }
      #csAdminPanel button:hover {
        background: #374151;
      }
      #csAdminPanel .cs-admin-section {
        margin-top: 6px;
      }
      #csAdminPanel .csAdminPwdDigit {
        width: calc(25% - 3px);
        margin-top: 4px;
        padding: 4px;
        font-size: 12px;
      }
      #csAdminMapCarousel {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
      }
      #csAdminMapCarousel button {
        width: 32px;
        padding: 4px;
        font-size: 16px;
      }
      #csAdminMapCard {
        flex: 1;
        background: #020617;
        border-radius: 8px;
        padding: 6px;
        border: 1px solid #4b5563;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      #csAdminMapImageWrapper {
        width: 100%;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        background: #030712;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: #9ca3af;
      }
      #csAdminMapImageWrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      #csAdminMapName {
        font-size: 12px;
        font-weight: 500;
        text-align: center;
      }
    `;
    document.head.appendChild(style);

    // Botón mini: solo un engranaje
    const toggle = document.createElement("button");
    toggle.id = "csAdminToggle";
    toggle.textContent = "⚙";
    document.body.appendChild(toggle);

    const panel = document.createElement("div");
    panel.id = "csAdminPanel";
    panel.innerHTML = `
      <div id="csAdminPanelHeader">
        <span id="csAdminPanelHeaderTitle">Panel Admin CS</span>
      </div>

      <div class="cs-admin-section" id="csAdminPwdSection">
        <strong>Password RCON</strong>
        <div id="csAdminPwdDisplay" style="margin-top:4px;padding:4px 6px;border-radius:6px;background:#020617;border:1px solid #4b5563;font-family:monospace;">
          (vacío)
        </div>
        <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">
          <button type="button" class="csAdminPwdDigit" data-digit="1">1</button>
          <button type="button" class="csAdminPwdDigit" data-digit="2">2</button>
          <button type="button" class="csAdminPwdDigit" data-digit="3">3</button>
          <button type="button" class="csAdminPwdDigit" data-digit="4">4</button>
          <button type="button" class="csAdminPwdDigit" data-digit="5">5</button>
          <button type="button" class="csAdminPwdDigit" data-digit="6">6</button>
          <button type="button" class="csAdminPwdDigit" data-digit="7">7</button>
          <button type="button" class="csAdminPwdDigit" data-digit="8">8</button>
          <button type="button" class="csAdminPwdDigit" data-digit="9">9</button>
          <button type="button" class="csAdminPwdDigit" data-digit="0">0</button>
        </div>
        <div style="margin-top:4px;display:flex;gap:4px;">
          <button type="button" id="csAdminPwdClear">Borrar</button>
          <button type="button" id="csAdminPwdSend">Enviar</button>
        </div>
      </div>

      <div class="cs-admin-section">
        <strong>Mapas (via rcon)</strong>
        <div id="csAdminMapCarousel">
          <button type="button" id="csAdminMapPrev">‹</button>
          <div id="csAdminMapCard">
            <div id="csAdminMapImageWrapper">
              <span>Sin preview</span>
            </div>
            <div id="csAdminMapName">-</div>
          </div>
          <button type="button" id="csAdminMapNext">›</button>
        </div>
      </div>

      <div class="cs-admin-section">
        <strong>Bots (via rcon)</strong>
        <button data-cmd="bot_add">Añadir bot</button>
        <button data-cmd="bot_kick">Kick bot</button>
        <button data-cmd="bot_kill">Matar bots</button>
      </div>

      <div class="cs-admin-section">
        <strong>Servidor (via rcon)</strong>
        <button data-cmd="sv_restart 1">Restart (1s)</button>
      </div>

      <div class="cs-admin-section">
        <strong>Cliente</strong>
        <button id="csAdminGuiToggle" data-state="on">GUI: ON</button>
      </div>
    `;
    document.body.appendChild(panel);

    function showPanel() {
      panel.style.display = "block";
    }

    function hidePanel() {
      panel.style.display = "none";
    }

    toggle.addEventListener("click", () => {
      if (panel.style.display === "none" || !panel.style.display) {
        showPanel();
      } else {
        hidePanel();
      }
    });

    function execRaw(cmd: string) {
      console.log("[CS-ADMIN] Exec RAW:", cmd);
      if (typeof engine.Cmd_ExecuteString === "function") {
        engine.Cmd_ExecuteString(cmd);
      } else if (engine.em && engine.Module && typeof engine.Module.ccall === "function") {
        engine.Module.ccall("Cmd_ExecuteString", null, ["string"], [cmd]);
      } else {
        console.warn("[CS-ADMIN] No sé cómo ejecutar comandos en este build");
      }
    }

    function execRcon(cmd: string) {
      execRaw("rcon " + cmd);
    }

    // ---- Bloque PASSWORD ----
    let passwordBuffer = "";
    const pwdSection = panel.querySelector("#csAdminPwdSection") as HTMLDivElement | null;
    const pwdDisplay = panel.querySelector("#csAdminPwdDisplay") as HTMLDivElement | null;
    const pwdDigits = panel.querySelectorAll(".csAdminPwdDigit") as NodeListOf<HTMLButtonElement>;
    const pwdClear = panel.querySelector("#csAdminPwdClear") as HTMLButtonElement | null;
    const pwdSend = panel.querySelector("#csAdminPwdSend") as HTMLButtonElement | null;

    function updatePwdDisplay() {
      if (!pwdDisplay) return;
      pwdDisplay.textContent = passwordBuffer.length ? passwordBuffer : "(vacío)";
    }

    pwdDigits.forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = btn.getAttribute("data-digit");
        if (!d) return;
        passwordBuffer += d;
        updatePwdDisplay();
      });
    });

    if (pwdClear) {
      pwdClear.addEventListener("click", () => {
        passwordBuffer = "";
        updatePwdDisplay();
      });
    }

    if (pwdSend) {
      pwdSend.addEventListener("click", () => {
        const val = passwordBuffer.trim();
        if (!val) return;
        execRaw(`rcon_password ${val}`);
        console.log("[CS-ADMIN] rcon_password enviado:", val);
        if (pwdSection) {
          pwdSection.style.display = "none";
        }
      });
    }

    updatePwdDisplay();

    // ---- Carrusel de mapas ----
    let currentMapIndex = 0;
    const mapPrev = panel.querySelector("#csAdminMapPrev") as HTMLButtonElement | null;
    const mapNext = panel.querySelector("#csAdminMapNext") as HTMLButtonElement | null;
    const mapCard = panel.querySelector("#csAdminMapCard") as HTMLDivElement | null;
    const mapImageWrapper = panel.querySelector("#csAdminMapImageWrapper") as HTMLDivElement | null;
    const mapName = panel.querySelector("#csAdminMapName") as HTMLDivElement | null;

    function renderCurrentMap() {
      if (!mapImageWrapper || !mapName) return;
      const map = MAPS[currentMapIndex];
      mapName.textContent = map.label;

      // limpiar wrapper
      mapImageWrapper.innerHTML = "";

      if (map.imageUrl) {
        const img = document.createElement("img");
        img.src = map.imageUrl;
        img.alt = map.label;
        img.onerror = () => {
          mapImageWrapper.innerHTML = "<span>Sin preview</span>";
        };
        mapImageWrapper.appendChild(img);
      } else {
        mapImageWrapper.innerHTML = "<span>Sin preview</span>";
      }
    }

    if (MAPS.length > 0) {
      renderCurrentMap();
    }

    if (mapPrev) {
      mapPrev.addEventListener("click", () => {
        if (MAPS.length === 0) return;
        currentMapIndex = (currentMapIndex - 1 + MAPS.length) % MAPS.length;
        renderCurrentMap();
      });
    }

    if (mapNext) {
      mapNext.addEventListener("click", () => {
        if (MAPS.length === 0) return;
        currentMapIndex = (currentMapIndex + 1) % MAPS.length;
        renderCurrentMap();
      });
    }

    if (mapCard) {
      mapCard.addEventListener("click", () => {
        if (MAPS.length === 0) return;
        const map = MAPS[currentMapIndex];
        execRcon(`changelevel ${map.name}`);
      });
    }

    // ---- Botones Bots via rcon ----
    panel.querySelectorAll("button[data-cmd]").forEach((btn) => {
      // los de mapas los gestionamos arriba, así que filtramos:
      const base = (btn as HTMLButtonElement).getAttribute("data-cmd");
      if (!base || base.startsWith("changelevel")) return;

      btn.addEventListener("click", () => {
        const cmd = (btn as HTMLButtonElement).getAttribute("data-cmd");
        if (!cmd) return;
        execRcon(cmd);
      });
    });

    // ---- Cliente: GUI ON/OFF (sin rcon) ----
    const guiToggle = panel.querySelector("#csAdminGuiToggle") as HTMLButtonElement | null;
    if (guiToggle) {
      guiToggle.addEventListener("click", () => {
        const current = guiToggle.getAttribute("data-state") || "on";
        if (current === "on") {
          execRaw('setinfo "_vgui_menus" "0"');
          guiToggle.setAttribute("data-state", "off");
          guiToggle.textContent = "GUI: OFF";
        } else {
          execRaw('setinfo "_vgui_menus" "1"');
          guiToggle.setAttribute("data-state", "on");
          guiToggle.textContent = "GUI: ON";
        }
      });
    }
  }

  waitForEngine(40);
})();
