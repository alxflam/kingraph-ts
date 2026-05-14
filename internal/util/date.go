package util

import (
	"errors"
	"strconv"
	"time"

	"github.com/alxflam/kingraph-go/internal/kin"
)

func ToDate(value *kin.DateValue) (time.Time, error) {
	if value == nil || value.Raw == "" {
		return time.Time{}, errors.New("empty date")
	}
	if value.IsNumber {
		year, err := strconv.Atoi(value.Raw)
		if err != nil {
			return time.Time{}, err
		}
		return time.Date(year, time.January, 1, 0, 0, 0, 0, time.UTC), nil
	}

	parsed, err := time.Parse("02.01.2006", value.Raw)
	if err != nil {
		return time.Time{}, err
	}
	return parsed, nil
}

func GetAge(born *kin.DateValue, died *kin.DateValue) int {
	bornDate, err := ToDate(born)
	if err != nil {
		return 0
	}
	diedDate, err := ToDate(died)
	if err != nil {
		return 0
	}

	diff := diedDate.Sub(bornDate)
	ageDate := time.Unix(0, diff.Nanoseconds()).UTC()
	return abs(ageDate.Year() - 1970)
}

func FormatDate(value *kin.DateValue) string {
	if value == nil || value.Raw == "" {
		return ""
	}
	if value.IsNumber {
		return value.Raw
	}

	parsed, err := time.Parse("02.01.2006", value.Raw)
	if err != nil {
		return value.Raw
	}
	return parsed.Format("02.01.2006")
}

func ToGedcomDate(value *kin.DateValue) string {
	date, err := ToDate(value)
	if err != nil {
		return ""
	}

	day := date.Day()
	monthNames := []string{"JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"}
	month := monthNames[int(date.Month())-1]
	year := date.Year()

	return fmtInt2(day) + " " + month + " " + strconv.Itoa(year)
}

func fmtInt2(value int) string {
	if value < 10 {
		return "0" + strconv.Itoa(value)
	}
	return strconv.Itoa(value)
}

func abs(value int) int {
	if value < 0 {
		return -value
	}
	return value
}
