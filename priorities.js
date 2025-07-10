// Функция оценки значимости на основе количества дней до проявления дефицита
function getImportanceLevel(deficiencyDays) {
  if (deficiencyDays <= 2) return 9;
  if (deficiencyDays <= 5) return 8;
  if (deficiencyDays <= 10) return 7;
  if (deficiencyDays <= 15) return 6;
  if (deficiencyDays <= 30) return 5;
  if (deficiencyDays <= 45) return 4;
  if (deficiencyDays <= 60) return 3;
  if (deficiencyDays <= 90) return 2;
  return 1;
}

// Загрузка данных из nutrient_priorities.json и построение таблицы
fetch('nutrient_priorities.json')
  .then(response => response.json())
  .then(data => {
    const table = document.getElementById('priorityTable').getElementsByTagName('tbody')[0];

    data.forEach(nutrient => {
      const row = table.insertRow();

      // Имя нутриента
      const cell1 = row.insertCell();
      cell1.textContent = nutrient.name;

      // Категория
      const cell2 = row.insertCell();
      cell2.textContent = nutrient.category;

      // Кол-во дней до проявления дефицита
      const cell3 = row.insertCell();
      cell3.textContent = nutrient.deficiency_days ?? '—';

      // Уровень значимости (importance level)
      const cell4 = row.insertCell();
      const level = getImportanceLevel(nutrient.deficiency_days ?? 999);
      cell4.textContent = level;

      // Применяем цветовую подсветку по значимости
      row.classList.add(`importance-${level}`);
    });
  })
  .catch(error => {
    console.error("Ошибка загрузки nutrient_priorities.json:", error);
    const table = document.getElementById('priorityTable');
    table.insertAdjacentHTML('afterend', `<p style="color:red;">Ошибка загрузки данных: ${error.message}</p>`);
  });