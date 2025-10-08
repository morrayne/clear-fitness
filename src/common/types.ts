// types.ts

export interface UserData {
  userName: string;
  isNew: boolean;
}

export interface RangeValue {
  min: number;
  max: number;
  step: number;
  current: number;
  goal: number;
}

export interface ActivityLevel {
  text: string;
  val: number;
}

export interface Macros {
  weight: number;
  kcal: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface UserMacros {
  maintain: Macros;
  modify: Macros;
}

export interface BodyData {
  gender: "Male" | "Female" | "Secret";
  age: RangeValue;
  height: RangeValue;
  weight: RangeValue;
  activity: {
    current: number;
    all: ActivityLevel[];
  };
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: number;
}

export interface FoodDatabase {
  default: FoodItem[];
  custom: FoodItem[];
}

export interface DailyEntry {
  date: string; // "YYYY-MM-DD"
  foods: FoodItem[];
  macros: {
    kcal: number;
    proteins: number;
    fats: number;
    carbs: number;
  };
}

export interface HeaderButtonType {
  text: string;
  textDisplay: boolean;
  svg: string;
  path: string;
}

export interface HeaderLinkData {
  path: string;
  svg: string;
  text: string;
  textDisplay: boolean;
}


export interface FoodItemProps {
  kcal: number;
  portionSize: number;
  carbs: number;
  fats: number;
  proteins: number;
  name: string;
  deleteBtn: boolean;
}

export interface ScaleProps {
  min: number;
  max: number;
  step: number;
  mod: number;
  text: string;
  modelValue: number;
  bigStep: number;
}

export interface BodyData {
  gender: "Male" | "Female" | "Secret";
  age: RangeValue;
  height: RangeValue;
  weight: RangeValue;
  activity: {
    current: number;
    all: ActivityLevel[];
  };
}
