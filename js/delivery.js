// TAREA ALUMNO 3: GESTIÓN DE DELIVERY - EDICIÓN SKYNET ENTERPRISE
function initDelivery() {
    const selectVenta = document.getElementById("deliveryVenta");
    const btn = document.getElementById("btnCrearDelivery");
    if (!selectVenta || !btn) return;
  
    // 1. Variables de Estado y Configuración
    const inputCliente = document.getElementById("deliveryCliente");
    const inputDireccion = document.getElementById("deliveryDireccion");
    const listaDelivery = document.getElementById("listaDelivery");
    const seccionDelivery = document.getElementById("delivery");
    const panelForm = seccionDelivery.querySelector(".panel");

    const LAT_TIENDA = -12.1191; 
    const LNG_TIENDA = -77.0297;
    
    let mapa = null, marcadorTienda = null, capaRuta = null, marcadorCliente = null;
    let inputRepartidor, selectPrioridad, selectPago, inputMontoPago;
    
    // LISTA OFICIAL DE REPARTIDORES
    const REPARTIDORES = ["Juan Pérez", "Carlos Ramos", "Pedro Gómez", "Luis Torres"];
    
    let envios = JSON.parse(localStorage.getItem("armonia_envios_ultra")) || [];
    let filtroActual = ""; 
    let filtroEstado = "Todos";
    let filtroRepartidor = "Todos"; // NUEVO

    // =========================================================
    // 2. INTERFAZ Y ESTILOS PREMIUM (INCLUYE MODO OSCURO)
    // =========================================================
    const inyectarRecursos = () => {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => crearMapa();
            document.head.appendChild(script);
        } else { crearMapa(); }

        // CSS MAESTRO
        if (!document.getElementById("estilos-delivery-pro")) {
            const style = document.createElement("style");
            style.id = "estilos-delivery-pro";
            style.innerHTML = `
                @keyframes slideInDelivery { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
                
                /* MODO OSCURO */
                body.dark-mode { background-color: #121212; color: #e0e0e0; }
                body.dark-mode .panel, body.dark-mode .delivery-card-pro, body.dark-mode #kpiTotal { background: #1e1e1e !important; color: #e0e0e0 !important; box-shadow: 0 2px 8px rgba(255,255,255,.05) !important; }
                body.dark-mode h2, body.dark-mode h3, body.dark-mode strong, body.dark-mode label { color: #bb86fc !important; }
                body.dark-mode input, body.dark-mode select { background: #333 !important; color: #fff !important; border-color: #555 !important; }

                .delivery-card-pro { animation: slideInDelivery 0.4s ease-out forwards; transition: all 0.2s; background: #fff; }
                .delivery-card-pro:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important; }
                .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; margin-right: 8px; vertical-align: middle;}
                .input-error { border: 2px solid #d32f2f !important; background-color: #ffebee !important; }
                .filtro-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
                .filtro-container input, .filtro-container select { padding: 0.6rem; border-radius: 6px; border: 1px solid #ddd; font-family: inherit; }
                .btn-icon { background: #f0f0f0; border: none; padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; transition: 0.2s; margin-left: 5px; font-size: 1rem; }
                .btn-icon:hover { background: #e0e0e0; }
                body.dark-mode .btn-icon { background: #333; color: #fff; }
                .btn-eliminar { color: #d32f2f; } .btn-eliminar:hover { background: #ffebee; }
                
                .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 5px; }
                .badge-pendiente { background: #ffecb3; color: #e65100; }
                .badge-entregado { background: #c8e6c9; color: #2e7d32; }
                .badge-urgente { background: #ffcdd2; color: #b71c1c; animation: pulse 1.5s infinite; }
                
                /* BARRA DE PROGRESO */
                .timeline { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; width: 100%; max-width: 400px; position: relative; }
                .timeline::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 4px; background: #e0e0e0; z-index: 1; transform: translateY(-50%); }
                .timeline-step { width: 20px; height: 20px; border-radius: 50%; background: #e0e0e0; z-index: 2; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; transition: 0.3s; }
                .timeline-step.active { background: #6a1b9a; }
                .timeline-step.done { background: #2e7d32; }
            `;
            document.head.appendChild(style);
        }

        // BOTÓN MODO OSCURO
        if (!document.getElementById("btnDarkMode")) {
            const btnDark = document.createElement("button");
            btnDark.id = "btnDarkMode";
            btnDark.innerHTML = "🌙";
            btnDark.style.cssText = "position: fixed; bottom: 20px; left: 20px; width: 50px; height: 50px; border-radius: 50%; background: #333; color: white; border: none; font-size: 1.5rem; cursor: pointer; z-index: 9999; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s;";
            btnDark.onclick = () => {
                document.body.classList.toggle("dark-mode");
                btnDark.innerHTML = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
            };
            document.body.appendChild(btnDark);
        }

        // INYECCIÓN DEL FORMULARIO EXTENDIDO (Con datalist de repartidores)
        if (!document.getElementById("deliveryRepartidor")) {
            const divExtras = document.createElement("div");
            divExtras.style.cssText = "display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px; margin-bottom: 15px;";
            divExtras.innerHTML = `
                <div class="form-extra-group" style="display:flex; flex-direction:column; flex:1; min-width:120px;">
                    <label>Repartidor 🛵</label>
                    <input list="listaRepartidores" id="deliveryRepartidor" placeholder="Seleccione...">
                    <datalist id="listaRepartidores">${REPARTIDORES.map(r => `<option value="${r}">`).join('')}</datalist>
                </div>
                <div class="form-extra-group" style="display:flex; flex-direction:column; flex:1; min-width:120px;">
                    <label>Prioridad 🔥</label>
                    <select id="deliveryPrioridad">
                        <option value="Normal">Normal</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                    </select>
                </div>
                <div class="form-extra-group" style="display:flex; flex-direction:column; flex:1; min-width:120px;">
                    <label>Pago 💳</label>
                    <select id="deliveryPago">
                        <option value="Efectivo">Efectivo</option>
                        <option value="Yape/Plin">Yape/Plin</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                </div>
                <div class="form-extra-group" id="divMontoPago" style="display:none; display:flex; flex-direction:column; flex:1; min-width:120px;">
                    <label>Paga con S/ 💵</label>
                    <input type="number" id="deliveryMontoPago" placeholder="Ej. 20">
                </div>
            `;
            btn.parentNode.insertBefore(divExtras, btn);
            
            inputRepartidor = document.getElementById("deliveryRepartidor");
            selectPrioridad = document.getElementById("deliveryPrioridad");
            selectPago = document.getElementById("deliveryPago");
            inputMontoPago = document.getElementById("deliveryMontoPago");

            selectPago.addEventListener("change", (e) => {
                document.getElementById("divMontoPago").style.display = e.target.value === "Efectivo" ? "flex" : "none";
            });
        }

        // KPIs
        if (!document.getElementById("kpiTotal")) {
            const divKPIs = document.createElement("div");
            divKPIs.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;";
            divKPIs.innerHTML = `
                <div style="background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-left: 4px solid #6a1b9a;">
                    <span style="display: block; font-size: 0.8rem; color: #888; text-transform: uppercase;">Total Envíos</span>
                    <strong id="kpiTotal" style="font-size: 1.8rem; color: #6a1b9a;">0</strong>
                </div>
                <div style="background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-left: 4px solid #ff6f00;">
                    <span style="display: block; font-size: 0.8rem; color: #888; text-transform: uppercase;">Pendientes</span>
                    <strong id="kpiPendientes" style="font-size: 1.8rem; color: #ff6f00;">0</strong>
                </div>
                <div style="background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border-left: 4px solid #2e7d32;">
                    <span style="display: block; font-size: 0.8rem; color: #888; text-transform: uppercase;">Ingresos Totales</span>
                    <strong id="kpiIngresos" style="font-size: 1.8rem; color: #2e7d32;">S/ 0.00</strong>
                </div>
            `;
            seccionDelivery.insertBefore(divKPIs, panelForm);
        }

        // Mapa
        if (!document.getElementById("mapaArmonia")) {
            const divMapa = document.createElement("div");
            divMapa.id = "mapaArmonia";
            divMapa.style.cssText = "height: 350px; width: 100%; border-radius: 10px; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,.1); position: relative; z-index: 1;";
            panelForm.insertAdjacentElement('afterend', divMapa);
        }

        // Barra de Filtros Avanzada (CON FILTRO DE REPARTIDOR)
        if (!document.getElementById("filtroEnvios")) {
            const divFiltro = document.createElement("div");
            divFiltro.className = "filtro-container";
            divFiltro.innerHTML = `
                <h3 style="color: #6a1b9a; margin: 0;">Lista de Envíos</h3>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <input type="text" id="filtroEnvios" placeholder="🔍 Buscar cliente/código...">
                    <select id="filtroEstado">
                        <option value="Todos">Todos los estados</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="Entregado">Entregados</option>
                    </select>
                    <select id="filtroRepartidor">
                        <option value="Todos">Todos los repartidores</option>
                        ${REPARTIDORES.map(r => `<option value="${r}">${r}</option>`).join('')}
                    </select>
                    <button id="btnExportar" style="background: #1976d2; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;">📊 Exportar CSV</button>
                </div>
            `;
            listaDelivery.parentNode.insertBefore(divFiltro, listaDelivery);
        }
    };

    // =========================================================
    // 3. FUNCIONES CORE
    // =========================================================
    const crearMapa = () => {
        if (mapa || typeof L === 'undefined') return;
        mapa = L.map('mapaArmonia').setView([LAT_TIENDA, LNG_TIENDA], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapa);
        marcadorTienda = L.marker([LAT_TIENDA, LNG_TIENDA]).addTo(mapa).bindPopup('<b>🎵 Tienda Armonía</b><br>Sede Principal').openPopup();
    };

    const mostrarToast = (msj, tipo) => {
        const bg = tipo === 'error' ? '#d32f2f' : tipo === 'info' ? '#0288d1' : '#2e7d32';
        const toast = document.createElement("div");
        toast.innerHTML = msj;
        toast.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: ${bg}; color: #fff; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9999; font-weight: bold; transform: translateY(20px); opacity: 0; transition: all 0.3s ease; font-family: sans-serif;`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.transform = "translateY(0)"; toast.style.opacity = "1"; }, 10);
        setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3500);
    };

    const guardarEnLocalStorage = () => localStorage.setItem("armonia_envios_ultra", JSON.stringify(envios));

    const actualizarKPIs = () => {
        const total = envios.length;
        const pendientes = envios.filter(e => e.estado === 'Pendiente').length;
        const ingresos = envios.reduce((sum, e) => sum + (e.costo || 0), 0);
        if(document.getElementById("kpiTotal")) document.getElementById("kpiTotal").textContent = total;
        if(document.getElementById("kpiPendientes")) document.getElementById("kpiPendientes").textContent = pendientes;
        if(document.getElementById("kpiIngresos")) document.getElementById("kpiIngresos").textContent = `S/ ${ingresos.toFixed(2)}`;
    };

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
    };

    const generarCodigoRastreo = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "ARM-";
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    };

    // =========================================================
    // 4. TICKET DE IMPRESIÓN
    // =========================================================
    const imprimirTicket = (envio) => {
        const ventana = window.open('', '', 'width=300,height=600');
        ventana.document.write(`
            <html><head><title>Ticket ${envio.codigo}</title>
            <style>body { font-family: 'Courier New', monospace; font-size: 14px; text-align: center; } .linea { border-bottom: 1px dashed #000; margin: 10px 0; } .izq { text-align: left; } .negrita { font-weight: bold; font-size: 16px; }</style></head><body>
                <h2>🎵 ARMONÍA</h2><p class="izq">Ticket: <b>${envio.codigo}</b><br>Fecha: ${new Date(envio.id).toLocaleString()}</p>
                <div class="linea"></div><p class="izq"><b>Cliente:</b> ${envio.cliente}<br><b>Dirección:</b> ${envio.direccion}<br><b>Repartidor:</b> ${envio.repartidor}<br><b>Prioridad:</b> ${envio.prioridad}</p>
                <div class="linea"></div><p class="izq"><b>Pedido:</b> ${envio.ventaTexto}<br><b>Pago:</b> ${envio.metodoPago}</p>
                <div class="linea"></div><p class="negrita">TOTAL: S/ ${envio.costo.toFixed(2)}</p>
                ${envio.vuelto ? `<p class="izq">Vuelto: S/ ${envio.vuelto}</p>` : ''}
                <div class="linea"></div><p>¡Gracias por su compra!</p>
            </body></html>
        `);
        ventana.document.close(); ventana.focus(); setTimeout(() => { ventana.print(); ventana.close(); }, 500);
    };

    // =========================================================
    // 5. RENDERIZADO DE ENVÍOS
    // =========================================================
    const renderizarEnvios = () => {
        listaDelivery.innerHTML = "";
        
        const enviosFiltrados = envios.filter(e => {
            const matchTexto = e.cliente.toLowerCase().includes(filtroActual.toLowerCase()) || e.codigo.toLowerCase().includes(filtroActual.toLowerCase());
            const matchEstado = filtroEstado === "Todos" || e.estado === filtroEstado;
            const matchRepartidor = filtroRepartidor === "Todos" || e.repartidor === filtroRepartidor;
            return matchTexto && matchEstado && matchRepartidor;
        });

        if (enviosFiltrados.length === 0) {
            listaDelivery.innerHTML = `<li style="text-align: center; color: #888; padding: 2rem; background: #fafafa; border-radius: 8px;">No hay envíos que coincidan.</li>`;
            return;
        }

        enviosFiltrados.forEach((envio) => {
            const li = document.createElement("li");
            li.className = "delivery-item delivery-card-pro";
            
            let colorBorde = "#6a1b9a"; 
            if (envio.estado === 'Entregado') colorBorde = "#2e7d32";
            else if (envio.prioridad === 'Urgente') colorBorde = "#b71c1c";
            else if (envio.prioridad === 'Alta') colorBorde = "#ff6f00";

            li.style.cssText = `display: flex; justify-content: space-between; align-items: center; border-left: 6px solid ${colorBorde}; padding: 1rem; border-radius: 8px; margin-bottom: 0.6rem;`;

            const etaMinutos = Math.round((envio.distancia / 20) * 60) + 5;
            
            // PROGRESO VISUAL
            const paso1 = "active"; // Recibido
            const paso2 = envio.estado === 'Entregado' ? 'done' : 'active'; // En camino
            const paso3 = envio.estado === 'Entregado' ? 'done' : ''; // Entregado

            const divInfo = document.createElement("div");
            divInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="font-family: monospace; background: #333; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" onclick="navigator.clipboard.writeText('${envio.codigo}'); alert('Código copiado: ${envio.codigo}')" title="Copiar código">${envio.codigo} 📋</span>
                    <strong style="font-size: 1.1rem;">${envio.cliente}</strong>
                    <span class="badge ${envio.estado === 'Entregado' ? 'badge-entregado' : 'badge-pendiente'}">${envio.estado}</span>
                    ${envio.prioridad === 'Urgente' ? '<span class="badge badge-urgente">🔥 URGENTE</span>' : ''}
                </div>
                <div style="font-size: 0.85rem; line-height: 1.5;">
                    📍 ${envio.direccion}<br>
                    🛒 ${envio.ventaTexto}<br>
                    🛵 <b>${envio.repartidor || 'No asignado'}</b> | 💳 ${envio.metodoPago}<br>
                    🚚 ${envio.distancia} km (⏱️ ~${etaMinutos} min) | Costo: <b>S/ ${envio.costo.toFixed(2)}</b>
                    ${envio.vuelto ? `<br><span style="color: #d32f2f; font-weight: bold;">💵 Llevar vuelto: S/ ${envio.vuelto}</span>` : ''}
                </div>
                <div class="timeline">
                    <div class="timeline-step ${paso1}" title="Recibido">✓</div>
                    <div class="timeline-step ${paso2}" title="En Camino">🛵</div>
                    <div class="timeline-step ${paso3}" title="Entregado">🏠</div>
                </div>
            `;

            const divBotones = document.createElement("div");
            divBotones.style.cssText = "display: flex; flex-direction: column; gap: 5px;";

            // Botón WhatsApp
            const btnWhatsApp = document.createElement("button");
            btnWhatsApp.className = "btn-icon"; btnWhatsApp.innerHTML = "📱"; btnWhatsApp.title = "Avisar por WhatsApp";
            btnWhatsApp.addEventListener("click", () => {
                const msj = encodeURIComponent(`Hola ${envio.cliente}, tu pedido ${envio.codigo} de Armonía está en camino. Llegará en aprox. ${etaMinutos} min. Total a pagar: S/ ${envio.costo.toFixed(2)}.`);
                window.open(`https://wa.me/?text=${msj}`, '_blank');
            });

            const btnRastrear = document.createElement("button");
            btnRastrear.className = "btn-icon"; btnRastrear.innerHTML = "📍"; btnRastrear.title = "Ver Ruta";
            btnRastrear.addEventListener("click", () => {
                trazarRutaEnMapa(envio.coords, envio.cliente, envio.direccion);
                document.getElementById("mapaArmonia").scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            const btnTicket = document.createElement("button");
            btnTicket.className = "btn-icon"; btnTicket.innerHTML = "🖨️"; btnTicket.title = "Imprimir";
            btnTicket.addEventListener("click", () => imprimirTicket(envio));

            const btnEstado = document.createElement("button");
            btnEstado.className = "btn-icon";
            if (envio.estado === 'Entregado') {
                btnEstado.innerHTML = "✅"; btnEstado.disabled = true; btnEstado.style.opacity = "0.5";
            } else {
                btnEstado.innerHTML = "✔️"; btnEstado.title = "Entregado";
                btnEstado.addEventListener("click", () => {
                    envio.estado = 'Entregado'; guardarEnLocalStorage(); renderizarEnvios(); actualizarKPIs(); mostrarToast("Entregado ✅", "success");
                });
            }

            const btnEliminar = document.createElement("button");
            btnEliminar.className = "btn-icon btn-eliminar"; btnEliminar.innerHTML = "🗑️"; btnEliminar.title = "Eliminar";
            btnEliminar.addEventListener("click", () => {
                if(confirm(`¿Eliminar el envío ${envio.codigo}?`)) {
                    envios = envios.filter(e => e.id !== envio.id); guardarEnLocalStorage(); renderizarEnvios(); actualizarKPIs();
                    mostrarToast("Eliminado 🗑️", "info");
                    if (marcadorCliente) mapa.removeLayer(marcadorCliente); if (capaRuta) mapa.removeLayer(capaRuta);
                }
            });

            divBotones.appendChild(btnWhatsApp); divBotones.appendChild(btnRastrear);
            divBotones.appendChild(btnTicket); divBotones.appendChild(btnEstado); divBotones.appendChild(btnEliminar);

            li.appendChild(divInfo); li.appendChild(divBotones); listaDelivery.appendChild(li);
        });
    };

    // =========================================================
    // 6. GEOLOCALIZACIÓN Y RUTA
    // =========================================================
    const obtenerCoordenadasReales = async (direccion) => {
        try {
            const query = encodeURIComponent(direccion + ", Peru");
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } catch (e) { console.warn("Error buscando dirección."); }
        return { lat: LAT_TIENDA + (Math.random() - 0.5) * 0.02, lng: LNG_TIENDA + (Math.random() - 0.5) * 0.02 };
    };

    const trazarRutaEnMapa = (coordsCliente, cliente, direccion) => {
        if (!mapa) return;
        if (capaRuta) mapa.removeLayer(capaRuta); if (marcadorCliente) mapa.removeLayer(marcadorCliente);
        marcadorCliente = L.marker([coordsCliente.lat, coordsCliente.lng]).addTo(mapa).bindPopup(`<b>Envío a: ${cliente}</b><br>${direccion}`).openPopup();
        capaRuta = L.polyline([[LAT_TIENDA, LNG_TIENDA], [coordsCliente.lat, coordsCliente.lng]], { color: '#6a1b9a', weight: 4, dashArray: '8, 8' }).addTo(mapa);
        mapa.fitBounds([[LAT_TIENDA, LNG_TIENDA], [coordsCliente.lat, coordsCliente.lng]], { padding: [50, 50] });
    };

    // =========================================================
    // 7. LÓGICA PRINCIPAL Y EVENTOS
    // =========================================================
    inyectarRecursos(); actualizarKPIs(); renderizarEnvios();

    document.getElementById("filtroEnvios").addEventListener("input", (e) => { filtroActual = e.target.value; renderizarEnvios(); });
    document.getElementById("filtroEstado").addEventListener("change", (e) => { filtroEstado = e.target.value; renderizarEnvios(); });
    document.getElementById("filtroRepartidor").addEventListener("change", (e) => { filtroRepartidor = e.target.value; renderizarEnvios(); });

    document.addEventListener("nuevaVenta", (evento) => {
        const venta = evento.detail;
        if (!venta || !venta.id || !venta.nombre) return;
        const opcion = document.createElement("option");
        opcion.value = venta.id; opcion.textContent = `Venta #${venta.id} - ${venta.nombre}`;
        selectVenta.appendChild(opcion);
        selectVenta.style.backgroundColor = "#e8f5e9"; setTimeout(() => { selectVenta.style.backgroundColor = ""; }, 1000);
        mostrarToast("🔔 Nueva venta disponible", "info");
    });

    btn.addEventListener("click", async () => {
        inputCliente.classList.remove("input-error"); inputDireccion.classList.remove("input-error");

        const cliente = inputCliente.value.trim();
        const direccion = inputDireccion.value.trim();
        const repartidor = inputRepartidor.value.trim() || "No asignado";
        const prioridad = selectPrioridad.value;
        const metodoPago = selectPago.value;
        const montoPago = parseFloat(inputMontoPago.value) || 0;
        const ventaId = selectVenta.value;
        const ventaTexto = selectVenta.options[selectVenta.selectedIndex]?.text || "";

        let hasError = false;
        if (!cliente) { inputCliente.classList.add("input-error"); hasError = true; }
        if (!direccion) { inputDireccion.classList.add("input-error"); hasError = true; }
        if (!ventaId) { mostrarToast("⚠️ Seleccione una venta", "error"); hasError = true; }
        if (ventaId && envios.some(e => e.ventaId === ventaId)) { mostrarToast("⚠️ Venta ya registrada", "error"); hasError = true; }
        
        // VALIDACIÓN DE REPARTIDOR OCUPADO
        if (repartidor !== "No asignado" && envios.some(e => e.repartidor === repartidor && e.estado === 'Pendiente')) {
            mostrarToast(`⚠️ ${repartidor} ya tiene un envío pendiente`, "error"); hasError = true;
        }

        if (hasError) return;

        btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Procesando...`;

        const coordsCliente = await obtenerCoordenadasReales(direccion);
        const distanciaKm = calcularDistancia(LAT_TIENDA, LNG_TIENDA, coordsCliente.lat, coordsCliente.lng);
        
        let costoDelivery = 5.00 + (distanciaKm * 1.50);
        if (prioridad === "Urgente") costoDelivery *= 1.3;
        let vuelto = 0;
        if (metodoPago === "Efectivo" && montoPago > costoDelivery) vuelto = (montoPago - costoDelivery).toFixed(2);

        const nuevoEnvio = {
            id: Date.now(), codigo: generarCodigoRastreo(), ventaId, cliente, direccion, repartidor, prioridad,
            metodoPago, montoPago, vuelto, ventaTexto, estado: 'Pendiente', coords: coordsCliente, distancia: distanciaKm, costo: costoDelivery
        };

        envios.push(nuevoEnvio); guardarEnLocalStorage(); renderizarEnvios(); actualizarKPIs();
        trazarRutaEnMapa(coordsCliente, cliente, direccion);

        inputCliente.value = ""; inputDireccion.value = ""; inputRepartidor.value = ""; inputMontoPago.value = ""; selectVenta.value = "";
        inputCliente.focus();
        
        mostrarToast(`🚀 Envío ${nuevoEnvio.codigo} registrado`, "success");
        btn.disabled = false; btn.textContent = "Crear envío";
    });
}