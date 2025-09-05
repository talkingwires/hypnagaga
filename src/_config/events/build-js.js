import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import esbuild from 'esbuild';

export const buildJs = async (inputPath, outputPath) => {
  const result = await esbuild.build({
    target: 'es2020',
    entryPoints: [inputPath],
    bundle: true,
    minify: true,
    write: false
  });

  const output = result.outputFiles[0].text;

  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, output);

  return output;
};

export const buildAllJs = async () => {
  console.log("Starting buildAllJs...");
  const tasks = [];

  const inlineBundleFiles = await fg(['src/assets/scripts/bundle/**/*.js']);
  console.log("Found inline bundle files:", inlineBundleFiles);
  for (const inputPath of inlineBundleFiles) {
    const baseName = path.basename(inputPath);
    const outputPath = `src/_includes/scripts/${baseName}`;
    console.log(`Processing inline bundle: ${inputPath} -> ${outputPath}`);
    tasks.push(buildJs(inputPath, outputPath));
  }

  const componentFiles = await fg(['src/assets/scripts/components/**/*.js']);
  console.log("Found component files:", componentFiles);
  for (const inputPath of componentFiles) {
    const baseName = path.basename(inputPath);
    const outputPath = `dist/assets/scripts/components/${baseName}`;
    console.log(`Processing component: ${inputPath} -> ${outputPath}`);
    tasks.push(buildJs(inputPath, outputPath));
  }

  await Promise.all(tasks);
  console.log("Finished buildAllJs.");
};
