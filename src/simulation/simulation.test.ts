import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const MAX_GENERATIONS = 1000;
const STEPS_PER_GENERATION = 100;
const POPULATION = 20;
const SELECTION_RATE = 0.2;
const MUTATION_RATE = 0.01;
const GENOME_LENGTH = 100;
const MIN_ACCURACY = 0.7;
const INPUT_LAYER_LENGTH = 24;
const OUTPUT_LAYER_LENGTH = 1;

describe("Simulation", () => {
    const simulation = new Simulation(100, 100, 10, {
        genomeLength: GENOME_LENGTH,
        mutationRate: MUTATION_RATE,
        population: POPULATION,
        selectionRate: SELECTION_RATE,
        inputLayerLength: INPUT_LAYER_LENGTH,
        outputLayerLength: OUTPUT_LAYER_LENGTH
    });

    let generation;
    for (generation = 0; generation < MAX_GENERATIONS; generation++) {
        simulation.run(STEPS_PER_GENERATION);
        if (simulation.accuracy >= MIN_ACCURACY) {
            break;
        }
    }

    const genome = simulation.genepool[0];
    const shape = genome.getShape();
    const { genes } = genome;

    let sourceToOutputConnections = 0;
    let sourceToHiddenConnection = 0;
    let hiddenToHiddenConnections = 0;
    let hiddenToOutputConnections = 0;
    let reverseConnections = 0;
    genes.forEach(({ sourceLayer, sinkLayer }) => {
        if (sourceLayer === 0 && sinkLayer === 2) {
            sourceToOutputConnections++;
        } else if (sourceLayer === 1 && sinkLayer === 2) {
            hiddenToOutputConnections++;
        } else if (sourceLayer === 0 && sinkLayer === 1) {
            sourceToHiddenConnection++;
        } else if (sourceLayer === 1 && sinkLayer === 1) {
            hiddenToHiddenConnections++;
        } else if (sourceLayer > sinkLayer) {
            reverseConnections++;
        }
    });

    console.log({
        generation,
        accuracy: Number(simulation.accuracy.toFixed(2)),
        shape,
        sourceToOutputConnections,
        sourceToHiddenConnection,
        hiddenToHiddenConnections,
        hiddenToOutputConnections,
        reverseConnections,
        genomeLength: genes.length
    });

    expect(shape[0]).toBeLessThanOrEqual(INPUT_LAYER_LENGTH);
    expect(shape[2]).toBeLessThanOrEqual(OUTPUT_LAYER_LENGTH);
    expect(sourceToOutputConnections).toBe(0);
    expect(hiddenToHiddenConnections).toBeGreaterThan(0);
    expect(hiddenToOutputConnections).toBeGreaterThan(0);
    expect(reverseConnections).toBe(0);

    it(`should have an accuracy greater than ${MIN_ACCURACY}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(MIN_ACCURACY);
    });
});
