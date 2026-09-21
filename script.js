
/* =========================================================
   DOM
========================================================= */

const playButton = document.getElementById("play-button");
const mainMenu = document.getElementById("main-menu");

const gameScreen = document.getElementById("game-screen");
const portalContainer = document.getElementById("portal-container");
const deployGunmanButton = document.getElementById("deploy-gunman");
const deploy999Button = document.getElementById("deploy-999");

const core = document.getElementById("core");
const coreHealthDisplay = document.getElementById("core-health");

const researchPointsDisplay = document.getElementById("research-points");

const waveNumberDisplay = document.getElementById("wave-number");
const waveKilledDisplay = document.getElementById("wave-killed");
const waveTotalDisplay = document.getElementById("wave-total");

const deathScreen = document.getElementById("death-screen");
const restartButton = document.getElementById("restart-button");
const menuButton = document.getElementById("menu-button");
const deathScoreValue = document.getElementById("death-score-value");
const deathHighScoreValue = document.getElementById("death-high-score-value");

const victoryScreen = document.getElementById("victory-screen");
const victoryRestartButton = document.getElementById("victory-restart-button");
const victoryMenuButton = document.getElementById("victory-menu-button");
const scoreValue = document.getElementById("score-value");
const highScoreValue = document.getElementById("high-score-value");
const finalTime = document.getElementById("final-time");
const finalUnits = document.getElementById("final-units");
const finalLives = document.getElementById("final-lives");

const pauseScreen = document.getElementById("pause-screen");
const resumeButton = document.getElementById("resume-button");
const pauseMenuButton = document.getElementById("pause-menu-button");

const cursor = document.getElementById("custom-cursor");
const cursorImage = document.getElementById("cursor-image");


/* =========================================================
   GAME STATE
========================================================= */

let gameOver = false;
let gameActive = false;
let gamePaused = false;

let gameStartTimeout = null;
let gameStartPending = false;
let gameStartRemaining = 1000;
let gameStartNextTick = 0;

let pauseStartedAt = 0;
let pausedDuration = 0;

let researchPointTimeout = null;
let researchPointRemaining = 1000;
let researchPointNextTick = 0;

let waveTimeout = null;
let waveSpawnTimeout = null;
let waveRemaining = 2500;
let waveNextTick = 0;
let waveSpawnRemaining = 900;
let waveSpawnNextTick = 0;


/* =========================================================
   GAME VALUES
========================================================= */

let researchPoints = 10;
const startingResearchPoints = 75;

let coreHealth = 100;
const maxCoreHealth = 100;

const minPortalDistance = 300;
const portalMargin = 100;

let placingGunman = false;
let placing999 = false;

let selected999 = null;
let selected999Waypoint = null;

let placementPreview = null;
let placementBoundary = null;
let placementExistingBoundaries = [];
let placementCoreBoundary = null;

const minUnitCoreDistance = 120;
const minUnitDistance = 25;
const unitSpacingDiameter = minUnitDistance * 2;
const battlefieldMargin = 50;

const scp999BuffRange = 150;
const scp999BuffGracePeriod = 5000;
const scp999MoveSpeed = 150;

let currentWave = 1;
let waveTotalEnemies = 0;
let waveSpawnedEnemies = 0;
let waveKilledEnemies = 0;
let activeEnemies = 0;
let waveStarting = false;
let pendingEnemySpawns = 0;
let waveSpawningComplete = false;

const enemySet = new Set();
const gunmanSet = new Set();
const heroSet = new Set();

let totalUnitsPlaced = 0;
let livesLost = 0;
let currentWaveStartTime = 0;
let currentWaveTime = 0;
let totalGameTime = 0;
let gameStartTime = 0;
let finalScore = 0;

let highScore =
    Number(localStorage.getItem("xkCalamityHighScore")) || 0;


/* =========================================================
   SOUND SYSTEM
========================================================= */

const sounds = {

    button:
        new Audio(
            "assets/sounds/button.wav"
        ),

    select:
        new Audio(
            "assets/sounds/select.wav"
        ),

    invalid:
        new Audio(
            "assets/sounds/invalid.wav"
        ),

    waveStart:
        new Audio(
            "assets/sounds/wave-start.wav"
        ),

    portal:
        new Audio(
            "assets/sounds/portal.wav"
        ),

    enemySpawn:
        new Audio(
            "assets/sounds/enemy-spawn.wav"
        ),

    gunmanPlace:
        new Audio(
            "assets/sounds/gunman-place.wav"
        ),

    gunmanShot:
        new Audio(
            "assets/sounds/gunman-shot.wav"
        ),

    enemyHit:
        new Audio(
            "assets/sounds/enemy-hit.wav"
        ),

    enemyDeath:
        new Audio(
            "assets/sounds/enemy-death.wav"
        ),

    coreReached:
        new Audio(
            "assets/sounds/core-reached.wav"
        ),

    coreHit:
        new Audio(
            "assets/sounds/core-hit.wav"
        ),

    rpGain:
        new Audio(
            "assets/sounds/rp-gain.wav"
        ),

    gameOver:
        new Audio(
            "assets/sounds/game-over.wav"
        ),

    victory:
        new Audio(
            "assets/sounds/victory.wav"
        )
};

Object.values(sounds).forEach(function (sound) {
    sound.volume = 0.35;
});

function playSound(soundName) {

    const sound = sounds[soundName];

    if (!sound) {
        return;
    }

    sound.currentTime = 0;

    sound.play().catch(function () {});
}


/* =========================================================
   CLEANUP HELPERS
========================================================= */

function clearEnemyActivity(enemy) {

    if (!enemy) {
        return;
    }

    if (enemy.attackTimer !== null) {
        clearTimeout(enemy.attackTimer);
        enemy.attackTimer = null;
    }

    if (enemy.moveAnimation) {
        cancelAnimationFrame(enemy.moveAnimation);
        enemy.moveAnimation = null;
    }

    enemy.resumeMovement = null;
}

function clearGunmanActivity(gunman) {

    if (!gunman) {
        return;
    }

    if (gunman.fireTimeout !== null) {
        clearTimeout(gunman.fireTimeout);
        gunman.fireTimeout = null;
    }

    if (gunman.bstTimeout !== null) {
        clearTimeout(gunman.bstTimeout);
        gunman.bstTimeout = null;
    }

    gunman.fireFunction = null;
}

function clearHeroActivity(hero) {

    if (!hero) {
        return;
    }

    if (hero.moveAnimation) {
        cancelAnimationFrame(hero.moveAnimation);
        hero.moveAnimation = null;
    }

    hero.resumeMovement = null;
}

function clearProjectileActivity(projectile) {

    if (!projectile) {
        return;
    }

    if (projectile.moveAnimation) {
        cancelAnimationFrame(projectile.moveAnimation);
        projectile.moveAnimation = null;
    }

    projectile.resumeMovement = null;
}

function clearPortalReleaseActivity(portal) {

    if (!portal || !portal.releaseTimers) {
        return;
    }

    portal.releaseTimers.forEach(function (timer, i) {

        if (timer !== null) {
            clearTimeout(timer);
            portal.releaseTimers[i] = null;
        }
    });
}

function clearAllPortalReleaseActivity() {

    portalContainer.querySelectorAll(".portal").forEach(
        clearPortalReleaseActivity
    );
}

function removeBattlefieldEntities() {

    enemySet.forEach(function (enemy) {

        clearEnemyActivity(enemy);

        if (enemy.healthBar) {
            enemy.healthBar.remove();
        }

        enemy.remove();
    });

    enemySet.clear();

    gunmanSet.forEach(function (gunman) {

        clearGunmanActivity(gunman);

        if (gunman.healthBar) {
            gunman.healthBar.remove();
        }

        gunman.remove();
    });

    gunmanSet.clear();

    heroSet.forEach(function (hero) {

        clearHeroActivity(hero);
        hero.remove();
    });

    heroSet.clear();

    portalContainer
        .querySelectorAll(".gunman-projectile")
        .forEach(function (projectile) {

            clearProjectileActivity(projectile);
            projectile.remove();
        });

    portalContainer
        .querySelectorAll(".rp-popup")
        .forEach(function (popup) {

            if (popup.removeTimeout !== null) {
                clearTimeout(popup.removeTimeout);
            }

            popup.remove();
        });

    clearAllPortalReleaseActivity();

    portalContainer
        .querySelectorAll(".portal")
        .forEach(function (portal) {
            portal.remove();
        });
}


/* =========================================================
   PLACEMENT CLEANUP
========================================================= */

function removePlacementPreview() {

    if (placementPreview) {
        placementPreview.remove();
        placementPreview = null;
    }

    if (placementBoundary) {
        placementBoundary.remove();
        placementBoundary = null;
    }

    placementExistingBoundaries.forEach(function (boundary) {
        boundary.remove();
    });

    placementExistingBoundaries = [];

    if (placementCoreBoundary) {
        placementCoreBoundary.remove();
        placementCoreBoundary = null;
    }
}

function cancelUnitPlacement() {

    placingGunman = false;
    placing999 = false;

    deployGunmanButton.classList.remove("selected");
    deploy999Button.classList.remove("selected");

    removePlacementPreview();
}


/* =========================================================
   RESET
========================================================= */

function resetGameState() {

    gameOver = false;
    gameActive = false;
    gamePaused = false;

    gameStartPending = false;

    if (gameStartTimeout !== null) {
        clearTimeout(gameStartTimeout);
        gameStartTimeout = null;
    }

    if (researchPointTimeout !== null) {
        clearTimeout(researchPointTimeout);
        researchPointTimeout = null;
    }

    if (waveTimeout !== null) {
        clearTimeout(waveTimeout);
        waveTimeout = null;
    }

    if (waveSpawnTimeout !== null) {
        clearTimeout(waveSpawnTimeout);
        waveSpawnTimeout = null;
    }

    removeBattlefieldEntities();

    cancelUnitPlacement();

    if (selected999) {
        selected999.classList.remove("selected");
        selected999 = null;
    }

    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }

    gameStartRemaining = 1000;
    gameStartNextTick = 0;

    researchPointRemaining = 1000;
    researchPointNextTick = 0;

    waveRemaining = 2500;
    waveNextTick = 0;

    waveSpawnRemaining = 900;
    waveSpawnNextTick = 0;

    pauseStartedAt = 0;
    pausedDuration = 0;

    researchPoints = startingResearchPoints;
    coreHealth = maxCoreHealth;

    currentWave = 1;
    waveTotalEnemies = 0;
    waveSpawnedEnemies = 0;
    waveKilledEnemies = 0;
    activeEnemies = 0;
    waveStarting = false;
    pendingEnemySpawns = 0;
    waveSpawningComplete = false;

    totalUnitsPlaced = 0;
    livesLost = 0;
    currentWaveStartTime = 0;
    currentWaveTime = 0;
    totalGameTime = 0;
    gameStartTime = 0;
    finalScore = 0;

    pauseScreen.style.display = "none";

    researchPointsDisplay.textContent = researchPoints;
    coreHealthDisplay.textContent = coreHealth;

    updateWaveDisplay();
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    resetGameState();

    gameActive = true;
    gameOver = false;
    gamePaused = false;

    gameStartTime = performance.now();

    gameStartPending = true;
    gameStartRemaining = 1000;
    gameStartNextTick =
        performance.now() + gameStartRemaining;

    researchPointRemaining = 1000;

    mainMenu.style.display = "none";
    deathScreen.style.display = "none";
    victoryScreen.style.display = "none";
    pauseScreen.style.display = "none";
    gameScreen.style.display = "block";

    playSound("button");

    startResearchPointTimer();
    scheduleGameStart();
}

function scheduleGameStart() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused ||
        !gameStartPending
    ) {
        return;
    }

    if (gameStartTimeout !== null) {
        clearTimeout(gameStartTimeout);
    }

    gameStartNextTick =
        performance.now() + gameStartRemaining;

    gameStartTimeout =
        setTimeout(function () {

            gameStartTimeout = null;
            gameStartRemaining = 1000;
            gameStartNextTick = 0;
            gameStartPending = false;

            if (
                !gameActive ||
                gameOver ||
                gamePaused
            ) {
                return;
            }

            startWave();

        }, gameStartRemaining);
}

playButton.addEventListener("click", startGame);


/* =========================================================
   CURSOR
========================================================= */

document.addEventListener("mousemove", function (event) {

    if (!cursor) {
        return;
    }

    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
});

document.querySelectorAll("button").forEach(function (button) {

    button.addEventListener("mouseenter", function () {

        if (!cursor || !cursorImage) {
            return;
        }

        cursorImage.src =
            "assets/cursor/cursor-hover.png";

        cursor.classList.add("hover");
    });

    button.addEventListener("mouseleave", function () {

        if (!cursor || !cursorImage) {
            return;
        }

        cursorImage.src =
            "assets/cursor/cursor.png";

        cursor.classList.remove("hover");
    });
});


/* =========================================================
   RP TIMER
========================================================= */

function startResearchPointTimer() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused ||
        researchPointTimeout !== null
    ) {
        return;
    }

    researchPointNextTick =
        performance.now() + researchPointRemaining;

    researchPointTimeout =
        setTimeout(function () {

            researchPointTimeout = null;
            researchPointNextTick = 0;

            if (
                !gameActive ||
                gameOver ||
                gamePaused
            ) {
                return;
            }

            researchPoints++;
            researchPointsDisplay.textContent = researchPoints;

            researchPointRemaining = 1000;

            startResearchPointTimer();

        }, researchPointRemaining);
}


/* =========================================================
   WAVE SIZE
========================================================= */

function getWaveEnemyCount(wave) {

    let minimum;
    let maximum;

    if (wave === 1) {
        minimum = 5;
        maximum = 7;
    } else if (wave === 2) {
        minimum = 8;
        maximum = 11;
    } else if (wave === 3) {
        minimum = 11;
        maximum = 15;
    } else if (wave === 4) {
        minimum = 15;
        maximum = 19;
    } else if (wave === 5) {
        minimum = 19;
        maximum = 24;
    } else if (wave === 6) {
        minimum = 23;
        maximum = 28;
    } else if (wave === 7) {
        minimum = 27;
        maximum = 33;
    } else if (wave === 8) {
        minimum = 32;
        maximum = 38;
    } else if (wave === 9) {
        minimum = 38;
        maximum = 44;
    } else {
        minimum = 45;
        maximum = 50;
    }

    return (
        Math.floor(
            Math.random() *
            (maximum - minimum + 1)
        ) + minimum
    );
}


/* =========================================================
   WAVE DISPLAY
========================================================= */

function updateWaveDisplay() {

    waveNumberDisplay.textContent = currentWave;
    waveKilledDisplay.textContent = waveKilledEnemies;
    waveTotalDisplay.textContent = waveTotalEnemies;
}


/* =========================================================
   WAVE START
========================================================= */

function startWave() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    waveStarting = true;
    waveSpawningComplete = false;
    pendingEnemySpawns = 0;
    waveSpawnedEnemies = 0;
    waveKilledEnemies = 0;

    waveTotalEnemies =
        getWaveEnemyCount(currentWave);

    currentWaveStartTime = performance.now();

    waveSpawnRemaining = 900;
    waveSpawnNextTick = 0;

    updateWaveDisplay();

    playSound("waveStart");

    spawnWavePortals();
}


/* =========================================================
   PORTAL SPAWN LOOP
========================================================= */

function spawnWavePortals() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    if (
        waveSpawnedEnemies +
        pendingEnemySpawns >=
        waveTotalEnemies
    ) {

        waveStarting = false;

        if (pendingEnemySpawns <= 0) {
            waveSpawningComplete = true;
            checkWaveComplete();
        }

        return;
    }

    const remaining =
        waveTotalEnemies -
        waveSpawnedEnemies -
        pendingEnemySpawns;

    let enemiesFromPortal =
        Math.floor(Math.random() * 3) + 1;

    enemiesFromPortal =
        Math.min(
            enemiesFromPortal,
            remaining
        );

    const position =
        getRandomPortalPosition();

    spawnPortal(
        position.x,
        position.y,
        enemiesFromPortal
    );

    pendingEnemySpawns += enemiesFromPortal;

    updateWaveDisplay();

    waveSpawnRemaining = 900;
    waveSpawnNextTick =
        performance.now() + waveSpawnRemaining;

    waveSpawnTimeout =
        setTimeout(function () {

            waveSpawnTimeout = null;
            waveSpawnNextTick = 0;
            waveSpawnRemaining = 900;

            if (
                !gameActive ||
                gameOver ||
                gamePaused
            ) {
                return;
            }

            spawnWavePortals();

        }, waveSpawnRemaining);
}


/* =========================================================
   RANDOM PORTAL POSITION
========================================================= */

function getRandomPortalPosition() {

    const coreX = window.innerWidth / 2;
    const coreY = window.innerHeight / 2;

    let x;
    let y;
    let distance;

    do {

        x =
            portalMargin +
            Math.random() *
            (
                window.innerWidth -
                portalMargin * 2
            );

        y =
            portalMargin +
            Math.random() *
            (
                window.innerHeight -
                portalMargin * 2
            );

        distance =
            Math.hypot(
                x - coreX,
                y - coreY
            );

    } while (
        distance <
        minPortalDistance
    );

    return {
        x: x,
        y: y
    };
}


/* =========================================================
   PORTAL
========================================================= */

function spawnPortal(x, y, enemyCount) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return null;
    }

    const portal =
        document.createElement("img");

    portal.className = "portal";

    portal.src =
        "assets/portals/red portal.gif";

    portal.style.left = `${x}px`;
    portal.style.top = `${y}px`;

    if (x > window.innerWidth / 2) {
        portal.classList.add("portal-flipped");
    }

    portal.spawnX = x;
    portal.spawnY = y;

    portal.releaseTimers = [];
    portal.releaseRemaining = [];
    portal.releaseNextTick = [];

    portalContainer.appendChild(portal);

    playSound("portal");

    for (let i = 0; i < enemyCount; i++) {

        const delay = 1000 + i * 700;

        portal.releaseRemaining[i] = delay;
        portal.releaseNextTick[i] =
            performance.now() + delay;

        portal.releaseTimers[i] =
            setTimeout(function () {

                portal.releaseTimers[i] = null;
                portal.releaseRemaining[i] = 0;
                portal.releaseNextTick[i] = 0;

                if (
                    !gameActive ||
                    gameOver ||
                    gamePaused
                ) {
                    return;
                }

                spawnEnemy1(
                    portal.spawnX,
                    portal.spawnY
                );

                pendingEnemySpawns =
                    Math.max(
                        0,
                        pendingEnemySpawns - 1
                    );

                waveSpawnedEnemies++;

                updateWaveDisplay();
                playSound("enemySpawn");

                if (
                    pendingEnemySpawns <= 0 &&
                    waveSpawnedEnemies >= waveTotalEnemies
                ) {

                    waveSpawningComplete = true;
                    waveStarting = false;

                    checkWaveComplete();
                }

            }, delay);
    }

    portal.addEventListener(
        "animationend",
        function () {

            /*
             * The existing red portal is a GIF.
             * JavaScript can freeze its release timers,
             * but cannot freeze the GIF at its current frame.
             */
            if (!gamePaused) {
                portal.remove();
            }
        }
    );

    return portal;
}


/* =========================================================
   ENEMY
========================================================= */

function spawnEnemy1(x, y) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return null;
    }

    const enemy =
        document.createElement("div");

    enemy.className = "enemy-1";

    let enemyX = x;
    let enemyY = y + 50;

    enemy.style.left = `${enemyX}px`;
    enemy.style.top = `${enemyY}px`;

    portalContainer.appendChild(enemy);

    enemySet.add(enemy);
    activeEnemies++;

    enemy.health = 20;
    enemy.maxHealth = 20;
    enemy.damage = 5;
    enemy.attackInterval = 1000;

    enemy.attackTimer = null;
    enemy.attackRemaining = 1000;
    enemy.attackNextTick = 0;

    enemy.dead = false;
    enemy.hasReachedCore = false;
    enemy.attackingCore = false;

    enemy.moveAnimation = null;
    enemy.resumeMovement = null;
    enemy.moveFunction = null;

    const healthBar =
        document.createElement("div");

    healthBar.className = "enemy-healthbar";

    const health =
        document.createElement("div");

    health.className = "enemy-health";

    healthBar.appendChild(health);
    portalContainer.appendChild(healthBar);

    enemy.healthBar = healthBar;
    enemy.healthDisplay = health;

    function attackCore() {

        if (
            enemy.attackingCore ||
            enemy.dead ||
            gamePaused ||
            gameOver
        ) {
            return;
        }

        enemy.attackingCore = true;

        if (
            !Number.isFinite(enemy.attackRemaining) ||
            enemy.attackRemaining <= 0
        ) {
            enemy.attackRemaining =
                enemy.attackInterval;
        }

        enemy.attackNextTick =
            performance.now() +
            enemy.attackRemaining;

        enemy.attackTimer =
            setTimeout(function attackTick() {

                enemy.attackTimer = null;

                if (
                    !gameActive ||
                    gameOver ||
                    gamePaused ||
                    enemy.dead
                ) {
                    return;
                }

                coreHealth -= enemy.damage;
                coreHealth =
                    Math.max(
                        0,
                        coreHealth
                    );

                coreHealthDisplay.textContent =
                    coreHealth;

                playSound("coreHit");

                if (coreHealth <= 0) {
                    enemy.attackingCore = false;
                    endGame(false);
                    return;
                }

                enemy.attackRemaining =
                    enemy.attackInterval;

                enemy.attackNextTick =
                    performance.now() +
                    enemy.attackRemaining;

                enemy.attackTimer =
                    setTimeout(
                        attackTick,
                        enemy.attackRemaining
                    );

            }, enemy.attackRemaining);
    }

    function moveEnemy() {

        enemy.moveAnimation = null;

        if (!gameActive || gameOver) {

            clearEnemyActivity(enemy);

            if (enemy.healthBar) {
                enemy.healthBar.remove();
            }

            enemy.remove();
            enemySet.delete(enemy);

            return;
        }

        if (enemy.dead) {
            return;
        }

        if (gamePaused) {
            enemy.resumeMovement = moveEnemy;
            return;
        }

        enemy.resumeMovement = moveEnemy;

        const coreX = window.innerWidth / 2;
        const coreY = window.innerHeight / 2;

        const dx = coreX - enemyX;
        const dy = coreY - enemyY;

        const distance =
            Math.hypot(dx, dy);

        if (distance <= 70) {

            if (!enemy.hasReachedCore) {

                enemy.hasReachedCore = true;
                livesLost++;

                playSound("coreReached");
            }

            attackCore();

            healthBar.style.left =
                `${enemyX}px`;

            healthBar.style.top =
                `${enemyY - 12}px`;

            if (!gamePaused) {
                enemy.moveAnimation =
                    requestAnimationFrame(moveEnemy);
            }

            return;
        }

        enemyX +=
            (dx / distance) *
            50 /
            60;

        enemyY +=
            (dy / distance) *
            50 /
            60;

        enemy.style.left = `${enemyX}px`;
        enemy.style.top = `${enemyY}px`;

        healthBar.style.left =
            `${enemyX}px`;

        healthBar.style.top =
            `${enemyY - 12}px`;

        enemy.moveAnimation =
            requestAnimationFrame(moveEnemy);
    }

    enemy.moveFunction = moveEnemy;
    enemy.resumeMovement = moveEnemy;
    enemy.moveAnimation =
        requestAnimationFrame(moveEnemy);

    return enemy;
}


/* =========================================================
   RP POPUP
========================================================= */

function showRPPopup(x, y) {

    const popup =
        document.createElement("div");

    popup.className = "rp-popup";
    popup.textContent = "+2 RP";

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    popup.removeTimeout = null;
    popup.removeRemaining = 1000;
    popup.removeNextTick = 0;

    portalContainer.appendChild(popup);

    function schedulePopupRemoval() {

        if (
            !popup.isConnected ||
            gamePaused
        ) {
            return;
        }

        popup.removeNextTick =
            performance.now() +
            popup.removeRemaining;

        popup.removeTimeout =
            setTimeout(function () {

                popup.removeTimeout = null;
                popup.removeRemaining = 0;
                popup.removeNextTick = 0;

                popup.remove();

            }, popup.removeRemaining);
    }

    popup.resumeRemoval = schedulePopupRemoval;

    schedulePopupRemoval();

    return popup;
}


/* =========================================================
   DAMAGE ENEMY
========================================================= */

function damageEnemy(enemy, damage) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused ||
        !enemy ||
        !enemy.isConnected ||
        enemy.dead
    ) {
        return;
    }

    enemy.health -= damage;
    enemy.health =
        Math.max(
            0,
            enemy.health
        );

    enemy.healthDisplay.style.width =
        `${
            (
                enemy.health /
                enemy.maxHealth
            ) * 100
        }%`;

    playSound("enemyHit");

    if (enemy.health <= 0) {

        enemy.dead = true;
        enemy.attackingCore = false;

        clearEnemyActivity(enemy);

        const rect =
            enemy.getBoundingClientRect();

        const enemyX =
            rect.left +
            rect.width / 2;

        const enemyY =
            rect.top +
            rect.height / 2;

        enemy.remove();

        if (enemy.healthBar) {
            enemy.healthBar.remove();
        }

        enemySet.delete(enemy);

        activeEnemies =
            Math.max(
                0,
                activeEnemies - 1
            );

        playSound("enemyDeath");

        if (
            gameActive &&
            !gameOver
        ) {

            researchPoints += 2;

            researchPointsDisplay.textContent =
                researchPoints;

            showRPPopup(
                enemyX,
                enemyY
            );

            playSound("rpGain");

            waveKilledEnemies++;

            updateWaveDisplay();

            checkWaveComplete();
        }
    }
}


/* =========================================================
   WAVE COMPLETE
========================================================= */

function checkWaveComplete() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    if (
        waveSpawningComplete &&
        pendingEnemySpawns <= 0 &&
        waveSpawnedEnemies >= waveTotalEnemies &&
        waveKilledEnemies >= waveTotalEnemies &&
        activeEnemies <= 0
    ) {

        currentWaveTime =
            performance.now() -
            currentWaveStartTime;

        playSound("waveStart");

        startNextWave();
    }
}

function startNextWave() {

    if (
        waveTimeout !== null ||
        gameOver ||
        !gameActive ||
        gamePaused
    ) {
        return;
    }

    if (currentWave >= 10) {
        winGame();
        return;
    }

    waveRemaining = 2500;
    waveNextTick =
        performance.now() + waveRemaining;

    waveTimeout =
        setTimeout(function () {

            waveTimeout = null;
            waveNextTick = 0;
            waveRemaining = 2500;

            if (
                !gameActive ||
                gameOver ||
                gamePaused
            ) {
                return;
            }

            if (currentWave >= 10) {
                if (!xkFinalBreachMode) endGame(true);
                return;
            }
            currentWave++;
            startWave();

        }, waveRemaining);
}


/* =========================================================
   SCORE
========================================================= */

function calculateScore() {

    const totalSeconds =
        totalGameTime / 1000;

    const speedScore =
        Math.max(
            0,
            10000 -
            Math.floor(totalSeconds * 10)
        );

    const unitPenalty =
        totalUnitsPlaced * 50;

    const lifePenalty =
        livesLost * 250;

    const researchPointBonus =
        researchPoints * 10;

    return Math.max(
        0,
        speedScore -
        unitPenalty -
        lifePenalty +
        researchPointBonus
    );
}


/* =========================================================
   STOP ALL GAME ACTIVITY
========================================================= */

function stopAllGameActivity() {

    if (gameStartTimeout !== null) {
        clearTimeout(gameStartTimeout);
        gameStartTimeout = null;
    }

    if (researchPointTimeout !== null) {
        clearTimeout(researchPointTimeout);
        researchPointTimeout = null;
    }

    if (waveTimeout !== null) {
        clearTimeout(waveTimeout);
        waveTimeout = null;
    }

    if (waveSpawnTimeout !== null) {
        clearTimeout(waveSpawnTimeout);
        waveSpawnTimeout = null;
    }

    enemySet.forEach(clearEnemyActivity);
    gunmanSet.forEach(clearGunmanActivity);
    heroSet.forEach(clearHeroActivity);

    portalContainer
        .querySelectorAll(".gunman-projectile")
        .forEach(clearProjectileActivity);

    clearAllPortalReleaseActivity();
}


/* =========================================================
   END GAME
========================================================= */

function endGame(victory) {

    if (gameOver) {
        return;
    }

    gameOver = true;
    gameActive = false;
    gamePaused = false;

    stopAllGameActivity();
    cancelUnitPlacement();

    if (selected999) {
        selected999.classList.remove("selected");
        selected999 = null;
    }

    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }

    pauseScreen.style.display = "none";

    totalGameTime =
        Math.max(
            0,
            performance.now() - gameStartTime
        );

    finalScore =
        calculateScore();

    if (finalScore > highScore) {

        highScore = finalScore;

        localStorage.setItem(
            "xkCalamityHighScore",
            String(highScore)
        );
    }

    if (victory) {

        scoreValue.textContent = finalScore;
        highScoreValue.textContent = highScore;

        finalTime.textContent =
            Math.floor(
                totalGameTime / 1000
            );

        finalUnits.textContent =
            totalUnitsPlaced;

        finalLives.textContent =
            livesLost;

        gameScreen.style.display = "none";
        victoryScreen.style.display = "flex";

        playSound("victory");

    } else {

        deathScoreValue.textContent = finalScore;
        deathHighScoreValue.textContent = highScore;

        gameScreen.style.display = "none";
        deathScreen.style.display = "flex";

        playSound("gameOver");
    }
}

function winGame() {
    endGame(true);
}


/* =========================================================
   PAUSE
========================================================= */

function pauseGame() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    gamePaused = true;
    pauseStartedAt = performance.now();

    const now = performance.now();

    /* ---- main timers ---- */

    if (gameStartTimeout !== null) {

        gameStartRemaining =
            Math.max(
                0,
                gameStartNextTick - now
            );

        clearTimeout(gameStartTimeout);
        gameStartTimeout = null;
    }

    if (researchPointTimeout !== null) {

        researchPointRemaining =
            Math.max(
                0,
                researchPointNextTick - now
            );

        clearTimeout(researchPointTimeout);
        researchPointTimeout = null;
    }

    if (waveSpawnTimeout !== null) {

        waveSpawnRemaining =
            Math.max(
                0,
                waveSpawnNextTick - now
            );

        clearTimeout(waveSpawnTimeout);
        waveSpawnTimeout = null;
    }

    if (waveTimeout !== null) {

        waveRemaining =
            Math.max(
                0,
                waveNextTick - now
            );

        clearTimeout(waveTimeout);
        waveTimeout = null;
    }

    /* ---- enemies ---- */

    enemySet.forEach(function (enemy) {

        if (
            enemy.attackTimer !== null &&
            enemy.attackingCore
        ) {

            enemy.attackRemaining =
                Math.max(
                    0,
                    enemy.attackNextTick - now
                );

            clearTimeout(enemy.attackTimer);
            enemy.attackTimer = null;
        }

        if (enemy.moveAnimation) {
            cancelAnimationFrame(enemy.moveAnimation);
            enemy.moveAnimation = null;
        }

        enemy.resumeMovement =
            enemy.dead
                ? null
                : enemy.moveFunction;
    });

    /* ---- gunmen ---- */

    gunmanSet.forEach(function (gunman) {

        if (gunman.fireTimeout !== null) {

            gunman.fireRemaining =
                Math.max(
                    0,
                    gunman.fireNextTick - now
                );

            clearTimeout(gunman.fireTimeout);
            gunman.fireTimeout = null;
        }

        if (gunman.bstTimeout !== null) {

            gunman.bstRemaining =
                Math.max(
                    0,
                    gunman.bstNextTick - now
                );

            clearTimeout(gunman.bstTimeout);
            gunman.bstTimeout = null;
        }
    });

    /* ---- projectiles ---- */

    portalContainer
        .querySelectorAll(".gunman-projectile")
        .forEach(function (projectile) {

            if (projectile.moveAnimation) {
                cancelAnimationFrame(
                    projectile.moveAnimation
                );

                projectile.moveAnimation = null;
            }
        });

    /* ---- SCP-999 ---- */

    heroSet.forEach(function (hero) {

        if (hero.moveAnimation) {
            cancelAnimationFrame(
                hero.moveAnimation
            );

            hero.moveAnimation = null;
        }
    });

    /* ---- portal release timers ---- */

    portalContainer
        .querySelectorAll(".portal")
        .forEach(function (portal) {

            if (!portal.releaseTimers) {
                return;
            }

            portal.releaseTimers.forEach(
                function (timer, index) {

                    if (timer === null) {
                        return;
                    }

                    portal.releaseRemaining[index] =
                        Math.max(
                            0,
                            portal.releaseNextTick[index] -
                            now
                        );

                    clearTimeout(timer);

                    portal.releaseTimers[index] =
                        null;
                }
            );
        });

    /* ---- RP popup removal ---- */

    portalContainer
        .querySelectorAll(".rp-popup")
        .forEach(function (popup) {

            if (popup.removeTimeout !== null) {

                popup.removeRemaining =
                    Math.max(
                        0,
                        popup.removeNextTick - now
                    );

                clearTimeout(popup.removeTimeout);

                popup.removeTimeout = null;
            }
        });

    pauseScreen.style.display = "flex";
}


/* =========================================================
   RESUME
========================================================= */

function resumeGame() {

    if (
        !gamePaused ||
        !gameActive ||
        gameOver
    ) {
        return;
    }

    const now = performance.now();

    const pauseDuration =
        Math.max(
            0,
            now - pauseStartedAt
        );

    pausedDuration += pauseDuration;

    /*
     * Paused time is removed from both clocks.
     */
    gameStartTime += pauseDuration;

    if (currentWaveStartTime > 0) {
        currentWaveStartTime += pauseDuration;
    }

    gamePaused = false;
    pauseScreen.style.display = "none";

    /* ---- game start ---- */

    if (
        gameStartPending &&
        gameStartRemaining > 0
    ) {
        scheduleGameStart();
    }

    /* ---- RP ---- */

    startResearchPointTimer();

    /* ---- portal spawn timer ---- */

    if (
        waveSpawnTimeout === null &&
        waveStarting &&
        !waveSpawningComplete
    ) {

        waveSpawnNextTick =
            performance.now() +
            waveSpawnRemaining;

        waveSpawnTimeout =
            setTimeout(function () {

                waveSpawnTimeout = null;
                waveSpawnNextTick = 0;
                waveSpawnRemaining = 900;

                if (
                    !gameActive ||
                    gameOver ||
                    gamePaused
                ) {
                    return;
                }

                spawnWavePortals();

            }, waveSpawnRemaining);
    }

    /* ---- next wave timer ---- */

    if (
        waveTimeout === null &&
        waveRemaining > 0 &&
        !waveStarting
    ) {

        waveNextTick =
            performance.now() +
            waveRemaining;

        waveTimeout =
            setTimeout(function () {

                waveTimeout = null;
                waveNextTick = 0;
                waveRemaining = 2500;

                if (
                    !gameActive ||
                    gameOver ||
                    gamePaused
                ) {
                    return;
                }

                if (currentWave >= 10) {
                    if (!xkFinalBreachMode) endGame(true);
                    return;
                }
                currentWave++;
                startWave();

            }, waveRemaining);
    }

    /* ---- enemy attacks ---- */

    enemySet.forEach(function (enemy) {

        if (
            enemy.dead ||
            !enemy.attackingCore ||
            enemy.attackTimer !== null
        ) {
            return;
        }

        const remaining =
            Math.max(
                0,
                Number(enemy.attackRemaining) ||
                enemy.attackInterval
            );

        enemy.attackNextTick =
            performance.now() + remaining;

        enemy.attackTimer =
            setTimeout(function attackTick() {

                enemy.attackTimer = null;

                if (
                    !gameActive ||
                    gameOver ||
                    gamePaused ||
                    enemy.dead
                ) {
                    return;
                }

                coreHealth -= enemy.damage;

                coreHealth =
                    Math.max(
                        0,
                        coreHealth
                    );

                coreHealthDisplay.textContent =
                    coreHealth;

                playSound("coreHit");

                if (coreHealth <= 0) {

                    enemy.attackingCore = false;

                    endGame(false);

                    return;
                }

                enemy.attackRemaining =
                    enemy.attackInterval;

                enemy.attackNextTick =
                    performance.now() +
                    enemy.attackRemaining;

                enemy.attackTimer =
                    setTimeout(
                        attackTick,
                        enemy.attackRemaining
                    );

            }, remaining);
    });

    /* ---- enemy movement ---- */

    enemySet.forEach(function (enemy) {

        if (
            enemy.dead ||
            !enemy.moveFunction ||
            enemy.moveAnimation
        ) {
            return;
        }

        enemy.resumeMovement = enemy.moveFunction;

        enemy.moveAnimation =
            requestAnimationFrame(
                enemy.moveFunction
            );
    });

    /* ---- gunmen ---- */

    gunmanSet.forEach(function (gunman) {

        if (
            gunman.fireTimeout !== null ||
            !gunman.fireFunction
        ) {
            return;
        }

        let remaining =
            Number(gunman.fireRemaining);

        if (
            !Number.isFinite(remaining) ||
            remaining <= 0
        ) {
            remaining =
                gunman.fireRate;
        }

        gunman.fireNextTick =
            performance.now() + remaining;

        gunman.fireTimeout =
            setTimeout(
                gunman.fireFunction,
                remaining
            );
    });

    /* ---- projectiles ---- */

    portalContainer
        .querySelectorAll(".gunman-projectile")
        .forEach(function (projectile) {

            if (
                projectile.resumeMovement &&
                !projectile.moveAnimation
            ) {
                projectile.resumeMovement();
            }
        });

    /* ---- SCP-999 ---- */

    heroSet.forEach(function (hero) {

        if (
            hero.resumeMovement &&
            !hero.moveAnimation
        ) {
            hero.resumeMovement();
        }
    });

    /* ---- BST ---- */

    gunmanSet.forEach(function (gunman) {

        if (
            gunman.bstTimeout !== null ||
            gunman.bstRemaining <= 0 ||
            gunman.dataset.bstActive !== "true"
        ) {
            return;
        }

        gunman.bstNextTick =
            performance.now() +
            gunman.bstRemaining;

        gunman.bstTimeout =
            setTimeout(function () {

                gunman.bstTimeout = null;
                gunman.bstRemaining = 0;
                gunman.bstNextTick = 0;

                if (!gunman.isConnected) {
                    return;
                }

                gunman.dataset.bstActive = "false";

                const label =
                    gunman.querySelector(".bst-label");

                if (label) {
                    label.remove();
                }

            }, gunman.bstRemaining);
    });

    /* ---- portal enemy release timers ---- */

    portalContainer
        .querySelectorAll(".portal")
        .forEach(function (portal) {

            if (!portal.releaseTimers) {
                return;
            }

            portal.releaseTimers.forEach(
                function (timer, index) {

                    if (
                        timer !== null ||
                        portal.releaseRemaining[index] <= 0
                    ) {
                        return;
                    }

                    const remaining =
                        portal.releaseRemaining[index];

                    portal.releaseNextTick[index] =
                        performance.now() + remaining;

                    portal.releaseTimers[index] =
                        setTimeout(function () {

                            portal.releaseTimers[index] = null;
                            portal.releaseRemaining[index] = 0;
                            portal.releaseNextTick[index] = 0;

                            if (
                                !gameActive ||
                                gameOver ||
                                gamePaused
                            ) {
                                return;
                            }

                            spawnEnemy1(
                                portal.spawnX,
                                portal.spawnY
                            );

                            pendingEnemySpawns =
                                Math.max(
                                    0,
                                    pendingEnemySpawns - 1
                                );

                            waveSpawnedEnemies++;

                            updateWaveDisplay();
                            playSound("enemySpawn");

                            if (
                                pendingEnemySpawns <= 0 &&
                                waveSpawnedEnemies >= waveTotalEnemies
                            ) {

                                waveSpawningComplete = true;
                                waveStarting = false;

                                checkWaveComplete();
                            }

                        }, remaining);
                }
            );
        });

    /* ---- RP popups ---- */

    portalContainer
        .querySelectorAll(".rp-popup")
        .forEach(function (popup) {

            if (
                popup.removeTimeout === null &&
                popup.removeRemaining > 0
            ) {

                popup.removeNextTick =
                    performance.now() +
                    popup.removeRemaining;

                popup.removeTimeout =
                    setTimeout(function () {

                        popup.removeTimeout = null;
                        popup.removeRemaining = 0;
                        popup.removeNextTick = 0;

                        popup.remove();

                    }, popup.removeRemaining);
            }
        });
}


/* =========================================================
   VALID UNIT POSITION
========================================================= */

function isValidUnitPosition(x, y) {

    if (
        x < battlefieldMargin ||
        x > window.innerWidth - battlefieldMargin ||
        y < battlefieldMargin ||
        y > window.innerHeight - battlefieldMargin
    ) {
        return false;
    }

    const coreX = window.innerWidth / 2;
    const coreY = window.innerHeight / 2;

    if (
        Math.hypot(
            x - coreX,
            y - coreY
        ) < minUnitCoreDistance
    ) {
        return false;
    }

    let valid = true;

    gunmanSet.forEach(function (gunman) {

        if (!gunman.isConnected) {
            return;
        }

        const gunmanX =
            parseFloat(gunman.style.left);

        const gunmanY =
            parseFloat(gunman.style.top);

        if (
            Math.hypot(
                x - gunmanX,
                y - gunmanY
            ) < minUnitDistance
        ) {
            valid = false;
        }
    });

    heroSet.forEach(function (hero) {

        if (!hero.isConnected) {
            return;
        }

        if (
            Math.hypot(
                x - hero.x,
                y - hero.y
            ) < minUnitDistance
        ) {
            valid = false;
        }
    });

    return valid;
}


/* =========================================================
   UNIT SELECTION
========================================================= */

function selectGunman() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    if (placingGunman) {

        cancelUnitPlacement();
        playSound("select");

        return;
    }

    if (researchPoints < 5) {
        playSound("invalid");
        return;
    }

    placing999 = false;
    deploy999Button.classList.remove("selected");

    if (selected999) {
        selected999.classList.remove("selected");
        selected999 = null;
    }

    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }

    placingGunman = true;

    deployGunmanButton.classList.add("selected");

    createPlacementPreview("gunman");

    playSound("select");
}

function select999() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    if (placing999) {

        cancelUnitPlacement();
        playSound("select");

        return;
    }

    if (researchPoints < 50) {
        playSound("invalid");
        return;
    }

    placingGunman = false;
    deployGunmanButton.classList.remove("selected");

    if (selected999) {
        selected999.classList.remove("selected");
        selected999 = null;
    }

    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }

    placing999 = true;

    deploy999Button.classList.add("selected");

    createPlacementPreview("999");

    playSound("select");
}

deployGunmanButton.addEventListener(
    "click",
    function (event) {
        event.stopPropagation();
        selectGunman();
    }
);

deploy999Button.addEventListener(
    "click",
    function (event) {
        event.stopPropagation();
        select999();
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.target &&
            (
                event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA"
            )
        ) {
            return;
        }

        if (event.repeat) {
            return;
        }

        if (event.key === "Escape") {

            if (
                !gameActive ||
                gameOver
            ) {
                return;
            }

            event.preventDefault();

            if (gamePaused) {
                resumeGame();
            } else {
                pauseGame();
            }

            return;
        }

        if (gamePaused) {
            return;
        }

        if (event.key === "1") {

            event.preventDefault();
            selectGunman();

            return;
        }

        if (event.key === "2") {

            event.preventDefault();
            select999();
        }
    }
);


/* =========================================================
   PLACEMENT PREVIEW
========================================================= */

function createPlacementPreview(type) {

    removePlacementPreview();

    placementPreview =
        document.createElement("div");

    placementPreview.className =
        "unit-placement-preview";

    if (type === "gunman") {
        placementPreview.classList.add(
            "gunman-placement-preview"
        );
    }

    if (type === "999") {
        placementPreview.classList.add(
            "scp999-placement-preview"
        );
    }

    placementPreview.style.pointerEvents = "none";

    portalContainer.appendChild(placementPreview);

    placementBoundary =
        document.createElement("div");

    placementBoundary.className =
        "unit-placement-boundary";

    placementBoundary.style.width =
        `${unitSpacingDiameter}px`;

    placementBoundary.style.height =
        `${unitSpacingDiameter}px`;

    placementBoundary.style.pointerEvents = "none";

    portalContainer.appendChild(placementBoundary);

    gunmanSet.forEach(createExistingUnitBoundary);
    heroSet.forEach(createExistingUnitBoundary);

    if (core) {

        const coreRect =
            core.getBoundingClientRect();

        const gameRect =
            gameScreen.getBoundingClientRect();

        placementCoreBoundary =
            document.createElement("div");

        placementCoreBoundary.className =
            "core-placement-boundary";

        placementCoreBoundary.style.left =
            `${
                coreRect.left -
                gameRect.left +
                coreRect.width / 2
            }px`;

        placementCoreBoundary.style.top =
            `${
                coreRect.top -
                gameRect.top +
                coreRect.height / 2
            }px`;

        placementCoreBoundary.style.pointerEvents =
            "none";

        portalContainer.appendChild(
            placementCoreBoundary
        );
    }

    updatePlacementPreview(
        window.innerWidth / 2,
        window.innerHeight / 2
    );
}

function createExistingUnitBoundary(unit) {

    if (
        !unit ||
        !unit.isConnected
    ) {
        return;
    }

    const boundary =
        document.createElement("div");

    boundary.className =
        "unit-placement-existing-boundary";

    boundary.style.width =
        `${unitSpacingDiameter}px`;

    boundary.style.height =
        `${unitSpacingDiameter}px`;

    boundary.style.pointerEvents = "none";

    const x =
        unit.classList.contains("scp-999")
            ? unit.x
            : parseFloat(unit.style.left);

    const y =
        unit.classList.contains("scp-999")
            ? unit.y
            : parseFloat(unit.style.top);

    boundary.style.left = `${x}px`;
    boundary.style.top = `${y}px`;

    portalContainer.appendChild(boundary);

    placementExistingBoundaries.push(boundary);
}

function updatePlacementPreview(x, y) {

    if (!placementPreview) {
        return;
    }

    placementPreview.style.left = `${x}px`;
    placementPreview.style.top = `${y}px`;

    if (placementBoundary) {
        placementBoundary.style.left = `${x}px`;
        placementBoundary.style.top = `${y}px`;
    }

    const valid =
        isValidUnitPosition(x, y);

    placementPreview.classList.toggle(
        "invalid",
        !valid
    );

    if (placementBoundary) {
        placementBoundary.classList.toggle(
            "invalid",
            !valid
        );
    }
}


/* =========================================================
   PLACEMENT MOVEMENT
========================================================= */

gameScreen.addEventListener(
    "mousemove",
    function (event) {

        if (
            gamePaused ||
            (!placingGunman && !placing999)
        ) {
            return;
        }

        const rect =
            gameScreen.getBoundingClientRect();

        updatePlacementPreview(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }
);


/* =========================================================
   GAME SCREEN CLICK
========================================================= */

gameScreen.addEventListener(
    "click",
    function (event) {

        if (
            event.target.closest &&
            event.target.closest("button")
        ) {
            return;
        }

        if (gamePaused) {
            return;
        }

        const rect =
            gameScreen.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        if (placingGunman) {

            if (!isValidUnitPosition(x, y)) {
                playSound("invalid");
                return;
            }

            if (researchPoints < 5) {
                playSound("invalid");
                return;
            }

            researchPoints -= 5;
            researchPointsDisplay.textContent =
                researchPoints;

            totalUnitsPlaced++;

            spawnGunman(x, y);

            playSound("gunmanPlace");

            cancelUnitPlacement();

            return;
        }

        if (placing999) {

            if (!isValidUnitPosition(x, y)) {
                playSound("invalid");
                return;
            }

            if (researchPoints < 50) {
                playSound("invalid");
                return;
            }

            researchPoints -= 50;
            researchPointsDisplay.textContent =
                researchPoints;

            totalUnitsPlaced++;

            spawn999(x, y);

            playSound("gunmanPlace");

            cancelUnitPlacement();

            return;
        }

        if (selected999) {

            if (!selected999.isConnected) {
                selected999 = null;
                return;
            }

            create999Waypoint(x, y);

            move999(
                selected999,
                x,
                y
            );
        }
    }
);


/* =========================================================
   GUNMAN
========================================================= */

function spawnGunman(x, y) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return null;
    }

    const gunman =
        document.createElement("div");

    gunman.className = "gunman";

    gunman.style.left = `${x}px`;
    gunman.style.top = `${y}px`;

    portalContainer.appendChild(gunman);

    gunman.health = 50;
    gunman.maxHealth = 50;

    gunman.fireRate = 1000;
    gunman.fireRemaining = 1000;
    gunman.fireNextTick = 0;
    gunman.fireTimeout = null;
    gunman.fireFunction = null;

    gunman.gunmanDamage = 5;
    gunman.gunmanRange = 200;

    gunman.bstTimeout = null;
    gunman.bstRemaining = 0;
    gunman.bstNextTick = 0;

    const healthBar =
        document.createElement("div");

    healthBar.className =
        "gunman-healthbar";

    const health =
        document.createElement("div");

    health.className =
        "gunman-health";

    healthBar.appendChild(health);
    portalContainer.appendChild(healthBar);

    gunman.healthBar = healthBar;
    gunman.healthDisplay = health;

    healthBar.style.left = `${x}px`;
    healthBar.style.top = `${y - 15}px`;

    function fireGunman() {

        gunman.fireTimeout = null;

        if (
            !gameActive ||
            gameOver ||
            gamePaused ||
            !gunman.isConnected
        ) {
            return;
        }

        const rangeSquared =
            gunman.gunmanRange *
            gunman.gunmanRange;

        let nearestEnemy = null;
        let nearestDistanceSquared = rangeSquared;

        enemySet.forEach(function (enemy) {

            if (
                !enemy.isConnected ||
                enemy.dead
            ) {
                return;
            }

            const rect =
                enemy.getBoundingClientRect();

            const enemyX =
                rect.left +
                rect.width / 2;

            const enemyY =
                rect.top +
                rect.height / 2;

            const dx = enemyX - x;
            const dy = enemyY - y;

            const distanceSquared =
                dx * dx + dy * dy;

            if (
                distanceSquared <=
                nearestDistanceSquared
            ) {

                nearestDistanceSquared =
                    distanceSquared;

                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {

            playSound("gunmanShot");

            fireGunmanProjectile(
                x,
                y,
                nearestEnemy,
                gunman.gunmanDamage
            );
        }

        gunman.fireRemaining =
            gunman.fireRate;

        gunman.fireNextTick =
            performance.now() +
            gunman.fireRemaining;

        gunman.fireTimeout =
            setTimeout(
                fireGunman,
                gunman.fireRemaining
            );
    }

    gunman.fireFunction = fireGunman;

    gunman.fireNextTick =
        performance.now() +
        gunman.fireRemaining;

    gunman.fireTimeout =
        setTimeout(
            fireGunman,
            gunman.fireRemaining
        );

    gunmanSet.add(gunman);

    update999Buffs();

    return gunman;
}


/* =========================================================
   DAMAGE GUNMAN
========================================================= */

function damageGunman(gunman, damage) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused ||
        !gunman ||
        !gunman.isConnected ||
        gunman.health <= 0
    ) {
        return;
    }

    gunman.health -= damage;
    gunman.health =
        Math.max(
            0,
            gunman.health
        );

    gunman.healthDisplay.style.width =
        `${
            (
                gunman.health /
                gunman.maxHealth
            ) * 100
        }%`;

    if (gunman.health <= 0) {

        clearGunmanActivity(gunman);

        gunmanSet.delete(gunman);

        if (gunman.healthBar) {
            gunman.healthBar.remove();
        }

        gunman.remove();

        update999Buffs();
    }
}


/* =========================================================
   PROJECTILES
========================================================= */

function fireGunmanProjectile(
    startX,
    startY,
    enemy,
    damage
) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return null;
    }

    const projectile =
        document.createElement("div");

    projectile.className =
        "gunman-projectile";

    projectile.style.left = `${startX}px`;
    projectile.style.top = `${startY}px`;

    portalContainer.appendChild(projectile);

    let projectileX = startX;
    let projectileY = startY;

    const projectileSpeed = 500;

    projectile.moveAnimation = null;
    projectile.resumeMovement = null;

    function moveProjectile() {

        projectile.moveAnimation = null;

        if (
            !gameActive ||
            gameOver
        ) {
            clearProjectileActivity(projectile);
            projectile.remove();
            return;
        }

        if (gamePaused) {
            projectile.resumeMovement =
                moveProjectile;
            return;
        }

        if (
            !enemy.isConnected ||
            enemy.dead
        ) {
            clearProjectileActivity(projectile);
            projectile.remove();
            return;
        }

        const rect =
            enemy.getBoundingClientRect();

        const enemyX =
            rect.left +
            rect.width / 2;

        const enemyY =
            rect.top +
            rect.height / 2;

        const dx =
            enemyX - projectileX;

        const dy =
            enemyY - projectileY;

        const distance =
            Math.hypot(dx, dy);

        if (
            distance <=
            rect.width / 2 + 5
        ) {

            damageEnemy(
                enemy,
                damage
            );

            clearProjectileActivity(projectile);
            projectile.remove();

            return;
        }

        projectileX +=
            (dx / distance) *
            projectileSpeed /
            60;

        projectileY +=
            (dy / distance) *
            projectileSpeed /
            60;

        projectile.style.left =
            `${projectileX}px`;

        projectile.style.top =
            `${projectileY}px`;

        projectile.resumeMovement =
            moveProjectile;

        projectile.moveAnimation =
            requestAnimationFrame(
                moveProjectile
            );
    }

    projectile.resumeMovement =
        moveProjectile;

    projectile.moveAnimation =
        requestAnimationFrame(
            moveProjectile
        );

    return projectile;
}


/* =========================================================
   SCP-999
========================================================= */

function spawn999(x, y) {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return null;
    }

    const hero =
        document.createElement("div");

    hero.className = "scp-999";

    hero.x = x;
    hero.y = y;

    hero.targetX = x;
    hero.targetY = y;

    hero.style.left = `${x}px`;
    hero.style.top = `${y}px`;

    hero.dataset.x = x;
    hero.dataset.y = y;

    hero.moveAnimation = null;
    hero.resumeMovement = null;

    const buffRange =
        document.createElement("div");

    buffRange.className =
        "scp-999-buff-range";

    hero.appendChild(buffRange);

    hero.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (
                !gameActive ||
                gameOver ||
                gamePaused
            ) {
                return;
            }

            if (
                placingGunman ||
                placing999
            ) {
                return;
            }

            if (
                selected999 &&
                selected999 !== hero
            ) {
                selected999.classList.remove("selected");
            }

            selected999 = hero;

            hero.classList.add("selected");

            playSound("select");
        }
    );

    portalContainer.appendChild(hero);
    heroSet.add(hero);

    update999Buffs();

    return hero;
}


/* =========================================================
   SCP-999 BUFFS
========================================================= */

function update999Buffs() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {
        return;
    }

    gunmanSet.forEach(function (gunman) {

        if (!gunman.isConnected) {
            return;
        }

        const gunmanX =
            parseFloat(gunman.style.left);

        const gunmanY =
            parseFloat(gunman.style.top);

        let insideBuffRange = false;

        heroSet.forEach(function (hero) {

            if (!hero.isConnected) {
                return;
            }

            if (
                Math.hypot(
                    hero.x - gunmanX,
                    hero.y - gunmanY
                ) <= scp999BuffRange
            ) {
                insideBuffRange = true;
            }
        });

        if (insideBuffRange) {
            applyBST(gunman);
        } else {
            startBSTGracePeriod(gunman);
        }
    });
}


/* =========================================================
   BST
========================================================= */

function applyBST(gunman) {

    if (
        !gunman ||
        !gunman.isConnected
    ) {
        return;
    }

    gunman.dataset.bstActive = "true";

    if (gunman.bstTimeout !== null) {
        clearTimeout(gunman.bstTimeout);
        gunman.bstTimeout = null;
    }

    gunman.bstRemaining = 0;
    gunman.bstNextTick = 0;

    let label =
        gunman.querySelector(".bst-label");

    if (!label) {

        label =
            document.createElement("div");

        label.className = "bst-label";
        label.textContent = "BST";

        gunman.appendChild(label);
    }

    label.style.opacity = "1";
}

function startBSTGracePeriod(gunman) {

    if (
        !gunman ||
        !gunman.isConnected ||
        gamePaused ||
        gunman.dataset.bstActive !== "true" ||
        gunman.bstTimeout !== null
    ) {
        return;
    }

    if (
        !Number.isFinite(gunman.bstRemaining) ||
        gunman.bstRemaining <= 0
    ) {
        gunman.bstRemaining =
            scp999BuffGracePeriod;
    }

    gunman.bstNextTick =
        performance.now() +
        gunman.bstRemaining;

    gunman.bstTimeout =
        setTimeout(function () {

            gunman.bstTimeout = null;
            gunman.bstRemaining = 0;
            gunman.bstNextTick = 0;

            if (!gunman.isConnected) {
                return;
            }

            gunman.dataset.bstActive = "false";

            const label =
                gunman.querySelector(".bst-label");

            if (label) {
                label.remove();
            }

        }, gunman.bstRemaining);
}


/* =========================================================
   SCP-999 MOVEMENT
========================================================= */

function move999(hero, targetX, targetY) {

    if (
        !hero ||
        !hero.isConnected ||
        gamePaused
    ) {
        return;
    }

    if (hero.moveAnimation) {
        cancelAnimationFrame(hero.moveAnimation);
        hero.moveAnimation = null;
    }

    hero.targetX = targetX;
    hero.targetY = targetY;

    let lastTime = performance.now();

    function resumeHeroMovement() {

        if (
            !gameActive ||
            gameOver ||
            gamePaused ||
            !hero.isConnected
        ) {
            return;
        }

        lastTime = performance.now();

        if (!hero.moveAnimation) {
            hero.moveAnimation =
                requestAnimationFrame(animate);
        }
    }

    function animate(currentTime) {

        hero.moveAnimation = null;

        if (
            !gameActive ||
            gameOver
        ) {
            hero.resumeMovement = null;
            return;
        }

        if (gamePaused) {
            hero.resumeMovement =
                resumeHeroMovement;
            return;
        }

        const deltaTime =
            Math.min(
                0.1,
                Math.max(
                    0,
                    (currentTime - lastTime) / 1000
                )
            );

        lastTime = currentTime;

        const dx =
            hero.targetX - hero.x;

        const dy =
            hero.targetY - hero.y;

        const distance =
            Math.hypot(dx, dy);

        if (distance <= 3) {

            hero.x = hero.targetX;
            hero.y = hero.targetY;

            hero.style.left = `${hero.x}px`;
            hero.style.top = `${hero.y}px`;

            hero.dataset.x = hero.x;
            hero.dataset.y = hero.y;

            update999Buffs();

            hero.moveAnimation = null;
            hero.resumeMovement = null;

            if (selected999Waypoint) {
                selected999Waypoint.remove();
                selected999Waypoint = null;
            }

            return;
        }

        const movement =
            Math.min(
                scp999MoveSpeed * deltaTime,
                distance
            );

        hero.x +=
            (dx / distance) *
            movement;

        hero.y +=
            (dy / distance) *
            movement;

        hero.style.left = `${hero.x}px`;
        hero.style.top = `${hero.y}px`;

        hero.dataset.x = hero.x;
        hero.dataset.y = hero.y;

        update999Buffs();

        hero.resumeMovement =
            resumeHeroMovement;

        hero.moveAnimation =
            requestAnimationFrame(
                animate
            );
    }

    hero.resumeMovement =
        resumeHeroMovement;

    hero.moveAnimation =
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   SCP-999 WAYPOINT
========================================================= */

function create999Waypoint(x, y) {

    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }

    const waypoint =
        document.createElement("div");

    waypoint.className =
        "scp-999-waypoint";

    waypoint.style.left = `${x}px`;
    waypoint.style.top = `${y}px`;

    portalContainer.appendChild(waypoint);

    selected999Waypoint = waypoint;

    return waypoint;
}


/* =========================================================
   MENU / RESTART BUTTONS
========================================================= */

restartButton.addEventListener(
    "click",
    startGame
);

victoryRestartButton.addEventListener(
    "click",
    startGame
);

menuButton.addEventListener(
    "click",
    function () {

        playSound("button");

        resetGameState();

        gameScreen.style.display = "none";
        deathScreen.style.display = "none";
        victoryScreen.style.display = "none";
        pauseScreen.style.display = "none";
        mainMenu.style.display = "flex";
    }
);

victoryMenuButton.addEventListener(
    "click",
    function () {

        playSound("button");

        resetGameState();

        gameScreen.style.display = "none";
        deathScreen.style.display = "none";
        victoryScreen.style.display = "none";
        pauseScreen.style.display = "none";
        mainMenu.style.display = "flex";
    }
);


/* =========================================================
   PAUSE BUTTONS
========================================================= */

resumeButton.addEventListener(
    "click",
    resumeGame
);

pauseMenuButton.addEventListener(
    "click",
    function () {

        playSound("button");

        resetGameState();

        gameScreen.style.display = "none";
        deathScreen.style.display = "none";
        victoryScreen.style.display = "none";
        pauseScreen.style.display = "none";
        mainMenu.style.display = "flex";
    }
);


/* =========================================================
   TOUCH PLACEMENT
========================================================= */

function updatePlacementFromTouch(event) {

    if (
        gamePaused ||
        (!placingGunman && !placing999)
    ) {
        return;
    }

    if (
        !event.touches ||
        event.touches.length === 0
    ) {
        return;
    }

    event.preventDefault();

    const touch = event.touches[0];

    const rect =
        gameScreen.getBoundingClientRect();

    updatePlacementPreview(
        touch.clientX - rect.left,
        touch.clientY - rect.top
    );
}

gameScreen.addEventListener(
    "touchmove",
    updatePlacementFromTouch,
    {
        passive: false
    }
);


/* =========================================================
   INITIAL UI
========================================================= */

updateWaveDisplay();
researchPointsDisplay.textContent = researchPoints;
coreHealthDisplay.textContent = coreHealth;

let xkRoundPrepTimeout = null;
let xkRoundPrepRemaining = 10000;
let xkRoundPrepNextTick = 0;
let xkRoundPrepActive = false;
let xkAutoPlayRounds = false;
let xkCompletedWaves = 0;
let xkRoundPopupTimeout = null;
let xkRoundPopupRemaining = 0;
let xkRoundPopupNextTick = 0;
let xkScoreRefreshTimeout = null;
let xkScoreRefreshRemaining = 500;
let xkScoreRefreshNextTick = 0;
let xkMobile = false;

function xkIsMobile() {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
}

function xkInjectFeatureStyles() {
    if (document.getElementById("xk-feature-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "xk-feature-styles";
    style.textContent = `
        #xk-round-panel {
            position: absolute;
            left: 50%;
            top: 18px;
            transform: translateX(-50%);
            z-index: 3000;
            min-width: 220px;
            padding: 10px 16px;
            text-align: center;
            background: rgba(0,0,0,.78);
            color: #fff;
            border: 1px solid rgba(255,255,255,.35);
            font-family: inherit;
            pointer-events: auto;
        }
        #xk-round-title { font-size: 20px; font-weight: 700; }
        #xk-round-countdown { font-size: 13px; opacity: .85; margin-top: 4px; }
        #xk-round-actions { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:8px; }
        #xk-round-actions button, #xk-pause-button, #xk-deselect-999, #xk-auto-rounds {
            min-height: 42px;
            padding: 8px 12px;
            font: inherit;
            cursor: pointer;
        }
        #xk-auto-rounds[data-on="true"] { outline: 2px solid currentColor; }
        #xk-selected-999 {
            position: absolute;
            right: 16px;
            top: 90px;
            z-index: 2500;
            min-width: 190px;
            padding: 8px 10px;
            background: rgba(0,0,0,.72);
            color: #fff;
            border: 1px solid rgba(255,255,255,.3);
            font-family: inherit;
            text-align: left;
        }
        #xk-score-hud {
            position: absolute;
            left: 16px;
            top: 90px;
            z-index: 2500;
            padding: 8px 10px;
            background: rgba(0,0,0,.72);
            color: #fff;
            border: 1px solid rgba(255,255,255,.3);
            font-family: inherit;
            line-height: 1.35;
        }
        #xk-score-legend {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 2400;
            width: 190px;
            max-width: calc(100vw - 32px);
            padding: 10px;
            background: rgba(0,0,0,.78);
            color: #fff;
            border: 1px solid rgba(255,255,255,.3);
            font-family: inherit;
            font-size: 12px;
        }
        #xk-score-legend table, #xk-score-breakdown table {
            width: 100%; border-collapse: collapse;
        }
        #xk-score-legend td, #xk-score-breakdown td, #xk-score-breakdown th {
            padding: 4px 5px; border-bottom: 1px solid rgba(255,255,255,.14); text-align:left;
        }
        .xk-score-breakdown {
            margin: 16px auto;
            width: min(560px, 92vw);
            padding: 12px;
            background: rgba(0,0,0,.12);
            border: 1px solid rgba(127,127,127,.35);
            text-align: left;
        }
        #xk-score-breakdown h3 { margin: 0 0 8px; }
        #xk-live-highscore { opacity: .8; }
        #xk-pause-button {
            position: absolute;
            right: 16px;
            top: 16px;
            z-index: 4000;
        }
        .gunman-healthbar {
            position: absolute;
            width: 34px;
            height: 5px;
            transform: translate(-50%, -50%);
            background: #202020;
            border: 1px solid rgba(255,255,255,.8);
            box-sizing: border-box;
            pointer-events: none;
            z-index: 35;
        }

        .gunman-health {
            width: 100%;
            height: 100%;
            background: #35e06f;
            transform-origin: left center;
        }

        .xk-health-label {
            position: absolute;
            transform: translate(-50%, -100%);
            font-size: 10px;
            line-height: 1;
            color: #fff;
            background: rgba(0,0,0,.75);
            padding: 2px 4px;
            pointer-events: none;
            white-space: nowrap;
            z-index: 36;
        }
        .xk-selected-999-badge {
            position: absolute;
            transform: translate(-50%, -160%);
            padding: 2px 5px;
            background: rgba(255,255,255,.9);
            color: #111;
            font-size: 10px;
            font-weight: 700;
            pointer-events: none;
            z-index: 2600;
        }
        @media (pointer: coarse) {
            #custom-cursor { display: none !important; }
            body, button, #game-screen { cursor: auto !important; }
            #xk-score-legend { left: 8px; top: auto; bottom: 72px; transform: none; width: 170px; }
            #xk-score-hud { left: 8px; top: 76px; }
            #xk-selected-999 { right: 8px; top: 76px; min-width: 160px; }
            #xk-pause-button { right: 8px; top: 8px; min-height: 48px; }
            #xk-round-panel { top: 62px; min-width: 210px; max-width: calc(100vw - 20px); }
            #xk-round-actions button { min-height: 46px; }
            #xk-score-breakdown { max-height: 48vh; overflow: auto; }
        }
    `;
    document.head.appendChild(style);
}

function xkEnsureFeatureUI() {
    xkInjectFeatureStyles();

    if (!document.getElementById("xk-round-panel")) {
        const panel = document.createElement("div");
        panel.id = "xk-round-panel";
        panel.innerHTML = `
            <div id="xk-round-title">ROUND 1</div>
            <div id="xk-round-countdown">DEPLOYMENT: 10.0s</div>
            <div id="xk-round-actions">
                <button type="button" id="xk-start-round">START ROUND</button>
                <button type="button" id="xk-auto-rounds" data-on="false">AUTO ROUNDS: OFF</button>
            </div>
        `;
        gameScreen.appendChild(panel);
    }

    if (!document.getElementById("xk-pause-button")) {
        const button = document.createElement("button");
        button.type = "button";
        button.id = "xk-pause-button";
        button.textContent = "PAUSE";
        gameScreen.appendChild(button);
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (gamePaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        });
    }

    if (!document.getElementById("xk-selected-999")) {
        const panel = document.createElement("div");
        panel.id = "xk-selected-999";
        panel.innerHTML = `
            <strong>SCP-999</strong>
            <div id="xk-selected-999-status">NONE SELECTED</div>
            <button type="button" id="xk-deselect-999">DESELECT</button>
        `;
        gameScreen.appendChild(panel);
        document.getElementById("xk-deselect-999").addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            xkDeselect999();
        });
    }

    if (!document.getElementById("xk-score-hud")) {
        const hud = document.createElement("div");
        hud.id = "xk-score-hud";
        hud.innerHTML = `
            <div>SCORE: <span id="xk-live-score">0</span></div>
            <div id="xk-live-highscore">HIGH SCORE: ${highScore}</div>
        `;
        gameScreen.appendChild(hud);
    }

    if (!document.getElementById("xk-score-legend")) {
        const legend = document.createElement("div");
        legend.id = "xk-score-legend";
        legend.innerHTML = `
            <strong>SCORE LEGEND</strong>
            <table>
                <tr><td>Time</td><td>-10 / sec</td></tr>
                <tr><td>Starting base</td><td>+10,000</td></tr>
                <tr><td>Unit placed</td><td>-50</td></tr>
                <tr><td>Core breach</td><td>-250</td></tr>
                <tr><td>RP remaining</td><td>+10 / RP</td></tr>
                <tr><td>Round cleared</td><td>+500</td></tr>
            </table>
        `;
        gameScreen.appendChild(legend);
    }

    const startRoundButton = document.getElementById("xk-start-round");
    const autoButton = document.getElementById("xk-auto-rounds");

    if (!startRoundButton.dataset.xkBound) {
        startRoundButton.dataset.xkBound = "true";
        startRoundButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!gameActive || gameOver || gamePaused) return;
            xkBeginRoundNow();
        });
    }

    if (!autoButton.dataset.xkBound) {
        autoButton.dataset.xkBound = "true";
        autoButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!gameActive || gameOver || gamePaused) return;
            xkAutoPlayRounds = !xkAutoPlayRounds;
            autoButton.dataset.on = String(xkAutoPlayRounds);
            autoButton.textContent = xkAutoPlayRounds ? "AUTO ROUNDS: ON" : "AUTO ROUNDS: OFF";
            if (xkAutoPlayRounds && xkRoundPrepActive) {
                if (xkRoundPrepRemaining <= 0) {
                    xkBeginRoundNow();
                } else if (xkRoundPrepTimeout === null) {
                    xkScheduleRoundPrep();
                }
            }
        });
    }
}

function xkSetRoundPopup(roundNumber) {
    xkEnsureFeatureUI();
    const title = document.getElementById("xk-round-title");
    if (title) title.textContent = `ROUND ${roundNumber}`;
}

function xkShowRoundPopup(roundNumber) {
    xkEnsureFeatureUI();
    const panel = document.getElementById("xk-round-panel");
    const title = document.getElementById("xk-round-title");
    const countdown = document.getElementById("xk-round-countdown");
    const actions = document.getElementById("xk-round-actions");

    if (!panel || !title || !countdown || !actions) return;

    if (xkRoundPopupTimeout !== null) {
        clearTimeout(xkRoundPopupTimeout);
        xkRoundPopupTimeout = null;
    }

    title.textContent = `ROUND ${roundNumber}`;
    countdown.textContent = "STARTING";
    actions.style.display = "none";
    panel.style.display = "block";

    xkRoundPopupRemaining = 1400;
    xkRoundPopupNextTick = performance.now() + xkRoundPopupRemaining;
    if (!gamePaused) {
        xkRoundPopupTimeout = setTimeout(function () {
            xkRoundPopupTimeout = null;
            xkRoundPopupRemaining = 0;
            xkRoundPopupNextTick = 0;
            actions.style.display = "flex";
            if (!xkRoundPrepActive) panel.style.display = "none";
        }, xkRoundPopupRemaining);
    }
}

function xkUpdateSelected999UI() {
    const status = document.getElementById("xk-selected-999-status");
    const button = document.getElementById("xk-deselect-999");
    if (!status || !button) return;

    if (selected999 && selected999.isConnected) {
        status.textContent = "SELECTED — tap the field to move";
        button.disabled = false;
        if (!selected999.querySelector(".xk-selected-999-badge")) {
            const badge = document.createElement("div");
            badge.className = "xk-selected-999-badge";
            badge.textContent = "SCP-999 SELECTED";
            selected999.appendChild(badge);
        }
    } else {
        status.textContent = "NONE SELECTED";
        button.disabled = true;
    }
}

function xkDeselect999() {
    if (selected999) {
        selected999.classList.remove("selected");
        const badge = selected999.querySelector(".xk-selected-999-badge");
        if (badge) badge.remove();
    }
    selected999 = null;
    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }
    xkUpdateSelected999UI();
    playSound("select");
}

function xkGetElapsedGameTime() {
    if (gameActive && !gameOver) {
        return Math.max(0, performance.now() - gameStartTime);
    }
    return Math.max(0, totalGameTime);
}

function xkGetScoreBreakdown() {
    const seconds = xkGetElapsedGameTime() / 1000;
    const speedScore = Math.max(0, 10000 - Math.floor(seconds * 10));
    const unitPenalty = totalUnitsPlaced * 50;
    const lifePenalty = livesLost * 250;
    const researchPointBonus = researchPoints * 10;
    const waveBonus = xkCompletedWaves * 500;
    const total = Math.max(0, speedScore - unitPenalty - lifePenalty + researchPointBonus + waveBonus);

    return {
        seconds,
        speedScore,
        unitPenalty,
        lifePenalty,
        researchPointBonus,
        waveBonus,
        total
    };
}

function calculateScore() {
    return xkGetScoreBreakdown().total;
}

function xkUpdateLiveScore() {
    const score = Math.floor(calculateScore());
    const live = document.getElementById("xk-live-score");
    const liveHigh = document.getElementById("xk-live-highscore");
    if (live) live.textContent = score;
    if (liveHigh) liveHigh.textContent = `HIGH SCORE: ${highScore}`;
}

function xkScheduleScoreRefresh() {
    if (!gameActive || gameOver || gamePaused || xkScoreRefreshTimeout !== null) return;
    xkScoreRefreshNextTick = performance.now() + xkScoreRefreshRemaining;
    xkScoreRefreshTimeout = setTimeout(function tick() {
        xkScoreRefreshTimeout = null;
        xkScoreRefreshRemaining = 500;
        xkScoreRefreshNextTick = 0;
        if (!gameActive || gameOver || gamePaused) return;
        xkUpdateLiveScore();
        xkScheduleScoreRefresh();
    }, xkScoreRefreshRemaining);
}

function xkBuildScoreTable(container) {
    if (!container) return;

    const breakdown = xkGetScoreBreakdown();
    let table = container.querySelector(".xk-score-breakdown");

    if (!table) {
        table = document.createElement("div");
        table.className = "xk-score-breakdown";
        container.appendChild(table);
    }

    table.innerHTML = `
        <h3>HOW YOUR SCORE WAS CALCULATED</h3>
        <table>
            <thead><tr><th>Component</th><th>Calculation</th><th>Points</th></tr></thead>
            <tbody>
                <tr><td>Base speed score</td><td>10,000 − (${Math.floor(breakdown.seconds)} × 10)</td><td>+${breakdown.speedScore.toLocaleString()}</td></tr>
                <tr><td>Units placed</td><td>${totalUnitsPlaced} × 50</td><td>−${breakdown.unitPenalty.toLocaleString()}</td></tr>
                <tr><td>Core breaches</td><td>${livesLost} × 250</td><td>−${breakdown.lifePenalty.toLocaleString()}</td></tr>
                <tr><td>RP remaining</td><td>${researchPoints} × 10</td><td>+${breakdown.researchPointBonus.toLocaleString()}</td></tr>
                <tr><td>Rounds cleared</td><td>${xkCompletedWaves} × 500</td><td>+${breakdown.waveBonus.toLocaleString()}</td></tr>
                <tr><th colspan="2">FINAL SCORE</th><th>${breakdown.total.toLocaleString()}</th></tr>
            </tbody>
        </table>
    `;
}

function xkInjectEndScreenStats(screen, victory) {
    if (!screen) return;
    let stats = screen.querySelector(".xk-final-stats");
    if (!stats) {
        stats = document.createElement("div");
        stats.className = "xk-final-stats";
        screen.appendChild(stats);
    }
    stats.innerHTML = `
        <div><strong>TIME:</strong> ${Math.floor(totalGameTime / 1000)}s</div>
        <div><strong>ROUNDS CLEARED:</strong> ${xkCompletedWaves} / 10</div>
        <div><strong>UNITS PLACED:</strong> ${totalUnitsPlaced}</div>
        <div><strong>CORE BREACHES:</strong> ${livesLost}</div>
        <div><strong>RP REMAINING:</strong> ${researchPoints}</div>
    `;
    xkBuildScoreTable(screen);
}

function xkUpdateRoundPrepUI() {
    const panel = document.getElementById("xk-round-panel");
    const countdown = document.getElementById("xk-round-countdown");
    const start = document.getElementById("xk-start-round");
    if (!panel || !countdown || !start) return;

    panel.style.display = xkRoundPrepActive ? "block" : "none";
    const seconds = Math.max(0, xkRoundPrepRemaining / 1000);
    countdown.textContent = xkAutoPlayRounds
        ? `DEPLOYMENT: ${seconds.toFixed(1)}s — AUTO START ${seconds <= 0 ? "NOW" : "ARMED"}`
        : `DEPLOYMENT: ${seconds.toFixed(1)}s — MANUAL START AVAILABLE`;
    start.textContent = xkRoundPrepActive ? "START ROUND" : "ROUND ACTIVE";
}

function xkBeginRoundPreparation() {
    if (!gameActive || gameOver || gamePaused) return;

    xkRoundPrepActive = true;
    xkRoundPrepRemaining = 10000;
    xkRoundPrepNextTick = performance.now() + xkRoundPrepRemaining;
    xkSetRoundPopup(currentWave);
    xkUpdateRoundPrepUI();
    xkScheduleRoundPrep();
}

function xkScheduleRoundPrep() {
    if (!gameActive || gameOver || gamePaused || !xkRoundPrepActive) return;
    if (xkRoundPrepTimeout !== null) return;

    xkRoundPrepNextTick = performance.now() + xkRoundPrepRemaining;
    xkRoundPrepTimeout = setTimeout(function () {
        xkRoundPrepTimeout = null;
        xkRoundPrepRemaining = 0;
        xkRoundPrepNextTick = 0;
        if (!gameActive || gameOver || gamePaused) return;
        if (xkAutoPlayRounds) {
            xkBeginRoundNow();
        } else {
            xkUpdateRoundPrepUI();
        }
    }, xkRoundPrepRemaining);
}

function xkBeginRoundNow() {
    if (!gameActive || gameOver || gamePaused || !xkRoundPrepActive) return;

    if (xkRoundPrepTimeout !== null) {
        clearTimeout(xkRoundPrepTimeout);
        xkRoundPrepTimeout = null;
    }

    xkRoundPrepActive = false;
    xkRoundPrepRemaining = 10000;
    xkRoundPrepNextTick = 0;
    xkUpdateRoundPrepUI();
    xkShowRoundPopup(currentWave);

    startWave();
}

function startGame() {
    resetGameState();
    xkEnsureFeatureUI();

    gameActive = true;
    gameOver = false;
    gamePaused = false;
    gameStartTime = performance.now();
    currentWave = 1;
    xkCompletedWaves = 0;
    xkAutoPlayRounds = false;
    xkRoundPrepActive = false;

    mainMenu.style.display = "none";
    deathScreen.style.display = "none";
    victoryScreen.style.display = "none";
    pauseScreen.style.display = "none";
    gameScreen.style.display = "block";

    const autoButton = document.getElementById("xk-auto-rounds");
    if (autoButton) {
        autoButton.dataset.on = "false";
        autoButton.textContent = "AUTO ROUNDS: OFF";
    }

    startResearchPointTimer();
    xkScheduleScoreRefresh();
    xkBeginRoundPreparation();
    xkUpdateSelected999UI();
    xkUpdateLiveScore();
    playSound("button");
}

function startWave() {
    if (!gameActive || gameOver || gamePaused || xkRoundPrepActive) return;

    waveStarting = true;
    waveSpawningComplete = false;
    pendingEnemySpawns = 0;
    waveSpawnedEnemies = 0;
    waveKilledEnemies = 0;
    waveTotalEnemies = getWaveEnemyCount(currentWave);
    currentWaveStartTime = performance.now();
    waveSpawnRemaining = 900;
    waveSpawnNextTick = 0;

    updateWaveDisplay();
    xkSetRoundPopup(currentWave);
    playSound("waveStart");
    spawnWavePortals();
}

function startNextWave() {
    if (!gameActive || gameOver || gamePaused) return;
    if (currentWave >= 10) {
        xkCompletedWaves = 10;
        if (waveTimeout !== null) {
            clearTimeout(waveTimeout);
            waveTimeout = null;
        }
        waveRemaining = 0;
        waveNextTick = 0;
        endGame(true);
        return;
    }
    xkCompletedWaves = Math.max(xkCompletedWaves, currentWave);
    currentWave++;
    updateWaveDisplay();
    xkBeginRoundPreparation();
}

function checkWaveComplete() {
    if (!gameActive || gameOver || gamePaused || xkRoundPrepActive) return;

    if (
        waveSpawningComplete &&
        pendingEnemySpawns <= 0 &&
        waveSpawnedEnemies >= waveTotalEnemies &&
        waveKilledEnemies >= waveTotalEnemies &&
        activeEnemies <= 0
    ) {
        currentWaveTime = performance.now() - currentWaveStartTime;

        // HARD STOP: normal Round 10 ends the run here.
        // This prevents any legacy next-wave timer from pushing the game into Round 11.
        if (currentWave >= 10 && !xkFinalBreachMode) {
            if (waveTimeout !== null) {
                clearTimeout(waveTimeout);
                waveTimeout = null;
            }
            waveRemaining = 0;
            waveNextTick = 0;
            endGame(true);
            return;
        }

        playSound("waveStart");
        startNextWave();
    }
}

function xkFindNearestAlliedUnit(enemy) {
    let nearestGunman = null;
    let nearestDistance = Infinity;

    const enemyRect = enemy.getBoundingClientRect();
    const ex = enemyRect.left + enemyRect.width / 2;
    const ey = enemyRect.top + enemyRect.height / 2;

    gunmanSet.forEach(function (gunman) {
        if (!gunman.isConnected || gunman.health <= 0) return;

        const gx = parseFloat(gunman.style.left);
        const gy = parseFloat(gunman.style.top);
        const distance = Math.hypot(gx - ex, gy - ey);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestGunman = gunman;
        }
    });

    return nearestGunman
        ? { unit: nearestGunman, distance: nearestDistance }
        : null;
}

function xkAttackAlliedUnit(enemy, unit) {
    if (!enemy || !unit || enemy.dead || !unit.isConnected || gamePaused || gameOver) return;

    if (enemy.attackTimer !== null) {
        return;
    }

    enemy.attackingUnit = true;
    enemy.targetUnit = unit;

    if (!Number.isFinite(enemy.attackRemaining) || enemy.attackRemaining <= 0) {
        enemy.attackRemaining = enemy.attackInterval;
    }

    enemy.attackNextTick = performance.now() + enemy.attackRemaining;
    enemy.attackTimer = setTimeout(function attackAlliedTick() {
        enemy.attackTimer = null;
        if (!gameActive || gameOver || gamePaused || enemy.dead) return;

        if (!unit.isConnected) {
            enemy.attackingUnit = false;
            enemy.targetUnit = null;
            enemy.attackRemaining = enemy.attackInterval;
            return;
        }

        if (unit.classList.contains("gunman")) {
            damageGunman(unit, enemy.damage);
        } else if (unit.classList.contains("scp-999")) {
            enemy.targetUnit = unit;
            // SCP-999 is support, not a damageable combat tower in the original rules.
            // The enemy therefore disengages instead of corrupting its movement state.
            enemy.attackingUnit = false;
            enemy.targetUnit = null;
            enemy.attackRemaining = enemy.attackInterval;
            return;
        }

        if (!enemy.isConnected || enemy.dead) return;
        if (!unit.isConnected) {
            enemy.attackingUnit = false;
            enemy.targetUnit = null;
            enemy.attackRemaining = enemy.attackInterval;
            return;
        }

        enemy.attackRemaining = enemy.attackInterval;
        enemy.attackNextTick = performance.now() + enemy.attackRemaining;
        enemy.attackTimer = setTimeout(attackAlliedTick, enemy.attackRemaining);
    }, enemy.attackRemaining);
}

function spawnEnemy1(x, y) {
    if (!gameActive || gameOver || gamePaused) return null;

    const enemy = document.createElement("div");
    enemy.className = "enemy-1";

    let enemyX = x;
    let enemyY = y + 50;
    enemy.style.left = `${enemyX}px`;
    enemy.style.top = `${enemyY}px`;
    portalContainer.appendChild(enemy);

    enemySet.add(enemy);
    activeEnemies++;
    enemy.health = 20;
    enemy.maxHealth = 20;
    enemy.damage = 5;
    enemy.attackInterval = 1000;
    enemy.attackTimer = null;
    enemy.attackRemaining = 1000;
    enemy.attackNextTick = 0;
    enemy.attackingCore = false;
    enemy.attackingUnit = false;
    enemy.targetUnit = null;
    enemy.dead = false;
    enemy.hasReachedCore = false;
    enemy.moveAnimation = null;
    enemy.resumeMovement = null;

    const healthBar = document.createElement("div");
    healthBar.className = "enemy-healthbar";
    const health = document.createElement("div");
    health.className = "enemy-health";
    healthBar.appendChild(health);
    portalContainer.appendChild(healthBar);
    enemy.healthBar = healthBar;
    enemy.healthDisplay = health;

    function attackCore() {
        if (enemy.attackingCore || enemy.attackingUnit || enemy.dead || gamePaused || gameOver) return;
        enemy.attackingCore = true;
        if (!Number.isFinite(enemy.attackRemaining) || enemy.attackRemaining <= 0) enemy.attackRemaining = enemy.attackInterval;
        enemy.attackNextTick = performance.now() + enemy.attackRemaining;
        enemy.attackTimer = setTimeout(function attackCoreTick() {
            enemy.attackTimer = null;
            if (!gameActive || gameOver || gamePaused || enemy.dead) return;
            coreHealth = Math.max(0, coreHealth - enemy.damage);
            coreHealthDisplay.textContent = coreHealth;
            playSound("coreHit");
            if (coreHealth <= 0) {
                enemy.attackingCore = false;
                endGame(false);
                return;
            }
            enemy.attackRemaining = enemy.attackInterval;
            enemy.attackNextTick = performance.now() + enemy.attackRemaining;
            enemy.attackTimer = setTimeout(attackCoreTick, enemy.attackRemaining);
        }, enemy.attackRemaining);
    }

    function moveEnemy() {
        enemy.moveAnimation = null;

        if (!gameActive || gameOver) {
            clearEnemyActivity(enemy);
            if (enemy.healthBar) enemy.healthBar.remove();
            enemy.remove();
            enemySet.delete(enemy);
            return;
        }

        if (enemy.dead) return;

        if (gamePaused) {
            enemy.resumeMovement = moveEnemy;
            return;
        }

        const coreX = window.innerWidth / 2;
        const coreY = window.innerHeight / 2;
        const allied = xkFindNearestAlliedUnit(enemy);

        // Gunmen are the enemy's primary target whenever at least one is alive.
        if (allied && allied.unit && allied.unit.isConnected && allied.unit.health > 0) {
            const targetX = parseFloat(allied.unit.style.left);
            const targetY = parseFloat(allied.unit.style.top);
            const dxToGunman = targetX - enemyX;
            const dyToGunman = targetY - enemyY;
            const distanceToGunman = Math.hypot(dxToGunman, dyToGunman);
            const attackRange = 28;

            if (distanceToGunman <= attackRange) {
                if (enemy.attackTimer === null && !enemy.attackingUnit) {
                    xkAttackAlliedUnit(enemy, allied.unit);
                }

                healthBar.style.left = `${enemyX}px`;
                healthBar.style.top = `${enemyY - 12}px`;
                enemy.moveAnimation = requestAnimationFrame(moveEnemy);
                return;
            }

            // Outside attack range: cancel any old attack timer and pursue the gunman.
            if (enemy.attackTimer !== null) {
                clearTimeout(enemy.attackTimer);
                enemy.attackTimer = null;
                enemy.attackRemaining = enemy.attackInterval;
                enemy.attackNextTick = 0;
            }

            enemy.attackingUnit = false;
            enemy.targetUnit = null;

            const speed = 50 / 60;
            const step = Math.min(speed, distanceToGunman);

            if (distanceToGunman > 0) {
                enemyX += (dxToGunman / distanceToGunman) * step;
                enemyY += (dyToGunman / distanceToGunman) * step;
            }

            enemy.style.left = `${enemyX}px`;
            enemy.style.top = `${enemyY}px`;
            healthBar.style.left = `${enemyX}px`;
            healthBar.style.top = `${enemyY - 12}px`;

            enemy.moveAnimation = requestAnimationFrame(moveEnemy);
            return;
        }

        // No gunmen remain, so the enemy falls back to the core.
        enemy.attackingUnit = false;
        enemy.targetUnit = null;

        const dx = coreX - enemyX;
        const dy = coreY - enemyY;
        const distance = Math.hypot(dx, dy);

        if (distance <= 70) {
            if (!enemy.hasReachedCore) {
                enemy.hasReachedCore = true;
                livesLost++;
                xkUpdateLiveScore();
                playSound("coreReached");
            }

            attackCore();
            healthBar.style.left = `${enemyX}px`;
            healthBar.style.top = `${enemyY - 12}px`;
            return;
        }

        if (enemy.attackTimer !== null) {
            clearTimeout(enemy.attackTimer);
            enemy.attackTimer = null;
            enemy.attackRemaining = enemy.attackInterval;
            enemy.attackNextTick = 0;
        }

        const speed = 50 / 60;
        const step = Math.min(speed, distance);

        if (distance > 0) {
            enemyX += (dx / distance) * step;
            enemyY += (dy / distance) * step;
        }

        enemy.style.left = `${enemyX}px`;
        enemy.style.top = `${enemyY}px`;
        healthBar.style.left = `${enemyX}px`;
        healthBar.style.top = `${enemyY - 12}px`;

        enemy.moveAnimation = requestAnimationFrame(moveEnemy);
    }

    enemy.moveFunction = moveEnemy;
    enemy.resumeMovement = moveEnemy;
    enemy.moveAnimation = requestAnimationFrame(moveEnemy);
    return enemy;
}

function damageEnemy(enemy, damage) {
    if (!gameActive || gameOver || gamePaused || !enemy || !enemy.isConnected || enemy.dead) return;

    enemy.health = Math.max(0, enemy.health - damage);
    enemy.healthDisplay.style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
    playSound("enemyHit");

    if (enemy.health <= 0) {
        enemy.dead = true;
        enemy.attackingCore = false;
        enemy.attackingUnit = false;
        enemy.targetUnit = null;
        clearEnemyActivity(enemy);

        const rect = enemy.getBoundingClientRect();
        const enemyX = rect.left + rect.width / 2;
        const enemyY = rect.top + rect.height / 2;
        enemy.remove();
        if (enemy.healthBar) enemy.healthBar.remove();
        enemySet.delete(enemy);
        activeEnemies = Math.max(0, activeEnemies - 1);
        playSound("enemyDeath");

        if (gameActive && !gameOver) {
            researchPoints += 2;
            researchPointsDisplay.textContent = researchPoints;
            showRPPopup(enemyX, enemyY);
            playSound("rpGain");
            waveKilledEnemies++;
            updateWaveDisplay();
            xkUpdateLiveScore();
            checkWaveComplete();
        }
    }
}

function spawnGunman(x, y) {
    if (!gameActive || gameOver || gamePaused) return null;

    const gunman = document.createElement("div");
    gunman.className = "gunman";
    gunman.style.left = `${x}px`;
    gunman.style.top = `${y}px`;
    portalContainer.appendChild(gunman);

    gunman.health = 50;
    gunman.maxHealth = 50;
    gunman.fireRate = 1000;
    gunman.fireRemaining = 1000;
    gunman.fireNextTick = 0;
    gunman.fireTimeout = null;
    gunman.fireFunction = null;
    gunman.gunmanDamage = 5;
    gunman.gunmanRange = 200;
    gunman.bstTimeout = null;
    gunman.bstRemaining = 0;
    gunman.bstNextTick = 0;

    const healthBar = document.createElement("div");
    healthBar.className = "gunman-healthbar";
    const health = document.createElement("div");
    health.className = "gunman-health";
    healthBar.appendChild(health);
    portalContainer.appendChild(healthBar);
    gunman.healthBar = healthBar;
    gunman.healthDisplay = health;
    healthBar.style.left = `${x}px`;
    healthBar.style.top = `${y - 15}px`;

    const label = document.createElement("div");
    label.className = "xk-health-label";
    label.textContent = "HP 50 / 50";
    portalContainer.appendChild(label);
    gunman.hpLabel = label;

    function fireGunman() {
        gunman.fireTimeout = null;
        if (!gameActive || gameOver || gamePaused || !gunman.isConnected) return;

        const rangeSquared = gunman.gunmanRange * gunman.gunmanRange;
        let nearestEnemy = null;
        let nearestDistanceSquared = rangeSquared;

        enemySet.forEach(function (enemy) {
            if (!enemy.isConnected || enemy.dead) return;
            const rect = enemy.getBoundingClientRect();
            const ex = rect.left + rect.width / 2;
            const ey = rect.top + rect.height / 2;
            const gx = parseFloat(gunman.style.left);
            const gy = parseFloat(gunman.style.top);
            const dx = ex - gx;
            const dy = ey - gy;
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared <= nearestDistanceSquared) {
                nearestDistanceSquared = distanceSquared;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            playSound("gunmanShot");
            fireGunmanProjectile(
                parseFloat(gunman.style.left),
                parseFloat(gunman.style.top),
                nearestEnemy,
                gunman.gunmanDamage
            );
        }

        gunman.fireRemaining = gunman.fireRate;
        gunman.fireNextTick = performance.now() + gunman.fireRemaining;
        gunman.fireTimeout = setTimeout(fireGunman, gunman.fireRemaining);
    }

    gunman.fireFunction = fireGunman;
    gunman.fireNextTick = performance.now() + gunman.fireRemaining;
    gunman.fireTimeout = setTimeout(fireGunman, gunman.fireRemaining);
    gunmanSet.add(gunman);
    update999Buffs();
    return gunman;
}

function damageGunman(gunman, damage) {
    if (!gameActive || gameOver || gamePaused || !gunman || !gunman.isConnected || gunman.health <= 0) return;

    gunman.health = Math.max(0, gunman.health - damage);
    gunman.healthDisplay.style.width = `${(gunman.health / gunman.maxHealth) * 100}%`;
    if (gunman.hpLabel) gunman.hpLabel.textContent = `HP ${gunman.health} / ${gunman.maxHealth}`;

    if (gunman.health <= 0) {
        clearGunmanActivity(gunman);
        gunmanSet.delete(gunman);
        if (gunman.healthBar) gunman.healthBar.remove();
        if (gunman.hpLabel) gunman.hpLabel.remove();
        gunman.remove();
        update999Buffs();
        xkUpdateLiveScore();
    }
}

function fireGunmanProjectile(startX, startY, enemy, damage) {
    if (!gameActive || gameOver || gamePaused) return null;

    const projectile = document.createElement("div");
    projectile.className = "gunman-projectile";
    projectile.style.left = `${startX}px`;
    projectile.style.top = `${startY}px`;
    portalContainer.appendChild(projectile);

    let projectileX = startX;
    let projectileY = startY;
    const projectileSpeed = 500;
    projectile.moveAnimation = null;
    projectile.resumeMovement = null;

    function moveProjectile() {
        projectile.moveAnimation = null;
        if (!gameActive || gameOver) {
            clearProjectileActivity(projectile);
            projectile.remove();
            return;
        }
        if (gamePaused) {
            projectile.resumeMovement = moveProjectile;
            return;
        }
        if (!enemy.isConnected || enemy.dead) {
            clearProjectileActivity(projectile);
            projectile.remove();
            return;
        }

        const rect = enemy.getBoundingClientRect();
        const ex = rect.left + rect.width / 2;
        const ey = rect.top + rect.height / 2;
        const dx = ex - projectileX;
        const dy = ey - projectileY;
        const distance = Math.hypot(dx, dy);

        if (distance <= rect.width / 2 + 5) {
            damageEnemy(enemy, damage);
            clearProjectileActivity(projectile);
            projectile.remove();
            return;
        }

        projectileX += (dx / distance) * projectileSpeed / 60;
        projectileY += (dy / distance) * projectileSpeed / 60;
        projectile.style.left = `${projectileX}px`;
        projectile.style.top = `${projectileY}px`;
        projectile.resumeMovement = moveProjectile;
        projectile.moveAnimation = requestAnimationFrame(moveProjectile);
    }

    projectile.resumeMovement = moveProjectile;
    projectile.moveAnimation = requestAnimationFrame(moveProjectile);
    return projectile;
}

function spawn999(x, y) {
    if (!gameActive || gameOver || gamePaused) return null;

    const hero = document.createElement("div");
    hero.className = "scp-999";
    hero.x = x;
    hero.y = y;
    hero.targetX = x;
    hero.targetY = y;
    hero.style.left = `${x}px`;
    hero.style.top = `${y}px`;
    hero.dataset.x = x;
    hero.dataset.y = y;
    hero.moveAnimation = null;
    hero.resumeMovement = null;

    const buffRange = document.createElement("div");
    buffRange.className = "scp-999-buff-range";
    hero.appendChild(buffRange);

    hero.addEventListener("click", function (event) {
        event.stopPropagation();
        if (!gameActive || gameOver || gamePaused || placingGunman || placing999) return;
        if (selected999 && selected999 !== hero) {
            selected999.classList.remove("selected");
            const oldBadge = selected999.querySelector(".xk-selected-999-badge");
            if (oldBadge) oldBadge.remove();
        }
        selected999 = hero;
        hero.classList.add("selected");
        xkUpdateSelected999UI();
        playSound("select");
    });

    portalContainer.appendChild(hero);
    heroSet.add(hero);
    update999Buffs();
    xkUpdateSelected999UI();
    return hero;
}

function move999(hero, targetX, targetY) {
    if (!hero || !hero.isConnected || gamePaused) return;

    if (hero.moveAnimation) {
        cancelAnimationFrame(hero.moveAnimation);
        hero.moveAnimation = null;
    }

    hero.targetX = targetX;
    hero.targetY = targetY;
    let lastTime = performance.now();

    function resumeHeroMovement() {
        if (!gameActive || gameOver || gamePaused || !hero.isConnected) return;
        lastTime = performance.now();
        if (!hero.moveAnimation) hero.moveAnimation = requestAnimationFrame(animate);
    }

    function animate(currentTime) {
        hero.moveAnimation = null;
        if (!gameActive || gameOver) {
            hero.resumeMovement = null;
            return;
        }
        if (gamePaused) {
            hero.resumeMovement = resumeHeroMovement;
            return;
        }

        const deltaTime = Math.min(0.1, Math.max(0, (currentTime - lastTime) / 1000));
        lastTime = currentTime;
        const dx = hero.targetX - hero.x;
        const dy = hero.targetY - hero.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= 3) {
            hero.x = hero.targetX;
            hero.y = hero.targetY;
            hero.style.left = `${hero.x}px`;
            hero.style.top = `${hero.y}px`;
            hero.dataset.x = hero.x;
            hero.dataset.y = hero.y;
            update999Buffs();
            hero.moveAnimation = null;
            hero.resumeMovement = null;
            if (selected999Waypoint) {
                selected999Waypoint.remove();
                selected999Waypoint = null;
            }
            return;
        }

        const movement = Math.min(scp999MoveSpeed * deltaTime, distance);
        hero.x += (dx / distance) * movement;
        hero.y += (dy / distance) * movement;
        hero.style.left = `${hero.x}px`;
        hero.style.top = `${hero.y}px`;
        hero.dataset.x = hero.x;
        hero.dataset.y = hero.y;
        update999Buffs();
        hero.resumeMovement = resumeHeroMovement;
        hero.moveAnimation = requestAnimationFrame(animate);
    }

    hero.resumeMovement = resumeHeroMovement;
    hero.moveAnimation = requestAnimationFrame(animate);
}

function showRPPopup(x, y) {
    const popup = document.createElement("div");
    popup.className = "rp-popup";
    popup.textContent = "+2 RP";
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.removeTimeout = null;
    popup.removeRemaining = 1000;
    popup.removeNextTick = 0;
    portalContainer.appendChild(popup);

    function scheduleRemoval() {
        if (!popup.isConnected || gamePaused) return;
        popup.removeNextTick = performance.now() + popup.removeRemaining;
        popup.removeTimeout = setTimeout(function () {
            popup.removeTimeout = null;
            popup.removeRemaining = 0;
            popup.removeNextTick = 0;
            popup.remove();
        }, popup.removeRemaining);
    }
    popup.resumeRemoval = scheduleRemoval;
    scheduleRemoval();
    return popup;
}

function xkClearRoundPrepTimer() {
    if (xkRoundPrepTimeout !== null) {
        clearTimeout(xkRoundPrepTimeout);
        xkRoundPrepTimeout = null;
    }
}

function stopAllGameActivity() {
    if (gameStartTimeout !== null) { clearTimeout(gameStartTimeout); gameStartTimeout = null; }
    if (researchPointTimeout !== null) { clearTimeout(researchPointTimeout); researchPointTimeout = null; }
    if (waveTimeout !== null) { clearTimeout(waveTimeout); waveTimeout = null; }
    if (waveSpawnTimeout !== null) { clearTimeout(waveSpawnTimeout); waveSpawnTimeout = null; }
    if (xkRoundPrepTimeout !== null) { clearTimeout(xkRoundPrepTimeout); xkRoundPrepTimeout = null; }
    if (xkRoundPopupTimeout !== null) { clearTimeout(xkRoundPopupTimeout); xkRoundPopupTimeout = null; }
    if (xkScoreRefreshTimeout !== null) { clearTimeout(xkScoreRefreshTimeout); xkScoreRefreshTimeout = null; }

    enemySet.forEach(clearEnemyActivity);
    gunmanSet.forEach(clearGunmanActivity);
    heroSet.forEach(clearHeroActivity);

    portalContainer.querySelectorAll(".gunman-projectile").forEach(clearProjectileActivity);
    clearAllPortalReleaseActivity();

    portalContainer.querySelectorAll(".rp-popup").forEach(function (popup) {
        if (popup.removeTimeout !== null) clearTimeout(popup.removeTimeout);
    });
}

function resetGameState() {
    stopAllGameActivity();
    removeBattlefieldEntities();
    cancelUnitPlacement();
    xkDeselect999();

    gameOver = false;
    gameActive = false;
    gamePaused = false;
    gameStartPending = false;
    xkRoundPrepActive = false;
    xkRoundPrepRemaining = 10000;
    xkRoundPrepNextTick = 0;
    xkCompletedWaves = 0;
    xkScoreRefreshRemaining = 500;
    xkScoreRefreshNextTick = 0;

    gameStartRemaining = 1000;
    gameStartNextTick = 0;
    researchPointRemaining = 1000;
    researchPointNextTick = 0;
    waveRemaining = 2500;
    waveNextTick = 0;
    waveSpawnRemaining = 900;
    waveSpawnNextTick = 0;
    pauseStartedAt = 0;
    pausedDuration = 0;

    researchPoints = startingResearchPoints;
    coreHealth = maxCoreHealth;
    currentWave = 1;
    waveTotalEnemies = 0;
    waveSpawnedEnemies = 0;
    waveKilledEnemies = 0;
    activeEnemies = 0;
    waveStarting = false;
    pendingEnemySpawns = 0;
    waveSpawningComplete = false;
    totalUnitsPlaced = 0;
    livesLost = 0;
    currentWaveStartTime = 0;
    currentWaveTime = 0;
    totalGameTime = 0;
    gameStartTime = 0;
    finalScore = 0;

    pauseScreen.style.display = "none";
    researchPointsDisplay.textContent = researchPoints;
    coreHealthDisplay.textContent = coreHealth;
    updateWaveDisplay();
    xkUpdateLiveScore();
    xkUpdateSelected999UI();
}

function pauseGame() {
    if (!gameActive || gameOver || gamePaused) return;

    gamePaused = true;
    pauseStartedAt = performance.now();
    const now = performance.now();

    if (xkRoundPrepTimeout !== null) {
        xkRoundPrepRemaining = Math.max(0, xkRoundPrepNextTick - now);
        clearTimeout(xkRoundPrepTimeout);
        xkRoundPrepTimeout = null;
    }
    if (researchPointTimeout !== null) {
        researchPointRemaining = Math.max(0, researchPointNextTick - now);
        clearTimeout(researchPointTimeout);
        researchPointTimeout = null;
    }
    if (waveSpawnTimeout !== null) {
        waveSpawnRemaining = Math.max(0, waveSpawnNextTick - now);
        clearTimeout(waveSpawnTimeout);
        waveSpawnTimeout = null;
    }
    if (waveTimeout !== null) {
        waveRemaining = Math.max(0, waveNextTick - now);
        clearTimeout(waveTimeout);
        waveTimeout = null;
    }
    if (xkScoreRefreshTimeout !== null) {
        xkScoreRefreshRemaining = Math.max(0, xkScoreRefreshNextTick - now);
        clearTimeout(xkScoreRefreshTimeout);
        xkScoreRefreshTimeout = null;
    }
    if (xkRoundPopupTimeout !== null) {
        xkRoundPopupRemaining = Math.max(0, xkRoundPopupNextTick - now);
        clearTimeout(xkRoundPopupTimeout);
        xkRoundPopupTimeout = null;
    }

    enemySet.forEach(function (enemy) {
        if (enemy.attackTimer !== null) {
            enemy.attackRemaining = Math.max(0, enemy.attackNextTick - now);
            clearTimeout(enemy.attackTimer);
            enemy.attackTimer = null;
        }
        if (enemy.moveAnimation) {
            cancelAnimationFrame(enemy.moveAnimation);
            enemy.moveAnimation = null;
        }
        enemy.resumeMovement = enemy.dead ? null : enemy.moveFunction;
    });

    gunmanSet.forEach(function (gunman) {
        if (gunman.fireTimeout !== null) {
            gunman.fireRemaining = Math.max(0, gunman.fireNextTick - now);
            clearTimeout(gunman.fireTimeout);
            gunman.fireTimeout = null;
        }
        if (gunman.bstTimeout !== null) {
            gunman.bstRemaining = Math.max(0, gunman.bstNextTick - now);
            clearTimeout(gunman.bstTimeout);
            gunman.bstTimeout = null;
        }
    });

    portalContainer.querySelectorAll(".gunman-projectile").forEach(function (projectile) {
        if (projectile.moveAnimation) {
            cancelAnimationFrame(projectile.moveAnimation);
            projectile.moveAnimation = null;
        }
    });

    heroSet.forEach(function (hero) {
        if (hero.moveAnimation) {
            cancelAnimationFrame(hero.moveAnimation);
            hero.moveAnimation = null;
        }
    });

    portalContainer.querySelectorAll(".portal").forEach(function (portal) {
        if (!portal.releaseTimers) return;
        portal.releaseTimers.forEach(function (timer, index) {
            if (timer === null) return;
            portal.releaseRemaining[index] = Math.max(0, portal.releaseNextTick[index] - now);
            clearTimeout(timer);
            portal.releaseTimers[index] = null;
        });
    });

    portalContainer.querySelectorAll(".rp-popup").forEach(function (popup) {
        if (popup.removeTimeout !== null) {
            popup.removeRemaining = Math.max(0, popup.removeNextTick - now);
            clearTimeout(popup.removeTimeout);
            popup.removeTimeout = null;
        }
    });

    pauseScreen.style.display = "flex";
    const pauseButton = document.getElementById("xk-pause-button");
    if (pauseButton) pauseButton.textContent = "RESUME";
}

function resumeGame() {
    if (!gamePaused || !gameActive || gameOver) return;

    const now = performance.now();
    const pauseDuration = Math.max(0, now - pauseStartedAt);
    pausedDuration += pauseDuration;
    gameStartTime += pauseDuration;
    if (currentWaveStartTime > 0) currentWaveStartTime += pauseDuration;

    gamePaused = false;
    pauseScreen.style.display = "none";
    const pauseButton = document.getElementById("xk-pause-button");
    if (pauseButton) pauseButton.textContent = "PAUSE";

    if (xkRoundPrepActive && xkAutoPlayRounds && xkRoundPrepRemaining > 0) xkScheduleRoundPrep();
    startResearchPointTimer();

    if (waveSpawnTimeout === null && waveStarting && !waveSpawningComplete) {
        waveSpawnNextTick = performance.now() + waveSpawnRemaining;
        waveSpawnTimeout = setTimeout(function () {
            waveSpawnTimeout = null;
            waveSpawnNextTick = 0;
            waveSpawnRemaining = 900;
            if (!gameActive || gameOver || gamePaused) return;
            spawnWavePortals();
        }, waveSpawnRemaining);
    }

    if (waveTimeout === null && waveRemaining > 0 && !waveStarting && !xkRoundPrepActive) {
        waveNextTick = performance.now() + waveRemaining;
        waveTimeout = setTimeout(function () {
            waveTimeout = null;
            waveNextTick = 0;
            waveRemaining = 2500;
            if (!gameActive || gameOver || gamePaused) return;
            if (currentWave >= 10) {
                if (!xkFinalBreachMode) endGame(true);
                return;
            }
            currentWave++;
            startWave();
        }, waveRemaining);
    }

    enemySet.forEach(function (enemy) {
        if (enemy.dead) return;
        if (enemy.attackingCore || enemy.attackingUnit) {
            if (enemy.attackTimer === null) {
                const remaining = Math.max(0, Number(enemy.attackRemaining) || enemy.attackInterval);
                enemy.attackNextTick = performance.now() + remaining;
                if (enemy.attackingUnit && enemy.targetUnit) {
                    const target = enemy.targetUnit;
                    function resumeAlliedAttack() {
                        enemy.attackTimer = null;
                        if (!gameActive || gameOver || gamePaused || enemy.dead) return;
                        if (target.isConnected && target.classList.contains("gunman")) {
                            damageGunman(target, enemy.damage);
                        }
                        if (!target.isConnected) {
                            enemy.attackingUnit = false;
                            enemy.targetUnit = null;
                            enemy.attackRemaining = enemy.attackInterval;
                            return;
                        }
                        enemy.attackRemaining = enemy.attackInterval;
                        enemy.attackNextTick = performance.now() + enemy.attackRemaining;
                        enemy.attackTimer = setTimeout(resumeAlliedAttack, enemy.attackRemaining);
                    }
                    enemy.attackTimer = setTimeout(resumeAlliedAttack, remaining);
                }
            }
        }
        if (enemy.resumeMovement && !enemy.moveAnimation) enemy.resumeMovement();
    });

    gunmanSet.forEach(function (gunman) {
        if (gunman.fireTimeout === null && gunman.fireFunction) {
            const remaining = Math.max(0, Number(gunman.fireRemaining) || gunman.fireRate);
            gunman.fireNextTick = performance.now() + remaining;
            gunman.fireTimeout = setTimeout(gunman.fireFunction, remaining);
        }
        if (gunman.bstTimeout === null && gunman.bstRemaining > 0 && gunman.dataset.bstActive === "true") {
            gunman.bstNextTick = performance.now() + gunman.bstRemaining;
            gunman.bstTimeout = setTimeout(function () {
                gunman.bstTimeout = null;
                gunman.bstRemaining = 0;
                gunman.bstNextTick = 0;
                if (!gunman.isConnected) return;
                gunman.dataset.bstActive = "false";
                const label = gunman.querySelector(".bst-label");
                if (label) label.remove();
            }, gunman.bstRemaining);
        }
    });

    portalContainer.querySelectorAll(".gunman-projectile").forEach(function (projectile) {
        if (projectile.resumeMovement && !projectile.moveAnimation) projectile.resumeMovement();
    });
    heroSet.forEach(function (hero) {
        if (hero.resumeMovement && !hero.moveAnimation) hero.resumeMovement();
    });

    portalContainer.querySelectorAll(".portal").forEach(function (portal) {
        if (!portal.releaseTimers) return;
        portal.releaseTimers.forEach(function (timer, index) {
            if (timer !== null || portal.releaseRemaining[index] <= 0) return;
            const remaining = portal.releaseRemaining[index];
            portal.releaseNextTick[index] = performance.now() + remaining;
            portal.releaseTimers[index] = setTimeout(function () {
                portal.releaseTimers[index] = null;
                portal.releaseRemaining[index] = 0;
                portal.releaseNextTick[index] = 0;
                if (!gameActive || gameOver || gamePaused) return;
                spawnEnemy1(portal.spawnX, portal.spawnY);
                pendingEnemySpawns = Math.max(0, pendingEnemySpawns - 1);
                waveSpawnedEnemies++;
                updateWaveDisplay();
                playSound("enemySpawn");
                if (pendingEnemySpawns <= 0 && waveSpawnedEnemies >= waveTotalEnemies) {
                    waveSpawningComplete = true;
                    waveStarting = false;
                    checkWaveComplete();
                }
            }, remaining);
        });
    });

    portalContainer.querySelectorAll(".rp-popup").forEach(function (popup) {
        if (popup.removeTimeout === null && popup.removeRemaining > 0) {
            popup.removeNextTick = performance.now() + popup.removeRemaining;
            popup.removeTimeout = setTimeout(function () {
                popup.removeTimeout = null;
                popup.removeRemaining = 0;
                popup.removeNextTick = 0;
                popup.remove();
            }, popup.removeRemaining);
        }
    });

    if (xkRoundPopupTimeout === null && xkRoundPopupRemaining > 0) {
        xkRoundPopupNextTick = performance.now() + xkRoundPopupRemaining;
        const panel = document.getElementById("xk-round-panel");
        const actions = document.getElementById("xk-round-actions");
        xkRoundPopupTimeout = setTimeout(function () {
            xkRoundPopupTimeout = null;
            xkRoundPopupRemaining = 0;
            xkRoundPopupNextTick = 0;
            if (actions) actions.style.display = "flex";
            if (panel && !xkRoundPrepActive) panel.style.display = "none";
        }, xkRoundPopupRemaining);
    }

    xkScheduleScoreRefresh();
    xkUpdateLiveScore();
}

function spawnWavePortals() {
    if (!gameActive || gameOver || gamePaused || xkRoundPrepActive) return;

    if (waveSpawnedEnemies + pendingEnemySpawns >= waveTotalEnemies) {
        waveStarting = false;
        if (pendingEnemySpawns <= 0) {
            waveSpawningComplete = true;
            checkWaveComplete();
        }
        return;
    }

    const remaining = waveTotalEnemies - waveSpawnedEnemies - pendingEnemySpawns;
    const enemiesFromPortal = Math.min(Math.floor(Math.random() * 3) + 1, remaining);
    const position = getRandomPortalPosition();
    spawnPortal(position.x, position.y, enemiesFromPortal);
    pendingEnemySpawns += enemiesFromPortal;
    updateWaveDisplay();

    waveSpawnRemaining = 900;
    waveSpawnNextTick = performance.now() + waveSpawnRemaining;
    waveSpawnTimeout = setTimeout(function () {
        waveSpawnTimeout = null;
        waveSpawnNextTick = 0;
        waveSpawnRemaining = 900;
        if (!gameActive || gameOver || gamePaused) return;
        spawnWavePortals();
    }, waveSpawnRemaining);
}

function spawnPortal(x, y, enemyCount) {
    if (!gameActive || gameOver || gamePaused) return null;

    const portal = document.createElement("img");
    portal.className = "portal";
    portal.src = "assets/portals/red portal.gif";
    portal.style.left = `${x}px`;
    portal.style.top = `${y}px`;
    if (x > window.innerWidth / 2) portal.classList.add("portal-flipped");
    portal.spawnX = x;
    portal.spawnY = y;
    portal.releaseTimers = [];
    portal.releaseRemaining = [];
    portal.releaseNextTick = [];
    portalContainer.appendChild(portal);
    playSound("portal");

    for (let i = 0; i < enemyCount; i++) {
        const delay = 1000 + i * 700;
        portal.releaseRemaining[i] = delay;
        portal.releaseNextTick[i] = performance.now() + delay;
        portal.releaseTimers[i] = setTimeout(function () {
            portal.releaseTimers[i] = null;
            portal.releaseRemaining[i] = 0;
            portal.releaseNextTick[i] = 0;
            if (!gameActive || gameOver || gamePaused) return;
            spawnEnemy1(portal.spawnX, portal.spawnY);
            pendingEnemySpawns = Math.max(0, pendingEnemySpawns - 1);
            waveSpawnedEnemies++;
            updateWaveDisplay();
            playSound("enemySpawn");
            if (pendingEnemySpawns <= 0 && waveSpawnedEnemies >= waveTotalEnemies) {
                waveSpawningComplete = true;
                waveStarting = false;
                checkWaveComplete();
            }
        }, delay);
    }

    return portal;
}

function xkBaseEndGame(victory) {
    if (gameOver) return;

    totalGameTime = Math.max(0, performance.now() - gameStartTime);
    gameOver = true;
    gameActive = false;
    gamePaused = false;
    stopAllGameActivity();
    cancelUnitPlacement();
    xkRoundPrepActive = false;

    if (selected999) {
        selected999.classList.remove("selected");
        const badge = selected999.querySelector(".xk-selected-999-badge");
        if (badge) badge.remove();
        selected999 = null;
    }
    if (selected999Waypoint) {
        selected999Waypoint.remove();
        selected999Waypoint = null;
    }

    finalScore = calculateScore();
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem("xkCalamityHighScore", String(highScore));
    }

    if (victory) xkCompletedWaves = 10;

    const finalScoreText = Math.floor(finalScore).toLocaleString();
    scoreValue.textContent = finalScoreText;
    highScoreValue.textContent = Math.floor(highScore).toLocaleString();
    deathScoreValue.textContent = finalScoreText;
    deathHighScoreValue.textContent = Math.floor(highScore).toLocaleString();
    finalTime.textContent = Math.floor(totalGameTime / 1000);
    finalUnits.textContent = totalUnitsPlaced;
    finalLives.textContent = livesLost;

    xkInjectEndScreenStats(victory ? victoryScreen : deathScreen, victory);

    gameScreen.style.display = "none";
    pauseScreen.style.display = "none";
    if (victory) {
        deathScreen.style.display = "none";
        victoryScreen.style.display = "flex";
        playSound("victory");
    } else {
        victoryScreen.style.display = "none";
        deathScreen.style.display = "flex";
        playSound("gameOver");
    }
}

function winGame() {
    xkCompletedWaves = 10;
    endGame(true);
}

/* ---- True pause-safe start/resume controls ---- */

(function xkBindControlOverrides() {
    xkEnsureFeatureUI();
    xkMobile = xkIsMobile();
    if (xkMobile) {
        if (cursor) cursor.style.display = "none";
        document.body.style.cursor = "auto";
    }

    // Capture phase prevents the original PLAY/RESTART handlers from starting the old flow.
    playButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        startGame();
    }, true);

    restartButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        startGame();
    }, true);

    victoryRestartButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        startGame();
    }, true);

    resumeButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        resumeGame();
    }, true);

    pauseMenuButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        resetGameState();
        gameScreen.style.display = "none";
        deathScreen.style.display = "none";
        victoryScreen.style.display = "none";
        pauseScreen.style.display = "none";
        mainMenu.style.display = "flex";
    }, true);

    // Escape pauses/resumes, including during tower placement. Placement is not cancelled.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" || event.repeat) return;
        if (!gameActive || gameOver) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (gamePaused) resumeGame(); else pauseGame();
    }, true);
})();

gameScreen.addEventListener("click", function (event) {
    if (gamePaused && !event.target.closest("button")) {
        event.stopImmediatePropagation();
    }
}, true);

// Selected 999 can be deselected with right click on desktop without affecting placement.
gameScreen.addEventListener("contextmenu", function (event) {
    if (gamePaused || !selected999) return;
    if (event.target.closest("button")) return;
    event.preventDefault();
    xkDeselect999();
});

let xkFinalBreachMode = false;
let xkFinalBreachBoss = null;
const xkFinalUnlockKey = "xkCalamityUnlocks";

function xkFinalLoadUnlocks() {
    try {
        const raw = localStorage.getItem(xkFinalUnlockKey);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
        return {};
    }
}

let xkFinalUnlocks = xkFinalLoadUnlocks();
let xkFinalBreachUnlocked = Boolean(xkFinalUnlocks.breach);

function xkFinalSaveUnlocks() {
    try {
        localStorage.setItem(xkFinalUnlockKey, JSON.stringify(xkFinalUnlocks));
    } catch (error) {
        // The game still works if localStorage is unavailable.
    }
}

function xkFinalUnlockBreach() {
    if (xkFinalBreachUnlocked) return;
    xkFinalBreachUnlocked = true;
    xkFinalUnlocks.breach = true;
    xkFinalSaveUnlocks();
    xkFinalEnsureBreachButton();
}

function xkFinalInjectStyles() {
    if (document.getElementById("xk-final-styles")) return;

    const style = document.createElement("style");
    style.id = "xk-final-styles";
    style.textContent = `
        /* ---------- SCP-style controls ---------- */
        #xk-round-panel button,
        #xk-pause-button,
        #xk-deselect-999 {
            background: #d7d7d7;
            color: #111;
            border: 2px solid #777;
            font-weight: 700;
            letter-spacing: .4px;
            transition: background .15s, border-color .15s, color .15s, transform .1s;
        }

        #xk-round-panel button:hover,
        #xk-pause-button:hover,
        #xk-deselect-999:hover {
            background: #f2f2f2;
            border-color: #aaa;
        }

        #xk-round-panel button:active,
        #xk-pause-button:active,
        #xk-deselect-999:active {
            transform: translateY(1px);
        }

        #xk-auto-rounds[data-on="true"] {
            background: #7d1010;
            color: #fff;
            border-color: #b22;
        }

        /* ---------- overlap fixes ---------- */
        #xk-round-panel {
            max-width: min(420px, calc(100vw - 32px));
            box-sizing: border-box;
        }

        #xk-score-hud {
            top: 152px;
            min-width: 150px;
            box-sizing: border-box;
        }

        #xk-selected-999 {
            max-width: min(220px, calc(100vw - 32px));
            box-sizing: border-box;
        }

        /* ---------- persistent BREACH menu option ---------- */
        #xk-breach-menu-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            margin-top: 14px;
        }

        #xk-breach-button {
            min-width: 180px;
            min-height: 52px;
            padding: 12px 30px;
            background: #3b0808;
            color: #f4f4f4;
            border: 2px solid #9d2222;
            font: inherit;
            font-weight: 700;
            letter-spacing: 3px;
            cursor: pointer;
            transition: background .15s, border-color .15s, transform .1s;
        }

        #xk-breach-button:hover {
            background: #650d0d;
            border-color: #d13a3a;
        }

        #xk-breach-button:active {
            transform: translateY(1px);
        }

        #xk-breach-caption {
            color: #aaa;
            font-size: 10px;
            letter-spacing: 1px;
            text-align: center;
        }

        /* ---------- Breach boss ---------- */
        .xk-final-breach-boss {
            width: 64px !important;
            height: 64px !important;
            background: #6f0b0b !important;
            border: 3px solid #d33 !important;
            box-sizing: border-box;
            clip-path: polygon(50% 0%, 97% 35%, 79% 91%, 21% 91%, 3% 35%);
            box-shadow: 0 0 0 4px rgba(110,0,0,.35), 0 0 22px rgba(220,0,0,.35);
            animation: xk-final-breach-spin 1.6s linear infinite;
            z-index: 8;
        }

        @keyframes xk-final-breach-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .xk-final-breach-label {
            position: absolute;
            transform: translate(-50%, -100%);
            color: #fff;
            background: rgba(60,0,0,.92);
            border: 1px solid #c33;
            padding: 3px 6px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 40;
        }

        .xk-final-breach-healthbar {
            width: 100px !important;
            height: 7px !important;
            box-sizing: border-box;
            z-index: 40;
        }

        #game-screen.game-paused .xk-final-breach-boss {
            animation-play-state: paused !important;
        }

        /* ---------- final screens on small displays ---------- */
        .xk-final-stats,
        .xk-score-breakdown {
            width: min(520px, 92vw);
            max-width: 92vw;
            box-sizing: border-box;
        }

        .xk-score-breakdown {
            overflow-x: auto;
        }

        @media (max-width: 700px), (pointer: coarse) {
            #xk-round-panel {
                top: 145px;
                width: min(330px, calc(100vw - 20px));
                min-width: 0;
                max-width: calc(100vw - 20px);
                padding: 9px 10px;
            }

            #xk-round-title {
                font-size: 16px;
            }

            #xk-round-countdown {
                font-size: 11px;
            }

            #xk-score-hud {
                left: 8px;
                top: auto;
                bottom: 138px;
                min-width: 132px;
                padding: 6px 8px;
                font-size: 12px;
            }

            #xk-selected-999 {
                right: 8px;
                top: 68px;
                min-width: 145px;
                max-width: 43vw;
                font-size: 12px;
            }

            #xk-pause-button {
                right: 8px;
                top: 8px;
                min-height: 48px;
            }

            #xk-score-legend {
                left: auto !important;
                right: 8px !important;
                top: auto !important;
                bottom: 78px !important;
                transform: none !important;
                width: 145px !important;
                max-width: 42vw !important;
                font-size: 9px !important;
            }

            #xk-breach-button {
                min-width: 160px;
                width: min(220px, 70vw);
            }

            .xk-final-breach-boss {
                width: 54px !important;
                height: 54px !important;
            }

            .xk-final-breach-healthbar {
                width: 82px !important;
            }

            .xk-final-stats,
            .xk-score-breakdown {
                width: 92vw;
                max-height: 42vh;
                overflow: auto;
            }
        }

        @media (max-width: 380px) {
            #xk-round-panel {
                top: 138px;
            }

            #xk-score-hud {
                top: auto;
                bottom: 138px;
                font-size: 10px;
                min-width: 120px;
            }

            #xk-selected-999 {
                min-width: 130px;
                font-size: 10px;
            }

            #xk-score-legend {
                width: 128px !important;
                font-size: 8px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function xkFinalEnsureBreachButton() {
    if (!mainMenu || !xkFinalBreachUnlocked) return;
    if (document.getElementById("xk-breach-menu-wrap")) return;

    const wrap = document.createElement("div");
    wrap.id = "xk-breach-menu-wrap";

    const button = document.createElement("button");
    button.type = "button";
    button.id = "xk-breach-button";
    button.textContent = "BREACH";

    const caption = document.createElement("div");
    caption.id = "xk-breach-caption";
    caption.textContent = "CONTAINMENT FAILURE MODE — UNLOCKED";

    wrap.appendChild(button);
    wrap.appendChild(caption);
    mainMenu.appendChild(wrap);

    button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        startGame(true);
    });
}

function xkFinalSetRoundTitle(roundNumber) {
    xkEnsureFeatureUI();
    const title = document.getElementById("xk-round-title");
    if (!title) return;

    title.textContent = xkFinalBreachMode && roundNumber === 10
        ? "BREACH — ROUND 10 BOSS"
        : `ROUND ${roundNumber}`;
}

function xkFinalUpdateRoundPrepUI() {
    const panel = document.getElementById("xk-round-panel");
    const countdown = document.getElementById("xk-round-countdown");
    const start = document.getElementById("xk-start-round");
    if (!panel || !countdown || !start) return;

    panel.style.display = xkRoundPrepActive ? "block" : "none";
    const seconds = Math.max(0, xkRoundPrepRemaining / 1000);
    const label = xkFinalBreachMode && currentWave === 10 ? "BOSS DEPLOYMENT" : "DEPLOYMENT";

    countdown.textContent = xkAutoPlayRounds
        ? `${label}: ${seconds.toFixed(1)}s — AUTO START ${seconds <= 0 ? "NOW" : "ARMED"}`
        : `${label}: ${seconds.toFixed(1)}s — MANUAL START AVAILABLE`;

    start.textContent = xkRoundPrepActive ? "START ROUND" : "ROUND ACTIVE";
}

function xkFinalCreateBossHealthUI(boss, x, y) {
    if (!boss || !boss.healthBar) return;

    boss.healthBar.classList.add("xk-final-breach-healthbar");
    boss.healthBar.style.left = `${x}px`;
    boss.healthBar.style.top = `${y - 42}px`;

    const label = document.createElement("div");
    label.className = "xk-final-breach-label";
    label.textContent = "BREACH ENTITY — HP 500 / 500";
    label.style.left = `${x}px`;
    label.style.top = `${y - 48}px`;
    portalContainer.appendChild(label);
    boss.bossLabel = label;
}

function xkFinalSpawnBreachBoss(x, y) {
    if (!gameActive || gameOver || gamePaused) return null;

    // Use the normal enemy for health/damage/projectile compatibility, then
    // replace only its movement with the slower boss movement.
    const boss = spawnEnemy1(x, y);
    if (!boss) return null;

    if (boss.moveAnimation) {
        cancelAnimationFrame(boss.moveAnimation);
        boss.moveAnimation = null;
    }

    boss.classList.add("xk-final-breach-boss");
    boss.health = 500;
    boss.maxHealth = 500;
    boss.damage = 5;
    boss.attackInterval = 1000;
    boss.attackRemaining = 1000;
    boss.attackNextTick = 0;
    boss.attackingCore = false;
    boss.attackingUnit = false;
    boss.targetUnit = null;
    boss.dead = false;

    if (boss.healthDisplay) {
        boss.healthDisplay.style.width = "100%";
    }

    let bossX = x;
    let bossY = y + 50;
    const bossSpeed = 25; // half the normal 50 px/s enemy speed

    xkFinalCreateBossHealthUI(boss, bossX, bossY);

    function updateBossUI() {
        if (!boss.isConnected) return;
        if (boss.healthBar) {
            boss.healthBar.style.left = `${bossX}px`;
            boss.healthBar.style.top = `${bossY - 42}px`;
        }
        if (boss.bossLabel) {
            boss.bossLabel.style.left = `${bossX}px`;
            boss.bossLabel.style.top = `${bossY - 48}px`;
            boss.bossLabel.textContent = `BREACH ENTITY — HP ${boss.health} / ${boss.maxHealth}`;
        }
    }

    function attackBossCore() {
        if (boss.attackTimer !== null || boss.dead || gamePaused || gameOver) return;

        boss.attackingCore = true;
        boss.attackRemaining = Number.isFinite(boss.attackRemaining) && boss.attackRemaining > 0
            ? boss.attackRemaining
            : boss.attackInterval;
        boss.attackNextTick = performance.now() + boss.attackRemaining;

        boss.attackTimer = setTimeout(function attackBossCoreTick() {
            boss.attackTimer = null;
            if (!gameActive || gameOver || gamePaused || boss.dead) return;

            coreHealth = Math.max(0, coreHealth - boss.damage);
            coreHealthDisplay.textContent = coreHealth;
            playSound("coreHit");

            if (coreHealth <= 0) {
                boss.attackingCore = false;
                endGame(false);
                return;
            }

            boss.attackRemaining = boss.attackInterval;
            boss.attackNextTick = performance.now() + boss.attackRemaining;
            boss.attackTimer = setTimeout(attackBossCoreTick, boss.attackRemaining);
        }, boss.attackRemaining);
    }

    function moveBoss() {
        boss.moveAnimation = null;

        if (!gameActive || gameOver) {
            clearEnemyActivity(boss);
            if (boss.healthBar) boss.healthBar.remove();
            if (boss.bossLabel) boss.bossLabel.remove();
            boss.remove();
            enemySet.delete(boss);
            xkFinalBreachBoss = null;
            return;
        }

        if (boss.dead) return;

        if (gamePaused) {
            boss.resumeMovement = moveBoss;
            return;
        }

        const now = performance.now();
        const last = Number.isFinite(boss.lastMoveTime) ? boss.lastMoveTime : now;
        const delta = Math.min(0.1, Math.max(0, (now - last) / 1000));
        boss.lastMoveTime = now;

        const allied = xkFindNearestAlliedUnit(boss);
        const coreX = window.innerWidth / 2;
        const coreY = window.innerHeight / 2;

        if (allied && allied.unit && allied.unit.isConnected && allied.unit.health > 0) {
            const targetX = parseFloat(allied.unit.style.left);
            const targetY = parseFloat(allied.unit.style.top);
            const dx = targetX - bossX;
            const dy = targetY - bossY;
            const distance = Math.hypot(dx, dy);
            const attackRange = 30;

            if (distance <= attackRange) {
                if (boss.attackTimer === null && !boss.attackingUnit) {
                    xkAttackAlliedUnit(boss, allied.unit);
                }
                updateBossUI();
                boss.moveAnimation = requestAnimationFrame(moveBoss);
                return;
            }

            if (boss.attackTimer !== null) {
                clearTimeout(boss.attackTimer);
                boss.attackTimer = null;
                boss.attackRemaining = boss.attackInterval;
                boss.attackNextTick = 0;
            }

            boss.attackingUnit = false;
            boss.targetUnit = null;

            if (distance > 0) {
                const step = Math.min(bossSpeed * delta, distance);
                bossX += (dx / distance) * step;
                bossY += (dy / distance) * step;
            }

            boss.style.left = `${bossX}px`;
            boss.style.top = `${bossY}px`;
            updateBossUI();
            boss.moveAnimation = requestAnimationFrame(moveBoss);
            return;
        }

        boss.attackingUnit = false;
        boss.targetUnit = null;

        const dx = coreX - bossX;
        const dy = coreY - bossY;
        const distance = Math.hypot(dx, dy);

        if (distance <= 70) {
            if (!boss.hasReachedCore) {
                boss.hasReachedCore = true;
                livesLost++;
                xkUpdateLiveScore();
                playSound("coreReached");
            }
            attackBossCore();
            updateBossUI();
            return;
        }

        if (boss.attackTimer !== null) {
            clearTimeout(boss.attackTimer);
            boss.attackTimer = null;
            boss.attackRemaining = boss.attackInterval;
            boss.attackNextTick = 0;
        }

        if (distance > 0) {
            const step = Math.min(bossSpeed * delta, distance);
            bossX += (dx / distance) * step;
            bossY += (dy / distance) * step;
        }

        boss.style.left = `${bossX}px`;
        boss.style.top = `${bossY}px`;
        updateBossUI();
        boss.moveAnimation = requestAnimationFrame(moveBoss);
    }

    boss.moveFunction = moveBoss;
    boss.resumeMovement = moveBoss;
    boss.lastMoveTime = performance.now();
    boss.moveAnimation = requestAnimationFrame(moveBoss);
    xkFinalBreachBoss = boss;
    return boss;
}

/* Override round-title helper so Round 10 clearly announces the Breach boss. */
function xkSetRoundPopup(roundNumber) {
    xkEnsureFeatureUI();
    const title = document.getElementById("xk-round-title");
    if (title) {
        title.textContent = xkFinalBreachMode && roundNumber === 10
            ? "BREACH — ROUND 10 BOSS"
            : `ROUND ${roundNumber}`;
    }
}

/* Override round-prep UI so the mobile/desktop text stays correct. */
function xkUpdateRoundPrepUI() {
    xkFinalUpdateRoundPrepUI();
}

/* Containment and Breach both use the same round-prep system. */
function startGame(breachMode = false) {
    if (breachMode && !xkFinalBreachUnlocked) return;

    if (xkFinalBreachBoss && xkFinalBreachBoss.bossLabel) {
        xkFinalBreachBoss.bossLabel.remove();
    }
    xkFinalBreachBoss = null;
    xkFinalBreachMode = Boolean(breachMode);

    resetGameState();
    xkEnsureFeatureUI();

    gameActive = true;
    gameOver = false;
    gamePaused = false;
    gameStartTime = performance.now();
    currentWave = 1;
    xkCompletedWaves = 0;
    xkAutoPlayRounds = false;
    xkRoundPrepActive = false;

    mainMenu.style.display = "none";
    deathScreen.style.display = "none";
    victoryScreen.style.display = "none";
    pauseScreen.style.display = "none";
    gameScreen.style.display = "block";

    const autoButton = document.getElementById("xk-auto-rounds");
    if (autoButton) {
        autoButton.dataset.on = "false";
        autoButton.textContent = "AUTO ROUNDS: OFF";
    }

    startResearchPointTimer();
    xkScheduleScoreRefresh();
    xkBeginRoundPreparation();
    xkUpdateSelected999UI();
    xkUpdateLiveScore();
    playSound("button");
}

/* Round 10 becomes a single boss encounter in Breach mode. */
function startWave() {
    if (!gameActive || gameOver || gamePaused || xkRoundPrepActive) return;

    waveStarting = true;
    waveSpawningComplete = false;
    pendingEnemySpawns = 0;
    waveSpawnedEnemies = 0;
    waveKilledEnemies = 0;
    waveTotalEnemies = (xkFinalBreachMode && currentWave === 10)
        ? 1
        : getWaveEnemyCount(currentWave);
    currentWaveStartTime = performance.now();
    waveSpawnRemaining = 900;
    waveSpawnNextTick = 0;

    updateWaveDisplay();
    xkSetRoundPopup(currentWave);
    playSound("waveStart");

    if (xkFinalBreachMode && currentWave === 10) {
        waveStarting = false;
        waveSpawningComplete = true;
        const position = getRandomPortalPosition();
        const boss = xkFinalSpawnBreachBoss(position.x, position.y);
        if (!boss) {
            waveSpawningComplete = false;
            return;
        }
        waveSpawnedEnemies = 1;
        updateWaveDisplay();
        return;
    }

    spawnWavePortals();
}

/* Normal Round 10 still ends the normal run; Breach Round 10 ends after boss death. */
function startNextWave() {
    if (!gameActive || gameOver || gamePaused) return;

    if (currentWave >= 10) {
        xkCompletedWaves = 10;
        endGame(true);
        return;
    }

    xkCompletedWaves = Math.max(xkCompletedWaves, currentWave);
    currentWave++;
    updateWaveDisplay();
    xkBeginRoundPreparation();
}

/* Unlock BREACH only after a normal successful Round 10 clear. */
const xkFinalBaseEndGame = endGame;
function endGame(victory) {

    if (victory) {
        xkCompletedWaves = 10;

        if (!xkFinalBreachMode) {
            xkFinalUnlockBreach();
        }
    }

    if (
        xkFinalBreachBoss &&
        xkFinalBreachBoss.bossLabel
    ) {
        xkFinalBreachBoss.bossLabel.remove();
    }

    xkFinalBreachBoss = null;

    xkBaseEndGame(victory);
}

/* Initial setup. */
xkFinalInjectStyles();
xkFinalEnsureBreachButton();

/* =========================================================
   XK ADMIN BYPASS
   Ctrl + Shift + F10 -> jump the active run directly to Round 10.
   This is intentionally local-only and has no effect on unlock storage.
========================================================= */
(function xkAdminBypass() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.repeat) {
                return;
            }

            if (
                event.key.toLowerCase() !== "z"
            ) {
                return;
            }

            if (!event.shiftKey) {
                return;
            }

            if (
                !gameActive ||
                gameOver
            ) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();




            gameOver = false;
            gameActive = true;
            gamePaused = false;

            currentWave = 10;
            xkCompletedWaves = 10;
            xkRoundPrepActive = false;

            endGame(true);

        },
        true
    );

})();
