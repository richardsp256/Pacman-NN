var FAST_PACMAN = (function () {

    var state = WAITING,
        audio = null,
        ghosts = [],
        ghostSpecs = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"],
        eatenCount = 0,
        level = 0,
        tick = 0,
        ghostPos, userPos,
        stateChanged = true,
        timerStart = null,
        lastTime = 0,
        ctx = null,
        timer = null,
        map = null,
        user = null,
        stored = null,
        deathCallBack = null;

    function getTick() {
        return tick;
    };

    function startLevel() {
        user.resetPosition();
        for (var i = 0; i < ghosts.length; i += 1) {
            ghosts[i].reset();
        }

        timerStart = tick;
        setState(COUNTDOWN);
    }

    function startNewGame(neuralAgent, onDeath) {

        console.log("START NEW");

        setState(WAITING);
        level = 1;
        user.neuralAgent = neuralAgent
        deathCallBack = onDeath;
        user.reset();
        map.reset();
        startLevel();
    }
    
    function keyDown(e) {
        if (e.keyCode === KEY.N) {
            startNewGame();
        } else if (e.keyCode === KEY.P) {
            stored = state;
            setState(PAUSE);
        } else if (state !== PAUSE) {
            return user.keyDown(e);
        }
        return true;
    }

    function loseLife() {
        setState(WAITING);
        user.loseLife();
        if (user.getLives() > 0) {
            startLevel();
        }
    }

    function setState(nState) {
        state = nState;
        stateChanged = true;
    };

    function collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) +
                          Math.pow(ghost.y - user.y, 2))) < 10;
    };

    function update() {
        console.log("UPDATE:" + tick);
        dt = .01;
        mainLoop(dt);
    };

    function mainDraw(dt) {

        var diff, u, i, len, nScore;

        ghostPos = [];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghostPos.push(ghosts[i].move(ctx));
        }
        
        u = user.move(ctx, dt);

        userPos = u["new"];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            if (collided(userPos, ghostPos[i]["new"])) {
                if (ghosts[i].isVunerable()) {
                    ghosts[i].eat();
                    eatenCount += 1;
                    nScore = eatenCount * 50;
                    user.addScore(nScore);
                    setState(EATEN_PAUSE);
                    timerStart = tick;
                } else if (ghosts[i].isDangerous()) {
                    setState(DYING);
                    timerStart = tick;
                }
            }
        }
    };

    function mainLoop() {

        var diff;

        if (state !== PAUSE) {
            ++tick;
        }

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING && stateChanged) {
            stateChanged = false;
        } else if (state === EATEN_PAUSE) {
            setState(PLAYING);
        } else if (state === DYING) {

            deathCallBack(user.sc);
            //loseLife();

        } else if (state === COUNTDOWN) {
            setState(PLAYING);
        }
    }

    function eatenPill() {
        timerStart = tick;
        eatenCount = 0;
        for (i = 0; i < ghosts.length; i += 1) {
            ghosts[i].makeEatable(ctx);
        }
    };

    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.reset();
        user.newLevel();
        startLevel();
    };

    function keyPress(e) {
        if (state !== WAITING && state !== PAUSE) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    function init(wrapper, root) {
        console.log("INIT");
        var i, len, ghost,
            blockSize = wrapper.offsetWidth / 19,
            canvas = document.createElement("canvas");

        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 30 + "px");

        wrapper.appendChild(canvas);

        ctx = canvas.getContext('2d');

        map = new Pacman.Map(blockSize);

        user = new Pacman.User({
            "completedLevel": completedLevel,
            "eatenPill": eatenPill
        }, map);

        for (i = 0, len = ghostSpecs.length; i < len; i += 1) {
            ghost = new Pacman.Ghost({ "getTick": getTick }, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }
    };
});