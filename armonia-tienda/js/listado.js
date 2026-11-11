// TAREA ALUMNO 1: Listar productos
// Usa el array 'lista' que te pasa el profe en main.js

function renderProductos(lista) {
  const grid = document.getElementById("gridProductos");
  if (!grid) return;

  grid.innerHTML = "";

  lista.forEach(prod => {
    const card = document.createElement("div");
    card.className = "card-producto";
    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <div class="card-body">
        <span class="categoria">${prod.categoria}</span>
        <h3>${prod.nombre}</h3>
        <p class="precio">S/ ${prod.precio}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}