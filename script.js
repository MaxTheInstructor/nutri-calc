const form = document.getElementById("form");
const resultsDiv = document.getElementById("results");
const productsDiv = document.getElementById("products");

const API_KEY = "Ou0O8bfUG3gscBUflI8yd2zoxYphrbVkppQVBruf"; // ← сюда вставь свой ключ от FDC

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);

  // Формула Миффлина-Сан Жеора (BMR)
  let bmr = gender === "male"
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
  `;

  await fetchFoodsForNutrients();
});

// 🔄 Новый вариант запроса по ключевым нутриентам
async function fetchFoodsForNutrients() {
  const nutrients = [
    "protein",
    "iron",
    "vitamin D",
    "alpha-linolenic acid",  // ALA
    "linoleic acid",         // LA
    "eicosapentaenoic acid", // EPA
    "docosahexaenoic acid"   // DHA
  ];

  productsDiv.innerHTML = "<p>Загрузка продуктов...</p>";

  let html = "<h3>Рекомендованные продукты по значимым нутриентам:</h3><ul>";

  for (const nutrient of nutrients) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrient)}&pageSize=3&api_key=${API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        html += `<li><strong>${nutrient.toUpperCase()}</strong>:<ul>`;
        data.foods.forEach(food => {
          html += `<li>${food.description}</li>`;
        });
        html += `</ul></li>`;
      } else {
        html += `<li><strong>${nutrient}</strong>: нет данных</li>`;
      }
    } catch (error) {
      html += `<li><strong>${nutrient}</strong>: ошибка загрузки</li>`;
      console.error(`Ошибка загрузки для ${nutrient}:`, error);
    }
  }

  html += "</ul>";
  productsDiv.innerHTML = html;
}
