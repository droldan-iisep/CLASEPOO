// TAREA ALUMNO 1: Catálogo con Detalles + Sintetizador Interactivo

function renderProductos(lista) {
  const grid = document.getElementById("gridProductos");
  if (!grid) return;
  grid.innerHTML = "";

  lista.forEach((prod, index) => {
    const card = document.createElement("div");
    card.className = "card-producto animate__animated animate__fadeInUp";
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.animationFillMode = "both";
    card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
    
    // Efectos visuales de la tarjeta
    card.onmouseenter = () => {
      card.style.transform = "translateY(-8px)";
      card.style.boxShadow = "0 15px 30px rgba(106, 27, 154, 0.2)";
    };
    card.onmouseleave = () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
    };

    card.innerHTML = `
      <div style="overflow: hidden; height: 180px; border-bottom: 1px solid #eee;">
        <img src="${prod.img}" alt="${prod.nombre}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'">
      </div>
      <div class="card-body" style="display: flex; flex-direction: column; gap: 0.5rem;">
        <span class="categoria" style="color: #6a1b9a; font-weight: 700;">${prod.categoria}</span>
        <h3>${prod.nombre}</h3>
        <p class="precio" style="font-size: 1.2rem;">S/ ${prod.precio}</p>
        
        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
          <button class="btn-detalle" style="flex: 1; padding: 0.6rem; background: #f4f4f4; color: #6a1b9a; border: 2px solid #6a1b9a; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.3s ease;">Detalles</button>
          <button class="btn-probar" style="flex: 1; padding: 0.6rem; background: #ff6f00; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.3s ease;">🎵 Tocar</button>
        </div>
      </div>
    `;
    
    const btnDetalle = card.querySelector(".btn-detalle");
    const btnProbar = card.querySelector(".btn-probar");

    btnDetalle.onmouseenter = () => { btnDetalle.style.background = "#6a1b9a"; btnDetalle.style.color = "#fff"; };
    btnDetalle.onmouseleave = () => { btnDetalle.style.background = "#f4f4f4"; btnDetalle.style.color = "#6a1b9a"; };

    btnDetalle.addEventListener("click", (e) => { e.stopPropagation(); mostrarAlerta(prod); });
    btnProbar.addEventListener("click", (e) => { e.stopPropagation(); abrirEstudioVirtual(prod); });

    grid.appendChild(card);
  });
}

// ==========================================
// 1. FUNCIÓN DE DETALLES (SweetAlert2)
// ==========================================
function mostrarAlerta(prod) {
  Swal.fire({
    title: prod.nombre,
    html: `
      <div class="animate__animated animate__zoomIn">
        <img src="${prod.img}" style="width: 100%; max-height: 220px; object-fit: contain; margin-bottom: 15px;">
        <p style="color: #6a1b9a; font-weight: bold; text-transform: uppercase;">${prod.categoria}</p>
        <p style="font-size: 1.5rem; color: #ff6f00; font-weight: 800;">S/ ${prod.precio}</p>
        <p style="color: #666; font-size: 0.9rem;">Instrumento de alta calidad ideal para profesionales y principiantes.</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Comprar',
    cancelButtonText: 'Cerrar',
    confirmButtonColor: '#6a1b9a',
    cancelButtonColor: '#d33'
  });
}

// ==========================================
// 2. ESTUDIO VIRTUAL (MODAL PERSONALIZADO)
// ==========================================
function abrirEstudioVirtual(prod) {
  const overlay = document.createElement("div");
  overlay.id = "estudio-virtual";
  overlay.style = "position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; transition: opacity 0.3s;";

  const studio = document.createElement("div");
  studio.className = "animate__animated animate__zoomIn";
  studio.style = "background: #1e1e1e; width: 90%; max-width: 600px; padding: 2rem; border-radius: 15px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; text-align: center; border: 1px solid #333;";

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style = "position: absolute; top: 10px; right: 15px; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer;";
  closeBtn.onclick = () => { overlay.style.opacity = "0"; setTimeout(() => overlay.remove(), 300); };

  const title = document.createElement("h2");
  title.innerText = `Sintetizador: ${prod.nombre}`;
  title.style = "color: #fff; margin-bottom: 1rem; font-family: 'Poppins', sans-serif;";

  let interfaz = document.createElement("div");
  interfaz.style = "margin-top: 20px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;";

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (prod.categoria === 'percusion') {
    const pads = [
      { nombre: 'Kick', color: '#ff6f00', tipo: 'kick' },
      { nombre: 'Snare', color: '#e91e63', tipo: 'snare' },
      { nombre: 'Hi-Hat', color: '#00bcd4', tipo: 'hihat' },
      { nombre: 'Crash', color: '#ffeb3b', tipo: 'crash' }
    ];
    pads.forEach(pad => {
      const btn = document.createElement("button");
      btn.innerText = pad.nombre;
      btn.style = `width: 100px; height: 100px; border-radius: 50%; border: 3px solid ${pad.color}; background: #2a2a2a; color: #fff; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: all 0.1s; box-shadow: 0 0 15px ${pad.color}44;`;
      btn.onmousedown = () => { btn.style.transform = "scale(0.9)"; btn.style.background = pad.color; reproducir(audioCtx, pad.tipo); };
      btn.onmouseup = () => { btn.style.transform = "scale(1)"; btn.style.background = "#2a2a2a"; };
      btn.onmouseleave = () => { btn.style.transform = "scale(1)"; btn.style.background = "#2a2a2a"; };
      interfaz.appendChild(btn);
    });
  } 
  else if (prod.categoria === 'cuerdas') {
    const cuerdas = [
      { nota: 'Mi', freq: 329.63 }, { nota: 'Si', freq: 246.94 }, { nota: 'Sol', freq: 196.00 }, 
      { nota: 'Re', freq: 146.83 }, { nota: 'La', freq: 110.00 }, { nota: 'Mi', freq: 82.41 }
    ];
    interfaz.style = "display: flex; justify-content: space-between; height: 200px; align-items: flex-end; padding: 20px; background: #3e2723; border-radius: 10px;";
    cuerdas.forEach(c => {
      const cuerda = document.createElement("button");
      cuerda.style = `width: 15%; height: 100%; background: linear-gradient(to right, #bcaaa4, #8d6e63); border: none; border-radius: 5px; cursor: pointer; position: relative; transition: all 0.1s;`;
      cuerda.innerHTML = `<span style="position: absolute; bottom: -25px; left: 0; width: 100%; color: #fff; font-weight: bold;">${c.nota}</span>`;
      cuerda.onmousedown = () => { cuerda.style.transform = "scaleY(0.9)"; cuerda.style.background = "#ff6f00"; reproducir(audioCtx, 'cuerda', c.freq); };
      cuerda.onmouseup = () => { cuerda.style.transform = "scaleY(1)"; cuerda.style.background = "linear-gradient(to right, #bcaaa4, #8d6e63)"; };
      cuerda.onmouseleave = () => { cuerda.style.transform = "scaleY(1)"; cuerda.style.background = "linear-gradient(to right, #bcaaa4, #8d6e63)"; };
      interfaz.appendChild(cuerda);
    });
  } 
  else {
    const notas = [ { nota: 'Do', freq: 261.63 }, { nota: 'Re', freq: 293.66 }, { nota: 'Mi', freq: 329.63 }, { nota: 'Fa', freq: 349.23 }, { nota: 'Sol', freq: 392.00 }, { nota: 'La', freq: 440.00 } ];
    interfaz.style = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;";
    notas.forEach(n => {
      const btn = document.createElement("button");
      btn.innerText = n.nota;
      btn.style = `padding: 20px; font-size: 1.2rem; font-weight: bold; border-radius: 10px; border: 2px solid #00bcd4; background: #2a2a2a; color: #00bcd4; cursor: pointer; transition: all 0.1s;`;
      btn.onmousedown = () => { btn.style.transform = "scale(0.9)"; btn.style.background = "#00bcd4"; btn.style.color = "#fff"; reproducir(audioCtx, 'viento', n.freq); };
      btn.onmouseup = () => { btn.style.transform = "scale(1)"; btn.style.background = "#2a2a2a"; btn.style.color = "#00bcd4"; };
      btn.onmouseleave = () => { btn.style.transform = "scale(1)"; btn.style.background = "#2a2a2a"; btn.style.color = "#00bcd4"; };
      interfaz.appendChild(btn);
    });
  }

  studio.appendChild(closeBtn);
  studio.appendChild(title);
  studio.appendChild(interfaz);
  overlay.appendChild(studio);
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = "1", 10);
}

// ==========================================
// 3. MOTOR DE AUDIO
// ==========================================
function reproducir(ctx, tipo, frecuencia = 0) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (tipo === 'kick') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(150, t); osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    gain.gain.setValueAtTime(1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.5);
  } 
  else if (tipo === 'snare') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(200, t);
    gain.gain.setValueAtTime(0.8, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.2);
  } 
  else if (tipo === 'hihat' || tipo === 'crash') {
    osc.type = 'square'; osc.frequency.setValueAtTime(tipo === 'hihat' ? 12000 : 8000, t);
    gain.gain.setValueAtTime(tipo === 'hihat' ? 0.2 : 0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + (tipo === 'hihat' ? 0.1 : 1));
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 1);
  } 
  else if (tipo === 'cuerda') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(frecuencia, t);
    gain.gain.setValueAtTime(0.6, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 1.5);
  } 
  else if (tipo === 'viento') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(frecuencia, t);
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain();
    lfo.frequency.value = 5; lfoGain.gain.value = 5; lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    lfo.start(t); lfo.stop(t + 2);
    gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 2);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 2);
  }
}