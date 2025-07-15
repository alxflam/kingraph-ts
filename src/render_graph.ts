/* eslint-disable @typescript-eslint/no-explicit-any */
import join from './join.js';
import slugify from './slugify.js';
import applyStyle from './apply_style.js';
import idGenerator from './id_generator.js';
import COLORS from './defaults/colors.js';
import { Family, KinModel, Person } from './type.js';
import { DEFAULT_STYLES, DARK_MODE_DEVIATIONS, LIGHT_MODE_DEVIATIONS } from './defaults/styles.js';
import { merge } from 'lodash-es';
import { formatDate, getAge } from './date_utils.js';
import SYMBOLS from './defaults/symbols.js';

const getId = idGenerator();

const LINE2 = '# ' + Array(74).join('-');

export default function render(data: KinModel, theme: 'dark' | 'light', drawDirection: 'LR' | 'TB'): string {
  const style = merge(DEFAULT_STYLES, theme === 'dark' ? DARK_MODE_DEVIATIONS : LIGHT_MODE_DEVIATIONS);
  style[':digraph'].rankdir = drawDirection;

  return join(
    [
      'digraph G {',
      {
        indent: [
          applyStyle(style, data, [':bgcolor']),
          'edge [',
          { indent: applyStyle(style, data, [':edge']) },
          ']',
          '',
          'node [',
          { indent: applyStyle(style, data, [':node']) },
          ']',
          '',
          applyStyle(style, data, [':digraph']),
          renderHouse(data, style)
        ]
      },
      '}'
    ],
    { indent: '  ' }
  );
}

function renderHouse(data: KinModel, style: Record<string, object>) {
  const people = data.people || [];
  const families = data.families || [];

  return [
    Object.entries(families).map(([id, f]) => renderFamily(data, f || {}, [id], style)),
    Object.entries(people).map(([id, p]) => renderPerson(data, p || {}, [id], style))
  ];
}

function renderPerson(data: KinModel, person: Person, path: string[], style: Record<string, object>): any[] {
  const id = path[path.length - 1];
  let label;
  const href = person.links && person.links[0];

  if (person.givenName || person.surname || person.gender || person.born || person.died || person.picture) {
    let gender = '';
    if (person.gender) {
      if (person.gender.toLowerCase() === 'f') {
        gender = ' ' + SYMBOLS.female;
      } else if (person.gender.toLowerCase() === 'm') {
        gender = ' ' + SYMBOLS.male;
      }
    }

    let picture = '';
    if (person.picture) {
      picture = `<tr><td><img scale='true' src='${person.picture}' /></td></tr>`;
    }

    label =
      '<<table align="center" border="0" cellpadding="0" cellspacing="2" width="4">' +
      `${picture}` +
      '<tr><td align="center">' +
      `${person.givenName || person.mainGivenName || id}${gender}</td></tr>`;

    if (person.surname) {
      label += '<tr><td align="center">' + '<font point-size="10" color="#aaaaaa">' + `${person.givenName}  ${person.surname}` + `</font></td></tr>`;
    }

    if (person.profession) {
      label += '<tr><td align="center">' + '<font point-size="10" color="#aaaaaa">' + `${person.profession}` + `</font></td></tr>`;
    }

    if (person.born) {
      let born = `${SYMBOLS.born + formatDate(person.born)}`;
      if (person.birthplace) {
        born += ` in ${person.birthplace}`;
      }
      label += '<tr><td align="center">' + '<font point-size="10" color="#aaaaaa">' + `${born}</font></td></tr>`;
    }

    if (person.died) {
      let died = `${SYMBOLS.deceased + formatDate(person.died)}`;
      if (person.born && person.died) {
        const age = getAge(person.born, person.died);
        died += ` (${age})`;
      }
      if (person.burialplace) {
        died += ` in ${person.burialplace}`;
      }
      label += '<tr><td align="center">' + '<font point-size="10" color="#aaaaaa">' + `${died}</font></td></tr>`;
    }

    label += '</table>>';
  } else {
    label = id;
  }

  return [
    `"${id}" [`,
    'tooltip=' + '"' + renderPersonTooltip(person) + '"',
    {
      indent: [
        applyStyle(style, data, person.class || [], {
          before: {
            label,
            href
          }
        })
      ]
    },
    ']'
  ];
}

function renderPersonTooltip(person: Person) {
  // \\n is used as newline because some dotparsers don't support the regular \n
  // nevertheless the result will be the same
  let txt = '';
  txt += person.givenName + ' ' || '';
  txt += person.surname || '';
  txt += txt.length > 0 ? '\\n' : '';
  txt += person.born ? 'Born ' + person.born + ' ' : '';
  txt += person.born && person.died ? ' -- Died ' + person.died : '';
  txt += !person.born && person.died ? ' Died ' + person.died : '';
  txt += txt.length > 0 ? '\\n' : '';
  txt += person.comment ? person.comment.slice(0, 50) + '...' : '';
  return txt;
}

/*
 * For comments
 */

function summarizeFamily(family: Family): string {
  const parents = new Array<string>()
    .concat(family.parents || [])
    .concat(family.parents2 || [])
    .filter(Boolean);

  const children = new Array<string>()
    .concat(family.children || [])
    .concat(family.children2 || [])
    .filter(Boolean);

  return `[${parents.join(', ')}] -> [${children.join(', ')}]`;
}

/*
 * Renders a family subgraph
 */
function renderFamily(data: KinModel, family: Family, path: any, styleSheet: Record<string, object>): any[] {
  const slug = slugify(path);
  const color = COLORS[getId('family') % COLORS.length];
  const parents = [...(family.parents || [])];
  const parents2 = family.parents2 || [];
  const children = family.children || [];
  const children2 = family.children2 || [];
  const housename = family.house;

  const hasParents = parents.length + parents2.length > 0;
  const hasChildren = children.length + children2.length > 0;

  const union = `union_${slug}`;
  const kids = `siblings_${slug}`;

  return [
    '',
    `subgraph cluster_family_${slug} {`,
    style([':family']),
    {
      indent: [
        housename && renderHousePrelude(),
        renderSubFamilies(),
        '',
        `# Family ${summarizeFamily(family)}`,
        LINE2,
        '',
        hasParents && renderParents(),
        hasParents && hasChildren && renderLink(),
        hasChildren && renderKids()
      ]
    },
    '}'
  ];

  function style(classes: string[], before?: object) {
    return { indent: applyStyle(styleSheet, data, classes, { before: before || {} }) };
  }

  function renderHousePrelude() {
    const label = `<<b>${housename}</b>>`;
    const labelhref = family.links && family.links[0];

    return [applyStyle(styleSheet, data, [':house'], { before: { label, labelhref } })];
  }

  function renderSubFamilies() {
    // Reverse the families, because we assume people put "deeper" families last.
    // You want to render the deeper families first so that their parents are placed
    // in those families, rather than the parent families.
    const families = new Array<Family>().concat(family.families || []).reverse();
    return families.map((f, idx) => renderFamily(data, f, path.concat(idx), styleSheet));
  }

  function renderParents() {
    return [
      `${union} [`,
      style([':union'], { fillcolor: color }),
      ']',
      '',
      parents.length > 0 && [`{${parents.map(escape).join(', ')}} -> ${union} [`, style([':parent-link'], { color }), ']'],
      parents2.length > 0 && [`{${parents2.map(escape).join(', ')}} -> ${union} [`, style([':parent-link', ':parent2-link'], { color }), ']']
    ];
  }

  function renderLink() {
    return [`${union} -> ${kids} [`, style([':parent-link', ':parent-child-link'], { color: color }), ']'];
  }

  function renderKids() {
    return [
      `${kids} [`,
      style([':children'], { fillcolor: color }),
      `]`,

      children.length > 0 && [`${kids} -> {${children.map(escape).join(', ')}} [`, style([':child-link'], { color }), ']'],

      children2.length > 0 && [`${kids} -> {${children2.map(escape).join(', ')}} [`, style([':child-link', ':child2-link'], { color }), ']']
    ];
  }
}

/*
 * Escapes a name into a node name.
 */
function escape(str: string): string {
  if (/^[A-Za-z]+$/.test(str)) {
    return str;
  } else {
    return JSON.stringify(str);
  }
}
