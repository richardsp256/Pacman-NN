/************************************************

GENOMICS BEGIN

************************************************/
var Genomics = {};

Genomics.Genome = function (weightsArray, fitnessFloat) {
    var weights = weightsArray,
        fitness = fitnessFloat;


}
Genomics.Compare = function (ga, gb) {
    return ga.fitness < gb.fitness;
}

Genomics.Algorithm = function (popSize, mutRate, crossRate, numWeights, maxPerturbation, eliteGenomeCount, eliteGenomeNum) {
    var population = [],
        mutationRate = mutRate,
        crossOverRate = crossRate.
        populationSize = popSize,
        weightsPerResident = numWeights,
        maxPertubance = maxPerturbation,
        eliteCount = eliteGenomeCount,
        eliteNum = eliteGenomeNum,
        totalFitness = 0,
        bestFitness = 0,
        averageFitness = 0,
        worstFitness = 9999999999999,
        fittestIndex = 0,
        generation = 0;

    var randomizePoplation = function () {
        for (i = 0; i < populationSize; i++) {
            var weights = [];
            for (j = 0; j < weightsPerResident; j++)
                weights.push(RandomClamped());
            var resident = new Genomics.Genome(weights, 0);
            population.push(resident);
        }
    }

    var crossover = function (parentA, parentB, childA, childB) {
        if (RandFloat() > crossOverRate || parentA == parentB) {
            // TODO 
            fill(parentA, childA);
            fill(parentB, childB);
            return;
        }

        crossoverPoint = rand() % weightsPerResident;
        for (i = 0; i < crossoverPoint; i++) {
            childA.push(parentA[i]);
            childB.push(parentB[i]);
        }
        for (i = crossoverPoint; i < parentA.length; i++) {
            childA.push(parentB[i]);
            childB.push(parentA[i]);
        }
    }

    var mutate = function (residentWeights) {
        for (i = 0; i < residentWeights.length; i++) {
            if (random() < mutationRate) {
                residentWeights[i] += randomClamped() * maxPertubance;
            }
        }
    }

    var getSample = function () {
        slice = random() * totalFitness;
        fitnessSoFar = 0;

        for (i = 0; i < populationSize; i++) {
            fitnessSoFar += population[i].fitness;
            if (fitnessSoFar >= slice)
                return population[i];
        }
        return population[populationSize / 2];
    }

    var getBest = function (nBest, nCopies, newPopulation) {
        while (nBest-- != 0) {
            for (i = 0; i < nCopies; i++) {
                newPopulation.push(population[(populationSize - 1) - nBest]);
            }
        }
    }

    var getBestWorstAverageTotal = function () {
        totalFitness = 0;
        var highestSoFar = 0;
        var lowestSoFar = 999999999999;
        for (i = 0; i < populationSize; i++) {
            var fit = population[i].fitness;
            if (fit > highestSoFar) {
                highestSoFar = population
                fittestIndex = i;
                bestFitness = highestSoFar;
            }
            if (fit < lowestSoFar) {
                lowestSoFar = fit;
                worstFitness = lowestSoFar;
            }

            totalFitness += fit;
        }

        averageFitness = totalFitness / populationSize;
    }

    var reset = function () {
        totalFitness = 0;
        bestFitness = 0;
        worstFitness = 0;
        averageFitness = 0;
    }

    //Runs the algorithm for one generation
    var epoch = function (oldPopulation) {
        var newPopulation = [];
        population = oldPopulation;
        reset();

        population.sort(Genomics.Compare);
        getBestWorstAverageTotal();
        if (eliteCount * eliteNum % 2 == 0) {
            getBest(eliteNum, eliteCount, newPopulation);
        }

        //GA loop
        while (newPopulation.length < populationSize) {
            var parentA = getSample();
            var parentB = getSample();
            var childA = [];
            var childB = [];

            crossover(parentA.weights, parentB.weights, childA, childB);

            mutate(childA);
            mutate(childB);

            newPopulation.push(new Genomics.Genome(childA, 0));
            newPopulation.push(new Genomics.Genome(childB, 0));
        }

        population = newPopulation;
        return population;
    }

    var getPopulation = function () {
        return population;
    }

    var getAverageFitness = function () {
        return averageFitness;
    }

    var getBestFitness = function () {
        return bestFitness;
    }
	
	population = randomizePoplation();
}