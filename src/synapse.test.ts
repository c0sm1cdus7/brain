import { describe, it, expect } from "vitest";
import { Synapse } from "../src/synapse.js";
import { Neuron } from "./neuron.js";

describe("Synapse", () => {
    it("should be initialized with a source, sink, and weight", () => {
        const sourceNeuron = new Neuron();
        const sinkNeuron = new Neuron();
        const weight = 0.5;

        const synapse = new Synapse(sourceNeuron, sinkNeuron, weight);

        expect(synapse.source).toBe(sourceNeuron);
        expect(synapse.sink).toBe(sinkNeuron);
        expect(synapse.weight).toBe(weight);
    });
});
