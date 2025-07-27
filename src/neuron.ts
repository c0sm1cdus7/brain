export class Neuron {
    accumulator: number = 0;
    value: number = 0;

    constructor() {
        this.value = 0;
        this.accumulator = 0;
    }
}

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
