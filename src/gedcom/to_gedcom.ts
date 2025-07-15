import IdGenerator from './id_generator.js';
import { Family, KinModel } from '../type.js';
import { toGedcomDate } from './utils.js';

export default function toGedcom(data: KinModel): string {
  let gedcom = '0 HEAD\n1 SOUR kingraph-ts\n2 VERS 0.3.0\n2 NAME kingraph-ts\n';
  gedcom += '1 SUBM @SUBM@\n';
  gedcom += '1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n1 LANG English\n\n';
  gedcom += '0 @SUBM@ SUBM\n1 NAME\n';

  const personIds = Object.keys(data.people);
  const personMap = new Map<string, string>();
  const personIdGen = new IdGenerator();
  const familyIdGen = new IdGenerator();

  const personToFamily = new Map<string, string[]>();
  const personToChildFamily = new Map<string, string[]>();

  let families = '';

  personIds.forEach((id) => {
    personMap.set(id, personIdGen.next());
  });

  data.families.forEach((family) => {
    const id = familyIdGen.next();
    processFamily(family, id);
  });

  Object.entries(data.people).map(([id, person]) => {
    const gedcomId = personMap.get(id);
    gedcom += `0 @I${gedcomId}@ INDI\n`;

    // TODO split in model correctly...
    // remove fullname, only sur and givennames and mainGivenName
    if (person.givenName || person.surname) {
      gedcom += `1 NAME ${person.givenName} /${person.surname}/\n`;
      gedcom += `2 TYPE birth\n`;
      gedcom += `2 GIVN ${person.givenName}\n`;
      gedcom += `2 SURN ${person.surname}\n`;
      if (person.mainGivenName) {
        gedcom += `2 _RUFNAME ${person.mainGivenName}\n`;
      }
    }

    if (person.gender) {
      gedcom += `1 SEX ${person.gender.toUpperCase()}\n`;
    }

    // FAMS for parent in family
    const familiesForPerson = personToFamily.get(id) || [];
    familiesForPerson.forEach((familyId) => {
      gedcom += `1 FAMS @F${familyId}@\n`;
    });

    // FAMC for child in family
    const childFamilies = personToChildFamily.get(id) || [];
    childFamilies.forEach((familyId) => {
      gedcom += `1 FAMC @F${familyId}@\n`;
      gedcom += `2 PEDI birth\n`;
    });

    if (person.born || person.birthplace) {
      gedcom += `1 BIRT\n`;
      if (person.born) {
        gedcom += `2 DATE ${toGedcomDate(person.born)}\n`;
      }
      if (person.birthplace) {
        gedcom += `2 PLAC ${person.birthplace}\n`;
      }
    }

    if (person.died || person.burialplace) {
      gedcom += `1 DEAT\n`;
      if (person.died) {
        gedcom += `2 DATE ${toGedcomDate(person.died)}\n`;
      }
      if (person.burialplace) {
        gedcom += `2 PLAC ${person.burialplace}\n`;
      }
    }

    if (person.profession) {
      gedcom += `1 OCCU ${person.profession}\n`;
    }

    gedcom += `\n`;
  });

  function processFamily(family: Family, familyId: string) {
    families += `0 @F${familyId}@ FAM\n`;

    if (family.parents) {
      family.parents.forEach((parentId) => {
        const familiesForPerson = personToFamily.get(parentId) || [];
        familiesForPerson.push(familyId);
        personToFamily.set(parentId, familiesForPerson);

        const parent = data.people[parentId];
        if (parent) {
          const parentGedcomId = personMap.get(parentId);
          if (!parent.gender) {
            families += `1 HUSB @I${parentGedcomId}@\n`;
          } else if (parent.gender === 'm') {
            families += `1 HUSB @I${parentGedcomId}@\n`;
          } else if (parent.gender === 'f') {
            families += `1 WIFE @I${parentGedcomId}@\n`;
          }
        }
      });
    }

    if (family.children) {
      family.children.forEach((childId) => {
        personToChildFamily.set(childId, [...(personToChildFamily.get(childId) || []), familyId]);
        const childGedcomId = personMap.get(childId);
        if (childGedcomId) {
          families += `1 CHIL @I${childGedcomId}@\n`;
        }
      });
    }

    gedcom += `\n`;

    if (family.families) {
      family.families.forEach((subFamily) => {
        const id = familyIdGen.next();
        processFamily(subFamily, id);
      });
    }
  }

  gedcom += families;
  gedcom += '0 TRLR\n';
  return gedcom;
}
