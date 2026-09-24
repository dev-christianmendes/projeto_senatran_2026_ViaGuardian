// Modo demo: quando VITE_DEMO_MODE=true, os services retornam
// os mocks instantaneamente sem tentar conexão HTTP com o backend.
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'