package kin

import (
	"strconv"
)

type DateValue struct {
	Raw      string
	IsNumber bool
}

func (d *DateValue) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var i int
	if err := unmarshal(&i); err == nil {
		d.Raw = strconv.Itoa(i)
		d.IsNumber = true
		return nil
	}

	var s string
	if err := unmarshal(&s); err == nil {
		d.Raw = s
		d.IsNumber = false
		return nil
	}

	return nil
}
