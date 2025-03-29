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

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Inicio</ion-title>
        </ion-toolbar>
      </ion-header>

      <template v-if="trips.length > 0">
        <ion-card v-for="trip in trips" :key="trip.trip_id" :button="true" to="/profile">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.school }}</ion-card-title>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Hora: {{ trip.time }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            Estado: {{ translateStatus(trip.status) }}
          </ion-card-content>
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

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="navigateToPage" class="custom-fab">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonAlert, IonFab, IonFabButton, IonIcon} from '@ionic/vue';
import { onMounted, ref } from "vue";
import { getTripsByUser, getUser } from "../services/api"; 
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';

interface Trip {
  trip_id: number;
  school: string;
  date: string;
  status: string;
  time: string;
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
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const tripResponse = await getTripsByUser(token);
      if (tripResponse && typeof tripResponse === "object" && "data" in tripResponse) {
        const tripData = tripResponse.data;
        trips.value = Array.isArray(tripData) ? tripData : (tripData ? [tripData] : []);
      } else {
        trips.value = [];
      }
    } catch (error) {
      console.error("Error cargando viajes", error);
      trips.value = [];
    }
  }
};

const loadUser = async () => { 
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const userResponse = await getUser(token) as { data: User };
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
