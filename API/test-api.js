const apiKey = "Ou0O8bfUG3gscBUflI8yd2zoxYphrbVkppQVBruf";

document.getElementById("queryForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nutrientInput = document.getElementById("nutrientInput").value.trim().toLowerCase();
  const output = document.getElementById("output");
  output.innerHTML = `<h2>Результаты для: ${nutrientInput}</h2>`;

  // 1. Получаем суточную потребность (заглушка — позже свяжем с JSON)
  const dailyNeeds = {
    "protein": { value: 60, unit: "г", source: "WHO/FAO/UNU (2007)" },
    "iron": { value: 18, unit: "мг", source: "NASEM" },
    // добавь другие нутриенты здесь
  };

  const norm = dailyNeeds[nutrientInput];
  if (norm) {
    output.innerHTML += `<p>Суточная потребность: ${norm.value} ${norm.unit} (${norm.source})</p>`;
  } else {
    output.innerHTML += `<p>Суточная потребность: нет данных</p>`;
  }

  // 2. Ищем продукты по nutrientInput
  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrientInput)}&pageSize=3&api_key=${apiKey}`;

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      output.innerHTML += "<p>Продукты не найдены.</p>";
      return;
    }

    output.innerHTML += "<ol>";

    for (const food of searchData.foods) {
      const foodId = food.fdcId;
      const foodDetailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${foodId}?api_key=${apiKey}`;
      const detailRes = await fetch(foodDetailsUrl);
      const detailData = await detailRes.json();
    
      let foundNutrient = null;

      if (
        foodDetails.foodNutrients &&
        Array.isArray(foodDetails.foodNutrients)
      ) {
        foundNutrient = foodDetails.foodNutrients.find(n =>
          typeof n?.nutrientName === "string" &&
          n.nutrientName.toLowerCase().includes(nutrientKey.toLowerCase())
        );
      }

      if (foundNutrient) {
        const amount = foundNutrient.amount;
        const unit = foundNutrient.unitName;
        html += `<li>${food.description} - ${amount} ${unit}</li>`;
      } else {
        html += `<li>${food.description} - нет данных</li>`;
      }


      const amount = foundNutrient
        ? `${foundNutrient.value} ${foundNutrient.unitName}`
        : "нет данных";

      output.innerHTML += `<li><strong>${food.description}</strong><br>Содержание: ${amount}</li>`;
    }

    output.innerHTML += "</ol>";
  } catch (error) {
    console.error("❌ Ошибка запроса:", error);
    output.innerHTML += `<p>Ошибка при загрузке данных</p>`;
  }
});