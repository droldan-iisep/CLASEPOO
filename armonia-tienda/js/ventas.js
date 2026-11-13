
// TAREA ALUMNO 2: Registrar ventas
// Usa el array 'productos' que te pasa el profe en main.js

function initVentas(productos) {
    const select = document.getElementById("ventaProducto");
    const inputCantidad = document.getElementById("ventaCantidad");
    const btn = document.getElementById("btnRegistrarVenta");
    const tablaBody = document.querySelector("#tablaVentas tbody");

    // Verificación de seguridad
    if (!select || !btn || !tablaBody) return;

    // ==========================================
    // 1. Llenar el <select> con los productos
    // ==========================================
    // Limpiamos por si acaso se llama más de una vez
    select.innerHTML = '<option value="">-- Seleccione un producto --</option>';
    
    productos.forEach(prod => {
        const option = document.createElement("option");
        option.value = prod.id;
        option.textContent = `${prod.nombre} - S/ ${prod.precio}`;
        select.appendChild(option);
    });

    // Variable para llevar el contador de ventas (el ID de la fila)
    let contadorVentas = 1;

    // ==========================================
    // 2. Al hacer clic en el botón
    // ==========================================
    btn.addEventListener("click", () => {
        // Capturamos los valores
        const idProducto = parseInt(select.value);
        const cantidad = parseInt(inputCantidad.value);

        // Validaciones básicas
        if (isNaN(idProducto) || select.value === "") {
            alert("⚠️ Por favor, selecciona un producto.");
            return;
        }
        if (isNaN(cantidad) || cantidad < 1) {
            alert("⚠️ La cantidad debe ser mayor o igual a 1.");
            return;
        }

        // Buscamos el producto para obtener su nombre y precio
        const productoElegido = productos.find(p => p.id === idProducto);
        if (!productoElegido) return; // Seguridad extra

        // Cálculos
        const total = productoElegido.precio * cantidad;
        const fecha = new Date().toLocaleDateString('es-PE'); // Fecha formateada (Perú)

        // ==========================================
        // 3. Añadir una fila a la tabla #tablaVentas
        // ==========================================
        const tr = document.createElement("tr");
        
        // Insertamos las celdas con los datos
        tr.innerHTML = `
            <td>${contadorVentas}</td>
            <td>${productoElegido.nombre}</td>
            <td>${cantidad}</td>
            <td>S/ ${total.toFixed(2)}</td>
            <td>${fecha}</td>
        `;
        
        tablaBody.appendChild(tr);

        // ==========================================
        // 4. ¡IMPORTANTE! Avisar a Delivery
        // ==========================================
        // Disparamos el evento personalizado para que el Alumno 3 lo escuche
        const nuevoEvento = new CustomEvent("nuevaVenta", {
            detail: {
                id: contadorVentas,         // ID único de esta venta (ej. 1, 2, 3...)
                nombre: productoElegido.nombre, // Nombre del producto
                total: total                // (Opcional) Extra útil para el delivery
            }
        });
        document.dispatchEvent(nuevoEvento);

        // ==========================================
        // Limpieza para la siguiente venta
        // ==========================================
        contadorVentas++; // Aumentamos el ID para la próxima
        select.value = ""; // Reseteamos el select
        inputCantidad.value = "1"; // Reseteamos la cantidad
    });
}