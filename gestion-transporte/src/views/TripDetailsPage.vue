<template :fullscreen="true">
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title v-if="trip_children">Transporte del día</ion-title>
          <ion-title v-else>Transporte</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <div class="page">
            <div class="detail-section">
                <h2><strong>Alumnos del viaje</strong></h2>
                <div v-for="trip_child in trip_children" :key="trip_child.trip_child_id">
                    <p><strong>Nombre:</strong> {{ trip_child.child.name }} {{ trip_child.child.last_name }}</p>
                    <p><strong>Edad:</strong> {{ trip_child.child.age }}</p>
                    <br />
                </div>
                <div v-if="trip_children?.length === 0">
                    <p>No hay alumnos asignados a este viaje.</p>
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
            <CustomButton vertical="bottom" horizontal="end" class="btnMap" @click="getMapTrip(id)">Ver en mapa</CustomButton>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonPage, IonTitle, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonToast } from '@ionic/vue';
  import { useRoute } from 'vue-router';
  import { ref, watchEffect } from 'vue';
  import { getUser, getTripChildByTripId } from '@/services/api';
  import CustomButton from '@/components/CustomButton.vue';
  import { useUserStore } from '@/store/user';
  import ErrorMessage from '@/components/ErrorMessage.vue';
  
  const route = useRoute();
  const id = ref<number>(Number(route.params.id));
  const errorMessage = ref<string | undefined>(undefined);
  const showToast = ref(false);
  const message = ref<string | null>(null);

const cancel = () => {
    window.location.href = '/home';
};
  const toastColor = ref<'success' | 'danger'>('success');
  const trip_children = ref<TripChild[] | null>(null);
  const userStore = useUserStore();
  const token = userStore.token;
  
interface User {
  full_name: string;
  role_id: number;
}

interface TripChild{
  trip_child_id: number;
  child: Child;
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
  try {
    const tripChildResponse = await getTripChildByTripId(id.value) as { data: TripChild[] };
    console.log("Respuesta del viaje hijo:", tripChildResponse.data);
    if (tripChildResponse.data) {
      trip_children.value = tripChildResponse.data;
    } else {
      console.error("No se encontraron niños en el viaje con el ID proporcionado.");
    }
  } catch (error) {
    console.error("Error al cargar transporte", error);
  }
};
  
watchEffect(async () => {
    const newId = route.params.id;
    if (newId) {
      id.value = Number(newId);
      await loadUser();
      await loadTripChild();
    }
});

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
    padding: 1rem;
}  

.detail-section h2 {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 1.2rem;
    margin-bottom: 15px;
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