import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

export const isValidEmail = (email: string): boolean => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };
  
export const isValidPassword = (password: string): boolean => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
  }

export function redirectIfNoToken() {
    const userStore = useUserStore();
    const router = useRouter();
  
    if (!userStore.token) {
      router.push('/login');
      return true;
    }
  
    return false;
  }

  export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    date.setTime(date.getTime() +  + (3 * 60 * 60 * 1000));
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires',
    };
    return new Intl.DateTimeFormat('es-AR', options).format(date).replace(',', '');
  };

  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    date.setTime(date.getTime() +  + (3 * 60 * 60 * 1000));
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  export const formatShift = (shift : string): string => {
    switch (shift) {
      case "1":
        return "Mañana";
      case "2":
        return 'Tarde';
      default:
        return 'Desconocido';
    }
  }

  export const formatAuthorizationState = (state: number): string => {
    switch (state) {
      case 1:
        return "Pendiente";
      case 2:
        return 'Aprobado';
      default:
        return 'Rechazado';
    }
  }

  export function formatMonthName(dateStr: string): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const [year, month] = dateStr.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    throw new Error("Fecha inválida");
  }

  return `${months[month - 1]} ${year}`;
  }

  export function formatTripStatus(status: string): string {
    switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    case 'in progress':
      return 'En Progreso';
    default:
      return 'Desconocido';
  }
  }

  export const holidaysArgentina = [
  // Feriados 2025
  "2025-01-01", // Año Nuevo
  "2025-03-03", // Carnaval
  "2025-03-04", // Carnaval
  "2025-03-24", // Día Nacional de la Memoria por la Verdad y la Justicia
  "2025-04-18", // Viernes Santo
  "2025-05-01", // Día del Trabajador
  "2025-05-25", // Día de la Revolución de Mayo
  "2025-06-16", // Día del Paso a la Inmortalidad del Gral. Güemes (lunes por traslado)
  "2025-06-20", // Día del Paso a la Inmortalidad del Gral. Belgrano
  "2025-07-09", // Día de la Independencia
  "2025-08-18", // Día del Paso a la Inmortalidad del Gral. San Martín (lunes por traslado)
  "2025-10-13", // Día del Respeto a la Diversidad Cultural (lunes por traslado)
  "2025-11-20", // Día de la Soberanía Nacional
  "2025-12-08", // Inmaculada Concepción de María
  "2025-12-25", // Navidad

  // Vacaciones de Invierno 2025 (7 al 18 de julio)
  "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10", "2025-07-11",
  "2025-07-14", "2025-07-15", "2025-07-16", "2025-07-17", "2025-07-18",

  // Feriados 2026 (ejemplo, ajustar según calendario oficial)
  "2026-01-01", // Año Nuevo
  "2026-02-16", // Carnaval
  "2026-02-17", // Carnaval
  "2026-03-24", // Día Nacional de la Memoria por la Verdad y la Justicia
  "2026-04-03", // Viernes Santo
  "2026-05-01", // Día del Trabajador
  "2026-05-25", // Día de la Revolución de Mayo
  "2026-06-15", // Día del Paso a la Inmortalidad del Gral. Güemes (lunes por traslado)
  "2026-06-20", // Día del Paso a la Inmortalidad del Gral. Belgrano
  "2026-07-09", // Día de la Independencia
  "2026-08-17", // Día del Paso a la Inmortalidad del Gral. San Martín (lunes por traslado)
  "2026-10-12", // Día del Respeto a la Diversidad Cultural (lunes por traslado)
  "2026-11-20", // Día de la Soberanía Nacional
  "2026-12-08", // Inmaculada Concepción de María
  "2026-12-25", // Navidad

  // Vacaciones de Invierno 2026 (Fechas de ejemplo, ajustar según calendario oficial)
  "2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09", "2026-07-10",
  "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17",
];