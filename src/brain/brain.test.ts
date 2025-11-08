// src/brain/brain.test.ts
import { describe, it, expect } from "vitest";
import { Genome } from "../genome/genome.js";
import { Brain } from "./brain.js";

describe("Brain", () => {
    const genome = Genome.create(1000, {
        inputLayerLength: 32,
        hiddenLayers: 2,
        outputLayerLength: 4
    });

    const brain = new Brain(genome);

    it("initializes with correct number of layers and neurons", () => {
        const shape = genome.getNeuralNetworkShape();
        expect(brain.neurons.length).toBe(shape.length);
        expect(brain.neurons[0].length).toBe(shape[0]);
        expect(brain.neurons.at(-1)?.length).toBe(shape.at(-1));
        console.log({ discardedSynapses: brain.discardedSynapses });
    });

    // it("has a synapse for each gene", () => {
    //     expect(brain.synapses.length).toBe(genome.genes.length);
    // });

    it("resets neuron values and accumulators correctly", () => {
        brain.reset();

        const hasSourceSynapse = new Set(brain.synapses.map((s) => s.sink));

        for (const layer of brain.neurons) {
            for (const neuron of layer) {
                const isBias = !hasSourceSynapse.has(neuron);
                expect(neuron.value).toBe(isBias ? 1 : 0);
                expect(neuron.accumulator).toBe(0);
            }
        }
    });

    it("feeds input and produces correct output size", async () => {
        const inputLength = genome.getNeuralNetworkShape()[0];
        const outputLength = genome.getNeuralNetworkShape().at(-1)!;
        const input = Array.from({ length: inputLength }, () => Math.random());

        const output = brain.feed(input);

        expect(output).toBeDefined();
        expect(output.length).toBe(outputLength);
        expect(output.every((v) => typeof v === "number" && !isNaN(v))).toBe(true);
    });
});
