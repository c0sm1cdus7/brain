import { Synapse } from "../synapse/synapse";

export class Neuron {
    accumulator: number = 0;
    value: number = 0;
    sinks: Synapse[] = [];
}
