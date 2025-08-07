#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const allowPath = path.join(__dirname, 'allowed-invoice-paths.txt');
const allowed = fs
  .readFileSync(allowPath, 'utf-8')
  .split('\n')
  .map(f => f.trim())
  .filter(Boolean);

const grep = spawnSync('git', ['grep', '-l', '/invoices'], { cwd: repoRoot, encoding: 'utf-8' });
if (grep.status !== 0 && grep.stdout.trim() === '') {
  process.exit(0);
}
const files = grep.stdout.trim().split('\n').filter(Boolean);
const allowListFile = path.relative(repoRoot, allowPath);
const offenders = files.filter(
  f => f !== allowListFile && !allowed.includes(f)
);

if (offenders.length > 0) {
  console.error('Deprecated /invoices references found in:');
  offenders.forEach(f => console.error('  ' + f));
  console.error('Please migrate to /api/claims before adding new /invoices references.');
  process.exit(1);
} else {
  console.log('No new deprecated /invoices references found.');
}
