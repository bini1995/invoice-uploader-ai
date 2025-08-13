# Using Design Tokens

Design tokens live in `src/styles/tokens.css` and expose semantic CSS variables
for colors, spacing, typography, motion and more. Tailwind is configured to map
its theme extensions to these variables so utilities like `bg-surface` and
`text-ink` reference the tokens instead of hard‑coded values.

The current token version is defined by `--token-version` (presently `1`).
Increment this when introducing breaking palette changes.

## In CSS

```css
.my-card {
  background: var(--bg-surface);
  color: var(--text-default);
  box-shadow: var(--shadow-e1);
}
```

## In Tailwind

```jsx
<div className="bg-surface text-ink p-4 shadow-e1">Hello</div>
```

Accent color, font family and theme mode can be customized through the built-in
ThemePicker component. These selections are persisted to `localStorage` and
applied on page load to avoid flashes.
