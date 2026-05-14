package render

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/render/defaults"
	"github.com/alxflam/kingraph-go/internal/util"
)

var line2 = "# " + strings.Repeat("-", 73)

func RenderGraph(data kin.KinModel, theme string, drawDirection string) string {
	style := mergeStyles(defaults.DefaultStyles, themeStyles(theme))
	style[":digraph"]["rankdir"] = drawDirection

	return Join([]any{
		"digraph G {",
		Indent([]any{
			ApplyStyle(style, data.Styles, []string{":bgcolor"}, nil),
			"edge [",
			Indent([]any{ApplyStyle(style, data.Styles, []string{":edge"}, nil)}),
			"]",
			"",
			"node [",
			Indent([]any{ApplyStyle(style, data.Styles, []string{":node"}, nil)}),
			"]",
			"",
			ApplyStyle(style, data.Styles, []string{":digraph"}, nil),
			renderHouse(data, style),
		}),
		"}",
	}, &joinOptions{Indent: "  "})
}

func renderHouse(data kin.KinModel, style map[string]map[string]any) []any {
	people := data.People
	families := data.Families

	peopleOrder := data.PeopleOrder
	if len(peopleOrder) == 0 && len(people) > 0 {
		for key := range people {
			peopleOrder = append(peopleOrder, key)
		}
		sort.Strings(peopleOrder)
	}

	result := make([]any, 0)
	for i := range families {
		result = append(result, renderFamily(data, families[i], []string{fmt.Sprintf("%d", i)}, style))
	}
	for _, id := range peopleOrder {
		person, ok := people[id]
		if !ok {
			continue
		}
		result = append(result, renderPerson(data, person, []string{id}, style))
	}

	return result
}

func renderPerson(data kin.KinModel, person kin.Person, path []string, style map[string]map[string]any) []any {
	id := path[len(path)-1]
	href := ""
	if len(person.Links) > 0 {
		href = person.Links[0]
	}

	label := id
	if person.GivenName != "" || person.Surname != "" || person.Gender != "" || (person.Born != nil && person.Born.Raw != "") || (person.Died != nil && person.Died.Raw != "") || person.Picture != "" {
		gender := ""
		if strings.EqualFold(person.Gender, "f") {
			gender = " " + defaults.Symbols.Female
		} else if strings.EqualFold(person.Gender, "m") {
			gender = " " + defaults.Symbols.Male
		}

		picture := ""
		if person.Picture != "" {
			picture = fmt.Sprintf("<tr><td><img scale='true' src='%s' /></td></tr>", person.Picture)
		}

		displayName := person.GivenName
		if displayName == "" {
			displayName = person.MainGivenName
		}
		if displayName == "" {
			displayName = id
		}

		parts := []string{
			"<<table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"2\" width=\"4\">",
			picture,
			"<tr><td align=\"center\">" + displayName + gender + "</td></tr>",
		}

		if person.Surname != "" {
			parts = append(parts, "<tr><td align=\"center\"><font point-size=\"10\" color=\"#aaaaaa\">"+person.GivenName+"  "+person.Surname+"</font></td></tr>")
		}

		if person.Profession != "" {
			parts = append(parts, "<tr><td align=\"center\"><font point-size=\"10\" color=\"#aaaaaa\">"+person.Profession+"</font></td></tr>")
		}

		if person.Born != nil && person.Born.Raw != "" {
			born := defaults.Symbols.Born + util.FormatDate(person.Born)
			if person.Birthplace != "" {
				born += " in " + person.Birthplace
			}
			parts = append(parts, "<tr><td align=\"center\"><font point-size=\"10\" color=\"#aaaaaa\">"+born+"</font></td></tr>")
		}

		if person.Died != nil && person.Died.Raw != "" {
			died := defaults.Symbols.Deceased + util.FormatDate(person.Died)
			if person.Born != nil && person.Born.Raw != "" {
				age := util.GetAge(person.Born, person.Died)
				died += fmt.Sprintf(" (%d)", age)
			}
			if person.Burialplace != "" {
				died += " in " + person.Burialplace
			}
			parts = append(parts, "<tr><td align=\"center\"><font point-size=\"10\" color=\"#aaaaaa\">"+died+"</font></td></tr>")
		}

		parts = append(parts, "</table>>")
		label = strings.Join(parts, "")
	}

	before := map[string]any{"label": label}
	if href != "" {
		before["href"] = href
	}

	return []any{
		fmt.Sprintf("%s [", escape(id)),
		"tooltip=" + jsonString(renderPersonTooltip(person)),
		Indent([]any{ApplyStyle(style, data.Styles, person.Class, &applyOptions{Before: before})}),
		"]",
	}
}

func renderPersonTooltip(person kin.Person) string {
	txt := ""
	if person.GivenName != "" {
		txt += person.GivenName + " "
	}
	if person.Surname != "" {
		txt += person.Surname
	}
	if len(txt) > 0 {
		txt += "\\n"
	}

	if person.Born != nil && person.Born.Raw != "" {
		txt += "Born " + person.Born.Raw + " "
	}
	if person.Born != nil && person.Died != nil && person.Died.Raw != "" {
		txt += " -- Died " + person.Died.Raw
	}
	if (person.Born == nil || person.Born.Raw == "") && person.Died != nil && person.Died.Raw != "" {
		txt += " Died " + person.Died.Raw
	}
	if len(txt) > 0 {
		txt += "\\n"
	}
	if person.Comment != "" {
		if len(person.Comment) > 50 {
			txt += person.Comment[:50] + "..."
		} else {
			txt += person.Comment
		}
	}
	return txt
}

func renderFamily(data kin.KinModel, family kin.Family, path []string, styleSheet map[string]map[string]any) []any {
	slug := util.Slugify(path, "_")
	color := defaults.Colors[idFor("family")%len(defaults.Colors)]

	parents := append([]string{}, family.Parents...)
	parents2 := append([]string{}, family.Parents2...)
	children := append([]string{}, family.Children...)
	children2 := append([]string{}, family.Children2...)
	housename := family.House

	hasParents := len(parents)+len(parents2) > 0
	hasChildren := len(children)+len(children2) > 0

	union := "union_" + slug
	kids := "siblings_" + slug

	renderParents := func() []any {
		items := []any{
			union + " [",
			styleBlock([]string{":union"}, styleSheet, data.Styles, map[string]any{"fillcolor": color}),
			"]",
			"",
		}
		if len(parents) > 0 {
			items = append(items, []any{"{" + joinEscaped(parents) + "} -> " + union + " [", styleBlock([]string{":parent-link"}, styleSheet, data.Styles, map[string]any{"color": color}), "]"})
		}
		if len(parents2) > 0 {
			items = append(items, []any{"{" + joinEscaped(parents2) + "} -> " + union + " [", styleBlock([]string{":parent-link", ":parent2-link"}, styleSheet, data.Styles, map[string]any{"color": color}), "]"})
		}
		return items
	}

	renderLink := func() []any {
		return []any{union + " -> " + kids + " [", styleBlock([]string{":parent-link", ":parent-child-link"}, styleSheet, data.Styles, map[string]any{"color": color}), "]"}
	}

	renderKids := func() []any {
		items := []any{
			kids + " [",
			styleBlock([]string{":children"}, styleSheet, data.Styles, map[string]any{"fillcolor": color}),
			"]",
		}
		if len(children) > 0 {
			items = append(items, []any{kids + " -> {" + joinEscaped(children) + "} [", styleBlock([]string{":child-link"}, styleSheet, data.Styles, map[string]any{"color": color}), "]"})
		}
		if len(children2) > 0 {
			items = append(items, []any{kids + " -> {" + joinEscaped(children2) + "} [", styleBlock([]string{":child-link", ":child2-link"}, styleSheet, data.Styles, map[string]any{"color": color}), "]"})
		}
		return items
	}

	body := make([]any, 0)
	if housename != "" {
		body = append(body, renderHousePrelude(housename, family.Links, styleSheet, data.Styles))
	}
	body = append(body,
		renderSubFamilies(data, family, path, styleSheet),
		"",
		"# Family "+summarizeFamily(family),
		line2,
		"",
	)
	if hasParents {
		body = append(body, renderParents())
	}
	if hasParents && hasChildren {
		body = append(body, renderLink())
	}
	if hasChildren {
		body = append(body, renderKids())
	}

	return []any{
		"",
		"subgraph cluster_family_" + slug + " {",
		styleBlock([]string{":family"}, styleSheet, data.Styles, nil),
		Indent(body),
		"}",
	}

}

func renderHousePrelude(housename string, links []string, styleSheet map[string]map[string]any, dataStyles map[string]map[string]any) []any {
	label := "<<b>" + housename + "</b>>"
	before := map[string]any{"label": label}
	if len(links) > 0 {
		before["labelhref"] = links[0]
	}
	return []any{ApplyStyle(styleSheet, dataStyles, []string{":house"}, &applyOptions{Before: before})}
}

func renderSubFamilies(data kin.KinModel, family kin.Family, path []string, styleSheet map[string]map[string]any) []any {
	families := append([]kin.Family{}, family.Families...)
	for i := len(families)/2 - 1; i >= 0; i-- {
		opp := len(families) - 1 - i
		families[i], families[opp] = families[opp], families[i]
	}

	result := make([]any, 0, len(families))
	for idx, f := range families {
		result = append(result, renderFamily(data, f, append(path, fmt.Sprintf("%d", idx)), styleSheet))
	}
	return result
}

func styleBlock(classes []string, styleSheet map[string]map[string]any, dataStyles map[string]map[string]any, before map[string]any) indentBlock {
	return Indent([]any{ApplyStyle(styleSheet, dataStyles, classes, &applyOptions{Before: before})})
}

func summarizeFamily(family kin.Family) string {
	parents := append([]string{}, family.Parents...)
	parents = append(parents, family.Parents2...)
	children := append([]string{}, family.Children...)
	children = append(children, family.Children2...)
	return "[" + strings.Join(filterEmpty(parents), ", ") + "] -> [" + strings.Join(filterEmpty(children), ", ") + "]"
}

func filterEmpty(items []string) []string {
	out := make([]string, 0, len(items))
	for _, item := range items {
		if strings.TrimSpace(item) == "" {
			continue
		}
		out = append(out, item)
	}
	return out
}

func joinEscaped(items []string) string {
	escaped := make([]string, 0, len(items))
	for _, item := range items {
		escaped = append(escaped, escape(item))
	}
	return strings.Join(escaped, ", ")
}

func escape(str string) string {
	if isPlainIdentifier(str) {
		return str
	}
	raw, _ := json.Marshal(str)
	return string(raw)
}

func isPlainIdentifier(str string) bool {
	if str == "" {
		return false
	}
	for _, r := range str {
		if r < 'A' || (r > 'Z' && r < 'a') || r > 'z' {
			return false
		}
	}
	return true
}

func jsonString(value string) string {
	raw, _ := json.Marshal(value)
	return string(raw)
}

func themeStyles(theme string) map[string]map[string]any {
	if theme == "light" {
		return defaults.LightModeDeviations
	}
	return defaults.DarkModeDeviations
}

func mergeStyles(base map[string]map[string]any, overlay map[string]map[string]any) map[string]map[string]any {
	result := map[string]map[string]any{}
	for key, val := range base {
		result[key] = cloneMap(val)
	}
	for key, val := range overlay {
		if existing, ok := result[key]; ok {
			for k, v := range val {
				existing[k] = v
			}
			continue
		}
		result[key] = cloneMap(val)
	}
	return result
}

func cloneMap(input map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range input {
		out[k] = v
	}
	return out
}

var idCounter = util.NewIDGenerator()

func idFor(key string) int {
	return idCounter.Next(key)
}
