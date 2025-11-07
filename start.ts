import { Simulation } from "./src/simulation/simulation";

function start() {
    const simulation = new Simulation(100, {
        genomeLength: 100,
        mutationRate: 0.01,
        population: 20,
        hiddenLayers: 1,
        outputLayerLength: 2
    });
}
start();
