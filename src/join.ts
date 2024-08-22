/**
 * Joins everything in `array` recursively.
 *
 *     join(['a', ['b', 'c']], { sep: ',' })
 *     => 'a,b,c'
 *
 * To make an indentation, make a `{indent: [...]}` object.
 *
 *     join(['a {', {indent: ['b', 'c']}, '}'], { sep: '\n' })
 *     => 'a {\n  b\n  c\n}'
 */

export default function join(array: any[], options?: { prefix?: string; indent?: string; sep?: string }) {
  const prefix = options?.prefix ?? '';
  const indent = options?.indent ?? '\t';

  return flatten(array)
    .map((frag: any) => {
      if (!frag.indent) return prefix + frag;
      return join(frag.indent, Object.assign({}, options, { prefix: prefix + indent }));
    })
    .join(options?.sep ?? '\n');
}

function flatten(array: any) {
  if (array === null || array === undefined || array === false) return [];
  if (!Array.isArray(array)) return [array];

  return array.reduce((acc, frag) => {
    return acc.concat(flatten(frag));
  }, []);
}
