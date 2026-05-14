package kin

import (
	"errors"
	"os"
	"sort"

	yamlv3 "go.yaml.in/yaml/v3"
)

func LoadFromFile(path string) (KinModel, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return KinModel{}, err
	}

	var model KinModel
	if err := yamlv3.Unmarshal(data, &model); err != nil {
		return KinModel{}, err
	}

	order, err := extractPeopleOrder(data)
	if err != nil {
		return KinModel{}, err
	}

	if len(order) == 0 && model.People != nil {
		for key := range model.People {
			order = append(order, key)
		}
		sort.Strings(order)
	}

	model.PeopleOrder = order
	return model, nil
}

func extractPeopleOrder(data []byte) ([]string, error) {
	var root yamlv3.Node
	if err := yamlv3.Unmarshal(data, &root); err != nil {
		return nil, err
	}
	if len(root.Content) == 0 {
		return nil, errors.New("empty yaml document")
	}

	mapping := root.Content[0]
	if mapping.Kind != yamlv3.MappingNode {
		return nil, nil
	}

	for i := 0; i < len(mapping.Content); i += 2 {
		key := mapping.Content[i]
		val := mapping.Content[i+1]
		if key.Value != "people" {
			continue
		}
		if val.Kind != yamlv3.MappingNode {
			return nil, nil
		}

		order := make([]string, 0, len(val.Content)/2)
		for j := 0; j < len(val.Content); j += 2 {
			order = append(order, val.Content[j].Value)
		}
		return order, nil
	}

	return nil, nil
}
