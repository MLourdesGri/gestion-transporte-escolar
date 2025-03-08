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
    return response.data;  // Devuelve solo los usuarios dentro de 'data'
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
};

export const getTrips = async () => {
  try {
    const response = await api.get("/trips");
    return response.data;  // Devuelve solo los usuarios dentro de 'data'
  } catch (error) {
    console.error("Error obteniendo viajes:", error);
    return [];
  }

};

export const postUser = async (user: User) => {
  try {
    const response = await api.post("/users", user);
    return response.data;
  } catch (error: any) {
    console.error("Error registrando usuario:", error);

    if (error.response && error.response.data) {
      return { error: error.response.data.message }; 
    }

    return { error: "Error desconocido. Inténtalo de nuevo." };
  }
};



export default api;
