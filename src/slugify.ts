export default function slugify(object: string | object, options?: { sep?: string }): string {
  const sep = options?.sep ?? '_';

  if (Array.isArray(object)) {
    return object.map((f) => slugify(f, options)).join(sep);
  }

  return snakeCase(object.toString(), sep);
}

function snakeCase(str: string, sep: string): string {
  // TODO snake case actually
  // but also not working for a single string actually...
  // better: transforms to valid dot identifier
  return str
    .toLowerCase()
    .match(/[a-z0-9]+/g)!
    .join(sep);
}
