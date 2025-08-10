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
}

export class Genome {
    genes: Gene[] = [];

    constructor(genes: Gene[]) {
        this.genes = genes;
    }

    static random({ inputLayerLength, outputLayerLength, length }: { inputLayerLength: number; outputLayerLength: number; length: number }): Genome {
        const genes: Gene[] = [];

        for (let i = 0; i < length; i++) {
            const shape = new Genome(genes).getShape();
            const sourceLayer = randomInteger(0, shape.length - 2);
            const sourceIndex = randomInteger(0, sourceLayer === 0 ? inputLayerLength - 1 : shape[sourceLayer]);
            let sinkLayer = randomInteger(sourceLayer, shape.length);
            let sinkLayerMaxIndex = 0;
            if (sinkLayer === shape.length) {
                sinkLayer = -1;
                sinkLayerMaxIndex = outputLayerLength - 1;
            } else if (sinkLayer === shape.length - 1) {
                sinkLayerMaxIndex = 1;
            } else {
                sinkLayerMaxIndex = shape[sinkLayer] - 1;
            }
            const sinkIndex = randomInteger(0, sinkLayerMaxIndex);
            const weight = randomNumber(-1, 1);
            const gene = new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight);
            genes.push(gene);
            /*const shape = new Genome(genes).getShape();
            const hiddenLayerMaxIndex = Math.max(hiddenLayerLength ?? 0, shape[1]);
            const sourceLayer = randomInteger(0, 1);
            const sourceLayerMaxIndex = sourceLayer === 0 ? inputLayerLength - 1 : hiddenLayerMaxIndex;
            const sourceIndex = randomInteger(0, sourceLayerMaxIndex);
            const sinkLayer = randomInteger(1, sourceLayer === 0 ? 1 : 2);
            const sinkLayerMaxIndex = sinkLayer === 2 ? outputLayerLength - 1 : hiddenLayerMaxIndex;
            const sinkIndex = randomInteger(0, sinkLayerMaxIndex);
            const weight = randomNumber(-1, 1);
            const gene = new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight);
            genes.push(gene);*/
        }

        return new Genome(genes);
    }
    getShape(): number[] {
        const shape: number[] = [];

        this.genes.forEach((gene) => {
            shape[gene.sourceLayer] = Math.max(shape[gene.sourceLayer] ?? 0, gene.sourceIndex + 1);
            let sinkLayer = gene.sinkLayer;
            if (sinkLayer === -1) {
                sinkLayer = shape.length - 1;
            }
            shape[sinkLayer] = Math.max(shape[sinkLayer] ?? 0, gene.sinkIndex + 1);
        });

        return shape;
    }

    static crossover(genome1: Genome, genome2: Genome, mutationRate: number = 0): Genome {
        const length = Math.max(genome1.genes.length, genome2.genes.length);

        const genome1Shape = genome1.getShape();
        const genome2Shape = genome2.getShape();
        const inputLayerLength = Math.max(genome1Shape[0], genome2Shape[0]) - 1;
        const outputLayerLength = Math.max(genome1Shape[genome1Shape.length - 1], genome2Shape[genome2Shape.length - 1]) - 1;

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
                const shape = new Genome(genes).getShape();
                switch (randomInteger(0, 2)) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        gene.weight = Math.max(-1, Math.min(1, gene.weight));
                        break;
                    case 1:
                        gene.sourceLayer = randomInteger(0, shape.length - 2);
                        const sourceLayerMaxIndex = gene.sourceLayer === 0 ? inputLayerLength - 1 : shape[gene.sourceLayer];
                        gene.sourceIndex = randomInteger(0, Math.max(0, sourceLayerMaxIndex));
                        break;
                    case 2:
                        let sinkLayer = randomInteger(gene.sourceLayer, shape.length);
                        let sinkLayerMaxIndex = 0;
                        if (sinkLayer === shape.length) {
                            sinkLayer = -1;
                            sinkLayerMaxIndex = outputLayerLength - 1;
                        } else if (sinkLayer === shape.length - 1) {
                            sinkLayerMaxIndex = 1;
                        } else {
                            sinkLayerMaxIndex = shape[sinkLayer] - 1;
                        }
                        gene.sinkLayer = sinkLayer;
                        gene.sinkIndex = randomInteger(0, Math.max(0, sinkLayerMaxIndex));
                        break;
                }
            }
            /*hiddenLayerLength = Math.max(hiddenLayerLength, gene.sourceLayer === 1 ? gene.sourceIndex + 1 : 0, gene.sinkLayer === 1 ? gene.sinkIndex + 1 : 0);
            if (Math.random() < mutationRate) {
                switch (randomInteger(0, 2)) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        gene.weight = Math.max(-1, Math.min(1, gene.weight));
                        break;
                    case 1:
                        gene.sourceLayer = randomInteger(0, 1);
                        const sourceLayerMaxIndex = gene.sourceLayer === 0 ? inputLayerLength - 1 : hiddenLayerLength;
                        gene.sourceIndex = randomInteger(0, Math.max(0, sourceLayerMaxIndex));
                        break;
                    case 2:
                        gene.sinkLayer = randomInteger(1, gene.sourceLayer === 0 ? 1 : 2);
                        const sinkLayerMaxIndex = gene.sinkLayer === 2 ? outputLayerLength - 1 : hiddenLayerLength;
                        gene.sinkIndex = randomInteger(0, Math.max(0, sinkLayerMaxIndex));
                        break;
                }
            }*/
        });

        return new Genome(genes);
    }
}
