package parity

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"github.com/alxflam/kingraph-go/internal/kin"
	"github.com/alxflam/kingraph-go/internal/render"
)

func TestParity_RenderDot(t *testing.T) {
	tsBin := os.Getenv("KINGRAPH_TS_BIN")
	tsRoot := os.Getenv("KINGRAPH_TS_ROOT")
	if tsBin == "" || tsRoot == "" {
		t.Skip("set KINGRAPH_TS_BIN and KINGRAPH_TS_ROOT to run parity test")
	}

	yamlPath := filepath.Join(tsRoot, "examples", "simpsons.yaml")
	data, err := kin.LoadFromFile(yamlPath)
	if err != nil {
		t.Fatalf("load yaml: %v", err)
	}

	goDot, err := render.Render(data, render.Options{
		Format:        "dot",
		Theme:         "dark",
		DrawDirection: "LR",
	})
	if err != nil {
		t.Fatalf("go render: %v", err)
	}

	cmd := exec.Command(tsBin, "-y", yamlPath, "-f", "dot")
	var stdout bytes.Buffer
	cmd.Stdout = &stdout
	if err := cmd.Run(); err != nil {
		t.Fatalf("ts render: %v", err)
	}

	if normalizeDot(goDot) != normalizeDot(stdout.String()) {
		t.Fatalf("dot mismatch between Go and TypeScript outputs")
	}
}

func normalizeDot(input string) string {
	lines := strings.Split(input, "\n")
	out := make([]string, 0, len(lines))
	inAttrs := false
	attrs := make([]string, 0)

	flush := func() {
		if len(attrs) == 0 {
			return
		}
		sort.Strings(attrs)
		out = append(out, attrs...)
		attrs = attrs[:0]
	}

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasSuffix(trimmed, "[") {
			inAttrs = true
			out = append(out, line)
			continue
		}
		if inAttrs {
			if trimmed == "]" {
				flush()
				out = append(out, line)
				inAttrs = false
				continue
			}
			attrs = append(attrs, line)
			continue
		}
		out = append(out, line)
	}

	if inAttrs {
		flush()
	}

	return strings.Join(out, "\n")
}
