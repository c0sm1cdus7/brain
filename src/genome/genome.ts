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
}

export class Genome {
    genes: Gene[] = [];
    parameters: GenomeParameters;

    private constructor(genes: Gene[] = [], parameters: GenomeParameters) {
        this.genes = genes;
        this.parameters = parameters;
    }

    static create(length: number, parameters: GenomeParameters): Genome {
        const genome = new Genome([], parameters);
        for (let i = 0; i < length; i++) {
            genome.genes.push(genome.newRandomGene());
        }
        return genome;
    }

    static createFromGenes(genes: Gene[], parameters: GenomeParameters): Genome {
        return new Genome(genes, parameters);
    }

    private getLayerLength(layer: number): number {
        let layerIndex = 0;
        for (const gene of this.genes) {
            if (gene.sourceLayer === layer) layerIndex = Math.max(layerIndex, gene.sourceIndex);
            if (gene.sinkLayer === layer) layerIndex = Math.max(layerIndex, gene.sinkIndex);
        }
        return layerIndex + 1;
    }

    private getLayerMaxNodeIndex(layer: number): number {
        const { inputLayerLength, hiddenLayers, outputLayerLength } = this.parameters;
        let layerMaxNodeIndex = this.getLayerLength(layer);
        if (layer === 0) {
            layerMaxNodeIndex = inputLayerLength - 1;
        } else if (layer === hiddenLayers + 1) {
            layerMaxNodeIndex = outputLayerLength - 1;
        }
        return layerMaxNodeIndex;
    }

    getNeuralNetworkShape(): number[] {
        return Array.from({ length: this.parameters.hiddenLayers + 2 }, (_, layer) => this.getLayerLength(layer));
    }

    private newRandomGene() {
        const { hiddenLayers } = this.parameters;

        let sourceLayer = randomInteger(0, hiddenLayers);
        let sourceIndex = randomInteger(0, this.getLayerMaxNodeIndex(sourceLayer));
        let sinkLayer = randomInteger(1, hiddenLayers + 1);
        let sinkIndex = randomInteger(0, this.getLayerMaxNodeIndex(sinkLayer));
        let weight = randomNumber(-1, 1);

        return new Gene({ sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight });
    }

    static crossover(parent1: Genome, parent2: Genome, mutationRate: number = 0.001): Genome {
        const inputLayerLength = Math.max(parent1.parameters.inputLayerLength, parent2.parameters.inputLayerLength);
        const hiddenLayers = Math.max(parent1.parameters.hiddenLayers, parent2.parameters.hiddenLayers);
        const outputLayerLength = Math.max(parent1.parameters.outputLayerLength, parent2.parameters.outputLayerLength);
        const genomeLength = Math.ceil(Math.max(parent1.genes.length, parent2.genes.length) * (1 + mutationRate));

        const offspring = new Genome([], {
            inputLayerLength,
            hiddenLayers,
            outputLayerLength
        });

        const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.genes.length, parent2.genes.length));

        const layerMaxNodeIndexCache: number[] = [];
        for (let l = 0; l <= hiddenLayers + 1; l++) {
            layerMaxNodeIndexCache[l] = offspring.getLayerMaxNodeIndex(l);
        }

        for (let i = 0; i < genomeLength; i++) {
            let gene: Gene = i < crossoverPoint ? parent1.genes[i] : (parent2.genes[i] ?? offspring.newRandomGene());
            if (Math.random() < mutationRate) {
                let { sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight } = gene;
                switch (randomInteger(0, 4)) {
                    case 0:
                        sourceLayer = randomInteger(0, hiddenLayers);
                        sourceIndex = randomInteger(0, sourceLayer === 0 ? layerMaxNodeIndexCache[sourceLayer] : layerMaxNodeIndexCache[sourceLayer] + 1);
                        if (sourceIndex > layerMaxNodeIndexCache[sourceLayer]) {
                            layerMaxNodeIndexCache[sourceLayer] = sourceIndex;
                        }
                        break;
                    case 1:
                        sourceIndex = randomInteger(0, sourceLayer === 0 ? layerMaxNodeIndexCache[sourceLayer] : layerMaxNodeIndexCache[sourceLayer] + 1);
                        if (sourceIndex > layerMaxNodeIndexCache[sourceLayer]) {
                            layerMaxNodeIndexCache[sourceLayer] = sourceIndex;
                        }
                        break;
                    case 2:
                        sinkLayer = randomInteger(1, hiddenLayers + 1);
                        sinkIndex = randomInteger(0, sinkLayer === hiddenLayers + 1 ? layerMaxNodeIndexCache[sinkLayer] : layerMaxNodeIndexCache[sinkLayer] + 1);
                        if (sinkIndex > layerMaxNodeIndexCache[sinkLayer]) {
                            layerMaxNodeIndexCache[sinkLayer] = sinkIndex;
                        }
                        break;
                    case 3:
                        sinkIndex = randomInteger(0, sinkLayer === hiddenLayers + 1 ? layerMaxNodeIndexCache[sinkLayer] : layerMaxNodeIndexCache[sinkLayer] + 1);
                        if (sinkIndex > layerMaxNodeIndexCache[sinkLayer]) {
                            layerMaxNodeIndexCache[sinkLayer] = sinkIndex;
                        }
                        break;
                    case 4:
                        const weightShift = randomNumber(-0.1, 0.1);
                        weight = Math.max(-1, Math.min(weight + weightShift, 1));
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

    static crossover2(parent1: Genome, parent2: Genome, mutationRate: number = 0.001): Genome {
        const inputLayerLength = Math.max(parent1.parameters.inputLayerLength, parent2.parameters.inputLayerLength);
        const hiddenLayers = Math.max(parent1.parameters.hiddenLayers, parent2.parameters.hiddenLayers);
        const outputLayerLength = Math.max(parent1.parameters.outputLayerLength, parent2.parameters.outputLayerLength);

        const minLen = Math.min(parent1.genes.length, parent2.genes.length);
        const maxLen = Math.max(parent1.genes.length, parent2.genes.length);

        const genomeLength = Math.ceil(maxLen + randomInteger(0, maxLen * (1 + mutationRate)));

        const offspring = new Genome([], {
            inputLayerLength,
            hiddenLayers,
            outputLayerLength
        });

        const crossoverPoint = (Math.random() * minLen) | 0;

        const layerMaxNodeIndexCache: number[] = [];
        for (let l = 0; l <= hiddenLayers + 1; l++) {
            layerMaxNodeIndexCache[l] = offspring.getLayerMaxNodeIndex(l);
        }

        const extraGenes: Gene[] = [];

        for (let i = 0; i < genomeLength; i++) {
            const parentGene = i < crossoverPoint ? parent1.genes[i] : (parent2.genes[i] ?? offspring.newRandomGene());

            let gene = parentGene;

            if (Math.random() < mutationRate) {
                let { sourceLayer, sourceIndex, sinkLayer, sinkIndex, weight } = gene;

                switch ((Math.random() * 7) | 0) {
                    case 0:
                        sourceLayer = (Math.random() * (sinkLayer === hiddenLayers + 1 ? hiddenLayers : sinkLayer + 1)) | 0;
                        sourceIndex = Math.min(sourceIndex, layerMaxNodeIndexCache[sourceLayer]);
                        break;
                    case 1:
                        sourceIndex = (Math.random() * (layerMaxNodeIndexCache[sourceLayer] + 1)) | 0;
                        break;
                    case 2:
                        sinkLayer = ((Math.random() * (hiddenLayers + 2 - Math.max(1, sourceLayer))) | 0) + Math.max(1, sourceLayer);
                        sinkIndex = Math.min(sinkIndex, layerMaxNodeIndexCache[sinkLayer]);
                        break;
                    case 3:
                        sinkIndex = (Math.random() * (layerMaxNodeIndexCache[sinkLayer] + 1)) | 0;
                        break;
                    case 4:
                        weight = Math.max(-1, Math.min(weight + (Math.random() * 0.2 - 0.1), 1));
                        break;
                    case 5:
                        extraGenes.push(offspring.newRandomGene());
                        break;

                    case 6:
                        continue;
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

        offspring.genes.push(...extraGenes);

        return offspring;
    }
}
