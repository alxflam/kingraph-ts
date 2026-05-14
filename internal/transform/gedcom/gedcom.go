package gedcom

import (
	"fmt"
	"strings"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/util"
)

func ToGedcom(data kin.KinModel) string {
	var gedcom strings.Builder
	gedcom.WriteString("0 HEAD\n1 SOUR kingraph-go\n2 VERS 0.3.0\n2 NAME kingraph-go\n")
	gedcom.WriteString("1 SUBM @SUBM@\n")
	gedcom.WriteString("1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n1 LANG English\n\n")
	gedcom.WriteString("0 @SUBM@ SUBM\n1 NAME\n")

	personIds := make([]string, 0, len(data.People))
	if len(data.PeopleOrder) > 0 {
		personIds = append(personIds, data.PeopleOrder...)
	} else {
		for id := range data.People {
			personIds = append(personIds, id)
		}
	}

	personMap := map[string]string{}
	personIdGen := util.NewIDGenerator()
	familyIdGen := util.NewIDGenerator()

	personToFamily := map[string][]string{}
	personToChildFamily := map[string][]string{}

	var families strings.Builder

	for _, id := range personIds {
		personMap[id] = fmt.Sprintf("%d", personIdGen.Next("person"))
	}

	for _, family := range data.Families {
		familyId := fmt.Sprintf("%d", familyIdGen.Next("family"))
		processFamily(data, family, familyId, &families, personMap, personToFamily, personToChildFamily, familyIdGen)
	}

	for _, id := range personIds {
		person := data.People[id]
		gedcomId := personMap[id]
		gedcom.WriteString(fmt.Sprintf("0 @I%s@ INDI\n", gedcomId))

		if person.GivenName != "" || person.Surname != "" {
			gedcom.WriteString(fmt.Sprintf("1 NAME %s /%s/\n", person.GivenName, person.Surname))
			gedcom.WriteString("2 TYPE birth\n")
			gedcom.WriteString(fmt.Sprintf("2 GIVN %s\n", person.GivenName))
			gedcom.WriteString(fmt.Sprintf("2 SURN %s\n", person.Surname))
			if person.MainGivenName != "" {
				gedcom.WriteString(fmt.Sprintf("2 _RUFNAME %s\n", person.MainGivenName))
			}
		}

		if person.Gender != "" {
			gedcom.WriteString(fmt.Sprintf("1 SEX %s\n", strings.ToUpper(person.Gender)))
		}

		familiesForPerson := personToFamily[id]
		for _, familyId := range familiesForPerson {
			gedcom.WriteString(fmt.Sprintf("1 FAMS @F%s@\n", familyId))
		}

		childFamilies := personToChildFamily[id]
		for _, familyId := range childFamilies {
			gedcom.WriteString(fmt.Sprintf("1 FAMC @F%s@\n", familyId))
			gedcom.WriteString("2 PEDI birth\n")
		}

		if (person.Born != nil && person.Born.Raw != "") || person.Birthplace != "" {
			gedcom.WriteString("1 BIRT\n")
			if person.Born != nil && person.Born.Raw != "" {
				gedcom.WriteString(fmt.Sprintf("2 DATE %s\n", util.ToGedcomDate(person.Born)))
			}
			if person.Birthplace != "" {
				gedcom.WriteString(fmt.Sprintf("2 PLAC %s\n", person.Birthplace))
			}
		}

		if (person.Died != nil && person.Died.Raw != "") || person.Burialplace != "" {
			gedcom.WriteString("1 DEAT\n")
			if person.Died != nil && person.Died.Raw != "" {
				gedcom.WriteString(fmt.Sprintf("2 DATE %s\n", util.ToGedcomDate(person.Died)))
			}
			if person.Burialplace != "" {
				gedcom.WriteString(fmt.Sprintf("2 PLAC %s\n", person.Burialplace))
			}
		}

		if person.Profession != "" {
			gedcom.WriteString(fmt.Sprintf("1 OCCU %s\n", person.Profession))
		}

		gedcom.WriteString("\n")
	}

	gedcom.WriteString(families.String())
	gedcom.WriteString("0 TRLR\n")
	return gedcom.String()
}

func processFamily(data kin.KinModel, family kin.Family, familyId string, families *strings.Builder, personMap map[string]string, personToFamily map[string][]string, personToChildFamily map[string][]string, familyIdGen *util.IDGenerator) {
	families.WriteString(fmt.Sprintf("0 @F%s@ FAM\n", familyId))

	if len(family.Parents) > 0 {
		for _, parentId := range family.Parents {
			personToFamily[parentId] = append(personToFamily[parentId], familyId)
			parent := data.People[parentId]
			if parentId != "" {
				parentGedcomId := personMap[parentId]
				if parent.Gender == "" || parent.Gender == "m" {
					families.WriteString(fmt.Sprintf("1 HUSB @I%s@\n", parentGedcomId))
				} else if parent.Gender == "f" {
					families.WriteString(fmt.Sprintf("1 WIFE @I%s@\n", parentGedcomId))
				}
			}
		}
	}

	if len(family.Children) > 0 {
		for _, childId := range family.Children {
			personToChildFamily[childId] = append(personToChildFamily[childId], familyId)
			childGedcomId := personMap[childId]
			if childGedcomId != "" {
				families.WriteString(fmt.Sprintf("1 CHIL @I%s@\n", childGedcomId))
			}
		}
	}

	families.WriteString("\n")

	if len(family.Families) > 0 {
		for _, sub := range family.Families {
			id := fmt.Sprintf("%d", familyIdGen.Next("family"))
			processFamily(data, sub, id, families, personMap, personToFamily, personToChildFamily, familyIdGen)
		}
	}
}
