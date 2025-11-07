import { describe, it, expect } from "vitest";
import { Simulation } from "./simulation.js";

const GENERATIONS = 200;
const STEPS_PER_GENERATION = 100;

const GENOME_LENGTH = 100;
const MUTATION_RATE = 0.01;

const MAP_SIZE = 100;
const POPULATION = 40;
const TARGET_ACCURACY = 0.8;
const HIDDEN_LAYERS = 1;
const OUTPUT_LAYER_LENGTH = 2;

describe("Simulation", () => {
    const simulation = new Simulation(MAP_SIZE, {
        genomeLength: GENOME_LENGTH,
        mutationRate: MUTATION_RATE,
        population: POPULATION,
        hiddenLayers: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH
    });

    let generation;
    for (generation = 0; generation < GENERATIONS; generation++) {
        simulation.run(STEPS_PER_GENERATION);
        if (simulation.accuracy >= TARGET_ACCURACY || generation + 1 === GENERATIONS) {
            break;
        }
    }

    const genome = simulation.genepool[0];
    const shape = genome.getNeuralNetworkShape();
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

    genes.forEach(({ sourceLayer, sinkLayer }) => {
        if (sourceLayer === HIDDEN_LAYERS + 1 && sinkLayer === HIDDEN_LAYERS + 1) {
            illegalConnections++;
        }
        if (sourceLayer === 0) {
            sourceConnections++;
        } else if (sinkLayer === HIDDEN_LAYERS + 1) {
            outputConnections++;
        } else {
            hiddenConnections++;
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
        biasNeurons: biasNeurons.length,
        genomeLength: genes.length,
        firstAgentPosition: sortedAgents[0].position,
        lastAgentPosition: sortedAgents[sortedAgents.length - 1].position
    });
    //expect(illegalConnections).toBe(0);
    it(`should have an accuracy greater than ${TARGET_ACCURACY}`, () => {
        expect(simulation.accuracy).toBeGreaterThanOrEqual(TARGET_ACCURACY);
    });
});
