// Define an interface for a person
export interface Person {
  fullname?: string;
  name?: string;
  links?: string[];
  class?: string[];
  gender?: 'm' | 'f';
  born?: number | string;
  died?: number | string;
  picture?: string;
  comment?: string;
}

// Define an interface for a family
export interface Family {
  house?: string;
  links?: string[];
  parents?: string[];
  parents2?: string[];
  children: string[];
  children2?: string[];
  families?: Family[];
}

// Define an interface for a style
export interface Style {
  style: string;
  fillcolor: string;
  penwidth: number;
}

// Define an interface for the main YAML structure
export interface KinModel {
  families: Family[];
  people: {
    [key: string]: Person;
  };
  styles: {
    [key: string]: Style;
  };
}
