package kin

type Person struct {
	GivenName     string     `yaml:"givenName"`
	MainGivenName string     `yaml:"mainGivenName"`
	Surname       string     `yaml:"surname"`
	Links         []string   `yaml:"links"`
	Class         []string   `yaml:"class"`
	Gender        string     `yaml:"gender"`
	Born          *DateValue `yaml:"born"`
	Died          *DateValue `yaml:"died"`
	Birthplace    string     `yaml:"birthplace"`
	Burialplace   string     `yaml:"burialplace"`
	Profession    string     `yaml:"profession"`
	Picture       string     `yaml:"picture"`
	Comment       string     `yaml:"comment"`
	Name          string     `yaml:"name"`
	FullName      string     `yaml:"fullname"`
}

type Family struct {
	House     string   `yaml:"house"`
	Links     []string `yaml:"links"`
	Parents   []string `yaml:"parents"`
	Parents2  []string `yaml:"parents2"`
	Children  []string `yaml:"children"`
	Children2 []string `yaml:"children2"`
	Families  []Family `yaml:"families"`
}

type KinModel struct {
	Families    []Family                  `yaml:"families"`
	People      map[string]Person         `yaml:"people"`
	Styles      map[string]map[string]any `yaml:"styles"`
	PeopleOrder []string                  `yaml:"-"`
}
