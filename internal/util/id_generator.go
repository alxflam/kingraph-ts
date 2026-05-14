package util

type IDGenerator struct {
	ids map[string]int
}

func NewIDGenerator() *IDGenerator {
	return &IDGenerator{ids: map[string]int{}}
}

func (g *IDGenerator) Next(key string) int {
	if _, ok := g.ids[key]; !ok {
		g.ids[key] = 0
		return 0
	}
	g.ids[key]++
	return g.ids[key]
}
