<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi vehículo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mi vehículo</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="vehicle-box">
        <div class="input-fields">
          <InputField label="Marca" type="text" :placeholder="vehicle?.make || 'Marca'" name="make" v-model="form.make" :disabled="!isEditing" />
          <InputField label="Modelo" type="text" :placeholder="vehicle?.model || 'Modelo'" name="model" required="true" v-model="form.model" :disabled="!isEditing" />
          <InputField label="Año" type="number" :placeholder="vehicle?.year?.toString() || 'Año'" name="year" v-model="form.year" :disabled="!isEditing" />
          <InputField label="Patente" type="text" :placeholder="vehicle?.licensePlate || 'Patente'" name="licensePlate" v-model="form.licensePlate" :disabled="!isEditing" />
          <InputField label="Cantidad de pasajeros" type="number" :placeholder="vehicle?.capacity.toString() || 'Cantidad de pasajeros'" name="capacity" v-model="form.capacity" :disabled="!isEditing" />
        </div>

        <ErrorMessage :message="errorMessage" duration="3000" />

        <CustomButton class="edit-profile" @click="toggleEdit">
          {{ isEditing ? 'Guardar' : 'Editar vehículo' }}
        </CustomButton>

        <ion-toast v-model:isOpen="showToast" message="Vehículo actualizado correctamente" position="bottom" color="success" duration="3000"></ion-toast>

        <ion-toast v-model:isOpen="showNoVehicleToast" message="Aún no has ingresado los datos de tu vehículo" position="bottom" position-anchor="footer" color="warning"></ion-toast>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonToast } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import InputField from '@/components/InputField.vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { getVehicleByUser, postVehicle, putVehicle } from '@/services/api';

interface Vehicle {
  make: string;
  model: string;
  year: bigint;
  licensePlate: string;
  capacity: bigint;
  authorization_pdf: string;
}

const vehicle = ref<Vehicle | null>(null);
const errorMessage = ref("");
const isEditing = ref(false);
const showToast = ref(false);
const showNoVehicleToast = ref(false);

const form = ref({
  make: "",
  model: "",
  year: "",
  licensePlate: "",
  capacity: "",
  authorization_pdf: "",
});

const token = localStorage.getItem("token");

const getVehicleData = async () => {
  if (token) {
    try {
      const vehicleResponse = await getVehicleByUser(token);
      if (vehicleResponse && typeof vehicleResponse === 'object' && 'data' in vehicleResponse) {
        vehicle.value = vehicleResponse.data as Vehicle;
        showNoVehicleToast.value = false; 
      } else {
        vehicle.value = null;
        showNoVehicleToast.value = true; 
        setTimeout(() => {
          showNoVehicleToast.value = false;
        }, 10000);
      }
    } catch (error) {
      console.error("Error cargando el vehículo", error);
      vehicle.value = null;
      showNoVehicleToast.value = true;
    }
  }
};

onMounted(getVehicleData);

const toggleEdit = () => {
  if (!isEditing.value && vehicle.value) {
    form.value.make = vehicle.value.make;
    form.value.model = vehicle.value.model;
    form.value.year = vehicle.value.year.toString();
    form.value.licensePlate = vehicle.value.licensePlate;
    form.value.capacity = vehicle.value.capacity.toString();
    form.value.authorization_pdf = vehicle.value.authorization_pdf;
  }

  isEditing.value = !isEditing.value;

  if (!isEditing.value) {
    saveVehicle();
  }
};

const saveVehicle = async () => {
  errorMessage.value = "";

  if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
  }

  const vehicleData = {
    make: form.value.make,
    model: form.value.model,
    year: Number(form.value.year),
    licensePlate: form.value.licensePlate,
    capacity: Number(form.value.capacity),
    authorization_pdf: form.value.authorization_pdf,
  };

  if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.licensePlate || !vehicleData.capacity) {
    errorMessage.value = "Todos los campos son obligatorios";
    return;
  }

  try {
    let response;
    if (!vehicle.value) {
      response = await postVehicle(vehicleData, token); 
    } else {
      response = await putVehicle(vehicleData, token); 
    }

    if (response && typeof response === 'object' && 'data' in response) {
      await getVehicleData(); 
      showToast.value = true;
      showNoVehicleToast.value = false; 
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    } else {
      errorMessage.value = "Error al actualizar o crear el vehículo. Inténtalo nuevamente.";
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = "Hubo un problema con la actualización o creación del vehículo. Inténtalo nuevamente.";
  }
};
</script>

<style scoped>
.vehicle-box {
  align-items: center;
  gap: 20px;
  height: 100vh; /* Esto asegura que el espacio no se contraiga */
}
.input-fields {
  margin-top: 80px;
}
ion-toast {
  margin-bottom: 20px;
}
</style>
