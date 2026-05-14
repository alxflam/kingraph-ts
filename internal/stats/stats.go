package stats

import "github.com/alxflam/kingraph-go/internal/kin"

func Statistics(data kin.KinModel) string {
	people := 0
	if data.People != nil {
		people = len(data.People)
	}
	return "People: " + itoa(people) + "\n"
}

func itoa(value int) string {
	if value == 0 {
		return "0"
	}

	out := make([]byte, 0, 12)
	num := value
	for num > 0 {
		digit := byte(num % 10)
		out = append([]byte{digit + '0'}, out...)
		num /= 10
	}
	return string(out)
}
