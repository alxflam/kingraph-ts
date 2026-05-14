package reduce

import (
	"testing"

	"github.com/alxflam/kingraph-go/internal/kin"
)

func TestToAncestors(t *testing.T) {
	model := kin.KinModel{
		Families: []kin.Family{
			{
				Parents:  []string{"A", "B"},
				Children: []string{"C"},
				Families: []kin.Family{
					{Parents: []string{"C"}, Children: []string{"D"}},
				},
			},
		},
		People: map[string]kin.Person{
			"A": {},
			"B": {},
			"C": {},
			"D": {},
		},
	}

	reduced, err := ToAncestors(model, "D")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(reduced.People) != 3 {
		t.Fatalf("expected 3 people, got %d", len(reduced.People))
	}
}
