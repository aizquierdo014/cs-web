(function () {
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
      #csAdminPanel {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #111827dd;
        padding: 14px;
        border-radius: 12px;
        z-index: 999999;
        color: #e5e7eb;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        width: 260px;
        font-size: 13px;
      }
      #csAdminPanel h4 {
        margin: 0 0 6px 0;
        font-size: 14px;
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
      #csAdminPanel input {
        width: 100%;
        margin-top: 4px;
        padding: 4px 6px;
        border-radius: 6px;
        border: 1px solid #4b5563;
        background: #020617;
        color: #e5e7eb;
      }
      #csAdminPanel small {
        display: block;
        margin-top: 4px;
        opacity: 0.7;
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
    `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.id = "csAdminPanel";
    panel.innerHTML = `
      <h4>Panel Admin CS</h4>

      <div class="cs-admin-section">
        <strong>Test</strong>
        <button id="csAdminSayTest">say test (sin rcon)</button>
      </div>

      <div class="cs-admin-section">
        <strong>Mapas (via rcon)</strong>
        <button data-cmd="changelevel fy_pool_day">fy_pool_day</button>
        <button data-cmd="changelevel de_dust2">de_dust2</button>
        <button data-cmd="changelevel de_inferno">de_inferno</button>
      </div>

      <div class="cs-admin-section">
        <strong>Bots (via rcon)</strong>
        <button data-cmd="bot_add">Añadir bot</button>
        <button data-cmd="bot_kick">Kick bot</button>
        <button data-cmd="bot_kill">Matar bots</button>
      </div>

      <div class="cs-admin-section">
        <strong>Servidor (via rcon)</strong>
        <button data-cmd="status">Status</button>
        <button data-cmd="sv_restart 1">Restart (1s)</button>
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
        <small>Pulsa números, luego "Enviar". Se manda como <code>rcon_password &lt;clave&gt;</code></small>
      </div>

      <div class="cs-admin-section">
        <strong>Comando libre (via rcon)</strong>
        <input id="csAdminCustomCmd" placeholder="ej: say hola a todos">
        <button id="csAdminSendCustom">Enviar</button>
        <small>Se envía como <code>rcon &lt;comando&gt;</code></small>
      </div>
    `;
    document.body.appendChild(panel);

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

    // Test sin rcon: debería escribir en el chat del juego
    const sayTestBtn = panel.querySelector("#csAdminSayTest") as HTMLButtonElement | null;
    if (sayTestBtn) {
      sayTestBtn.addEventListener("click", () => {
        execRaw('say [overlay test] hola desde el panel');
      });
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

    // ---- Botones predefinidos via rcon ----
    panel.querySelectorAll("button[data-cmd]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const base = (btn as HTMLButtonElement).getAttribute("data-cmd");
        if (!base) return;
        execRcon(base);
      });
    });

    // ---- Comando libre via rcon ----
    const input = panel.querySelector("#csAdminCustomCmd") as HTMLInputElement | null;
    const sendBtn = panel.querySelector("#csAdminSendCustom") as HTMLButtonElement | null;
    if (input && sendBtn) {
      sendBtn.addEventListener("click", () => {
        const val = (input.value || "").trim();
        if (!val) return;
        execRcon(val);
        input.value = "";
      });
    }
  }

  waitForEngine(40);
})();
