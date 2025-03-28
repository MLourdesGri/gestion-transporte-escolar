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

      <template v-if="!vehicle">
          <div class="no-vehicle">
          <p>Aún no has registrado ninguna habilitación de chofer y vehículo.</p>
          <CustomButton @click="navigateToAddVehicle">Completar habilitación</CustomButton>
        </div>
      </template>

      <template v-else>
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ vehicle.make }} {{ vehicle.model }}</ion-card-title>
            <ion-card-subtitle>Año: {{ vehicle.year }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Patente:</strong> {{ vehicle.licensePlate }}</p>
            <p><strong>Capacidad:</strong> {{ vehicle.capacity }} pasajeros</p>
          </ion-card-content>
        </ion-card>

        <CustomButton @click="toggleEdit">
          {{ isEditing ? "Guardar Cambios" : "Editar Vehículo" }}
        </CustomButton>

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
import {
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonToast,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { putVehicle } from "@/services/api";
import CustomButton from "@/components/CustomButton.vue";

interface Vehicle {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
}

const vehicle = ref<Vehicle | null>(null);
const isEditing = ref(false);
const showToast = ref(false);
const router = useRouter();

const token = localStorage.getItem("token");

const getVehicleData = async () => {
  if (!token) return;

  // try {
  //   const response = await getVehicleByUser(token);
  //   if (response?.data) {
  //     vehicle.value = response.data;
  //   } else {
  //     vehicle.value = null;
  //   }
  // } catch (error) {
  //   console.error("Error cargando el vehículo", error);
  //   vehicle.value = null;
  // }
};

onMounted(getVehicleData);

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    saveVehicle();
  }
};

const saveVehicle = async () => {
  if (!token || !vehicle.value) return;

  try {
    await putVehicle(vehicle.value, token);
    showToast.value = true;
  } catch (error) {
    console.error("Error al actualizar el vehículo", error);
  }
};

const navigateToAddVehicle = () => {
  console.log("esto anda");
  router.push("/vehicle/new-vehicle");
};
</script>

<style scoped>
.no-vehicle {
  text-align: center;
  padding: 20px;
  color: gray;
}

.vehicle-content {
  padding-top: 10px;
}
</style>
