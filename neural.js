/**********************************************
                UTILS
**********************************************/

var Neural = {};
var Params = {};

var fill = function (source, sink) {
    for (var i = 0; i < source.length; i++) {
        source.push(sink[i]);
    }
}

/************************************************

NEURAL NETWORK BEGIN

************************************************/

Neural.Neuron = function (inputCount) {
    this.inputs = inputCount + 1; //Add 1 for bias
    this.weights = [];

    this.randomWeights = function () {
        for (var i = 0; i < this.inputs; i++) {
            this.weights.push(Math.random());
        }
    }
    this.randomWeights();
}

Neural.NeuralLayer = function (numberOfNeurons, inputsPerNeuron) {
    this.neuronCount = numberOfNeurons;
    this.inputCount = inputsPerNeuron;
    this.neurons = [];

    this.createLayer = function () {
        for (var i = 0; i < this.neuronCount; i++) {
            this.neurons.push(new Neural.Neuron(this.inputCount));
        }
    }

    this.createLayer();

    this.summarize = function (inputs, bias, response, responseFunction) {
        var sum = 0,
            w = 0,
            outputs = [];

        for (var i = 0; i < this.neuronCount - 1; i++) {
            var neuron = this.neurons[i];
            var weightCount = neuron.neuronCount - 1;

            for (var j = 0; j < weightCount; j++) {
                sum += neuron.weights[j] * inputs[w++];
            }

            //add bias
            //sum += neuron[weightCount].weights[weightCount] * bias;
            outputs.push(responseFunction(sum, response));
        }

        return outputs;
    }

    this.getTotalNeuronCount = function () {
        return this.neuronCount * this.inputCount;
    }
}

Neural.NeuralNetwork = function (biasFloat, activationResponseFloat) {
    this.inputCount = 10;//Number of input neorons
    this.outputCount = 4;//Number of output neurons
    this.hiddenLayerCount = 3;//Number of hidden layers
    this.neuronsPerHiddenLayerCount = 6;//Number of neurons within a hidden layer
    this.hiddenLayers = [];//The set of hidden layers

    this.bias = biasFloat;
    this.response = activationResponseFloat;

    this.createNetwork = function() {
        if (this.hiddenLayerCount > 0) {
            //Input layer
            this.hiddenLayers.push(new Neural.NeuralLayer(this.neuronsPerHiddenLayerCount, this.inputCount));

            //True hidden layers
            for (var i = 0; i < this.hiddenLayerCount - 1; i++) {
                this.hiddenLayers.push(new Neural.NeuralLayer(this.neuronsPerHiddenLayerCount, this.neuronsPerHiddenLayerCount));
            }

            //Output layer
            this.hiddenLayers.push(new Neural.NeuralLayer(this.outputCount, this.neuronsPerHiddenLayerCount));
        }
        else {
            this.hiddenLayers.push(new Neural.NeuralLayer(this.outputCount, this.neuronsPerHiddenLayerCount));
        }
    }

    this.createNetwork();

    //returns the list of weights held by each neuron in the entire network (for(ijk)layers.neurons.weights)
    this.getWeights = function() {
        var weights = [];
        for (var i = 0; i < this.hiddenLayerCount; i++) {
            var layer = this.hiddenLayers[i].neurons;
            for (var j = 0; j < this.neurons.length; j++) {
                var localWeights = this.neurons[j].weights;
                for (var k = 0; k < localWeights.length; k++) {
                    weights.push(localWeights[k]);
                }
            }
        }

        return weights;
    }

    this.getWeightsCount = function () {
        var index = 0;
        for (var i = 0; i < this.hiddenLayerCount; i++) {
            var layer = this.hiddenLayers[i].neurons;
            for (var j = 0; j < layer.length; j++) {
                index += layer[j].weights.length;
            }
        }
        return index;
    }

    this.setWeights = function (weights) {
        var index = 0;
        for (var i = 0; i < this.hiddenLayerCount; i++) {
            var layer = this.hiddenLayers[i].neurons;
            for (var j = 0; j < layer.length; j++) {
                var localWeights = layer[j].weights;
                for (var k = 0; k < localWeights.length; k++) {
                    localWeights[k] = weights[index++];
                }
            }
        }
    }

    this.update = function(inputs) {
        var outputs = [],
            weightIndex = 0;

        if (inputs.length != this.inputCount) {
            //return empty
            return outputs;
        }


        for (var i = 0; i < this.hiddenLayerCount + 1; i++) {
            if (i > 0)
                inputs = outputs;//The output from previous iteration becomes new input.
            outputs = this.hiddenLayers[i].summarize(inputs, /*weightIndex,*/ this.bias, this.response, this.sigmoid);
            weightIndex += this.hiddenLayers[i].getTotalNeuronCount();
        }
		return outputs;
    }

    this.sigmoid = function(activation, response) {
        return (1 / (1 + Math.exp(-activation / response)));
    }
}


/************************************

NEURAL PACMAN CONTROLLER

************************************/

Neural.Agent = function () {
    this.neuralNetwork = new Neural.NeuralNetwork(Params.BIAS, Params.THRESHOLD);
    this.position = { x: 0, y: 0 };
    this.direction = RIGHT;
    this.output_direction_x = 0;
    this.output_direction_y = 0;
    this.output_move = { x: 0, y: 0 };
    this.fitness = 0;

    //TODO : Track the ghosts.
    //       Track the pellets.
    //       Track power pellets.
    //
    //       Store this information in "World"

    this.update = function (inputs) {

        //TODO add pacmans current location.
        //     add each ghost location.
        //     add position of closest pellet.
        //     add position of closest power pellet.
        //     Setup the "World" class
        //i.e. world.getPacmanPosition
		

        var outputs = this.neuralNetwork.update(inputs);
        if (outputs < Params.OUTPUT_COUNT)
            return false;

        //assign outputs to pacmans movements
        //example:
        var left = outputs[0];
        var right = outputs[1];
        var up = outputs[2];
        var down = outputs[3];
		
		var i = outputs.indexOf(Math.max.apply(Math, outputs));

        var movement = NONE;

        //arbitrater to give these values meaning
        //Not sure what the output actually looks like.
        if (i == 0)
            movement = LEFT;

        if (i == 1)
            movement = RIGHT;

        if (i == 2)
            movement = UP;

        if (i == 3)
            movement = DOWN;
			
		return movement;
    }

    this.getDirection = function() {
        return this.getAppropriateDirection(position);
    }

    this.getAppropriateDirection = function (currentPosition, targetPosition) {
        //TODO Consult the neural network.

        return LEFT;
    }

    this.getClosetPellet = function (world) {

    }

    this.getClosestGhost = function (world) {

    }

    this.getClosestPowerPellet = function (world) {

    }

    this.reset = function () {
        this.fitness = 0;
        this.position.x = 0;
        this.position.y = 0;
        this.direction = RIGHT;
    }

    this.getPosition = function (){ return this.position; }

    this.getFitness = function () { return this.fitness; }

    this.incrementFitness = function() { this.fitness++; }

    this.setWeights = function (weights) {
        this.neuralNetwork.setWeights(weights);
    }
   
    this.getWeightsCount = function () {
        return this.neuralNetwork.getWeightsCount();
    }
}