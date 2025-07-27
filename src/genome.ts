import { NeuralNetworkShape } from "./types";
import { randomInteger, randomNumber } from "./utils";

export class Gene {
    sourceLayer: number;
    sourceIndex: number;
    sinkLayer: number;
    sinkIndex: number;
    weight: number;

    constructor(sourceLayer: number, sourceIndex: number, sinkLayer: number, sinkIndex: number, weight: number) {
        this.sourceLayer = sourceLayer;
        this.sourceIndex = sourceIndex;
        this.sinkLayer = sinkLayer;
        this.sinkIndex = sinkIndex;
        this.weight = weight;
    }

    static random(neuralNetworkShape: [number, number, number]): Gene {
        const sourceLayer = randomInteger(0, 1);
        const sourceIndex = randomInteger(0, neuralNetworkShape[sourceLayer]);
        const sinkLayer = randomInteger(1, 2);
        const sinkIndex = randomInteger(0, neuralNetworkShape[sinkLayer]);
        const weight = randomNumber(-1, 1);
        return new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight);
    }
}

export class Genome {
    genes: Gene[] = [];

    constructor(genes: Gene[]) {
        this.genes = genes;
    }

    static random(neuralNetworkShape: [number, number, number], length: number): Genome {
        const genes: Gene[] = [];
        for (let i = 0; i < length; i++) {
            genes.push(Gene.random(neuralNetworkShape));
        }
        return new Genome(genes);
    }

    getNeuralNetworkShape(): NeuralNetworkShape {
        const neuralNetworkShape: NeuralNetworkShape = [0, 0, 0];

        this.genes.forEach((gene) => {
            neuralNetworkShape[gene.sourceLayer] = Math.max(neuralNetworkShape[gene.sourceLayer], gene.sourceIndex + 1);
            neuralNetworkShape[gene.sinkLayer] = Math.max(neuralNetworkShape[gene.sinkLayer], gene.sinkIndex + 1);
        });

        return neuralNetworkShape;
    }

    static crossover(genome1: Genome, genome2: Genome, mutationRate: number = 0): Genome {
        const length = Math.max(genome1.genes.length, genome2.genes.length);

        const neuralNetworkShape: NeuralNetworkShape = [
            Math.max(genome1.getNeuralNetworkShape()[0], genome2.getNeuralNetworkShape()[0]),
            Math.max(genome1.getNeuralNetworkShape()[1], genome2.getNeuralNetworkShape()[1]),
            Math.max(genome1.getNeuralNetworkShape()[2], genome2.getNeuralNetworkShape()[2])
        ];

        const genes: Gene[] = [];

        for (let i = 0; i < length; i++) {
            if (i < genome1.genes.length && i < genome2.genes.length) {
                genes.push(Math.random() < 0.5 ? genome1.genes[i] : genome2.genes[i]);
            } else if (i < genome1.genes.length) {
                genes.push(genome1.genes[i]);
            } else if (i < genome2.genes.length) {
                genes.push(genome2.genes[i]);
            }
        }

        genes.forEach((gene) => {
            if (Math.random() < mutationRate) {
                switch (randomInteger(0, 2)) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        gene.weight = Math.max(-1, Math.min(1, gene.weight));
                        break;
                    case 1:
                        gene.sourceLayer = randomInteger(0, 1);
                        gene.sourceIndex = randomInteger(0, gene.sourceLayer === 1 ? neuralNetworkShape[1] + 1 : neuralNetworkShape[gene.sourceLayer]);
                        break;
                    case 2:
                        gene.sinkLayer = randomInteger(1, 2);
                        gene.sinkIndex = randomInteger(0, gene.sinkLayer === 1 ? neuralNetworkShape[1] + 1 : neuralNetworkShape[gene.sinkLayer]);
                        break;
                }
            }
        });

        return new Genome(genes);
    }
}
