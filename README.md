# Eager Wing

A next-generation browser-based **MMO game** built with **Babylon.js**, **Vue 3**, and **Vite**.  
Real-time 3D battles, persistent worlds, and modular architecture — all powered by modern web technology.

---

## Badges

[![License](https://img.shields.io/github/license/theycantrevealus/eager-wing?style=flat-square)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/theycantrevealus/eager-wing/ci.yml?style=flat-square)](https://github.com/theycantrevealus/eager-wing/actions)
[![Semantic Release](https://img.shields.io/badge/release-semantic--release-blue?style=flat-square)](https://semantic-release.gitbook.io/)
[![Commitlint](https://img.shields.io/badge/commitlint-enabled-brightgreen?style=flat-square)](https://commitlint.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![Last Commit](https://img.shields.io/github/last-commit/theycantrevealus/eager-wing?style=flat-square)](https://github.com/theycantrevealus/eager-wing/commits/main)
[![Version](https://img.shields.io/github/v/release/theycantrevealus/eager-wing?style=flat-square)](https://github.com/theycantrevealus/eager-wing/releases)

---

## Features

- TypeScript-powered, clean and scalable codebase
- Modular Babylon.js game engine
- Fast builds and hot reloads with Vite
- Reactive UI built using Vue 3 + Pinia
- Automated releases with Semantic Release
- Commit message linting with Commitlint + Husky
- Extensible architecture for multiplayer gameplay

---

## Tech Stack

| Category         | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| 3D Engine        | [Babylon.js](https://www.babylonjs.com/)                   |
| Frontend         | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)  |
| State Management | [Pinia](https://pinia.vuejs.org/)                          |
| Language         | [TypeScript](https://www.typescriptlang.org/)              |
| CI/CD            | [GitHub Actions](https://github.com/features/actions)      |
| Release System   | [Semantic Release](https://semantic-release.gitbook.io/)   |
| Linting          | [Commitlint](https://commitlint.js.org/), ESLint, Prettier |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/theycantrevealus/eager-wing.git
cd eager-wing
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Then open your browser at **http://localhost:5173**

---

## Scripts

| Command   | Description                       |
| --------- | --------------------------------- |
| `dev`     | Start local dev server            |
| `build`   | Build production bundle           |
| `preview` | Preview built app locally         |
| `lint`    | Lint code using ESLint            |
| `release` | Trigger semantic release pipeline |

---

## Project Structure

```
eager-wing/
├── src/
│   ├── assets/          # Static assets (models, textures, sounds)
│   ├── components/      # Vue components
│   ├── core/            # Game engine logic (BabylonJS scenes, systems)
│   ├── stores/          # Pinia stores
│   ├── utils/           # Helper functions
│   ├── App.vue          # Root Vue component
│   └── main.ts          # Entry point
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Commit Guidelines

This project follows **Conventional Commits** for consistent commit messages.

**Examples:**

```bash
feat(core): add spaceship movement system
fix(ui): fix minimap icon scaling
docs(readme): update contributing guide
refactor(engine): optimize collision detection
test(core): add unit tests for physics
chore(release): 1.2.0

```

> Tip: Use `npm commit` (if Commitizen is set up) to auto-format commit messages.

---

## Automated Releases

Semantic Release automatically:

- Analyzes commit messages
- Bumps version numbers
- Publishes new releases on GitHub
- Updates changelogs

---

## Deployment

Build and preview the production version:

```bash
npm build
npm preview
```

Output files will be generated in the `/dist` directory.

---

## Contributing

Contributions, issues, and feature requests are welcome!  
Check the [issues page](https://github.com/theycantrevealus/eager-wing/issues).

**How to contribute:**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a Pull Request

---

## Author

**Eager Wing Team**

- GitHub: [@theycantrevealus](https://github.com/theycantrevealus)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- [Babylon.js](https://www.babylonjs.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- Open source community ❤️

---

> "Fly beyond the horizon — the world awaits the eager."
