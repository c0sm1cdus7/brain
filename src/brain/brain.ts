import { Gene, Genome } from "../genome/genome.js";
import { Neuron } from "../neuron/neuron.js";
import { Synapse } from "../synapse/synapse.js";

export class Brain {
    synapses: Synapse[] = [];
    neurons: Neuron[][];

    constructor(genome: Genome) {
        let { genes, parameters } = genome;

        this.neurons = genome.getNeuralNetworkShape().map((length) => Array.from({ length }, () => new Neuron()));

        const lastLayer = this.neurons.length - 1;
        const active = new Set<string>();

        for (let i = 0; i < this.neurons[lastLayer].length; i++) {
            active.add(`${lastLayer}:${i}`);
        }

        let changed = true;
        while (changed) {
            changed = false;
            for (const gene of genes) {
                const sinkKey = `${gene.sinkLayer}:${gene.sinkIndex}`;
                const sourceKey = `${gene.sourceLayer}:${gene.sourceIndex}`;
                if (active.has(sinkKey) && !active.has(sourceKey)) {
                    active.add(sourceKey);
                    changed = true;
                }
            }
        }

        genes = genes.filter((g) => active.has(`${g.sourceLayer}:${g.sourceIndex}`) && active.has(`${g.sinkLayer}:${g.sinkIndex}`));

        genes.forEach((gene) => {
            const sourceNeuron = this.neurons[gene.sourceLayer][gene.sourceIndex];
            const sinkNeuron = this.neurons[gene.sinkLayer][gene.sinkIndex];
            const synapse = new Synapse(sourceNeuron, sinkNeuron, gene.weight);
            this.synapses.push(synapse);
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

    // feedForward(input: number[]): number[] {
    //     for (let layer = 0; layer < this.neurons.length; layer++) {
    //         for (const neuron of this.neurons[layer]) {
    //             neuron.accumulator = 0;
    //             neuron.value = 0;
    //         }
    //     }

    //     for (let i = 0; i < Math.min(input.length, this.neurons[0].length); i++) {
    //         this.neurons[0][i].value = isNaN(input[i]) ? 0 : input[i];
    //     }

    //     for (let layer = 0; layer < this.neurons.length - 1; layer++) {
    //         for (const neuron of this.neurons[layer]) {
    //             for (const { sink, weight } of neuron.sinks) {
    //                 sink.accumulator += neuron.value * weight;
    //             }
    //         }

    //         for (const neuron of this.neurons[layer + 1]) {
    //             neuron.value = Math.tanh(neuron.accumulator);
    //         }
    //     }

    //     return this.neurons[this.neurons.length - 1].map(({ value }) => value);
    // }

    feed(input: number[]): number[] {
        for (let layer = 0; layer < this.neurons.length; layer++) {
            this.neurons[layer].forEach((neuron) => {
                neuron.value = 0;
                neuron.accumulator = 0;
            });
        }

        for (let i = 0; i < Math.min(input.length, this.neurons[0].length); i++) {
            this.neurons[0][i].value = isNaN(input[i]) ? 0 : input[i];
        }

        for (const synapse of this.synapses) {
            synapse.sink.accumulator += synapse.source.value * synapse.weight;
            synapse.sink.value = Math.tanh(synapse.sink.accumulator);
        }

        return this.neurons[this.neurons.length - 1].map((neuron) => neuron.value);
    }
}
