// esbuild.config.mjs
import esbuild from "esbuild";
import { builtinModules } from "module";
import { readFileSync } from "fs";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

const externals = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  "lightningcss",
  "playwright",
  "@supabase/supabase-js",
  "rollup",
  "@rollup/plugin-node-resolve",
  "@rollup/plugin-commonjs",
  "@rollup/plugin-typescript",
  "vite",
];

esbuild
  .build({
    entryPoints: ["index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: "dist",
    external: externals,
    minify: false,
    sourcemap: true,
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
