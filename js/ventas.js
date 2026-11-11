// TAREA ALUMNO 2: Registrar ventas
// Usa el array 'productos' que te pasa el profe en main.js

function initVentas(productos) {
    const select = document.getElementById("ventaProducto");
    const btn = document.getElementById("btnRegistrarVenta");
    if (!select || !btn) return;
  
    // TU CÓDIGO AQUÍ:
    // 1. Llena el <select> con los productos recibidos
    // 2. Al hacer clic en el botón, captura el producto y la cantidad
    // 3. Añade una fila a la tabla #tablaVentas con los datos
    // 4. ¡IMPORTANTE! Al registrar la venta, avisa a Delivery:
    //    document.dispatchEvent(new CustomEvent("nuevaVenta", { detail: { id: 1, nombre: "Guitarra" } }));
  }