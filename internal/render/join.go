package render

import "fmt"

type joinOptions struct {
	Prefix string
	Indent string
	Sep    string
}

type indentBlock struct {
	Items []any
}

func Join(items []any, opts *joinOptions) string {
	options := joinOptions{Prefix: "", Indent: "\t", Sep: "\n"}
	if opts != nil {
		if opts.Prefix != "" {
			options.Prefix = opts.Prefix
		}
		if opts.Indent != "" {
			options.Indent = opts.Indent
		}
		if opts.Sep != "" {
			options.Sep = opts.Sep
		}
	}

	flattened := flatten(items)
	out := make([]string, 0, len(flattened))
	for _, frag := range flattened {
		if block, ok := frag.(indentBlock); ok {
			next := joinOptions{
				Prefix: options.Prefix + options.Indent,
				Indent: options.Indent,
				Sep:    options.Sep,
			}
			out = append(out, Join(block.Items, &next))
			continue
		}
		if s, ok := frag.(string); ok {
			out = append(out, options.Prefix+s)
			continue
		}
		out = append(out, options.Prefix+fmt.Sprint(frag))
	}
	return joinStrings(out, options.Sep)
}

func Indent(items []any) indentBlock {
	return indentBlock{Items: items}
}

func flatten(items []any) []any {
	if items == nil {
		return nil
	}

	out := make([]any, 0)
	for _, item := range items {
		switch v := item.(type) {
		case nil:
			continue
		case bool:
			if !v {
				continue
			}
			out = append(out, "true")
		case []any:
			out = append(out, flatten(v)...)
		case []string:
			for _, s := range v {
				out = append(out, s)
			}
		default:
			out = append(out, v)
		}
	}
	return out
}

func joinStrings(items []string, sep string) string {
	if len(items) == 0 {
		return ""
	}
	if len(items) == 1 {
		return items[0]
	}

	total := 0
	for _, item := range items {
		total += len(item)
	}
	total += len(sep) * (len(items) - 1)

	buf := make([]byte, 0, total)
	for i, item := range items {
		if i > 0 {
			buf = append(buf, sep...)
		}
		buf = append(buf, item...)
	}

	return string(buf)
}
