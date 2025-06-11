<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Historial de pagos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <template v-if="isLoading">
        <LoadingSpinner />
      </template>

      <template v-else-if="filteredAllPayments.length > 0 && userStore.user?.role_id === 3">
        <DateFilters
        :showDriverFilter="true"
        :shownDayFilter="false"
        :modelValueDay="selectedDay"
        :modelValueMonth="selectedMonth"
        :modelValueYear="selectedYear"
        :modelValueDriver="selectedDriver"
        :drivers="drivers"
        @update:modelValueDay="updateDay"
        @update:modelValueMonth="updateMonth"
        @update:modelValueYear="updateYear"
        @update:modelValueDriver="updateDriver"
        @filter="handleFilter"
        />

        <ion-card v-for="payment in filteredAllPayments" :key="payment.userId + payment.month">
          <ion-card-header>
            <ion-card-title>Pago a {{ payment.full_name }}</ion-card-title>
            <ion-card-subtitle>{{ formatMonthName(payment.month) }}</ion-card-subtitle>
            <ion-card-subtitle>Total a pagar: <strong>${{ parseFloat(payment.totalAmount).toFixed(2) }}</strong></ion-card-subtitle>
            <ion-card-subtitle>CBU: {{ payment.ubc }}</ion-card-subtitle>
            <ion-card-subtitle>Estado: {{ payment.is_paid === 1 ? 'Pagado' : 'No pagado' }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else>
        <DateFilters
        :showDriverFilter="false"
        :shownDayFilter="false"
        :modelValueDay="selectedDay"
        :modelValueMonth="selectedMonth"
        :modelValueYear="selectedYear"
        :modelValueDriver="selectedDriver"
        @update:modelValueDay="updateDay"
        @update:modelValueMonth="updateMonth"
        @update:modelValueYear="updateYear"
        @update:modelValueDriver="updateDriver"
        @filter="handleFilter"
        />
        
        <div class="no-trips">
          <p>No hay pagos registrados.</p>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle } from '@ionic/vue';
import { computed, ref, watch } from "vue";
import {  getAllPayments } from "../services/api"; 
import { useUserStore } from '@/store/user';
import { formatMonthName, redirectIfNoToken } from '@/utils/utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import DateFilters from '@/components/DateFilters.vue';

const showAlert = ref(false);
const payments = ref<PaymentResponse[]>([]);
const userStore = useUserStore();
const isLoading = ref(true);
const filteredAllPayments = ref<PaymentResponse[]>([]);

interface PaymentResponse {
  userId: string;
  month: string;
  full_name: string;
  totalAmount: string;
  ubc: string;
  is_paid: number;
}

const loadpayments = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    payments.value = [];
    filteredAllPayments.value = [];

    const paymentResponse = await getAllPayments() as { data: PaymentResponse[] };
    const paymentData = paymentResponse.data ?? [];

    const paymentArray = Array.isArray(paymentData)
      ? paymentData
      : [paymentData];

    const tempList: PaymentResponse[] = [];

    for (const trip of paymentArray) {
      tempList.push({
        userId: trip.userId,
        month: trip.month,
        full_name: trip.full_name,
        totalAmount: trip.totalAmount,
        ubc: trip.ubc,
        is_paid: trip.is_paid,
      });
    }

    payments.value = tempList;
    filteredAllPayments.value = [...tempList];
  } catch (error) {
    console.error("Error cargando viajes", error);
    payments.value = [];
    filteredAllPayments.value = [];
  }
}

// Redirect if no token
redirectIfNoToken();

watch(
  () => userStore.user,
  async (newUser) => {
    if (newUser) {
      if (newUser.is_confirmed == 0) {
        showAlert.value = true;
      }

      loadpayments()

      isLoading.value = false;
    }
  },
  { immediate: true }
);

const selectedDay = ref<number | null>(null);
const selectedMonth = ref<number | null>(null);
const selectedYear = ref<number | null>(null);
const selectedDriver = ref<string | null>(null);

function updateDay(val: number | null) {
  selectedDay.value = val;
}

function updateMonth(val: number | null) {
  selectedMonth.value = val;
}

function updateYear(val: number | null) {
  selectedYear.value = val;
}

function updateDriver(val: string | null) {
  selectedDriver.value = val;
}

const drivers = computed<string[]>(() => {
  const names = new Set<string>();
  if (payments.value && payments.value.length > 0) {
    for (const trip of payments.value) {
      if (trip.full_name) {
        names.add(trip.full_name);
      }
    }
  }
  return Array.from(names);
});

interface FilterCriteria {
  day: number | null;
  month: number | null;
  year: number | null;
  driver?: string | null;
}

const handleFilter = (filters: FilterCriteria) => {
  filteredAllPayments.value = payments.value.filter(trip => {
      const tripDate = new Date(trip.month);
      const month = tripDate.getUTCMonth() + 1;
      const year = tripDate.getUTCFullYear();

      const matchMonth = !filters.month || month === filters.month;
      const matchYear = !filters.year || year === filters.year;

      const matchDriver = !filters.driver ||
                          (trip.full_name &&
                           trip.full_name === filters.driver);

      return matchMonth && matchYear && matchDriver;
    });
};
</script>

<style scoped>
.no-trips {
  text-align: center;
  padding: 20px;
  color: gray;
  font-size: 18px;
}
.custom-fab {
  --background: #003366;
  --background-hover: #002244;
  --color: white;
}
.custom-menu {
  --color: #003366;
}
</style>