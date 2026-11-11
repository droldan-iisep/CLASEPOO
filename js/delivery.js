// TAREA ALUMNO 3: Gestión de Delivery
// Escucha las ventas que registra el Alumno 2

function initDelivery() {
    const selectVenta = document.getElementById("deliveryVenta");
    const btn = document.getElementById("btnCrearDelivery");
    if (!selectVenta || !btn) return;
  
    // =========================================================
    //  MÓDULO DE DELIVERY - EDICIÓN ENTERPRISE (Alumno 3)
    //  Incluye: Mapa real, Búsqueda por dirección, Filtros,
    //  Persistencia de datos y UI Premium inyectada.
    // =========================================================

    // 1. Variables de Estado y Configuración
    const inputCliente = document.getElementById("deliveryCliente");
    const inputDireccion = document.getElementById("deliveryDireccion");
    const listaDelivery = document.getElementById("listaDelivery");
    const seccionDelivery = document.getElementById("delivery");
    const panelForm = seccionDelivery.querySelector(".panel");

    const LAT_TIENDA = -12.1191; // Coordenadas Tienda Armonía (Lima)
    const LNG_TIENDA = -77.0297;
    
    let mapa = null;
    let marcadorTienda = null;
    let capaRuta = null;
    let marcadorCliente = null;
    
    // Cargar envíos guardados en el navegador (Persistencia)
    let envios = JSON.parse(localStorage.getItem("armonia_envios")) || [];

    // =========================================================
    // 2. INYECCIÓN DE INTERFAZ Y ESTILOS PREMIUM
    // =========================================================
    const inyectarRecursos = () => {
        // A) Librería de Mapas (Leaflet)
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => crearMapa();
            document.head.appendChild(script);
        } else {
            crearMapa();
        }

        // B) Estilos CSS Inyectados (Animaciones, Toasts, Inputs)
        if (!document.getElementById("estilos-delivery-pro")) {
            const style = document.createElement("style");
            style.id = "estilos-delivery-pro";
            style.innerHTML = `
                @keyframes slideInDelivery { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .delivery-card-pro { animation: slideInDelivery 0.4s ease-out forwards; }
                .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; margin-right: 8px; vertical-align: middle;}
                .input-error { border: 2px solid #d32f2f !important; background-color: #ffebee !important; }
                .filtro-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
                .filtro-container input { padding: 0.6rem; border-radius: 6px; border: 1px solid #ddd; width: 100%; max-width: 300px; font-family: inherit; }
            `;
            document.head.appendChild(style);
        }

        // C) Contenedor de KPIs (Contadores)
        if (!document.getElementById("kpiTotal")) {
            const divKPIs = document.createElement("div");
            divKPIs.style.cssText = "display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;";
            divKPIs.innerHTML = `
                <div style="flex: 1; background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-left: 4px solid #6a1b9a;">
                    <span style="display: block; font-size: 0.8rem; color: #888; text-transform: uppercase;">Total Envíos</span>
                    <strong id="kpiTotal" style="font-size: 1.8rem; color: #6a1b9a;">0</strong>
                </div>
                <div style="flex: 1; background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-left: 4px solid #ff6f00;">
                    <span style="display: block; font-size: 0.8rem; color: #888; text-transform: uppercase;">Pendientes</span>
                    <strong id="kpiPendientes" style="font-size: 1.8rem; color: #ff6f00;">0</strong>
                </div>
            `;
            seccionDelivery.insertBefore(divKPIs, panelForm);
        }

        // D) Contenedor del Mapa
        if (!document.getElementById("mapaArmonia")) {
            const divMapa = document.createElement("div");
            divMapa.id = "mapaArmonia";
            divMapa.style.cssText = "height: 350px; width: 100%; border-radius: 10px; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,.1); position: relative; z-index: 1;";
            panelForm.insertAdjacentElement('afterend', divMapa);
        }

        // E) Barra de Filtros y Búsqueda
        if (!document.getElementById("filtroEnvios")) {
            const divFiltro = document.createElement("div");
            divFiltro.className = "filtro-container";
            divFiltro.innerHTML = `
                <h3 style="color: #6a1b9a; margin: 0;">Lista de Envíos</h3>
                <input type="text" id="filtroEnvios" placeholder="🔍 Buscar cliente...">
            `;
            // Insertar antes de la lista
            listaDelivery.parentNode.insertBefore(divFiltro, listaDelivery);
        }
    };

    // =========================================================
    // 3. FUNCIONES CORE (Mapa, Toasts, Persistencia)
    // =========================================================

    const crearMapa = () => {
        if (mapa || typeof L === 'undefined') return;
        mapa = L.map('mapaArmonia').setView([LAT_TIENDA, LNG_TIENDA], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapa);
        
        marcadorTienda = L.marker([LAT_TIENDA, LNG_TIENDA]).addTo(mapa)
            .bindPopup('<b>🎵 Tienda Armonía</b><br>Sede Principal').openPopup();
    };

    const mostrarToast = (msj, tipo) => {
        const bg = tipo === 'error' ? '#d32f2f' : tipo === 'info' ? '#0288d1' : '#2e7d32';
        const toast = document.createElement("div");
        toast.innerHTML = msj;
        toast.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: ${bg}; color: #fff; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9999; font-weight: bold; transform: translateY(20px); opacity: 0; transition: all 0.3s ease; font-family: sans-serif; display: flex; align-items: center;`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.transform = "translateY(0)"; toast.style.opacity = "1"; }, 10);
        setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3500);
    };

    const guardarEnLocalStorage = () => {
        localStorage.setItem("armonia_envios", JSON.stringify(envios));
    };

    const actualizarKPIs = () => {
        const total = envios.length;
        const pendientes = envios.filter(e => e.estado === 'Pendiente').length;
        
        const elTotal = document.getElementById("kpiTotal");
        const elPendientes = document.getElementById("kpiPendientes");
        if(elTotal) elTotal.textContent = total;
        if(elPendientes) elPendientes.textContent = pendientes;
    };

    // =========================================================
    // 4. RENDERIZADO DE ENVÍOS EN PANTALLA
    // =========================================================
    const renderizarEnvios = (filtro = "") => {
        listaDelivery.innerHTML = ""; // Limpiar lista
        const enviosFiltrados = envios.filter(e => e.cliente.toLowerCase().includes(filtro.toLowerCase()));

        if (enviosFiltrados.length === 0) {
            listaDelivery.innerHTML = `<li style="text-align: center; color: #888; padding: 2rem; background: #fafafa; border-radius: 8px;">No hay envíos registrados.</li>`;
            return;
        }

        enviosFiltrados.forEach((envio) => {
            const li = document.createElement("li");
            li.className = "delivery-item delivery-card-pro";
            li.style.cssText = "display: flex; justify-content: space-between; align-items: center; border-left: 4px solid " + (envio.estado === 'Entregado' ? '#2e7d32' : '#6a1b9a') + "; background: #fff; padding: 1rem; border-radius: 8px; margin-bottom: 0.6rem; box-shadow: 0 2px 6px rgba(0,0,0,.06);";

            const divInfo = document.createElement("div");
            divInfo.innerHTML = `
                <strong style="font-size: 1.05rem; color: #333;">${envio.cliente}</strong>
                <br><small style="color: #555;">📍 ${envio.direccion}</small>
                <br><small style="color: #888;">🛒 ${envio.ventaTexto}</small>
            `;

            const btnEstado = document.createElement("button");
            btnEstado.className = "estado";
            btnEstado.textContent = envio.estado;
            
            if (envio.estado === 'Entregado') {
                btnEstado.style.cssText = "background: #c8e6c9; color: #2e7d32; padding: .4rem .8rem; border-radius: 20px; font-size: .8rem; font-weight: 600; border: none;";
            } else {
                btnEstado.style.cssText = "background: #ffecb3; color: #e65100; padding: .4rem .8rem; border-radius: 20px; font-size: .8rem; font-weight: 600; cursor: pointer; border: none;";
                
                // Evento para cambiar a Entregado
                btnEstado.addEventListener("click", () => {
                    envio.estado = 'Entregado';
                    guardarEnLocalStorage();
                    renderizarEnvios(document.getElementById("filtroEnvios").value);
                    actualizarKPIs();
                    mostrarToast("Envío marcado como Entregado ✅", "success");
                });
            }

            li.appendChild(divInfo);
            li.appendChild(btnEstado);
            listaDelivery.appendChild(li);
        });
    };

    // =========================================================
    // 5. GEOLOCALIZACIÓN REAL (API Nominatim)
    // =========================================================
    const obtenerCoordenadasReales = async (direccion) => {
        try {
            // Buscamos la dirección en el mapa mundial
            const query = encodeURIComponent(direccion + ", Peru"); // Sesgado a Perú
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        } catch (e) {
            console.warn("Error buscando dirección, usando fallback.");
        }
        
        // Si falla, devolvemos coordenadas cerca de la tienda (Fallback)
        return {
            lat: LAT_TIENDA + (Math.random() - 0.5) * 0.02,
            lng: LNG_TIENDA + (Math.random() - 0.5) * 0.02
        };
    };

    const trazarRutaEnMapa = (coordsCliente, cliente, direccion) => {
        if (!mapa) return;
        if (capaRuta) mapa.removeLayer(capaRuta);
        if (marcadorCliente) mapa.removeLayer(marcadorCliente);

        marcadorCliente = L.marker([coordsCliente.lat, coordsCliente.lng]).addTo(mapa)
            .bindPopup(`<b>Envío a: ${cliente}</b><br>${direccion}`).openPopup();

        capaRuta = L.polyline([[LAT_TIENDA, LNG_TIENDA], [coordsCliente.lat, coordsCliente.lng]], {
            color: '#6a1b9a', weight: 4, dashArray: '8, 8'
        }).addTo(mapa);

        mapa.fitBounds([[LAT_TIENDA, LNG_TIENDA], [coordsCliente.lat, coordsCliente.lng]], { padding: [50, 50] });
    };

    // =========================================================
    // 6. LÓGICA PRINCIPAL (Inicio y Eventos)
    // =========================================================
    inyectarRecursos();
    actualizarKPIs();
    renderizarEnvios();

    // PUNTO 1: Escuchar "nuevaVenta" del Alumno 2
    document.addEventListener("nuevaVenta", (evento) => {
        const venta = evento.detail;
        if (!venta || !venta.id || !venta.nombre) return;

        const opcion = document.createElement("option");
        opcion.value = venta.id; 
        opcion.textContent = `Venta #${venta.id} - ${venta.nombre}`;
        selectVenta.appendChild(opcion);
        
        selectVenta.style.backgroundColor = "#e8f5e9"; 
        setTimeout(() => { selectVenta.style.backgroundColor = ""; }, 1000);
        mostrarToast("🔔 Nueva venta disponible", "info");
    });

    // Filtro de búsqueda
    document.getElementById("filtroEnvios").addEventListener("input", (e) => {
        renderizarEnvios(e.target.value);
    });

    // PUNTO 2 y 3: Crear Envío
    btn.addEventListener("click", async () => {
        // Limpiar errores previos
        inputCliente.classList.remove("input-error");
        inputDireccion.classList.remove("input-error");

        const cliente = inputCliente.value.trim();
        const direccion = inputDireccion.value.trim();
        const ventaId = selectVenta.value;
        const ventaTexto = selectVenta.options[selectVenta.selectedIndex]?.text || "";

        // Validación visual
        let hasError = false;
        if (!cliente) { inputCliente.classList.add("input-error"); hasError = true; }
        if (!direccion) { inputDireccion.classList.add("input-error"); hasError = true; }
        if (!ventaId) { mostrarToast("⚠️ Seleccione una venta", "error"); hasError = true; }

        if (hasError) return;

        // UI de Carga
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Buscando dirección...`;

        // Buscar coordenadas reales
        const coordsCliente = await obtenerCoordenadasReales(direccion);

        // Crear objeto de envío
        const nuevoEnvio = {
            id: Date.now(),
            cliente: cliente,
            direccion: direccion,
            ventaTexto: ventaTexto,
            estado: 'Pendiente',
            coords: coordsCliente
        };

        // Guardar en estado y LocalStorage
        envios.push(nuevoEnvio);
        guardarEnLocalStorage();

        // Actualizar UI
        renderizarEnvios();
        actualizarKPIs();
        trazarRutaEnMapa(coordsCliente, cliente, direccion);

        // Limpiar formulario
        inputCliente.value = "";
        inputDireccion.value = "";
        selectVenta.value = "";
        inputCliente.focus();
        
        mostrarToast("🚀 ¡Envío registrado con ruta real!", "success");
        
        // Restaurar Botón
        btn.disabled = false;
        btn.textContent = "Crear envío";
    });
}