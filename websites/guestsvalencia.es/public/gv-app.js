<!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Guests Valencia - Alojamientos Turísticos de Calidad</title>

      <!-- Fuentes -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
  rel="stylesheet">

      <!-- Tailwind CSS -->
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
          tailwind.config = {
              theme: {
                  extend: {
                      fontFamily: {
                          'inter': ['Inter', 'sans-serif'],
                      },
                      colors: {
                          'guests-blue': '#0ea5e9',
                          'guests-red': '#ef4444',
                          'guests-pink': '#ec4899',
                      }
                  }
              }
          }
      </script>

      <!-- Lucide Icons -->
      <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
      <link rel="stylesheet" href="estilos.css">
  </head>
  <body class="antialiased font-inter bg-slate-50 text-slate-900">

      <div id="gv-app">
          <div id="gv-loading" class="fixed inset-0 bg-white flex items-center justify-center z-50">
              <div class="text-center">
                  <div class="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin
  mx-auto mb-4"></div>
                  <p class="text-gray-600">Cargando Guests Valencia...</p>
              </div>
          </div>
      </div>

      <script src="gv-app.js"></script>
  </body>
  </html>

  ¡PEGA ESTO EXACTAMENTE!

● Update Todos
  ⎿  [×] Identificar problema con archivos faltantes
     [×] Crear archivos separados correctamente
     [×] Subir archivos corregidos al repositorio
     [×] Verificar funcionamiento del sitio
     [×] Diagnosticar problema con archivos faltantes
     [×] Verificar función Netlify sandra-chat
     [×] Corregir integración OpenAI
     [×] Migrar Sandra IA a Vercel Functions
     [×] Crear archivo vercel.json
     [×] Crear función API de Vercel
     [×] Agregar OPENAI_MODEL_DEFAULT
     [ ] Corregir HTML simplificado

> // Guests Valencia - Frontend App (INTEGRA CON TU BACKEND EXISTENTE)
    // NO MODIFICA NINGUNA DE TUS 18 FUNCIONES NI VARIABLES

    class GuestsValenciaFrontend {
        constructor() {
            this.currentPage = 'home';
            this.selectedProperty = null;
            this.currentImageIndex = 0;
            this.showSandra = false;
            this.searchFilters = {
                location: '',
                checkIn: '',
                checkOut: '',
                guests: 1
            };

            // Datos de alojamientos (esto lo puedes conectar a tu base de datos después)
            this.alojamientosData = [
                {
                    id: '1',
                    title: 'Ático de Lujo en El Carmen',
                    location: 'Valencia, España',
                    neighborhood: 'El Carmen',
                    price: 120,
                    rating: 4.8,
                    reviews: 42,
                    images: [                        'https://images.unsplash.com/photo-1594563703937-fdc418523b2d?q=80&w=870&auto=format&fit=crop',                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=870&auto=format&fit=crop',                        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=870&auto=format&fit=crop',                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=870&auto=format&fit=crop'                    ],
                    description: 'Espectacular ático en el corazón histórico de Valencia. Completamente renovado con todas las comodidades modernas.',
                    amenities: ['Wifi gratuito', 'Aire acondicionado', 'Cocina completa', 'Terraza privada', 'TV'],
                    bedrooms: 2,
                    bathrooms: 2,
                    maxGuests: 4,
                    type: 'Apartamento completo'
                },
                {
                    id: '2',
                    title: 'Loft Moderno en Ruzafa',
                    location: 'Valencia, España',
                    neighborhood: 'Ruzafa',
                    price: 95,
                    rating: 4.9,
                    reviews: 28,
                    images: [                        'https://images.unsplash.com/photo-1556912173-35c24a7a4481?q=80&w=870&auto=format&fit=crop',                        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=870&auto=format&fit=crop',                        'https://images.unsplash.com/photo-1560448075-bb485b067938?q=80&w=870&auto=format&fit=crop'                    ],
                    ],
                    description: 'Loft de diseño en el vibrante barrio de Ruzafa, cerca de los mejores restaurantes
   y
     vida nocturna.',
                    amenities: ['Wifi gratuito', 'Aire acondicionado', 'Cocina', 'Parking privado'],
                    bedrooms: 1,
                    bathrooms: 1,
                    maxGuests: 2,
                    type: 'Loft completo'
                },
                {
                    id: '3',
                    title: 'Apartamento con vistas al mar',
                    location: 'Playa de la Malvarrosa, Valencia',
                    neighborhood: 'Malvarrosa',
                    price: 150,
                    rating: 4.7,
                    reviews: 89,
                    images: [                        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=870&auto=format&fit=crop',                        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=870&auto=format&fit=crop'                    ],
                    description: 'Primera línea de playa con vistas espectaculares al Mediterráneo.',
                    amenities: ['Wifi gratuito', 'Vista al mar', 'Balcón', 'Cerca de la playa'],
                    bedrooms: 3,
                    bathrooms: 2,
                    maxGuests: 6,
                    type: 'Apartamento completo'
                }
            ];

            this.init();
        }

        init() {
            this.createMainStructure();
            this.bindEvents();
            this.initializeIcons();
            this.hideLoading();
            this.renderCurrentPage();
        }

        hideLoading() {
            setTimeout(() => {
                const loading = document.getElementById('gv-loading');
                if (loading) {
                    loading.style.display = 'none';
                }
            }, 1000);
        }

        initializeIcons() {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        createMainStructure() {
            const app = document.getElementById('gv-app');
            app.innerHTML = `
                <!-- Barra superior de contacto -->
                <div class="bg-slate-800 text-white text-xs">
                    <div class="container mx-auto px-4 py-2 flex justify-between items-center">
                        <div class="flex items-center gap-x-4">
                            <a href="tel:+34966497016" class="hover:text-sky-400 transition-colors">+34 966 497
    016</a>
                            <a href="mailto:hello@guestsvalencia.es" class="hover:text-sky-400 transition-colors
    hidden sm:inline">hello@guestsvalencia.es</a>
                            <a href="https://wa.me/34966497016" target="_blank" rel="noopener noreferrer"
    class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-600
    transition-colors">WhatsApp</a>
                        </div>
                        <div class="flex items-center gap-x-4">
                            <span>Español</span>
                            <span>€ Euro</span>
                        </div>
                    </div>
                </div>

                <!-- Header Principal -->
                <header class="bg-white/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
                    <div class="container mx-auto px-4 py-2 flex justify-between items-center">
                        <!-- Logo -->
                        <button onclick="gvApp.setCurrentPage('home')" class="flex items-center">
                            <img
                                src="https://placehold.co/280x80/0ea5e9/ffffff?text=GUESTS+VALENCIA"
                                alt="GUESTS VALENCIA Logo"
                                class="h-20 transition-opacity hover:opacity-80"
                            />
                        </button>

                        <!-- Navegación -->
                        <nav class="hidden md:flex items-center gap-x-2 text-slate-600 font-semibold">
                            <button onclick="gvApp.setCurrentPage('home')" class="gv-nav-btn px-3 py-2 rounded-md
    transition-colors hover:text-sky-500" data-page="home">
                                Inicio
                            </button>
                            <button onclick="gvApp.setCurrentPage('alojamientos')" class="gv-nav-btn px-3 py-2
    rounded-md transition-colors hover:text-sky-500" data-page="alojamientos">
                                Alojamientos
                            </button>
                            <a href="propietarios.html" class="px-3 py-2 rounded-md transition-colors
    hover:text-sky-500">
                                Propietarios
                            </a>
                            <a href="contacto.html" class="px-3 py-2 rounded-md transition-colors
    hover:text-sky-500">
                                Contacto
                            </a>
                            <a href="panel/" class="px-3 py-2 rounded-md transition-colors hover:text-sky-500">
                                Panel
                            </a>
                        </nav>

                        <!-- Área de usuario -->
                        <div class="hidden md:flex items-center">
                            <div class="relative mr-3">
                                <button onclick="gvApp.showSandraChat()" class="text-slate-600 hover:text-sky-500
  p-2
     rounded-full transition-colors" title="Sandra IA">
                                    <i data-lucide="brain" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <div class="relative">
                                <a href="acceso.html" class="bg-red-500 text-white font-semibold px-5 py-2
    rounded-full hover:bg-red-600 transition-colors text-sm">
                                    Acceso
                                </a>
                            </div>
                        </div>
                        <button class="md:hidden text-slate-800">
                            <i data-lucide="menu" class="w-6 h-6"></i>
                        </button>
                    </div>
                </header>

                <!-- Contenido Principal -->
                <main id="gv-main-content" class="container mx-auto px-4 min-h-screen">
                    <!-- El contenido se renderizará aquí -->
                </main>

                <!-- FAB Sandra IA -->
                <div class="fixed bottom-8 right-8 z-50">
                    <button onclick="gvApp.showSandraChat()" class="w-16 h-16 bg-gradient-to-r from-red-500
    via-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-3xl
    transition-all duration-300 hover:scale-110 relative overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500
    opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <i data-lucide="brain" class="h-8 w-8 relative z-10"></i>
                        <div class="absolute -top-14 right-0 bg-black/90 backdrop-blur-sm text-white px-3 py-2
    rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap
    shadow-xl">
                            🧠 Sandra IA 7.0
                            <div class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4
    border-transparent border-t-black/90"></div>
                        </div>
                    </button>
                </div>

                <!-- Footer -->
                <footer class="bg-slate-800 text-white mt-16">
                    <div class="container mx-auto px-4 py-12">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                            <div>
                                <h3 class="font-bold text-lg mb-4">GUESTS VALENCIA</h3>
                                <p class="text-slate-400 mb-4">Tu hogar lejos de casa en la hermosa Valencia</p>
                                <div class="space-y-2 text-slate-400">
                                    <p>📍 Avda de la Marina 318</p>
                                    <p>03720 Benissa, Alicante</p>
                                    <p>📞 +34 966 497 016</p>
                                    <p>✉️ hello@guestsvalencia.es</p>
                                </div>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-4">Soporte</h4>
                                <ul class="space-y-2 text-slate-400">
                                    <li><button onclick="gvApp.showSandraChat()" class="hover:text-white
    transition-colors">Centro de ayuda</button></li>
                                    <li><a href="preguntas-frecuentes.html" class="hover:text-white
    transition-colors">Preguntas frecuentes</a></li>
                                    <li><a href="cancelar.html" class="hover:text-white transition-colors">Opciones
    de cancelación</a></li>
                                    <li><a href="#" class="hover:text-white transition-colors">Respuesta
    COVID-19</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-4">Comunidad</h4>
                                <ul class="space-y-2 text-slate-400">
                                    <li><a href="#" class="hover:text-white transition-colors">Experiencias
    locales</a></li>
                                    <li><a href="propietarios.html" class="hover:text-white
  transition-colors">Hazte
    anfitrión</a></li>
                                    <li><a href="blog.html" class="hover:text-white transition-colors">Blog de
    viajes</a></li>
                                    <li><a href="#" class="hover:text-white transition-colors">Programa de
    referidos</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-4">Acerca de</h4>
                                <ul class="space-y-2 text-slate-400">
                                    <li><a href="#" class="hover:text-white transition-colors">Cómo
  funciona</a></li>
                                    <li><a href="#" class="hover:text-white transition-colors">Newsroom</a></li>
                                    <li><a href="#" class="hover:text-white transition-colors">Inversores</a></li>
                                    <li><a href="#" class="hover:text-white transition-colors">Carreras</a></li>
                                </ul>
                            </div>
                        </div>
                        <hr class="border-slate-700 my-8">
                        <div class="flex flex-col md:flex-row justify-between items-center">
                            <div class="flex items-center space-x-6 text-slate-400 text-sm mb-4 md:mb-0">
                                <span>&copy; 2024 Guests Valencia</span>
                                <a href="#" class="hover:text-white transition-colors">Privacidad</a>
                                <a href="#" class="hover:text-white transition-colors">Términos</a>
                                <a href="#" class="hover:text-white transition-colors">Cookies</a>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="text-slate-400 text-sm">Síguenos:</span>
                                <div class="flex space-x-3">
                                    <button class="w-8 h-8 bg-slate-700 rounded-full flex items-center
  justify-center
     hover:bg-slate-600 transition-colors">
                                        <span class="text-xs">f</span>
                                    </button>
                                    <button class="w-8 h-8 bg-slate-700 rounded-full flex items-center
  justify-center
     hover:bg-slate-600 transition-colors">
                                        <span class="text-xs">t</span>
                                    </button>
                                    <button class="w-8 h-8 bg-slate-700 rounded-full flex items-center
  justify-center
     hover:bg-slate-600 transition-colors">
                                        <span class="text-xs">i</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- Modales -->
                <div id="gv-modals-container"></div>
            `;
        }

        bindEvents() {
            // Hacer la app accesible globalmente
            window.gvApp = this;
        }

        setCurrentPage(page) {
            this.currentPage = page;
            this.updateNavigation();
            this.renderCurrentPage();
        }

        updateNavigation() {
            const navButtons = document.querySelectorAll('.gv-nav-btn');
            navButtons.forEach(btn => {
                const page = btn.getAttribute('data-page');
                if (page === this.currentPage) {
                    btn.classList.add('text-sky-500');
                } else {
                    btn.classList.remove('text-sky-500');
                }
            });
        }

        renderCurrentPage() {
            const mainContent = document.getElementById('gv-main-content');
            let content = '';

            switch (this.currentPage) {
                case 'home':
                    content = this.renderHomePage();
                    break;
                case 'alojamientos':
                    content = this.renderAlojamientosPage();
                    break;
                case 'detalle':
                    content = this.renderDetallePage();
                    break;
                default:
                    content = this.renderHomePage();
            }

            mainContent.innerHTML = content;
            this.initializeIcons();
        }

        renderHomePage() {
            return `
                <!-- Hero Banner con búsqueda -->
                <div class="relative rounded-2xl overflow-hidden my-8">
                    <div
                        class="h-[60vh] min-h-[400px] max-h-[600px] flex flex-col items-center justify-center p-4
    bg-overlay"
                        style="background:
    url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop') no-repeat
    center center; background-size: cover;"
                    >
                        <h1 class="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg mb-8">
                            Alójate aquí, Vive Valencia
                        </h1>

                        <!-- Barra de búsqueda -->
                        <div class="w-full max-w-2xl">
                            <div class="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-2xl flex items-center
    gap-2">
                                <div class="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Empieza tu búsqueda..."
                                        class="w-full bg-transparent px-4 py-3 text-lg outline-none
    placeholder-slate-500"
                                        onclick="gvApp.setCurrentPage('alojamientos')"
                                    />
                                </div>
                                <button
                                    onclick="gvApp.setCurrentPage('alojamientos')"
                                    class="bg-sky-500 text-white rounded-full p-3 hover:bg-sky-600
  transition-colors
    flex-shrink-0"
                                >
                                    <i data-lucide="search" class="w-6 h-6"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sección Alojamientos -->
                <section class="my-16">
                    <h2 class="text-3xl font-bold text-center text-slate-800 mb-10">Nuestros Alojamientos</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${this.alojamientosData.map(alojamiento => `
                            <article class="card bg-white rounded-xl shadow-md overflow-hidden group
  hover:shadow-xl
    transition-all duration-300 cursor-pointer" onclick="gvApp.selectProperty('${alojamiento.id}')">
                                <div class="overflow-hidden">
                                    <img
                                        src="${alojamiento.images[0]}"
                                        alt="${alojamiento.title}"
                                        class="h-56 w-full object-cover transition-transform duration-300
    group-hover:scale-105"
                                    />
                                </div>
                                <div class="p-5">
                                    <h3 class="text-xl font-bold text-slate-800 mb-1">${alojamiento.title}</h3>
                                    <p class="text-sm text-slate-600 mb-4">${alojamiento.location}</p>
                                    <div class="flex justify-between items-center">
                                        <div class="text-slate-800">
                                            <span class="text-sm">Desde </span>
                                            <strong class="text-xl font-extrabold">€${alojamiento.price}</strong>
                                            <span class="text-sm">/noche</span>
                                        </div>
                                        <button
                                            onclick="event.stopPropagation();
    gvApp.selectProperty('${alojamiento.id}')"
                                            class="bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg
    hover:bg-sky-600 transition-colors"
                                        >
                                            Ver Alojamiento
                                        </button>
                                    </div>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>

                <!-- Sección Servicios -->
                <section class="my-16">
                    <h2 class="text-3xl font-bold text-center text-slate-800">Tranquilidad, Legalidad y Atención
    Total</h2>
                    <p class="text-center text-slate-600 mt-2 max-w-3xl mx-auto">Con Guests Valencia, tu propiedad
    está en manos expertas. Nos ocupamos de todo para que tú solo disfrutes los beneficios.</p>
                    <div class="grid md:grid-cols-2 gap-8 mt-10">
                        <div class="bg-white p-6 rounded-xl shadow-md">
                            <h3 class="text-xl font-bold text-sky-600">Para Propietarios</h3>
                            <ul class="mt-4 space-y-2 text-slate-600">
                                <li>✓ Gestión 100% transparente</li>
                                <li>✓ Publicidad profesional y fotos premium</li>
                                <li>✓ Acceso privado para controlar tus reservas</li>
                                <li>✓ Cero preocupaciones: limpieza, mantenimiento, check-in y más</li>
                            </ul>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-md">
                            <h3 class="text-xl font-bold text-sky-600">Para Viajeros</h3>
                            <ul class="mt-4 space-y-2 text-slate-600">
                                <li>✓ Reserva inmediata y asistencia 24h</li>
                                <li>✓ Confirmación por WhatsApp/email</li>
                                <li>✓ Check-in rápido y flexible</li>
                                <li>✓ Recomendaciones locales personalizadas</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Sección Propietarios -->
                <section class="my-16 bg-slate-100 py-12 rounded-2xl">
                    <div class="container mx-auto px-4">
                        <h2 class="text-3xl font-bold text-center text-slate-800">Gestionamos tu alojamiento. Tú
  solo
     disfruta los ingresos.</h2>
                        <p class="text-center text-slate-600 mt-2 max-w-3xl mx-auto">Desde la publicación hasta la
    limpieza, lo hacemos todo por ti. Elige el plan que mejor se adapta a tus necesidades.</p>
                        <div class="grid md:grid-cols-3 gap-8 mt-10 text-center">
                            <div class="bg-white p-6 rounded-xl shadow-md">
                                <h3 class="text-xl font-bold">Plan Esencial</h3>
                                <p class="text-3xl font-extrabold text-sky-600 my-2">15% <span class="text-base
    font-medium text-slate-500">+IVA</span></p>
                                <p class="text-slate-600">Publicación, calendario y comunicación con el
  huésped.</p>
                            </div>
                            <div class="bg-white p-8 rounded-xl shadow-xl border-2 border-sky-500">
                                <h3 class="text-2xl font-bold">Plan Confianza</h3>
                                <p class="text-4xl font-extrabold text-sky-600 my-2">20% <span class="text-base
    font-medium text-slate-500">+IVA</span></p>
                                <p class="text-slate-600">Todo lo del Plan Esencial, más fotos profesionales,
    optimización de precios y gestión de limpieza.</p>
                            </div>
                            <div class="bg-white p-6 rounded-xl shadow-md">
                                <h3 class="text-xl font-bold">Plan TOTAL</h3>
                                <p class="text-3xl font-extrabold text-sky-600 my-2">25% <span class="text-base
    font-medium text-slate-500">+IVA</span></p>
                                <p class="text-slate-600">Todo lo anterior, más reporte fiscal, asesoría legal y
    seguro de daños.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Sección de Contacto -->
                <section class="my-16 bg-slate-100 py-12 rounded-2xl">
                    <div class="container mx-auto px-4">
                        <h2 class="text-3xl font-bold text-center text-slate-800 mb-2">Contáctanos</h2>
                        <p class="text-center text-slate-600 max-w-2xl mx-auto mb-10">¿Tienes alguna pregunta,
    sugerencia o quieres que gestionemos tu propiedad? Rellena el formulario y te responderemos lo antes
  posible.</p>

                        <div class="max-w-xl mx-auto space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre
  Completo</label>
                                <input type="text" class="w-full px-4 py-3 rounded-lg border border-gray-300
    focus:ring-2 focus:ring-sky-500 outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Correo
    Electrónico</label>
                                <input type="email" class="w-full px-4 py-3 rounded-lg border border-gray-300
    focus:ring-2 focus:ring-sky-500 outline-none" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                                <textarea rows="5" class="w-full px-4 py-3 rounded-lg border border-gray-300
    focus:ring-2 focus:ring-sky-500 outline-none"></textarea>
                            </div>
                            <button
                                onclick="gvApp.sendContactForm()"
                                class="w-full bg-sky-500 text-white font-semibold py-3 rounded-lg hover:bg-sky-600
    transition-colors"
                            >
                                Enviar Mensaje
                            </button>
                        </div>
                    </div>
                </section>
            `;
        }

        renderAlojamientosPage() {
            return `
                <div class="my-8">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold text-slate-800">Alojamientos en Valencia</h1>
                        <div class="flex items-center gap-4">
                            <select class="border border-gray-300 rounded-lg px-4 py-2">
                                <option>Precio: menor a mayor</option>
                                <option>Precio: mayor a menor</option>
                                <option>Mejor valorados</option>
                                <option>Más recientes</option>
                            </select>
                        </div>
                    </div>

                    <!-- Lista de propiedades -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${this.alojamientosData.map(property => `
                            <div class="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl
    transition-shadow cursor-pointer" onclick="gvApp.selectProperty('${property.id}')">
                                <div class="relative overflow-hidden">
                                    <img
                                        src="${property.images[0]}"
                                        alt="${property.title}"
                                        class="h-56 w-full object-cover transition-transform duration-300
    group-hover:scale-105"
                                    />
                                    <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2
    rounded-full hover:bg-white transition-colors">
                                        <i data-lucide="heart" class="w-4 h-4"></i>
                                    </button>
                                    <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1
    rounded-full text-xs font-medium">
                                        ${property.type}
                                    </div>
                                </div>
                                <div class="p-5">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="font-bold text-slate-800 line-clamp-1">${property.title}</h3>
                                        <div class="flex items-center">
                                            <i data-lucide="star" class="w-4 h-4 fill-yellow-400
    text-yellow-400"></i>
                                            <span class="text-sm ml-1">${property.rating}</span>
                                        </div>
                                    </div>
                                    <p class="text-sm text-slate-600 mb-2">${property.location}</p>
                                    <p class="text-xs text-slate-500 mb-4">${property.bedrooms} dormitorios •
    ${property.bathrooms} baños</p>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <span class="font-bold text-xl">€${property.price}</span>
                                            <span class="text-sm text-slate-600"> /noche</span>
                                        </div>
                                        <span class="text-xs text-slate-500">${property.reviews} reseñas</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderDetallePage() {
            if (!this.selectedProperty) return '<div>Propiedad no encontrada</div>';

            return `
                <div class="my-8">
                    <button onclick="gvApp.setCurrentPage('alojamientos')" class="flex items-center text-slate-600
    hover:text-sky-500 mb-6">
                        <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
                        Volver a los resultados
                    </button>

                    <h1 class="text-3xl font-bold text-slate-800 mb-6">${this.selectedProperty.title}</h1>

                    <!-- Galería de imágenes -->
                    <div class="grid grid-cols-4 gap-2 rounded-xl overflow-hidden mb-8 h-96">
                        <div class="col-span-2 row-span-2">
                            <img
                                src="${this.selectedProperty.images[0]}"
                                alt="${this.selectedProperty.title}"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        ${this.selectedProperty.images.slice(1, 5).map((image, index) => `
                            <div class="relative">
                                <img
                                    src="${image}"
                                    alt="Vista ${index + 2}"
                                    class="w-full h-full object-cover"
                                />
                            </div>
                        `).join('')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-2">
                            <p class="text-slate-700 leading-relaxed mb-6">${this.selectedProperty.description}</p>

                            <h3 class="text-lg font-semibold mb-4">Lo que ofrece este lugar</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                ${this.selectedProperty.amenities.map(amenity => `
                                    <div class="flex items-center">
                                        <i data-lucide="wifi" class="w-5 h-5 text-slate-600 mr-3"></i>
                                        <span>${amenity}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="lg:col-span-1">
                            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-24">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <span class="text-2xl font-bold">€${this.selectedProperty.price}</span>
                                        <span class="text-slate-600"> /noche</span>
                                    </div>
                                    <div class="flex items-center">
                                        <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
                                        <span class="text-sm ml-1">${this.selectedProperty.rating}
    (${this.selectedProperty.reviews})</span>
                                    </div>
                                </div>

                                <a
                                    href="reservar.html"
                                    class="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white
  font-semibold
    py-3 rounded-lg hover:shadow-lg transition-all mb-4 block text-center"
                                >
                                    Reservar
                                </a>

                                <p class="text-center text-sm text-slate-600">Contacta para reservar</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        selectProperty(propertyId) {
            this.selectedProperty = this.alojamientosData.find(p => p.id === propertyId);
            this.setCurrentPage('detalle');
        }

        // ESTA FUNCIÓN USA TU SANDRA IA EXISTENTE - NO LA MODIFICO
        showSandraChat() {
            this.createSandraModal();
        }

        createSandraModal() {
            const modalsContainer = document.getElementById('gv-modals-container');
            modalsContainer.innerHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
                        <div class="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-t-2xl flex
    items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center
    mr-3">
                                    <i data-lucide="brain" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold">Sandra IA 7.0</h3>
                                    <p class="text-sm opacity-90">Tu asistente de viajes</p>
                                </div>
                            </div>
                            <button onclick="gvApp.closeSandraChat()" class="text-white hover:text-gray-300">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <div class="flex-1 p-4 bg-gray-50" id="gv-sandra-chat-content">
                            <div class="bg-gray-100 rounded-lg p-3 mb-4">
                                <p class="text-sm">¡Hola! Soy Sandra, tu asistente de Guests Valencia. ¿En qué
  puedo
    ayudarte?</p>
                            </div>
                            <div id="gv-chat-messages"></div>
                        </div>
                        <div class="p-4 border-t">
                            <div class="flex gap-2">
                                <input
                                    type="text"
                                    id="gv-sandra-message-input"
                                    placeholder="Escribe tu mensaje..."
                                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none
    focus:ring-2 focus:ring-sky-500"
                                    onkeypress="if(event.key==='Enter') gvApp.sendSandraMessage()"
                                />
                                <button onclick="gvApp.sendSandraMessage()" class="bg-sky-500 text-white p-2
    rounded-lg hover:bg-sky-600 transition-colors">
                                    <i data-lucide="send" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.initializeIcons();
        }

        // ESTA FUNCIÓN USA TU ENDPOINT SANDRA EXISTENTE - AHORA CON VERCEL
        async sendSandraMessage() {
            const input = document.getElementById('gv-sandra-message-input');
            const message = input.value.trim();

            if (!message) return;

            const chatMessages = document.getElementById('gv-chat-messages');

            // Agregar mensaje del usuario
            chatMessages.innerHTML += `
                <div class="mb-4 flex justify-end">
                    <div class="bg-sky-500 text-white p-3 rounded-lg max-w-xs">
                        ${message}
                    </div>
                </div>
            `;

            input.value = '';

            // Mostrar typing indicator
            chatMessages.innerHTML += `
                <div class="mb-4" id="gv-typing-indicator">
                    <div class="bg-gray-200 p-3 rounded-lg max-w-xs">
                        <div class="flex space-x-1">
                            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:
    0.1s"></div>
                            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:
    0.2s"></div>
                        </div>
                    </div>
                </div>
            `;

            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                // LLAMADA A TU FUNCIÓN SANDRA EN VERCEL - CAMBIADA LA URL
                const response = await fetch('/api/sandra-chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        role: 'visitor'
                    })
                });

                const data = await response.json();

                // Remover typing indicator
                const typingIndicator = document.getElementById('gv-typing-indicator');
                if (typingIndicator) typingIndicator.remove();

                // Agregar respuesta de Sandra
                chatMessages.innerHTML += `
                    <div class="mb-4">
                        <div class="bg-gray-200 p-3 rounded-lg max-w-xs">
                            ${data.reply || data.respuesta || 'Lo siento, no pude procesar tu mensaje.'}
                        </div>
                    </div>
                `;

            } catch (error) {
                console.error('Error:', error);
                const typingIndicator = document.getElementById('gv-typing-indicator');
                if (typingIndicator) typingIndicator.remove();

                chatMessages.innerHTML += `
                    <div class="mb-4">
                        <div class="bg-red-100 text-red-700 p-3 rounded-lg max-w-xs">
                            Lo siento, hay un problema con la conexión. Por favor, intenta de nuevo.
                        </div>
                    </div>
                `;
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        closeSandraChat() {
            document.getElementById('gv-modals-container').innerHTML = '';
        }

        sendContactForm() {
            alert('¡Mensaje enviado! Te responderemos muy pronto.');
        }
    }

    // Inicializar la aplicación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        const gvApp = new GuestsValenciaFrontend();
    });
