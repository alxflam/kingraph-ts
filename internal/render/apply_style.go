package render

import (
	"encoding/json"
	"regexp"
)

type applyOptions struct {
	Before map[string]any
	After  map[string]any
}

func ApplyStyle(stylesheet map[string]map[string]any, dataStyles map[string]map[string]any, classes []string, options *applyOptions) []string {
	if options == nil {
		options = &applyOptions{}
	}

	result := map[string]any{}
	for k, v := range options.Before {
		result[k] = v
	}

	result = applyStyles(result, stylesheet, classes)
	result = applyStyles(result, dataStyles, classes)

	for k, v := range options.After {
		result[k] = v
	}

	return renderStyle(result)
}

func applyStyles(acc map[string]any, stylesheet map[string]map[string]any, classes []string) map[string]any {
	if stylesheet == nil {
		return acc
	}
	classSet := map[string]bool{}
	for _, class := range classes {
		classSet[class] = true
	}

	for key, style := range stylesheet {
		if !classSet[key] {
			continue
		}
		for k, v := range style {
			acc[k] = v
		}
	}

	return acc
}

func renderStyle(properties map[string]any) []string {
	out := make([]string, 0, len(properties))
	for key, val := range properties {
		if val == nil {
			continue
		}
		out = append(out, key+"="+stringify(val))
	}
	return out
}

var htmlLike = regexp.MustCompile(`^<.*>$`)

func stringify(val any) string {
	if s, ok := val.(string); ok && htmlLike.MatchString(s) {
		return s
	}
	raw, _ := json.Marshal(val)
	return string(raw)
}
