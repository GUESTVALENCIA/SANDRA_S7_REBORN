/**
 * CONFIGURACIONES MÚLTIPLES DE AVATARES - SANDRA IA 7.0
 * CEO: Clayton Thomas - ClayTom Systems Corporation
 * Basado en documentación oficial HeyGen SDK v2.1.0
 */

// ====================================================================
// AVATARES PRINCIPALES DISPONIBLES
// ====================================================================

export const AVAILABLE_AVATARS = {
  // 1. AVATAR TERAPÉUTICO - Para conversaciones de apoyo
  therapist: {
    id: "Ann_Therapist_public",
    name: "Sandra Terapéutica",
    type: "therapeutic",
    description: "Avatar especializado en conversaciones de apoyo emocional",
    optimizations: {
      quality: "high", // 2000kbps, 720p
      voice: {
        emotion: "soothing",
        rate: 0.9, // Más pausado para terapia
        language: "es"
      },
      session: {
        activity_idle_timeout: 300, // 5 minutos para conversaciones profundas
        enable_keepalive: true
      }
    },
    useCase: "Conversaciones de apoyo, terapia, acompañamiento emocional"
  },

  // 2. AVATAR MASCULINO TERAPÉUTICO
  therapist_male: {
    id: "Shawn_Therapist_public",
    name: "Sandra Masculina Terapéutica",
    type: "therapeutic_male",
    description: "Avatar masculino para diversidad en terapia",
    optimizations: {
      quality: "high",
      voice: {
        emotion: "serious",
        rate: 0.85,
        language: "es"
      },
      session: {
        activity_idle_timeout: 300,
        enable_keepalive: true
      }
    },
    useCase: "Terapia con perspectiva masculina, coaching ejecutivo"
  },

  // 3. AVATAR FITNESS - Para motivación y entrenamiento
  fitness: {
    id: "Bryan_FitnessCoach_public",
    name: "Sandra Fitness Coach",
    type: "fitness",
    description: "Avatar energético para coaching fitness",
    optimizations: {
      quality: "high",
      voice: {
        emotion: "excited",
        rate: 1.1, // Más dinámico para fitness
        language: "es"
      },
      session: {
        activity_idle_timeout: 120, // 2 minutos para mantener energía
        enable_keepalive: true
      }
    },
    useCase: "Entrenamiento personal, motivación fitness, rutinas deportivas"
  },

  // 4. AVATAR MÉDICO - Para consultas de salud
  doctor: {
    id: "Dexter_Doctor_Standing2_public",
    name: "Sandra Doctora",
    type: "medical",
    description: "Avatar profesional para consultas médicas",
    optimizations: {
      quality: "high",
      voice: {
        emotion: "serious",
        rate: 0.95, // Profesional pero accesible
        language: "es"
      },
      session: {
        activity_idle_timeout: 240, // 4 minutos para consultas
        enable_keepalive: true
      }
    },
    useCase: "Consultas médicas, información de salud, diagnósticos preliminares"
  },

  // 5. AVATAR TECH - Para soporte técnico
  tech: {
    id: "Elenora_IT_Sitting_public",
    name: "Sandra Tech Expert",
    type: "technology",
    description: "Avatar especializada en soporte técnico",
    optimizations: {
      quality: "high",
      voice: {
        emotion: "friendly",
        rate: 1.0, // Normal para explicaciones técnicas
        language: "es"
      },
      session: {
        activity_idle_timeout: 180, // 3 minutos para soporte
        enable_keepalive: true
      }
    },
    useCase: "Soporte técnico, tutoriales, resolución de problemas IT"
  }
};

// ====================================================================
// CONFIGURACIONES DE CALIDAD ADAPTATIVAS
// ====================================================================

export const QUALITY_CONFIGS = {
  // Para dispositivos de alta gama / conexión excelente
  ultra: {
    quality: "high",
    bitrate: 2000,
    resolution: "720p",
    fps: 30,
    audio_quality: "high"
  },

  // Para dispositivos medios / conexión buena
  standard: {
    quality: "medium",
    bitrate: 1000,
    resolution: "480p",
    fps: 24,
    audio_quality: "medium"
  },

  // Para dispositivos básicos / conexión limitada
  eco: {
    quality: "low",
    bitrate: 500,
    resolution: "360p",
    fps: 20,
    audio_quality: "standard"
  }
};

// ====================================================================
// CONFIGURACIONES DE RED Y FIREWALL
// ====================================================================

export const NETWORK_CONFIG = {
  required_hosts: [
    "*.livekit.cloud", // TCP 443 - Secure signaling via WebSocket
    "*.turn.livekit.cloud", // TCP 443 - TURN over TLS fallback
    "*.host.livekit.cloud", // UDP 3478 - TURN/UDP peer connections
    "api.heygen.com" // TCP 443 - Avatar API and signaling
  ],

  optimal_ports: {
    webrtc_media: "50000-60000/UDP", // WebRTC media traffic
    fallback_tcp: "7881/TCP" // WebRTC fallback
  },

  performance_tips: [
    "Prefer UDP for low-latency performance",
    "Avoid symmetric NAT if possible",
    "Enable UDP hole-punching",
    "Use connection testing: https://livekit.io/connection-test"
  ]
};

// ====================================================================
// CONFIGURACIONES DE SESIÓN OPTIMIZADAS
// ====================================================================

export const SESSION_CONFIGS = {
  // Configuración para conversaciones largas (terapia, coaching)
  extended: {
    activity_idle_timeout: 300, // 5 minutos
    max_session_duration: 3600, // 1 hora
    keepalive_interval: 60, // cada minuto
    reconnect_attempts: 5
  },

  // Configuración para interacciones rápidas (soporte, consultas)
  standard: {
    activity_idle_timeout: 120, // 2 minutos
    max_session_duration: 1800, // 30 minutos
    keepalive_interval: 30, // cada 30 segundos
    reconnect_attempts: 3
  },

  // Configuración para demos y pruebas
  demo: {
    activity_idle_timeout: 60, // 1 minuto
    max_session_duration: 600, // 10 minutos
    keepalive_interval: 20, // cada 20 segundos
    reconnect_attempts: 2
  }
};

// ====================================================================
// CONFIGURACIONES DE IDIOMAS SOPORTADOS
// ====================================================================

export const SUPPORTED_LANGUAGES = {
  "es": { label: "Español", value: "es", key: "es" },
  "en": { label: "English", value: "en", key: "en" },
  "fr": { label: "Français", value: "fr", key: "fr" },
  "de": { label: "Deutsch", value: "de", key: "de" },
  "it": { label: "Italiano", value: "it", key: "it" },
  "pt": { label: "Português", value: "pt", key: "pt" },
  "ca": { label: "Català", value: "ca", key: "ca" }
};

// ====================================================================
// CONFIGURACIONES DE AUTOMATIZACIÓN ZAPIER
// ====================================================================

export const ZAPIER_CONFIG = {
  triggers: {
    new_spreadsheet_row: "Crear video cuando se añade fila en Google Sheets",
    webhook: "Crear video vía webhook personalizado",
    scheduled: "Crear videos programados"
  },

  video_params: {
    test_mode: false, // Producción
    captions: true, // Subtítulos habilitados
    dimensions: "1920x1080", // Full HD
    callback_webhook: "https://sandra-s7-reborn.netlify.app/.netlify/functions/zapier-callback"
  }
};

// ====================================================================
// CONFIGURACIONES ESPECÍFICAS PARA iOS (SANDRA MOBILE)
// ====================================================================

export const IOS_CONFIG = {
  sdk_reference: "https://github.com/HeyGen-Official/interactive-avatar-swiftui",
  optimizations: {
    // Optimizaciones específicas para dispositivos iOS
    quality: "medium", // Balanceado para batería móvil
    frame_rate: 24, // Optimizado para móviles
    audio: {
      sample_rate: 44100,
      channels: 1, // Mono para ahorrar ancho de banda
      bitrate: 128 // kbps
    },
    memory_management: {
      max_cache_size: "50MB",
      cleanup_interval: 30, // segundos
      background_cleanup: true
    }
  }
};

// ====================================================================
// FUNCIÓN HELPER PARA SELECCIONAR CONFIGURACIÓN ÓPTIMA
// ====================================================================

export function getOptimalConfig(avatarType, deviceType = 'desktop', connectionQuality = 'good') {
  const avatar = AVAILABLE_AVATARS[avatarType] || AVAILABLE_AVATARS.tech;

  let quality;
  switch (connectionQuality) {
    case 'excellent':
      quality = QUALITY_CONFIGS.ultra;
      break;
    case 'poor':
      quality = QUALITY_CONFIGS.eco;
      break;
    default:
      quality = QUALITY_CONFIGS.standard;
  }

  let session;
  if (avatarType === 'therapist' || avatarType === 'therapist_male') {
    session = SESSION_CONFIGS.extended;
  } else if (avatarType === 'fitness') {
    session = SESSION_CONFIGS.standard;
  } else {
    session = SESSION_CONFIGS.standard;
  }

  return {
    avatar,
    quality,
    session,
    network: NETWORK_CONFIG,
    language: SUPPORTED_LANGUAGES.es
  };
}

// ====================================================================
// CONFIGURACIONES DE DESARROLLO Y PRODUCCIÓN
// ====================================================================

export const ENVIRONMENT_CONFIGS = {
  development: {
    debug: true,
    log_level: "verbose",
    session_config: SESSION_CONFIGS.demo,
    quality_config: QUALITY_CONFIGS.standard
  },

  production: {
    debug: false,
    log_level: "error",
    session_config: SESSION_CONFIGS.standard,
    quality_config: QUALITY_CONFIGS.ultra
  }
};

/**
 * RESUMEN EJECUTIVO:
 *
 * ✅ 5 Avatares configurados con optimizaciones específicas
 * ✅ 3 Niveles de calidad adaptativos (Ultra/Standard/Eco)
 * ✅ Configuraciones de red y firewall optimizadas
 * ✅ Sesiones configuradas por tipo de uso
 * ✅ Soporte multi-idioma
 * ✅ Integración Zapier para automatización
 * ✅ Configuraciones específicas para iOS
 * ✅ Función helper para selección automática
 * ✅ Configuraciones de desarrollo y producción
 *
 * CEO: Esta configuración permite máxima flexibilidad y rendimiento
 * optimizado para cada caso de uso específico de Sandra IA 7.0
 */