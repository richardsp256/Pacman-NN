/************************************************

GENOMICS BEGIN

************************************************/
var Genomics = {};

Genomics.Genome = (function (weightsArray, fitnessFloat) {
    this.weights = weightsArray;
    this.fitness = fitnessFloat;
});

Genomics.Compare = function (ga, gb) {
    return ga.fitness < gb.fitness;
}

Genomics.Algorithm = (function (popSize, mutRate, crossRate, numWeights, maxPerturbation, eliteGenomeCount, eliteGenomeNum) {
    this.population = [];
    this.mutationRate = mutRate;
    this.crossOverRate = crossRate;
    this.populationSize = popSize;
    this.weightsPerResident = numWeights;
    this.maxPertubance = maxPerturbation;
    this.eliteCount = eliteGenomeCount;
    this.eliteNum = eliteGenomeNum;
    this.totalFitness = 0;
    this.bestFitness = 0;
    this.averageFitness = 0;
    this.worstFitness = 9999999999999;
    this.fittestIndex = 0;
    this.generation = 0;

    this.randomizePoplation = function () {

        console.log("Randomize: " + this.populationSize + " " + this.weightsPerResident);
        for (i = 0; i < this.populationSize; i++) {
            var weights = [];
            for (j = 0; j < this.weightsPerResident; j++)
                weights.push(RandomClamped());
            var resident = new Genomics.Genome(weights, 0);
            this.population.push(resident);
        }

        console.log("Population Length:" + this.population.length);
        console.log("Population :" + this.population);
    }

    this.crossover = function (parentA, parentB, childA, childB) {
        if (RandFloat() > this.crossOverRate || parentA == parentB) {
            // TODO 
            fill(parentA, childA);
            fill(parentB, childB);
            return;
        }

        crossoverPoint = rand() % this.weightsPerResident;
        for (i = 0; i < this.crossoverPoint; i++) {
            childA.push(parentA[i]);
            childB.push(parentB[i]);
        }
        for (i = this.crossoverPoint; i < parentA.length; i++) {
            childA.push(parentB[i]);
            childB.push(parentA[i]);
        }
    }

    this.mutate = function (residentWeights) {
        for (i = 0; i < this.residentWeights.length; i++) {
            if (random() < this.mutationRate) {
                this.residentWeights[i] += randomClamped() * this.maxPertubance;
            }
        }
    }

    this.getSample = function () {
        var slice = random() * this.totalFitness;
        var fitnessSoFar = 0;

        for (i = 0; i < this.populationSize; i++) {
            fitnessSoFar += this.population[i].fitness;
            if (fitnessSoFar >= slice)
                return this.population[i];
        }
        return this.population[this.populationSize / 2];
    }

    this.getBest = function (nBest, nCopies, newPopulation) {
        while (nBest-- != 0) {
            for (i = 0; i < nCopies; i++) {
                newPopulation.push(this.population[(this.populationSize - 1) - nBest]);
            }
        }
        return newPopulation;
    }

    this.getBestWorstAverageTotal = function () {
        this.totalFitness = 0;
        var highestSoFar = 0;
        var lowestSoFar = 999999999999;
        for (i = 0; i < this.populationSize; i++) {
            var fit = this.population[i].fitness;
            if (fit > highestSoFar) {
                highestSoFar = population[i];
                this.fittestIndex = i;
                this.bestFitness = highestSoFar;
            }
            if (fit < lowestSoFar) {
                lowestSoFar = fit;
                this.worstFitness = lowestSoFar;
            }

            this.totalFitness += fit;
        }

        this.averageFitness = this.totalFitness / this.populationSize;
    }

    this.reset = function () {
        this.totalFitness = 0;
        this.bestFitness = 0;
        this.worstFitness = 0;
        this.averageFitness = 0;
    }

    //Runs the algorithm for one generation
    this.epoch = function (oldPopulation) {
        var newPopulation = [];
        this.population = oldPopulation;
        this.reset();

        this.population.sort(Genomics.Compare);
        this.getBestWorstAverageTotal();
        if (this.eliteCount * this.eliteNum % 2 == 0) {
            this.getBest(this.eliteNum, this.eliteCount, newPopulation);
        }

        //GA loop
        while (newPopulation.length < this.populationSize) {
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

        this.population = newPopulation;
        return population;
    }

    this.getPopulation = function () {
        return this.population;
    }

    this.getAverageFitness = function () {
        return this.averageFitness;
    }

    this.getBestFitness = function () {
        return this.bestFitness;
    }

    this.randomizePoplation();
});