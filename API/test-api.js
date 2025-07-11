const targetNames = {
  "protein": ["Protein", "Total protein", "Protein, total"],
  "iron": ["Iron", "Iron, Fe"],
  "vitamin d": ["Vitamin D", "Vitamin D (D2 + D3)", "Cholecalciferol"],
  "alpha-linolenic acid": ["Alpha-linolenic acid", "18:3 n-3 c,c,c (ALA)"],
  "linoleic acid": ["Linoleic acid", "18:2 n-6 c,c"],
  "eicosapentaenoic acid": ["Eicosapentaenoic acid", "20:5 n-3 (EPA)"],
  "docosahexaenoic acid": ["Docosahexaenoic acid", "22:6 n-3 (DHA)"]
};

const acceptableNames = targetNames[nutrientKey] || [nutrientKey];

foundNutrient = foodDetails.foodNutrients.find(n =>
  typeof n?.nutrientName === "string" &&
  acceptableNames.some(target =>
    n.nutrientName.toLowerCase().includes(target.toLowerCase())
  )
);

document.getElementById("searchForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nutrientInput = document.getElementById("nutrient").value.trim();
  const resultsDiv = document.getElementById("results");
  const API_KEY = "Ou0O8bfUG3gscBUflI8yd2zoxYphrbVkppQVBruf"; // ← Вставь сюда свой ключ от FDC API

  if (!nutrientInput) {
    resultsDiv.innerHTML = "<p>Введите название нутриента.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Загрузка...</p>";

  try {
    let html = `<h2>Результаты для: ${nutrientInput}</h2>`;

    // 🔢 Мини-база суточных потребностей
    const recommendedValues = {
      "protein": "60 г (WHO/FAO/UNU (2007))",
      "iron": "18 мг (US DRI)",
      "vitamin d": "15 мкг (US DRI)",
      "alpha-linolenic acid": "1.6 г (FAO/WHO)",
      "linoleic acid": "17 г (FAO/WHO)",
      "eicosapentaenoic acid": "0.25 г (FAO)",
      "docosahexaenoic acid": "0.25 г (FAO)"
    };

    const nutrientKey = nutrientInput.toLowerCase();
    const rec = recommendedValues[nutrientKey] || "Нет данных";
    html += `<p><strong>Суточная потребность:</strong> ${rec}</p>`;

    // 🔍 Поиск продуктов
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(nutrientInput)}&pageSize=3&api_key=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      resultsDiv.innerHTML = html + "<p>Нет продуктов по этому нутриенту.</p>";
      return;
    }

    html += "<ul>";

    for (const food of searchData.foods) {

      const detailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const foodDetails = await detailsResponse.json();

      console.log("Nutrients for:", food.description, foodDetails.foodNutrients);

      let foundNutrient = null;

      if (foodDetails?.foodNutrients && Array.isArray(foodDetails.foodNutrients)) {
        foundNutrient = foodDetails.foodNutrients.find(n =>
          typeof n?.nutrientName === "string" &&
        n.nutrientName.toLowerCase().includes(nutrientKey)
        );
      }

      if (foundNutrient) {
        const amount = foundNutrient.amount;
        const unit = foundNutrient.unitName;
        html += `<li>${food.description} — <strong>${amount} ${unit}</strong></li>`;
      } else {
        html += `<li>${food.description} — <em>нет данных</em></li>`;
      }
    }

    html += "</ul>";
    resultsDiv.innerHTML = html;

  } catch (error) {
    console.error("❌ Ошибка запроса:", error);
    resultsDiv.innerHTML = "<p>Ошибка при загрузке данных</p>";
  }
});