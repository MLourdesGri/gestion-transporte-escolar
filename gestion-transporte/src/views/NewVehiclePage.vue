<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Nueva habilitación</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" >
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Nueva habilitación</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="vehicle-box">
        <div class="input-fields">
          <!-- Paso 1: Datos del Chofer -->
          <div v-if="step === 1">
            <ion-title size="large" class="title">Datos del chofer</ion-title>
            <InputField label="Nombre y Apellido" type="text" placeholder="Nombre" name="driver_name" v-model="form.driver_name" />
            <InputField label="Domicilio" type="text" placeholder="Domicilio" name="address" />
            <InputField label="Teléfono" type="text" placeholder="Teléfono" name="phone" />
            <InputField label="Genero" type="text" placeholder="Genero" name="gender" />
            <InputField label="Institucion educativa" type="text" placeholder="Institucion educativa" name="school" />
            <InputField label="Turno de trabajo" type="text" placeholder="Turno de trabajo" name="work_shift" />
          </div>

          <!-- Paso 2: Datos del Vehículo -->
          <div v-if="step === 2">
            <ion-title size="large" class="title">Datos del vehículo</ion-title>
            <InputField label="Marca" type="text" placeholder="Marca" name="make" v-model="form.make" />
            <InputField label="Modelo" type="text" placeholder="Modelo" name="model" v-model="form.model" />
            <InputField label="Año" type="number" placeholder="Año" name="year" v-model="form.year" />
            <InputField label="Patente" type="text" placeholder="Patente" name="licensePlate" v-model="form.licensePlate" />
            <InputField label="Capacidad" type="number" placeholder="Capacidad" name="capacity" v-model="form.capacity" />
          </div>

          <!-- Paso 3: Archivos de Habilitación -->
          <div v-if="step === 3">
            <ion-title size="large" class="title">Espacio para subir archivos</ion-title>
            <InputField label="Fecha de vencimiento" type="date" placeholder="Fecha de vencimiento" name="expiration_date" />
          </div>

          <ErrorMessage :message="errorMessage" duration="3000" />
          
          <!-- Botones de navegación -->
          <div class="navigation-buttons">
            <CustomButton v-if="step > 1" @click="prevStep">Anterior</CustomButton>
            <CustomButton v-if="step < 3" @click="nextStep" class="btnNext">Siguiente</CustomButton>
            <CustomButton v-if="step === 3" @click="saveVehicle" class="btnNext">Guardar</CustomButton>
          </div>
        </div>
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
const showToast = ref(false);
const showNoVehicleToast = ref(false);

const form = ref({
  driver_name: "",
  driver_license: "",
  make: "",
  model: "",
  year: "",
  licensePlate: "",
  capacity: "",
  driver_authorization_pdf: null as File | null,
  vehicle_authorization_pdf: null as File | null,
});

const token = localStorage.getItem("token");

const step = ref(1); 

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

const nextStep = () => {
  if (step.value < 3) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

// const handleFileChange = (field: string, event: Event) => {
//   const target = event.target as HTMLInputElement;
//   if (target && target.files && target.files[0]) {
//     form.value[field] = target.files[0];
//   }
// };

const saveVehicle = async () => {
  errorMessage.value = "";

  if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
  }

  const vehicleData = {
    driver_name: form.value.driver_name,
    driver_license: form.value.driver_license,
    make: form.value.make,
    model: form.value.model,
    year: Number(form.value.year),
    licensePlate: form.value.licensePlate,
    capacity: Number(form.value.capacity),
    driver_authorization_pdf: form.value.driver_authorization_pdf,
    vehicle_authorization_pdf: form.value.vehicle_authorization_pdf,
  };

  if (!vehicleData.driver_name || !vehicleData.driver_license || !vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.licensePlate || !vehicleData.capacity) {
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
  height: 100vh;
}
.input-fields {
  margin-top: 40px;
  margin-left: 20px;
}
ion-toast {
  margin-bottom: 20px;
}
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.title {
  margin-bottom: 20px;
}
.btnNext {
  margin-right: 20px;
}

</style>
