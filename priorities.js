// priorities.js
async function loadNutrientPriorities() {
  try {
    const response = await fetch('nutrient_priorities.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка загрузки nutrient_priorities.json:', error);
    return [];
  }
}

// Функция для фильтрации и отображения приоритетных нутриентов
async function displayPriorities() {
  const priorities = await loadNutrientPriorities();

  const table = document.createElement('table');
  table.innerHTML = '<tr><th>Нутриент</th><th>Категория</th><th>Период дефицита</th><th>Значимость</th></tr>';

  priorities.forEach(nutrient => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${nutrient.name}</td>
      <td>${nutrient.category}</td>
      <td>${nutrient.time_to_deficiency_days}</td>
      <td>${nutrient.priority}</td>
    `;
    table.appendChild(row);
  });

  const outputDiv = document.getElementById('priority-output');
  outputDiv.innerHTML = '';
  outputDiv.appendChild(table);
}

window.addEventListener('DOMContentLoaded', displayPriorities);
