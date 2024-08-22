export default function idGen() {
  const ids: Record<string, number> = {};

  return function (key: string): number {
    if (typeof ids[key] === 'undefined') {
      return (ids[key] = 0);
    } else {
      return ++ids[key];
    }
  };
}
