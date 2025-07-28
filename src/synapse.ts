import { Neuron } from "./neuron.js";

export class Synapse {
    source: Neuron;
    sink: Neuron;
    weight: number;

    constructor(source: Neuron, sink: Neuron, weight: number) {
        this.source = source;
        this.sink = sink;
        this.weight = weight;
    }
}
