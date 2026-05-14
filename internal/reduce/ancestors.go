package reduce

import (
	"errors"
	"strconv"

	"github.com/alxflam/kingraph-go/internal/kin"
)

type familyPath struct {
	Path   string
	Family kin.Family
}

func ToAncestors(data kin.KinModel, ancestorLeaf string) (kin.KinModel, error) {
	if data.People == nil {
		return kin.KinModel{}, errors.New("people list is empty")
	}
	if _, ok := data.People[ancestorLeaf]; !ok {
		return kin.KinModel{}, errors.New("person with id " + ancestorLeaf + " not found")
	}

	allFamilies := flattenFamilies(data.Families, "")
	var leafFamily *familyPath
	for i := range allFamilies {
		if contains(allFamilies[i].Family.Children, ancestorLeaf) {
			leafFamily = &allFamilies[i]
			break
		}
	}
	if leafFamily == nil {
		return kin.KinModel{}, errors.New("family for leaf person " + ancestorLeaf + " not found")
	}

	targetFamilies := map[string]bool{}
	targetFamilies[leafFamily.Path] = true
	addParentFamilies(*leafFamily, allFamilies, targetFamilies)

	parentIDs := map[string]bool{}
	for _, f := range allFamilies {
		if !targetFamilies[f.Path] {
			continue
		}
		for _, id := range f.Family.Parents {
			parentIDs[id] = true
		}
	}

	reducedFamilies := rebuildFamilies(data.Families, "", targetFamilies, parentIDs)

	peopleIds := map[string]bool{}
	for _, f := range flattenFamilies(reducedFamilies, "") {
		for _, id := range f.Family.Children {
			peopleIds[id] = true
		}
		for _, id := range f.Family.Parents {
			peopleIds[id] = true
		}
	}

	reducedPeople := map[string]kin.Person{}
	for id, person := range data.People {
		if peopleIds[id] {
			reducedPeople[id] = person
		}
	}

	return kin.KinModel{
		Families:    reducedFamilies,
		People:      reducedPeople,
		Styles:      data.Styles,
		PeopleOrder: data.PeopleOrder,
	}, nil
}

func rebuildFamilies(families []kin.Family, parentPath string, target map[string]bool, parentIDs map[string]bool) []kin.Family {
	out := make([]kin.Family, 0)
	for idx, family := range families {
		path := makePath(parentPath, idx)
		if !target[path] {
			continue
		}

		children := make([]string, 0, len(family.Children))
		for _, child := range family.Children {
			if parentIDs[child] {
				children = append(children, child)
			}
		}

		rebuilt := family
		rebuilt.Children = children
		rebuilt.Families = rebuildFamilies(family.Families, path, target, parentIDs)
		out = append(out, rebuilt)
	}
	return out
}

func addParentFamilies(family familyPath, allFamilies []familyPath, target map[string]bool) {
	for _, parentId := range family.Family.Parents {
		for i := range allFamilies {
			if contains(allFamilies[i].Family.Children, parentId) {
				target[allFamilies[i].Path] = true
				addParentFamilies(allFamilies[i], allFamilies, target)
			}
		}
	}
}

func flattenFamilies(families []kin.Family, parentPath string) []familyPath {
	out := make([]familyPath, 0)
	for idx, family := range families {
		path := makePath(parentPath, idx)
		out = append(out, familyPath{Path: path, Family: family})
		if len(family.Families) > 0 {
			out = append(out, flattenFamilies(family.Families, path)...)
		}
	}
	return out
}

func makePath(parent string, idx int) string {
	if parent == "" {
		return strconv.Itoa(idx)
	}
	return parent + "." + strconv.Itoa(idx)
}

func contains(items []string, value string) bool {
	for _, item := range items {
		if item == value {
			return true
		}
	}
	return false
}
