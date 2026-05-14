package gedcom

import (
	"strings"
	"testing"

	"github.com/alxflam/kingraph-go/internal/kin"
)

func TestToGedcomBasic(t *testing.T) {
	model := kin.KinModel{
		Families: []kin.Family{
			{Parents: []string{"P1"}, Children: []string{"C1"}},
		},
		People: map[string]kin.Person{
			"P1": {GivenName: "Parent", Surname: "One", Gender: "m"},
			"C1": {GivenName: "Child", Surname: "One", Gender: "f"},
		},
	}

	got := ToGedcom(model)
	if !strings.Contains(got, "0 HEAD") {
		t.Fatalf("missing HEAD")
	}
	if !strings.Contains(got, "1 NAME Parent /One/") {
		t.Fatalf("missing parent name")
	}
}
