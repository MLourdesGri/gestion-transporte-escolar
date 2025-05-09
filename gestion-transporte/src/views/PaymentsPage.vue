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
      <ion-card v-for="payment in payments" :key="payment.userId + payment.month">
        <ion-card-header>
          <ion-card-title>Pago a {{ payment.full_name }}</ion-card-title>
          <ion-card-subtitle>{{ formatMonthName(payment.month) }}</ion-card-subtitle>
          <ion-card-subtitle>Total a pagar: <strong>${{ parseFloat(payment.totalAmount).toFixed(2) }}</strong></ion-card-subtitle>
          <ion-card-subtitle>CBU: {{ payment.ubc }}</ion-card-subtitle>
        </ion-card-header>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButtons,
  IonMenuButton
} from '@ionic/vue';
import { getPaymentsByDriver} from "../services/api"; 
import { useUserStore } from '@/store/user';
import { formatMonthName } from '@/utils/utils';

const payments = ref([]);
const formattedMonth = ref('');
const userStore = useUserStore();

const getPreviousMonth = () => {
  const today = new Date();
  today.setMonth(today.getMonth() - 1);
  return today.toISOString().slice(0, 7); // "YYYY-MM"
};

onMounted(async () => {
  const month = getPreviousMonth();
  formattedMonth.value = month;
  const token = userStore.token;

  try {
    const paymentResponse = await getPaymentsByDriver(token); // Declare paymentResponse
    if (paymentResponse) {
      payments.value = paymentResponse.data;
    } else {
      console.error('Error fetching payments', paymentResponse);
    }
  } catch (err) {
    console.error('Error fetching payments', err);
  }
});

</script>
