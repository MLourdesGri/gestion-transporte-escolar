<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Inicio</ion-title>
        </ion-toolbar>
      </ion-header>
        <ion-card v-for="trip in trips" :key="trip.trip_id" :button="true" to="/profile">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.school }}</ion-card-title>
            <ion-card-subtitle>Fecha: {{ trip.date }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            Estado: {{ trip.status }}
          </ion-card-content>
        </ion-card> 
        <ion-alert
        v-if="showAlert"
        :is-open="showAlert"
        header="Cuenta no confirmada"
        message="Revise su casilla de correo y confirme su cuenta para continuar usando la aplicación."
        overlay
        backdrop-dismiss="false"
        ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonAlert} from '@ionic/vue';
import { onMounted, ref } from "vue";
import { getTrips, getUser } from "../services/api"; 

interface Trip {
  trip_id: number;
  school: string;
  date: string;
  status: string;
}

interface User {
  full_name: string;
  role_id: number;
  is_confirmed: boolean; 
}

  const trips = ref<Trip[]>([]);
  const user = ref<User | null>(null);
  const role_id = ref<number | null>(null);
  const showAlert = ref(false); 
  
const loadTrips = async () => {
  try {
    const response = await getTrips();
    if (response && response.data) {
      return trips.value = response.data;  
    } else {
      console.error("No se encontraron viajes");
      trips.value = [];  
    }
  } catch (error) {
    console.error("Error cargando viajes", error);
    trips.value = []; 
  }
  };


const loadUser = async () => { 
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const userResponse = await getUser(token);
      user.value = userResponse.data;
      role_id.value = userResponse.data.role_id;

      if (user.value && !user.value.is_confirmed) {
        showAlert.value = true; 
      }
    } catch (error) {
      console.error("Error cargando usuario", error);
      user.value = null;
      role_id.value = null;
    }
    }
}

  onMounted(() => {
    loadTrips();
    loadUser();
  });
</script>


<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>  