# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0 Unreleased]

### Added
- script to generate example SVGs
- CI with linting, formatting, unit tests, code coverage, mutation testing and example SVG generation
- dark and light theme
- LR and TB layout draw directions
- `statistics` command providing model statistics
- `transform` command providing model transformation to `GEDCOM`
- profession, burial and birth place properties
- ancestor subgraph rendering

### Changed
- transformed project sources to TypeScript
- use `wasm-graphviz` for SVG generation instead of `viz-js/viz`
- updated to Node 24
