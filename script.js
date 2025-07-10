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
  productsDiv.innerHTML = "<p>Загрузка продуктов...</p>";
  let html = "<h3>Рекомендованные продукты по приоритетным нутриентам:</h3><ul>";

  for (const nutrient in nutrientNeeds) {
    const label = nutrientNeeds[nutrient].label;
    const dailyNeed = nutrientNeeds[nutrient].daily;
    const unit = nutrientNeeds[nutrient].unit;

    try {
      // 🔍 Поиск одного продукта по нутриенту
      const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrient)}&pageSize=1&api_key=${API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.foods || searchData.foods.length === 0) {
        html += `<li><strong>${label}</strong>: продукт не найден</li>`;
        continue;
      }

      const food = searchData.foods[0];
      const fdcId = food.fdcId;

      // 📦 Получение состава продукта
      const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;
      const detailResponse = await fetch(detailUrl);
      const foodDetails = await detailResponse.json();

      const foundNutrient = foodDetails.foodNutrients.find(n =>
        n.nutrientName.toLowerCase().includes(nutrient.toLowerCase())
      );

      if (!foundNutrient || !foundNutrient.value) {
        html += `<li><strong>${label}</strong>: не найдено содержание в продукте (${food.description})</li>`;
        continue;
      }

      const valuePer100g = foundNutrient.value;
      const amountNeeded = (dailyNeed / valuePer100g) * 100;

      html += `
        <li><strong>${label}</strong>:
          <ul>
            <li>Продукт: <em>${food.description}</em></li>
            <li>Содержание в 100 г: ${valuePer100g} ${unit}</li>
            <li>Необходимо: <strong>${amountNeeded.toFixed(1)} г</strong></li>
          </ul>
        </li>
      `;
    } catch (error) {
      console.error(`❌ Ошибка для ${label}:`, error);
      html += `<li><strong>${label}</strong>: ошибка при загрузке</li>`;
    }
  }

  html += "</ul>";
  productsDiv.innerHTML = html;
}
