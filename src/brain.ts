import { Genome } from "./genome";
import { Neuron, Synapse } from "./neuron";
import { NeuralNetwork, NeuralNetworkShape } from "./types";

export class Brain {
    synapses: Synapse[] = [];
    neuralNetwork: NeuralNetwork = [[], [], []];

    constructor(genome: Genome) {
        const { genes } = genome;

        const shape: NeuralNetworkShape = genome.getNeuralNetworkShape();

        this.neuralNetwork = shape.map((length) => Array.from({ length }, () => new Neuron()));

        genes.forEach((gene) => {
            const sourceNeuron = this.neuralNetwork[gene.sourceLayer][gene.sourceIndex];
            const sinkNeuron = this.neuralNetwork[gene.sinkLayer][gene.sinkIndex];

            this.synapses.push(new Synapse(sourceNeuron, sinkNeuron, gene.weight));
        });

        this.reset();
    }

    reset(): void {
        const hasSourceSynapse = new Set<Neuron>();
        for (const synapse of this.synapses) {
            hasSourceSynapse.add(synapse.sink);
        }

        for (let layer = 0; layer < this.neuralNetwork.length; layer++) {
            this.neuralNetwork[layer].forEach((neuron) => {
                const isBiasNeuron = !hasSourceSynapse.has(neuron);
                neuron.value = isBiasNeuron ? 1 : 0;
                neuron.accumulator = 0;
            });
        }
    }

    feed(input: number[]): number[] {
        for (let i = 0; i < Math.min(input.length, this.neuralNetwork[0].length); i++) {
            this.neuralNetwork[0][i].value = isNaN(input[i]) ? 0 : input[i];
        }

        for (let layer = 1; layer < this.neuralNetwork.length; layer++) {
            this.neuralNetwork[layer].forEach((neuron) => {
                neuron.accumulator = 0;
            });
        }

        for (const synapse of this.synapses) {
            const sourceNeuron = synapse.source;
            const sinkNeuron = synapse.sink;
            sinkNeuron.accumulator += sourceNeuron.value * synapse.weight;
        }

        for (let layer = 1; layer < this.neuralNetwork.length; layer++) {
            this.neuralNetwork[layer].forEach((neuron) => {
                neuron.value = Math.tanh(neuron.accumulator);
            });
        }

        const outputLayer = this.neuralNetwork[this.neuralNetwork.length - 1];
        return outputLayer.map((neuron) => neuron.value);
    }
}
