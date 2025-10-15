export interface TypeDefaultConfig {
  general: {
    name: string;
    lang: string;
    isNew: boolean;
  };
  weight: {
    min: number;
    max: number;
    step: number;
    bigStep: number;
    text: string;
    textAlt: string;
    mod: number;
  };
  height: {
    min: number;
    max: number;
    step: number;
    bigStep: number;
    text: string;
    textAlt: string;
    mod: number;
  };
  age: {
    min: number;
    max: number;
    step: number;
    bigStep: number;
    text: string;
    mod: number;
  };
  bf: {
    min: number;
    max: number;
    step: number;
    bigStep: number;
    text: string;
    mod: number;
  };
  activity: number[];
  gender: number[];
  accuracy: string[];
}

export interface TypeDefaultBody {
  currentWeight: number;
  goalWeight: number;
  goalBF: number;
  height: number;
  gender: number;
  age: number;
  activity: number;
  accuracy: "Normal" | "Athletic";
}

export interface TypeFood {
  id: string | number;
  name: string;
  portionSize: number;
  proteins: number;
  carbs: number;
  fats: number;
  kcal: number;
}

export interface TypeMacro {
  weight: number;
  bf: number;
  kcal: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface TypeMacroResult {
  maintain: TypeMacro;
  modify: TypeMacro;
}
