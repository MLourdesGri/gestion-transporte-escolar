<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title>Pagos</ion-title>
        </ion-toolbar>
      </ion-header>

    <ion-content class="ion-padding">
    <template v-if="payments.length === 0">
      <div class="no-payments">
          <p>No tienes pagos pendientes.</p>
        </div>
    </template>
    <template v-else>
      <ion-card v-for="payment in payments" :key="payment.userId + payment.month">
        <ion-card-header>
          <ion-card-title>Pago a {{ payment.full_name }}</ion-card-title>
          <ion-card-subtitle>{{ formatMonthName(payment.month) }}</ion-card-subtitle>
          <ion-card-subtitle>Total a pagar: <strong>${{ parseFloat(payment.totalAmount).toFixed(2) }}</strong></ion-card-subtitle>
          <ion-card-subtitle>CBU: {{ payment.ubc }}</ion-card-subtitle>
        </ion-card-header>
        <ion-button v-if="!payment.is_paid" expand="block" color="success" @click="markAsPaid(payment.userId, payment.month)">
          Marcar como pagado
        </ion-button>
        <ion-button v-else expand="block" disabled >
          Pagado
        </ion-button>
      </ion-card>
      <ion-toast
        v-model:isOpen="showToast"
        message="Chofer marcado como pagado"
        position="bottom"
        color="success"
        duration="3000"
      ></ion-toast>
    </template>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonButtons, IonMenuButton, IonButton, IonToast } from '@ionic/vue';
import { getPaymentsByDriver, markTripsAsPaid} from "../services/api"; 
import { useUserStore } from '@/store/user';
import { formatMonthName } from '@/utils/utils';

const payments = ref([]);
const formattedMonth = ref('');
const userStore = useUserStore();
const showToast = ref(false);

const getPreviousMonth = () => {
  const today = new Date();
  today.setMonth(today.getMonth() - 1);
  return today.toISOString().slice(0, 7); 
};

onMounted(async () => {
  loadPayments();
});

const loadPayments = async () => {
  const token = userStore.token;
    if (token) {
      try {
          formattedMonth.value = getPreviousMonth();
          const paymentResponse = await getPaymentsByDriver(token); 
          if (paymentResponse) {
            console.log('Payments fetched successfully', paymentResponse);
            payments.value = paymentResponse.data;
          } else {
            console.error('Error fetching payments', paymentResponse);
          }
        } catch (err) {
          console.error('Error fetching payments', err);
        }
      }
}

const markAsPaid = async (userId, month) => {
  try {
    const token = userStore.token;
    const response = await markTripsAsPaid(userId, month, token);
    if (response && typeof response === 'object' && 'data' in response)
    {
      showToast.value = true;
      loadPayments(); 
    }
  } catch (err) {
    console.error('Error al marcar como pagado', err);
    alert('Error al pagar');
  }
};

</script>

<style>
ion-button {
  margin: 5px;
  --background: #003366;
  --background-hover: #002244;
  --color: white; 
}
.no-payments {
  text-align: center;
  padding: 20px;
  color: gray;
  font-size: 18px;
}

</style>
