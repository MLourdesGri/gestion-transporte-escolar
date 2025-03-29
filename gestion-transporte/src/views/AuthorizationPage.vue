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
          <div class="no-authorization">
          <p>Aún no has registrado ninguna habilitación de chofer y vehículo.</p>
        </div>
      </template>

      <template v-else>
        <ion-card v-for="authorization in authorizations" :key="authorization.authorization_id" :button="true">
          <ion-card-header>
            <ion-card-title>{{ authorization.vehicle_make }} {{ authorization.vehicle_model }}</ion-card-title>
            <ion-card-subtitle>Año: {{ authorization.vehicle_year }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Patente:</strong> {{ authorization.vehicle_license_plate }}</p>
            <p><strong>Capacidad:</strong> {{ authorization.vehicle_capacity }} pasajeros</p>
            <CustomButton @click="toggleEdit">
              {{ isEditing ? "Guardar Cambios" : "Editar Vehículo" }}
            </CustomButton>
          </ion-card-content>
        </ion-card>

        <CustomButton class="new-hab" @click="navigateToAddAuthorization">Nueva habilitación</CustomButton>

        <ion-toast
          v-model:isOpen="showToast"
          message="Vehículo actualizado correctamente"
          position="bottom"
          color="success"
          duration="3000"
        ></ion-toast>
      </template>
    </ion-content>

  </ion-page>
</template>


<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle, IonCardTitle, IonToast} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuthorizationByUser, putAuthorization } from "@/services/api";
import CustomButton from "@/components/CustomButton.vue";

interface Authorization {
  authorization_id: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  vehicle_capacity: number;
}

const authorization = ref<Authorization | null>(null);
const isEditing = ref(false);
const showToast = ref(false);
const router = useRouter();
const authorizations = ref<Authorization[]>([]);

const token = localStorage.getItem("token");
  
  const loadAuthorizations = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const authorizationResponse = await getAuthorizationByUser(token);
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

onMounted(loadAuthorizations);


const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    saveAuthorization();
  }
};

const saveAuthorization = async () => {
  if (!token || !authorization.value) return;

  try {
    await putAuthorization(authorization.value, token);
    showToast.value = true;
  } catch (error) {
    console.error("Error al actualizar el vehículo", error);
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
}
</style>
