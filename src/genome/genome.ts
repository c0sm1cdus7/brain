import { randomInt } from "crypto";

function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function randomInteger(min: number, max: number): number {
    return randomInt(min, max + 1);
}

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
}

export class Genome {
    genes: Gene[] = [];

    constructor(genes: Gene[]) {
        this.genes = genes;
    }

    static create({ inputLayerLength, hiddenLayers, outputLayerLength, length }: { inputLayerLength: number; hiddenLayers: number; outputLayerLength: number; length: number }): Genome {
        const genes: Gene[] = [];
        for (let i = 0; i < length; i++) {
            const shape = new Genome(genes).getShape();

            let sourceLayer = randomInteger(0, hiddenLayers);
            let sourceIndex;
            if (sourceLayer === 0) {
                sourceIndex = randomInteger(0, inputLayerLength - 1);
            } else {
                sourceIndex = randomInteger(0, shape[sourceLayer] ?? 1);
            }

            let sinkLayer = randomInteger(sourceLayer === 0 ? 1 : sourceLayer, hiddenLayers + 1);
            let sinkIndex;
            if (sinkLayer === hiddenLayers + 1) {
                sinkLayer = -1;
                sinkIndex = randomInteger(0, outputLayerLength - 1);
            } else {
                sinkIndex = randomInteger(0, shape[sinkLayer] ?? 1);
            }

            const weight = Math.random() * 2 - 1;
            genes.push(new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight));
        }
        return new Genome(genes);
    }

    getShape(): number[] {
        let maxLayerIndex = 0;
        for (const gene of this.genes) {
            if (gene.sourceLayer > maxLayerIndex) maxLayerIndex = gene.sourceLayer;
            if (gene.sinkLayer > maxLayerIndex) maxLayerIndex = gene.sinkLayer;
        }
        const shape: number[] = new Array(maxLayerIndex + 2).fill(0);
        for (const { sourceLayer, sourceIndex, sinkLayer, sinkIndex } of this.genes) {
            shape[sourceLayer] = Math.max(shape[sourceLayer], sourceIndex + 1);
            if (sinkLayer === -1) {
                shape[shape.length - 1] = Math.max(shape[shape.length - 1], sinkIndex + 1);
            } else {
                shape[sinkLayer] = Math.max(shape[sinkLayer], sinkIndex + 1);
            }
        }
        return shape;
    }

    static crossover(genome1: Genome, genome2: Genome, mutationRate: number = 0): Genome {
        const length = Math.max(genome1.genes.length, genome2.genes.length);

        const genome1Shape = genome1.getShape();
        const genome2Shape = genome2.getShape();
        const inputLayerLength = Math.max(genome1Shape[0], genome2Shape[0]);
        const outputLayerLength = Math.max(genome1Shape[genome1Shape.length - 1], genome2Shape[genome2Shape.length - 1]);

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

        for (const gene of genes) {
            if (Math.random() < mutationRate) {
                const shape = new Genome(genes).getShape();
                switch (randomInteger(0, 4)) {
                    case 0:
                        gene.weight += randomNumber(-0.001, 0.001);
                        gene.weight = Math.max(-1, Math.min(1, gene.weight));
                        break;
                    case 1:
                        const sourceLayerMaxIndex = gene.sourceLayer === 0 ? inputLayerLength - 1 : shape[gene.sourceLayer];
                        gene.sourceIndex = randomInteger(0, sourceLayerMaxIndex);
                        break;
                    case 2:
                        let sourceLayer = randomInteger(0, shape.length - 2);
                        let sourceIndex;
                        if (gene.sourceLayer === 0) {
                            sourceIndex = randomInteger(0, inputLayerLength - 1);
                        } else {
                            sourceIndex = randomInteger(0, shape[sourceLayer]);
                        }
                        gene.sourceLayer = sourceLayer;
                        gene.sourceIndex = sourceIndex;
                        break;
                    case 3:
                        const sinkLayerMaxIndex = gene.sinkLayer === -1 ? outputLayerLength - 1 : shape[gene.sinkLayer];
                        gene.sinkIndex = randomInteger(0, sinkLayerMaxIndex);
                        break;
                    case 4:
                        let sinkLayer = randomInteger(gene.sourceLayer === 0 ? 1 : gene.sourceLayer, shape.length - 1);
                        let sinkIndex: number;
                        if (sinkLayer === shape.length - 1) {
                            sinkLayer = -1;
                            sinkIndex = randomInteger(0, outputLayerLength - 1);
                        } else {
                            sinkIndex = randomInteger(0, shape[sinkLayer]);
                        }
                        gene.sinkLayer = sinkLayer;
                        gene.sinkIndex = sinkIndex;
                        break;
                }
            }
        }

        return new Genome(genes);
    }
}
