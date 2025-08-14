export function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface NewGeneParameters {
    sourceLayer: number;
    sourceIndex: number;
    sinkLayer: number;
    sinkIndex: number;
    weight: number;
}

export class Gene {
    sourceLayer: number;
    sourceIndex: number;
    sinkLayer: number;
    sinkIndex: number;
    weight: number;

    constructor({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight }: NewGeneParameters) {
        this.sourceLayer = sourceLayer;
        this.sourceIndex = sourceIndex;
        this.sinkLayer = sinkLayer;
        this.sinkIndex = sinkIndex;
        this.weight = weight;
    }
}

export interface NewGenomeParameters {
    inputLayerLength: number;
    outputLayerLength: number;
    length: number;
}

export class Genome {
    inputLayerLength: number | null = null;
    outputLayerLength: number | null = null;
    genes: Gene[] = [];

    constructor(genes: Gene[] = []) {
        this.genes = genes;
    }

    static create({ inputLayerLength, outputLayerLength, length }: NewGenomeParameters): Genome {
        const genome = new Genome();
        genome.inputLayerLength = inputLayerLength;
        genome.outputLayerLength = outputLayerLength;
        for (let i = 0; i < length; i++) {
            genome.addGene(genome.newRandomGene());
        }
        return genome;
    }

    getLayerMaxNodeIndex(layer: number): number {
        const maxNodeIndex = this.genes.reduce((max, gene) => {
            if (gene.sourceLayer === layer) max = Math.max(max, gene.sourceIndex);
            if (gene.sinkLayer === layer) max = Math.max(max, gene.sinkIndex);
            return max;
        }, 0);

        if (layer === 0 && this.inputLayerLength !== null) {
            return Math.max(this.inputLayerLength - 1, maxNodeIndex);
        }

        if (layer === 2 && this.outputLayerLength !== null) {
            return Math.max(this.outputLayerLength - 1, maxNodeIndex);
        }

        return maxNodeIndex;
    }

    getShape(): [number, number, number] {
        return [this.getLayerMaxNodeIndex(0) + 1, this.getLayerMaxNodeIndex(1) + 1, this.getLayerMaxNodeIndex(2) + 1];
    }

    private newRandomGene() {
        let sourceLayer = randomInteger(0, 1);
        let sourceIndex;
        switch (sourceLayer) {
            case 0:
                sourceIndex = randomInteger(0, this.getLayerMaxNodeIndex(0));
                break;
            case 1:
                sourceIndex = randomInteger(0, this.getLayerMaxNodeIndex(1) + 1);
                break;
            default:
                sourceIndex = 0;
        }
        let sinkLayer = randomInteger(1, 2);
        let sinkIndex;
        switch (sinkLayer) {
            case 1:
                sinkIndex = randomInteger(0, this.getLayerMaxNodeIndex(1) + 1);
                break;
            case 2:
                sinkIndex = randomInteger(0, this.getLayerMaxNodeIndex(2));
                break;
            default:
                sinkIndex = 0;
        }
        let weight = randomNumber(-1, 1);
        return new Gene({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight });
    }

    private addGene(gene: Gene) {
        for (let i = 0; i < this.genes.length; i++) {
            if (
                this.genes[i].sourceLayer === gene.sourceLayer &&
                this.genes[i].sourceIndex === gene.sourceIndex &&
                this.genes[i].sinkLayer === gene.sinkLayer &&
                this.genes[i].sinkIndex === gene.sinkIndex
            ) {
                this.genes[i].weight = gene.weight;
                return;
            }
        }
        this.genes.push(gene);
    }

    mutate(mutationRate: number = 0.001) {
        let mutationIndex = randomInteger(0, this.genes.length);
        if (Math.random() < mutationRate) {
            if (mutationIndex === this.genes.length) {
                this.addGene(this.newRandomGene());
            } else {
                let gene = this.genes[mutationIndex];
                const mutationType = randomInteger(0, 4);
                switch (mutationType) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        break;
                    case 1:
                        gene.sourceLayer = randomInteger(0, 1);
                        gene.sourceIndex = randomInteger(0, gene.sourceLayer === 0 ? this.getLayerMaxNodeIndex(gene.sourceLayer) : this.getLayerMaxNodeIndex(gene.sourceLayer) + 1);
                        break;
                    case 2:
                        gene.sourceIndex = randomInteger(0, gene.sourceLayer === 0 ? this.getLayerMaxNodeIndex(gene.sourceLayer) : this.getLayerMaxNodeIndex(gene.sourceLayer) + 1);
                        break;
                    case 3:
                        gene.sinkLayer = randomInteger(1, 2);
                        gene.sinkIndex = randomInteger(0, gene.sinkLayer === 2 ? this.getLayerMaxNodeIndex(gene.sinkLayer) : this.getLayerMaxNodeIndex(gene.sinkLayer) + 1);
                        break;
                    case 4:
                        gene.sinkIndex = randomInteger(0, gene.sinkLayer === 2 ? this.getLayerMaxNodeIndex(gene.sinkLayer) : this.getLayerMaxNodeIndex(gene.sinkLayer) + 1);
                        break;
                }
            }
        }
    }

    static crossover(parent1: Genome, parent2: Genome, mutationRate: number = 0.001): Genome {
        const genes: Gene[] = [];
        const maxLength = Math.max(parent1.genes.length, parent2.genes.length);

        for (let i = 0; i < maxLength; i++) {
            if (i < parent1.genes.length && i < parent2.genes.length) {
                genes.push(Math.random() < 0.5 ? parent1.genes[i] : parent2.genes[i]);
            } else if (i < parent1.genes.length) {
                genes.push(parent1.genes[i]);
            } else if (i < parent2.genes.length) {
                genes.push(parent2.genes[i]);
            }
        }

        if (Math.random() < mutationRate) {
            let mutationIndex = randomInteger(0, genes.length);
            const genome = new Genome(genes);
            if (mutationIndex === genes.length) {
                genome.addGene(genome.newRandomGene());
            } else {
                const shape = new Genome(genes).getShape();
                let gene = genes[mutationIndex];
                const mutationType = randomInteger(0, 4);
                switch (mutationType) {
                    case 0:
                        gene.weight += randomNumber(-0.01, 0.01);
                        break;
                    case 1:
                        gene.sourceLayer = randomInteger(0, 1);
                        gene.sourceIndex = randomInteger(0, gene.sourceLayer === 0 ? shape[0] : shape[gene.sourceLayer] + 1);
                        break;
                    case 2:
                        gene.sourceIndex = randomInteger(0, gene.sourceLayer === 0 ? shape[0] : shape[gene.sourceLayer] + 1);
                        break;
                    case 3:
                        gene.sinkLayer = randomInteger(1, 2);
                        gene.sinkIndex = randomInteger(0, gene.sinkLayer === 2 ? shape[2] : shape[gene.sourceLayer] + 1);
                        break;
                    case 4:
                        gene.sinkIndex = randomInteger(0, gene.sinkLayer === 2 ? shape[2] : shape[gene.sourceLayer] + 1);
                        break;
                }
            }
        }

        return new Genome(genes);
    }
}
