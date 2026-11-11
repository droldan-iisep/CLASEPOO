// =========================================================
//  TU ARCHIVO (PROFE) - main.js
//  Centraliza los productos y arranca los módulos.
// =========================================================

// 1. Tú defines los productos oficiales aquí.
// Los alumnos solo los consumen.
const PRODUCTOS_TIENDA = [
    { id: 1, nombre: "Guitarra Acústica", precio: 250, categoria: "cuerdas", img: "img/guitarra.jpg" },
    { id: 2, nombre: "Violín Clásico", precio: 320, categoria: "cuerdas", img: "img/violin.jpg" },
    { id: 3, nombre: "Saxofón Alto", precio: 480, categoria: "vientos", img: "img/saxofon.jpg" },
    { id: 4, nombre: "Flauta Traversa", precio: 180, categoria: "vientos", img: "img/flauta.jpg" },
    { id: 5, nombre: "Batería Completa", precio: 700, categoria: "percusion", img: "img/bateria.jpg" },
    { id: 6, nombre: "Cajón Peruano", precio: 120, categoria: "percusion", img: "img/cajon.jpg" }
  ];
  
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Iniciando tienda Armonía...");
  
    // Arrancar Alumno 1
    if (typeof renderProductos === "function") {
      renderProductos(PRODUCTOS_TIENDA);
    }
  
    // Arrancar Alumno 2
    if (typeof initVentas === "function") {
      initVentas(PRODUCTOS_TIENDA);
    }
  
    // Arrancar Alumno 3
    if (typeof initDelivery === "function") {
      initDelivery();
    }
  });