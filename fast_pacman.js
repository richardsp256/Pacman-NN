var FAST_PACMAN = (function () {

    this.state = WAITING;
    this.audio = null;
    this.ghosts = [];
    this.ghostSpecs = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"];
    this.eatenCount = 0;
    this.level = 0;
    this.tick = 0;
    this.ghostPos = { x: 0, y: 0 };
    this.userPos = { x: 0, y: 0 };
    this.stateChanged = true;
    this.timerStart = null;
    this.lastTime = 0;
    this.ctx = null;
    this.timer = null;
    this.map = null;
    this.user = null;
    this.stored = null;
    this.deathCallBack = null;

    this.getTick = function() {
        return this.tick;
    };

    this.startLevel = function () {
        this.user.resetPosition();
        for (var i = 0; i < this.ghosts.length; i += 1) {
            this.ghosts[i].reset();
        }

        this.timerStart = this.tick;
        this.setState(COUNTDOWN);
    }

    this.startNewGame = function(neuralAgent, onDeath) {

        console.log("START NEW");

        this.setState(WAITING);
        this.level = 1;
        this.user.neuralAgent = neuralAgent
        this.deathCallBack = onDeath;
        this.user.reset();
        this.map.reset();
        this.startLevel();
    }
    
    this.keyDown = function(e) {
        if (e.keyCode === KEY.N) {
            this.startNewGame();
        } else if (e.keyCode === KEY.P) {
            this.stored = state;
            this.setState(PAUSE);
        } else if (state !== PAUSE) {
            return this.user.keyDown(e);
        }
        return true;
    }

    this.loseLife = function () {
        this.setState(WAITING);
        this.user.loseLife();
        if (this.user.getLives() > 0) {
            this.startLevel();
        }
    }

    this.setState = function(nState) {
        this.state = nState;
        this.stateChanged = true;
    };

    this.collided = function(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) +
                          Math.pow(ghost.y - user.y, 2))) < 10;
    };

    this.update = function()
    {
        console.log("UPDATE:" + this.tick);
        this.dt = .01;
        this.mainLoop(this.dt);
    }

    this.mainDraw = function(dt) {

        var diff, u, i, len, nScore;

        ghostPos = [];

        for (i = 0, len = this.ghosts.length; i < len; i += 1) {
            ghostPos.push(this.ghosts[i].move(this.ctx));
        }
        
        u = this.user.move(this.ctx, this.dt);

        this.userPos = u["new"];

        for (i = 0, len = this.ghosts.length; i < len; i += 1) {
            if (this.collided(this.userPos, ghostPos[i]["new"])) {
                if (this.ghosts[i].isVunerable()) {
                    this.ghosts[i].eat();
                    this.eatenCount += 1;
                    this.nScore = this.eatenCount * 50;
                    this.user.addScore(nScore);
                    this.setState(EATEN_PAUSE);
                    this.timerStart = tick;
                } else if (this.ghosts[i].isDangerous()) {
                    this.setState(DYING);
                    this.timerStart = tick;
                }
            }
        }
    };

    this.mainLoop = function() {

        var diff;

        if (this.state !== PAUSE) {
            this.tick++;
        }

        if (this.state === PLAYING) {
            this.mainDraw();
        } else if (this.state === WAITING && this.stateChanged) {
            this.stateChanged = false;
        } else if (this.state === EATEN_PAUSE) {
            this.setState(PLAYING);
        } else if (this.state === DYING) {

            this.deathCallBack(user.sc);
            //loseLife();

        } else if (this.state === COUNTDOWN) {
            this.setState(PLAYING);
        }
    }

    this.eatenPill = function() {
        this.timerStart = this.tick;
        this.eatenCount = 0;
        for (i = 0; i < this.ghosts.length; i += 1) {
            this.ghosts[i].makeEatable(this.ctx);
        }
    };

    this.completedLevel = function() {
        this.setState(WAITING);
        this.level += 1;
        this.map.reset();
        this.user.newLevel();
        this.startLevel();
    };

    this.keyPress = function(e) {
        if (this.state !== WAITING && state !== PAUSE) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    this.init = function(wrapper, root) {
        console.log("INIT");
        var i, len, ghost,
            blockSize = wrapper.offsetWidth / 19,
            canvas = document.createElement("canvas");

        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 30 + "px");

        wrapper.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        this.map = new Pacman.Map(blockSize);

        this.user = new Pacman.User({
            "completedLevel": this.completedLevel,
            "eatenPill": this.eatenPill
        }, this.map);

        for (i = 0, len = this.ghostSpecs.length; i < len; i += 1) {
            var ghost = new Pacman.Ghost({ "getTick": this.getTick }, this.map, this.ghostSpecs[i]);
            this.ghosts.push(ghost);
        }
    };
});