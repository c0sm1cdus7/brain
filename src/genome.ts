import { Shape } from "./brain.js";
import { randomInteger, randomNumber } from "./utils.js";

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

    static random(shape: [number, number, number]): Gene {
        const shapeMaxIndexes = [shape[0] - 1, shape[1], shape[2] - 1];
        const sourceLayer = randomInteger(0, 1);
        const sourceIndex = randomInteger(0, shapeMaxIndexes[sourceLayer]);
        const sinkLayer = randomInteger(1, sourceLayer === 0 ? 1 : 2);
        const sinkIndex = randomInteger(0, shapeMaxIndexes[sinkLayer]);
        const weight = randomNumber(-1, 1);
        return new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight);
    }
}

export class Genome {
    genes: Gene[] = [];

    constructor(genes: Gene[]) {
        this.genes = genes;
    }

    static random({
        inputLayerLength,
        hiddenLayerLength,
        outputLayerLength,
        length
    }: {
        inputLayerLength: number | null;
        hiddenLayerLength: number | null;
        outputLayerLength: number | null;
        length: number;
    }): Genome {
        const genes: Gene[] = [];

        for (let i = 0; i < length; i++) {
            if (inputLayerLength || hiddenLayerLength || outputLayerLength) {
                const currentShape = new Genome(genes).getShape();
                if (inputLayerLength) inputLayerLength = currentShape[0];
                if (hiddenLayerLength) hiddenLayerLength = currentShape[1];
                if (outputLayerLength) outputLayerLength = currentShape[2];
            }
            genes.push(Gene.random([inputLayerLength, hiddenLayerLength, outputLayerLength] as Shape));
        }

        return new Genome(genes);
    }

    getShape(): Shape {
        const shape: Shape = [0, 0, 0];

        this.genes.forEach((gene) => {
            shape[gene.sourceLayer] = Math.max(shape[gene.sourceLayer], gene.sourceIndex + 1);
            shape[gene.sinkLayer] = Math.max(shape[gene.sinkLayer], gene.sinkIndex + 1);
        });

        return shape;
    }

    static crossover(genome1: Genome, genome2: Genome, mutationRate: number = 0): Genome {
        const length = Math.max(genome1.genes.length, genome2.genes.length);

        const shapeMaxIndexes: Shape = [
            Math.max(genome1.getShape()[0], genome2.getShape()[0]) - 1,
            Math.max(genome1.getShape()[1], genome2.getShape()[1]),
            Math.max(genome1.getShape()[2], genome2.getShape()[2]) - 1
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
                        gene.sourceIndex = randomInteger(0, shapeMaxIndexes[gene.sourceLayer]);
                        break;
                    case 2:
                        gene.sinkLayer = randomInteger(1, gene.sourceLayer === 0 ? 1 : 2);
                        gene.sinkIndex = randomInteger(0, shapeMaxIndexes[gene.sinkLayer]);
                        break;
                }
            }
        });

        return new Genome(genes);
    }
}
