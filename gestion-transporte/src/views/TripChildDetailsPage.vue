<template :fullscreen="true">
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title v-if="trip_child">Transporte de {{ trip_child.child.name }}  {{ trip_child.child.last_name }}</ion-title>
          <ion-title v-else>Transporte</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <template v-if="isLoading">
          <LoadingSpinner />
        </template>
        <template v-else>
          <div class="page">
            <div v-if="trip_child">
              <div class="detail-section">
                <h2 style="color: black;"><strong>Fecha:</strong> {{ formatDate(trip_child.trip.date) }}</h2>
                <h2><strong>Alumno</strong></h2>
                <p><strong>Nombre:</strong> {{ trip_child.child.name }}  {{ trip_child.child.last_name }}</p>
                <p><strong>Edad:</strong> {{ trip_child.child.age }}</p>
                <p><strong>Escuela:</strong> {{ trip_child.child.school_name }}</p>
                <p><strong>Turno:</strong> {{ formatShift(trip_child.child.school_shift) }}</p>
              </div>

              <div class="detail-section">
                <h2><strong>Vehículo</strong></h2>
                <p><strong>Marca:</strong> {{ trip_child.trip.authorization.vehicle_make }}</p>
                <p><strong>Modelo:</strong> {{ trip_child.trip.authorization.vehicle_model }}</p>
                <p><strong>Año:</strong> {{ trip_child.trip.authorization.vehicle_year }}</p>
                <p><strong>Patente:</strong> {{ trip_child.trip.authorization.vehicle_license_plate }}</p>
                <p><strong>Capacidad:</strong> {{ trip_child.trip.authorization.vehicle_capacity }} pasajeros</p>
              </div>
      
              <div class="detail-section">
                <h2><strong>Chofer</strong></h2>
                <p><strong>Nombre:</strong> {{ trip_child.trip.authorization.driver_name }}</p>
                <p><strong>Dirección:</strong> {{ trip_child.trip.authorization.address }}</p>
                <p><strong>Teléfono:</strong> {{ trip_child.trip.authorization.phone }}</p>
              </div>
      
              <div class="detail-section">
                <h2><strong>Estado</strong></h2>
                <p v-if="trip_child.trip.authorization.state === 1">Pendiente</p>
                <p v-else-if="trip_child.trip.authorization.state === 2">Aprobada</p>
                <p v-else-if="trip_child.trip.authorization.state === 3">Rechazada</p>
              </div>
            </div>
    
              <div class="error">
                <ErrorMessage :message="errorMessage" duration="3000" />
              </div>
    
              <ion-toast
                v-model:isOpen="showToast"
                :message="message"
                position="bottom"
                :color="toastColor"
                duration="3000"
              />
    
            <div slot="fixed" class="bottom-buttons">
              <CustomButton vertical="bottom" horizontal="start" expand="block" color="medium" @click="cancel">Volver</CustomButton>
              <CustomButton vertical="bottom" horizontal="center" color="danger" class="btnDelete" @click="showAlert = true">Eliminar</CustomButton>
              <CustomButton vertical="bottom" horizontal="end" class="btnMap" @click="trip_child?.trip.trip_id !== undefined && getMapTrip(trip_child.trip.trip_id)">Ver en mapa</CustomButton>
            </div>
          </div>
        </template>
        <IonAlert
        :is-open="showAlert"
        header="Confirmación"
        message="¿Estás seguro que deseas eliminar el transporte?"
        :buttons="alertButtons" />
      </ion-content>
    </ion-page>
  </template>
  
<script setup lang="ts">
import { IonPage, IonTitle, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonToast, IonAlert } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { ref, watchEffect } from 'vue';
import { getUser, getTripChildById, deleteTripChild } from '@/services/api';
import CustomButton from '@/components/CustomButton.vue';
import { useUserStore } from '@/store/user';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { formatDate, formatShift } from '@/utils/utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
  
const route = useRoute();
const id = ref<number>(Number(route.params.id));
const errorMessage = ref<string | undefined>(undefined);
const showToast = ref(false);
const message = ref<string | null>(null);
const showAlert = ref(false);
const cancel = () => {
  window.location.href = '/home';
};
const toastColor = ref<'success' | 'danger'>('success');
const trip_child = ref<TripChild | null>(null);
const userStore = useUserStore();
const token = userStore.token;
const isLoading = ref(true);
  
  interface User {
    full_name: string;
    role_id: number;
  }

  interface TripChild{
    trip_child_id: number;
    trip: Trip;
    child: Child;
  }

  interface Trip {
    trip_id: number;
    date: string;
    authorization: Authorization;
    status: string;
}

interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school_name: string;
    school_address: string;
    school_shift: string;
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
    driver_name: string;
    address: string;
    phone: string;
    vehicle_authorization_pdf: string;
    driver_authorization_pdf: string;
    state: number;
    rejection_reason?: string;
  }
  
  const loadUser = async () => {
    if (token) {
      try {
        const userResponse = await getUser(token) as { data: User };
        userStore.setUser(userResponse.data);
      } catch (error) {
        console.error("Error cargando usuario", error);
        userStore.setUser(null);
      }
    }
  };
  
  const loadTripChild = async () => {
    isLoading.value = true;
    try {
      const tripChildResponse = await getTripChildById(id.value) as { data: TripChild };
      if (tripChildResponse.data) {
        trip_child.value = tripChildResponse.data;
      } else {
        console.error("No se encontró el transporte para hijo con el ID proporcionado.");
      }
    } catch (error) {
      console.error("Error al cargar transporte para hijo", error);
    }
    isLoading.value = false;
  };
  
  watchEffect(async () => {
    const newId = route.params.id;
    if (newId) {
      id.value = Number(newId);
      await loadUser();
      await loadTripChild();
    }
  });

  const alertButtons = [
  {
    text: 'Cancelar'
  },
  {
    text: 'Confirmar',
    handler: async () => {  
      if (token) {
        try {
          await deleteTripChild(id.value, token); 
          window.location.href = '/home';
        } catch (error) {
          console.error("Error eliminando viaje hijo", error);
        }
      } else {
        console.error("Token inválido o alumno no seleccionado");
      }
    },
  },
];

const getMapTrip = (tripId: number) => {
    window.location.href = `/home/map/${tripId}`;
};
  
  </script>
  
  <style scoped>
  .page {
    left: 0;
    bottom: 0;
    right: 0;
    top: 0;
    padding: 0 1rem 0 1rem;
  }  

  .detail-section h2 {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 1.2rem;
    color: #003388;
  }
  
  .detail-section p {
    margin: 8px 0;
  }
  
  .bottom-buttons {
    position: fixed;
    display: flex;
    justify-content: space-between;
    width: 100%;
    bottom: 0;
    left: 0;
    padding: 10px;
}
  
  .error {
    display: flex;
    justify-content: center;
  }
  </style>
