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

  await fetchFoods("protein");
});

// Ищем продукты, богатые белком
async function fetchFoods(nutrient) {
  productsDiv.innerHTML = "<p>Загрузка продуктов...</p>";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${nutrient}&pageSize=5&api_key=${API_KEY}`;
  
  console.log("📡 Отправляется запрос к:", url);

  try {
    const response = await fetch(url);
    console.log("✅ Статус ответа:", response.status);

    const data = await response.json();
    console.log("📦 Ответ API:", data);

    if (!data.foods) {
      productsDiv.innerHTML = "<p>Ошибка загрузки продуктов</p>";
      return;
    }

    let html = "<h3>Продукты, богатые белком:</h3><ul>";
    data.foods.forEach(food => {
      html += `<li>${food.description}</li>`;
    });
    html += "</ul>";
    productsDiv.innerHTML = html;

  } catch (error) {
    productsDiv.innerHTML = "<p>Ошибка при обращении к API</p>";
    console.error("❌ Ошибка fetch:", error);
  }
}

