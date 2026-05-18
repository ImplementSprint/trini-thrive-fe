# Project File Structure — trini-thrive-fe

This monorepo contains three Next.js micro-frontend applications (`bayani-hub`, `damayan`, `hope-card`), shared root-level config, and a global test suite.

```
trini-thrive-fe/
├── .github/
│   └── workflows/
│       └── fe-pipeline-caller.yml       # CI/CD pipeline trigger workflow
│
├── bayani-hub/                          # Bayani Hub micro-frontend (Next.js)
│   ├── public/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.css
│   │   │   ├── App.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx               # Root layout
│   │   │   └── page.tsx                 # Root page
│   │   └── lib/
│   │       └── sum.ts                   # Shared utility
│   ├── tests/
│   │   ├── e2e/
│   │   │   └── playwright-e2e.ts        # Playwright end-to-end tests
│   │   └── unit/
│   │       ├── sanity.test.ts
│   │       └── sum.test.ts
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
│
├── damayan/                             # Damayan micro-frontend (Next.js)
│   ├── .vscode/
│   │   └── tasks.json
│   ├── public/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.css
│   │   │   ├── App.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── lib/
│   │       └── sum.ts
│   ├── tests/
│   │   ├── e2e/
│   │   │   └── playwright-e2e.ts
│   │   └── unit/
│   │       ├── sanity.test.ts
│   │       └── sum.test.ts
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
│
├── hope-card/                           # Hope Card micro-frontend (Next.js)
│   ├── .vscode/
│   │   └── tasks.json
│   ├── public/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.css
│   │   │   ├── App.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── lib/
│   │       └── sum.ts
│   ├── tests/
│   │   ├── e2e/
│   │   │   └── playwright-e2e.ts
│   │   └── unit/
│   │       ├── sanity.test.ts
│   │       └── sum.test.ts
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
│
├── public/
│   └── .gitkeep
│
├── tests/                               # Root-level shared tests
│   └── performance/
│       ├── k6-globals.d.ts              # k6 type declarations
│       └── k6-smoke.ts                  # k6 smoke / load test
│
├── .gitignore
├── CICD_MIGRATION_PLAN.html             # CI/CD migration planning doc
├── FILE_STRUCTURE.md                    # This file
├── README.md
└── sonar-project.properties             # SonarQube project config
```

## Summary

| Path | Purpose |
|---|---|
| `bayani-hub/` | Bayani Hub Next.js app — own Docker image, tests, and config |
| `damayan/` | Damayan Next.js app — own Docker image, tests, and config |
| `hope-card/` | Hope Card Next.js app — own Docker image, tests, and config |
| `.github/workflows/` | GitHub Actions CI/CD pipeline definitions |
| `tests/performance/` | k6 performance/load tests shared across apps |
| `sonar-project.properties` | SonarQube static analysis configuration |
