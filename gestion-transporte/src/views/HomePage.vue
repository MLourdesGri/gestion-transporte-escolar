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
      <template v-if="trips.length > 0">
        <ion-card v-for="trip in trips" :key="trip.trip_id" :button="true" @click="getMapTrip(trip.trip_id)">
          <ion-card-header>
            <ion-card-title>Transporte {{ trip.school }} </ion-card-title>
            <ion-card-subtitle>Alumno: {{ trip.name }} {{ trip.last_name }}</ion-card-subtitle>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Turno: {{ trip.school_shift }}</ion-card-subtitle>
            <ion-card-subtitle>Estado: {{ translateStatus(trip.status) }}</ion-card-subtitle>
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
import { onMounted, ref } from "vue";
import {  getTripChildByUserId, getUser } from "../services/api"; 
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

interface Trip_Child {
  trip_child_id: number;
  trip_id: Trip;
  child_id: Child;
}

interface Trip{
    trip_id: number;
    date: string;
    time: string;
    status: string;
    school: string;
    school_shift: string;
  }

interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school: string;
    school_shift: string;
  }

  interface TripAndChildren{
    trip_id: number;
    date: string;
    status: string;
    child_id: number;
    name: string;
    last_name: string;
    school: string;
    school_shift: string;
  }

interface User {
  full_name: string;
  role_id: number;
  is_confirmed: boolean; 
}

const showAlert = ref(false); 
const trips = ref<TripAndChildren[]>([]);

const userStore = useUserStore();

const loadTrips = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    trips.value = []; // Limpiar lista antes de cargar

    const tripChildResponse = await getTripChildByUserId(token) as { data: Trip_Child[] };
    const tripChildData = tripChildResponse.data ?? [];

    const tripChildArray = Array.isArray(tripChildData)
      ? tripChildData
      : [tripChildData];
    for (const tripChild of tripChildArray) {
        trips.value.push({
          trip_id: tripChild.trip_id.trip_id,
          date: tripChild.trip_id.date,
          status: tripChild.trip_id.status,
          child_id: tripChild.child_id.child_id,
          name: tripChild.child_id.name,
          last_name: tripChild.child_id.last_name,
          school: tripChild.child_id.school,
          school_shift: tripChild.child_id.school_shift
        });
      }
    }
 catch (error) {
    console.error("Error cargando viajes", error);
    trips.value = [];
  }
};

const loadUser = async () => { 
  const token = userStore.token;
  if (token) {
    try {
      const userResponse = await getUser(token) as { data: User };
      userStore.setUser(userResponse.data);

      if (userResponse.data && !userResponse.data.is_confirmed) {
        showAlert.value = true; 
      }
    } catch (error) {
      console.error("Error cargando usuario", error);
      userStore.setUser(null);
    }
  }
};

onMounted(() => {
  loadTrips();
  loadUser();
});

const formatDate = (dateString: string) => {
  if (!dateString) return "Fecha desconocida";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

const router = useRouter();
const navigateToPage = () => {
  router.push("/home/new-trip"); 
};

const getMapTrip = (tripId: number) => {
  router.push(`/home/map/${tripId}`); 
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
