<template  :fullscreen="true">
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Nueva habilitación</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="authorization-box">
        <div class="input-fields">
          <div v-if="step === 1">
            <ion-title size="large" class="title">Datos del chofer</ion-title>
            <InputField label="Documento" type="text" placeholder="43403067" name="dni" v-model="form.dni" />
            <InputField label="Nombre y Apellido" type="text" placeholder="Juan" name="driver_name" v-model="form.driver_name" />
            <InputWithMaps label="Domicilio" type="text" placeholder="Cordoba 1256" v-model="form.address"/>
            <InputField label="Teléfono" type="text" placeholder="3413456677" name="phone" v-model="form.phone"/>
            <DropdownField 
              label="Género" 
              :options="genders" 
              v-model="form.gender" 
            />
            <DropdownField 
              label="Turno de trabajo" 
              :options="workShifts" 
              v-model="form.work_shift" 
            />
            <InputWithMaps label="Institución educativa" type="text" placeholder="Colegio Maria Auxiliadora" name="school" v-model="form.school" :multipleFields="true"/>
          </div>

          <div v-if="step === 2">
            <ion-title size="large" class="title">Datos del vehículo</ion-title>
            <InputField label="Marca" type="text" placeholder="Mercedes Benz" name="make" v-model="form.vehicle_make" />
            <InputField label="Modelo" type="text" placeholder="Sprinter" name="model" v-model="form.vehicle_model" />
            <InputField label="Año" type="number" placeholder="2020" name="year" v-model="form.vehicle_year" />
            <InputField label="Patente" type="text" placeholder="ABC123" name="licensePlate" v-model="form.vehicle_license_plate" />
            <InputField label="Cantidad de pasajeros" type="number" placeholder="23" name="capacity" v-model="form.vehicle_capacity" />
          </div>

          <div v-if="step === 3">
            <ion-title size="large" class="title">Carga de habilitaciones</ion-title>

            <div class="file-upload-container">
            <InputFile accept="application/pdf" @file-uploaded="handleFileUploadVehicle" class="input-field">Habilitacion municipal del vehiculo</InputFile>
            <label v-if="vehicleUrl && isLoadingVehicle==false" class="file-uploaded-label">
              Archivo cargado exitosamente!
              <a :href="vehicleUrl" target="_blank" class="file-download-link">Ver</a>
            </label>
            </div>
            <InputField label="Fecha de vencimiento" type="date" placeholder="Fecha de vencimiento" name="due_date_vehicle" v-model="form.due_date_vehicle" />
            
            
            <div class="file-upload-container">
            <InputFile accept="application/pdf" @file-uploaded="handleFileUploadDriver" class="input-field">Habilitacion municipal del chofer</InputFile>
            <label v-if="driverUrl && isLoadingDriver==false" class="file-uploaded-label">
              Archivo cargado exitosamente!
              <a :href="driverUrl" target="_blank" class="file-download-link">Ver</a>
            </label>
            </div>
            <InputField label="Fecha de vencimiento" type="date" placeholder="Fecha de vencimiento" name="due_date_driver" v-model="form.due_date_driver" />
          </div>

          <div class="error">
          <ErrorMessage :message="errorMessage" duration="3000" />
         </div>
          <ion-toast
            v-model:isOpen="showToast"
            message="Habilitacion creada correctamente"
            position="bottom"
            color="success"
            duration="3000"
          ></ion-toast>

          <!-- Botones de navegación -->
          <div class="navigation-buttons">
            <CustomButton v-if="step > 1" @click="prevStep" class="btnBefore">Anterior</CustomButton>
            <CustomButton v-if="step < 3" @click="nextStep" class="btnNext">Siguiente</CustomButton>
            <CustomButton v-if="step === 3" @click="saveAuthorization" class="btnNext">Guardar</CustomButton>
          </div>
        </div>
      </div>
      <ion-loading :isOpen="isLoadingVehicle" message="Cargando archivo..." />
      <ion-loading :isOpen="isLoadingDriver" message="Cargando archivo..." />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonToast, IonLoading } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import InputField from '@/components/InputField.vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import InputFile from '@/components/InputFile.vue';
import { getAuthorizationByUser, postAuthorization} from '@/services/api';
import DropdownField from '@/components/DropdownField.vue';
import InputWithMaps from '@/components/InputWithMaps.vue';
import { useUserStore } from '@/store/user';
import { redirectIfNoToken } from '@/utils/utils';


enum WorkShift {
  Manana = 1,
  Tarde = 2,
  MananaYTarde = 3,
}

enum Gender {
  Masculino = 1,
  Femenino = 2,
  Otro = 3,
}

const workShifts = [
  { value: WorkShift.Manana, label: 'Mañana' },
  { value: WorkShift.Tarde, label: 'Tarde' }
];

const genders = [
  { value: Gender.Femenino, label: 'Femenino'},
  { value: Gender.Masculino, label: 'Masculino' },
  { value: Gender.Otro, label: 'Otro' },
]

interface Authorization {
  driver_name: string;
  address: string;
  phone: string;
  gender: string;
  school_name: string;
  school_address: string;
  work_shift: string;  
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: bigint;
  vehicle_license_plate: string;
  vehicle_capacity: bigint;
  vehicle_authorization_pdf: string;
  driver_authorization_pdf: string;
  due_date_vehicle: string;
  due_date_driver: string;
  dni: string;
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
  school: {
    school_name: "",
    school_address: ""
  },
  work_shift: "",  
  vehicle_make: "",
  vehicle_model: "",
  vehicle_year: "",
  vehicle_license_plate: "",
  vehicle_capacity: "",
  vehicle_authorization_pdf: null as File | null,
  driver_authorization_pdf: null as File | null,
  due_date_vehicle: "",
  due_date_driver: "",
  dni: "",
});

const step = ref(1); 

const userStore = useUserStore();

const getAuthorizationData = async () => {
  const token = userStore.token;

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

onMounted(() => {
  if (redirectIfNoToken()) return;
  getAuthorizationData();
});

const nextStep = () => {
  if (step.value < 3) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const vehicleUrl = ref<string | null>(null);

const isLoadingVehicle = ref(false);
const isLoadingDriver = ref(false);

const handleFileUploadVehicle = (url: string) => {
  isLoadingVehicle.value = true;
  vehicleUrl.value = url;
  setTimeout(() => {
    isLoadingVehicle.value = false;
  }, 3000);
};

const driverUrl = ref<string | null>(null);

const handleFileUploadDriver = (url: string) => {
  isLoadingDriver.value = true;
  driverUrl.value = url;
  setTimeout(() => {
    isLoadingDriver.value = false;
  }, 3000);
};

const saveAuthorization = async () => {
  errorMessage.value = "";
  const token = userStore.token;

  if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
  }

  const authorizationData = {
    driver_name: form.value.driver_name,
    address: form.value.address,
    phone: form.value.phone,
    gender: form.value.gender,
    school_name: form.value.school.school_name,
    school_address: form.value.school.school_address,
    work_shift: form.value.work_shift,
    vehicle_make: form.value.vehicle_make,
    vehicle_model: form.value.vehicle_model,
    vehicle_year: form.value.vehicle_year,
    vehicle_license_plate: form.value.vehicle_license_plate,
    vehicle_capacity: form.value.vehicle_capacity,
    driver_authorization_pdf: driverUrl.value,
    vehicle_authorization_pdf: vehicleUrl.value,
    due_date_vehicle: form.value.due_date_vehicle,
    due_date_driver: form.value.due_date_driver,
    state: 1, //estado "subido"
    dni: form.value.dni,
  };

  if (!authorizationData.driver_name || !authorizationData.vehicle_make || !authorizationData.vehicle_model ||
   !authorizationData.vehicle_year || !authorizationData.vehicle_license_plate || !authorizationData.vehicle_capacity || !authorizationData.due_date_vehicle || !authorizationData.due_date_driver) {
    errorMessage.value = "Todos los campos son obligatorios";
    return;
  }

  if(!authorizationData.driver_authorization_pdf || !authorizationData.vehicle_authorization_pdf) {
    errorMessage.value = "Los archivos de habilitación son obligatorios";
    return;
  }

  if(authorizationData.due_date_vehicle < new Date().toISOString().split('T')[0]) {
    errorMessage.value = "La fecha de vencimiento del vehículo no puede ser menor a la fecha actual";
    return;
  }
  if(authorizationData.due_date_driver < new Date().toISOString().split('T')[0]) {
    errorMessage.value = "La fecha de vencimiento del chofer no puede ser menor a la fecha actual";
    return;
  }

  try {
    
    const response = await postAuthorization(authorizationData, token); 

    if (response && typeof response === 'object' && 'data' in response) {
      showToast.value = true;
      showNoAuthorizationToast.value = false; 
      window.location.href = '/authorization';
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  margin-bottom: 10px;
}
.btnNext {
  margin-left: auto;
  margin-right: 10px;
}
.btnBefore {
  margin-right: auto;
  margin-left: 10px;
}
.file-uploaded-label {
  font-size: 14px;
  color: #4CAF50;
}

.file-download-link {
  color: #007BFF;
  text-decoration: underline;
  margin-left: 10px;
}

.file-download-link:hover {
  color: #0056b3;
}

.file-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.error {
  display: flex;
  justify-content: center;
}
</style>
