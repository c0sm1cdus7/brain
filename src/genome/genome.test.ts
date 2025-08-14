import { describe, it, expect } from "vitest";
import { Genome } from "./genome.js";

describe("Genome", () => {
    const INPUT_LAYER_LENGTH = 10;
    const OUTPUT_LAYER_LENGTH = 2;
    const GENOME_LENGTH = 100;

    it("should create a random genome with the correct number of genes and shape", () => {
        const genome = Genome.create({
            inputLayerLength: INPUT_LAYER_LENGTH,
            outputLayerLength: OUTPUT_LAYER_LENGTH,
            length: GENOME_LENGTH
        });

        const shape = genome.getShape();
        const { genes } = genome;

        let sourceToOutputConnections = 0;
        let hiddenToOutputConnections = 0;
        let reverseConnections = 0;
        genes.forEach(({ sourceLayer, sinkLayer }) => {
            if (sourceLayer === 0 && sinkLayer === shape.length - 1) {
                sourceToOutputConnections++;
            } else if (sourceLayer === 1 && sinkLayer === shape.length - 1) {
                hiddenToOutputConnections++;
            } else if (sourceLayer > sinkLayer) {
                reverseConnections++;
            }
        });

        expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
        expect(shape[2]).toBe(OUTPUT_LAYER_LENGTH);
        expect(sourceToOutputConnections + hiddenToOutputConnections).toBeGreaterThan(0);
        expect(reverseConnections).toBe(0);
    });

    it("should perform crossover and produce a valid offspring genome, with a valid shape", () => {
        const genome1 = Genome.create({ inputLayerLength: INPUT_LAYER_LENGTH, outputLayerLength: OUTPUT_LAYER_LENGTH, length: GENOME_LENGTH });
        const genome2 = Genome.create({ inputLayerLength: INPUT_LAYER_LENGTH, outputLayerLength: OUTPUT_LAYER_LENGTH, length: GENOME_LENGTH });
        const offspring = Genome.crossover(genome1, genome2, 0);
        const shape = offspring.getShape();
        const { genes } = offspring;

        let sourceToOutputConnections = 0;
        let hiddenToOutputConnections = 0;
        let reverseConnections = 0;
        genes.forEach(({ sourceLayer, sinkLayer }) => {
            if (sourceLayer === 0 && sinkLayer === shape.length - 1) {
                sourceToOutputConnections++;
            } else if (sourceLayer === 1 && sinkLayer === shape.length - 1) {
                hiddenToOutputConnections++;
            } else if (sourceLayer > sinkLayer) {
                reverseConnections++;
            }
        });

        expect(sourceToOutputConnections + hiddenToOutputConnections).toBeGreaterThan(0);
        expect(reverseConnections).toBe(0);
    });
});
