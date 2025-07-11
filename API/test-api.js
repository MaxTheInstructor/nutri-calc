const API_KEY = "Ou0O8bfUG3gscBUflI8yd2zoxYphrbVkppQVBruf"; // ← твой действующий ключ

document.getElementById("apiForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nutrient = document.getElementById("nutrientInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "<p>🔄 Ищем продукты...</p>";

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrient)}&pageSize=3&api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      resultsDiv.innerHTML = "<p>❌ Продукты не найдены</p>";
      return;
    }

    let output = `<h3>🔎 Результаты для: <em>${nutrient}</em></h3>`;
    data.foods.forEach((food, index) => {
      output += `<details><summary>${index + 1}) ${food.description}</summary><pre>${JSON.stringify(food, null, 2)}</pre></details>`;
    });

    resultsDiv.innerHTML = output;

  } catch (error) {
    console.error("Ошибка запроса:", error);
    resultsDiv.innerHTML = "<p>⚠️ Ошибка загрузки данных с API</p>";
  }
});
