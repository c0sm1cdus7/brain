import { Shape } from "./brain";
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

    static random(Shape: [number, number, number]): Gene {
        const sourceLayer = randomInteger(0, 1);
        const sourceIndex = randomInteger(0, Shape[sourceLayer]);
        const sinkLayer = randomInteger(1, 2);
        const sinkIndex = randomInteger(0, Shape[sinkLayer]);
        const weight = randomNumber(-1, 1);
        return new Gene(sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight);
    }
}

export class Genome {
    genes: Gene[] = [];

    constructor(genes: Gene[]) {
        this.genes = genes;
    }

    static random(Shape: [number, number, number], length: number): Genome {
        const genes: Gene[] = [];
        for (let i = 0; i < length; i++) {
            genes.push(Gene.random(Shape));
        }
        return new Genome(genes);
    }

    getShape(): Shape {
        const Shape: Shape = [0, 0, 0];

        this.genes.forEach((gene) => {
            Shape[gene.sourceLayer] = Math.max(Shape[gene.sourceLayer], gene.sourceIndex + 1);
            Shape[gene.sinkLayer] = Math.max(Shape[gene.sinkLayer], gene.sinkIndex + 1);
        });

        return Shape;
    }

    static crossover(genome1: Genome, genome2: Genome, mutationRate: number = 0): Genome {
        const length = Math.max(genome1.genes.length, genome2.genes.length);

        const Shape: Shape = [Math.max(genome1.getShape()[0], genome2.getShape()[0]), Math.max(genome1.getShape()[1], genome2.getShape()[1]), Math.max(genome1.getShape()[2], genome2.getShape()[2])];

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
                        gene.sourceIndex = randomInteger(0, gene.sourceLayer === 1 ? Shape[1] + 1 : Shape[gene.sourceLayer]);
                        break;
                    case 2:
                        gene.sinkLayer = randomInteger(1, 2);
                        gene.sinkIndex = randomInteger(0, gene.sinkLayer === 1 ? Shape[1] + 1 : Shape[gene.sinkLayer]);
                        break;
                }
            }
        });

        return new Genome(genes);
    }
}
