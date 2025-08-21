import { describe, it, expect } from "vitest";
import { Gene, Genome } from "./genome.js";

describe("Genome", () => {
    const INPUT_LAYER_LENGTH = 10;
    const OUTPUT_LAYER_LENGTH = 2;
    const GENOME_LENGTH = 100;
    const HIDDEN_LAYERS = 3;
    const REVERSE_SYNAPSES = true;

    it("should create a random genome with a proper shape", () => {
        const genome = Genome.create({
            inputLayerLength: INPUT_LAYER_LENGTH,
            hiddenLayers: HIDDEN_LAYERS,
            outputLayerLength: OUTPUT_LAYER_LENGTH,
            maxLength: GENOME_LENGTH,
            reverseSynapses: REVERSE_SYNAPSES
        });

        const shape = genome.getShape();
        const { genes } = genome;

        let sourceToOutputConnections = 0;
        let sourceToHiddenConnection = 0;
        let hiddenToHiddenConnections = 0;
        let hiddenToOutputConnections = 0;
        let reverseConnections = 0;

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
                reverseConnections++;
            }
        });

        console.log({
            shape,
            sourceToOutputConnections,
            sourceToHiddenConnection,
            hiddenToHiddenConnections,
            hiddenToOutputConnections,
            reverseConnections,
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
            expect(reverseConnections).toBe(0);
        } else {
            expect(reverseConnections).toBeGreaterThan(0);
        }
    });

    it("should perform crossover and produce valid offsprings, with a valid shape", () => {
        let sourceToOutputConnections = 0;
        let sourceToHiddenConnection = 0;
        let hiddenToHiddenConnections = 0;
        let hiddenToOutputConnections = 0;
        let reverseConnections = 0;
        let shape: number[] = [0, 0, 0];
        let genes: Gene[] = [];
        let biasNeurons: number[] = [];
        for (let attempts = 0; attempts < 100; attempts++) {
            const genome1 = Genome.create({
                inputLayerLength: INPUT_LAYER_LENGTH,
                hiddenLayers: HIDDEN_LAYERS,
                outputLayerLength: OUTPUT_LAYER_LENGTH,
                maxLength: GENOME_LENGTH,
                reverseSynapses: !REVERSE_SYNAPSES
            });
            const genome2 = Genome.create({
                inputLayerLength: INPUT_LAYER_LENGTH,
                hiddenLayers: HIDDEN_LAYERS,
                outputLayerLength: OUTPUT_LAYER_LENGTH,
                maxLength: GENOME_LENGTH,
                reverseSynapses: !REVERSE_SYNAPSES
            });
            const offspring = Genome.crossover(genome1, genome2, 1);
            shape = offspring.getShape();
            genes = offspring.genes;

            sourceToOutputConnections = 0;
            sourceToHiddenConnection = 0;
            hiddenToHiddenConnections = 0;
            hiddenToOutputConnections = 0;
            reverseConnections = 0;

            const hiddenLayerLength = shape[1];
            const hasSource = new Set<number>();

            for (const gene of genes) {
                if (gene.sinkLayer === 1) {
                    hasSource.add(gene.sinkIndex);
                }
            }

            biasNeurons = [];
            for (let i = 0; i < hiddenLayerLength; i++) {
                if (!hasSource.has(i)) {
                    biasNeurons.push(i);
                }
            }

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
                    reverseConnections++;
                }
            });
        }

        console.log({
            shape,
            sourceToOutputConnections,
            sourceToHiddenConnection,
            hiddenToHiddenConnections,
            hiddenToOutputConnections,
            reverseConnections,
            biasNeurons: biasNeurons.length,
            genomeLength: genes.length
        });

        expect(shape[0]).toBeLessThanOrEqual(INPUT_LAYER_LENGTH);
        expect(shape.length).toBe(HIDDEN_LAYERS + 2);
        expect(shape[HIDDEN_LAYERS + 1]).toBeLessThanOrEqual(OUTPUT_LAYER_LENGTH);
        expect(sourceToOutputConnections).toBe(0);
        expect(hiddenToHiddenConnections).toBeGreaterThan(0);
        expect(hiddenToOutputConnections).toBeGreaterThan(0);
        if (!!REVERSE_SYNAPSES) expect(reverseConnections).toBe(0);
    });
});
