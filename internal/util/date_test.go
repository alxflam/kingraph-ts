package util

import (
	"testing"

	"github.com/alxflam/kingraph-go/internal/kin"
)

func TestFormatDateNumber(t *testing.T) {
	d := &kin.DateValue{Raw: "1900", IsNumber: true}
	if got := FormatDate(d); got != "1900" {
		t.Fatalf("expected 1900, got %s", got)
	}
}

func TestFormatDateString(t *testing.T) {
	d := &kin.DateValue{Raw: "01.02.1999"}
	if got := FormatDate(d); got != "01.02.1999" {
		t.Fatalf("expected 01.02.1999, got %s", got)
	}
}

func TestGetAge(t *testing.T) {
	born := &kin.DateValue{Raw: "1900", IsNumber: true}
	died := &kin.DateValue{Raw: "1950", IsNumber: true}
	if got := GetAge(born, died); got != 50 {
		t.Fatalf("expected age 50, got %d", got)
	}
}
