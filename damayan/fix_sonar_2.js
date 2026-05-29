const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/dispatcher-components/DispatcherPortal.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// Fix S3358 (Nested ternary)
code = code.replace(
  /type === "FIRE" \? "Fire" : type === "AMB" \? "Medical" : "Police"/g,
  '{"FIRE": "Fire", "AMB": "Medical", "POL": "Police"}[type as string]'
);

code = code.replace(
  /done \? "var\(--d-green\)" : active \? "var\(--d-primary\)" : "var\(--d-surface-low\)"/g,
  '(done ? "var(--d-green)" : (active ? "var(--d-primary)" : "var(--d-surface-low)"))' // Sonar still flags nested ternaries even with parens sometimes, but let's try a function.
);

code = code.replace(
  /done \? "var\(--d-green\)" : active \? "var\(--d-primary\)" : "var\(--d-surface-low\)"/g,
  '(() => { if(done) return "var(--d-green)"; if(active) return "var(--d-primary)"; return "var(--d-surface-low)"; })()'
);

// We need to properly extract nested ternaries. Let's do it via regex where possible.
code = code.replace(
  /background: done \? "var\(--d-green\)" : active \? "var\(--d-primary\)" : "var\(--d-surface-low\)"/g,
  'background: (() => { if (done) return "var(--d-green)"; if (active) return "var(--d-primary)"; return "var(--d-surface-low)"; })()'
);

// Another nested ternary at 1536 ?
// Let's check where it is by reading the file content around " ? "
// It's probably `done ? ... : active ? ...` somewhere else too for steps.

// Fix S6439 (Convert conditional to boolean)
// Line 496: `condition && <Component />`
// Let's replace `editing&&<div` with `Boolean(editing) && <div`
code = code.replace(/\{editing&&<div/g, '{Boolean(editing) && <div');

// S1082/S6848 - onClick on div
// We will add role="button" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Enter') ... }}
code = code.replace(/<div([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g, (match, p1, p2, p3) => {
  if (match.includes('role=')) return match;
  return `<div${p1}onClick={${p2}} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { (${p2})(e as any); } }}${p3}>`;
});

// onClick on span
code = code.replace(/<span([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g, (match, p1, p2, p3) => {
  if (match.includes('role=')) return match;
  return `<span${p1}onClick={${p2}} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { (${p2})(e as any); } }}${p3}>`;
});

// S6853 - Form label must be associated with a control
// Some labels don't have htmlFor. Let's just wrap the inputs!
// We can't do this easily with regex. Let's do it if possible:
// `<label>Email or Phone</label>\s*<input` -> `<label>Email or Phone</label><input` (already done by user? No.)

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Fixed more SonarQube issues via script');
