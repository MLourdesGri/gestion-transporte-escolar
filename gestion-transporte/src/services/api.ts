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
}


export const getUsers = async () => {
  try {
    const response = await api.get("/users");
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
    const response = await api.post("/users/signup", user);
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
    const response = await api.post<{ token: string }>('/users/login', { email, password });
    const token = response.data.token;
        
    localStorage.setItem('token', token); // Guardar token
        
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar token
    localStorage.setItem('user_role', payload.role); // Guardar rol
    
    return response.data; 
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: error.response.data.error };
    }
    return { error: 'Error desconocido. Inténtalo de nuevo.' };
  }
};



export default api;
