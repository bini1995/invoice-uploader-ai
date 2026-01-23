const semver = require('semver');
const required = '>=20';
if (!semver.satisfies(process.version, required)) {
  console.error(`\nError: Node.js ${required} required. Current ${process.version}.\n`);
  process.exit(1);
}
