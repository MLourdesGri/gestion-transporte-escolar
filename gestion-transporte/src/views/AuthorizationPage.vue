<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Mis habilitaciones</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mis habilitaciones</ion-title>
        </ion-toolbar>
      </ion-header>

      <template v-if="authorizations.length == 0">
        <div v-if="userStore.user?.role_id == 2">
          <div class="no-authorization">
            <p>Aún no has registrado ninguna habilitación de chofer y vehículo.</p>
          </div>
          <CustomButton class="new-hab" @click="navigateToAddAuthorization">Nueva habilitación</CustomButton>
        </div>
        <div v-else>
          <div class="no-authorization">
            <p>No hay habilitaciones para administrar.</p>
          </div>
        </div>
      </template>

      <template v-else>
        <ion-card v-for="authorization in authorizations" :key="authorization.authorization_id" :button="true" @click="authorizationDetail(authorization.authorization_id)"
        :class="getCardClass(authorization.state)"
        >
          <ion-card-header>
            <ion-card-title>{{ authorization.vehicle_make }} {{ authorization.vehicle_model }}</ion-card-title>
            <ion-card-subtitle>Año: {{ authorization.vehicle_year }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Patente:</strong> {{ authorization.vehicle_license_plate }}</p>
            <p><strong>Capacidad:</strong> {{ authorization.vehicle_capacity }} pasajeros</p>
            <p><strong>Vehículo habilitado hasta:</strong> {{ authorization.due_date_vehicle }}</p>
            <p><strong>Chofer habilitado hasta:</strong> {{ authorization.due_date_driver }}</p>
          </ion-card-content>
        </ion-card>

      </template>
    </ion-content>

  </ion-page>
</template>


<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle, IonCardTitle} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAllAuthorizations, getUser } from "@/services/api";
import { getAuthorizationByUser } from "@/services/api";
import CustomButton from "@/components/CustomButton.vue";
import { useUserStore } from "@/store/user";

interface User {
  full_name: string;
  role_id: number;
}

const userStore = useUserStore();

const loadUser = async () => { 
  const token = userStore.token;
  if (token) {
    try {
      const userResponse = await getUser(token) as { data: User };
      userStore.setUser(userResponse.data);
    }
    catch (error) {
      console.error("Error cargando usuario", error);
      userStore.setUser(null);
    }
  } 
}

interface Authorization {
  authorization_id: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  vehicle_capacity: number;
  due_date_vehicle: string;
  due_date_driver: string;
  state: number;
}

const router = useRouter();
const authorizations = ref<Authorization[]>([]);
  
const loadAuthorizations = async () => {
  const token = userStore.token;
  if (token) {
    try {
      let authorizationResponse;

      if (userStore.user?.role_id === 2) {
        authorizationResponse = await getAuthorizationByUser(token);
      } else {
        authorizationResponse = await getAllAuthorizations();
      }
      
      if (authorizationResponse && typeof authorizationResponse === "object" && "data" in authorizationResponse) {
        const authorizationData = authorizationResponse.data;
        authorizations.value = Array.isArray(authorizationData) ? authorizationData : (authorizationData ? [authorizationData] : []);
      } else {
        authorizations.value = [];
      }
    } catch (error) {
      console.error("Error cargando alumnos", error);
      authorizations.value = [];
    }
  }
};

const authorizationDetail = (authorizationId: number) => {
  router.push(`/authorization/${authorizationId}`);
};

onMounted( () => {
  loadUser();
  loadAuthorizations();
});

const getCardClass = (state: number) => {
  switch (state) {
    case 2:
      return 'card-green';
    case 3:
      return 'card-red';
    default:
      return 'card-gray';
  }
};

const navigateToAddAuthorization = () => {
  router.push("/authorization/new-authorization");
};
</script>

<style scoped>
.no-authorization {
  text-align: center;
  padding: 20px;
  color: gray;
}

.authorization-content {
  padding-top: 10px;
}

.new-hab {
  bottom: 10px;
  position: absolute;
  left: 0;
  right: 0;
  margin-left: 20px;
  margin-right: 20px;
}

.card-gray {
  --background: #f4f4f4;
}

.card-green {
  --background: #07912791;
}

.card-red {
  --background: #58050c;
}

</style>
