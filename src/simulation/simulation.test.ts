import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const MAX_GENERATIONS = 100;
const STEPS_PER_GENERATION = 50;
const POPULATION = 200;
const SELECTION_RATE = 0.1;
const MUTATION_RATE = 0.001;
const GENOME_LENGTH = 100;
const ACCURACY_THRESHOLD = 0.7;

describe("Simulation", () => {
    const simulation = new Simulation(50, 50, 10, {
        genomeLength: GENOME_LENGTH,
        mutationRate: MUTATION_RATE,
        population: POPULATION,
        selectionRate: SELECTION_RATE
    });

    let generation;
    for (generation = 0; generation < MAX_GENERATIONS; generation++) {
        simulation.run(STEPS_PER_GENERATION);
        if (simulation.accuracy >= ACCURACY_THRESHOLD) {
            break;
        }
    }

    console.log({ generation, accuracy: `${(simulation.accuracy * 100).toFixed(2)}%`, shape: simulation.genepool[0].getShape() });

    const genome = simulation.genepool[0];
    const shape = genome.getShape();
    const { genes } = genome;

    let sourceToOutputConnections = 0;
    let hiddenToOutputConnections = 0;
    let reverseConnections = 0;
    genes.forEach(({ sourceLayer, sinkLayer }) => {
        if (sourceLayer === 0 && sinkLayer === shape.length - 1) {
            sourceToOutputConnections++;
        } else if (sourceLayer === 1 && sinkLayer === shape.length - 1) {
            hiddenToOutputConnections++;
        } else if (sourceLayer > sinkLayer) {
            reverseConnections++;
        }
    });

    console.log({ shape, sourceToOutputConnections, hiddenToOutputConnections, reverseConnections });
    expect(sourceToOutputConnections + hiddenToOutputConnections).toBeGreaterThan(0);
    it(`should have an accuracy greater than ${ACCURACY_THRESHOLD}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(ACCURACY_THRESHOLD);
    });
});
