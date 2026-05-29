const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/dispatcher-components/DispatcherPortal.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Mark props as Readonly (S6759)
// Find `function ComponentName({ ... }: { ... }) {` and wrap the type in Readonly<{ ... }>
code = code.replace(/function ([A-Z][a-zA-Z0-9_]*)\(([^:]+): ({[^}]+(?:}[^)]*)?})\) {/g, (match, p1, p2, p3) => {
    // If already Readonly, skip
    if (p3.startsWith('Readonly<')) return match;
    return `function ${p1}(${p2}: Readonly<${p3}>) {`;
});

// For DashboardPage, it's multi-line
code = code.replace(/function DashboardPage\(\{ incidents, units, onDispatch, onMarkInvalid \}: \{[\s\S]*?\}\) \{/g, (match) => {
    return match.replace(/\{ incidents, units, onDispatch, onMarkInvalid \}: \{/, '{ incidents, units, onDispatch, onMarkInvalid }: Readonly<{').replace(/\}\) \{/, '}>) {');
});

// For other multi-line props
code = code.replace(/function DispatchPage\(\{ incidents, units, onUpdate, onUnitAssign \}: \{[\s\S]*?\}\) \{/g, (match) => {
    return match.replace(/\{ incidents, units, onUpdate, onUnitAssign \}: \{/, '{ incidents, units, onUpdate, onUnitAssign }: Readonly<{').replace(/\}\) \{/, '}>) {');
});

code = code.replace(/function MapMonitoringPage\(\{ incidents, units \}: \{[\s\S]*?\}\) \{/g, (match) => {
    return match.replace(/\{ incidents, units \}: \{/, '{ incidents, units }: Readonly<{').replace(/\}\) \{/, '}>) {');
});

code = code.replace(/function TeamsPage\(\{ units \}: \{[\s\S]*?\}\) \{/g, (match) => {
    return match.replace(/\{ units \}: \{/, '{ units }: Readonly<{').replace(/\}\) \{/, '}>) {');
});

code = code.replace(/function LogPage\(\{ incidents \}: \{[\s\S]*?\}\) \{/g, (match) => {
    return match.replace(/\{ incidents \}: \{/, '{ incidents }: Readonly<{').replace(/\}\) \{/, '}>) {');
});

// 2. globalThis over window (S7764)
code = code.replace(/window\.__dp/g, 'globalThis.__dp');
// S7764 at line 2279: `if (typeof window !== "undefined")`
code = code.replace(/typeof window !== "undefined"/g, 'typeof globalThis !== "undefined"');

// 3. Array index in keys (S6479)
// Instead of replacing manually, we might leave this if it's too complex or just target known ones.
// e.g. .map((x, i) => <div key={i}>)

// 4. Anchor as button (S6844)
code = code.replace(/<a onClick=\{([^}]+)\}>/g, '<button type="button" className="dp-btn-link" onClick={$1}>');

// 5. Redundant fragment (S6749)
// `<> <div ...>...</div> </>` -> hard to regex reliably.

// 6. Number.parseInt (S7773)
code = code.replace(/ parseInt\(/g, ' Number.parseInt(');

// 7. Form labels (S6853)
// `label` without `htmlFor` wrapping an input next to it
// `<label>Email or Phone</label>\n<input` -> `<label>Email or Phone<input`
// Let's not do regex on HTML structure as it's flaky.

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Fixed some SonarQube issues via script');
