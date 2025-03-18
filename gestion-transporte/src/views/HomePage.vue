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
        <ion-card v-for="trip in trips" :key="trip.trip_id" button="true" routerLink="/profile">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.school }}</ion-card-title>
            <ion-card-subtitle>Fecha: {{ trip.date }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            Estado: {{ trip.status }}
          </ion-card-content>
        </ion-card> 
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle} from '@ionic/vue';
import { ref, onMounted } from "vue";
import { getTrips } from "../services/api"; 
  const trips = ref<any[]>([]);
  
  const loadTrips = async () => {
  try {
    const response = await getTrips();
    if (response && response.data) {
      trips.value = response.data;  
    } else {
      console.error("No se encontraron viajes");
      trips.value = [];  
    }
  } catch (error) {
    console.error("Error cargando viajes", error);
    trips.value = []; 
  }
  };

  onMounted(() => {
    loadTrips();
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