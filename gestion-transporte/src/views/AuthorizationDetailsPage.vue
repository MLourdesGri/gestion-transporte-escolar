<template :fullscreen="true">
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Habilitación #{{ id }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page">
        <div v-if="authorization">
          <div class="detail-section">
            <h2>Vehículo</h2>
            <p><strong>Marca:</strong> {{ authorization.vehicle_make }}</p>
            <p><strong>Modelo:</strong> {{ authorization.vehicle_model }}</p>
            <p><strong>Año:</strong> {{ authorization.vehicle_year }}</p>
            <p><strong>Patente:</strong> {{ authorization.vehicle_license_plate }}</p>
            <p><strong>Capacidad:</strong> {{ authorization.vehicle_capacity }} pasajeros</p>
            <p><strong>Habilitado hasta:</strong> {{ formatDate(authorization.due_date_vehicle) }}</p>
          </div>

          <CustomButton color="light" class="download-authorization-vehicle" @click="downloadVehiclePDF()">Descargar habilitación del vehículo</CustomButton>

          <div class="detail-section">
            <h2>Chofer</h2>
            <p><strong>Nombre:</strong> {{ authorization.driver_name }}</p>
            <p><strong>Dirección:</strong> {{ authorization.address }}</p>
            <p><strong>Teléfono:</strong> {{ authorization.phone }}</p>
            <p><strong>Habilitado hasta:</strong> {{ formatDate(authorization.due_date_driver) }}</p>
          </div>

          <CustomButton color="light" class="download-authorization-driver" @click="downloadDriverPDF()">Descargar habilitación del chofer</CustomButton>

          <div class="detail-section">
            <h2>Estado</h2>
            <p v-if="authorization.state === 1">Pendiente</p>
            <p v-else-if="authorization.state === 2">Aprobada</p>
            <p v-else-if="authorization.state === 3">Rechazada</p>
            <p v-else-if="authorization.state === 4">Vencida</p>
            <p v-if="authorization.state === 3 && authorization.rejection_reason">
            <strong>Motivo del rechazo:</strong> {{ authorization.rejection_reason }}
            </p>
          </div>
        </div>
        <div class="bottom-button" v-if="userStore.user?.role_id != 3">
            <CustomButton expand="block" color="medium" @click="cancel">Volver</CustomButton>
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


        <div class="buttons" v-if="userStore.user?.role_id === 3 && authorization?.state === 1">
          <CustomButton expand="block" color="medium" @click="cancel">Volver</CustomButton>
          <CustomButton color="danger" class="btnReject" @click="showRejectAlert = true">Rechazar</CustomButton>
          <CustomButton color="success" class="btnApprove" @click="showApproveAlert = true">Aprobar</CustomButton>
        </div>
      </div>
      <IonAlert
      :is-open="showApproveAlert"
      header="Confirmación"
      message="¿Estás seguro que deseas aprobar la habilitación?"
      :buttons="[
        {
          text: 'Sí',
          handler: approveAuthorization,
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => (showApproveAlert = false),
        },
      ]"
    />
    <IonAlert
    :is-open="showRejectAlert"
    header="Motivo del rechazo"
    message="Por favor, ingrese el motivo del rechazo:"
    :inputs="[
      {
        name: 'reason',
        type: 'textarea',
        placeholder: 'Escriba el motivo aquí...',
      },
    ]"
    :buttons="[
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => (showRejectAlert = false),
      },
      {
        text: 'Rechazar',
        handler: handleReject,
      }
    ]"

  />

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTitle, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonToast, IonAlert } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { ref, watchEffect } from 'vue';
import { getAuthorizationById, getUser, putAuthorization, postTrip } from '@/services/api';
import CustomButton from '@/components/CustomButton.vue';
import { useUserStore } from '@/store/user';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { formatDate } from '@/utils/utils';

const route = useRoute();
const id = ref<number>(Number(route.params.id));
const errorMessage = ref<string | undefined>(undefined);
const showToast = ref(false);
const message = ref<string | null>(null);
const showApproveAlert = ref(false);
const showRejectAlert = ref(false);
const rejectionReason = ref('');
const cancel = () => {
  window.location.href = '/authorization';
};
const toastColor = ref<'success' | 'danger'>('success');

interface User {
  full_name: string;
  role_id: number;
}

const userStore = useUserStore();

const loadUser = async () => {
  const token = userStore.token;
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

function handleReject(data: any) {
  if (!data.reason || data.reason.trim() === '') {
    toastColor.value = 'danger';
    message.value = 'Debe ingresar un motivo para rechazar.';
    showToast.value = true;
    return false;
  }
  rejectionReason.value = data.reason;
  rejectAuthorization();
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

const approveAuthorization = async () => {
  try {
    const token = userStore.token;

    if (!token) {
      console.error("El token es nulo. No se puede aprobar la habilitación.");
      return;
    }

    const editedAuthorization = {
      state: 2,
    };

    const authorizationResponse = await putAuthorization(editedAuthorization, id.value, token);

    if (authorizationResponse) {
      toastColor.value = 'success';
      showToast.value = true;
      message.value = "Habilitación aprobada correctamente.";

      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 1); 

      const dueDateVehicle = new Date(authorization.value?.due_date_vehicle || '');
      const dueDateDriver = new Date(authorization.value?.due_date_driver || '');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const endDate = dueDateVehicle < dueDateDriver ? dueDateVehicle : dueDateDriver;

      tomorrow.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.ceil((endDate.getTime() - tomorrow.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        errorMessage.value = "La habilitación vence antes de mañana. No se pueden crear viajes.";
        return;
      }

      for (let i = 0; i <= daysDiff; i++) {
        const tripDate = new Date(baseDate);
        tripDate.setDate(baseDate.getDate() + i);
        const formattedDate = tripDate.toISOString().split("T")[0]; // yyyy-mm-dd

        const trip = {
          authorization: id.value,
          available_capacity: authorization.value?.vehicle_capacity ?? 0,
          date: formattedDate,
        };

        try {
          const tripResponse = await postTrip(trip, token);
          if (!tripResponse){
            console.error(`Error al crear el viaje para ${formattedDate}`);
            errorMessage.value = "Error al crear uno de los viajes. Inténtalo nuevamente.";
            break;
          }
        } catch (e) {
          console.error(`Error al crear viaje para ${formattedDate}`, e);
          errorMessage.value = "Ocurrió un error al crear uno de los viajes.";
          break;
        }
      }
      window.location.href = '/authorization';

    } else {
      errorMessage.value = "Error al aprobar la habilitación. Inténtalo nuevamente.";
    }
  } catch (error) {
    console.error("Error al aprobar la habilitación", error);
  } finally {
    loadAuthorization();
  }
};

const rejectAuthorization = async () => {
  try {
    const token = userStore.token;

    if (!token) {
      console.error("El token es nulo. No se puede rechazar la habilitación.");
      return;
    }

    const editedAuthorization = {
      state: 3,
      rejection_reason: rejectionReason.value, 
    };

    const authorizationResponse = await putAuthorization(editedAuthorization, id.value, token);

    if (authorizationResponse) {
      toastColor.value = 'success';
      showToast.value = true;
      message.value = "Habilitación rechazada correctamente.";

      window.location.href = '/authorization';
    } else {
      errorMessage.value = "Error al rechazar la habilitación. Inténtalo nuevamente.";
    }
  } catch (error) {
    console.error("Error al rechazar la habilitación", error);
  } finally {
    rejectionReason.value = ''; 
    showRejectAlert.value = false;
    loadAuthorization();
  }
};

</script>

<style scoped>
.page {
  left: 0;
  bottom: 0;
  right: 0;
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

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.5rem;
  bottom: 0;
}

.bottom-button {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
}

.btnApprove,
.btnReject {
  border: none;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
}

.error {
  display: flex;
  justify-content: center;
}
</style>