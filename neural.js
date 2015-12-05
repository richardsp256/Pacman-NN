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

    var update = function (world) {
        var inputs = [];

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