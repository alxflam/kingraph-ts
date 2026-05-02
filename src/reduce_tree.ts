import { Family, KinModel } from './type.js';

export default function reduceToAncestors(data: KinModel, ancestorLeaf: string) {
  // first find the leaf person
  const ancestorLeafPerson = data.people[ancestorLeaf];
  if (!ancestorLeafPerson) {
    throw new Error(`Person with id ${ancestorLeaf} not found`);
  }

  // find the family where the leaf person is a child
  const allFamilies = flattenFamilies(data.families);
  const leafFamily = allFamilies.find((f) => f.children.includes(ancestorLeaf!));
  if (!leafFamily) {
    throw new Error(`Family for leaf person ${ancestorLeaf} not found`);
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

export function flattenFamilies(families: Family[]): Family[] {
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
