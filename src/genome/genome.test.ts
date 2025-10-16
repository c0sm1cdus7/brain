import { describe, it, expect } from "vitest";
import { Gene, Genome } from "./genome.js";

describe("Genome", () => {
    const INPUT_LAYER_LENGTH = 10;
    const OUTPUT_LAYER_LENGTH = 2;
    const GENOME_LENGTH = 100;
    const HIDDEN_LAYERS = 3;

    it("should create a random genome with a proper shape", () => {
        const genome = Genome.create({
            inputLayerLength: INPUT_LAYER_LENGTH,
            hiddenLayers: HIDDEN_LAYERS,
            outputLayerLength: OUTPUT_LAYER_LENGTH,
            maxLength: GENOME_LENGTH
        });

        const shape = genome.getShape();
        const { genes } = genome;

        let illegalConnections = 0;
        let sourceConnections = 0;
        let hiddenConnections = 0;
        let outputConnections = 0;

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
        });

        console.log({
            shape,
            illegalConnections,
            sourceConnections,
            hiddenConnections,
            outputConnections,
            biasNeurons: biasNeurons.length,
            genomeLength: genes.length
        });

        expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
        expect(shape.length).toBe(HIDDEN_LAYERS + 2);
        expect(shape[HIDDEN_LAYERS + 1]).toBe(OUTPUT_LAYER_LENGTH);
        //expect(illegalConnections).toBe(0);
        expect(sourceConnections).toBeGreaterThan(0);
        expect(hiddenConnections).toBeGreaterThan(0);
        expect(outputConnections).toBeGreaterThan(0);
    });

    it("should perform crossover and produce valid offsprings, with a valid shape", () => {
        let illegalConnections = 0;
        let sourceConnections = 0;
        let hiddenConnections = 0;
        let outputConnections = 0;

        let shape: number[] = [0, 0, 0];
        let genes: Gene[] = [];
        let biasNeurons: number[] = [];

        for (let attempts = 0; attempts < 100; attempts++) {
            const genome1 = Genome.create({
                inputLayerLength: INPUT_LAYER_LENGTH,
                hiddenLayers: HIDDEN_LAYERS,
                outputLayerLength: OUTPUT_LAYER_LENGTH,
                maxLength: GENOME_LENGTH
            });
            const genome2 = Genome.create({
                inputLayerLength: INPUT_LAYER_LENGTH,
                hiddenLayers: HIDDEN_LAYERS,
                outputLayerLength: OUTPUT_LAYER_LENGTH,
                maxLength: GENOME_LENGTH
            });
            const offspring = Genome.crossover(genome1, genome2, 1);
            shape = offspring.getShape();
            genes = offspring.genes;

            illegalConnections = 0;
            sourceConnections = 0;
            hiddenConnections = 0;
            outputConnections = 0;

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
        }

        console.log({
            shape,
            illegalConnections,
            sourceConnections,
            hiddenConnections,
            outputConnections,
            biasNeurons: biasNeurons.length,
            genomeLength: genes.length
        });

        expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
        expect(shape.length).toBe(HIDDEN_LAYERS + 2);
        expect(shape[HIDDEN_LAYERS + 1]).toBe(OUTPUT_LAYER_LENGTH);
        //expect(illegalConnections).toBe(0);
        expect(sourceConnections).toBeGreaterThan(0);
        expect(hiddenConnections).toBeGreaterThan(0);
        expect(outputConnections).toBeGreaterThan(0);
    });
});
