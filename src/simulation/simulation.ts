import { Brain } from "../brain/brain";
import { Genome } from "../genome/genome";

interface Position {
    x: number;
    y: number;
}

class Obstacle {
    position: Position;

    constructor(position: Position) {
        this.position = position;
    }
}

class Agent {
    genome: Genome;
    brain: Brain;
    position: Position;

    constructor(genome: Genome, position: Position) {
        this.genome = genome;
        this.brain = new Brain(genome);
        this.position = position;
    }
}

class Map {
    width: number;
    height: number;
    agents: Agent[] = [];
    obstacles: Obstacle[] = [];

    constructor(width: number, height: number, obstacles: number) {
        this.width = width;
        this.height = height;
        this.obstacles = Array.from({ length: obstacles }, () => {
            const clearPosition = this.findClearPosition();
            return new Obstacle(clearPosition);
        });
    }

    spawnAgents(genomes: Genome[]) {
        const agents: Agent[] = [];
        genomes.forEach((genome) => {
            const position = this.findClearPosition();
            const agent = new Agent(genome, position);
            agents.push(agent);
        });
        this.agents = agents;
    }

    checkPosition({ x, y }: Position): -1 | 0 | 1 {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        return this.agents.some(({ position }) => position.x === x && position.y === y) ? 1 : this.obstacles.some(({ position }) => position.x === x && position.y === y) ? -1 : 0;
    }

    findClearPosition(): Position {
        let x: number, y: number;
        do {
            x = Math.floor((Math.random() * this.width) / 2);
            y = Math.floor(Math.random() * this.height);
        } while (this.checkPosition({ x, y }) !== 0);
        return { x, y };
    }

    checkPositionSurroundings({ x, y }: Position): number[] {
        const positions = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [-2, -2],
            [-1, -2],
            [0, -2],
            [1, -2],
            [2, -2],
            [-2, -1],
            [2, -1],
            [-2, 0],
            [2, 0],
            [-2, 1],
            [2, 1],
            [-2, 2],
            [-1, 2],
            [0, 2],
            [1, 2],
            [2, 2]
        ];
        return positions.map(([dx, dy]) => {
            return this.checkPosition({ x: x + dx, y: y + dy });
        });
    }

    reset() {
        this.agents = [];
    }
}

interface SimulationOptions {
    population: number;
    selectionRate: number;
    genomeLength: number;
    mutationRate: number;
    inputLayerLength: number;
    hiddenLayers: number;
    outputLayerLength: number;
}

export class Simulation {
    genepool: Genome[] = [];
    map: Map;
    accuracy: number = 0;
    options: SimulationOptions;

    constructor(width: number, height: number, obstacles: number, options: SimulationOptions) {
        this.map = new Map(width, height, obstacles);
        this.options = options;
    }

    run(steps: number) {
        const { population, genomeLength, selectionRate, mutationRate, inputLayerLength, hiddenLayers, outputLayerLength } = this.options;
        while (this.genepool.length < population) {
            const genome = Genome.create({
                inputLayerLength,
                hiddenLayers,
                outputLayerLength,
                maxLength: genomeLength
            });
            this.genepool.push(genome);
        }
        this.map.spawnAgents(this.genepool);
        for (let step = 0; step < steps; step++) {
            for (let i = 0; i < this.map.agents.length; i++) {
                const agent = this.map.agents[i];
                const { position } = agent;
                const input = this.map.checkPositionSurroundings(position);
                const output = agent.brain.feed([...input]);
                let x = position.x;
                if (output[0] > 0.5) {
                    x++;
                } else if (output[0] < -0.5) {
                    x--;
                }
                let y = position.y;
                if (output[1] > 0.5) {
                    y++;
                } else if (output[1] < -0.5) {
                    y--;
                }
                const desiredPosition = { x, y };
                if (this.map.checkPosition(desiredPosition) === 0) {
                    agent.position = desiredPosition;
                }
            }
        }
        const reproducers: Genome[] = [];
        this.map.agents.forEach(({ position, genome }) => {
            const { x } = position;
            const { width } = this.map;
            if (x >= width * (1 - selectionRate)) {
                reproducers.push(genome);
            }
        });
        if (reproducers.length) {
            const offspring: Genome[] = [];
            while (offspring.length < (population - reproducers.length) * (1 - selectionRate)) {
                for (const parent of reproducers) {
                    const partners = reproducers.filter((genome) => genome !== parent);
                    const partner = partners[Math.floor(Math.random() * partners.length)] ?? parent;
                    offspring.push(Genome.crossover(parent, partner, mutationRate));
                }
            }
            this.genepool = [...reproducers, ...offspring];
            this.accuracy = reproducers.length / this.map.agents.length;
        } else {
            this.accuracy = 0;
        }
    }
}
