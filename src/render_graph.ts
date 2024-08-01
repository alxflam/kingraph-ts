import join from './join.js';
import slugify from './slugify.js';
import applyStyle from './apply_style.js';
import idGenerator from './id_generator.js';
import COLORS from './defaults/colors.js';
import { Family, KinModel, Person } from './type.js';

const getId = idGenerator();

const LINE2 = '# ' + Array(74).join('-');

export default function render(data: KinModel): string {
  data = Object.assign({}, data);

  return join(
    [
      'digraph G {',
      {
        indent: [
          applyStyle(data, [':bgcolor']),
          'edge [',
          { indent: applyStyle(data, [':edge']) },
          ']',
          '',
          'node [',
          { indent: applyStyle(data, [':node']) },
          ']',
          '',
          applyStyle(data, [':digraph']),
          renderHouse(data)
        ]
      },
      '}'
    ],
    { indent: '  ' }
  );
}

function renderHouse(data: KinModel) {
  const people = data.people || [];
  const families = data.families || [];

  return [
    Object.entries(families).map(([id, f]) => renderFamily(data, f || {}, [id])),
    Object.entries(people).map(([id, p]) => renderPerson(data, p || {}, [id]))
  ];
}

function renderPerson(data: KinModel, person: Person, path: any): any[] {
  const id = path[path.length - 1];
  let label;
  const href = person.links && person.links[0];

  if (person.name || person.fullname || person.gender || person.born || person.died || person.picture) {
    let gender = '';
    if (person.gender) {
      if (person.gender.toLowerCase() === 'f') {
        gender = ' ♀';
      } else if (person.gender.toLowerCase() === 'm') {
        gender = ' ♂';
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
      `${person.name || id}${gender}</td></tr>`;

    if (person.fullname) {
      label += '<tr><td align="center">' + '<font point-size="10" color="#aaaaaa">' + `${person.fullname || person.name}` + `</font></td></tr>`;
    }

    let lifespan: string | undefined = undefined;
    if (person.born && person.died) {
      lifespan = `${'*' + formatDate(toDate(person.born))} — ${
        '†' + formatDate(toDate(person.died)) + ' (' + getAge(toDate(person.born), toDate(person.died)) + ')'
      }`;
    } else if (person.born) {
      lifespan = `${'*' + formatDate(toDate(person.born))}`;
    } else if (person.died) {
      lifespan = `${'†' + formatDate(toDate(person.died))}`;
    }

    if (lifespan) {
      label += '<tr><td align="center">' + '<font point-size="10" color="#aaaaaa">' + `${lifespan}</font></td></tr>`;
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
        applyStyle(data, person.class || [], {
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
  let txt = '';
  txt += person.name + ' ' || '';
  txt += person.fullname || '';
  txt += '\n';
  txt += person.born ? 'Born ' + person.born + ' ' : '';
  txt += person.born && person.died ? ' -- died ' + person.died : '';
  txt += !person.born && person.died ? ' Died ' + person.died : '';
  txt += '\n';
  txt += person.comment ? person.comment.slice(0, 50) + '...' : '';
  txt += '\n';
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
function renderFamily(data: KinModel, family: Family, path: any): any[] {
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
    return { indent: applyStyle(data, classes, { before: before || {} }) };
  }

  function renderHousePrelude() {
    const label = `<<b>${housename}</b>>`;
    const labelhref = family.links && family.links[0];

    return [applyStyle(data, [':house'], { before: { label, labelhref } })];
  }

  function renderSubFamilies() {
    // Reverse the families, because we assume people put "deeper" families last.
    // You want to render the deeper families first so that their parents are placed
    // in those families, rather than the parent families.
    const families = new Array<Family>().concat(family.families || []).reverse();
    return families.map((f, idx) => renderFamily(data, f, path.concat(idx)));
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

function toDate(dateString: string | number): Date {
  // if the dateString is actually a number
  if (typeof dateString === 'number') {
    return new Date(dateString);
  }

  // a complete date is given
  const [day, month, year] = dateString.split('.').map(Number);
  const date = new Date(year, month - 1, day); // month is zero-based
  return date;
}

function getAge(born: Date, died: Date): number {
  const diff = died.valueOf() - born.valueOf();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function formatDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('de', { dateStyle: 'medium' });
  return formatter.format(date);
}
