import { describe, it, expect } from "vitest";
import { Neuron } from "./neuron";

describe("Neuron", () => {
    it("should initialize with a value of 0", () => {
        const neuron = new Neuron();
        expect(neuron.value).toBe(0);
    });

    it("should initialize with an accumulator of 0", () => {
        const neuron = new Neuron();
        expect(neuron.accumulator).toBe(0);
    });
});
