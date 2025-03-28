<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <div v-if="step === 1"><ion-title>Elige alumno</ion-title></div>
          <div v-if="step === 2"><ion-title>Elige chofer</ion-title></div>
          <div v-if="step === 3"><ion-title>Realiza el pago</ion-title></div>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true" >
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Nuevo transporte</ion-title>
          </ion-toolbar>
        </ion-header>
  
        <div class="vehicle-box">
          <div>
            <!-- Paso 1: Elegir hijo -->
            <div v-if="step === 1">
                <template v-if="children.length > 0">
                    <ion-card v-for="child in children" :key="child.child_id" :button="true" @click="selectChild(child)" :class="{ selected: currentChild && currentChild.child_id === child.child_id }">
                        <ion-card-header>
                        <ion-card-title>{{ child.name }} {{ child.last_name }}</ion-card-title>
                        <ion-card-subtitle>Edad: {{ child.age }}</ion-card-subtitle>
                        <ion-card-subtitle>Escuela: {{ child.school }}</ion-card-subtitle>
                        </ion-card-header>
                    </ion-card>
                </template>
            </div>
  
            <!-- Paso 2: Choferes disponibles-->
            <div v-if="step === 2">
                <template v-if="drivers.length > 0">
                    <ion-card v-for="driver in drivers" :key="driver.vehicle_id" :button="true" @click="selectDriver(driver)" :class="{ selected: currentDriver && currentDriver.vehicle_id === driver.vehicle_id }">
                        <ion-card-header>
                        <ion-card-title>{{ driver.licensePlate }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                        <p><strong>Marca:</strong> {{ driver.make }}</p>
                        <p><strong>Modelo:</strong> {{ driver.model }}</p>
                        <p><strong>Año:</strong> {{ driver.year }}</p>
                        <p><strong>Capacidad:</strong> {{ driver.capacity }} pasajeros</p>
                        </ion-card-content>
                    </ion-card>
                </template>
            </div>
  
            <!-- Paso 3: Pago MP -->
            <div v-if="step === 3">
            </div>
  
            <ErrorMessage :message="errorMessage" duration="3000" />
            
            <!-- Botones de navegación -->
            <div class="navigation-buttons">
              <CustomButton v-if="step > 1" @click="prevStep" class="btnPrev">Anterior</CustomButton>
              <CustomButton v-if="step < 3" @click="nextStep" class="btnNext">Siguiente</CustomButton>
              <CustomButton v-if="step === 3" @click="saveTrip" class="btnNext">Guardar</CustomButton>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardHeader, 
    IonCardSubtitle, IonCardTitle, IonCardContent} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { getAllVehicles, getChildrenByUser } from '@/services/api';


interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school: string;
}

interface Vehicle {
    vehicle_id: number;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    capacity: number;
}

onMounted(() => {
loadChildren();
});

const step = ref(1); 
const children = ref<Child[]>([]);
const drivers = ref<Vehicle[]>([]);
const errorMessage = ref("");
const showToast = ref(false);
const currentChild = ref<Child | null>(null); 
const currentDriver = ref<Vehicle | null>(null);

const token = localStorage.getItem("token");

const nextStep = () => {
if (step.value < 3) step.value++;
};

const prevStep = () => {
if (step.value > 1) step.value--;
};

const loadChildren = async () => {
const token = localStorage.getItem("token");
if (token) {
    try {
    const childResponse = await getChildrenByUser(token);
    if (childResponse && typeof childResponse === "object" && "data" in childResponse) {
        const childData = childResponse.data;
        children.value = Array.isArray(childData) ? childData : (childData ? [childData] : []);
    } else {
        children.value = [];
    }
    } catch (error) {
    console.error("Error cargando alumnos", error);
    children.value = [];
    }
}
};

const loadDriver = async () => {
const token = localStorage.getItem("token");
if (token) {
    try {
    const driverResponse = await getAllVehicles(token);
    if (driverResponse && typeof driverResponse === "object" && "data" in driverResponse) {
        const driverData = driverResponse.data;
        drivers.value = Array.isArray(driverData) ? driverData : (driverData ? [driverData] : []);
    } else {
        drivers.value = [];
    }
    } catch (error) {
    console.error("Error cargando alumnos", error);
    drivers.value = [];
    }
}
};

const selectChild = (child: Child) => {
    currentChild.value = child;
    loadDriver();
};

const selectDriver = (driver: Vehicle) => {
    currentDriver.value = driver;
};

const saveTrip = async () => {
    errorMessage.value = "";

    if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
    }

    try {
    let response;

    if (response && typeof response === 'object' && 'data' in response) {
        showToast.value = true;
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
}
</script>
  
<style scoped>
  .vehicle-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 10px;
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
  .selected {
  border: 2px solid #003366; 
    }
  
</style>
  