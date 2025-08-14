import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const MAX_GENERATIONS = 100;
const STEPS_PER_GENERATION = 100;
const POPULATION = 200;
const SELECTION_RATE = 0.1;
const MUTATION_RATE = 0.1;
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

    it(`should have an accuracy greater than ${ACCURACY_THRESHOLD}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(ACCURACY_THRESHOLD);
    });
});
