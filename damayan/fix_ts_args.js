const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/dispatcher-components/DispatcherPortal.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// Replace `(() => ...)(e as any)` with `(() => ...)()`
code = code.replace(/\(\(\) => ([^\)]+)\)\(e as any\)/g, '(() => $1)()');

// What if the function is like `(e) => ...` ?
// `\(\(e\) => ...\)\(e as any\)` is fine.
// What if it is `(() => { ... })(e as any)`?
code = code.replace(/\(\(\) => \{([^}]+)\}\)\(e as any\)/g, '(() => {$1})()');

// Since there could be many inline functions with 0 args, let's just globally replace `)(e as any)` with `()` if preceded by `() => `
code = code.replace(/(\(\) =>[^{]+\))\(e as any\)/g, '$1()');
code = code.replace(/(\(\) => \{[^}]+\})\(e as any\)/g, '$1()');

// If there are specific ones like `() => setIdFile("gov_id.jpg")`, it'll be caught by the above.
fs.writeFileSync(targetFile, code, 'utf8');
console.log('Fixed TS args issues');
