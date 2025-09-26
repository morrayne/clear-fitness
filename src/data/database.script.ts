import localforage from "localforage";

// Настройка хранилища
const store = localforage.createInstance({
  name: "myAppDB"
});

export interface General {
  weight: number;
  height: number;
  age: number;
  gender: string;
}

export interface Macros {
  kcal: number;
  tdee: number;
  intake: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface Data {
  firstTime: boolean;
  name: string;
}

// ==================== Инициализация ====================
export async function initDB() {
  // Если данных нет, создаём дефолтные значения
  const general = await store.getItem<General>("general");
  if (!general) {
    await store.setItem("general", { weight: 71.5, height: 180, age: 21, gender: "Male" });
  }

  const macros = await store.getItem<Macros>("macros");
  if (!macros) {
    await store.setItem("macros", { kcal: 0, tdee: 1.55, intake: 0, proteins: 0, carbs: 0, fats: 0 });
  }

  const data = await store.getItem<Data>("data");
  if (!data) {
    await store.setItem("data", { firstTime: true, name: "" });
  }
}

// ==================== GENERAL ====================
export async function getGeneral(): Promise<General> {
  return (await store.getItem<General>("general"))!;
}

export async function updateGeneral(g: General) {
  await store.setItem("general", g);
}

// ==================== MACROS ====================
export async function getMacros(): Promise<Macros> {
  return (await store.getItem<Macros>("macros"))!;
}

export async function updateMacros(m: Macros) {
  await store.setItem("macros", m);
}

// ==================== DATA ====================
export async function getData(): Promise<Data> {
  return (await store.getItem<Data>("data"))!;
}

export async function updateData(d: Data) {
  await store.setItem("data", d);
}
