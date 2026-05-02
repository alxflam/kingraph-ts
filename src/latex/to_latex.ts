import { flattenFamilies } from '../reduce_tree.js';
import { KinModel, Person } from '../type.js';

export default function toLatexGraph(data: KinModel, generations: number, ancestorLeaf: string): string {
  // capture flattened families from the original data before reduction
  const flattenedFamilies = flattenFamilies(data.families);

  // recursive renderer: produce parent[...] block for a given person id
  function renderParentRec(personId: string, depth: number): string {
    const pid = sanitizeId(personId);
    const person = data.people ? data.people[personId] : undefined;

    const parts: string[] = [];
    parts.push(`parent[id=parent_${pid}]{%`);

    // person node first
    parts.push('  ' + makePersonNode(personId, person));

    if (depth > 0) {
      // find a family where this person is a child
      const fam = flattenedFamilies.find((f) => f.children && f.children.includes(personId));
      if (fam && fam.parents && fam.parents.length) {
        // order parents: paternal (male) first, then maternal
        const parentsOrdered = [...fam.parents].sort((a, b) => {
          const pa = data.people?.[a]?.gender;
          const pb = data.people?.[b]?.gender;
          if (pa === 'm' && pb !== 'm') return -1;
          if (pb === 'm' && pa !== 'm') return 1;
          return a.localeCompare(b);
        });

        for (const parentId of parentsOrdered) {
          if (data.people[parentId]) {
            const sub = renderParentRec(parentId, depth - 1);
            const indented = sub
              .split('\n')
              .map((l) => '  ' + l)
              .join('\n');
            parts.push(indented);
          }
        }
      }
    }

    parts.push('}%');
    return parts.join('\n');
  }

  return renderParentRec(ancestorLeaf, generations);
}

function formatDate(d: number | string | undefined): string | null {
  if (!d) return null;
  return String(d);
}

function sanitizeId(s: string): string {
  return s.replace(/[^A-Za-z0-9_-]/g, '_');
}

function escapeTex(s: string | undefined): string {
  if (!s) return '';
  return String(s).replace(/([{}\\%$#_&^~])/g, '\\$1');
}

// TODO: highlight mainGivenName in name

function makePersonNode(id: string, p: Person | undefined): string {
  const pid = sanitizeId(id);
  const lines: string[] = [];
  const gender = p?.gender === 'm' ? 'male' : p?.gender === 'f' ? 'female' : '';
  if (gender) lines.push(`${gender},`);
  const name = p ? (p.mainGivenName || p.givenName || '') + (p.surname ? ` ${p.surname}` : '') : '';
  lines.push(`name={${escapeTex(name)}},`);
  const sname = p
    ? p.mainGivenName || p.givenName
      ? `${(p.mainGivenName || p.givenName || 'unknown').split(' ')[0][0]}. ${p.surname || ''}`
      : p.surname || ''
    : '';
  if (sname) lines.push(`shortname={${escapeTex(sname)}},`);
  const birth = formatDate(p?.born) || '';
  const bplace = p?.birthplace || '';
  lines.push(`birth={${escapeTex(birth)}}{${escapeTex(bplace)}},`);
  const death = formatDate(p?.died) || '';
  const dplace = p?.burialplace || '';
  lines.push(`death={${escapeTex(death)}}{${escapeTex(dplace)}},`);
  if (p?.comment) lines.push(`comment={${escapeTex(p.comment)}},`);
  return `g[id=person_${pid}]{%\n    ${lines.join('\n    ')}\n  }%`;
}
