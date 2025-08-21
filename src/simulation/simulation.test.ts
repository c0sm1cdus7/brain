import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const MAX_GENERATIONS = 10000;
const STEPS_PER_GENERATION = 100;
const POPULATION = 20;
const SELECTION_RATE = 0.5;
const MUTATION_RATE = 0.1;
const GENOME_LENGTH = 50;
const MIN_ACCURACY = 0.8;
const INPUT_LAYER_LENGTH = 24;
const HIDDEN_LAYERS = 3;
const OUTPUT_LAYER_LENGTH = 2;
const REVERSE_SYNAPSES = true;

describe("Simulation", () => {
    const simulation = new Simulation(100, 100, 30, {
        genomeLength: GENOME_LENGTH,
        mutationRate: MUTATION_RATE,
        population: POPULATION,
        selectionRate: SELECTION_RATE,
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

    let sourceToOutputConnections = 0;
    let sourceToHiddenConnection = 0;
    let hiddenToHiddenConnections = 0;
    let hiddenToOutputConnections = 0;
    let reverseSynapses = 0;

    genes.forEach(({ sourceLayer, sinkLayer }) => {
        if (sourceLayer === 0 && sinkLayer === HIDDEN_LAYERS + 1) {
            sourceToOutputConnections++;
        } else if (sourceLayer > 0 && sinkLayer === HIDDEN_LAYERS + 1) {
            hiddenToOutputConnections++;
        } else if (sourceLayer === 0 && sinkLayer === 1) {
            sourceToHiddenConnection++;
        } else if (sourceLayer > 0 && sinkLayer < HIDDEN_LAYERS + 1) {
            hiddenToHiddenConnections++;
        }
        if (sourceLayer > sinkLayer) {
            reverseSynapses++;
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
        reverseSynapses,
        biasNeurons: biasNeurons.length,
        genomeLength: genes.length
    });

    expect(shape[0]).toBeLessThanOrEqual(INPUT_LAYER_LENGTH);
    expect(shape.length).toBe(HIDDEN_LAYERS + 2);
    expect(shape[HIDDEN_LAYERS + 1]).toBeLessThanOrEqual(OUTPUT_LAYER_LENGTH);
    expect(sourceToOutputConnections).toBe(0);
    expect(hiddenToHiddenConnections).toBeGreaterThan(0);
    expect(hiddenToOutputConnections).toBeGreaterThan(0);
    if (!REVERSE_SYNAPSES) {
        expect(reverseSynapses).toBe(0);
    } else {
        expect(reverseSynapses).toBeGreaterThan(0);
    }
    it(`should have an accuracy greater than ${MIN_ACCURACY}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(MIN_ACCURACY);
    });
});
