<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Historial de viajes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <template v-if="isLoading">
        <LoadingSpinner />
      </template>
      
      <template v-else-if="filteredTripAndChildren.length > 0 && userStore.user?.role_id === 1">
        <DateFilters
        :showDriverFilter="false"
        :shownDayFilter="true"
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

        <ion-card v-for="trip in filteredTripAndChildren" :key="trip.trip_child_id" :button="true" @click="getTripChildDetails(trip.trip_child_id)">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.school_name }} </ion-card-title>
            <ion-card-subtitle>Alumno: {{ trip.name }} {{ trip.last_name }}</ion-card-subtitle>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Turno: {{ formatShift(trip.school_shift) }}</ion-card-subtitle>
            <ion-card-subtitle>Estado: {{ formatTripStatus(trip.status) }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else-if="filteredTrips.length > 0 && userStore.user?.role_id === 2">
        <DateFilters
        :showDriverFilter="false"
        :shownDayFilter="true"
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

        <ion-card v-for="trip in filteredTrips" :key="trip.trip_id" :button="true" @click="getTripDetails(trip.trip_id)">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.authorization.school_name}} </ion-card-title>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Turno: {{ formatShift(trip.authorization.work_shift) }}</ion-card-subtitle>
            <ion-card-subtitle>Estado del viaje: {{ formatTripStatus(trip.status) }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </template>

      <template v-else-if="filteredAllTrips.length > 0 && userStore.user?.role_id === 3">
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

        <ion-card v-for="trip in filteredAllTrips" :key="trip.trip_id" :button="true" @click="getTripDetails(trip.trip_id)">
          <ion-card-header>
            <ion-card-title>Transporte a {{ trip.authorization.school_name}} </ion-card-title>
            <ion-card-subtitle>Chofer: {{ trip.authorization.driver_name }}</ion-card-subtitle>
            <ion-card-subtitle>Fecha: {{ formatDate(trip.date) }}</ion-card-subtitle>
            <ion-card-subtitle>Turno: {{ formatShift(trip.authorization.work_shift) }}</ion-card-subtitle>
            <ion-card-subtitle>Estado del viaje: {{ formatTripStatus(trip.status) }}</ion-card-subtitle>
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
          <p>No hay viajes registrados.</p>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle } from '@ionic/vue';
import { computed, ref, watch } from "vue";
import {  getAllTrips, getTripByUser, getTripChildByUserId } from "../services/api"; 
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { formatDate, formatShift, formatTripStatus, redirectIfNoToken } from '@/utils/utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import DateFilters from '@/components/DateFilters.vue';

interface Trip_Child {
  trip_child_id: number;
  trip: Trip;
  child: Child;
}

interface Trip{
    trip_id: number;
    date: string;
    status: string;
    authorization: Authorization;
  }

interface Authorization{
  driver_name: string;
  authorization_id: number;
  school_name:string;
  school_address: string;
  work_shift: string;
  state: number;
  user_id: number;
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

  interface TripAndChildren{
    trip_child_id: number;
    trip_id: number;
    date: string;
    status: string;
    child_id: number;
    name: string;
    last_name: string;
    school_name: string;
    school_address: string;
    school_shift: string;
  }


const showAlert = ref(false);
const tripandchildren = ref<TripAndChildren[]>([]);
const trips = ref<Trip[]>([]);
const alltrips = ref<Trip[]>([]);
const userStore = useUserStore();
const isLoading = ref(true);
const filteredTrips = ref<Trip[]>([]);
const filteredAllTrips = ref<Trip[]>([]);
const filteredTripAndChildren = ref<TripAndChildren[]>([]);

const loadTripAndChildren = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    tripandchildren.value = [];
    filteredTripAndChildren.value = [];

    const tripChildResponse = await getTripChildByUserId(token) as { data: Trip_Child[] };
    const tripChildData = tripChildResponse.data ?? [];

    const tripChildArray = Array.isArray(tripChildData)
      ? tripChildData
      : [tripChildData];

    const seenTripChildIds = new Set();
    const tempList: TripAndChildren[] = [];

    for (const tripChild of tripChildArray) {
      if (!seenTripChildIds.has(tripChild.trip_child_id)) {
        seenTripChildIds.add(tripChild.trip_child_id);
        tempList.push({
          trip_child_id: tripChild.trip_child_id,
          trip_id: tripChild.trip.trip_id,
          date: tripChild.trip.date,
          status: tripChild.trip.status,
          child_id: tripChild.child.child_id,
          name: tripChild.child.name,
          last_name: tripChild.child.last_name,
          school_name: tripChild.child.school_name,
          school_address: tripChild.child.school_address,
          school_shift: tripChild.child.school_shift
        });
      }
    }

    tripandchildren.value = tempList;
    filteredTripAndChildren.value = [...tempList];
  } catch (error) {
    console.error("Error cargando viajes", error);
    tripandchildren.value = [];
    filteredTripAndChildren.value = [];
  }
};

const loadTrips = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    trips.value = [];
    filteredTrips.value = [];

    const tripResponse = await getTripByUser(token) as { data: Trip[] };
    const tripData = tripResponse.data ?? [];

    const tripArray = Array.isArray(tripData) ? tripData : [tripData];

    const tempList: Trip[] = [];

    for (const trip of tripArray) {
      tempList.push({
        trip_id: trip.trip_id,
        date: trip.date,
        status: trip.status,
        authorization: trip.authorization,
      });
    }

    trips.value = tempList;
    filteredTrips.value = [...tempList];

  } catch (error) {
    console.error("Error cargando viajes", error);
    trips.value = [];
    filteredTrips.value = [];
  }
};

const loadAllTrips = async () => {
  const token = userStore.token;
  if (!token) return;

  try {
    alltrips.value = [];
    filteredAllTrips.value = [];

    const tripResponse = await getAllTrips() as { data: Trip[] };
    const tripData = tripResponse.data ?? [];

    const tripArray = Array.isArray(tripData) ? tripData : [tripData];

    const tempList: Trip[] = [];

    for (const trip of tripArray) {
      tempList.push({
        trip_id: trip.trip_id,
        date: trip.date,
        status: trip.status,
        authorization: trip.authorization,
      });
    }

    alltrips.value = tempList;
    filteredAllTrips.value = [...tempList];

  } catch (error) {
    console.error("Error cargando viajes", error);
    alltrips.value = [];
    filteredAllTrips.value = [];
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
        await loadTripAndChildren();
      } else if (newUser.role_id === 2) {
        await loadTrips();
      } else {
        await loadAllTrips();
      }
      isLoading.value = false;
    }
  },
  { immediate: true }
);

const router = useRouter();

const getTripChildDetails = (trip_child_id: number) => {
  router.push(`trips-history/child/${trip_child_id}`); 
};

const getTripDetails = (trip_id: number) => {
  router.push(`trips-history/${trip_id}`); 
};

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
  if (alltrips.value && alltrips.value.length > 0) {
    for (const trip of alltrips.value) {
      if (trip.authorization && trip.authorization.driver_name) {
        names.add(trip.authorization.driver_name);
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
  const role = userStore.user?.role_id;

  if (role === 1) {
    filteredTripAndChildren.value = tripandchildren.value.filter(trip => {
      const tripDate = new Date(trip.date);
      const day = tripDate.getUTCDate();
      const month = tripDate.getUTCMonth() + 1;
      const year = tripDate.getUTCFullYear();

      const matchDay = !filters.day || day === filters.day;
      const matchMonth = !filters.month || month === filters.month;
      const matchYear = !filters.year || year === filters.year;

      return matchDay && matchMonth && matchYear;
    });
  } else if (role === 2) {
    filteredTrips.value = trips.value.filter(trip => {
      const tripDate = new Date(trip.date);
      const day = tripDate.getUTCDate();
      const month = tripDate.getUTCMonth() + 1;
      const year = tripDate.getUTCFullYear();

      const matchDay = !filters.day || day === filters.day;
      const matchMonth = !filters.month || month === filters.month;
      const matchYear = !filters.year || year === filters.year;

      return matchDay && matchMonth && matchYear;
    });
  } else if (role === 3) {
    filteredAllTrips.value = alltrips.value.filter(trip => {
      const tripDate = new Date(trip.date);
      const day = tripDate.getUTCDate();
      const month = tripDate.getUTCMonth() + 1;
      const year = tripDate.getUTCFullYear();

      const matchDay = !filters.day || day === filters.day;
      const matchMonth = !filters.month || month === filters.month;
      const matchYear = !filters.year || year === filters.year;

      const matchDriver = !filters.driver ||
                          (trip.authorization && trip.authorization.driver_name &&
                           trip.authorization.driver_name === filters.driver);

      return matchDay && matchMonth && matchYear && matchDriver;
    });
  }
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