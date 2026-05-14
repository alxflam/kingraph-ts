package render

import "testing"

func TestJoinIndent(t *testing.T) {
	got := Join([]any{"a {", Indent([]any{"b", "c"}), "}"}, &joinOptions{Sep: "\n", Indent: "  "})
	want := "a {\n  b\n  c\n}"
	if got != want {
		t.Fatalf("unexpected join result:\n%s", got)
	}
}
