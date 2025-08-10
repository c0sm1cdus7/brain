import { describe, it, expect } from "vitest";
import { Genome } from "./genome.js";

describe("Genome", () => {
    const INPUT_LAYER_LENGTH = 2;
    const HIDDEN_LAYERS = 2;
    const OUTPUT_LAYER_LENGTH = 2;
    const GENOME_LENGTH = 100;

    it("should create a random genome with the correct number of genes and shape", () => {
        const genome = Genome.create({
            inputLayerLength: INPUT_LAYER_LENGTH,
            hiddenLayers: HIDDEN_LAYERS,
            outputLayerLength: OUTPUT_LAYER_LENGTH,
            length: GENOME_LENGTH
        });

        const shape = genome.getShape();
        expect(genome.genes.length).toBe(GENOME_LENGTH);
        expect(shape.length).toBe(HIDDEN_LAYERS + 2);
        expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
        expect(shape[shape.length - 1]).toBe(OUTPUT_LAYER_LENGTH);
    });

    it("should perform crossover and produce a valid offspring genome, with a valid shape", () => {
        const genome1 = Genome.create({ inputLayerLength: INPUT_LAYER_LENGTH, hiddenLayers: 1, outputLayerLength: OUTPUT_LAYER_LENGTH, length: GENOME_LENGTH });
        const genome2 = Genome.create({ inputLayerLength: INPUT_LAYER_LENGTH, hiddenLayers: 1, outputLayerLength: OUTPUT_LAYER_LENGTH, length: GENOME_LENGTH });

        const offspring = Genome.crossover(genome1, genome2, 0);
        expect(offspring.genes.length).toBe(GENOME_LENGTH);
        const shape = offspring.getShape();
        expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
        expect(shape[shape.length - 1]).toBe(OUTPUT_LAYER_LENGTH);
    });
});
