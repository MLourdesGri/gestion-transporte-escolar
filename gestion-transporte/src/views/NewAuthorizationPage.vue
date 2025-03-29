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

      <div class="authorization-box">
        <div class="input-fields">
          <!-- Paso 1: Datos del Chofer -->
          <div v-if="step === 1">
            <ion-title size="large" class="title">Datos del chofer</ion-title>
            <InputField label="Nombre y Apellido" type="text" placeholder="Nombre" name="driver_name" v-model="form.driver_name" />
            <InputField label="Domicilio" type="text" placeholder="Domicilio" name="address" v-model="form.address" />
            <InputField label="Teléfono" type="text" placeholder="Teléfono" name="phone" v-model="form.phone"/>
            <InputField label="Genero" type="text" placeholder="Genero" name="gender" v-model="form.gender"/>
            <InputField label="Institucion educativa" type="text" placeholder="Institucion educativa" name="school" v-model="form.school" />
            <InputField label="Turno de trabajo" type="text" placeholder="Turno de trabajo" name="work_shift"  v-model="form.work_shift"/>
          </div>

          <!-- Paso 2: Datos del Vehículo -->
          <div v-if="step === 2">
            <ion-title size="large" class="title">Datos del vehículo</ion-title>
            <InputField label="Marca" type="text" placeholder="Marca" name="make" v-model="form.vehicle_make" />
            <InputField label="Modelo" type="text" placeholder="Modelo" name="model" v-model="form.vehicle_model" />
            <InputField label="Año" type="number" placeholder="Año" name="year" v-model="form.vehicle_year" />
            <InputField label="Patente" type="text" placeholder="Patente" name="licensePlate" v-model="form.vehicle_license_plate" />
            <InputField label="Capacidad" type="number" placeholder="Capacidad" name="capacity" v-model="form.vehicle_capacity" />
          </div>

          <!-- Paso 3: Archivos de Habilitación -->
          <div v-if="step === 3">
            <ion-title size="large" class="title">Espacio para subir archivos</ion-title>
            <InputFile accept="application/pdf" @file-uploaded="handleFileUploadVehicle">Habilitacion del vehiculo</InputFile>
            <InputFile accept="application/pdf" @file-uploaded="handleFileUploadDriver">Habilitacion del chofer</InputFile>
          </div>

          <ErrorMessage :message="errorMessage" duration="3000" />

          <ion-toast
            v-model:isOpen="showToast"
            message="Habilitacion creada correctamente"
            position="bottom"
            color="success"
            duration="3000"
          ></ion-toast>

          <!-- Botones de navegación -->
          <div class="navigation-buttons">
            <CustomButton v-if="step > 1" @click="prevStep">Anterior</CustomButton>
            <CustomButton v-if="step < 3" @click="nextStep" class="btnNext">Siguiente</CustomButton>
            <CustomButton v-if="step === 3" @click="saveAuthorization" class="btnNext">Guardar</CustomButton>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonToast } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import InputField from '@/components/InputField.vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import InputFile from '@/components/InputFile.vue';
import { getAuthorizationByUser, postAuthorization} from '@/services/api';
import router from '@/router';

interface Authorization {
  driver_name: string;
  address: string;
  phone: string;
  gender: string;
  school: string;
  work_shift: string;  
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: bigint;
  vehicle_license_plate: string;
  vehicle_capacity: bigint;
  vehicle_authorization_pdf: string;
  driver_authorization_pdf: string;
}

const authorization = ref<Authorization | null>(null);
const errorMessage = ref("");
const showToast = ref(false);
const showNoAuthorizationToast = ref(false);

const form = ref({
  driver_name: "",
  address: "",
  phone: "",
  gender: "",
  school: "",
  work_shift: "",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_year: "",
  vehicle_license_plate: "",
  vehicle_capacity: "",
  vehicle_authorization_pdf: null as File | null,
  driver_authorization_pdf: null as File | null,
});

const token = localStorage.getItem("token");

const step = ref(1); 

const getAuthorizationData = async () => {
  if (token) {
    try {
      const authorizationResponse = await getAuthorizationByUser(token);
      if (authorizationResponse && typeof authorizationResponse === 'object' && 'data' in authorizationResponse) {
        authorization.value = authorizationResponse.data as Authorization;
        showNoAuthorizationToast.value = false; 
      } else {
        authorization.value = null;
        showNoAuthorizationToast.value = true; 
        setTimeout(() => {
          showNoAuthorizationToast.value = false;
        }, 10000);
      }
    } catch (error) {
      console.error("Error cargando el vehículo", error);
      authorization.value = null;
      showNoAuthorizationToast.value = true;
    }
  }
};

onMounted(getAuthorizationData);

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
const vehicleUrl = ref<string | null>(null);

const handleFileUploadVehicle = (url: string) => {
  vehicleUrl.value = url;
};

const driverUrl = ref<string | null>(null);

const handleFileUploadDriver = (url: string) => {
  driverUrl.value = url;
};

const saveAuthorization = async () => {
  errorMessage.value = "";

  if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
  }

  const authorizationData = {
    driver_name: form.value.driver_name,
    address: form.value.address,
    phone: form.value.phone,
    gender: form.value.gender,
    school: form.value.school,
    work_shift: form.value.work_shift,
    vehicle_make: form.value.vehicle_make,
    vehicle_model: form.value.vehicle_model,
    vehicle_year: form.value.vehicle_year,
    vehicle_license_plate: form.value.vehicle_license_plate,
    vehicle_capacity: form.value.vehicle_capacity,
    driver_authorization_pdf: driverUrl.value,
    vehicle_authorization_pdf: vehicleUrl.value

  };

  if (!authorizationData.driver_name || !authorizationData.vehicle_make || !authorizationData.vehicle_model ||
   !authorizationData.vehicle_year || !authorizationData.vehicle_license_plate || !authorizationData.vehicle_capacity) {
    errorMessage.value = "Todos los campos son obligatorios";
    return;
  }

  try {
    const response = await postAuthorization(authorizationData, token); 

    if (response && typeof response === 'object' && 'data' in response) {
      router.push("/authorization");
      showToast.value = true;
      showNoAuthorizationToast.value = false; 
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
.authorization-box {
  align-items: center;
  gap: 20px;
}
.input-fields {
  margin-top: 40px;
}
ion-toast {
  margin-bottom: 20px;
}
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  bottom: 10px;
  left: 0;
}
.title {
  margin-bottom: 20px;
}
.btnNext {
  margin-left: auto;
}

</style>
