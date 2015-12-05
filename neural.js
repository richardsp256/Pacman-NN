/**********************************************
                UTILS
**********************************************/

var Neural = {};
var Params = {};

var fill = function (source, sink) {
    for (i = 0; i < source.length; i++) {
        source.push(sink[i]);
    }
}

/************************************************

NEURAL NETWORK BEGIN

************************************************/

Neural.Neuron = function (inputCount) {
    var inputs = inputCount + 1, //Add 1 for bias
        weights = [];

    var randomWeights = function () {
        for (i = 0; i < inputs; i++) {
            weights.push(Math.random());
            console.log(weights[i])
        }
    }
    randomWeights();
}

Neural.NeuralLayer = function (numberOfNeurons, inputsPerNeuron) {
    var neuronCount = numberOfNeurons,
        inputCount = inputsPerNeuron,
        neurons = [];

    var createLayer = function () {
        for (i = 0; i < neuronCount; i++)
            neurons.push(new Neural.Neuron(inputCount));
    }

    createLayer();

    var summarize = function (inputs, bias, response, responseFunction) {
        var sum = 0,
            w = 0,
            ouputs = [];
        for (i = 0; i < neuronCount - 1; i++) {
            var neuron = neurons[i];
            var weightCount = neuron.neuronCount - 1;
            for (j = 0; j < weightCount; j++) {
                sum += neuron.weights[j] * inputs[w++];
            }
            sum += neuron[weightCount].weights[weightCount] * bias;
            outputs.push(responseFunction(sum, response));
        }

        return outputs;
    }

    var getTotalNeuronCount = function () {
        return neuronCount * inputCount;
    }
}

Neural.NeuralNetwork = function (biasFloat, activationResponseFloat) {
    var inputCount,//Number of input neorons
        outputCount,//Number of output neurons
        hiddenLayerCount,//Number of hidden layers
        neuronsPerHiddenLayerCount,//Number of neurons within a hidden layer
        hiddenLayers = [];//The set of hidden layers

    var bias = biasFloat,
        response = activationResponseFloat;

    var createNetwork = function () {
        if (hiddenLayerCount > 0) {
            hiddenLayers.push(new Neuron.NeuralLayer(neuronsPerHiddenLayerCount, inputCount));
            for (i = 0; i < hiddenLayerCount - 1; i++) {
                hiddenLayers.push(new Neuron.NeuralLayer(neuronsPerHiddenLayerCount, neuronsPerHiddenLayerCount));
            }

            hiddenLayers.push(new Neuron.NeuralLayer(putputCount, neuronsPerHiddenLayerCount));
        }
        else {
            hiddenLayers.push(new Neuron.NeuralLayer(outputCount, neuronsPerHiddenLayerCount));
        }
    }

    createNetwork();

    //returns the list of weights held by each neuron in the entire network (for(ijk)layers.neurons.weights)
    var getWeights = function () {
        var weights = [];
        for (i = 0; i < hiddenLayerCount; i++) {
            var layer = hiddenLayers[i].neurons;
            for (j = 0; j < neurons.length; j++) {
                var localWeights = neurons[j].weights;
                for (k = 0; k < localWeights.length; k++) {
                    weights.push(localWeights[i]);
                }
            }
        }
        return weights;
    }

    var getWeightsCount = function () {
        var index = 0;
        for (i = 0; i < hiddenLayerCount; i++) {
            var layer = hiddenLayers[i].neurons;
            for (j = 0; j < neurons.length; j++) {
                index += neurons[j].weights.length;
            }
        }
        return index;
    }

    var setWeights = function (weights) {
        var index = 0;
        for (i = 0; i < hiddenLayerCount; i++) {
            var layer = hiddenLayers[i].neurons;
            for (j = 0; j < neurons.length; j++) {
                var localWeights = neurons[j].weights;
                for (k = 0; k < localWeights.length; k++) {
                    localWeights[k] = weights[index++];
                }
            }
        }
    }

    var update = function (inputs) {
        var outputs = [],
            weightIndex = 0;

        if (inputs.length != inputCount) {
            //return empty
            return outputs;
        }


        for (i = 0; i < hiddenLayerCount + 1; i++) {
            if (i > 0)
                inputs = outputs;//The output from previous iteration becomes new input.
            outputs = hiddenLayers[i].summarize(inputs, weightIndex, bias, response, sigmoid);
            weightIndex += hiddenLayers[i].getTotalNeuronCount();
        }
		return outputs;
    }

    var sigmoid = function (activation, response) {
        return (1 / (1 + Math.exp(-activation / response)));
    }
}


/************************************

NEURAL PACMAN CONTROLLER

************************************/

Neural.Agent = function () {
    var neuralNetwork = new Neural.NeuralNetwork(Params.BIAS, Params.THRESHOLD),
        position = { x: 0, y: 0 },
        direction = RIGHT,
        output_direction_x = 0,
        output_direction_y = 0,
        output_move = { x: 0, y: 0 },
        fitness = 0;

    //TODO : Track the ghosts.
    //       Track the pellets.
    //       Track power pellets.
    //
    //       Store this information in "World"

    var update = function (inputs) {

        //TODO add pacmans current location.
        //     add each ghost location.
        //     add position of closest pellet.
        //     add position of closest power pellet.
        //     Setup the "World" class
        //i.e. world.getPacmanPosition
		

        var outputs = neuralNetwork.update(inputs);
        if (outputs < Params.OUTPUT_COUNT)
            return false;

        //assign outputs to pacmans movements
        //example:
        var left = output[0];
        var right = output[1];
        var up = output[2];
        var down = output[3];

        var movement = NONE;

        //arbitrater to give these values meaning
        //Not sure what the output actually looks like.
        if (left > .5)
            movement = LEFT;

        if (right > .5)
            movement = RIGHT;

        if (up > .5)
            movement = UP;

        if (down > .5)
            movement = DOWN;
    }

    var getDirection = function () {
        return getAppropriateDirection(position);
    }

    var getAppropriateDirection = function (currentPosition, targetPosition) {
        //TODO Consult the neural network.

        return LEFT;
    }

    var getClosetPellet = function (world) {

    }

    var getClosestGhost = function (world) {

    }

    var getClosestPowerPellet = function (world) {

    }

    var reset = function () {
        fitness = 0;
        position.x = 0;
        position.y = 0;
        direction = RIGHT;
    }

    var getPosition = function () { return position; }

    var getFitness = function () { return fitness; }

    var incrementFitness = function () { fitness++; }

    var setWeights = function (weights) {
        neuralNetwork.setWeights(weights);
    }

    var getWeightsCount = function () {
        return neuralNetwork.getWeightsCount();
    }
}