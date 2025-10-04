import localforage from "localforage";
localforage.config({
  name: "Clear-fitness-db",
  storeName: "main-storage",
});

// BASE USER INFO
export interface UserData {
  userName: string;
  isNew: boolean;
}
export async function getUserData(): Promise<UserData | null> {
  return await localforage.getItem<UserData>("userdata");
}
export async function setUser(data: UserData): Promise<void> {
  await localforage.setItem("userdata", data);
}
export async function clearUser(): Promise<void> {
  await localforage.removeItem("userdata");
}

// MACROS USER INFO
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
  kcal: number;
  proteins: number;
  fats: number;
  carbs: number;
}
export interface UserMacros {
  maintain: Macros;
  modify: Macros;
}
export async function getMacrosData(): Promise<UserMacros | null> {
  return await localforage.getItem<UserMacros>("usermacros");
}
export async function setMacros(data: UserMacros): Promise<void> {
  await localforage.setItem("usermacros", data);
}

//
export interface BodyData {
  gender: "Male" | "Female" | "Secret";
  age: {
    min: number;
    max: number;
    step: number;
    current: number;
    goal: number;
  };
  height: {
    min: number;
    max: number;
    step: number;
    current: number;
    goal: number;
  };
  weight: {
    min: number;
    max: number;
    step: number;
    current: number;
    goal: number;
  };
  activity: {
    current: number;
    all: {
      text: string;
      val: number;
    }[];
  };
}
export async function getBodyData(): Promise<BodyData | null> {
  return await localforage.getItem<BodyData>("userbody");
}
export async function setBodyData(data: BodyData): Promise<void> {
  await localforage.setItem("userbody", data);
}
