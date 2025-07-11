const form = document.getElementById("form");
const resultsDiv = document.getElementById("results");
const productsDiv = document.getElementById("products");

const API_KEY = "Ou0O8bfUG3gscBUflI8yd2zoxYphrbVkppQVBruf";

// Словарь приоритетных нутриентов с переводами и суточными нормами (можно подключать из JSON)
const nutrientNeeds = {
  "protein": { label: "Белок", unit: "г", daily: 48 },
  "fat": { label: "Жиры", unit: "г", daily: 60 },
  "carbohydrate": { label: "Углеводы", unit: "г", daily: 210 },
  "iron": { label: "Железо", unit: "мг", daily: 18 },
  "vitamin d": { label: "Витамин D", unit: "мкг", daily: 15 },
  "alpha-linolenic acid": { label: "Альфа-линоленовая кислота (ALA)", unit: "г", daily: 1.1 },
  "linoleic acid": { label: "Линолевая кислота (LA)", unit: "г", daily: 11 },
  "eicosapentaenoic acid": { label: "Эйкозапентаеновая кислота (EPA)", unit: "г", daily: 0.25 },
  "docosahexaenoic acid": { label: "Докозагексаеновая кислота (DHA)", unit: "г", daily: 0.25 }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);

  // Формула Миффлина-Сан Жеора (BMR)
  const bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const calories = bmr * 1.5; // умеренная активность
  const protein = (calories * 0.30) / 4;
  const fat = (calories * 0.30) / 9;
  const carbs = (calories * 0.40) / 4;

  resultsDiv.innerHTML = `
    <h2>Целевые значения</h2>
    <p>Калории: ${calories.toFixed(0)} ккал</p>
    <p>Белки: ${protein.toFixed(1)} г, Жиры: ${fat.toFixed(1)} г, Углеводы: ${carbs.toFixed(1)} г</p>
    <h3>Минимальные потребности в нутриентах (по WHO/FAO/UNU, WHO/FAO, NASEM)</h3>
    <ul>
      <li>Белки: 48.0 г</li>
      <li>Жиры: 60.0 г</li>
      <li>Углеводы: 210.0 г</li>
    </ul>
  `;

  await fetchAndDisplayRecommendedFoods();
});

async function fetchAndDisplayRecommendedFoods() {
  const nutrientList = [
    { name: "Белок", english: "protein", dailyNeed: 50 },
    { name: "Жиры", english: "fat", dailyNeed: 60 },
    { name: "Углеводы", english: "carbohydrate", dailyNeed: 210 },
    { name: "Гистидин (аминокислота)", english: "histidine", dailyNeed: }
    { name: "Изолейцин (аминокислота)", english: "isoleucine", dailyNeed: }
    { name: "Лейцин (аминокислота)", english: "leucine", dailyNeed: }
    { name: "Лизин (аминокислота)", english: "", dailyNeed: }
    { name: "Метионин+цистеин (аминокислоты)", english: "", dailyNeed: }
    { name: "Фенилаланин+Тирозин (аминокислоты)", english: "", dailyNeed: }
    { name: "Треонин (аминокислота)", english: "", dailyNeed: }
    { name: "Триптофан (аминокислота)", english: "", dailyNeed: }
    { name: "Валин (аминокислота)", english: "", dailyNeed: }
    { name: "Аргинин (аминокислота)", english: "", dailyNeed: }
    { name: "Железо", english: "iron", dailyNeed: 18 },
    { name: "Витамин D", english: "vitamin d", dailyNeed: 15 },
    { name: "Альфа-линоленовая кислота (ALA)", english: "alpha-linolenic acid", dailyNeed: 1.1 },
    { name: "Линолевая кислота (LA)", english: "linoleic acid", dailyNeed: 11 },
    { name: "Эйкозапентаеновая кислота (EPA)", english: "eicosapentaenoic acid", dailyNeed: 0.25 },
    { name: "Докозагексаеновая кислота (DHA)", english: "docosahexaenoic acid", dailyNeed: 0.25 }
  ];

  productsDiv.innerHTML = "<p>Загрузка продуктов...</p>";
  let html = "<h3>Рекомендованные продукты по приоритетным нутриентам:</h3><ul>";

  for (const nutrient of nutrientList) {
    try {
      const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrient.english)}&pageSize=3&api_key=${API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.foods || searchData.foods.length === 0) {
        html += `<li><strong>${nutrient.name}</strong>: нет продуктов</li>`;
        continue;
      }

      html += `<li><strong>${nutrient.name}</strong>:<ul>`;

      for (const food of searchData.foods) {
        try {
          const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${API_KEY}`;
          const detailResponse = await fetch(detailUrl);
          const foodDetails = await detailResponse.json();

          const foundNutrient = (foodDetails.foodNutrients || []).find(n =>
            n.nutrientName && n.nutrientName.toLowerCase().includes(nutrient.english.toLowerCase())
          );

          if (!foundNutrient) {
            html += `<li>${food.description} — нет данных о нутриенте</li>`;
            continue;
          }

          const amountPer100g = foundNutrient.amount;
          if (!amountPer100g) {
            html += `<li>${food.description} — нет количества нутриента</li>`;
            continue;
          }

          const requiredGrams = (nutrient.dailyNeed / amountPer100g) * 100;
          html += `<li>${food.description} — ${requiredGrams.toFixed(0)} г для суточной нормы</li>`;
        } catch (innerError) {
          console.error(`❌ Ошибка при получении состава для ${food.description}:`, innerError);
          html += `<li>${food.description} — ошибка при загрузке состава</li>`;
        }
      }

      html += `</ul></li>`;
    } catch (outerError) {
      console.error(`❌ Ошибка для ${nutrient.name}:`, outerError);
      html += `<li><strong>${nutrient.name}</strong>: ошибка загрузки</li>`;
    }
  }

  html += "</ul>";
  productsDiv.innerHTML = html;
}