<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <template v-if="tripandchildren.length > 0 && userStore.user?.role_id === 1">
        <ion-card v-for="trip in upcomingTripChildren" :key="trip.trip_child_id" :button="true" @click="getTripChildDetails(trip.trip_child_id)">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.school_name }} </ion-card-title>
            <ion-card-subtitle>Alumno: {{ trip.name }} {{ trip.last_name }}</ion-card-subtitle>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Turno: {{ formatShift(trip.school_shift) }}</ion-card-subtitle>
            <ion-card-subtitle>Estado: {{ formatTripStatus(trip.status) }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else-if="trips.length > 0 && userStore.user?.role_id === 2">
        <ion-card v-for="trip in upcomingTrips" :key="trip.trip_id" :button="true" @click="getTripDetails(trip.trip_id)">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.authorization.school_name}} </ion-card-title>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Turno: {{ formatShift(trip.authorization.work_shift) }}</ion-card-subtitle>
            <ion-card-subtitle>Estado del viaje: {{ formatTripStatus(trip.status) }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else>
        <div class="no-trips">
          <p>No tienes viajes registrados.</p>
        </div>
      </template>

      <ion-alert
        v-if="showAlert"
        :is-open="showAlert"
        header="Cuenta no confirmada"
        message="Revise su casilla de correo y confirme su cuenta para continuar usando la aplicación."
        backdrop-dismiss="false"
      />

      <ion-alert
        v-if="alertAddress"
        :is-open="alertAddress"
        header="No tienes una dirección guardada"
        message="Por favor, dirígete a la sección de 'Perfil' para agregar una dirección."
        backdrop-dismiss="true"
        @didDismiss="() => alertAddress = false"
      />

      <ion-fab slot="fixed" vertical="bottom" horizontal="end" v-if="userStore.user?.role_id === 1">
        <ion-fab-button @click="navigateToPage" class="custom-fab">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonAlert, IonFab, IonFabButton, IonIcon} from '@ionic/vue';
import { onMounted, ref, computed } from "vue";
import {  getTripByUser, getTripChildByUserId } from "../services/api"; 
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { formatDate, formatShift, formatTripStatus, redirectIfNoToken } from '@/utils/utils';

interface Trip_Child {
  trip_child_id: number;
  trip: Trip;
  child: Child;
}

interface Trip{
    trip_id: number;
    date: string;
    status: string;
    authorization: Authorization;
  }

interface Authorization{
  authorization_id: number;
  school_name:string;
  school_address: string;
  work_shift: string;
  state: number;
  user_id: number;
}

interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school_name: string;
    school_address: string;
    school_shift: string;
  }

  interface TripAndChildren{
    trip_child_id: number;
    trip_id: number;
    date: string;
    status: string;
    child_id: number;
    name: string;
    last_name: string;
    school_name: string;
    school_address: string;
    school_shift: string;
  }


const showAlert = ref(false);
const alertAddress = ref(false);
const tripandchildren = ref<TripAndChildren[]>([]);
const trips = ref<Trip[]>([]);
const userStore = useUserStore();

const loadTripAndChildren = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    tripandchildren.value = [];

    const tripChildResponse = await getTripChildByUserId(token) as { data: Trip_Child[] };
    const tripChildData = tripChildResponse.data ?? [];

    const tripChildArray = Array.isArray(tripChildData)
      ? tripChildData
      : [tripChildData];
    const seenTripChildIds = new Set();
    for (const tripChild of tripChildArray) {
      if (!seenTripChildIds.has(tripChild.trip_child_id)) {
        seenTripChildIds.add(tripChild.trip_child_id);
        tripandchildren.value.push({
          trip_child_id: tripChild.trip_child_id,
          trip_id: tripChild.trip.trip_id,
          date: tripChild.trip.date,
          status: tripChild.trip.status,
          child_id: tripChild.child.child_id,
          name: tripChild.child.name,
          last_name: tripChild.child.last_name,
          school_name: tripChild.child.school_name,
          school_address: tripChild.child.school_address,
          school_shift: tripChild.child.school_shift
        });}
    }
  } catch (error) {
    console.error("Error cargando viajes", error);
    tripandchildren.value = [];
  }
};

const loadTrips = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    trips.value = []; // Limpiar lista antes de cargar

    const tripResponse = await getTripByUser(token) as { data: Trip[] };
    const tripData = tripResponse.data ?? [];

    const tripArray = Array.isArray(tripData)
      ? tripData
      : [tripData];
    for (const trip of tripArray) {
        trips.value.push({
          trip_id: trip.trip_id,
          date: trip.date,
          status: trip.status,
          authorization: trip.authorization,
        });
      }
    }
 catch (error) {
    console.error("Error cargando viajes", error);
    trips.value = [];
  }
};

const upcomingTripChildren = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return tripandchildren.value
    .filter((trip) => trip.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);
});

const upcomingTrips = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return trips.value
    .filter((trip) => trip.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);
});

onMounted(() => {
  if (redirectIfNoToken()) return;
  if (userStore.user && userStore.user.role_id === 1) {
    loadTripAndChildren();
  } else if (userStore.user && userStore.user.role_id === 2) {
    loadTrips();
  }
});

const router = useRouter();

const navigateToPage = () => {
  if (!userStore.user?.address) {
    alertAddress.value = true;
    return;
  }
  router.push("/home/new-trip"); 
};

const getTripChildDetails = (trip_child_id: number) => {
  router.push(`home/childtrip/${trip_child_id}`); 
};

const getTripDetails = (trip_id: number) => {
  router.push(`home/trip/${trip_id}`); 
};
</script>

<style scoped>
.no-trips {
  text-align: center;
  padding: 20px;
  color: gray;
  font-size: 18px;
}
.custom-fab {
  --background: #003366;
  --background-hover: #002244;
  --color: white; /* Color del icono */
}
.custom-menu {
  --color: #003366; /* Color del icono */
}
</style>
