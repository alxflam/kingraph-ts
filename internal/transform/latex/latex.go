package latex

import (
	"strings"

	"github.com/alxflam/kingraph-go/internal/kin"
)

func ToLatexGraph(data kin.KinModel, generations int, ancestorLeaf string) string {
	flattenedFamilies := flattenFamilies(data.Families)

	var renderParentRec func(personId string, depth int) string
	renderParentRec = func(personId string, depth int) string {
		pid := sanitizeId(personId)
		person := data.People[personId]

		parts := []string{
			"parent[id=parent_" + pid + "]{%",
			"  " + makePersonNode(personId, person),
		}

		if depth > 0 {
			fam := findFamilyByChild(flattenedFamilies, personId)
			if fam != nil && len(fam.Parents) > 0 {
				parentsOrdered := append([]string{}, fam.Parents...)
				sortParents(parentsOrdered, data.People)
				for _, parentId := range parentsOrdered {
					if _, ok := data.People[parentId]; !ok {
						continue
					}
					sub := renderParentRec(parentId, depth-1)
					parts = append(parts, indentBlock(sub, "  "))
				}
			}
		}

		parts = append(parts, "}%")
		return strings.Join(parts, "\n")
	}

	return renderParentRec(ancestorLeaf, generations)
}

func flattenFamilies(families []kin.Family) []kin.Family {
	out := make([]kin.Family, 0)
	for _, family := range families {
		out = append(out, family)
		if len(family.Families) > 0 {
			out = append(out, flattenFamilies(family.Families)...)
		}
	}
	return out
}

func findFamilyByChild(families []kin.Family, childId string) *kin.Family {
	for i := range families {
		if contains(families[i].Children, childId) {
			return &families[i]
		}
	}
	return nil
}

func sortParents(parents []string, people map[string]kin.Person) {
	sortFunc := func(a, b string) bool {
		pa := people[a].Gender
		pb := people[b].Gender
		if pa == "m" && pb != "m" {
			return true
		}
		if pb == "m" && pa != "m" {
			return false
		}
		return a < b
	}

	for i := 1; i < len(parents); i++ {
		j := i
		for j > 0 && sortFunc(parents[j], parents[j-1]) {
			parents[j], parents[j-1] = parents[j-1], parents[j]
			j--
		}
	}
}

func sanitizeId(s string) string {
	out := make([]rune, 0, len(s))
	for _, r := range s {
		if (r >= 'A' && r <= 'Z') || (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			out = append(out, r)
		} else {
			out = append(out, '_')
		}
	}
	return string(out)
}

func escapeTex(s string) string {
	if s == "" {
		return ""
	}
	replacer := strings.NewReplacer(
		"\\", "\\\\",
		"{", "\\{",
		"}", "\\}",
		"%", "\\%",
		"$", "\\$",
		"#", "\\#",
		"_", "\\_",
		"&", "\\&",
		"^", "\\^",
		"~", "\\~",
	)
	return replacer.Replace(s)
}

func formatDate(d *kin.DateValue) string {
	if d == nil || d.Raw == "" {
		return ""
	}
	return d.Raw
}

func makePersonNode(id string, p kin.Person) string {
	pid := sanitizeId(id)
	lines := []string{}
	if p.Gender == "m" {
		lines = append(lines, "male,")
	} else if p.Gender == "f" {
		lines = append(lines, "female,")
	}

	name := ""
	if p.MainGivenName != "" {
		name = p.MainGivenName
	} else if p.GivenName != "" {
		name = p.GivenName
	}
	if p.Surname != "" {
		if name != "" {
			name += " " + p.Surname
		} else {
			name = p.Surname
		}
	}
	lines = append(lines, "name={"+escapeTex(name)+"},")

	shortName := ""
	if p.MainGivenName != "" || p.GivenName != "" {
		given := p.MainGivenName
		if given == "" {
			given = p.GivenName
		}
		parts := strings.Fields(given)
		if len(parts) > 0 {
			shortName = string(parts[0][0]) + "."
		}
		if p.Surname != "" {
			if shortName != "" {
				shortName += " " + p.Surname
			} else {
				shortName = p.Surname
			}
		}
	} else if p.Surname != "" {
		shortName = p.Surname
	}

	if shortName != "" {
		lines = append(lines, "shortname={"+escapeTex(shortName)+"},")
	}

	birth := formatDate(p.Born)
	birthPlace := p.Birthplace
	lines = append(lines, "birth={"+escapeTex(birth)+"}{"+escapeTex(birthPlace)+"},")

	death := formatDate(p.Died)
	deathPlace := p.Burialplace
	lines = append(lines, "death={"+escapeTex(death)+"}{"+escapeTex(deathPlace)+"},")

	if p.Comment != "" {
		lines = append(lines, "comment={"+escapeTex(p.Comment)+"},")
	}

	return "g[id=person_" + pid + "]{%\n    " + strings.Join(lines, "\n    ") + "\n  }%"
}

func indentBlock(block string, prefix string) string {
	lines := strings.Split(block, "\n")
	for i, line := range lines {
		lines[i] = prefix + line
	}
	return strings.Join(lines, "\n")
}

func contains(items []string, value string) bool {
	for _, item := range items {
		if item == value {
			return true
		}
	}
	return false
}
