const form = document.getElementById("form");
const resultsDiv = document.getElementById("results");
const productsDiv = document.getElementById("products");

const API_KEY = "Ou0O8bfUG3gscBUflI8yd2zoxYphrbVkppQVBruf";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);

  // 🔹 Формула Миффлина-Сан Жеора (BMR)
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const calories = bmr * 1.5; // 🔸 коэффициент активности (будет заменён на динамический)
  const protein = (calories * 0.30) / 4;
  const fat = (calories * 0.30) / 9;
  const carbs = (calories * 0.40) / 4;

  // 🔹 Минимальные потребности (по нормативам)
  const minProtein = weight * 0.8;     // г/день по WHO/FAO/UNU (2007)
  const minFat = weight * 1.0;         // г/день по WHO/FAO (2010)
  const minCarbs = calories / 10;      // грубая оценка — 10 ккал на 1 г углеводов

  resultsDiv.innerHTML = `
    <h2>Целевые значения</h2>
    <p>Калории: ${calories.toFixed(0)} ккал</p>
    <p>Белки: ${protein.toFixed(1)} г, Жиры: ${fat.toFixed(1)} г, Углеводы: ${carbs.toFixed(1)} г</p>

    <h3>Минимальные потребности в нутриентах (по WHO/FAO/UNU, NASEM и др.)</h3>
    <p>Белки: ${minProtein.toFixed(1)} г</p>
    <p>Жиры: ${minFat.toFixed(1)} г</p>
    <p>Углеводы: ${minCarbs.toFixed(1)} г</p>
  `;

  await fetchFoodsForNutrients();
});

// 🟩 Переводы названий нутриентов
const nutrientTranslations = {
  "protein": "Белок",
  "iron": "Железо",
  "vitamin D": "Витамин D",
  "alpha-linolenic acid": "Альфа-линоленовая кислота (ALA)",
  "linoleic acid": "Линолевая кислота (LA)",
  "eicosapentaenoic acid": "Эйкозапентаеновая кислота (EPA)",
  "docosahexaenoic acid": "Докозагексаеновая кислота (DHA)"
};

// 🔄 Поиск продуктов по нескольким ключевым нутриентам
async function fetchFoodsForNutrients() {
  const nutrients = Object.keys(nutrientTranslations);
  productsDiv.innerHTML = "<p>Загрузка продуктов...</p>";

  let html = "<h3>Рекомендованные продукты по значимым нутриентам:</h3><ul>";

  for (const nutrient of nutrients) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrient)}&pageSize=3&api_key=${API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        html += `<li><strong>${nutrientTranslations[nutrient]}</strong>:<ul>`;
        data.foods.forEach(food => {
          html += `<li>${food.description}</li>`;
        });
        html += `</ul></li>`;
      } else {
        html += `<li><strong>${nutrientTranslations[nutrient]}</strong>: нет данных</li>`;
      }
    } catch (error) {
      html += `<li><strong>${nutrientTranslations[nutrient]}</strong>: ошибка загрузки</li>`;
      console.error(`❌ Ошибка для ${nutrient}:`, error);
    }
  }

  html += "</ul>";
  productsDiv.innerHTML = html;
}
