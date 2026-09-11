/**
 * GLITCH BOT - MOTOR DE JUEGO Y CONTROLADOR DE INTERFAZ
 * Creado con JavaScript Moderno y Web Audio API
 */

// ==========================================
// 1. SISTEMA DE AUDIO SINTETIZADO (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playStep() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playKey() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  playInteract() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playEmp() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playWin() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. CONFIGURACIÓN DEL MAPA Y ESTADO INICIAL
// ==========================================
const GRID_SIZE = 6;

// Matriz inicial fiel a la captura de pantalla
const INITIAL_MAP = [
  // Fila 0
  [{ type: 'dot' }, { type: 'dot' }, { type: 'target' }, { type: 'dot' }, { type: 'energy' }, { type: 'portal' }],
  // Fila 1
  [{ type: 'dot' }, { type: 'empty' }, { type: 'dot' }, { type: 'empty' }, { type: 'dot' }, { type: 'dot' }],
  // Fila 2
  [{ type: 'key' }, { type: 'dot' }, { type: 'empty' }, { type: 'orb' }, { type: 'empty' }, { type: 'dot' }],
  // Fila 3: El bot inicia en (3, 2)
  [{ type: 'dot' }, { type: 'empty' }, { type: 'player' }, { type: 'dot' }, { type: 'dot' }, { type: 'empty' }],
  // Fila 4
  [{ type: 'empty' }, { type: 'dot' }, { type: 'empty' }, { type: 'dot' }, { type: 'key' }, { type: 'dot' }],
  // Fila 5
  [{ type: 'tap' }, { type: 'dot' }, { type: 'dot' }, { type: 'empty' }, { type: 'dot' }, { type: 'target' }]
];

class GlitchGame {
  constructor() {
    this.grid = JSON.parse(JSON.stringify(INITIAL_MAP));
    this.playerPos = { r: 3, c: 2 };
    this.keysCollected = 1; // Ya tiene 1/3 según la interfaz
    this.totalKeys = 3;
    this.steps = 24;        // 024 pasos según la imagen
    this.shield = 100;
    this.timeLeft = 105;    // 01:45 en segundos
    this.timerInterval = null;
    this.turboActive = false;
    this.sensorUses = 2;
    this.gameWon = false;

    // Recursos del jugador
    this.chips = 1450;
    this.gems = 38;
    this.battery = 5;

    // Skin equipada actualmente
    this.currentSkin = 'classic';

    // Timer de oferta destacada (7h 42m 19s en segundos)
    this.offerSeconds = 7 * 3600 + 42 * 60 + 19;

    this.cacheDOM();
    this.bindEvents();
    this.renderGrid();
    this.startTimer();
    this.startShopTimer();
    this.updateHUD();
    this.updateResourcesHUD();
  }

  cacheDOM() {
    this.gridEl = document.getElementById('gridContainer');
    this.stepCounterEl = document.getElementById('stepCounter');
    this.keyProgressBarEl = document.getElementById('keyProgressBar');
    this.keysProgressTextEl = document.getElementById('keysProgressText');
    this.countdownTimerEl = document.getElementById('countdownTimer');
    this.slotKeysValEl = document.getElementById('slotKeysVal');
    this.shieldValEl = document.getElementById('shieldVal');
    this.sensorUsesEl = document.getElementById('sensorUses');
    this.turboUsesEl = document.getElementById('turboUses');
    this.toastEl = document.getElementById('gameToast');
    this.toastMsgEl = document.getElementById('toastMsg');
    this.winModalEl = document.getElementById('winModal');
    this.finalStepsEl = document.getElementById('finalSteps');
    this.finalTimeEl = document.getElementById('finalTime');
    this.finalScoreEl = document.getElementById('finalScore');
    this.btnNextLevel = document.getElementById('btnNextLevel');

    // Botones de acción y D-Pad
    this.btnUp = document.getElementById('btnUp');
    this.btnDown = document.getElementById('btnDown');
    this.btnLeft = document.getElementById('btnLeft');
    this.btnRight = document.getElementById('btnRight');
    this.btnInteract = document.getElementById('btnInteract');
    this.btnHint = document.getElementById('btnHint');
    this.btnRestart = document.getElementById('btnRestart');

    // Poderes
    this.powerEmp = document.getElementById('powerEmp');
    this.powerSensor = document.getElementById('powerSensor');
    this.powerTurbo = document.getElementById('powerTurbo');

    // Bottom Navigation
    this.navButtons = document.querySelectorAll('.bottom-nav .nav-item');

    // Vistas SPA
    this.viewGame = document.getElementById('viewGame');
    this.viewLevels = document.getElementById('viewLevels');
    this.viewShop = document.getElementById('viewShop');

    // Elementos de la vista de Niveles
    this.levelsGrid10 = document.getElementById('levelsGrid10');
    this.levelCells = document.querySelectorAll('.level-cell');
    this.detailMissionTag = document.getElementById('detailMissionTag');
    this.detailRankTag = document.getElementById('detailRankTag');
    this.detailMissionName = document.getElementById('detailMissionName');
    this.detailStarsCount = document.getElementById('detailStarsCount');
    this.btnLaunchLevel = document.getElementById('btnLaunchLevel');
    this.btnLaunchLevelText = document.getElementById('btnLaunchLevelText');
    this.tabSector01 = document.getElementById('tabSector01');
    this.tabSector02 = document.getElementById('tabSector02');

    // Recursos DOM
    this.resChipsVal = document.getElementById('resChipsVal');
    this.resGemsVal = document.getElementById('resGemsVal');
    this.resBatteryVal = document.getElementById('resBatteryVal');
    this.btnAddChips = document.getElementById('btnAddChips');
    this.btnAddGems = document.getElementById('btnAddGems');

    // Tienda DOM
    this.shopOfferTimer = document.getElementById('shopOfferTimer');
    this.btnBuyHackerPack = document.getElementById('btnBuyHackerPack');
    this.shopTabs = document.querySelectorAll('.shop-tab');
    this.sectionShopPowers = document.getElementById('sectionShopPowers');
    this.sectionShopSkins = document.getElementById('sectionShopSkins');
    this.sectionShopBank = document.getElementById('sectionShopBank');

    // Acciones de tienda
    this.btnClaimDailyChest = document.getElementById('btnClaimDailyChest');
    this.btnBuySensorX5 = document.getElementById('btnBuySensorX5');
    this.btnUpgradeSensor = document.getElementById('btnUpgradeSensor');
    this.btnBuyEmpShield = document.getElementById('btnBuyEmpShield');
    this.btnBuyTurboJump = document.getElementById('btnBuyTurboJump');
    this.btnBuyKeyMulti = document.getElementById('btnBuyKeyMulti');
    this.btnWatchAdChips = document.getElementById('btnWatchAdChips');
    this.btnBuyChipsFiat = document.getElementById('btnBuyChipsFiat');
    this.btnBuy50Gems = document.getElementById('btnBuy50Gems');
    this.btnBuy120Gems = document.getElementById('btnBuy120Gems');

    // Skins
    this.btnBuySkinCyan = document.getElementById('btnBuySkinCyan');
    this.btnBuySkinDark = document.getElementById('btnBuySkinDark');
    this.btnBuySkinGold = document.getElementById('btnBuySkinGold');

    // Vista Ajustes
    this.viewSettings = document.getElementById('viewSettings');

    // Ajustes DOM
    this.sliderFxVolume = document.getElementById('sliderFxVolume');
    this.valFxVolume = document.getElementById('valFxVolume');
    this.sliderMusicVolume = document.getElementById('sliderMusicVolume');
    this.valMusicVolume = document.getElementById('valMusicVolume');
    this.chkHaptic = document.getElementById('chkHaptic');
    this.btnModeDpad = document.getElementById('btnModeDpad');
    this.btnModeSwipe = document.getElementById('btnModeSwipe');
    this.btnModeJoystick = document.getElementById('btnModeJoystick');
    this.sliderSensitivity = document.getElementById('sliderSensitivity');
    this.valSensitivity = document.getElementById('valSensitivity');
    this.chkRouteGuide = document.getElementById('chkRouteGuide');
    this.chkConfirmBoosters = document.getElementById('chkConfirmBoosters');
    this.btnFps30 = document.getElementById('btnFps30');
    this.btnFps60 = document.getElementById('btnFps60');
    this.chkCrtFilter = document.getElementById('chkCrtFilter');
    this.scanlinesEl = document.querySelector('.cyber-scanlines');
    this.densityPills = document.querySelectorAll('.density-pill');
    this.valParticlesDensity = document.getElementById('valParticlesDensity');
    this.btnCopyPilotId = document.getElementById('btnCopyPilotId');
    this.btnEditProfile = document.getElementById('btnEditProfile');
    this.pilotNameText = document.getElementById('pilotNameText');
    this.btnShareProfile = document.getElementById('btnShareProfile');
    this.btnSyncCloud = document.getElementById('btnSyncCloud');
    this.cloudSyncStatus = document.getElementById('cloudSyncStatus');
    this.btnGooglePlay = document.getElementById('btnGooglePlay');
    this.btnRedeemPromo = document.getElementById('btnRedeemPromo');
    this.btnReportBug = document.getElementById('btnReportBug');
    this.btnCredits = document.getElementById('btnCredits');
    this.btnPrivacy = document.getElementById('btnPrivacy');
    this.btnResetMemory = document.getElementById('btnResetMemory');
    this.btnLogoutPilot = document.getElementById('btnLogoutPilot');
  }

  bindEvents() {
    // D-Pad Cliks
    this.btnUp.addEventListener('click', () => this.movePlayer(-1, 0));
    this.btnDown.addEventListener('click', () => this.movePlayer(1, 0));
    this.btnLeft.addEventListener('click', () => this.movePlayer(0, -1));
    this.btnRight.addEventListener('click', () => this.movePlayer(0, 1));

    // Teclado
    window.addEventListener('keydown', (e) => {
      if (!this.viewGame.classList.contains('active')) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.movePlayer(-1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.movePlayer(1, 0);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.movePlayer(0, -1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.movePlayer(0, 1);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.handleInteract();
          break;
      }
    });

    // Botón Interactuar
    this.btnInteract.addEventListener('click', () => this.handleInteract());

    // Botón Pista
    this.btnHint.addEventListener('click', () => this.giveHint());

    // Botón Reiniciar
    this.btnRestart.addEventListener('click', () => this.restartGame());

    // Poderes
    this.powerEmp.addEventListener('click', () => this.useEmp());
    this.powerSensor.addEventListener('click', () => this.useSensor());
    this.powerTurbo.addEventListener('click', () => this.useTurbo());

    // Modal Siguiente Nivel
    this.btnNextLevel.addEventListener('click', () => {
      this.winModalEl.classList.remove('active');
      this.showToast("¡Cargando Sector 05-CYBER...!");
      setTimeout(() => this.restartGame(), 1000);
    });

    // Pestañas inferiores (SPA Switcher)
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Selección de niveles en la matriz 10
    const LEVELS_DATA = {
      1: { name: 'INICIACIÓN NEÓN', rank: 'RANGO S', stars: '3 / 3', desc: 'Aprende los fundamentos del pulso' },
      2: { name: 'CIRCUITO INESTABLE', rank: 'RANGO A', stars: '3 / 3', desc: 'Esquiva las baldosas de choque' },
      3: { name: 'NÚCLEO CRIPTO', rank: 'RANGO A-', stars: '2 / 3', desc: 'Desactiva los terminales de datos' },
      4: { name: 'LABERINTO DE FRECUENCIAS', rank: 'RANGO B+', stars: '0 / 3', desc: 'Recolecta 3 llaves y escapa' },
      5: { name: 'SUBRED OSCURA', rank: 'RANGO B', stars: '0 / 3', desc: 'Niebla de guerra cibernética' },
      6: { name: 'RESONANCIA MAGNÉTICA', rank: 'BLOQUEADO', stars: '0 / 3', desc: 'Requiere 10 Estrellas' },
      7: { name: 'TERMINAL CORRUPTO', rank: 'BLOQUEADO', stars: '0 / 3', desc: 'Requiere 14 Estrellas' },
      8: { name: 'PUERTA PROTÓNICA', rank: 'BLOQUEADO', stars: '0 / 3', desc: 'Requiere 18 Estrellas' },
      9: { name: 'FALLA EN LA MATRIX', rank: 'BLOQUEADO', stars: '0 / 3', desc: 'Requiere 22 Estrellas' },
      10: { name: 'CENTINELA ALFA (JEFE)', rank: 'JEFE', stars: '0 / 3', desc: 'Enfrentamiento final del sector' }
    };

    this.levelCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const lvl = parseInt(cell.dataset.level);
        sfx.playInteract();

        this.levelCells.forEach(c => c.classList.remove('active'));
        cell.classList.add('active');

        const info = LEVELS_DATA[lvl] || LEVELS_DATA[4];
        this.detailMissionTag.textContent = `MISIÓN ${String(lvl).padStart(2, '0')}`;
        this.detailRankTag.textContent = info.rank;
        this.detailMissionName.textContent = info.name;
        this.detailStarsCount.textContent = info.stars;
        this.btnLaunchLevelText.textContent = `¡JUGAR NIVEL ${String(lvl).padStart(2, '0')}!`;

        if (cell.classList.contains('locked')) {
          this.btnLaunchLevel.style.filter = 'grayscale(0.8)';
          this.btnLaunchLevel.style.opacity = '0.6';
          this.btnLaunchLevelText.textContent = `BLOQUEADO (${info.desc})`;
        } else {
          this.btnLaunchLevel.style.filter = '';
          this.btnLaunchLevel.style.opacity = '1';
        }
      });
    });

    // Botón JUGAR NIVEL desde la pantalla de niveles
    this.btnLaunchLevel.addEventListener('click', () => {
      sfx.playKey();
      this.showToast("Iniciando Misión...");
      setTimeout(() => {
        this.switchTab('jugar');
      }, 300);
    });

    // Selector de sectores (Tabs)
    this.tabSector01.addEventListener('click', () => {
      this.tabSector01.classList.add('active');
      this.tabSector02.classList.remove('active');
      sfx.playInteract();
    });

    this.tabSector02.addEventListener('click', () => {
      this.showToast("Sector 02: Bloqueado. Completa el Sector 01.");
      sfx.playEmp();
    });

    // Botones de Recarga Rápida (+)
    this.btnAddChips.addEventListener('click', () => {
      this.chips += 500;
      this.updateResourcesHUD();
      sfx.playKey();
      this.showToast("+500 CHIPS Añadidos");
    });

    this.btnAddGems.addEventListener('click', () => {
      this.gems += 20;
      this.updateResourcesHUD();
      sfx.playKey();
      this.showToast("+20 GEMAS Añadidas");
    });

    // Tabs internas de la tienda (Poderes, Skins, Banco)
    this.shopTabs.forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        this.shopTabs.forEach(t => t.classList.remove('active'));
        tabBtn.classList.add('active');
        sfx.playInteract();

        const targetCat = tabBtn.dataset.shoptab;
        if (targetCat === 'poderes') {
          this.sectionShopPowers.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (targetCat === 'skins') {
          this.sectionShopSkins.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (targetCat === 'banco') {
          this.sectionShopBank.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Compra de Paquete Hacker Cuántico
    this.btnBuyHackerPack.addEventListener('click', () => {
      if (this.gems >= 25) {
        this.gems -= 25;
        this.chips += 500;
        this.equipSkin('cyan');
        this.updateResourcesHUD();
        sfx.playWin();
        this.showToast("¡PAQUETE HACKER ADQUIRIDO! Skin Cyber Cian equipada.");
      } else {
        sfx.playEmp();
        this.showToast("Gemas insuficientes (requiere 25 gemas).");
      }
    });

    // Acciones de Potenciadores
    this.btnUpgradeSensor.addEventListener('click', () => {
      if (this.chips >= 250) {
        this.chips -= 250;
        this.sensorUses += 2;
        this.sensorUsesEl.textContent = `x${this.sensorUses} Usos`;
        this.sensorUsesEl.classList.remove('text-muted');
        this.updateResourcesHUD();
        sfx.playKey();
        this.showToast("¡Sensor Cuántico Mejorado a Nv. 3/5!");
      } else {
        sfx.playEmp();
        this.showToast("Chips insuficientes (requiere 250).");
      }
    });

    this.btnBuySensorX5.addEventListener('click', () => {
      if (this.chips >= 1000) {
        this.chips -= 1000;
        this.sensorUses += 5;
        this.sensorUsesEl.textContent = `x${this.sensorUses} Usos`;
        this.updateResourcesHUD();
        sfx.playKey();
        this.showToast("+5 Usos de Sensor añadidos");
      } else {
        sfx.playEmp();
        this.showToast("Chips insuficientes para paquete x5.");
      }
    });

    this.btnBuyEmpShield.addEventListener('click', () => {
      if (this.chips >= 400) {
        this.chips -= 400;
        this.shield = 100;
        this.updateResourcesHUD();
        this.updateHUD();
        sfx.playKey();
        this.showToast("¡Escudo EMP Sobrecargado al 100%!");
      } else {
        sfx.playEmp();
        this.showToast("Chips insuficientes (requiere 400).");
      }
    });

    this.btnBuyTurboJump.addEventListener('click', () => {
      if (this.chips >= 150) {
        this.chips -= 150;
        this.turboActive = true;
        this.turboUsesEl.textContent = 'x1 Salto';
        this.turboUsesEl.classList.add('status-ready');
        this.updateResourcesHUD();
        sfx.playKey();
        this.showToast("¡Salto Turbo Fónico Adquirido!");
      } else {
        sfx.playEmp();
        this.showToast("Chips insuficientes (requiere 150).");
      }
    });

    this.btnBuyKeyMulti.addEventListener('click', () => {
      if (this.gems >= 5) {
        this.gems -= 5;
        this.updateResourcesHUD();
        sfx.playKey();
        this.showToast("¡Multiplicador de Llaves Activo para la misión!");
      } else {
        sfx.playEmp();
        this.showToast("Gemas insuficientes (requiere 5 gemas).");
      }
    });

    // Reclamar Cofre Diario Gratis
    this.btnClaimDailyChest.addEventListener('click', () => {
      if (this.btnClaimDailyChest.textContent === 'RECLAMADO') {
        this.showToast("Ya has reclamado tu cofre de hoy.");
        return;
      }
      this.chips += 100;
      this.battery = Math.min(5, this.battery + 1);
      this.updateResourcesHUD();
      sfx.playWin();
      this.btnClaimDailyChest.textContent = 'RECLAMADO';
      this.btnClaimDailyChest.style.background = '#1e293b';
      this.btnClaimDailyChest.style.color = '#64748b';
      this.btnClaimDailyChest.style.animation = 'none';
      this.showToast("¡Cofre Reclamado! +100 Chips y +1 Batería.");
    });

    // Ver anuncio gratis
    this.btnWatchAdChips.addEventListener('click', () => {
      this.showToast("Sintonizando transmisión holo-cyber...");
      setTimeout(() => {
        this.chips += 500;
        this.updateResourcesHUD();
        sfx.playKey();
        this.showToast("+500 Chips acreditados por anuncio.");
      }, 1000);
    });

    // Compras Fiat Simulación
    this.btnBuyChipsFiat.addEventListener('click', () => {
      this.chips += 500;
      this.updateResourcesHUD();
      sfx.playKey();
      this.showToast("¡Compra de 500 Chips procesada!");
    });

    this.btnBuy50Gems.addEventListener('click', () => {
      this.gems += 55; // con bonus
      this.updateResourcesHUD();
      sfx.playKey();
      this.showToast("¡Compra de 50 (+5 Bonus) Gemas procesada!");
    });

    this.btnBuy120Gems.addEventListener('click', () => {
      this.gems += 150;
      this.updateResourcesHUD();
      sfx.playWin();
      this.showToast("¡Bóveda Quantum de 120 Gemas procesada!");
    });

    // Skins compras y equipamiento
    this.btnBuySkinCyan.addEventListener('click', () => {
      if (this.currentSkin === 'cyan') {
        this.showToast("Skin Cyber Cian ya equipada.");
        return;
      }
      if (this.chips >= 1200) {
        this.chips -= 1200;
        this.equipSkin('cyan');
        this.updateResourcesHUD();
        sfx.playKey();
        this.btnBuySkinCyan.textContent = 'EN USO';
        this.btnBuySkinCyan.className = 'btn-skin-action disabled';
        this.showToast("¡Skin Cyber Cian desbloqueada y equipada!");
      } else {
        sfx.playEmp();
        this.showToast("Chips insuficientes (requiere 1,200).");
      }
    });

    this.btnBuySkinDark.addEventListener('click', () => {
      if (this.currentSkin === 'dark') {
        this.showToast("Skin Centinela Dark ya equipada.");
        return;
      }
      if (this.gems >= 25) {
        this.gems -= 25;
        this.equipSkin('dark');
        this.updateResourcesHUD();
        sfx.playKey();
        this.btnBuySkinDark.textContent = 'EN USO';
        this.btnBuySkinDark.className = 'btn-skin-action disabled';
        this.showToast("¡Skin Centinela Dark equipada!");
      } else {
        sfx.playEmp();
        this.showToast("Gemas insuficientes (requiere 25 gemas).");
      }
    });

    this.btnBuySkinGold.addEventListener('click', () => {
      if (this.currentSkin === 'gold') {
        this.showToast("Skin Bot Áureo ya equipada.");
        return;
      }
      if (this.gems >= 50) {
        this.gems -= 50;
        this.equipSkin('gold');
        this.updateResourcesHUD();
        sfx.playWin();
        this.btnBuySkinGold.textContent = 'EN USO';
        this.btnBuySkinGold.className = 'btn-skin-action disabled';
        this.showToast("¡Skin Legendaria Bot Áureo equipada!");
      } else {
        sfx.playEmp();
        this.showToast("Gemas insuficientes (requiere 50 gemas).");
      }
    });

    // ==========================================
    // EVENTOS DE LA VISTA DE AJUSTES (SETTINGS)
    // ==========================================
    // Slider FX Volume
    if (this.sliderFxVolume) {
      this.sliderFxVolume.addEventListener('input', (e) => {
        const val = e.target.value;
        this.valFxVolume.textContent = `${val}% 🔊`;
      });
      this.sliderFxVolume.addEventListener('change', () => {
        sfx.playInteract();
      });
    }

    // Slider Música
    if (this.sliderMusicVolume) {
      this.sliderMusicVolume.addEventListener('input', (e) => {
        const val = e.target.value;
        this.valMusicVolume.textContent = `${val}%`;
      });
    }

    // Toggle Háptica
    if (this.chkHaptic) {
      this.chkHaptic.addEventListener('change', (e) => {
        sfx.playInteract();
        this.showToast(e.target.checked ? "Respuesta Háptica: Activada" : "Respuesta Háptica: Desactivada");
      });
    }

    // Selector Método de Entrada Táctil
    const ctrlButtons = [this.btnModeDpad, this.btnModeSwipe, this.btnModeJoystick];
    ctrlButtons.forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        ctrlButtons.forEach(b => b && b.classList.remove('active'));
        btn.classList.add('active');
        sfx.playInteract();
        const mode = btn.dataset.ctrl;
        const nameMap = { dpad: 'D-Pad Arcade', swipe: 'Gestos Swipe', joystick: 'Joystick F-1' };
        this.showToast(`Entrada: ${nameMap[mode] || mode}`);
      });
    });

    // Sensibilidad
    if (this.sliderSensitivity) {
      const sensLabels = {
        '1': 'Nivel 1 (Mínimo)',
        '2': 'Nivel 2 (Suave)',
        '3': 'Nivel 3 (Balanceado)',
        '4': 'Nivel 4 (Rápido)',
        '5': 'Nivel 5 (Hiper-Sónico)'
      };
      this.sliderSensitivity.addEventListener('input', (e) => {
        const val = e.target.value;
        this.valSensitivity.textContent = sensLabels[val] || `Nivel ${val}`;
      });
    }

    // Toggles de Jugabilidad
    if (this.chkRouteGuide) {
      this.chkRouteGuide.addEventListener('change', (e) => {
        sfx.playInteract();
        this.showToast(e.target.checked ? "Guía de Ruta Óptima: Visible" : "Guía de Ruta Óptima: Oculta");
      });
    }

    if (this.chkConfirmBoosters) {
      this.chkConfirmBoosters.addEventListener('change', (e) => {
        sfx.playInteract();
        this.showToast(e.target.checked ? "Confirmación de Boosters: Activada" : "Confirmación de Boosters: Desactivada");
      });
    }

    // Modo FPS
    if (this.btnFps30 && this.btnFps60) {
      this.btnFps30.addEventListener('click', () => {
        this.btnFps30.classList.add('active');
        this.btnFps60.classList.remove('active');
        sfx.playInteract();
        this.showToast("Tasa de Refresco: 30 FPS (Ahorro Energía)");
      });

      this.btnFps60.addEventListener('click', () => {
        this.btnFps60.classList.add('active');
        this.btnFps30.classList.remove('active');
        sfx.playInteract();
        this.showToast("Tasa de Refresco: 60 FPS ULTRA (Fluidez Arcade)");
      });
    }

    // Filtro CRT Scanlines
    if (this.chkCrtFilter) {
      this.chkCrtFilter.addEventListener('change', (e) => {
        sfx.playInteract();
        if (this.scanlinesEl) {
          this.scanlinesEl.style.display = e.target.checked ? 'block' : 'none';
        }
        this.showToast(e.target.checked ? "Filtro CRT Retro: Habilitado" : "Filtro CRT Retro: Desactivado");
      });
    }

    // Densidad de Partículas
    this.densityPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.densityPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        sfx.playInteract();
        const dens = pill.dataset.density;
        const mapDens = {
          baja: 'BAJA (Bajo Consumo)',
          media: 'MEDIA (Balance)',
          alta: 'ALTA (Max Glow)'
        };
        if (this.valParticlesDensity) {
          this.valParticlesDensity.textContent = mapDens[dens] || dens.toUpperCase();
        }
        this.showToast(`Densidad de Partículas: ${dens.toUpperCase()}`);
      });
    });

    // Copiar ID de Piloto
    if (this.btnCopyPilotId) {
      this.btnCopyPilotId.addEventListener('click', () => {
        const idText = "GB-9948-2829";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(idText).catch(() => {});
        }
        sfx.playKey();
        this.showToast(`¡ID copiado: ${idText}!`);
      });
    }

    // Editar Perfil
    if (this.btnEditProfile) {
      this.btnEditProfile.addEventListener('click', () => {
        const nuevoNombre = prompt("Ingresa nuevo Identificador de Piloto:", this.pilotNameText.textContent);
        if (nuevoNombre && nuevoNombre.trim() !== "") {
          this.pilotNameText.textContent = nuevoNombre.trim().toUpperCase();
          sfx.playKey();
          this.showToast("¡Identificador de Piloto actualizado!");
        }
      });
    }

    // Compartir Perfil
    if (this.btnShareProfile) {
      this.btnShareProfile.addEventListener('click', () => {
        sfx.playInteract();
        this.showToast("Tarjeta de Piloto #GB-9948 generada y lista para compartir.");
      });
    }

    // Sincronización en la Nube
    if (this.btnSyncCloud) {
      this.btnSyncCloud.addEventListener('click', () => {
        this.btnSyncCloud.style.transform = 'rotate(360deg)';
        this.cloudSyncStatus.textContent = "Sincronizando con servidor quantum...";
        setTimeout(() => {
          this.btnSyncCloud.style.transform = '';
          this.cloudSyncStatus.textContent = "Guardado en la nube: Justo ahora";
          sfx.playWin();
          this.showToast("¡Progreso y datos sincronizados con éxito!");
        }, 800);
      });
    }

    // Vincular Google Play
    if (this.btnGooglePlay) {
      this.btnGooglePlay.addEventListener('click', () => {
        sfx.playInteract();
        this.showToast("Google Play Games: Conectado con perfil 'Piloto_Cyber'");
      });
    }

    // Canjear Código Promo
    if (this.btnRedeemPromo) {
      this.btnRedeemPromo.addEventListener('click', () => {
        const code = prompt("Introduce tu código promocional Cyber (Ej: GLITCH2025):");
        if (code) {
          const cleanCode = code.trim().toUpperCase();
          if (cleanCode === 'GLITCH2025' || cleanCode === 'ARCADE' || cleanCode === 'CYBER') {
            this.chips += 300;
            this.gems += 10;
            this.updateResourcesHUD();
            sfx.playWin();
            this.showToast(`¡CÓDIGO CANJEADO! +300 Chips y +10 Gemas.`);
          } else {
            sfx.playEmp();
            this.showToast("Código inválido o expirado.");
          }
        }
      });
    }

    // Enlaces de Mantenimiento
    if (this.btnReportBug) {
      this.btnReportBug.addEventListener('click', () => {
        sfx.playInteract();
        this.showToast("Diagnóstico del sistema: Sin errores críticos detectados.");
      });
    }

    if (this.btnCredits) {
      this.btnCredits.addEventListener('click', () => {
        sfx.playInteract();
        this.showToast("Glitch Bot Engine v1.0.4 - Desarrollado para Arcade Protocol 2025");
      });
    }

    if (this.btnPrivacy) {
      this.btnPrivacy.addEventListener('click', () => {
        sfx.playInteract();
        this.showToast("Protocolos de Encriptación Cuántica: 100% Protegidos.");
      });
    }

    // Borrar datos / Reset
    if (this.btnResetMemory) {
      this.btnResetMemory.addEventListener('click', () => {
        sfx.playEmp();
        if (confirm("¿Deseas purgar la caché y reiniciar estadísticas locales?")) {
          this.chips = 1450;
          this.gems = 18;
          this.battery = 5;
          this.currentSkin = 'classic';
          this.updateResourcesHUD();
          this.renderGrid();
          this.showToast("Memoria temporal purgada. Ajustes restablecidos.");
        }
      });
    }

    // Cerrar sesión
    if (this.btnLogoutPilot) {
      this.btnLogoutPilot.addEventListener('click', () => {
        sfx.playInteract();
        this.showToast("Sesión del piloto cerrada con seguridad.");
      });
    }
  }

  equipSkin(skin) {
    this.currentSkin = skin;
    this.renderGrid();
  }

  updateResourcesHUD() {
    this.resChipsVal.textContent = this.chips.toLocaleString();
    this.resGemsVal.textContent = this.gems.toLocaleString();
    this.resBatteryVal.textContent = `${this.battery}/5`;
  }

  startShopTimer() {
    setInterval(() => {
      this.offerSeconds--;
      if (this.offerSeconds <= 0) this.offerSeconds = 8 * 3600;

      const hrs = Math.floor(this.offerSeconds / 3600);
      const mins = Math.floor((this.offerSeconds % 3600) / 60);
      const secs = this.offerSeconds % 60;
      this.shopOfferTimer.textContent = `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    }, 1000);
  }

  switchTab(tab) {
    this.navButtons.forEach(b => {
      if (b.dataset.tab === tab) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    this.viewGame.classList.remove('active');
    this.viewLevels.classList.remove('active');
    this.viewShop.classList.remove('active');
    if (this.viewSettings) {
      this.viewSettings.classList.remove('active');
    }

    if (tab === 'jugar') {
      this.viewGame.classList.add('active');
      sfx.playInteract();
    } else if (tab === 'niveles') {
      this.viewLevels.classList.add('active');
      sfx.playInteract();
    } else if (tab === 'tienda') {
      this.viewShop.classList.add('active');
      sfx.playInteract();
    } else if (tab === 'ajustes') {
      if (this.viewSettings) {
        this.viewSettings.classList.add('active');
      }
      sfx.playInteract();
    } else {
      this.showToast(`Pestaña: ${tab.toUpperCase()} (En desarrollo)`);
      sfx.playInteract();
    }
  }

  // ==========================================
  // RENDERIZADO DEL TABLERO
  // ==========================================
  renderGrid() {
    this.gridEl.innerHTML = '';

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tileData = this.grid[r][c];
        const tile = document.createElement('div');
        tile.className = 'grid-tile';
        tile.dataset.r = r;
        tile.dataset.c = c;

        // Click directo en celdas para mover
        tile.addEventListener('click', () => {
          this.handleCellClick(r, c);
        });

        // Contenido según tipo
        if (r === this.playerPos.r && c === this.playerPos.c) {
          tile.classList.add('player-cell');
          tile.innerHTML = this.getPlayerSpriteSVG();
        } else {
          switch (tileData.type) {
            case 'key':
              tile.classList.add('item-key');
              tile.innerHTML = `
                <svg viewBox="0 0 24 24">
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              `;
              break;

            case 'portal':
              tile.classList.add('portal-cell');
              const isLocked = this.keysCollected < this.totalKeys;
              tile.innerHTML = `
                <svg class="door-icon" viewBox="0 0 24 24">
                  <rect x="4" y="3" width="16" height="18" rx="2"/>
                  <line x1="12" y1="3" x2="12" y2="21"/>
                  <circle cx="9" cy="12" r="1" fill="#7dd3fc"/>
                  <circle cx="15" cy="12" r="1" fill="#7dd3fc"/>
                </svg>
                ${isLocked ? '<span class="lock-badge">🔒</span>' : '<span class="lock-badge" style="color:var(--neon-green)">🔓</span>'}
              `;
              break;

            case 'energy':
              tile.classList.add('item-energy');
              tile.innerHTML = `
                <svg viewBox="0 0 24 24">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
              `;
              break;

            case 'target':
              tile.classList.add('item-target');
              tile.innerHTML = `
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              `;
              break;

            case 'orb':
              tile.classList.add('item-orb');
              tile.innerHTML = `<div class="orb-element"></div>`;
              break;

            case 'tap':
              tile.classList.add('item-tap');
              tile.innerHTML = `
                <svg viewBox="0 0 24 24">
                  <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zM17 13h-1.07A7.002 7.002 0 0 0 2 13v7h15v-7z"/>
                </svg>
              `;
              break;

            case 'dot':
              tile.classList.add('has-dot');
              break;

            case 'empty':
            default:
              tile.classList.add('empty-lane');
              break;
          }
        }

        this.gridEl.appendChild(tile);
      }
    }
  }

  // SVG Pixel Art de Glitch Bot (soporta Skins dinámicas de la Tienda)
  getPlayerSpriteSVG() {
    let headColor = '#00f395';
    let bodyColor = '#0984e3';
    let eyeColor = '#0c1220';
    let antennaColor = '#00e5ff';

    if (this.currentSkin === 'cyan') {
      headColor = '#00e5ff';
      bodyColor = '#1e3a8a';
      eyeColor = '#002b49';
      antennaColor = '#38bdf8';
    } else if (this.currentSkin === 'dark') {
      headColor = '#ef4444';
      bodyColor = '#374151';
      eyeColor = '#111827';
      antennaColor = '#f87171';
    } else if (this.currentSkin === 'gold') {
      headColor = '#fbbf24';
      bodyColor = '#d97706';
      eyeColor = '#78350f';
      antennaColor = '#f59e0b';
    }

    return `
      <div class="player-bot-sprite">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <!-- Cabeza del robot con color de skin -->
          <rect x="5" y="4" width="14" height="10" rx="2" fill="${headColor}"/>
          <!-- Ojos robóticos -->
          <rect x="7" y="7" width="3" height="3" fill="${eyeColor}"/>
          <rect x="14" y="7" width="3" height="3" fill="${eyeColor}"/>
          <!-- Boca / Scanner -->
          <rect x="9" y="11" width="6" height="1.5" fill="${eyeColor}"/>
          <!-- Antena neón -->
          <rect x="11" y="2" width="2" height="2" fill="${antennaColor}"/>
          <!-- Cuerpo & Piernas -->
          <rect x="7" y="15" width="10" height="6" rx="1.5" fill="${bodyColor}"/>
          <rect x="8" y="21" width="3" height="2" fill="${headColor}"/>
          <rect x="13" y="21" width="3" height="2" fill="${headColor}"/>
        </svg>
      </div>
    `;
  }

  // ==========================================
  // MOVIMIENTO DEL JUGADOR
  // ==========================================
  movePlayer(dr, dc) {
    if (this.gameWon) return;

    let distance = 1;
    if (this.turboActive) {
      distance = 2;
      this.turboActive = false;
      this.turboUsesEl.textContent = 'x0 Salto';
      this.turboUsesEl.classList.remove('status-ready');
      this.showToast('¡TURBO SALTO ACTIVADO! (2 casillas)');
    }

    const newR = this.playerPos.r + dr * distance;
    const newC = this.playerPos.c + dc * distance;

    // Verificar límites del mapa
    if (newR < 0 || newR >= GRID_SIZE || newC < 0 || newC >= GRID_SIZE) {
      this.triggerShake();
      return;
    }

    this.playerPos.r = newR;
    this.playerPos.c = newC;
    this.steps++;
    sfx.playStep();

    // Comprobar casilla
    this.checkTileTrigger(newR, newC);

    this.updateHUD();
    this.renderGrid();
  }

  handleCellClick(r, c) {
    const dr = r - this.playerPos.r;
    const dc = c - this.playerPos.c;

    // Si es adyacente, mover directamente
    if ((Math.abs(dr) === 1 && dc === 0) || (Math.abs(dc) === 1 && dr === 0)) {
      this.movePlayer(dr, dc);
    } else if (r === this.playerPos.r && c === this.playerPos.c) {
      this.handleInteract();
    }
  }

  // ==========================================
  // INTERACCIONES Y RECOLECCIÓN
  // ==========================================
  checkTileTrigger(r, c) {
    const tile = this.grid[r][c];

    if (tile.type === 'key') {
      this.keysCollected++;
      tile.type = 'empty';
      sfx.playKey();
      this.showToast(`¡Llave Cuántica Obtenida! (${this.keysCollected}/${this.totalKeys})`);
      
      if (this.keysCollected >= this.totalKeys) {
        setTimeout(() => {
          this.showToast("¡PORTAL DE FUGA DESBLOQUEADO! Corre a la salida.");
          sfx.playWin();
        }, 500);
      }
    } else if (tile.type === 'energy') {
      this.shield = Math.min(100, this.shield + 20);
      tile.type = 'empty';
      sfx.playInteract();
      this.showToast("¡Núcleo de Energía! Escudo al 100%");
    } else if (tile.type === 'portal') {
      if (this.keysCollected >= this.totalKeys) {
        this.triggerVictory();
      } else {
        this.showToast(`Portal Bloqueado: Faltan ${this.totalKeys - this.keysCollected} llaves`);
        sfx.playEmp();
      }
    }
  }

  handleInteract() {
    sfx.playInteract();
    const { r, c } = this.playerPos;
    const currentTile = this.grid[r][c];

    // Animación de pulso en el botón
    this.btnInteract.style.transform = 'scale(0.95)';
    setTimeout(() => this.btnInteract.style.transform = '', 150);

    // Si está sobre portal
    if (r === 0 && c === 5) {
      if (this.keysCollected >= this.totalKeys) {
        this.triggerVictory();
      } else {
        this.showToast(`¡Portal Bloqueado! Necesitas 3 Llaves Cuánticas.`);
      }
      return;
    }

    // Efecto interactuar en radio cercano
    let foundInteractable = false;
    const neighbors = [
      [r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
    ];

    neighbors.forEach(([nr, nc]) => {
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        const item = this.grid[nr][nc];
        if (item.type === 'key') {
          this.keysCollected++;
          item.type = 'empty';
          sfx.playKey();
          this.showToast(`¡Llave Cuántica absorbida con éxito! (${this.keysCollected}/${this.totalKeys})`);
          foundInteractable = true;
        } else if (item.type === 'tap') {
          this.showToast("¡Terminal Cuántica Activada! Secretos revelados.");
          sfx.playInteract();
          foundInteractable = true;
        } else if (item.type === 'target') {
          this.showToast("¡Sensor de Sector Calibrado!");
          sfx.playInteract();
          foundInteractable = true;
        } else if (item.type === 'orb') {
          this.showToast("¡Orbe de Resonancia Activado! Glitch Shield al máximo.");
          this.shield = 100;
          foundInteractable = true;
        }
      }
    });

    if (!foundInteractable) {
      this.showToast("Escaneando área circundante... Nada cerca.");
    }

    this.updateHUD();
    this.renderGrid();
  }

  // ==========================================
  // PODERES
  // ==========================================
  useEmp() {
    sfx.playEmp();
    this.showToast("¡PULSO EMP DESCARGADO!");
    // Efecto visual de destello cibernético en el tablero
    this.gridEl.style.boxShadow = '0 0 50px #38bdf8, inset 0 0 30px #38bdf8';
    setTimeout(() => {
      this.gridEl.style.boxShadow = '';
    }, 600);
  }

  useSensor() {
    if (this.sensorUses <= 0) {
      this.showToast("Sensor agotado en este sector.");
      return;
    }
    this.sensorUses--;
    this.sensorUsesEl.textContent = `x${this.sensorUses} Usos`;
    if (this.sensorUses === 0) {
      this.sensorUsesEl.classList.add('text-muted');
    }
    sfx.playInteract();
    this.giveHint();
  }

  useTurbo() {
    if (this.turboActive) {
      this.showToast("Turbo ya está activo.");
      return;
    }
    this.turboActive = true;
    sfx.playInteract();
    this.showToast("¡Turbo cargado! Siguiente movimiento avanzará 2 pasos.");
  }

  giveHint() {
    sfx.playInteract();
    // Encontrar la llave más cercana
    let closestKey = null;
    let minDistance = Infinity;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c].type === 'key') {
          const dist = Math.abs(r - this.playerPos.r) + Math.abs(c - this.playerPos.c);
          if (dist < minDistance) {
            minDistance = dist;
            closestKey = { r, c };
          }
        }
      }
    }

    if (closestKey) {
      const targetTile = document.querySelector(`.grid-tile[data-r="${closestKey.r}"][data-c="${closestKey.c}"]`);
      if (targetTile) {
        targetTile.style.transform = 'scale(1.25)';
        targetTile.style.boxShadow = '0 0 25px #ffaa00';
        setTimeout(() => {
          targetTile.style.transform = '';
          targetTile.style.boxShadow = '';
        }, 1200);
      }
      this.showToast(`PISTA: Llave detectada a ${minDistance} pasos`);
    } else {
      // Guiar al portal
      this.showToast("¡Todas las llaves obtenidas! Dirígete a la Puerta (arriba a la derecha)");
      const portalTile = document.querySelector('.portal-cell');
      if (portalTile) {
        portalTile.style.boxShadow = '0 0 30px var(--neon-green)';
        setTimeout(() => portalTile.style.boxShadow = '', 1200);
      }
    }
  }

  restartGame() {
    this.grid = JSON.parse(JSON.stringify(INITIAL_MAP));
    this.playerPos = { r: 3, c: 2 };
    this.keysCollected = 1;
    this.steps = 24;
    this.shield = 100;
    this.timeLeft = 105;
    this.turboActive = false;
    this.sensorUses = 2;
    this.gameWon = false;

    this.turboUsesEl.textContent = 'x1 Salto';
    this.turboUsesEl.classList.add('status-ready');
    this.sensorUsesEl.textContent = 'x2 Usos';
    this.winModalEl.classList.remove('active');

    this.updateHUD();
    this.renderGrid();
    this.showToast("Nivel Reiniciado.");
    sfx.playInteract();
  }

  // ==========================================
  // HUD Y ACTUALIZACIONES
  // ==========================================
  updateHUD() {
    // Contador de pasos
    this.stepCounterEl.textContent = String(this.steps).padStart(3, '0');

    // Llaves y progreso
    const pct = Math.round((this.keysCollected / this.totalKeys) * 100);
    this.keyProgressBarEl.style.width = `${pct}%`;
    this.keysProgressTextEl.innerHTML = `<span class="highlight">${this.keysCollected}/${this.totalKeys}</span> LLAVES`;
    this.slotKeysValEl.textContent = `${this.keysCollected}/${this.totalKeys}`;

    // Shield
    this.shieldValEl.textContent = `${this.shield}%`;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.gameWon) return;

      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        clearInterval(this.timerInterval);
        this.showToast("¡Tiempo Agotado en la Cripta!");
      }

      const mins = Math.floor(this.timeLeft / 60);
      const secs = this.timeLeft % 60;
      this.countdownTimerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  }

  triggerVictory() {
    this.gameWon = true;
    sfx.playWin();

    const mins = Math.floor((105 - this.timeLeft) / 60);
    const secs = (105 - this.timeLeft) % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    this.finalStepsEl.textContent = this.steps;
    this.finalTimeEl.textContent = timeFormatted;
    const calculatedScore = Math.max(1000, 10000 - (this.steps * 50) - ((105 - this.timeLeft) * 20));
    this.finalScoreEl.textContent = calculatedScore.toLocaleString();

    this.winModalEl.classList.add('active');
  }

  triggerShake() {
    this.gridEl.style.transform = 'translateX(-4px)';
    setTimeout(() => {
      this.gridEl.style.transform = 'translateX(4px)';
      setTimeout(() => {
        this.gridEl.style.transform = '';
      }, 70);
    }, 70);
  }

  showToast(msg) {
    this.toastMsgEl.textContent = msg;
    this.toastEl.classList.add('visible');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('visible');
    }, 2200);
  }
}

// Iniciar juego al cargar el documento
window.addEventListener('DOMContentLoaded', () => {
  window.glitchGameInstance = new GlitchGame();
});
