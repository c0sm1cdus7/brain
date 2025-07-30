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

    static random(shape: number[]): Gene {
        if (shape.length < 3) shape = [1, 1, 1];

        const addHiddenLayer = (): number => {
            const newHiddenLayerIndex = shape.length - 1;
            shape.splice(newHiddenLayerIndex, 0, 1);
            return newHiddenLayerIndex;
        };

        const getLayerMaxIndex = (layer: number) => (layer === 0 || layer === shape.length - 1 ? shape[layer] - 1 : shape[layer]);

        let sourceLayer = randomInteger(0, shape.length - 1);
        if (sourceLayer === shape.length - 1) {
            sourceLayer = addHiddenLayer();
        }
        const sourceIndex = randomInteger(0, getLayerMaxIndex(sourceLayer));

        let sinkLayer = randomInteger(sourceLayer === 0 ? 1 : sourceLayer, shape.length);
        if (shape[sinkLayer] === undefined) {
            sinkLayer = addHiddenLayer();
        }
        const sinkIndex = randomInteger(0, getLayerMaxIndex(sinkLayer));

        const weight = randomNumber(-1, 1);

        return new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight);
    }
}

export class Genome {
    genes: Gene[] = [];

    constructor(genes: Gene[]) {
        this.genes = genes;
    }

    static random(inputLayerLength: number, outputLayerLength: number, length: number): Genome {
        const genes: Gene[] = [];

        for (let i = 0; i < length; i++) {
            let shape = Genome.getShape(genes);
            shape[0] = inputLayerLength;
            shape[shape.length - 1] = outputLayerLength;
            genes.push(Gene.random(shape));
        }

        return new Genome(genes);
    }

    static getShape(genes: Gene[]): number[] {
        const maxLayerIndex = Math.max(...genes.flatMap((gene) => [gene.sourceLayer, gene.sinkLayer]));
        const shape: number[] = Array(maxLayerIndex + 1).fill(0);

        genes.forEach((gene) => {
            shape[gene.sourceLayer] = Math.max(shape[gene.sourceLayer], gene.sourceIndex + 1);
            shape[gene.sinkLayer] = Math.max(shape[gene.sinkLayer], gene.sinkIndex + 1);
        });

        return shape;
    }

    static crossover(genome1: Genome, genome2: Genome, mutationRate: number = 0): Genome {
        const length = Math.max(genome1.genes.length, genome2.genes.length);

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

        let shape = this.getShape(genes);

        const addHiddenLayer = (): number => {
            const newHiddenLayerIndex = shape.length - 1;
            shape.splice(newHiddenLayerIndex, 0, 1);

            for (const gene of genes) {
                if (gene.sinkLayer === newHiddenLayerIndex) gene.sinkLayer += 1;
                if (gene.sourceLayer === newHiddenLayerIndex) gene.sourceLayer += 1;
            }

            return newHiddenLayerIndex;
        };

        const getLayerMaxIndex = (layer: number) => Math.max(0, layer === 0 || layer === shape.length - 1 ? shape[layer] - 1 : shape[layer]);

        genes.forEach((gene) => {
            if (Math.random() < mutationRate) {
                switch (randomInteger(0, 2)) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        gene.weight = Math.max(-1, Math.min(1, gene.weight));
                        break;
                    case 1:
                        gene.sourceLayer = randomInteger(0, shape.length - 1);
                        if (gene.sourceLayer === shape.length - 1) {
                            gene.sourceLayer = addHiddenLayer();
                        }
                        gene.sourceIndex = randomInteger(gene.sourceLayer, getLayerMaxIndex(gene.sourceLayer));
                        break;
                    case 2:
                        gene.sinkLayer = randomInteger(gene.sourceLayer === 0 ? 1 : gene.sourceLayer, shape.length);
                        if (shape[gene.sinkLayer] === undefined) {
                            gene.sinkLayer = addHiddenLayer();
                        }
                        gene.sinkIndex = randomInteger(0, getLayerMaxIndex(gene.sinkLayer));
                        break;
                }
            }
        });

        return new Genome(genes);
    }
}
