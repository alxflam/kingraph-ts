package util

import (
	"strings"
)

func Slugify(object any, sep string) string {
	if sep == "" {
		sep = "_"
	}

	switch v := object.(type) {
	case []string:
		parts := make([]string, 0, len(v))
		for _, item := range v {
			parts = append(parts, Slugify(item, sep))
		}
		return strings.Join(parts, sep)
	case []any:
		parts := make([]string, 0, len(v))
		for _, item := range v {
			parts = append(parts, Slugify(item, sep))
		}
		return strings.Join(parts, sep)
	default:
		return snakeCase(fmtAny(object), sep)
	}
}

func snakeCase(input string, sep string) string {
	parts := make([]string, 0)
	current := strings.Builder{}
	for _, r := range strings.ToLower(input) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			current.WriteRune(r)
		} else if current.Len() > 0 {
			parts = append(parts, current.String())
			current.Reset()
		}
	}
	if current.Len() > 0 {
		parts = append(parts, current.String())
	}
	return strings.Join(parts, sep)
}

func fmtAny(value any) string {
	switch v := value.(type) {
	case string:
		return v
	default:
		return ""
	}
}
