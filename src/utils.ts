import { randomInt } from "crypto";

export function randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randomInteger(min: number, max: number): number {
    return randomInt(min, max + 1);
}
