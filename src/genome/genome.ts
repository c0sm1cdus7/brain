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
    hiddenLayers: number;
    outputLayerLength: number;
    allowJumpingConnections: boolean;
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
        if (layer === 0) return this.parameters.inputLayerLength;
        if (layer === this.parameters.hiddenLayers + 1) return this.parameters.outputLayerLength;

        let maxNodeIndex = 0;
        for (const gene of this.genes) {
            if (gene.sourceLayer === layer) maxNodeIndex = Math.max(maxNodeIndex, gene.sourceIndex);
            if (gene.sinkLayer === layer) maxNodeIndex = Math.max(maxNodeIndex, gene.sinkIndex);
        }

        return maxNodeIndex + 1;
    }

    getLayerMaxNodeIndex(layer: number): number {
        if (layer === 0) return this.parameters.inputLayerLength - 1;
        if (layer === this.parameters.hiddenLayers + 1) return this.parameters.outputLayerLength - 1;
        const maxInternalNeurons = (this.parameters.inputLayerLength + this.parameters.outputLayerLength + 2) / 2;
        return Math.max(this.parameters.outputLayerLength + 1, Math.ceil(maxInternalNeurons / (layer + 1)));

        // let maxNodeIndex = 0;
        // for (const gene of this.genes) {
        //     if (gene.sourceLayer === layer) maxNodeIndex = Math.max(maxNodeIndex, gene.sourceIndex);
        //     if (gene.sinkLayer === layer) maxNodeIndex = Math.max(maxNodeIndex, gene.sinkIndex);
        // }

        // return maxNodeIndex + 1;
    }

    getShape(): number[] {
        return Array.from({ length: this.parameters.hiddenLayers + 2 }, (_, i) => this.getLayerLength(i));
    }

    private newRandomGene() {
        const { hiddenLayers, allowJumpingConnections } = this.parameters;

        let sourceLayer = randomInteger(0, hiddenLayers);
        let sourceIndex = randomInteger(0, this.getLayerMaxNodeIndex(sourceLayer));
        let sinkLayer = randomInteger(Math.max(1, sourceLayer), Math.min(allowJumpingConnections ? hiddenLayers + 1 : sourceLayer + 1, hiddenLayers + 1));
        let sinkIndex = randomInteger(0, this.getLayerMaxNodeIndex(sinkLayer));
        let weight = Number(randomNumber(-1, 1).toFixed(4));

        return new Gene({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight });
    }

    static crossover(parent1: Genome, parent2: Genome, mutationRate: number = 0.001, allowJumpingConnections: boolean = false, allowGenomeExpansion: boolean = false): Genome {
        const inputLayerLength = Math.max(parent1.parameters.inputLayerLength, parent2.parameters.inputLayerLength);
        const hiddenLayers = Math.max(parent1.parameters.hiddenLayers, parent2.parameters.hiddenLayers);
        const outputLayerLength = Math.max(parent1.parameters.outputLayerLength, parent2.parameters.outputLayerLength);
        const maxLength = Math.max(parent1.parameters.maxLength, parent2.parameters.maxLength);

        const offspring = new Genome([], {
            inputLayerLength,
            hiddenLayers,
            outputLayerLength,
            allowJumpingConnections,
            maxLength
        });

        for (let i = 0; i < maxLength; i++) {
            const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.genes.length, parent2.genes.length));
            let gene: Gene = i < crossoverPoint ? parent1.genes[i] : parent2.genes[i] ?? offspring.newRandomGene();
            if (Math.random() < mutationRate) {
                let { sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight } = gene;
                switch (randomInteger(0, allowGenomeExpansion ? 5 : 4)) {
                    case 0:
                        ({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight } = offspring.newRandomGene());
                        break;
                    case 1:
                        sourceIndex = randomInteger(0, offspring.getLayerMaxNodeIndex(sourceLayer));
                        break;
                    case 2:
                        sinkLayer = randomInteger(Math.max(1, sourceLayer), Math.min(allowJumpingConnections ? hiddenLayers + 1 : sourceLayer + 1, hiddenLayers + 1));
                        let maxSinkIndex = offspring.getLayerMaxNodeIndex(sinkLayer);
                        if (sinkIndex > maxSinkIndex) {
                            sinkIndex = randomInteger(0, maxSinkIndex);
                        }
                        break;
                    case 3:
                        sinkIndex = randomInteger(0, offspring.getLayerMaxNodeIndex(sinkLayer));
                        break;
                    case 4:
                        weight = Number(randomNumber(-1, 1).toFixed(4));
                        break;
                    case 5:
                        offspring.genes.push(offspring.newRandomGene());
                        break;
                }
                gene = new Gene({
                    sourceLayer,
                    sourceIndex,
                    sinkLayer,
                    sinkIndex,
                    weight
                });
            }
            offspring.genes.push(gene);
        }

        return offspring;
    }
}
