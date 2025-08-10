import { Brain } from "./brain.js";
import { Genome } from "./genome.js";

function start() {
    const genome = Genome.random({
        inputLayerLength: 10,
        hiddenLayers: 2,
        outputLayerLength: 2,
        length: 1000
    });
    const brain = new Brain(genome);
    const input = [0, 1, 3, 4, 5, 6, 7, 8, 9];
    const output = brain.feed(input);
}

start();
