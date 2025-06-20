import axios from "axios";
import { useUserStore } from "@/store/user";

const API_URL = "https://gestion-transporte-escolar-be-production-e770.up.railway.app"; 

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

export const getTripChildByChildId = async (child_id: number) => {
  try {
    const response = await api.get(`/tripchild/${child_id}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo viaje hijo:", error);
    return null;
  }
}

export const getTripChildById = async (trip_child_id: number) => {
  try {
    const response = await api.get(`/tripchild/trip/${trip_child_id}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo viaje hijo:", error);
    return null;
  }
}

export const getTripChildByTripId = async (trip_id: number) => {
  try {
    const response = await api.get(`/tripchild/trips/${trip_id}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo los viajes:", error);
    return [];
  }
};

export const getTripChildByUserId = async (token: string) => {
  try {
    const response = await api.get("/tripchild", {
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

export const getPaymentsByDriver = async (token: string) => {
  try {
    const response = await api.get("/trips/price", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
}
export const getAllPayments = async () => {
  try {
    const response = await api.get("/trips/payments");
    return response.data;
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return [];
  }
}

export const markTripsAsPaid = async (userId: number, month:string, token: string) => {
  try {
    const response = await api.put(`/trips/pay`, { userId, month }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error marcando viajes como pagados:", error);
    return { error: "Error al marcar los viajes como pagados. Intenta nuevamente." };
  }
}

export const deleteTripChild = async (trip_child_id: number, token: string) => {
  try {
    const response = await api.delete(`/tripchild/${trip_child_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return { error: "Error al eliminar el viaje hijo. Intenta nuevamente." };
  }
};

export const getTripByUser = async (token: string) => {
  try {
    const response = await api.get("/trips", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo viajes:", error);
    return [];
  }
}

export const getTripsByDriver = async (token: string) => {
  try {
    const response = await api.get("/trips/driver", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo viajes del conductor:", error);
    return [];
  }
}

export const startTrip = async (tripId: number, token: string) => {
  try {
    const response = await api.post(`/trips/start/${tripId}`,{},  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return { error: "Error al iniciar el viaje. Intenta nuevamente." };
  }
}

export const finishTrip = async (tripId: number, token: string) => {
  try {
    const response = await api.post(`/trips/finish/${tripId}`,{},  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return { error: "Error al iniciar el viaje. Intenta nuevamente." };
  }
}

export const cancelTripById = async ( token: string, tripId: number, cancelReason: string) => {
  try {
    const response = await api.post(`/trips/cancel/${tripId}`, {cancelReason}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelando viaje:", error);
    return { error: "Error al cancelar el viaje. Intenta nuevamente." };
  }
}

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
    console.error("Error obteniendo habilitaciones:", error);
    return [];
  }
}

export const getAllTrips = async () => {
  try {
    const response = await api.get("/trips/all");
    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo viajes:", error);
    return [];
  }
}

export const getTripById = async (tripId: number, token: string) => {
  try {
    const response = await api.get(`/trips/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    return response.data;
  }
  catch (error) {
    console.error("Error obteniendo viajes:", error);
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
    console.log("Trip enviado al backend:", trip.value);
    const response = await api.post("/payment", trip.value, {
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

export const getPriceByUserAuthorization = async (token: string, id: number) => {
  try {
    const response = await api.get(`/price/authorization/${id}`, {
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

export const getNotificationsByUser = async (token: string) => {
  try {
    const response = await api.get("/notification", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    return [];
  }
}

export const markNotificationAsRead = async (notificationId: number, token: string) => {
  try {
    console.log("ID de la notificación:", notificationId);
    const response = await api.put(`/notification/${notificationId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error marcando notificación como leída:", error);
    return { error: "Error al marcar la notificación como leída. Intenta nuevamente." };
  }
}

export default api;
