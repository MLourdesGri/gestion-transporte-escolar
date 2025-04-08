<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Habilitación #{{ id }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Habilitación #{{ id }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="authorization">
        <div class="detail-section">
          <h2>Vehículo</h2>
          <p><strong>Marca:</strong> {{ authorization.vehicle_make }}</p>
          <p><strong>Modelo:</strong> {{ authorization.vehicle_model }}</p>
          <p><strong>Año:</strong> {{ authorization.vehicle_year }}</p>
          <p><strong>Patente:</strong> {{ authorization.vehicle_license_plate }}</p>
          <p><strong>Capacidad:</strong> {{ authorization.vehicle_capacity }} pasajeros</p>
          <p><strong>Habilitado hasta:</strong> {{ authorization.due_date_vehicle }}</p>
        </div>

        <CustomButton color="light" class="download-authorization-vehicle" @click="downloadVehiclePDF()">Descargar habilitación del vehículo</CustomButton>

        <div class="detail-section">
          <h2>Chofer</h2>
          <p><strong>Nombre:</strong> {{ authorization.driver_name }}</p>
          <p><strong>Dirección:</strong> {{ authorization.address }}</p>
          <p><strong>Teléfono:</strong> {{ authorization.phone }}</p>
        </div>

        <CustomButton color="light" class="download-authorization-driver" @click="downloadDriverPDF()">Descargar habilitación del chofer</CustomButton>
      </div>

      <div class="buttons" v-if="role_id === 3">
        <CustomButton color="success" class="btnApprove">Aprobar</CustomButton>
        <CustomButton color="danger" class="btnReject">Rechazar</CustomButton>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTitle, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { ref, watchEffect } from 'vue';
import { getAuthorizationById, getUser } from '@/services/api';
import CustomButton from '@/components/CustomButton.vue';

const route = useRoute();
const id = ref<number>(Number(route.params.id));

interface User {
  full_name: string;
  role_id: number;
}

const user = ref<User | null>(null);
const role_id = ref<number | null>(null);

const loadUser = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const userResponse = await getUser(token) as { data: User };
      user.value = userResponse.data;
      role_id.value = userResponse.data.role_id;
      console.log("id role", role_id.value);
    } catch (error) {
      console.error("Error cargando usuario", error);
      user.value = null;
      role_id.value = null;
    }
  }
};

interface Authorization {
  authorization_id: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_license_plate: string;
  vehicle_capacity: number;
  due_date_vehicle: string;
  due_date_driver: string;
  driver_name: string;
  address: string;
  phone: string;
  vehicle_authorization_pdf: string;
  driver_authorization_pdf: string;
}

const authorization = ref<Authorization | null>(null);

const loadAuthorization = async () => {
  try {
    const authorizationResponse = await getAuthorizationById(id.value) as { data: Authorization };
    if (authorizationResponse.data) {
      authorization.value = authorizationResponse.data;
    } else {
      console.error("No se encontró la habilitación con el ID proporcionado.");
    }
  } catch (error) {
    console.error("Error al cargar la habilitación", error);
  }
};

watchEffect(async () => {
  const newId = route.params.id;
  if (newId) {
    id.value = Number(newId);
    await loadUser();
    await loadAuthorization();
  }
});

function downloadVehiclePDF() {
  if (!authorization.value) return;
  window.open(authorization.value.vehicle_authorization_pdf, '_blank');
}

function downloadDriverPDF() {
  if (!authorization.value) return;
  window.open(authorization.value.driver_authorization_pdf, '_blank');
}
</script>

<style scoped>
.detail-section {
  margin-bottom: 2rem;
}

.detail-section h2 {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1.2rem;
  margin-bottom: 25px;
  color: #3880ff;
}

.detail-section p {
  margin: 8px 0;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btnApprove,
.btnReject {
  border: none;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
}
</style>
