#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import render from './render.js';
import { KinModel } from './type.js';
import statistics from './statistics.js';
import transform from './transform.js';

yargs(hideBin(process.argv))
  .scriptName('kingraph-ts')
  .command(
    'stats',
    'Kingraph statistics',
    (cmd) => {
      return cmd.option('yaml', {
        alias: 'y',
        describe: 'YAML input file',
        type: 'string',
        demandOption: true
      });
    },
    (argv) => {
      const input = parse(readFileSync(argv.yaml, 'utf8')) as KinModel;
      process.stdout.write(statistics(input));
    }
  )
  .command(
    'transform',
    'Transform kingraph file',
    (cmd) => {
      return cmd
        .option('yaml', {
          alias: 'y',
          describe: 'YAML input file',
          type: 'string',
          demandOption: true
        })
        .option('format', {
          alias: 'f',
          describe: 'Target format',
          choices: ['gedcom'],
          default: 'gedcom'
        });
    },
    (argv) => {
      const input = parse(readFileSync(argv.yaml, 'utf8')) as KinModel;
      const format = argv.format as 'gedcom' | 'xml';
      process.stdout.write(transform(input, { format }));
    }
  )
  .command(
    '$0', // the default command is unnamed
    'Generate kingraph from YAML',
    (cmd) => {
      return cmd
        .option('format', {
          alias: 'f',
          describe: 'Target format',
          choices: ['dot', 'svg'],
          default: 'svg'
        })
        .option('yaml', {
          alias: 'y',
          describe: 'YAML input file',
          type: 'string',
          demandOption: true
        })
        .option('theme', {
          alias: 't',
          describe: 'Theme',
          choices: ['light', 'dark'],
          default: 'dark'
        })
        .option('drawDirection', {
          alias: 'd',
          describe: 'Draw Direction',
          choices: ['LR', 'TB'],
          default: 'LR'
        })
        .option('ancestorGraph', {
          describe: 'Ancestor Graph',
          type: 'boolean'
        })
        .option('ancestorLeaf', {
          describe: 'Ancestor Leaf',
          type: 'string'
        });
    },
    async (argv) => {
      const input = parse(readFileSync(argv.yaml, 'utf8')) as KinModel;
      const format = argv.format as 'dot' | 'svg';
      const theme = argv.theme as 'light' | 'dark';
      const drawDirection = argv.drawDirection as 'LR' | 'TB';
      const ancestorGraph = argv.ancestorGraph ? true : false;
      const ancestorLeaf = argv.ancestorLeaf as string | undefined;

      const result = await render(input, { format, theme, drawDirection, ancestorGraph, ancestorLeaf });
      process.stdout.write(result);
    }
  )
  .version()
  .help()
  .parse();
