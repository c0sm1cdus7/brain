import { randomInt } from "crypto";

function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function randomInteger(min: number, max: number): number {
    return randomInt(min, max + 1);
}

type SinkFlow = -1 | 0 | 1;

export class Gene {
    sourceLayer: number;
    sourceIndex: number;
    sinkFlow: SinkFlow;
    sinkIndex: number;
    weight: number;

    constructor(sourceLayer: number, sourceIndex: number, sinkFlow: SinkFlow, sinkIndex: number, weight: number) {
        this.sourceLayer = sourceLayer;
        this.sourceIndex = sourceIndex;
        this.sinkFlow = sinkFlow;
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

            if (!hiddenLayers) hiddenLayers = 1;

            let sourceLayer = randomInteger(0, hiddenLayers);
            let sourceIndex;
            if (sourceLayer === 0) {
                sourceIndex = randomInteger(0, inputLayerLength - 1);
            } else {
                sourceIndex = randomInteger(0, shape[sourceLayer] ?? 1);
            }

            let sinkFlow = randomInteger(-1, 1);
            if (sourceLayer === 0) {
                sinkFlow = 1;
            } else if (sourceLayer === 1) {
                sinkFlow = randomInteger(0, 1);
            }
            let sinkLayer = sourceLayer + sinkFlow;
            let sinkIndex;
            if (sinkLayer === hiddenLayers + 1) {
                sinkIndex = randomInteger(0, outputLayerLength - 1);
            } else {
                sinkIndex = randomInteger(0, shape[sinkLayer] ?? 1);
            }

            const weight = Math.random() * 2 - 1;
            genes.push(new Gene(sourceLayer, sourceIndex, sinkFlow as SinkFlow, sinkIndex, weight));
        }
        return new Genome(genes);
    }

    getShape(): number[] {
        let maxLayerIndex = 0;
        for (const gene of this.genes) {
            if (gene.sourceLayer > maxLayerIndex) maxLayerIndex = gene.sourceLayer;
            let sinkLayer = gene.sourceLayer + gene.sinkFlow;
            if (sinkLayer > maxLayerIndex) maxLayerIndex = sinkLayer;
        }
        const shape: number[] = new Array(maxLayerIndex + 1).fill(0);

        for (const { sourceLayer, sourceIndex, sinkFlow, sinkIndex } of this.genes) {
            shape[sourceLayer] = Math.max(shape[sourceLayer], sourceIndex + 1);
            let sinkLayer = sourceLayer + sinkFlow;
            shape[sinkLayer] = Math.max(shape[sinkLayer], sinkIndex + 1);
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

        const shape = new Genome(genes).getShape();

        for (const gene of genes) {
            if (Math.random() < mutationRate) {
                switch (randomInteger(0, 3)) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        gene.weight = Math.max(-1, Math.min(1, gene.weight));
                        break;
                    case 1:
                        const sourceLayerMaxNeuronIndex = gene.sourceLayer === 0 ? inputLayerLength - 1 : shape[gene.sourceLayer];
                        gene.sourceIndex = randomInteger(0, sourceLayerMaxNeuronIndex);
                        break;
                    case 2:
                        let sinkLayerIndex = gene.sourceLayer + gene.sinkFlow;
                        if (sinkLayerIndex < 0) {
                            throw new Error("Bad doggy: Logic broke");
                        }
                        gene.sinkIndex = randomInteger(0, sinkLayerIndex === shape.length - 1 ? outputLayerLength - 1 : shape[sinkLayerIndex]);
                        break;
                    case 3:
                        gene.sourceLayer = randomInteger(0, shape.length - 1);
                        if (gene.sourceLayer === 0) {
                            gene.sourceIndex = randomInteger(0, inputLayerLength - 1);
                        } else {
                            gene.sourceIndex = randomInteger(0, shape[gene.sourceLayer] ?? 1);
                        }
                        gene.sinkFlow = randomInteger(-1, 1) as SinkFlow;
                        if (gene.sourceLayer === 0) {
                            gene.sinkFlow = 1;
                        } else if (gene.sourceLayer === 1) {
                            gene.sinkFlow = randomInteger(0, 1) as SinkFlow;
                        }
                        let sinkLayer = gene.sourceLayer + gene.sinkFlow;
                        if (sinkLayer === shape.length - 1) {
                            gene.sinkIndex = randomInteger(0, outputLayerLength - 1);
                        } else {
                            gene.sinkIndex = randomInteger(0, shape[sinkLayer] ?? 1);
                        }
                }
            }
        }

        return new Genome(genes);
    }
}
