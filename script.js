/* =========================================================
   DOM ELEMENTS
========================================================= */


/* =========================
   MAIN MENU
========================= */

const playButton =
    document.getElementById("play-button");

const mainMenu =
    document.getElementById("main-menu");


/* =========================
   GAME SCREEN
========================= */

const gameScreen =
    document.getElementById("game-screen");

const portalContainer =
    document.getElementById("portal-container");

const deployGunmanButton =
    document.getElementById("deploy-gunman");

const deploy999Button =
    document.getElementById("deploy-999");


/* =========================
   CORE
========================= */

const core =
    document.getElementById("core");

const coreHealthDisplay =
    document.getElementById("core-health");


/* =========================
   RESEARCH POINTS
========================= */

const researchPointsDisplay =
    document.getElementById("research-points");


/* =========================
   WAVE DISPLAY
========================= */

const waveNumberDisplay =
    document.getElementById("wave-number");

const waveKilledDisplay =
    document.getElementById("wave-killed");

const waveTotalDisplay =
    document.getElementById("wave-total");


/* =========================
   DEATH SCREEN
========================= */

const deathScreen =
    document.getElementById("death-screen");

const restartButton =
    document.getElementById("restart-button");

const menuButton =
    document.getElementById("menu-button");

const deathScoreValue =
    document.getElementById("death-score-value");

const deathHighScoreValue =
    document.getElementById("death-high-score-value");


/* =========================
   VICTORY SCREEN
========================= */

const victoryScreen =
    document.getElementById("victory-screen");

const victoryRestartButton =
    document.getElementById(
        "victory-restart-button"
    );

const victoryMenuButton =
    document.getElementById(
        "victory-menu-button"
    );

const scoreValue =
    document.getElementById("score-value");

const highScoreValue =
    document.getElementById("high-score-value");

const finalTime =
    document.getElementById("final-time");

const finalUnits =
    document.getElementById("final-units");

const finalLives =
    document.getElementById("final-lives");


/* =========================
   PAUSE
========================= */

const pauseScreen =
    document.getElementById("pause-screen");

const resumeButton =
    document.getElementById("resume-button");

const pauseMenuButton =
    document.getElementById("pause-menu-button");


/* =========================
   CUSTOM CURSOR
========================= */

const cursor =
    document.getElementById("custom-cursor");

const cursorImage =
    document.getElementById("cursor-image");



/* =========================================================
   GAME VARIABLES
========================================================= */


/* =========================
   GAME STATE
========================= */

let gameOver = false;

let gameActive = false;

let gameStartTimeout = null;

let gamePaused = false;


/* =========================
   PAUSE
========================= */

function pauseGame() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {

        return;
    }


    gamePaused = true;


    pauseScreen.style.display =
        "flex";
}


function resumeGame() {

    if (
        !gamePaused
    ) {

        return;
    }


    gamePaused = false;


    pauseScreen.style.display =
        "none";
}


/* =========================
   RESEARCH POINTS
========================= */

let researchPoints = 10;

const startingResearchPoints = 200;


/* =========================
   CORE
========================= */

let coreHealth = 100;

const maxCoreHealth = 100;


/* =========================
   PORTALS
========================= */

const minPortalDistance = 300;

const portalMargin = 100;


/* =========================
   UNIT PLACEMENT
========================= */

let placingGunman = false;

let placing999 = false;

let selected999 = null;

let selected999Waypoint = null;

let placementPreview = null;

let placementBoundary = null;

let placementExistingBoundaries = [];

let placementCoreBoundary = null;


/*
    Minimum distance between
    a deployed unit and the Core.
*/

const minUnitCoreDistance = 120;


/*
    Minimum distance between
    deployed defensive units.
*/

const minUnitDistance = 50;


/*
    Minimum distance from the
    edge of the battlefield.
*/

const battlefieldMargin = 50;


const scp999BuffRange = 150;

const scp999BuffGracePeriod = 5000;

const scp999MoveSpeed = 150;


/* =========================
   WAVE VARIABLES
========================= */

let currentWave = 1;

let waveTotalEnemies = 0;

let waveSpawnedEnemies = 0;

let waveKilledEnemies = 0;

let activeEnemies = 0;

let waveStarting = false;

let waveTimeout = null;

let waveSpawnTimeout = null;


/*
    Number of enemies whose
    portal timers are still
    waiting to release them.
*/

let pendingEnemySpawns = 0;


/*
    Becomes true when every
    enemy for the wave has
    actually been released.
*/

let waveSpawningComplete = false;


/* =========================
   ACTIVE ENTITIES
========================= */

const enemySet =
    new Set();

const gunmanSet =
    new Set();

const heroSet =
    new Set();



/* =========================================================
   SCORE VARIABLES
========================================================= */

let totalUnitsPlaced = 0;

let livesLost = 0;

let currentWaveStartTime = 0;

let currentWaveTime = 0;

let totalGameTime = 0;

let gameStartTime = 0;

let finalScore = 0;


/* =========================
   HIGH SCORE
========================= */

let highScore =
    Number(
        localStorage.getItem(
            "xkCalamityHighScore"
        )
    ) || 0;



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


Object.values(
    sounds
).forEach(
    function (sound) {

        sound.volume =
            0.35;

    }
);


/* =========================
   PLAY SOUND
========================= */

function playSound(
    soundName
) {

    const sound =
        sounds[soundName];


    if (!sound) {
        return;
    }


    sound.currentTime =
        0;


    sound.play().catch(
        function () {

        }
    );
}



/* =========================================================
   RESET GAME
========================================================= */

function resetGameState() {

    gameOver = false;

    gameActive = false;

    gamePaused = false;

    placingGunman = false;

    placing999 = false;

    selected999 = null;

    selected999Waypoint = null;


    /* =========================
       REMOVE PLACEMENT PREVIEW
    ========================= */

    removePlacementPreview();


    pauseScreen.style.display =
        "none";


    /* =========================
       CLEAR START DELAY
    ========================= */

    if (
        gameStartTimeout
    ) {

        clearTimeout(
            gameStartTimeout
        );

        gameStartTimeout = null;
    }


    /* =========================
       RESET RP
    ========================= */

    researchPoints =
        startingResearchPoints;


    researchPointsDisplay.textContent =
        researchPoints;


    /* =========================
       RESET CORE
    ========================= */

    coreHealth =
        maxCoreHealth;


    coreHealthDisplay.textContent =
        coreHealth;


    /* =========================
       RESET WAVES
    ========================= */

    currentWave = 1;

    waveTotalEnemies = 0;

    waveSpawnedEnemies = 0;

    waveKilledEnemies = 0;

    activeEnemies = 0;

    pendingEnemySpawns = 0;

    waveSpawningComplete =
        false;

    waveStarting = false;


    /* =========================
       RESET SCORE
    ========================= */

    totalUnitsPlaced = 0;

    livesLost = 0;

    currentWaveStartTime = 0;

    currentWaveTime = 0;

    totalGameTime = 0;

    gameStartTime = 0;

    finalScore = 0;


    /* =========================
       CLEAR WAVE TIMERS
    ========================= */

    if (
        waveTimeout
    ) {

        clearTimeout(
            waveTimeout
        );

        waveTimeout = null;
    }


    if (
        waveSpawnTimeout
    ) {

        clearTimeout(
            waveSpawnTimeout
        );

        waveSpawnTimeout = null;
    }


    /* =========================
       CLEAR ENEMIES
    ========================= */

    enemySet.forEach(
        function (enemy) {

            if (
                enemy.attackTimer
            ) {

                clearInterval(
                    enemy.attackTimer
                );

            }

        }
    );


    enemySet.clear();


    /* =========================
       CLEAR GUNMEN
    ========================= */

    gunmanSet.forEach(
        function (gunman) {

            if (
                gunman.fireInterval
            ) {

                clearInterval(
                    gunman.fireInterval
                );

            }


            if (
                gunman.bstTimeout
            ) {

                clearTimeout(
                    gunman.bstTimeout
                );

            }

        }
    );


    gunmanSet.clear();


    /* =========================
       CLEAR HEROES
    ========================= */

    heroSet.forEach(
        function (hero) {

            if (
                hero.moveAnimation
            ) {

                cancelAnimationFrame(
                    hero.moveAnimation
                );

            }

        }
    );


    heroSet.clear();


    /* =========================
       CLEAR BATTLEFIELD
    ========================= */

    portalContainer.innerHTML =
        "";


    deployGunmanButton.classList.remove(
        "selected"
    );


    deploy999Button.classList.remove(
        "selected"
    );


    /* =========================
       UPDATE UI
    ========================= */

    updateWaveDisplay();
}



/* =========================================================
   START GAME
========================================================= */

function startGame() {

    resetGameState();


    gameActive = true;


    gameStartTime =
        performance.now();


    mainMenu.style.display =
        "none";


    deathScreen.style.display =
        "none";


    victoryScreen.style.display =
        "none";


    gameScreen.style.display =
        "block";


    playSound(
        "button"
    );


    /*
        Give the player one second
        before Wave 1 begins.
    */

    gameStartTimeout =
        setTimeout(
            function () {

                gameStartTimeout =
                    null;


                if (
                    !gameActive ||
                    gameOver
                ) {

                    return;
                }


                startWave();

            },
            1000
        );
}



/* =========================================================
   PLAY BUTTON
========================================================= */

playButton.addEventListener(
    "click",
    function () {

        startGame();

    }
);



/* =========================================================
   CUSTOM CURSOR
========================================================= */


/* =========================
   CURSOR MOVEMENT
========================= */

document.addEventListener(
    "mousemove",
    function (event) {

        cursor.style.left =
            `${event.clientX}px`;

        cursor.style.top =
            `${event.clientY}px`;

    }
);


/* =========================
   BUTTON HOVER
========================= */

const buttons =
    document.querySelectorAll(
        "button"
    );


buttons.forEach(
    function (button) {

        button.addEventListener(
            "mouseenter",
            function () {

                cursorImage.src =
                    "assets/cursor/cursor-hover.png";


                cursor.classList.add(
                    "hover"
                );

            }
        );


        button.addEventListener(
            "mouseleave",
            function () {

                cursorImage.src =
                    "assets/cursor/cursor.png";


                cursor.classList.remove(
                    "hover"
                );

            }
        );

    }
);



/* =========================================================
   RESEARCH POINTS
========================================================= */

setInterval(
    function () {

        if (
            !gameActive ||
            gameOver
        ) {

            return;
        }


        researchPoints++;


        researchPointsDisplay.textContent =
            researchPoints;

    },
    1000
);



/* =========================================================
   WAVE SIZE
========================================================= */

function getWaveEnemyCount(
    wave
) {

    let minimum;

    let maximum;


    if (
        wave === 1
    ) {

        minimum = 5;
        maximum = 7;

    }

    else if (
        wave === 2
    ) {

        minimum = 8;
        maximum = 11;

    }

    else if (
        wave === 3
    ) {

        minimum = 11;
        maximum = 15;

    }

    else if (
        wave === 4
    ) {

        minimum = 15;
        maximum = 19;

    }

    else if (
        wave === 5
    ) {

        minimum = 19;
        maximum = 24;

    }

    else if (
        wave === 6
    ) {

        minimum = 23;
        maximum = 28;

    }

    else if (
        wave === 7
    ) {

        minimum = 27;
        maximum = 33;

    }

    else if (
        wave === 8
    ) {

        minimum = 32;
        maximum = 38;

    }

    else if (
        wave === 9
    ) {

        minimum = 38;
        maximum = 44;

    }

    else {

        minimum = 45;
        maximum = 50;

    }


    return Math.floor(
        Math.random() *
        (
            maximum -
            minimum +
            1
        )
    ) + minimum;
}



/* =========================================================
   WAVE DISPLAY
========================================================= */

function updateWaveDisplay() {

    waveNumberDisplay.textContent =
        currentWave;


    waveKilledDisplay.textContent =
        waveKilledEnemies;


    waveTotalDisplay.textContent =
        waveTotalEnemies;
}



/* =========================================================
   START WAVE
========================================================= */

function startWave() {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    waveStarting = true;

    waveSpawningComplete =
        false;

    pendingEnemySpawns = 0;

    waveSpawnedEnemies = 0;

    waveKilledEnemies = 0;


    waveTotalEnemies =
        getWaveEnemyCount(
            currentWave
        );


    currentWaveStartTime =
        performance.now();


    updateWaveDisplay();


    playSound(
        "waveStart"
    );


    spawnWavePortals();
}



/* =========================================================
   SPAWN WAVE PORTALS
========================================================= */

function spawnWavePortals() {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    if (
        waveSpawnedEnemies +
        pendingEnemySpawns >=
        waveTotalEnemies
    ) {

        waveStarting = false;


        if (
            pendingEnemySpawns <= 0
        ) {

            waveSpawningComplete =
                true;


            checkWaveComplete();

        }


        return;
    }


    const remaining =
        waveTotalEnemies -
        waveSpawnedEnemies -
        pendingEnemySpawns;


    let enemiesFromPortal =
        Math.floor(
            Math.random() * 3
        ) + 1;


    enemiesFromPortal =
        Math.min(
            enemiesFromPortal,
            remaining
        );


    const portalPosition =
        getRandomPortalPosition();


    spawnPortal(
        portalPosition.x,
        portalPosition.y,
        enemiesFromPortal
    );


    pendingEnemySpawns +=
        enemiesFromPortal;


    updateWaveDisplay();


    waveSpawnTimeout =
        setTimeout(
            function () {

                waveSpawnTimeout =
                    null;


                spawnWavePortals();

            },
            900
        );
}



/* =========================================================
   RANDOM PORTAL POSITION
========================================================= */

function getRandomPortalPosition() {

    const coreX =
        window.innerWidth / 2;

    const coreY =
        window.innerHeight / 2;


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


        const dx =
            x - coreX;


        const dy =
            y - coreY;


        distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

    }

    while (
        distance <
        minPortalDistance
    );


    return {
        x: x,
        y: y
    };
}



/* =========================================================
   SPAWN PORTAL
========================================================= */

function spawnPortal(
    x,
    y,
    enemyCount
) {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    const portal =
        document.createElement(
            "img"
        );


    portal.classList.add(
        "portal"
    );


    portal.src =
        "assets/portals/red portal.gif";


    portal.style.left =
        `${x}px`;


    portal.style.top =
        `${y}px`;


    if (
        x >
        window.innerWidth / 2
    ) {

        portal.classList.add(
            "portal-flipped"
        );

    }


    portalContainer.appendChild(
        portal
    );


    playSound(
        "portal"
    );


    /*
        Release enemies one at
        a time from the portal.
    */

    for (
        let i = 0;
        i < enemyCount;
        i++
    ) {

        setTimeout(
            function () {

                if (
                    !gameActive ||
                    gameOver
                ) {

                    pendingEnemySpawns--;

                    return;
                }


                spawnEnemy1(
                    x,
                    y
                );


                pendingEnemySpawns--;

                waveSpawnedEnemies++;


                updateWaveDisplay();


                playSound(
                    "enemySpawn"
                );


                if (
                    pendingEnemySpawns <= 0 &&
                    waveSpawnedEnemies >=
                        waveTotalEnemies
                ) {

                    waveSpawningComplete =
                        true;

                    waveStarting =
                        false;


                    checkWaveComplete();

                }

            },
            1000 + i * 700
        );

    }


    portal.addEventListener(
        "animationend",
        function () {

            portal.remove();

        }
    );
}



/* =========================================================
   ENEMY 1
========================================================= */

function spawnEnemy1(
    x,
    y
) {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    const enemy =
        document.createElement(
            "div"
        );


    enemy.classList.add(
        "enemy-1"
    );


    let enemyX = x;

    let enemyY =
        y + 50;


    enemy.style.left =
        `${enemyX}px`;

    enemy.style.top =
        `${enemyY}px`;


    portalContainer.appendChild(
        enemy
    );


    enemySet.add(
        enemy
    );


    activeEnemies++;


    /* =========================
       ENEMY STATS
    ========================= */

    enemy.health = 20;

    enemy.maxHealth = 20;

    enemy.damage = 5;

    enemy.attackInterval = 1000;

    enemy.attackTimer = null;

    enemy.dead = false;

    enemy.hasReachedCore = false;


    /* =========================
       HEALTH BAR
    ========================= */

    const healthBar =
        document.createElement(
            "div"
        );


    healthBar.classList.add(
        "enemy-healthbar"
    );


    const health =
        document.createElement(
            "div"
        );


    health.classList.add(
        "enemy-health"
    );


    healthBar.appendChild(
        health
    );


    portalContainer.appendChild(
        healthBar
    );


    enemy.healthBar =
        healthBar;

    enemy.healthDisplay =
        health;


    /* =========================
       ENEMY ATTACK
    ========================= */

    let attackingCore = false;


    function attackCore() {

        if (
            attackingCore ||
            gameOver ||
            enemy.dead
        ) {

            return;
        }


        attackingCore = true;


        enemy.attackTimer =
            setInterval(
                function () {

                    if (
                        !gameActive ||
                        gameOver ||
                        enemy.dead
                    ) {

                        clearInterval(
                            enemy.attackTimer
                        );


                        enemy.attackTimer =
                            null;


                        return;
                    }


                    coreHealth -=
                        enemy.damage;


                    if (
                        coreHealth < 0
                    ) {

                        coreHealth = 0;

                    }


                    coreHealthDisplay.textContent =
                        coreHealth;


                    playSound(
                        "coreHit"
                    );


                    if (
                        coreHealth <= 0
                    ) {

                        endGame(
                            false
                        );

                    }

                },
                enemy.attackInterval
            );

    }


    /* =========================
       ENEMY MOVEMENT
    ========================= */

    const enemySpeed = 50;


    function moveEnemy() {

        if (
            !gameActive ||
            gameOver
        ) {

            enemy.remove();

            healthBar.remove();


            if (
                enemy.attackTimer
            ) {

                clearInterval(
                    enemy.attackTimer
                );


                enemy.attackTimer =
                    null;
            }


            enemySet.delete(
                enemy
            );


            return;
        }


        if (
            enemy.dead
        ) {

            return;
        }


        const coreX =
            window.innerWidth / 2;

        const coreY =
            window.innerHeight / 2;


        const dx =
            coreX -
            enemyX;

        const dy =
            coreY -
            enemyY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /* =========================
           REACHED CORE
        ========================= */

        if (
            distance <= 70
        ) {

            if (
                !enemy.hasReachedCore
            ) {

                enemy.hasReachedCore =
                    true;


                livesLost++;


                playSound(
                    "coreReached"
                );

            }


            attackCore();


            healthBar.style.left =
                `${enemyX}px`;


            healthBar.style.top =
                `${enemyY - 12}px`;


            requestAnimationFrame(
                moveEnemy
            );


            return;
        }


        /* =========================
           MOVE ENEMY
        ========================= */

        enemyX +=
            (dx / distance) *
            enemySpeed /
            60;


        enemyY +=
            (dy / distance) *
            enemySpeed /
            60;


        enemy.style.left =
            `${enemyX}px`;


        enemy.style.top =
            `${enemyY}px`;


        healthBar.style.left =
            `${enemyX}px`;


        healthBar.style.top =
            `${enemyY - 12}px`;


        requestAnimationFrame(
            moveEnemy
        );

    }


    moveEnemy();
}



/* =========================================================
   RP POPUP
========================================================= */

function showRPPopup(
    x,
    y
) {

    const popup =
        document.createElement(
            "div"
        );


    popup.classList.add(
        "rp-popup"
    );


    popup.textContent =
        "+2 RP";


    popup.style.left =
        `${x}px`;


    popup.style.top =
        `${y}px`;


    portalContainer.appendChild(
        popup
    );


    setTimeout(
        function () {

            popup.remove();

        },
        1000
    );
}



/* =========================================================
   DAMAGE ENEMY
========================================================= */

function damageEnemy(
    enemy,
    damage
) {

    if (
        !enemy.isConnected ||
        enemy.dead
    ) {

        return;
    }


    enemy.health -=
        damage;


    if (
        enemy.health < 0
    ) {

        enemy.health = 0;

    }


    enemy.healthDisplay.style.width =
        `${
            (
                enemy.health /
                enemy.maxHealth
            ) * 100
        }%`;


    playSound(
        "enemyHit"
    );


    /* =========================
       ENEMY DIES
    ========================= */

    if (
        enemy.health <= 0
    ) {

        enemy.dead = true;


        if (
            enemy.attackTimer
        ) {

            clearInterval(
                enemy.attackTimer
            );


            enemy.attackTimer =
                null;
        }


        const enemyRect =
            enemy.getBoundingClientRect();


        const enemyX =
            enemyRect.left +
            enemyRect.width / 2;


        const enemyY =
            enemyRect.top +
            enemyRect.height / 2;


        enemy.remove();


        if (
            enemy.healthBar
        ) {

            enemy.healthBar.remove();

        }


        enemySet.delete(
            enemy
        );


        activeEnemies--;


        if (
            activeEnemies < 0
        ) {

            activeEnemies = 0;

        }


        playSound(
            "enemyDeath"
        );


        /* =========================
           GIVE RP
        ========================= */

        if (
            gameActive &&
            !gameOver
        ) {

            researchPoints +=
                2;


            researchPointsDisplay.textContent =
                researchPoints;


            showRPPopup(
                enemyX,
                enemyY
            );


            playSound(
                "rpGain"
            );


            waveKilledEnemies++;


            updateWaveDisplay();


            checkWaveComplete();

        }

    }
}



/* =========================================================
   CHECK WAVE COMPLETE
========================================================= */

function checkWaveComplete() {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    if (
        waveSpawningComplete &&

        pendingEnemySpawns <= 0 &&

        waveSpawnedEnemies >=
            waveTotalEnemies &&

        waveKilledEnemies >=
            waveTotalEnemies &&

        activeEnemies <= 0
    ) {

        currentWaveTime =
            performance.now() -
            currentWaveStartTime;


        /*
            Using the Wave Start sound
            here intentionally.
        */

        playSound(
            "waveStart"
        );


        startNextWave();

    }
}



/* =========================================================
   START NEXT WAVE
========================================================= */

function startNextWave() {

    if (
        waveTimeout ||
        gameOver ||
        !gameActive
    ) {

        return;
    }


    /*
        WAVE 10 IS THE FINAL WAVE
    */

    if (
        currentWave >= 10
    ) {

        winGame();

        return;
    }


    waveTimeout =
        setTimeout(
            function () {

                waveTimeout =
                    null;


                if (
                    !gameActive ||
                    gameOver
                ) {

                    return;
                }


                currentWave++;


                startWave();

            },
            2500
        );
}



/* =========================================================
   SCORE CALCULATION
========================================================= */

function calculateScore() {

    const totalSeconds =
        totalGameTime / 1000;


    const speedScore =
        Math.max(
            0,
            10000 -
            Math.floor(
                totalSeconds * 10
            )
        );


    const unitPenalty =
        totalUnitsPlaced * 50;


    const lifePenalty =
        livesLost * 250;


    const researchPointBonus =
        researchPoints * 10;


    const score =
        Math.max(
            0,
            speedScore -
            unitPenalty -
            lifePenalty +
            researchPointBonus
        );


    return score;
}



/* =========================================================
   END GAME
========================================================= */

function endGame(
    victory
) {

    if (
        gameOver
    ) {

        return;
    }


    gameOver = true;

    gameActive = false;


    /* =========================
       CLEAR PLACEMENT
    ========================= */

    cancelUnitPlacement();


    if (
        selected999
    ) {

        selected999.classList.remove(
            "selected"
        );

        selected999 = null;
    }


    if (
        selected999Waypoint
    ) {

        selected999Waypoint.remove();

        selected999Waypoint = null;
    }


    /* =========================
       STOP START DELAY
    ========================= */

    if (
        gameStartTimeout
    ) {

        clearTimeout(
            gameStartTimeout
        );


        gameStartTimeout =
            null;
    }


    totalGameTime =
        performance.now() -
        gameStartTime;


    finalScore =
        calculateScore();


    /* =========================
       UPDATE HIGH SCORE
    ========================= */

    if (
        finalScore >
        highScore
    ) {

        highScore =
            finalScore;


        localStorage.setItem(
            "xkCalamityHighScore",
            highScore
        );

    }


    /* =========================
       STOP WAVE TIMERS
    ========================= */

    if (
        waveTimeout
    ) {

        clearTimeout(
            waveTimeout
        );


        waveTimeout =
            null;
    }


    if (
        waveSpawnTimeout
    ) {

        clearTimeout(
            waveSpawnTimeout
        );


        waveSpawnTimeout =
            null;
    }


    /* =========================
       STOP GUNMEN
    ========================= */

    gunmanSet.forEach(
        function (gunman) {

            if (
                gunman.fireInterval
            ) {

                clearInterval(
                    gunman.fireInterval
                );

            }

        }
    );


    /* =========================
       STOP 999 MOVEMENT
    ========================= */

    heroSet.forEach(
        function (hero) {

            if (
                hero.moveAnimation
            ) {

                cancelAnimationFrame(
                    hero.moveAnimation
                );

                hero.moveAnimation =
                    null;
            }

        }
    );


    /* =========================
       VICTORY
    ========================= */

    if (
        victory
    ) {

        scoreValue.textContent =
            finalScore;


        highScoreValue.textContent =
            highScore;


        finalTime.textContent =
            Math.floor(
                totalGameTime /
                1000
            );


        finalUnits.textContent =
            totalUnitsPlaced;


        finalLives.textContent =
            livesLost;


        gameScreen.style.display =
            "none";


        victoryScreen.style.display =
            "flex";


        playSound(
            "victory"
        );

    }


    /* =========================
       GAME OVER
    ========================= */

    else {

        deathScoreValue.textContent =
            finalScore;


        deathHighScoreValue.textContent =
            highScore;


        gameScreen.style.display =
            "none";


        deathScreen.style.display =
            "flex";


        playSound(
            "gameOver"
        );

    }
}



/* =========================================================
   WIN GAME
========================================================= */

function winGame() {

    endGame(
        true
    );
}



/* =========================================================
   VALID UNIT POSITION
========================================================= */

function isValidUnitPosition(
    x,
    y
) {

    /* =========================
       BATTLEFIELD BOUNDS
    ========================= */

    if (
        x < battlefieldMargin ||
        x > window.innerWidth -
            battlefieldMargin ||
        y < battlefieldMargin ||
        y > window.innerHeight -
            battlefieldMargin
    ) {

        return false;
    }


    /* =========================
       CORE DISTANCE
    ========================= */

    const coreX =
        window.innerWidth / 2;

    const coreY =
        window.innerHeight / 2;


    const coreDistance =
        Math.hypot(
            x - coreX,
            y - coreY
        );


    if (
        coreDistance <
        minUnitCoreDistance
    ) {

        return false;
    }


    /* =========================
       GUNMEN
    ========================= */

    let valid = true;


    gunmanSet.forEach(
        function (gunman) {

            if (
                !gunman.isConnected
            ) {

                return;
            }


            const gunmanX =
                parseFloat(
                    gunman.style.left
                );


            const gunmanY =
                parseFloat(
                    gunman.style.top
                );


            const distance =
                Math.hypot(
                    x - gunmanX,
                    y - gunmanY
                );


            if (
                distance <
                minUnitDistance
            ) {

                valid = false;

            }

        }
    );


    /* =========================
       SCP-999
    ========================= */

    heroSet.forEach(
        function (hero) {

            if (
                !hero.isConnected
            ) {

                return;
            }


            const heroX =
                hero.x !== undefined
                    ? hero.x
                    : parseFloat(
                        hero.style.left
                    );


            const heroY =
                hero.y !== undefined
                    ? hero.y
                    : parseFloat(
                        hero.style.top
                    );


            const distance =
                Math.hypot(
                    x - heroX,
                    y - heroY
                );


            if (
                distance <
                minUnitDistance
            ) {

                valid = false;

            }

        }
    );


    return valid;
}



/* =========================================================
   UNIT SELECTION
========================================================= */


/* =========================
   CANCEL UNIT PLACEMENT
========================= */

function cancelUnitPlacement() {

    placingGunman = false;

    placing999 = false;


    deployGunmanButton.classList.remove(
        "selected"
    );


    deploy999Button.classList.remove(
        "selected"
    );


    removePlacementPreview();
}



/* =========================
   GUNMAN SELECTION
========================= */

function selectGunman() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {

        return;
    }


    /* =========================
       TOGGLE OFF
    ========================= */

    if (
        placingGunman
    ) {

        cancelUnitPlacement();

        playSound(
            "select"
        );

        return;
    }


    /* =========================
       CHECK RP
    ========================= */

    if (
        researchPoints < 5
    ) {

        playSound(
            "invalid"
        );

        return;
    }


    /* =========================
       CANCEL 999 PLACEMENT
    ========================= */

    placing999 = false;


    deploy999Button.classList.remove(
        "selected"
    );


    /* =========================
       CANCEL 999 MOVEMENT
    ========================= */

    if (
        selected999
    ) {

        selected999.classList.remove(
            "selected"
        );

        selected999 = null;
    }


    if (
        selected999Waypoint
    ) {

        selected999Waypoint.remove();

        selected999Waypoint = null;
    }


    /* =========================
       SELECT GUNMAN
    ========================= */

    placingGunman = true;


    deployGunmanButton.classList.add(
        "selected"
    );


    createPlacementPreview(
        "gunman"
    );


    playSound(
        "select"
    );
}



/* =========================
   SCP-999 SELECTION
========================= */

function select999() {

    if (
        !gameActive ||
        gameOver ||
        gamePaused
    ) {

        return;
    }


    /* =========================
       TOGGLE OFF
    ========================= */

    if (
        placing999
    ) {

        cancelUnitPlacement();

        playSound(
            "select"
        );

        return;
    }


    /* =========================
       CHECK RP
    ========================= */

    if (
        researchPoints < 50
    ) {

        playSound(
            "invalid"
        );

        return;
    }


    /* =========================
       CANCEL GUNMAN PLACEMENT
    ========================= */

    placingGunman = false;


    deployGunmanButton.classList.remove(
        "selected"
    );


    /* =========================
       CANCEL 999 MOVEMENT
    ========================= */

    if (
        selected999
    ) {

        selected999.classList.remove(
            "selected"
        );

        selected999 = null;
    }


    if (
        selected999Waypoint
    ) {

        selected999Waypoint.remove();

        selected999Waypoint = null;
    }


    /* =========================
       SELECT 999
    ========================= */

    placing999 = true;


    deploy999Button.classList.add(
        "selected"
    );


    createPlacementPreview(
        "999"
    );


    playSound(
        "select"
    );
}



/* =========================================================
   DEPLOY BUTTONS
========================================================= */

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
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /* =========================
           IGNORE TYPING
        ========================= */

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {

            return;
        }


        /* =========================
           IGNORE KEY REPEAT
        ========================= */

        if (
            event.repeat
        ) {

            return;
        }


        /* =========================
           GUNMAN
        ========================= */

        if (
            event.key === "1"
        ) {

            event.preventDefault();

            selectGunman();

            return;
        }


        /* =========================
           SCP-999
        ========================= */

        if (
            event.key === "2"
        ) {

            event.preventDefault();

            select999();

            return;
        }

    }
);



/* =========================================================
   PLACEMENT PREVIEW SYSTEM
========================================================= */

function createPlacementPreview(
    type
) {

    removePlacementPreview();


    /* =========================
       PREVIEW UNIT
    ========================= */

    placementPreview =
        document.createElement(
            "div"
        );


    placementPreview.className =
        "unit-placement-preview";


    if (
        type === "gunman"
    ) {

        placementPreview.classList.add(
            "gunman-placement-preview"
        );

    }


    if (
        type === "999"
    ) {

        placementPreview.classList.add(
            "scp999-placement-preview"
        );

    }


    placementPreview.style.pointerEvents =
        "none";


    portalContainer.appendChild(
        placementPreview
    );


    /* =========================
       PREVIEW BOUNDARY
    ========================= */

    placementBoundary =
        document.createElement(
            "div"
        );


    placementBoundary.className =
        "unit-placement-boundary";


    placementBoundary.style.pointerEvents =
        "none";


    portalContainer.appendChild(
        placementBoundary
    );


    /* =========================
       EXISTING GUNMEN
    ========================= */

    gunmanSet.forEach(
        function (gunman) {

            createExistingUnitBoundary(
                gunman
            );

        }
    );


    /* =========================
       EXISTING SCP-999
    ========================= */

    heroSet.forEach(
        function (hero) {

            createExistingUnitBoundary(
                hero
            );

        }
    );


    /* =========================
       CORE BOUNDARY
    ========================= */

    if (
        core
    ) {

        const coreRect =
            core.getBoundingClientRect();


        const gameRect =
            gameScreen.getBoundingClientRect();


        placementCoreBoundary =
            document.createElement(
                "div"
            );


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


    /* =========================
       INITIAL POSITION
    ========================= */

    updatePlacementPreview(
        window.innerWidth / 2,
        window.innerHeight / 2
    );
}



/* =========================================================
   EXISTING UNIT BOUNDARY
========================================================= */

function createExistingUnitBoundary(
    unit
) {

    if (
        !unit ||
        !unit.isConnected
    ) {

        return;
    }


    const boundary =
        document.createElement(
            "div"
        );


    boundary.className =
        "unit-placement-existing-boundary";


    boundary.style.pointerEvents =
        "none";


    let x;

    let y;


    /* =========================
       SCP-999 POSITION
    ========================= */

    if (
        unit.classList.contains(
            "scp-999"
        )
    ) {

        x =
            unit.x;

        y =
            unit.y;

    }


    /* =========================
       GUNMAN POSITION
    ========================= */

    else {

        x =
            parseFloat(
                unit.style.left
            );


        y =
            parseFloat(
                unit.style.top
            );

    }


    boundary.style.left =
        `${x}px`;


    boundary.style.top =
        `${y}px`;


    portalContainer.appendChild(
        boundary
    );


    placementExistingBoundaries.push(
        boundary
    );
}



/* =========================================================
   UPDATE PLACEMENT PREVIEW
========================================================= */

function updatePlacementPreview(
    x,
    y
) {

    if (
        !placementPreview
    ) {

        return;
    }


    /* =========================
       MOVE PREVIEW
    ========================= */

    placementPreview.style.left =
        `${x}px`;


    placementPreview.style.top =
        `${y}px`;


    /* =========================
       MOVE PREVIEW BOUNDARY
    ========================= */

    if (
        placementBoundary
    ) {

        placementBoundary.style.left =
            `${x}px`;


        placementBoundary.style.top =
            `${y}px`;

    }


    /* =========================
       CHECK VALIDITY
    ========================= */

    const valid =
        isValidUnitPosition(
            x,
            y
        );


    placementPreview.classList.toggle(
        "invalid",
        !valid
    );


    if (
        placementBoundary
    ) {

        placementBoundary.classList.toggle(
            "invalid",
            !valid
        );

    }
}



/* =========================================================
   REMOVE PLACEMENT PREVIEW
========================================================= */

function removePlacementPreview() {

    /* =========================
       PREVIEW
    ========================= */

    if (
        placementPreview
    ) {

        placementPreview.remove();

        placementPreview =
            null;
    }


    /* =========================
       PREVIEW BOUNDARY
    ========================= */

    if (
        placementBoundary
    ) {

        placementBoundary.remove();

        placementBoundary =
            null;
    }


    /* =========================
       EXISTING BOUNDARIES
    ========================= */

    placementExistingBoundaries.forEach(
        function (boundary) {

            boundary.remove();

        }
    );


    placementExistingBoundaries = [];


    /* =========================
       CORE BOUNDARY
    ========================= */

    if (
        placementCoreBoundary
    ) {

        placementCoreBoundary.remove();

        placementCoreBoundary =
            null;
    }
}



/* =========================================================
   PLACEMENT PREVIEW MOVEMENT
========================================================= */

gameScreen.addEventListener(
    "mousemove",
    function (event) {

        if (
            !placingGunman &&
            !placing999
        ) {

            return;
        }


        const rect =
            gameScreen.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        updatePlacementPreview(
            x,
            y
        );

    }
);



/* =========================================================
   GAME SCREEN CLICK
========================================================= */

gameScreen.addEventListener(
    "click",
    function (event) {

        /* =========================
           IGNORE BUTTONS
        ========================= */

        if (
            event.target.closest &&
            event.target.closest("button")
        ) {

            return;
        }


        const rect =
            gameScreen.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        /* =================================================
           GUNMAN PLACEMENT
        ================================================= */

        if (
            placingGunman
        ) {

            /* =========================
               INVALID POSITION
            ========================= */

            if (
                !isValidUnitPosition(
                    x,
                    y
                )
            ) {

                playSound(
                    "invalid"
                );

                return;
            }


            /* =========================
               NOT ENOUGH RP
            ========================= */

            if (
                researchPoints < 5
            ) {

                playSound(
                    "invalid"
                );

                return;
            }


            /* =========================
               PAY
            ========================= */

            researchPoints -= 5;


            researchPointsDisplay.textContent =
                researchPoints;


            totalUnitsPlaced++;


            /* =========================
               SPAWN
            ========================= */

            spawnGunman(
                x,
                y
            );


            playSound(
                "gunmanPlace"
            );


            /* =========================
               STOP PLACEMENT
            ========================= */

            cancelUnitPlacement();


            return;
        }


        /* =================================================
           SCP-999 PLACEMENT
        ================================================= */

        if (
            placing999
        ) {

            /* =========================
               INVALID POSITION
            ========================= */

            if (
                !isValidUnitPosition(
                    x,
                    y
                )
            ) {

                playSound(
                    "invalid"
                );

                return;
            }


            /* =========================
               NOT ENOUGH RP
            ========================= */

            if (
                researchPoints < 50
            ) {

                playSound(
                    "invalid"
                );

                return;
            }


            /* =========================
               PAY
            ========================= */

            researchPoints -= 50;


            researchPointsDisplay.textContent =
                researchPoints;


            /* =========================
               SPAWN
            ========================= */

            spawn999(
                x,
                y
            );


            playSound(
                "gunmanPlace"
            );


            /* =========================
               STOP PLACEMENT
            ========================= */

            cancelUnitPlacement();


            return;
        }


        /* =================================================
           SCP-999 MOVEMENT
        ================================================= */

        if (
            selected999
        ) {

            if (
                !selected999.isConnected
            ) {

                selected999 =
                    null;

                return;
            }


            create999Waypoint(
                x,
                y
            );


            move999(
                selected999,
                x,
                y
            );


            return;
        }

    }
);



/* =========================================================
   SPAWN GUNMAN
========================================================= */

function spawnGunman(
    x,
    y
) {

    const gunman =
        document.createElement(
            "div"
        );


    gunman.classList.add(
        "gunman"
    );


    gunman.style.left =
        `${x}px`;


    gunman.style.top =
        `${y}px`;


    portalContainer.appendChild(
        gunman
    );


    /* =========================
       GUNMAN STATS
    ========================= */

    gunman.health =
        50;

    gunman.maxHealth =
        50;


    const gunmanDamage =
        5;


    const gunmanFireRate =
        1000;


    const gunmanRange =
        200;


    /* =========================
       HEALTH BAR
    ========================= */

    const healthBar =
        document.createElement(
            "div"
        );


    healthBar.classList.add(
        "gunman-healthbar"
    );


    const health =
        document.createElement(
            "div"
        );


    health.classList.add(
        "gunman-health"
    );


    healthBar.appendChild(
        health
    );


    portalContainer.appendChild(
        healthBar
    );


    gunman.healthBar =
        healthBar;


    gunman.healthDisplay =
        health;


    healthBar.style.left =
        `${x}px`;


    healthBar.style.top =
        `${y - 15}px`;


    /* =========================
       GUNMAN FIRING
    ========================= */

    const fireInterval =
        setInterval(
            function () {

                if (
                    !gameActive ||
                    gameOver
                ) {

                    clearInterval(
                        fireInterval
                    );


                    return;
                }


                const rangeSquared =
                    gunmanRange *
                    gunmanRange;


                let nearestEnemy =
                    null;


                let nearestDistanceSquared =
                    rangeSquared;


                enemySet.forEach(
                    function (enemy) {

                        if (
                            !enemy.isConnected ||
                            enemy.dead
                        ) {

                            return;
                        }


                        const enemyRect =
                            enemy.getBoundingClientRect();


                        const enemyX =
                            enemyRect.left +
                            enemyRect.width / 2;


                        const enemyY =
                            enemyRect.top +
                            enemyRect.height / 2;


                        const dx =
                            enemyX - x;


                        const dy =
                            enemyY - y;


                        const distanceSquared =
                            dx * dx +
                            dy * dy;


                        if (
                            distanceSquared <=
                            nearestDistanceSquared
                        ) {

                            nearestDistanceSquared =
                                distanceSquared;


                            nearestEnemy =
                                enemy;

                        }

                    }
                );


                if (
                    !nearestEnemy
                ) {

                    return;
                }


                playSound(
                    "gunmanShot"
                );


                fireGunmanProjectile(
                    x,
                    y,
                    nearestEnemy,
                    gunmanDamage
                );


            },
            gunmanFireRate
        );


    gunman.fireInterval =
        fireInterval;


    gunmanSet.add(
        gunman
    );
}



/* =========================================================
   DAMAGE GUNMAN
========================================================= */

function damageGunman(
    gunman,
    damage
) {

    if (
        !gunman.isConnected ||
        gunman.health <= 0
    ) {

        return;
    }


    gunman.health -=
        damage;


    if (
        gunman.health < 0
    ) {

        gunman.health = 0;

    }


    gunman.healthDisplay.style.width =
        `${
            (
                gunman.health /
                gunman.maxHealth
            ) * 100
        }%`;


    if (
        gunman.health <= 0
    ) {

        if (
            gunman.fireInterval
        ) {

            clearInterval(
                gunman.fireInterval
            );

        }


        if (
            gunman.bstTimeout
        ) {

            clearTimeout(
                gunman.bstTimeout
            );

        }


        gunmanSet.delete(
            gunman
        );


        gunman.healthBar.remove();

        gunman.remove();

    }
}



/* =========================================================
   GUNMAN PROJECTILE
========================================================= */

function fireGunmanProjectile(
    startX,
    startY,
    enemy,
    damage
) {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    const projectile =
        document.createElement(
            "div"
        );


    projectile.classList.add(
        "gunman-projectile"
    );


    portalContainer.appendChild(
        projectile
    );


    let projectileX =
        startX;

    let projectileY =
        startY;


    const projectileSpeed =
        500;


    function moveProjectile() {

        if (
            !gameActive ||
            gameOver
        ) {

            projectile.remove();

            return;
        }


        if (
            !enemy.isConnected ||
            enemy.dead
        ) {

            projectile.remove();

            return;
        }


        const enemyRect =
            enemy.getBoundingClientRect();


        const enemyX =
            enemyRect.left +
            enemyRect.width / 2;


        const enemyY =
            enemyRect.top +
            enemyRect.height / 2;


        const dx =
            enemyX -
            projectileX;


        const dy =
            enemyY -
            projectileY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /* =========================
           PROJECTILE HIT
        ========================= */

        if (
            distance <=
            enemyRect.width / 2 + 5
        ) {

            damageEnemy(
                enemy,
                damage
            );


            projectile.remove();


            return;
        }


        /* =========================
           MOVE PROJECTILE
        ========================= */

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


        requestAnimationFrame(
            moveProjectile
        );

    }


    moveProjectile();
}



/* =========================================================
   SPAWN SCP-999
========================================================= */

function spawn999(
    x,
    y
) {

    const hero =
        document.createElement(
            "div"
        );


    hero.className =
        "scp-999";


    /* =========================
       POSITION
    ========================= */

    hero.x =
        x;

    hero.y =
        y;


    hero.style.left =
        `${x}px`;

    hero.style.top =
        `${y}px`;


    hero.dataset.x =
        x;

    hero.dataset.y =
        y;


    /* =========================
       BST RANGE
    ========================= */

    const buffRange =
        document.createElement(
            "div"
        );


    buffRange.className =
        "scp-999-buff-range";


    hero.appendChild(
        buffRange
    );


    /* =========================
       CLICK / SELECT
    ========================= */

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


            /*
                Clicking an existing 999
                while placing another unit
                does nothing.
            */

            if (
                placingGunman ||
                placing999
            ) {

                return;
            }


            /* =========================
               DESELECT PREVIOUS 999
            ========================= */

            if (
                selected999 &&
                selected999 !== hero
            ) {

                selected999.classList.remove(
                    "selected"
                );

            }


            /* =========================
               SELECT THIS 999
            ========================= */

            selected999 =
                hero;


            hero.classList.add(
                "selected"
            );


            playSound(
                "select"
            );

        }
    );


    /* =========================
       ADD TO BATTLEFIELD
    ========================= */

    portalContainer.appendChild(
        hero
    );


    heroSet.add(
        hero
    );


    /* =========================
       UPDATE BUFFS
    ========================= */

    update999Buffs();
}



/* =========================================================
   UPDATE SCP-999 BUFFS
========================================================= */

function update999Buffs() {

    if (
        !gameActive ||
        gameOver
    ) {

        return;
    }


    gunmanSet.forEach(
        function (gunman) {

            if (
                !gunman.isConnected
            ) {

                return;
            }


            const gunmanX =
                parseFloat(
                    gunman.style.left
                );


            const gunmanY =
                parseFloat(
                    gunman.style.top
                );


            let insideBuffRange =
                false;


            /* =========================
               CHECK EVERY SCP-999
            ========================= */

            heroSet.forEach(
                function (hero) {

                    if (
                        !hero.isConnected
                    ) {

                        return;
                    }


                    const heroX =
                        hero.x;


                    const heroY =
                        hero.y;


                    const distance =
                        Math.hypot(
                            heroX -
                            gunmanX,

                            heroY -
                            gunmanY
                        );


                    if (
                        distance <=
                        scp999BuffRange
                    ) {

                        insideBuffRange =
                            true;

                    }

                }
            );


            /* =========================
               APPLY / REMOVE BST
            ========================= */

            if (
                insideBuffRange
            ) {

                applyBST(
                    gunman
                );

            }

            else {

                startBSTGracePeriod(
                    gunman
                );

            }

        }
    );
}



/* =========================================================
   APPLY BST
========================================================= */

function applyBST(
    gunman
) {

    if (
        !gunman.isConnected
    ) {

        return;
    }


    gunman.dataset.bstActive =
        "true";


    if (
        gunman.bstTimeout
    ) {

        clearTimeout(
            gunman.bstTimeout
        );


        gunman.bstTimeout =
            null;
    }


    let bstLabel =
        gunman.querySelector(
            ".bst-label"
        );


    if (
        !bstLabel
    ) {

        bstLabel =
            document.createElement(
                "div"
            );


        bstLabel.className =
            "bst-label";


        bstLabel.textContent =
            "BST";


        gunman.appendChild(
            bstLabel
        );

    }


    bstLabel.style.opacity =
        "1";
}



/* =========================================================
   BST GRACE PERIOD
========================================================= */

function startBSTGracePeriod(
    gunman
) {

    if (
        !gunman.isConnected
    ) {

        return;
    }


    if (
        gunman.dataset.bstActive !==
        "true"
    ) {

        return;
    }


    if (
        gunman.bstTimeout
    ) {

        return;
    }


    gunman.bstTimeout =
        setTimeout(
            function () {

                gunman.dataset.bstActive =
                    "false";


                const bstLabel =
                    gunman.querySelector(
                        ".bst-label"
                    );


                if (
                    bstLabel
                ) {

                    bstLabel.remove();

                }


                gunman.bstTimeout =
                    null;

            },
            scp999BuffGracePeriod
        );
}



/* =========================================================
   MOVE SCP-999
========================================================= */

function move999(
    hero,
    targetX,
    targetY
) {

    if (
        !hero ||
        !hero.isConnected
    ) {

        return;
    }


    /* =========================
       CANCEL PREVIOUS MOVEMENT
    ========================= */

    if (
        hero.moveAnimation
    ) {

        cancelAnimationFrame(
            hero.moveAnimation
        );


        hero.moveAnimation =
            null;
    }


    /* =========================
       STORE TARGET
    ========================= */

    hero.targetX =
        targetX;


    hero.targetY =
        targetY;


    let lastTime =
        performance.now();


    function animate(
        currentTime
    ) {

        if (
            !gameActive ||
            gameOver
        ) {

            hero.moveAnimation =
                null;

            return;
        }


        const deltaTime =
            (
                currentTime -
                lastTime
            ) / 1000;


        lastTime =
            currentTime;


        const dx =
            hero.targetX -
            hero.x;


        const dy =
            hero.targetY -
            hero.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        /* =========================
           ARRIVED
        ========================= */

        if (
            distance <= 3
        ) {

            hero.x =
                hero.targetX;


            hero.y =
                hero.targetY;


            hero.style.left =
                `${hero.x}px`;


            hero.style.top =
                `${hero.y}px`;


            hero.dataset.x =
                hero.x;


            hero.dataset.y =
                hero.y;


            update999Buffs();


            hero.moveAnimation =
                null;


            if (
                selected999Waypoint
            ) {

                selected999Waypoint.remove();


                selected999Waypoint =
                    null;
            }


            return;
        }


        /* =========================
           MOVE
        ========================= */

        const movement =
            Math.min(
                scp999MoveSpeed *
                deltaTime,
                distance
            );


        hero.x +=
            (
                dx /
                distance
            ) *
            movement;


        hero.y +=
            (
                dy /
                distance
            ) *
            movement;


        hero.style.left =
            `${hero.x}px`;


        hero.style.top =
            `${hero.y}px`;


        hero.dataset.x =
            hero.x;


        hero.dataset.y =
            hero.y;


        /* =========================
           UPDATE BST
        ========================= */

        update999Buffs();


        hero.moveAnimation =
            requestAnimationFrame(
                animate
            );
    }


    hero.moveAnimation =
        requestAnimationFrame(
            animate
        );
}



/* =========================================================
   SCP-999 WAYPOINT
========================================================= */

function create999Waypoint(
    x,
    y
) {

    if (
        selected999Waypoint
    ) {

        selected999Waypoint.remove();


        selected999Waypoint =
            null;
    }


    const waypoint =
        document.createElement(
            "div"
        );


    waypoint.className =
        "scp-999-waypoint";


    waypoint.style.left =
        `${x}px`;


    waypoint.style.top =
        `${y}px`;


    portalContainer.appendChild(
        waypoint
    );


    selected999Waypoint =
        waypoint;


    return waypoint;
}



/* =========================================================
   RESTART
========================================================= */

restartButton.addEventListener(
    "click",
    function () {

        startGame();

    }
);



/* =========================================================
   MAIN MENU
========================================================= */

menuButton.addEventListener(
    "click",
    function () {

        resetGameState();


        gameScreen.style.display =
            "none";


        deathScreen.style.display =
            "none";


        victoryScreen.style.display =
            "none";


        mainMenu.style.display =
            "flex";

    }
);



/* =========================================================
   VICTORY RESTART
========================================================= */

victoryRestartButton.addEventListener(
    "click",
    function () {

        startGame();

    }
);



/* =========================================================
   VICTORY MAIN MENU
========================================================= */

victoryMenuButton.addEventListener(
    "click",
    function () {

        resetGameState();


        gameScreen.style.display =
            "none";


        deathScreen.style.display =
            "none";


        victoryScreen.style.display =
            "none";


        mainMenu.style.display =
            "flex";

    }
);



/* =========================================================
   PAUSE BUTTONS
========================================================= */

resumeButton.addEventListener(
    "click",
    function () {

        playSound(
            "button"
        );


        resumeGame();

    }
);


pauseMenuButton.addEventListener(
    "click",
    function () {

        playSound(
            "button"
        );


        gamePaused = false;

        gameActive = false;


        cancelUnitPlacement();


        if (
            selected999
        ) {

            selected999.classList.remove(
                "selected"
            );

            selected999 = null;
        }


        if (
            selected999Waypoint
        ) {

            selected999Waypoint.remove();

            selected999Waypoint = null;
        }


        pauseScreen.style.display =
            "none";


        gameScreen.style.display =
            "none";


        mainMenu.style.display =
            "flex";

    }
);



/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;
        }


        /* =========================
           CANCEL PLACEMENT FIRST
        ========================= */

        if (
            placingGunman ||
            placing999
        ) {

            cancelUnitPlacement();


            playSound(
                "select"
            );


            return;
        }


        /* =========================
           NORMAL PAUSE
        ========================= */

        if (
            !gameActive ||
            gameOver
        ) {

            return;
        }


        if (
            gamePaused
        ) {

            resumeGame();

        }

        else {

            pauseGame();

        }

    }
);

/* =========================================================
   TOUCH PLACEMENT SUPPORT
========================================================= */

/*
   Desktop placement already uses mousemove + click.
   Touch screens do not produce useful mousemove events while
   dragging a finger, so mirror the placement preview with
   touchmove. The normal click event still handles the final tap.
*/

function updatePlacementFromTouch(event) {

    if (
        !placingGunman &&
        !placing999
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


    const touch =
        event.touches[0];


    const rect =
        gameScreen.getBoundingClientRect();


    const x =
        touch.clientX -
        rect.left;


    const y =
        touch.clientY -
        rect.top;


    updatePlacementPreview(
        x,
        y
    );
}


gameScreen.addEventListener(
    "touchmove",
    updatePlacementFromTouch,
    {
        passive: false
    }
);
