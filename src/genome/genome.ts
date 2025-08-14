export function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface GeneParameters {
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

    constructor({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight }: GeneParameters) {
        this.sourceLayer = sourceLayer;
        this.sourceIndex = sourceIndex;
        this.sinkLayer = sinkLayer;
        this.sinkIndex = sinkIndex;
        this.weight = weight;
    }
}

export interface GenomeParameters {
    inputLayerLength: number;
    outputLayerLength: number;
    maxLength: number;
}

export class Genome {
    genes: Gene[] = [];
    parameters: GenomeParameters;

    constructor(genes: Gene[] = [], parameters: GenomeParameters) {
        this.genes = genes;
        this.parameters = parameters;
    }

    static create(parameters: GenomeParameters): Genome {
        const genome = new Genome([], parameters);
        const { maxLength } = parameters;
        for (let i = 0; i < maxLength; i++) {
            genome.genes.push(genome.newRandomGene());
        }
        return genome;
    }

    getLayerLength(layer: number): number {
        const maxNodeIndex = this.genes.reduce((max, gene) => {
            if (gene.sourceLayer === layer) max = Math.max(max, gene.sourceIndex);
            if (gene.sinkLayer === layer) max = Math.max(max, gene.sinkIndex);
            return max;
        }, 0);

        return maxNodeIndex + 1;
    }

    getShape(): [number, number, number] {
        return [this.getLayerLength(0), this.getLayerLength(1), this.getLayerLength(2)];
    }

    private newRandomGene() {
        const { inputLayerLength, outputLayerLength } = this.parameters;
        const hiddenLayerLength = this.getLayerLength(1);
        let sourceLayer = randomInteger(0, 1);
        let sourceIndex;
        switch (sourceLayer) {
            case 0:
                sourceIndex = randomInteger(0, inputLayerLength - 1);
                break;
            case 1:
                sourceIndex = randomInteger(0, hiddenLayerLength);
                break;
            default:
                sourceIndex = 0;
        }
        let sinkLayer = randomInteger(1, sourceLayer === 0 ? 1 : 2);
        let sinkIndex;
        switch (sinkLayer) {
            case 1:
                sinkIndex = randomInteger(0, hiddenLayerLength);
                break;
            case 2:
                sinkIndex = randomInteger(0, outputLayerLength - 1);
                break;
            default:
                sinkIndex = 0;
        }
        let weight = randomNumber(-1, 1);
        return new Gene({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight });
    }

    static crossover(parent1: Genome, parent2: Genome, mutationRate: number = 0.001): Genome {
        const inputLayerLength = Math.max(parent1.parameters.inputLayerLength, parent2.parameters.inputLayerLength);
        const outputLayerLength = Math.max(parent1.parameters.outputLayerLength, parent2.parameters.outputLayerLength);
        const maxLength = Math.max(parent1.parameters.maxLength, parent2.parameters.maxLength);

        const offspring = new Genome([], {
            inputLayerLength,
            outputLayerLength,
            maxLength
        });

        for (let i = 0; i < maxLength; i++) {
            if (i < parent1.genes.length && i < parent2.genes.length) {
                offspring.genes.push(Math.random() < 0.5 ? parent1.genes[i] : parent2.genes[i]);
            } else if (i < parent1.genes.length) {
                offspring.genes.push(parent1.genes[i]);
            } else if (i < parent2.genes.length) {
                offspring.genes.push(parent2.genes[i]);
            }
        }

        const hiddenLayerLength = offspring.getLayerLength(1);

        if (Math.random() < mutationRate) {
            let mutationIndex = randomInteger(0, offspring.genes.length - 1);
            if (mutationIndex === offspring.genes.length && offspring.genes.length < maxLength) {
                offspring.genes.push(offspring.newRandomGene());
            } else {
                let { sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight } = offspring.genes[mutationIndex];
                switch (randomInteger(0, 4)) {
                    case 0:
                        weight += randomNumber(-0.01, 0.01);
                        break;
                    case 1:
                        sourceLayer = randomInteger(0, 1);
                        sourceIndex = randomInteger(0, sourceLayer === 0 ? inputLayerLength - 1 : hiddenLayerLength);
                        sinkLayer = randomInteger(1, sourceLayer === 0 ? 1 : 2);
                        sinkIndex = randomInteger(0, sinkLayer === 2 ? outputLayerLength - 1 : hiddenLayerLength);
                        break;
                    case 2:
                        sourceIndex = randomInteger(0, sourceLayer === 0 ? inputLayerLength - 1 : hiddenLayerLength);
                        break;
                    case 3:
                        sinkLayer = randomInteger(1, sourceLayer === 0 ? 1 : 2);
                        sinkIndex = randomInteger(0, sinkLayer === 2 ? outputLayerLength - 1 : hiddenLayerLength);
                        break;
                    case 4:
                        sinkIndex = randomInteger(0, sinkLayer === 2 ? outputLayerLength - 1 : hiddenLayerLength);
                        break;
                }
                offspring.genes[mutationIndex] = new Gene({
                    sourceLayer,
                    sourceIndex,
                    sinkLayer,
                    sinkIndex,
                    weight
                });
            }
        }

        return offspring;
    }
}
