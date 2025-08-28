import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const MAX_GENERATIONS = 100;
const STEPS_PER_GENERATION = 50;
const POPULATION = 50;
const TARGET_SIZE = 0.4;
const MUTATION_RATE = 0.001;
const GENOME_LENGTH = 100;
const MIN_ACCURACY = 0.8;
const EYESIGHT = 1;
const HIDDEN_LAYERS = 1;
const OUTPUT_LAYER_LENGTH = 2;
const REVERSE_SYNAPSES = true;

describe("Simulation", () => {
    const INPUT_LAYER_LENGTH = 3 + 4 * EYESIGHT * (EYESIGHT + 1);

    const simulation = new Simulation(50, 50, 1, 5, {
        genomeLength: GENOME_LENGTH,
        mutationRate: MUTATION_RATE,
        population: POPULATION,
        targetSize: TARGET_SIZE,
        inputLayerLength: INPUT_LAYER_LENGTH,
        hiddenLayers: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH,
        reverseSynapses: REVERSE_SYNAPSES
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

    const hiddenLayerLength = shape[1];
    const hasSource = new Set<number>();

    for (const gene of genes) {
        if (gene.sinkLayer === 1) {
            hasSource.add(gene.sinkIndex);
        }
    }

    const biasNeurons: number[] = [];
    for (let i = 0; i < hiddenLayerLength; i++) {
        if (!hasSource.has(i)) {
            biasNeurons.push(i);
        }
    }

    let illegalConnections = 0;
    let sourceConnections = 0;
    let hiddenConnections = 0;
    let outputConnections = 0;
    let reverseSynapses = 0;

    genes.forEach(({ sourceLayer, sinkLayer }) => {
        if ((sourceLayer === 0 || sourceLayer === HIDDEN_LAYERS + 1) && sinkLayer === sourceLayer) {
            illegalConnections++;
        }
        if (sourceLayer === 0) {
            sourceConnections++;
        } else if (sinkLayer === HIDDEN_LAYERS + 1) {
            outputConnections++;
        } else {
            hiddenConnections++;
        }
        if (sourceLayer > sinkLayer) {
            reverseSynapses++;
        }
    });

    console.log({
        generation,
        accuraccy: Number(simulation.accuracy.toFixed(2)),
        shape,
        illegalConnections,
        sourceConnections,
        hiddenConnections,
        outputConnections,
        reverseSynapses,
        biasNeurons: biasNeurons.length,
        genomeLength: genes.length
    });

    expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
    expect(shape.length).toBe(HIDDEN_LAYERS + 2);
    expect(shape[HIDDEN_LAYERS + 1]).toBe(OUTPUT_LAYER_LENGTH);
    expect(illegalConnections).toBe(0);
    if (REVERSE_SYNAPSES) {
        expect(reverseSynapses).toBeGreaterThan(0);
    } else {
        expect(reverseSynapses).toBe(0);
    }
    it(`should have an accuracy greater than ${MIN_ACCURACY}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(MIN_ACCURACY);
    });
});
