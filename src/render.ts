import renderGraph from './render_graph.js';
import { instance } from '@viz-js/viz';
import { JSDOM } from 'jsdom';
import { Family, KinModel } from './type.js';

/**
 * Renders the graph in 'dot' or 'svg' file format.
 *
 * @param options specifies rendering options (theme and file format)
 *
 */
export default async function render(
  data: KinModel,
  options: { format: 'dot' | 'svg'; theme: 'dark' | 'light'; drawDirection: 'LR' | 'TB'; ancestorGraph: boolean; ancestorLeaf: string | undefined }
): Promise<string> {
  const format = options.format;

  if (options.ancestorGraph && options.ancestorLeaf) {
    // filter the kinmodel for direct ancestors of the ancestorLeaf

    // first find the leaf person
    const ancestorLeafPerson = data.people[options.ancestorLeaf];
    if (!ancestorLeafPerson) {
      throw new Error(`Person with id ${options.ancestorLeaf} not found`);
    }

    // find the family where the leaf person is a child
    const allFamilies = flattenFamilies(data.families);
    const leafFamily = allFamilies.find((f) => f.children.includes(options.ancestorLeaf!));
    if (!leafFamily) {
      throw new Error(`Family for leaf person ${options.ancestorLeaf} not found`);
    }

    // TODO probably is an issue as families are flattened, but need to be within nested structure
    const familiesForLeaf: Family[] = [];
    familiesForLeaf.push(leafFamily);
    addParentFamilies(leafFamily, allFamilies, familiesForLeaf);

    // eslint-disable-next-line no-inner-declarations
    function rebuildFamilyTree(families: Family[], targetFamilies: Family[]): Family[] {
      return families
        .filter((f) => targetFamilies.includes(f))
        .map((f) => {
          const directAncestorChildren = f.children.filter((childId) => {
            return targetFamilies.some((tf) => tf.parents?.includes(childId));
          });
          return {
            ...f,
            children: directAncestorChildren,
            families: rebuildFamilyTree(f.families || [], targetFamilies)
          };
        });
    }

    const reducedFamilies = rebuildFamilyTree(data.families, familiesForLeaf);
    data.families = reducedFamilies;

    // now filter people to only include the people in the families
    const peopleIds = new Set<string>();
    const allReducedFamilies = flattenFamilies(reducedFamilies);

    allReducedFamilies.forEach((family) => {
      family.children.forEach((childId) => {
        peopleIds.add(childId);
      });
      family.parents?.forEach((parentId) => {
        peopleIds.add(parentId);
      });
    });

    // remove all records of people in data.people not in peopleIds
    Object.keys(data.people).forEach((id) => {
      if (!peopleIds.has(id)) {
        delete data.people[id];
      }
    });
  }

  const dot = renderGraph(data, options.theme, options.drawDirection);

  switch (format) {
    case 'dot':
      return dot;
    case 'svg':
      try {
        const window = new JSDOM().window;
        global.DOMParser = window.DOMParser;
        global.XMLSerializer = window.XMLSerializer;

        const viz = await Promise.resolve(instance());
        // TODO to support images, the images need to be given as an option, e.g.:
        // images: [{ name: 'person.jpg', width: 100, height: 100 }]
        const svg = viz.renderSVGElement(dot, { format, engine: 'dot' });

        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg);
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).DOMParser;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).XMLSerializer;
      }
  }
}

function flattenFamilies(families: Family[]): Family[] {
  const result: Family[] = [];

  function recurse(familyList: Family[]) {
    familyList.forEach((family) => {
      result.push(family);
      if (family.families) {
        recurse(family.families);
      }
    });
  }

  recurse(families);
  return result;
}

function addParentFamilies(family: Family | undefined, allFamilies: Family[], familiesForLeaf: Family[]): void {
  if (family?.parents) {
    family.parents.forEach((parentId) => {
      const parentFamily = allFamilies.find((f) => f.children.includes(parentId));
      if (parentFamily) {
        familiesForLeaf.push(parentFamily);
        addParentFamilies(parentFamily, allFamilies, familiesForLeaf);
      }
    });
  }
}
