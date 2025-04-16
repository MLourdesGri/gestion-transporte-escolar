import axios from "axios";
import { useUserStore } from "@/store/user";

const API_URL = "http://localhost:3000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface User {
  email: string;
  password?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  profile_picture?: string;
  role_id?: number;
  birth_date?: string;
}

const userStore = useUserStore();

export const getUser = async (token: string) => {
  try {
    const response = await api.get("/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
};

export const getTripsByUser = async (token: string) => {
  try {
    const response = await api.get("/trips", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    console.error("Error obteniendo los viajes:", error);
    return [];
  }
};

export const postUser = async (user: User) => {
  try {
    const response = await api.post<{ token: string, user:User, error:Error }>("/users/signup", user);
    const token = response.data.token;
    userStore.setToken(token);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message }; 
    }
    return { error: "Error desconocido. Inténtalo de nuevo." };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post<{ token: string, user:User, error:Error }>('/users/login', { email, password });
    const token = response.data.token;
    userStore.setToken(token);
    return response.data; 
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message };
    }
    return { error: 'Error desconocido. Inténtalo de nuevo.' };
  }
};

export const signUpGoogle = async (user: User) => {
  try {
    const response = await api.post<{ token: string, user:User, error:Error }>("/users/signup-google", user);
    const token = response.data.token;
    userStore.setToken(token);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message }; 
    }
    return { error: "Error desconocido. Inténtalo de nuevo." };
  }
}

export const putUser = async (user: Partial<User>, token: string) => {
  try {
    const response = await api.put<{ user: User; error?: Error }>("/users/update", user, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message };
    }
    return { error: "Error desconocido. Inténtalo de nuevo." };
  }
};

export const getAuthorizationByUser = async (token: string) => {
  try {
    const response = await api.get("/authorization", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    console.error("Error obteniendo vehículos:", error);
    return [];
  }
}

export const putAuthorization = async (authorization: any, id: number, token: string) => {
  try {
    const response = await api.put(`authorization/${id}`, authorization, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error actualizando vehículo:", error);
    return { error: "Error al actualizar el vehículo. Intenta nuevamente." };
  }
};

export const postAuthorization = async (authorization: any, token: string) => {
  try {
    const response = await api.post("/authorization", authorization, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (error) {
    console.error("Error creando vehículo:", error);
    return [];
  }
}

export const getAllAuthorizations = async () => {
  try {
    const response = await api.get("/authorization/all");
    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo vehículos:", error);
    return [];
  }
}

export const getChildAuthorizations = async (childId: number) => {
  try {
    const response = await api.get(`/authorization/child/${childId}`);
    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo vehículos:", error);
    return [];
  }
}

export const getAuthorizationById = async (id: number) => {
  try {
    const response = await api.get(`/authorization/${id}`);
    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo vehículos:", error);
    return [];
  }
}

export const sendPasswordReset = async (email: string) => {
  try {
    const response = await api.post<{ message: string; error?: Error }>("/users/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message };
    }
    return { error: "Error desconocido. Inténtalo de nuevo." };
  }
};

export const resetPassword = async (password: string, token: string) => {
  try {
    const response = await api.post<{ message: string; error?: Error }>(`/users/reset-password/${token}`, { password });
    return response.data;
  }
  catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message };
    }
    return { error: "Error desconocido. Inténtalo de nuevo." };
  }
};

export const getChildrenByUser = async (token: string) => {
  try {
    const response = await api.get("/child", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    console.error("Error obteniendo hijos:", error);
    return [];
  }
}

export const postChild = async (child: any, token: string) => {
  try {
    const response = await api.post("/child", child, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (error) {
    console.error("Error creando hijo:", error);
    return [];
  }
}

export const putChild = async (childId: number, child: any, token: string) => {
  try {
    const response = await api.put(`/child/${childId}`, child, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    return response.data;
  } catch (error: any) {
    return { error: "Error al actualizar el hijo. Intenta nuevamente." };
  }
}

export const deleteChild = async (childId: number, token: string) => {
  try {
    const response = await api.delete(`/child/${childId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return { error: "Error al eliminar el hijo. Intenta nuevamente." };
  }
};

export const postTrip = async (trip: any, token: string) => {
  try {
    const response = await api.post("/trips", trip, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creando viaje:", error);
    return { error: "Error al crear el viaje. Intenta nuevamente." };
  }
}

export const createPayment = async (token: string, trip: any) => {
  try {
    const response = await api.post("/payment", trip, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creando pago:", error);
    return { error: "Error al crear el pago. Intenta nuevamente." };
  }
}

export const getPricesByUser = async (token: string) => {
  try {
    const response = await api.get("/price", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    console.error("Error obteniendo precios:", error);
    return [];
  }
}

export const postPrice = async (authorization: any, token: string) => {
  try {
    const response = await api.post("/price", authorization, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (error) {
    console.error("Error creando vehículo:", error);
    return [];
  }
}

export default api;
