/*jslint browser: true, undef: true, eqeqeq: true, nomen: true, white: true */
/*global window: false, document: false */

/*
 * fix looped audio
 * add fruits + levels
 * fix what happens when a ghost is eaten (should go back to base)
 * do proper ghost mechanics (blinky/wimpy etc)
 */

var God = {};
God.Simulation = function (el, root) {
	this.element = el;
	this.resources = root;
	
	this.pacmen_agents = null;
	this.pacmen_chromos = null;


	this.cur_completed = 0;
	this.pacman_game = null;
	this.geneticAlgo = null;
	this.currentGeneration = null;

	this.average_fitness =0;
	this.best_fitness = 0;
	this.best_fitness_ever = 0;
	this.best = null;
	
	this.curIsAlive = null;
	this.inited = false;
	this.playing = false;
	this.stopped = false;
	this.agentIndex = 0;

	this.visuals = Params.SHOW_GAME;
	this.timer = null;

	this.loadBest = false;

	
	this.init = function(){
		this.average_fitness = 0;
		this.best_fitness = 0;
		this.agentIndex = 0;
		this.pacmen_agents = [];

		for(var i = 0; i < Params.POPULATION; i++){
			this.pacmen_agents.push( new Neural.Agent() );
		}

		var numWeights = this.pacmen_agents[0].getWeightsCount();

		if(!this.loadBest){
		
			this.geneticAlgo = new Genomics.Algorithm(Params.POPULATION, Params.MUTATION_RATE, Params.CROSS_RATE, numWeights, Params.PERTURBATION_RATE, Params.ELITE_COUNT, Params.ELITE_NUMBER);
			this.pacmen_chromos = this.geneticAlgo.getPopulation();

			for (var i=0; i<Params.POPULATION; i++)
				this.pacmen_agents[i].neuralNetwork.setWeights(this.pacmen_chromos[i].weights);
			
		} else {
			this.geneticAlgo = new Genomics.Algorithm(Params.POPULATION, Params.MUTATION_RATE, Params.CROSS_RATE, numWeights, Params.PERTURBATION_RATE, Params.ELITE_COUNT, Params.ELITE_NUMBER);
			this.pacmen_chromos = this.geneticAlgo.getPopulation();
			var j = 0;
			for(j = 0; j < Params.ELITE_NUMBER; j++)
				pacman_chromos[j] = this.best;
			for (var i=j; i<Params.POPULATION; i++)
				this.pacmen_agents[i].neuralNetwork.setWeights(this.pacmen_chromos[i].weights);
		}

		this.cur_completed = 0;

		this.pacman_game = new FAST_PACMAN();

		this.pacman_game.init(this.element, this.resources);

	}

	this.runOnce = function () {

	    this.curIsAlive = true;
	    this.pacman_game.startNewGame(this.pacmen_agents[this.cur_completed], this);
	}
	
	this.runGeneration = function(){

		for(var i = 0; i < Params.POPULATION; i++){

			this.curIsAlive = true;
			this.pacman_game.startNewGame(this.pacmen_agents[i], this);	
			while(this.curIsAlive)
				this.pacman_game.update();
		}
	}
	
	this.subSimCompleted = function(fitness){
	    this.curIsAlive = false;
		
		//console.log("Pacman #: " + this.cur_completed + " died with score: " + fitness);

        this.pacmen_agents[this.cur_completed].fitness = fitness;
        this.pacmen_chromos[this.cur_completed].fitness = fitness;

		this.cur_completed++;
		if(this.cur_completed == Params.POPULATION){
			this.cur_completed = 0;
			this.finishGeneration();
		}

		if (this.visuals && this.playing) {
		    this.curIsAlive = true;
		    this.pacman_game.startNewGame(this.pacmen_agents[this.cur_completed], this);
		}
	}
	
	this.finishGeneration = function(){	
		
		//increment the generation counter
		this.currentGeneration++;
		
		//run the GA to create a new population
		this.pacmen_chromos = this.geneticAlgo.epoch(this.pacmen_chromos);		

		this.average_fitness = this.geneticAlgo.getAverageFitness();
		this.best_fitness = this.geneticAlgo.getBestFitness();
		this.best_fitness_ever = Math.max(this.best_fitness_ever, this.best_fitness);


		//this.geneticAlgo.getBest(1,1,this.best);

		
		var temp = []
		this.geneticAlgo.getBest(1,1,temp);
		
		temp = temp[0];
		if(this.best == null)
			this.best = temp;
		else if(this.best.fitness < temp.fitness)
				this.best = temp;

	    //and reset their positions etc
		//insert the new (hopefully)improved brains back into the pacmen
		for (var i=0; i<Params.POPULATION; ++i) {
			this.pacmen_agents[i].setWeights(this.pacmen_chromos[i].weights);
			this.pacmen_agents[i].reset();
		}


		if(this.currentGeneration % 100 == 0)
		{
		    console.log("\n-------------------------------------");
		    console.log("Generation: " + this.currentGeneration + " - Best score: " + this.best_fitness);
		    console.log("Stats: Avg:" + this.average_fitness + " - Best Ever: " + this.best_fitness_ever);
		    this.stop();
		}
		else
		{
		    if (this.currentGeneration % 1 == 0)
		    {
		        console.log("\n-------------------------------------");
		        console.log("Generation: " + this.currentGeneration + " - Best score: " + this.best_fitness);
		        console.log("Stats: Avg:" + this.average_fitness + " - Best Ever: " + this.best_fitness_ever);

		        var millisecondsToWait = 10;
		        this.stop();
		        setTimeout(function () {
		            this.start();
		        }, millisecondsToWait);
		    }
		}
	}
	
	this.mainLoop = function(){
		while(this.playing)
			this.runGeneration();
	}

	this.toggleVisual = function () {
	    this.stop();
	    this.visuals = !this.visuals;
	    this.start();

	
	this.dataToJSONTab = function(){
		var json = JSON.stringify(this.best.weights);
		var outputWindow = window.open("","_blank");
		openWindow.document.write(data);
	}
	
	this.JSONtoData = function(text){
		var struct = JSON.parse(text);
		this.loadBest = true;
		this.best = new Genomics.Genome(struct, 0);

	}

	this.start = function () {
	    if (this.inited == false) {
	        this.inited = true;
	        this.init();
	    }

	    this.playing = true;
	    this.stopped = false;

	    if (!this.visuals) {
	        this.mainLoop();
	    }
	    else
	    {
	        this.runOnce();

	        var boundUpdate = this.pacman_game.update.bind(this.pacman_game);
	        this.timer = window.setInterval(boundUpdate, 1000 / 120);
	    }
	}

	this.stop = function()
	{
	    this.playing = false;
	    this.stopped = true;
	    if (this.timer != null)
	        window.clearInterval(this.timer);
	}

	return this;
}

var NONE = 4,
    UP = 3,
    LEFT = 2,
    DOWN = 1,
    RIGHT = 0,
    WAITING = 5,
    PAUSE = 6,
    PLAYING = 7,
    COUNTDOWN = 8,
    EATEN_PAUSE = 9,
    DYING = 10,
    PAC_SPEED = 2,
    GHOST_SPEED = 2,
    GHOST_SPEED_SCARED = 1,
    GHOST_SPEED_HIDDEN = 4,
    Pacman = {};

Pacman.FPS = 30;

Pacman.Ghost = function (game, map, colour) {

    this.position = null;
    this.direction = null;
    this.eatable = null;
    this.eaten = null;
    this.due = null;
    this.game = game;
    this.map = map;
    this.colour = colour;
    
    //TODO Make sure this receives dt
    this.getNewCoord = function (dir, current, dt) {
        
        var speed  = (this.isVunerable() ? GHOST_SPEED_SCARED : this.isHidden() ? GHOST_SPEED_HIDDEN : GHOST_SPEED), // * dt,
            xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
            ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);
    
        return {
            "x": this.addBounded(current.x, xSpeed),
            "y": this.addBounded(current.y, ySpeed)
        };
    };

    /* Collision detection(walls) is done when a ghost lands on an
     * exact block, make sure they dont skip over it 
     */
    this.addBounded = function (x1, x2) { 
        var rem    = x1 % 10, 
            result = rem + x2;
        if (rem !== 0 && result > 10) {
            return x1 + (10 - rem);
        } else if(rem > 0 && result < 0) { 
            return x1 - rem;
        }
        return x1 + x2;
    };
    
    this.isVunerable = function () { 
        return this.eatable !== null;
    };
    
    this.isDangerous = function () {
        return this.eaten === null;
    };

    this.isHidden = function () { 
        return this.eatable === null && this.eaten !== null;
    };
    
    this.getRandomDirection = function () {
        var moves = (this.direction === LEFT || this.direction === RIGHT) 
            ? [UP, DOWN] : [LEFT, RIGHT];
        return moves[Math.floor(Math.random() * 2)];
    };
    
    this.reset = function() {
        this.eaten = null;
        this.eatable = null;
        this.position = {"x": 90, "y": 80};
        this.direction = this.getRandomDirection();
        this.due = this.getRandomDirection();
    };
    
    this.onWholeSquare = function(x) {
        return x % 10 === 0;
    };
    
    this.oppositeDirection = function(dir) { 
        return dir === LEFT && RIGHT ||
            dir === RIGHT && LEFT ||
            dir === UP && DOWN || UP;
    };

    this.makeEatable = function() {
        this.direction = this.oppositeDirection(this.direction);
        this.eatable = this.game.getTick();
    };

    this.eat = function() { 
        this.eatable = null;
        this.eaten = this.game.getTick();
    };

    this.pointToCoord = function(x) {
        return Math.round(x / 10);
    };

    this.nextSquare = function(x, dir) {
        var rem = x % 10;
        if (rem === 0) { 
            return x; 
        } else if (dir === RIGHT || dir === DOWN) { 
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    this.onGridSquare = function(pos) {
        return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
    };

    this.secondsAgo = function(tick) { 
        return (this.game.getTick() - tick) / Pacman.FPS;
    };

    this.getColour = function() { 
        if (this.eatable) { 
            if (this.secondsAgo(this.eatable) > 5) { 
                return this.game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
            } else { 
                return "#0000BB";
            }
        } else if(this.eaten) { 
            return "#222";
        } 
        return this.colour;
    };

    this.draw = function(ctx) {
  
        var s    = this.map.blockSize, 
            top  = (this.position.y/10) * s,
            left = (this.position.x/10) * s;
    
        if (this.eatable && this.secondsAgo(this.eatable) > 8) {
            this.eatable = null;
        }
        
        if (this.eaten && this.secondsAgo(this.eaten) > 3) { 
            this.eaten = null;
        }
        
        var tl = left + s;
        var base = top + s - 3;
        var inc = s / 10;

        var high = this.game.getTick() % 10 > 5 ? 3  : -3;
        var low  = this.game.getTick() % 10 > 5 ? -3 : 3;

        ctx.fillStyle = this.getColour();
        ctx.beginPath();

        ctx.moveTo(left, base);

        ctx.quadraticCurveTo(left, top, left + (s/2),  top);
        ctx.quadraticCurveTo(left + s, top, left+s,  base);
        
        // Wavy things at the bottom
        ctx.quadraticCurveTo(tl-(inc*1), base+high, tl - (inc * 2),  base);
        ctx.quadraticCurveTo(tl-(inc*3), base+low, tl - (inc * 4),  base);
        ctx.quadraticCurveTo(tl-(inc*5), base+high, tl - (inc * 6),  base);
        ctx.quadraticCurveTo(tl-(inc*7), base+low, tl - (inc * 8),  base); 
        ctx.quadraticCurveTo(tl-(inc*9), base+high, tl - (inc * 10), base); 

        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#FFF";
        ctx.arc(left + 6,top + 6, s / 6, 0, 300, false);
        ctx.arc((left + s) - 6,top + 6, s / 6, 0, 300, false);
        ctx.closePath();
        ctx.fill();

        var f = s / 12;
        var off = {};
        off[RIGHT] = [f, 0];
        off[LEFT]  = [-f, 0];
        off[UP]    = [0, -f];
        off[DOWN]  = [0, f];

        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(left+6+off[this.direction][0], top+6+off[this.direction][1], 
                s / 15, 0, 300, false);
        ctx.arc((left+s)-6+off[this.direction][0], top+6+off[this.direction][1], 
                s / 15, 0, 300, false);
        ctx.closePath();
        ctx.fill();

    };

    this.pane = function(pos) {

        if (pos.y === 100 && pos.x >= 190 && this.direction === RIGHT) {
            return {"y": 100, "x": -10};
        }
        
        if (pos.y === 100 && pos.x <= -10 && this.direction === LEFT) {
            return this.position = {"y": 100, "x": 190};
        }

        return false;
    };
    
    //MOVEMENT FUNCTION TODO SEND dt
    this.move = function(ctx, dt) {
        
        var oldPos = this.position,
            onGrid = this.onGridSquare(this.position),
            npos   = null;
        
        if (this.due !== this.direction) {
            
            npos = this.getNewCoord(this.due, this.position, dt );
            
            if (onGrid &&
                this.map.isFloorSpace({
                    "y":this.pointToCoord(this.nextSquare(npos.y, this.due)),
                    "x":this.pointToCoord(this.nextSquare(npos.x, this.due))})) {
                this.direction = this.due;
            } else {
                npos = null;
            }
        }
        
        if (npos === null) {
            npos = this.getNewCoord(this.direction, this.position, dt);
        }
        
        if (onGrid &&
            this.map.isWallSpace({
                "y" : this.pointToCoord(this.nextSquare(npos.y, this.direction)),
                "x" : this.pointToCoord(this.nextSquare(npos.x, this.direction))
            })) {
            
            this.due = this.getRandomDirection();            
            return this.move(ctx);
        }

        this.position = npos;        
        
        var tmp = this.pane(this.position);
        if (tmp) { 
            this.position = tmp;
        }
        
        this.due = this.getRandomDirection();
        
        return {
            "new" : this.position,
            "old" : oldPos
        };
    };
    
    /*return {
        "eat"         : eat,
        "isVunerable" : isVunerable,
        "isDangerous" : isDangerous,
        "makeEatable" : makeEatable,
        "reset"       : reset,
        "move"        : move,
        "draw"        : draw
    };*/
};

Pacman.User = function (pacgame, pacmap) {
    
    this.position = { "x": 90, "y": 120 };
    this.direction = null;
    this.eaten = null;
    this.due = null;
    this.lives = null;
    this.score = 5;
    this.keyMap = {};
    this.neuralAgent = {};
    this.game = pacgame;
    this.map = pacmap;

    this.keyMap[KEY.ARROW_LEFT]  = LEFT;
    this.keyMap[KEY.ARROW_UP]    = UP;
    this.keyMap[KEY.ARROW_RIGHT] = RIGHT;
    this.keyMap[KEY.ARROW_DOWN]  = DOWN;

    this.addScore = function (nScore) {
        this.score += nScore;
        if (this.score >= 10000 && this.score - nScore < 10000) {
            lives += 1;
        }
    };

    this.theScore = function () {
        return this.score;
    };

    this.loseLife = function() { 
        this.lives -= 1;
    };

    this.getLives = function() {
        return this.lives;
    };

    this.initUser = function () {
        this.score = 0;
        this.lives = 3;
        this.newLevel();
    };
    
    this.newLevel = function() {
        this.resetPosition();
        this.eaten = 0;
    };
    
    this.resetPosition = function() {
        this.position = {"x": 90, "y": 120};
        this.direction = LEFT;
        this.due = LEFT;
    };
    
     this.reset = function(){
        this.initUser();
        this.resetPosition();
    };        
    
    this.keyDown = function(e) {
        if (typeof keyMap[e.keyCode] !== "undefined") { 
            this.due = keyMap[e.keyCode];
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
	};

    this.getNewCoord = function(dir, current, dt) {   
        return {
            "x": current.x + (dir === LEFT && -PAC_SPEED || dir === RIGHT && PAC_SPEED || 0),// * dt ,
            "y": current.y + (dir === DOWN && PAC_SPEED || dir === UP    && -PAC_SPEED || 0)// * dt
        };
    };

    this.onWholeSquare = function(x) {
        return x % 10 === 0;
    };

    this.pointToCoord = function(x) {
        return Math.round(x/10);
    };
    
    this.nextSquare = function(x, dir) {
        var rem = x % 10;
        if (rem === 0) { 
            return x; 
        } else if (dir === RIGHT || dir === DOWN) { 
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    this.next = function(pos, dir) {
        return {
            "y" : this.pointToCoord(this.nextSquare(pos.y, dir)),
            "x" : this.pointToCoord(this.nextSquare(pos.x, dir)),
        };                               
    };

    this.onGridSquare = function (pos) {
        return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
    };

    this.isOnSamePlane = function (due, dir) {
        return ((due === LEFT || due === RIGHT) && 
                (dir === LEFT || dir === RIGHT)) || 
            ((due === UP || due === DOWN) && 
             (dir === UP || dir === DOWN));
    };

    this.move = function (game, ctx, dt) {
        
        var npos        = null, 
            nextWhole   = null, 
            oldPosition = this.position,
            block       = null;
			
		this.due = this.neuralAgent.update(game.getState());
        
        if (this.due !== this.direction) {
            npos = this.getNewCoord(this.due, this.position, dt);
            
            if (this.isOnSamePlane(this.due, this.direction) || 
                (this.onGridSquare(this.position) && 
                 this.map.isFloorSpace(this.next(npos, this.due)))) {
                this.direction = this.due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = this.getNewCoord(this.direction, this.position, dt);
        }
        
        if (this.onGridSquare(this.position) && this.map.isWallSpace(this.next(npos, this.direction))) {
            this.direction = NONE;
        }

        if (this.direction === NONE) {
            return {"new" : this.position, "old" : this.position};
        }
        
        if (npos.y === 100 && npos.x >= 190 && this.direction === RIGHT) {
            npos = {"y": 100, "x": -10};
        }
        
        if (npos.y === 100 && npos.x <= -12 && this.direction === LEFT) {
            npos = {"y": 100, "x": 190};
        }
        
        this.position = npos;        
        nextWhole = this.next(this.position, this.direction);
        
        block = this.map.block(nextWhole);        
        
        if ((this.isMidSquare(this.position.y) || this.isMidSquare(this.position.x)) &&
            block === Pacman.BISCUIT || block === Pacman.PILL) {
            
            this.map.setBlock(nextWhole, Pacman.EMPTY);
            this.addScore((block === Pacman.BISCUIT) ? 10 : 50);
            this.eaten += 1;
            
            if (this.eaten === 182) {
                this.game.completedLevel();
            }
            
            if (block === Pacman.PILL) { 
                this.game.eatenPill();
            }
        }   
                
        return {
            "new" : this.position,
            "old" : oldPosition
        };
    };

    this.isMidSquare = function (x) {
        var rem = x % 10;
        return rem > 3 || rem < 7;
    };

    this.calcAngle = function (dir, pos) {
        if (dir == RIGHT && (pos.x % 10 < 5)) {
            return {"start":0.25, "end":1.75, "direction": false};
        } else if (dir === DOWN && (pos.y % 10 < 5)) { 
            return {"start":0.75, "end":2.25, "direction": false};
        } else if (dir === UP && (pos.y % 10 < 5)) { 
            return {"start":1.25, "end":1.75, "direction": true};
        } else if (dir === LEFT && (pos.x % 10 < 5)) {             
            return {"start":0.75, "end":1.25, "direction": true};
        }
        return {"start":0, "end":2, "direction": false};
    };

    this.drawDead = function(ctx, amount) { 

        var size = this.map.blockSize, 
            half = size / 2;

        if (amount >= 1) { 
            return;
        }

        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();        
        ctx.moveTo(((this.position.x/10) * size) + half, 
                   ((this.position.y/10) * size) + half);
        
        ctx.arc(((this.position.x/10) * size) + half, 
                ((this.position.y/10) * size) + half,
                half, 0, Math.PI * 2 * amount, true); 
        
        ctx.fill();    
    };

    this.draw = function(ctx) { 

        var s     = this.map.blockSize, 
            angle = this.calcAngle(this.direction, this.position);

        ctx.fillStyle = "#FFFF00";

        ctx.beginPath();        

        ctx.moveTo(((this.position.x/10) * s) + s / 2,
                   ((this.position.y/10) * s) + s / 2);
        
        ctx.arc(((this.position.x/10) * s) + s / 2,
                ((this.position.y/10) * s) + s / 2,
                s / 2, Math.PI * angle.start, 
                Math.PI * angle.end, angle.direction); 
        
        ctx.fill();    
    };
    
    this.initUser();

    return this;
    /*return {
        "draw"          : draw,
        "drawDead"      : drawDead,
        "loseLife"      : loseLife,
        "getLives"      : getLives,
        "score"         : score,
        "addScore"      : addScore,
        "theScore"      : theScore,
        "keyDown"       : keyDown,
        "move"          : move,
        "newLevel"      : newLevel,
        "reset"         : reset,
        "resetPosition" : resetPosition
    };*/
};

Pacman.Map = function (size) {
    
    var height    = null, 
        width     = null, 
        blockSize = size,
        pillSize  = 0,
        map       = null;
		
	function getMap(){
		return map;
	}
    
    function withinBounds(y, x) {
        return y >= 0 && y < height && x >= 0 && x < width;
    }
    
    function isWall(pos) {
        return withinBounds(pos.y, pos.x) && map[pos.y][pos.x] === Pacman.WALL;
    }
    
    function isFloorSpace(pos) {
        if (!withinBounds(pos.y, pos.x)) {
            return false;
        }
        var peice = map[pos.y][pos.x];
        return peice === Pacman.EMPTY || 
            peice === Pacman.BISCUIT ||
            peice === Pacman.PILL;
    }
    
    function drawWall(ctx) {

        var i, j, p, line;
        
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth   = 5;
        ctx.lineCap     = "round";
        
        for (i = 0; i < Pacman.WALLS.length; i += 1) {
            line = Pacman.WALLS[i];
            ctx.beginPath();

            for (j = 0; j < line.length; j += 1) {

                p = line[j];
                
                if (p.move) {
                    ctx.moveTo(p.move[0] * blockSize, p.move[1] * blockSize);
                } else if (p.line) {
                    ctx.lineTo(p.line[0] * blockSize, p.line[1] * blockSize);
                } else if (p.curve) {
                    ctx.quadraticCurveTo(p.curve[0] * blockSize, 
                                         p.curve[1] * blockSize,
                                         p.curve[2] * blockSize, 
                                         p.curve[3] * blockSize);   
                }
            }
            ctx.stroke();
        }
    }
    
    function reset() {       
        map    = Pacman.MAP.clone();
        height = map.length;
        width  = map[0].length;        
    };

    function block(pos) {
        return map[pos.y][pos.x];
    };
    
    function setBlock(pos, type) {
        map[pos.y][pos.x] = type;
    };

    function drawPills(ctx) { 

        if (++pillSize > 30) {
            pillSize = 0;
        }
        
        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
                if (map[i][j] === Pacman.PILL) {
                    ctx.beginPath();

                    ctx.fillStyle = "#000";
		            ctx.fillRect((j * blockSize), (i * blockSize), 
                                 blockSize, blockSize);

                    ctx.fillStyle = "#FFF";
                    ctx.arc((j * blockSize) + blockSize / 2,
                            (i * blockSize) + blockSize / 2,
                            Math.abs(5 - (pillSize/3)), 
                            0, 
                            Math.PI * 2, false); 
                    ctx.fill();
                    ctx.closePath();
                }
		    }
	    }
    };
    
    function draw(ctx) {
        
        var i, j, size = blockSize;

        ctx.fillStyle = "#000";
	    ctx.fillRect(0, 0, width * size, height * size);

        drawWall(ctx);
        
        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
			    drawBlock(i, j, ctx);
		    }
	    }
    };
    
    function drawBlock(y, x, ctx) {

        var layout = map[y][x];

        if (layout === Pacman.PILL) {
            return;
        }

        ctx.beginPath();
        
        if (layout === Pacman.EMPTY || layout === Pacman.BLOCK || 
            layout === Pacman.BISCUIT) {
            
            ctx.fillStyle = "#000";
		    ctx.fillRect((x * blockSize), (y * blockSize), 
                         blockSize, blockSize);

            if (layout === Pacman.BISCUIT) {
                ctx.fillStyle = "#FFF";
		        ctx.fillRect((x * blockSize) + (blockSize / 2.5), 
                             (y * blockSize) + (blockSize / 2.5), 
                             blockSize / 6, blockSize / 6);
	        }
        }
        ctx.closePath();	 
    };

    reset();
    
    return {
        "draw"         : draw,
        "drawBlock"    : drawBlock,
        "drawPills"    : drawPills,
        "block"        : block,
        "setBlock"     : setBlock,
        "reset"        : reset,
        "isWallSpace"  : isWall,
        "isFloorSpace" : isFloorSpace,
        "height"       : height,
        "width"        : width,
        "blockSize"    : blockSize,
		"getMap"       : getMap
    };
};

Pacman.Audio = function(game) {
    
    var files          = [], 
        endEvents      = [],
        progressEvents = [],
        playing        = [];
    
    function load(name, path, cb) { 

        var f = files[name] = document.createElement("audio");

        progressEvents[name] = function(event) { progress(event, name, cb); };
        
        f.addEventListener("canplaythrough", progressEvents[name], true);
        f.setAttribute("preload", "true");
        f.setAttribute("autobuffer", "true");
        f.setAttribute("src", path);
        f.pause();        
    };

    function progress(event, name, callback) { 
        if (event.loaded === event.total && typeof callback === "function") {
            callback();
            files[name].removeEventListener("canplaythrough", 
                                            progressEvents[name], true);
        }
    };

    function disableSound() {
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
            files[playing[i]].currentTime = 0;
        }
        playing = [];
    };

    function ended(name) { 

        var i, tmp = [], found = false;

        files[name].removeEventListener("ended", endEvents[name], true);

        for (i = 0; i < playing.length; i++) {
            if (!found && playing[i]) { 
                found = true;
            } else { 
                tmp.push(playing[i]);
            }
        }
        playing = tmp;
    };

    function play(name) { 
        if (!game.soundDisabled()) {
            endEvents[name] = function() { ended(name); };
            playing.push(name);
            files[name].addEventListener("ended", endEvents[name], true);
            files[name].play();
        }
    };

    function pause() { 
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
        }
    };
    
    function resume() { 
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].play();
        }        
    };
    
    return {
        "disableSound" : disableSound,
        "load"         : load,
        "play"         : play,
        "pause"        : pause,
        "resume"       : resume
    };
};

var PACMAN = (function () {

    var state        = WAITING,
        audio        = null,
        ghosts       = [],
        ghostSpecs   = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"],
        eatenCount   = 0,
        level        = 0,
        tick         = 0,
        ghostPos, userPos, 
        stateChanged = true,
        timerStart   = null,
        lastTime     = 0,
        ctx          = null,
        timer        = null,
        map          = null,
        user         = null,
        stored       = null;

    function getState() {
        var inputs = [];
        inputs.push(user.position["x"]);
        inputs.push(user.position["y"]);
		inputs.push(Pacman.MAP[inputs[1]][inputs[0] + 1])
		inputs.push(Pacman.MAP[inputs[1]][inputs[0] - 1])
		inputs.push(Pacman.MAP[inputs[1] + 1][inputs[0]])
		inputs.push(Pacman.MAP[inputs[1] - 1][inputs[0]])
        for (var i = 0; i < ghosts.length; i += 1) {
            inputs.push(ghosts[i].position["x"]);
            inputs.push(ghosts[i].position["y"]);
        }
        return inputs;
    };

    function getTick() { 
        return tick;
    };

    function drawScore(text, position) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font      = "12px BDCartoonShoutRegular";
        ctx.fillText(text, 
                     (position["new"]["x"] / 10) * map.blockSize, 
                     ((position["new"]["y"] + 5) / 10) * map.blockSize);
    }
    
    function dialog(text) {
        ctx.fillStyle = "#FFFF00";
        ctx.font      = "14px BDCartoonShoutRegular";
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2;        
        ctx.fillText(text, x, (map.height * 10) + 8);
    }

    function soundDisabled() {
        return localStorage["soundDisabled"] === "true";
    };
    
    function startLevel() {        
        user.resetPosition();
        for (var i = 0; i < ghosts.length; i += 1) { 
            ghosts[i].reset();
        }
        audio.play("start");
        timerStart = tick;
        setState(COUNTDOWN);
    }    

    function startNewGame() {
        setState(WAITING);
        level = 1;
        user.reset();
        map.reset();
        map.draw(ctx);
        startLevel();
    }

    function keyDown(e) {
        if (e.keyCode === KEY.N) {
            startNewGame();
        } else if (e.keyCode === KEY.S) {
            audio.disableSound();
            localStorage["soundDisabled"] = !soundDisabled();
        } else if (e.keyCode === KEY.P && state === PAUSE) {
            audio.resume();
            map.draw(ctx);
            setState(stored);
        } else if (e.keyCode === KEY.P) {
            stored = state;
            setState(PAUSE);
            audio.pause();
            map.draw(ctx);
            dialog("Paused");
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

    function drawFooter() {
        
        var topLeft  = (map.height * map.blockSize),
            textBase = topLeft + 17;
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, topLeft, (map.width * map.blockSize), 30);
        
        ctx.fillStyle = "#FFFF00";

        for (var i = 0, len = user.getLives(); i < len; i++) {
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.moveTo(150 + (25 * i) + map.blockSize / 2,
                       (topLeft+1) + map.blockSize / 2);
            
            ctx.arc(150 + (25 * i) + map.blockSize / 2,
                    (topLeft+1) + map.blockSize / 2,
                    map.blockSize / 2, Math.PI * 0.25, Math.PI * 1.75, false);
            ctx.fill();
        }

        ctx.fillStyle = !soundDisabled() ? "#00FF00" : "#FF0000";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("s", 10, textBase);

        ctx.fillStyle = "#FFFF00";
        ctx.font      = "14px BDCartoonShoutRegular";
        ctx.fillText("Score: " + user.theScore(), 30, textBase);
        ctx.fillText("Level: " + level, 260, textBase);
    }

    function redrawBlock(pos) {
        map.drawBlock(Math.floor(pos.y/10), Math.floor(pos.x/10), ctx);
        map.drawBlock(Math.ceil(pos.y/10), Math.ceil(pos.x/10), ctx);
    }

    function mainDraw() { 

        var diff, u, i, len, nScore;
        
        ghostPos = [];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghostPos.push(ghosts[i].move(ctx));
        }
        u = user.move(ctx);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            redrawBlock(ghostPos[i].old);
        }
        redrawBlock(u.old);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx);
        }                     
        user.draw(ctx);
        
        userPos = u["new"];
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            if (collided(userPos, ghostPos[i]["new"])) {
                if (ghosts[i].isVunerable()) { 
                    audio.play("eatghost");
                    ghosts[i].eat();
                    eatenCount += 1;
                    nScore = eatenCount * 50;
                    drawScore(nScore, ghostPos[i]);
                    user.addScore(nScore);                    
                    setState(EATEN_PAUSE);
                    timerStart = tick;
                } else if (ghosts[i].isDangerous()) {
                    audio.play("die");
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

        map.drawPills(ctx);

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING && stateChanged) {            
            stateChanged = false;
            map.draw(ctx);
            dialog("Press N to start a New game");            
        } else if (state === EATEN_PAUSE && 
                   (tick - timerStart) > (Pacman.FPS / 3)) {
            map.draw(ctx);
            setState(PLAYING);
        } else if (state === DYING) {
            if (tick - timerStart > (Pacman.FPS * 2)) { 
                loseLife();
            } else { 
                redrawBlock(userPos);
                for (i = 0, len = ghosts.length; i < len; i += 1) {
                    redrawBlock(ghostPos[i].old);
                    ghostPos.push(ghosts[i].draw(ctx));
                }                                   
                user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
            }
        } else if (state === COUNTDOWN) {
            
            diff = 5 + Math.floor((timerStart - tick) / Pacman.FPS);
            
            if (diff === 0) {
                map.draw(ctx);
                setState(PLAYING);
            } else {
                if (diff !== lastTime) { 
                    lastTime = diff;
                    map.draw(ctx);
                    dialog("Starting in: " + diff);
                }
            }
        } 

        drawFooter();
    }

    function eatenPill() {
        audio.play("eatpill");
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
        
        var i, len, ghost,
            blockSize = wrapper.offsetWidth / 19,
            canvas    = document.createElement("canvas");
        
        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 30 + "px");

        wrapper.appendChild(canvas);

        ctx  = canvas.getContext('2d');

        audio = new Pacman.Audio({"soundDisabled":soundDisabled});
        map   = new Pacman.Map(blockSize);
        user  = new Pacman.User({ 
            "completedLevel" : completedLevel, 
            "eatenPill": eatenPill,
            "getState":getState
        }, map);

        for (i = 0, len = ghostSpecs.length; i < len; i += 1) {
            ghost = new Pacman.Ghost({"getTick":getTick}, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }
        
        map.draw(ctx);
        dialog("Loading ...");

        var extension = Modernizr.audio.ogg ? 'ogg' : 'mp3';

        var audio_files = [
            ["start", root + "audio/opening_song." + extension],
            ["die", root + "audio/die." + extension],
            ["eatghost", root + "audio/eatghost." + extension],
            ["eatpill", root + "audio/eatpill." + extension],
            ["eating", root + "audio/eating.short." + extension],
            ["eating2", root + "audio/eating.short." + extension]
        ];

        load(audio_files, function() { loaded(); });
    };

    function load(arr, callback) { 
        
        if (arr.length === 0) { 
            callback();
        } else { 
            var x = arr.pop();
            audio.load(x[0], x[1], function() { load(arr, callback); });
        }
    };
        
    function loaded() {

        dialog("Press N to Start");
        
        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keypress", keyPress, true); 
        
        timer = window.setInterval(mainLoop, 1000 / Pacman.FPS);
    };
    
    return {
        "init" : init
    };
    
}());

/* Human readable keyCode index */
var KEY = {'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27, 'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36, 'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40, 'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59, 'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93, 'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107, 'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110, 'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145, 'SEMICOLON': 186, 'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189, 'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192, 'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220, 'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222};

(function () {
	/* 0 - 9 */
	for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
	}
	/* A - Z */
	for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
	}
	/* NUM_PAD_0 - NUM_PAD_9 */
	for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
	}
	/* F1 - F12 */
	for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
	}
})();

Pacman.WALL    = 0;
Pacman.BISCUIT = 1;
Pacman.EMPTY   = 2;
Pacman.BLOCK   = 3;
Pacman.PILL    = 4;

Pacman.MAP = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
	[0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

/*
Pacman.MAP = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
	[0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
*/

Pacman.WALLS = [
    
    [{"move": [0, 9.5]}, {"line": [3, 9.5]},
     {"curve": [3.5, 9.5, 3.5, 9]}, {"line": [3.5, 8]},
     {"curve": [3.5, 7.5, 3, 7.5]}, {"line": [1, 7.5]},
     {"curve": [0.5, 7.5, 0.5, 7]}, {"line": [0.5, 1]},
     {"curve": [0.5, 0.5, 1, 0.5]}, {"line": [9, 0.5]},
     {"curve": [9.5, 0.5, 9.5, 1]}, {"line": [9.5, 3.5]}],

    [{"move": [9.5, 1]},
     {"curve": [9.5, 0.5, 10, 0.5]}, {"line": [18, 0.5]},
     {"curve": [18.5, 0.5, 18.5, 1]}, {"line": [18.5, 7]},
     {"curve": [18.5, 7.5, 18, 7.5]}, {"line": [16, 7.5]},
     {"curve": [15.5, 7.5, 15.5, 8]}, {"line": [15.5, 9]},
     {"curve": [15.5, 9.5, 16, 9.5]}, {"line": [19, 9.5]}],

    [{"move": [2.5, 5.5]}, {"line": [3.5, 5.5]}],

    [{"move": [3, 2.5]},
     {"curve": [3.5, 2.5, 3.5, 3]},
     {"curve": [3.5, 3.5, 3, 3.5]},
     {"curve": [2.5, 3.5, 2.5, 3]},
     {"curve": [2.5, 2.5, 3, 2.5]}],

    [{"move": [15.5, 5.5]}, {"line": [16.5, 5.5]}],

    [{"move": [16, 2.5]}, {"curve": [16.5, 2.5, 16.5, 3]},
     {"curve": [16.5, 3.5, 16, 3.5]}, {"curve": [15.5, 3.5, 15.5, 3]},
     {"curve": [15.5, 2.5, 16, 2.5]}],

    [{"move": [6, 2.5]}, {"line": [7, 2.5]}, {"curve": [7.5, 2.5, 7.5, 3]},
     {"curve": [7.5, 3.5, 7, 3.5]}, {"line": [6, 3.5]},
     {"curve": [5.5, 3.5, 5.5, 3]}, {"curve": [5.5, 2.5, 6, 2.5]}],

    [{"move": [12, 2.5]}, {"line": [13, 2.5]}, {"curve": [13.5, 2.5, 13.5, 3]},
     {"curve": [13.5, 3.5, 13, 3.5]}, {"line": [12, 3.5]},
     {"curve": [11.5, 3.5, 11.5, 3]}, {"curve": [11.5, 2.5, 12, 2.5]}],

    [{"move": [7.5, 5.5]}, {"line": [9, 5.5]}, {"curve": [9.5, 5.5, 9.5, 6]},
     {"line": [9.5, 7.5]}],
    [{"move": [9.5, 6]}, {"curve": [9.5, 5.5, 10.5, 5.5]},
     {"line": [11.5, 5.5]}],


    [{"move": [5.5, 5.5]}, {"line": [5.5, 7]}, {"curve": [5.5, 7.5, 6, 7.5]},
     {"line": [7.5, 7.5]}],
    [{"move": [6, 7.5]}, {"curve": [5.5, 7.5, 5.5, 8]}, {"line": [5.5, 9.5]}],

    [{"move": [13.5, 5.5]}, {"line": [13.5, 7]},
     {"curve": [13.5, 7.5, 13, 7.5]}, {"line": [11.5, 7.5]}],
    [{"move": [13, 7.5]}, {"curve": [13.5, 7.5, 13.5, 8]},
     {"line": [13.5, 9.5]}],

    [{"move": [0, 11.5]}, {"line": [3, 11.5]}, {"curve": [3.5, 11.5, 3.5, 12]},
     {"line": [3.5, 13]}, {"curve": [3.5, 13.5, 3, 13.5]}, {"line": [1, 13.5]},
     {"curve": [0.5, 13.5, 0.5, 14]}, {"line": [0.5, 17]},
     {"curve": [0.5, 17.5, 1, 17.5]}, {"line": [1.5, 17.5]}],
    [{"move": [1, 17.5]}, {"curve": [0.5, 17.5, 0.5, 18]}, {"line": [0.5, 21]},
     {"curve": [0.5, 21.5, 1, 21.5]}, {"line": [18, 21.5]},
     {"curve": [18.5, 21.5, 18.5, 21]}, {"line": [18.5, 18]},
     {"curve": [18.5, 17.5, 18, 17.5]}, {"line": [17.5, 17.5]}],
    [{"move": [18, 17.5]}, {"curve": [18.5, 17.5, 18.5, 17]},
     {"line": [18.5, 14]}, {"curve": [18.5, 13.5, 18, 13.5]},
     {"line": [16, 13.5]}, {"curve": [15.5, 13.5, 15.5, 13]},
     {"line": [15.5, 12]}, {"curve": [15.5, 11.5, 16, 11.5]},
     {"line": [19, 11.5]}],

    [{"move": [5.5, 11.5]}, {"line": [5.5, 13.5]}],
    [{"move": [13.5, 11.5]}, {"line": [13.5, 13.5]}],

    [{"move": [2.5, 15.5]}, {"line": [3, 15.5]},
     {"curve": [3.5, 15.5, 3.5, 16]}, {"line": [3.5, 17.5]}],
    [{"move": [16.5, 15.5]}, {"line": [16, 15.5]},
     {"curve": [15.5, 15.5, 15.5, 16]}, {"line": [15.5, 17.5]}],

    [{"move": [5.5, 15.5]}, {"line": [7.5, 15.5]}],
    [{"move": [11.5, 15.5]}, {"line": [13.5, 15.5]}],
    
    [{"move": [2.5, 19.5]}, {"line": [5, 19.5]},
     {"curve": [5.5, 19.5, 5.5, 19]}, {"line": [5.5, 17.5]}],
    [{"move": [5.5, 19]}, {"curve": [5.5, 19.5, 6, 19.5]},
     {"line": [7.5, 19.5]}],

    [{"move": [11.5, 19.5]}, {"line": [13, 19.5]},
     {"curve": [13.5, 19.5, 13.5, 19]}, {"line": [13.5, 17.5]}],
    [{"move": [13.5, 19]}, {"curve": [13.5, 19.5, 14, 19.5]},
     {"line": [16.5, 19.5]}],

    [{"move": [7.5, 13.5]}, {"line": [9, 13.5]},
     {"curve": [9.5, 13.5, 9.5, 14]}, {"line": [9.5, 15.5]}],
    [{"move": [9.5, 14]}, {"curve": [9.5, 13.5, 10, 13.5]},
     {"line": [11.5, 13.5]}],

    [{"move": [7.5, 17.5]}, {"line": [9, 17.5]},
     {"curve": [9.5, 17.5, 9.5, 18]}, {"line": [9.5, 19.5]}],
    [{"move": [9.5, 18]}, {"curve": [9.5, 17.5, 10, 17.5]},
     {"line": [11.5, 17.5]}],

    [{"move": [8.5, 9.5]}, {"line": [8, 9.5]}, {"curve": [7.5, 9.5, 7.5, 10]},
     {"line": [7.5, 11]}, {"curve": [7.5, 11.5, 8, 11.5]},
     {"line": [11, 11.5]}, {"curve": [11.5, 11.5, 11.5, 11]},
     {"line": [11.5, 10]}, {"curve": [11.5, 9.5, 11, 9.5]},
     {"line": [10.5, 9.5]}]
];

Object.prototype.clone = function () {
    var i, newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i === 'clone') {
            continue;
        }
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        } else {
            newObj[i] = this[i];
        }
    }
    return newObj;
};



