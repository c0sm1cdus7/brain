import { describe, it, expect } from "vitest";
import { Genome } from "../genome/genome.js";
import { Brain } from "./brain.js";

const POPULATION = 100;
const SELECTION_RATE = 0.1;
const INPUT_LAYER_LENGTH = 1000;
const HIDDEN_LAYERS = 3;
const OUTPUT_LAYER_LENGTH = 2;
const GENOME_LENGTH = 1000;

describe("Brain", () => {
    /*const genome = Genome.create({
        inputLayerLength: INPUT_LAYER_LENGTH,
        hiddenLayerLength: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH,
        length: GENOME_LENGTH
    });*/
    const genome = Genome.create({
        inputLayerLength: INPUT_LAYER_LENGTH,
        hiddenLayers: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH,
        maxLength: GENOME_LENGTH
    });

    const brain = new Brain(genome);

    /*it("should be initialized with the correct number of layers and neurons", () => {
        const shape = genome.getShape();
        expect(brain.neurons.length).toBe(shape.length);
        expect(brain.neurons[0].length).toBe(shape[0]);
        expect(brain.neurons[brain.neurons.length - 1].length).toBe(shape[shape.length - 1]);
    });*/

    it("should have a synapse for each gene", () => {
        expect(brain.synapses.length).toBe(genome.genes.length);
    });

    it("should reset neuron values and accumulators", () => {
        const input = Array.from({ length: INPUT_LAYER_LENGTH }, () => Math.random());
        brain.feed(input);
        brain.reset();

        const hasSourceSynapse = new Set();
        for (const synapse of brain.synapses) {
            hasSourceSynapse.add(synapse.sink);
        }

        for (const layer of brain.neurons) {
            for (const neuron of layer) {
                const isBiasNeuron = !hasSourceSynapse.has(neuron);
                if (isBiasNeuron) {
                    expect(neuron.value).toBe(1);
                } else {
                    expect(neuron.value).toBe(0);
                }
                expect(neuron.accumulator).toBe(0);
            }
        }
    });

    it("should feed input and produce an output of the correct size", () => {
        const input = Array.from({ length: INPUT_LAYER_LENGTH }, () => Math.random());
        const output = brain.feed(input);

        expect(output).toBeDefined();
        expect(output.length).toBe(OUTPUT_LAYER_LENGTH);
        expect(output.every((val) => typeof val === "number")).toBe(true);
    });
});
