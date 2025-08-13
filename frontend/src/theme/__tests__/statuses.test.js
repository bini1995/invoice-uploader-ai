import { STATUS_MAP, STATUS_DETAILS, getStatusDetails } from '../statuses';
import fs from 'fs';
import path from 'path';
import { hex as contrast } from 'wcag-contrast';

// helper to resolve CSS variable values from tokens.css
const tokensCss = fs.readFileSync(
  path.join(__dirname, '../../styles/tokens.css'),
  'utf8'
);

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getColor = (varName) => {
  const esc = escapeRegExp(varName);
  const hexMatch = new RegExp(`^\\s*${esc}:\\s*(#[0-9a-fA-F]{6})`, 'm').exec(tokensCss);
  if (hexMatch) return hexMatch[1];
  const varMatch = new RegExp(`^\\s*${esc}:\\s*var\\((--[\\w-]+)(?:,\\s*(#[0-9a-fA-F]{6}))?\\)`, 'm').exec(tokensCss);
  if (varMatch) return varMatch[2] || getColor(varMatch[1]);
  return null;
};

test('every status has mapped class and icon', () => {
  Object.keys(STATUS_MAP).forEach((key) => {
    const detail = getStatusDetails(key);
    expect(detail.class).toBeDefined();
    expect(detail.icon).toBeDefined();
  });
});

test('status classes and icons are unique', () => {
  const classes = new Set();
  const icons = new Set();
  Object.values(STATUS_DETAILS).forEach(({ class: cls, icon }) => {
    expect(classes.has(cls)).toBe(false);
    expect(icons.has(icon)).toBe(false);
    classes.add(cls);
    icons.add(icon);
  });
});

test('status colors meet contrast ratio', () => {
  const textColors = {
    neutral: '#ffffff',
    amber: '#000000',
    green: '#ffffff',
    red: '#ffffff',
  };

  Object.keys(STATUS_DETAILS).forEach((key) => {
    const bg = getColor(`--status-${key}`);
    const fg = textColors[key];
    const ratio = contrast(bg, fg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
