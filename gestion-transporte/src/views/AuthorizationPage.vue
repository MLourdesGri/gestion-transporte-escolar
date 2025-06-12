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

    <ion-content class="ion-padding">

      <template v-if="isLoading">
        <LoadingSpinner />
      </template>

      <template v-else-if="authorizations.length == 0">
        <div v-if="userStore.user?.role_id == 2">
          <div class="no-authorization">
            <p>Aún no has registrado ninguna habilitación de chofer y vehículo.</p>
          </div>
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
            <p><strong>Vehículo habilitado hasta:</strong> {{ formatDate (authorization.due_date_vehicle) }}</p>
            <p><strong>Chofer habilitado hasta:</strong> {{ formatDate(authorization.due_date_driver) }}</p>
          </ion-card-content>
        </ion-card>
      </template>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end" v-if="showNewAuthorizationButton">
        <ion-fab-button @click="navigateToAddAuthorization()" class="custom-fab">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

       <ion-alert
        v-if="alertProfileData"
        :is-open="alertProfileData"
        header="Atención"
        message="Debe completar sus datos de perfil antes de registrar una nueva habilitación."
        backdrop-dismiss="true"
        @didDismiss="() => alertProfileData = false"
      />
    </ion-content>

  </ion-page>
</template>


<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle, IonCardTitle, IonIcon, IonFab, IonFabButton, IonAlert } from "@ionic/vue";
import { ref, onMounted } from "vue";
import { add } from "ionicons/icons";
import { useRouter } from "vue-router";
import { getAllAuthorizations, getUser } from "@/services/api";
import { getAuthorizationByUser } from "@/services/api";
import { useUserStore } from "@/store/user";
import { formatDate, redirectIfNoToken } from "@/utils/utils";
import { computed } from 'vue';
import LoadingSpinner from "@/components/LoadingSpinner.vue";

interface User {
  full_name: string;
  role_id: number;
}

const userStore = useUserStore();

const isLoading = ref(true);

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
  updated_at: string;
  state: number;
}

const alertProfileData = ref(false);
const router = useRouter();
const authorizations = ref<Authorization[]>([]);
  
const loadAuthorizations = async () => {
  isLoading.value = true;
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
        authorizations.value.sort((a, b) => {
          const dateA = new Date(a.updated_at); 
          const dateB = new Date(b.updated_at);
          return dateB.getTime() - dateA.getTime(); 
        });
      } else {
        authorizations.value = [];
      }
    } catch (error) {
      console.error("Error cargando alumnos", error);
      authorizations.value = [];
    }
  }
  isLoading.value = false;
};

const showNewAuthorizationButton = computed(() => {
  // Solo para usuarios con rol chofer
  if (userStore.user?.role_id !== 2) return false;

  // Si no hay autorizaciones, mostrar botón
  if (authorizations.value.length === 0) return true;

  // Ordenamos las autorizaciones por fecha de actualización descendente
  const sorted = [...authorizations.value].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const latest = sorted[0];
  if (!latest) return true;

  const now = new Date();
  const dueDateDriver = new Date(latest.due_date_driver);

  // Si fue rechazada
  if (latest.state === 3) return true;

  // Si está vencida
  if (dueDateDriver.getTime() < now.getTime()) return true;

  // Si faltan 15 días o menos
  const diffInDays = (dueDateDriver.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffInDays <= 15) return true;

  return false;
});



const authorizationDetail = (authorizationId: number) => {
  router.push(`/authorization/${authorizationId}`);
};

onMounted( () => {
  if (redirectIfNoToken()) return;
  loadUser();
  loadAuthorizations();
});

const getCardClass = (state: number) => {
  switch (state) {
    case 2:
      return 'card-green';
    case 3:
      return 'card-red';
    case 4:
      return 'card-blue';
    default:
      return 'card-gray';
  }
};

const navigateToAddAuthorization = async () => {
  if (userStore.token) {
    const actualUser = await getUser(userStore.token) as any;
    if (
      !actualUser.data.full_name ||
      !actualUser.data.phone_number ||
      !actualUser.data.address ||
      !actualUser.data.dni
    ) {
      alertProfileData.value = true;
      return;
    }
  }

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
  left: 0;
  right: 0;
  margin-left: 20px;
  margin-right: 20px;
}

.card-gray {
  --background: #f4f4f4;
}

.card-green {
  --background: #bfffbf; /* verde pastel */
  color: #333; /* texto oscuro/gris */
}

.card-red {
  --background: #ffb7b7; /* rojo pastel */
  color: #333;
}
.card-blue {
  --background: #9bd0ff; /* azul pastel */
  color: #333;
}
.custom-fab {
  --background: #003366;
  --background-hover: #002244;
  --color: white; 
}


</style>
