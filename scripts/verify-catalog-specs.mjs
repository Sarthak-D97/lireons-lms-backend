import fs from 'fs';
import path from 'path';

const root = process.cwd();
const packageFiles = ['package.json'];

for (const scope of ['apps', 'packages']) {
  const scopePath = path.join(root, scope);
  if (!fs.existsSync(scopePath)) continue;

  for (const entry of fs.readdirSync(scopePath)) {
    const packageJsonPath = path.join(scopePath, entry, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      packageFiles.push(path.relative(root, packageJsonPath));
    }
  }
}

const internalNames = new Set();
for (const file of packageFiles) {
  const json = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  if (typeof json.name === 'string' && json.name.length > 0) {
    internalNames.add(json.name);
  }
}

const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const violations = [];

for (const file of packageFiles) {
  const json = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

  for (const section of sections) {
    const deps = json[section] ?? {};

    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec !== 'string') continue;

      if (internalNames.has(name)) {
        if (!spec.startsWith('workspace:')) {
          violations.push(`${file} :: ${section} :: ${name} must use workspace:* (found \"${spec}\")`);
        }
        continue;
      }

      if (!spec.startsWith('catalog:')) {
        violations.push(`${file} :: ${section} :: ${name} must use catalog: (found \"${spec}\")`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Dependency spec policy violations:\n');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Dependency spec policy check passed for ${packageFiles.length} package.json files.`);
