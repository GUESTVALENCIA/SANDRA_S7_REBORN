/*
 * Reservar.js - PayPal Sandbox Integration
 * GuestsValencia - ClayTom Systems
 */

(function() {
  'use strict';

  // Variables de entorno (se cargarán desde Netlify)
  const PAYPAL_CLIENT_ID = window.PAYPAL_CLIENT_ID || 'SANDBOX_CLIENT_ID';
  const PAYPAL_MODE = 'sandbox'; // sandbox | production

  // WhatsApp
  const WA = '+34624829117';
  function waLink(msg) {
    return 'https://wa.me/' + WA.replace(/\D/g, '') + (msg ? ('?text=' + encodeURIComponent(msg)) : '');
  }

  // Referencias DOM
  const guestForm = document.getElementById('guest-form');
  const paypalContainer = document.getElementById('paypal-button-container');
  const alternativePayBtn = document.getElementById('pay-alternative');
  const paymentStatus = document.getElementById('payment-status');
  const confirmationModal = document.getElementById('confirmation-modal');
  const contactWhatsApp = document.getElementById('contact-whatsapp');

  // Datos de la reserva (normalmente vendrían de URL params o sessionStorage)
  let bookingData = {
    accommodation: {
      id: 'mn47',
      name: 'Méndez Núñez 47',
      location: 'Centro histórico, Valencia',
      image: '/images/mn47_1.jpg'
    },
    dates: {
      checkin: '2024-02-15',
      checkout: '2024-02-18',
      nights: 3
    },
    guests: {
      adults: 2,
      children: 0
    },
    pricing: {
      pricePerNight: 85,
      subtotal: 255,
      cleaningFee: 25,
      localTaxes: 6,
      total: 286
    }
  };

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    initializeBookingData();
    setupPayPalButtons();
    setupEventListeners();
  });

  function initializeBookingData() {
    // Cargar datos desde URL o sessionStorage si existen
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('accommodation')) {
      bookingData.accommodation.name = decodeURIComponent(urlParams.get('accommodation'));
    }
    if (urlParams.get('checkin')) {
      bookingData.dates.checkin = urlParams.get('checkin');
    }
    if (urlParams.get('checkout')) {
      bookingData.dates.checkout = urlParams.get('checkout');
    }
    if (urlParams.get('guests')) {
      bookingData.guests.adults = parseInt(urlParams.get('guests')) || 2;
    }

    // Calcular noches y precio
    const checkinDate = new Date(bookingData.dates.checkin);
    const checkoutDate = new Date(bookingData.dates.checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    bookingData.dates.nights = nights;
    bookingData.pricing.subtotal = bookingData.pricing.pricePerNight * nights;
    bookingData.pricing.total = bookingData.pricing.subtotal + bookingData.pricing.cleaningFee + bookingData.pricing.localTaxes;

    // Actualizar UI
    updateBookingUI();
  }

  function updateBookingUI() {
    // Información del alojamiento
    document.getElementById('accommodation-name').textContent = bookingData.accommodation.name;
    document.getElementById('accommodation-location').textContent = bookingData.accommodation.location;
    document.getElementById('accommodation-image').src = bookingData.accommodation.image;

    // Fechas
    const checkinFormatted = new Date(bookingData.dates.checkin).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const checkoutFormatted = new Date(bookingData.dates.checkout).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    document.getElementById('checkin-date').textContent = checkinFormatted;
    document.getElementById('checkout-date').textContent = checkoutFormatted;
    document.getElementById('total-nights').textContent = bookingData.dates.nights;
    document.getElementById('total-guests').textContent = `${bookingData.guests.adults} adultos`;

    // Precios
    document.getElementById('price-per-night').textContent = bookingData.pricing.pricePerNight;
    document.getElementById('nights-count').textContent = bookingData.dates.nights;
    document.getElementById('subtotal').textContent = bookingData.pricing.subtotal;
    document.getElementById('cleaning-fee').textContent = bookingData.pricing.cleaningFee;
    document.getElementById('local-taxes').textContent = bookingData.pricing.localTaxes;
    document.getElementById('total-price').textContent = bookingData.pricing.total;

    // Modal
    document.getElementById('modal-checkin').textContent = checkinFormatted;
  }

  function setupPayPalButtons() {
    if (typeof paypal === 'undefined') {
      console.warn('PayPal SDK not loaded');
      showPaymentStatus('error', 'Error de configuración', 'No se pudo cargar PayPal. Usa el pago alternativo.');
      return;
    }

    // Actualizar el client-id del script si es necesario
    updatePayPalClientId();

    paypal.Buttons({
      style: {
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 50,
        tagline: false
      },

      createOrder: function(data, actions) {
        // Validar formulario antes del pago
        if (!validateGuestForm()) {
          return Promise.reject(new Error('Por favor, completa todos los campos obligatorios'));
        }

        return actions.order.create({
          purchase_units: [{
            reference_id: generateBookingReference(),
            description: `Reserva ${bookingData.accommodation.name} - ${bookingData.dates.nights} noches`,
            amount: {
              currency_code: 'EUR',
              value: bookingData.pricing.total.toString(),
              breakdown: {
                item_total: {
                  currency_code: 'EUR',
                  value: bookingData.pricing.subtotal.toString()
                },
                tax_total: {
                  currency_code: 'EUR',
                  value: bookingData.pricing.localTaxes.toString()
                },
                handling: {
                  currency_code: 'EUR',
                  value: bookingData.pricing.cleaningFee.toString()
                }
              }
            },
            items: [{
              name: bookingData.accommodation.name,
              quantity: bookingData.dates.nights.toString(),
              unit_amount: {
                currency_code: 'EUR',
                value: bookingData.pricing.pricePerNight.toString()
              },
              category: 'PHYSICAL_GOODS'
            }]
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            brand_name: 'GuestsValencia',
            locale: 'es-ES'
          }
        });
      },

      onApprove: function(data, actions) {
        showPaymentStatus('processing', 'Procesando pago...', 'Validando tu pago con PayPal');

        return actions.order.capture().then(function(orderData) {
          console.log('Payment successful:', orderData);

          // Simular guardado en backend
          setTimeout(() => {
            processSuccessfulPayment(orderData);
          }, 2000);
        });
      },

      onError: function(err) {
        console.error('PayPal error:', err);
        showPaymentStatus('error', 'Error en el pago', 'Ha ocurrido un error. Inténtalo de nuevo o usa el pago alternativo.');
      },

      onCancel: function(data) {
        console.log('Payment cancelled:', data);
        showPaymentStatus('cancelled', 'Pago cancelado', 'Puedes intentar de nuevo cuando quieras.');
      }

    }).render('#paypal-button-container');
  }

  function updatePayPalClientId() {
    // Actualizar el client-id del script PayPal si viene de variables de entorno
    const scripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    scripts.forEach(script => {
      if (PAYPAL_CLIENT_ID !== 'SANDBOX_CLIENT_ID') {
        const newSrc = script.src.replace('PAYPAL_CLIENT_ID_SANDBOX', PAYPAL_CLIENT_ID);
        script.src = newSrc;
      }
    });
  }

  function validateGuestForm() {
    const formData = new FormData(guestForm);
    const required = ['firstName', 'lastName', 'email', 'phone'];

    for (const field of required) {
      if (!formData.get(field) || formData.get(field).trim() === '') {
        alert(`Por favor, completa el campo ${field === 'firstName' ? 'nombre' : field === 'lastName' ? 'apellidos' : field}`);
        document.querySelector(`[name="${field}"]`).focus();
        return false;
      }
    }

    // Validar email básico
    const email = formData.get('email');
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Por favor, introduce un email válido');
      document.querySelector('[name="email"]').focus();
      return false;
    }

    return true;
  }

  function generateBookingReference() {
    const prefix = 'GV';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  function showPaymentStatus(type, title, message) {
    const statusEl = paymentStatus;
    const circle = statusEl.querySelector('div');
    const titleEl = statusEl.querySelector('span');
    const messageEl = statusEl.querySelector('p');

    // Reset classes
    circle.className = 'w-4 h-4 rounded-full';
    statusEl.className = 'mt-4 p-4 rounded-lg';

    switch (type) {
      case 'processing':
        statusEl.classList.add('bg-blue-50', 'border', 'border-blue-200');
        circle.classList.add('bg-blue-500', 'animate-pulse');
        break;
      case 'success':
        statusEl.classList.add('bg-green-50', 'border', 'border-green-200');
        circle.classList.add('bg-green-500');
        break;
      case 'error':
        statusEl.classList.add('bg-red-50', 'border', 'border-red-200');
        circle.classList.add('bg-red-500');
        break;
      case 'cancelled':
        statusEl.classList.add('bg-gray-50', 'border', 'border-gray-200');
        circle.classList.add('bg-gray-500');
        break;
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    statusEl.classList.remove('hidden');
  }

  function processSuccessfulPayment(orderData) {
    // Simular guardado en base de datos
    const bookingReference = generateBookingReference();
    const guestData = new FormData(guestForm);

    // Guardar datos de reserva (en producción, hacer POST a backend)
    const reservationData = {
      reference: bookingReference,
      paypalOrderId: orderData.id,
      guest: {
        firstName: guestData.get('firstName'),
        lastName: guestData.get('lastName'),
        email: guestData.get('email'),
        phone: guestData.get('phone'),
        comments: guestData.get('comments')
      },
      accommodation: bookingData.accommodation,
      dates: bookingData.dates,
      pricing: bookingData.pricing,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    console.log('Reservation saved:', reservationData);

    // Mostrar estado exitoso
    showPaymentStatus('success', '¡Pago completado!', 'Tu reserva ha sido confirmada correctamente.');

    // Actualizar modal con referencia real
    document.getElementById('booking-reference').textContent = bookingReference;

    // Mostrar modal de confirmación
    setTimeout(() => {
      confirmationModal.classList.remove('hidden');

      // Enviar email de confirmación (simulado)
      sendConfirmationEmail(reservationData);
    }, 1500);
  }

  function sendConfirmationEmail(reservationData) {
    // En producción, hacer POST a endpoint de email
    console.log('Sending confirmation email to:', reservationData.guest.email);

    // Simular envío
    const emailData = {
      to: reservationData.guest.email,
      template: 'booking-confirmation',
      data: reservationData
    };

    // Aquí haríamos: fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) })
    console.log('Email sent:', emailData);
  }

  function setupEventListeners() {
    // Pago alternativo (para testing/debugging)
    alternativePayBtn?.addEventListener('click', () => {
      if (!validateGuestForm()) return;

      showPaymentStatus('processing', 'Procesando pago alternativo...', 'Simulando transacción');

      setTimeout(() => {
        const mockOrderData = {
          id: 'MOCK_' + Date.now(),
          status: 'COMPLETED',
          payer: {
            email_address: new FormData(guestForm).get('email')
          }
        };
        processSuccessfulPayment(mockOrderData);
      }, 3000);
    });

    // WhatsApp desde modal
    contactWhatsApp?.addEventListener('click', () => {
      const bookingRef = document.getElementById('booking-reference').textContent;
      const message = `Hola! Mi reserva ${bookingRef} ha sido confirmada. ¿Pueden enviarme los detalles del check-in?`;
      window.open(waLink(message), '_blank');
    });

    // Cerrar modal al hacer clic fuera
    confirmationModal?.addEventListener('click', (e) => {
      if (e.target === confirmationModal) {
        confirmationModal.classList.add('hidden');
      }
    });

    // Auto-llenar datos para testing (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
      setTimeout(() => {
        document.querySelector('[name="firstName"]').value = 'Juan';
        document.querySelector('[name="lastName"]').value = 'Pérez';
        document.querySelector('[name="email"]').value = 'juan@example.com';
        document.querySelector('[name="phone"]').value = '+34 600 123 456';
      }, 1000);
    }
  }

  // Cargar variables de entorno desde script global si existen
  if (window.NETLIFY_ENV) {
    window.PAYPAL_CLIENT_ID = window.NETLIFY_ENV.PAYPAL_CLIENT_ID;
  }

})();