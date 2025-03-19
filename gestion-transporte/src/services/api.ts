import axios from "axios";

const API_URL = "http://localhost:3000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface User {
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  profile_picture?: string;
}

export const getUser = async (token: string) => {
  try {
    const response = await api.get("/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("response", response.data);
    return response.data;  
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
};

export const getTrips = async () => {
  try {
    const response = await api.get("/trips");
    return response.data; 
  } catch (error) {
    console.error("Error obteniendo viajes:", error);
    return [];
  }

};

export const postUser = async (user: User) => {
  try {
    const response = await api.post<{ token: string, user:User, error:Error }>("/users/signup", user);
    const token = response.data.token;
    localStorage.setItem('token',token);
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
    localStorage.setItem('token', token); 
    return response.data; 
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error.message };
    }
    return { error: 'Error desconocido. Inténtalo de nuevo.' };
  }
};

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

export default api;
