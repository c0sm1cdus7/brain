import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const GENERATIONS = 100;
const GENOME_LENGTH = 100;
const MUTATION_RATE = 0.001;
const POPULATION = 50;
const STEPS = 100;
const TARGET_ACCURACY = 0.8;
const HIDDEN_LAYERS = 1;
const OUTPUT_LAYER_LENGTH = 2;
const REVERSE_SYNAPSES = false;

describe("Simulation", () => {
    const simulation = new Simulation(100, 20, {
        genomeLength: GENOME_LENGTH,
        mutationRate: MUTATION_RATE,
        population: POPULATION,
        hiddenLayers: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH,
        reverseSynapses: REVERSE_SYNAPSES
    });

    let generation;
    for (generation = 0; generation < GENERATIONS; generation++) {
        simulation.run(STEPS);
        if (simulation.accuracy >= TARGET_ACCURACY) {
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

    const sortedAgents = simulation.map.agents.sort((a, b) => b.position.x - a.position.x).sort((a, b) => b.position.y - a.position.y);

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
        genomeLength: genes.length,
        firstAgent: sortedAgents[0].position,
        lastAgent: sortedAgents[sortedAgents.length - 1].position
    });
    expect(illegalConnections).toBe(0);
    if (REVERSE_SYNAPSES) {
        expect(reverseSynapses).toBeGreaterThan(0);
    } else {
        expect(reverseSynapses).toBe(0);
    }
    it(`should have an accuracy greater than ${TARGET_ACCURACY}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(TARGET_ACCURACY);
    });
});
