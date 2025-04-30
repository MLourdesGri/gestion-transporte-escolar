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