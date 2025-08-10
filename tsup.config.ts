import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["esm"],
    sourcemap: true,
    dts: true,
    clean: true,
    target: "es2021"
});
