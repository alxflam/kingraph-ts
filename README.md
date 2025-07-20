# kingraph

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](https://github.com/vorburger/kingraph/issues)
[![CI](https://github.com/alxflam/kingraph-ts/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/alxflam/kingraph-ts/actions/workflows/ci.yaml)

> 👪 Plots family trees using TypeScript and Graphviz

A family tree plotter with a very simple syntax. It probably doesn't cover everything [bigger tools](https://gramps-project.org/) do, but covers 90% of it for the sake of simplicity.

![Example Graph](examples/intro.svg)

## Getting started

A family tree is a [YAML](http://yaml.org/) file. To get started, store the following text in a file called `family.yaml`:

```yaml
families:
  - parents: [Marge, Homer]
    children: [Bart, Lisa, Maggie]
  - parents: [Lisa, Milhouse]
    children: [Zia]

people:
  Marge:
    fullname: Marjorie Bouvier Simpson
```

Build the project and then run the CLI application to transform a YAML file into a Graphviz DOT file or SVG:

```sh
npm i
npm run build
./out/index.js -y family.yaml -f dot > family.dot
```

You can also try to generate a SVG with `kingraph-ts` directly by using `--format svg`, but you'll likely [run into memory issues](https://github.com/rstacruz/kingraph/issues/6).

## Further Examples

Spoiler alerts, view at your own risk :)

<details>
<summary><b>Simpsons</b> (simple)</summary>

Source: *[simpsons.yaml](examples/simpsons.yaml)*

> ![Simpsons Example](examples/simpsons.svg)
</details>

<details>
<summary><b>Modern Family</b> (simple with houses)</summary>

Source: *[modernfamily.yaml](examples/modernfamily.yaml)*

> ![Modern Family Example](examples/modernfamily.svg)
</details>

<details>
<summary><b>Harry Potter</b> (larger tree)</summary>

Source: *[potter.yaml](examples/potter.yaml)*

> ![Potter Example](examples/potter.svg)
</details>

<details>
<summary><b>Game of Thrones</b> (overly complicated)</summary>

Source: *[got.yaml](examples/got.yaml)*

> ![GOT Example](examples/got.svg)
</details>

## Documentation

For further reading:

- [Getting started](docs/getting_started.md)
- [Advanced usage](docs/advanced.md)
- [Schema](docs/schema.md)

## Develop
Ensure you have node.js 20 installed and run the following commands:

```sh
npm i
npm run build
```

To execute tests, coverage and mutation tests run the following commands:

```sh
npm run test
npm run coverage
npm run mutate
```

To lint and format the code run the following commands:

```sh
npm run lint
npm run format
```

## Thanks

Authored and initially maintained by Rico Sta. Cruz in 2016 with help from [contributors](http://github.com/vorburger/kingraph/contributors).

Forked in 2022 by [vorburger](https://github.com/vorburger/kingraph).

Forked in 2024 by [alxflam](https://github.com/alxflam/kingraph-ts)
