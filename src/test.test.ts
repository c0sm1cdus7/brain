import { Brain } from "./brain";
import { Genome } from "./genome";

const INPUT_LAYER_LENGTH = 2;
const HIDDEN_LAYERS = 2;
const OUTPUT_LAYER_LENGTH = 2;
const GENOME_LENGTH = 1000;

let genome: Genome;
test("Create genome", () => {
    genome = Genome.random({
        inputLayerLength: INPUT_LAYER_LENGTH,
        hiddenLayers: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH,
        length: GENOME_LENGTH
    });
    const shape = genome.getShape();
    expect(genome.genes.length).toBe(GENOME_LENGTH);
    expect(shape.length).toBe(HIDDEN_LAYERS + 2);
    expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
    expect(shape[shape.length - 1]).toBe(OUTPUT_LAYER_LENGTH);
});

let brain: Brain;
test("Create brain", () => {
    brain = new Brain(genome);
    expect(brain).toBeDefined();
});

test("Feed", () => {
    const input = Array.from({ length: INPUT_LAYER_LENGTH }, () => Math.random());
    const output = brain.feed(input);
    expect(output).toBeDefined();
    expect(output.length).toBe(OUTPUT_LAYER_LENGTH);
});

let genome2: Genome;
test("Create another genome", () => {
    genome2 = Genome.random({
        inputLayerLength: INPUT_LAYER_LENGTH,
        hiddenLayers: HIDDEN_LAYERS,
        outputLayerLength: OUTPUT_LAYER_LENGTH,
        length: GENOME_LENGTH
    });
    const shape = genome2.getShape();
    expect(genome2.genes.length).toBe(GENOME_LENGTH);
    expect(shape.length).toBe(HIDDEN_LAYERS + 2);
    expect(shape[0]).toBe(INPUT_LAYER_LENGTH);
    expect(shape[shape.length - 1]).toBe(OUTPUT_LAYER_LENGTH);
});

test("Crossover", () => {
    const offspring = Genome.crossover(genome, genome2, 0.1);
    const brain = new Brain(offspring);
    expect(brain).toBeDefined();
});
