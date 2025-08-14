import { describe, it, expect } from "vitest";
import { Genome } from "./genome.js";

describe("Genome", () => {
    const INPUT_LAYER_LENGTH = 1000;
    const HIDDEN_LAYERS = 3;
    const OUTPUT_LAYER_LENGTH = 2;
    const GENOME_LENGTH = 1000;

    it("should create a random genome with the correct number of genes and shape", () => {
        const genome = Genome.create({
            inputLayerLength: INPUT_LAYER_LENGTH,
            hiddenLayers: HIDDEN_LAYERS,
            outputLayerLength: OUTPUT_LAYER_LENGTH,
            length: GENOME_LENGTH
        });

        const shape = genome.getShape();
        console.log("Original", { shape });
        expect(genome.genes.length).toBe(GENOME_LENGTH);
        expect(shape.length - 2).toBe(HIDDEN_LAYERS);
        expect(shape[0]).greaterThan(0);
        expect(shape[0]).lessThanOrEqual(INPUT_LAYER_LENGTH);
        expect(shape[shape.length - 1]).greaterThan(0);
        expect(shape[shape.length - 1]).lessThanOrEqual(OUTPUT_LAYER_LENGTH);

        const { genes } = genome;

        let outputConnections = 0;
        genes.forEach(({ sourceLayer, sinkFlow }) => {
            let sinkLayer = sourceLayer + sinkFlow;
            if (sinkLayer === shape.length - 1) {
                outputConnections++;
            }
        });

        console.log("Output connections", outputConnections);

        expect(outputConnections).greaterThan(0);
    });

    it("should perform crossover and produce a valid offspring genome, with a valid shape", () => {
        const genome1 = Genome.create({ inputLayerLength: INPUT_LAYER_LENGTH, hiddenLayers: HIDDEN_LAYERS, outputLayerLength: OUTPUT_LAYER_LENGTH, length: GENOME_LENGTH });
        console.log("Parent", genome1.getShape());
        const genome2 = Genome.create({ inputLayerLength: INPUT_LAYER_LENGTH, hiddenLayers: HIDDEN_LAYERS, outputLayerLength: OUTPUT_LAYER_LENGTH, length: GENOME_LENGTH });
        console.log("Partner", genome2.getShape());
        const offspring = Genome.crossover(genome1, genome2, 0.01);
        expect(offspring.genes.length).toBe(GENOME_LENGTH);
        const shape = offspring.getShape();
        console.log("Offspring ", shape);
        expect(shape.length).greaterThanOrEqual(2);
        expect(shape[0]).toBeLessThanOrEqual(INPUT_LAYER_LENGTH);
        expect(shape[shape.length - 1]).toBeLessThanOrEqual(OUTPUT_LAYER_LENGTH);

        const { genes } = offspring;

        let outputConnections = 0;
        genes.forEach(({ sourceLayer, sinkFlow }) => {
            let sinkLayer = sourceLayer + sinkFlow;
            if (sinkLayer === shape.length - 1) {
                outputConnections++;
            }
        });

        console.log("Output connections", outputConnections);

        expect(outputConnections).greaterThan(0);
    });
});
