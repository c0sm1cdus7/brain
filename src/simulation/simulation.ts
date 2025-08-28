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

class Target {
    position: Position;

    constructor(position: Position) {
        this.position = position;
    }
}

class Agent {
    genome: Genome;
    brain: Brain;
    position: Position;
    energy: number;

    constructor(genome: Genome, position: Position, energy: number) {
        this.genome = genome;
        this.brain = new Brain(genome);
        this.position = position;
        this.energy = energy;
    }
}

class Map {
    width: number;
    height: number;
    agents: Agent[] = [];
    obstacles: Obstacle[] = [];
    targets: Target[] = [];

    constructor(width: number, height: number, targets = 1, obstacles: number) {
        this.width = width;
        this.height = height;
        this.targets = Array.from({ length: targets }, () => {
            const clearPosition = this.findClearPosition();
            return new Target(clearPosition);
        });
        this.obstacles = Array.from({ length: obstacles }, () => {
            const clearPosition = this.findClearPosition();
            return new Obstacle(clearPosition);
        });
    }

    spawnAgents(genomes: Genome[], energy: number) {
        const agents: Agent[] = [];
        genomes.forEach((genome) => {
            const position = this.findClearPosition();
            const agent = new Agent(genome, position, energy);
            agents.push(agent);
        });
        this.agents = agents;
    }

    checkPosition({ x, y }: Position): -1 | 0 | 1 {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        if (this.agents.some((a) => a.position.x === x && a.position.y === y)) return -1;
        if (this.obstacles.some((o) => o.position.x === x && o.position.y === y)) return -1;
        if (this.targets.some((t) => t.position.x === x && t.position.y === y)) return 1;
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

    distanceToClosestTarget(position: Position): number {
        if (!this.targets.length) return Infinity;
        return this.targets.reduce((minDist, target) => {
            const dx = target.position.x - position.x;
            const dy = target.position.y - position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return Math.min(minDist, dist);
        }, Infinity);
    }

    checkPositionSurroundings({ x, y }: Position, radius = 2): number[] {
        const positions: [number, number][] = [];
        for (let r = 1; r <= radius; r++) {
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    if (Math.abs(dx) === r || Math.abs(dy) === r) {
                        positions.push([dx, dy]);
                    }
                }
            }
        }
        return positions.map(([dx, dy]) => {
            return this.checkPosition({ x: x + dx, y: y + dy });
        });
    }

    reset() {
        this.agents = [];
    }

    render() {
        let output = "";
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const agentHere = this.agents.find((a) => a.position.x === x && a.position.y === y);
                const obstacleHere = this.obstacles.find((o) => o.position.x === x && o.position.y === y);
                if (agentHere) output += "A";
                else if (obstacleHere) output += "#";
                else output += ".";
            }
            output += "\n";
        }
        console.clear();
        console.log(output);
    }
}

interface SimulationOptions {
    population: number;
    targetSize: number;
    genomeLength: number;
    mutationRate: number;
    inputLayerLength: number;
    hiddenLayers: number;
    outputLayerLength: number;
    reverseSynapses: boolean;
}

export class Simulation {
    genepool: Genome[] = [];
    map: Map;
    accuracy: number = 0;
    targetPosition: Position;
    options: SimulationOptions;

    constructor(width: number, height: number, targets: number, obstacles: number, options: SimulationOptions) {
        this.map = new Map(width, height, targets, obstacles);
        this.options = options;
        this.targetPosition = this.map.findClearPosition();
    }

    run(steps: number) {
        this.map.reset();
        const { population, genomeLength, targetSize, mutationRate, inputLayerLength, hiddenLayers, outputLayerLength, reverseSynapses } = this.options;
        while (this.genepool.length < population) {
            const genome = Genome.create({
                inputLayerLength,
                hiddenLayers,
                outputLayerLength,
                maxLength: genomeLength,
                reverseSynapses
            });
            this.genepool.push(genome);
        }
        this.map.spawnAgents(this.genepool, steps);

        for (let step = 0; step < steps; step++) {
            for (let i = 0; i < this.map.agents.length; i++) {
                const agent = this.map.agents[i];
                const { position, energy } = agent;
                if (!energy) {
                    continue;
                }

                const distance = this.map.distanceToClosestTarget(position);
                const normalizedDistance = Math.max(0, Math.min(1, 1 - distance / Math.sqrt(this.map.width ** 2 + this.map.height ** 2)));
                const normalizedEnergy = Math.max(0, Math.min(1, energy / steps));
                const normalizedAge = Math.max(0, Math.min(1, step / steps));
                const input = this.map.checkPositionSurroundings(position, 2);
                const output = agent.brain.feed([normalizedDistance, normalizedEnergy, normalizedAge, ...input]);
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
                    agent.energy--;
                }
            }
        }
        const reproducers: Genome[] = [];
        this.map.agents.forEach(({ position, genome }) => {
            const close = this.map.targets.some((target) => {
                const dx = Math.abs(position.x - target.position.x);
                const dy = Math.abs(position.y - target.position.y);
                return dx <= Math.floor(this.map.width * targetSize) && dy <= Math.floor(this.map.height * targetSize);
            });
            if (close) reproducers.push(genome);
        });
        if (reproducers.length) {
            const offspring: Genome[] = [];
            while (offspring.length < population - reproducers.length - this.options.population * 0.1) {
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
