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
      
      <template v-else-if="filteredPayments.length > 0 && (userStore.user?.role_id === 1 || userStore.user?.role_id === 2)">
        <DateFilters
        :showDriverFilter="false"
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

        <ion-card v-for="payment in filteredPayments" :key="payment.payment_id" :button="true">
          <ion-card-header>
            <ion-card-title>Pago al chofer {{ payment.driver.full_name }} </ion-card-title>
            <ion-card-subtitle>Pagador: {{ payment.user.full_name }} </ion-card-subtitle>
            <ion-card-subtitle>Fecha: {{ formatDate(payment.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Monto: ${{ payment.amount }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else-if="filteredPayments.length > 0 && userStore.user?.role_id === 3">
        <DateFilters
        :showDriverFilter="true"
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

        <ion-card v-for="payment in filteredPayments" :key="payment.payment_id" :button="true">
          <ion-card-header>
            <ion-card-title>Pago al chofer {{ payment.driver.full_name }} </ion-card-title>
            <ion-card-subtitle>Pagador: {{ payment.user.full_name }} </ion-card-subtitle>
            <ion-card-subtitle>Fecha: {{ formatDate(payment.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Monto: ${{ payment.amount }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else>
        <DateFilters
        :showDriverFilter="false"
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
        
        <div class="no-payments">
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
import { useUserStore } from '@/store/user';
import { formatDate, redirectIfNoToken } from '@/utils/utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import DateFilters from '@/components/DateFilters.vue';

interface User {
  full_name: string;
}

interface Payment {
    payment_id: number;
    amount: number;
    date: string;
    driver: User;
    user: User;
}

const showAlert = ref(false);
const userStore = useUserStore();
const isLoading = ref(true);
const payments = ref<Payment[]>([]);
const filteredPayments = ref<Payment[]>([]);

const loadPaymentsGeneric = async (getPaymentsFn: (token: string) => Promise<{ data: Payment[] | Payment }>) => {
    const token = userStore.token;
    if (!token) return;

    try {
        payments.value = [];
        filteredPayments.value = [];

        const paymentResponse = await getPaymentsFn(token);
        const paymentData = paymentResponse.data ?? [];

        const paymentArray = Array.isArray(paymentData) ? paymentData : [paymentData];

        const tempList: Payment[] = paymentArray.map(payment => ({
        payment_id: payment.payment_id,
        date: payment.date,
        amount: payment.amount,
        driver: payment.driver,
        user: payment.user,
    }));

        payments.value = tempList;
        filteredPayments.value = [...tempList];

    } catch (error) {
       console.error("Error cargando payments", error);
        payments.value = [];
        filteredPayments.value = [];
    }
};

// Redirect if no token
redirectIfNoToken();

watch(
  () => userStore.user,
  async (newUser) => {
    if (newUser) {
      if (newUser.is_confirmed == 0) {
        showAlert.value = true;
      }

      if (newUser.role_id === 1) {
        await loadPaymentsGeneric(getPaymentsByUser);
      } else if (newUser.role_id === 2) {
        await loadPaymentsGeneric(getPaymentsByDriver);
      } else {
        await loadPaymentsGeneric(getAllPayments);
      }
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
    for (const payment of payments.value) {
      if (payment.user && payment.user.full_name) {
        names.add(payment.user.full_name);
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

    filteredPayments.value = payments.value.filter(payment => {
      const paymentDate = new Date(payment.date);
      const day = paymentDate.getUTCDate();
      const month = paymentDate.getUTCMonth() + 1;
      const year = paymentDate.getUTCFullYear();

      const matchDay = !filters.day || day === filters.day;
      const matchMonth = !filters.month || month === filters.month;
      const matchYear = !filters.year || year === filters.year;

      return matchDay && matchMonth && matchYear;
    });
};
</script>

<style scoped>
.no-payments {
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