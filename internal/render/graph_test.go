package render

import (
	"strings"
	"testing"

	"github.com/alxflam/kingraph-go/internal/kin"
)

func TestRenderGraphBasic(t *testing.T) {
	model := kin.KinModel{
		Families:    []kin.Family{{Parents: []string{"A"}, Children: []string{"B"}}},
		People:      map[string]kin.Person{"A": {GivenName: "A"}, "B": {GivenName: "B"}},
		PeopleOrder: []string{"A", "B"},
	}

	dot := RenderGraph(model, "dark", "LR")
	if !strings.Contains(dot, "digraph G") {
		t.Fatalf("expected digraph header")
	}
}
