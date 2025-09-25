import { Brain } from "../brain/brain";
import { Genome } from "../genome/genome";

interface Position {
    x: number;
    y: number;
}

class Obstacle {
    constructor(public position: Position) {}
}

class Agent {
    brain: Brain;
    constructor(public genome: Genome, public position: Position, public energy: number) {
        this.brain = new Brain(genome);
    }
}

class Map {
    agents: Agent[] = [];
    obstacles: Obstacle[] = [];
    width: number;
    height: number;

    constructor(mapSize: number, obstaclesCount: number) {
        this.obstacles = Array.from({ length: obstaclesCount }, () => new Obstacle(this.findClearPosition()));
        this.width = mapSize;
        this.height = mapSize;
    }

    spawnAgents(genomes: Genome[], energy: number) {
        this.agents = genomes.map((g) => new Agent(g, this.findClearPosition(), energy));
    }

    checkPosition({ x, y }: Position): -1 | 0 | 1 {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        if (this.agents.some(({ position }) => position.x === x && position.y === y)) return 1;
        if (this.obstacles.some(({ position }) => position.x === x && position.y === y)) return -1;
        return 0;
    }

    findClearPosition(): Position {
        let x: number, y: number;
        do {
            x = Math.floor(Math.random() * this.width);
            y = Math.floor(Math.random() * this.height);
        } while (this.checkPosition({ x, y }) !== 0);
        return { x, y };
    }

    checkSurroundings(pos: Position, radius = 2): number[] {
        const positions: [number, number][] = [];
        for (let r = 1; r <= radius; r++) for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) if (Math.abs(dx) === r || Math.abs(dy) === r) positions.push([dx, dy]);
        return positions.map(([dx, dy]) => this.checkPosition({ x: pos.x + dx, y: pos.y + dy }));
    }

    reset() {
        this.agents = [];
    }

    render() {
        let output = "";
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const agentHere = this.agents.find(({ position }) => position.x === x && position.y === y);
                const obstacleHere = this.obstacles.find(({ position }) => position.x === x && position.y === y);
                output += agentHere ? "A" : obstacleHere ? "#" : ".";
            }
            output += "\n";
        }
        console.clear();
        console.log(output);
    }
}

interface SimulationOptions {
    population: number;
    genomeLength: number;
    mutationRate: number;
    hiddenLayers: number;
    outputLayerLength: number;
    reverseSynapses: boolean;
}

export class Simulation {
    map: Map;
    genepool: Genome[] = [];
    accuracy = 0;
    options: SimulationOptions;

    constructor(mapSize: number, obstacleCount: number, options: SimulationOptions) {
        this.map = new Map(mapSize, obstacleCount);
        this.options = options;
    }

    run(steps: number) {
        this.map.reset();
        const { population, genomeLength, mutationRate, hiddenLayers, outputLayerLength, reverseSynapses } = this.options;

        const eyesightInputLength = this.map.checkSurroundings({ x: 0, y: 0 }, 2).length;
        const inputLayerLength = 1 + eyesightInputLength;

        while (this.genepool.length < population) this.genepool.push(Genome.create({ inputLayerLength, hiddenLayers, outputLayerLength, maxLength: genomeLength, reverseSynapses }));

        this.map.spawnAgents(this.genepool, steps);

        for (let step = 0; step < steps; step++) {
            for (const agent of this.map.agents) {
                //if (agent.energy <= 0) continue;

                const normalizedAge = step / steps;
                const normalizedEnergy = agent.energy / steps;
                const normalizedSteps = Math.abs(step - steps) / steps;
                const surroundings = this.map.checkSurroundings(agent.position, 2);
                const output = agent.brain.feed([normalizedAge, normalizedSteps, normalizedEnergy, ...surroundings]);

                let x = agent.position.x + (output[0] > 0.5 ? 1 : output[0] < -0.5 ? -1 : 0);
                let y = agent.position.y + (output[1] > 0.5 ? 1 : output[1] < -0.5 ? -1 : 0);

                if (this.map.checkPosition({ x, y }) === 0) {
                    agent.position = { x, y };
                    agent.energy--;
                }
            }
        }

        const reproducers: Genome[] = [];

        const xMin = this.map.width * 0.7;
        const yMin = this.map.height * 0.7;

        for (const {
            position: { x, y },
            genome
        } of this.map.agents) {
            if (x > xMin && y > yMin) {
                reproducers.push(genome);
            }
        }

        const offspring: Genome[] = [];
        while (offspring.length < population - reproducers.length) {
            for (const parent of reproducers) {
                const partners = reproducers.filter((g) => g !== parent);
                const partner = partners[Math.floor(Math.random() * partners.length)] ?? parent;
                offspring.push(Genome.crossover(parent, partner, mutationRate));
                if (offspring.length >= population - reproducers.length) break;
            }
        }

        this.genepool = [...reproducers, ...offspring];
        this.accuracy = reproducers.length / population;
    }
}
