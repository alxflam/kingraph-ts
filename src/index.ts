#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import render from './render.js';
import { KinModel } from './type.js';

yargs(hideBin(process.argv))
  .scriptName('kingraph-ts')
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
        });
    },
    async (argv) => {
      const input = parse(readFileSync(argv.yaml, 'utf8')) as KinModel;
      const format = argv.format as 'dot' | 'svg';

      const result = await render(input, { format });
      process.stdout.write(result);
    }
  )
  .version()
  .help()
  .parse();
