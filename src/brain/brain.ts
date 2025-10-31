import { Genome } from "../genome/genome.js";
import { Neuron } from "../neuron/neuron.js";
import { Synapse } from "../synapse/synapse.js";

export class Brain {
    synapses: Synapse[] = [];
    neurons: Neuron[][];

    constructor(genome: Genome) {
        const { genes } = genome;

        this.neurons = genome.getShape().map((length) => Array.from({ length }, () => new Neuron()));

        genes.forEach((gene) => {
            const sourceNeuron = this.neurons[gene.sourceLayer][gene.sourceIndex];
            const sinkNeuron = this.neurons[gene.sinkLayer][gene.sinkIndex];
            this.synapses.push(new Synapse(sourceNeuron, sinkNeuron, gene.weight));
        });

        this.reset();
    }

    reset(): void {
        const hasSourceSynapse = new Set<Neuron>();
        for (const synapse of this.synapses) {
            hasSourceSynapse.add(synapse.sink);
        }

        for (let layer = 0; layer < this.neurons.length; layer++) {
            this.neurons[layer].forEach((neuron) => {
                const isBiasNeuron = !hasSourceSynapse.has(neuron);
                neuron.value = isBiasNeuron ? 1 : 0;
                neuron.accumulator = 0;
            });
        }
    }

    feed(input: number[]): number[] {
        for (let i = 0; i < Math.min(input.length, this.neurons[0].length); i++) {
            this.neurons[0][i].value = isNaN(input[i]) ? 0 : input[i];
        }

        for (let layer = 1; layer < this.neurons.length; layer++) {
            this.neurons[layer].forEach((neuron) => {
                neuron.accumulator = 0;
            });
        }

        for (const synapse of this.synapses) {
            synapse.sink.accumulator += synapse.source.value * synapse.weight;
            synapse.sink.value = Math.tanh(synapse.sink.accumulator);
        }

        return this.neurons[this.neurons.length - 1].map((neuron) => neuron.value);
    }
}
