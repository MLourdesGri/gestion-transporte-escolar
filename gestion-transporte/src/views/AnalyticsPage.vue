<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Reportes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <v-chart
        v-if="showChart"
        :option="chartOptions"
        autoresize
        style="height: 300px; width: 100%;"
        @click="onStatusClick"
      />

      <v-chart
        v-if="showChart"
        :option="monthlyChartOptions"
        autoresize
        style="height: 300px; width: 100%; margin-top: 20px;"
        @click="onMonthClick"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonTitle } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { getTripByUser } from '@/services/api';
import { ref, onMounted } from 'vue';
import { use } from 'echarts/core';
import VChart from 'vue-echarts';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

const userStore = useUserStore();

interface Trip {
  trip_id: number;
  date: string;
  status: string;
}

const trips = ref<Trip[]>([]);
const chartOptions = ref({});
const monthlyChartOptions = ref({});
const showChart = ref(false);

const selectedFilters = ref<{ status: string | null, month: string | null }>({
  status: null,
  month: null
});

const getFilteredTrips = () => {
  return trips.value.filter(trip => {
    const matchesStatus = !selectedFilters.value.status || trip.status === selectedFilters.value.status;
    const matchesMonth = !selectedFilters.value.month || trip.date.startsWith(selectedFilters.value.month);
    return matchesStatus && matchesMonth;
  });
};

const ChartTripsStatus = () => {
  const statusCount: Record<string, number> = {};
  const filteredTrips = getFilteredTrips();

  for (const trip of filteredTrips) {
    statusCount[trip.status] = (statusCount[trip.status] || 0) + 1;
  }

  chartOptions.value = {
    title: { text: 'Cantidad de viajes por estado' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Object.keys(statusCount) },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { formatter: '{value}' }
    },
    series: [
      {
        name: 'Viajes',
        type: 'bar',
        data: Object.values(statusCount),
        itemStyle: { color: '#4caf50' }
      }
    ]
  };
};

const ChartTripsMonthly = () => {
  const tripsByMonth: Record<string, number> = {};
  const filteredTrips = getFilteredTrips();

  for (const trip of filteredTrips) {
    const month = trip.date.slice(0, 7); // YYYY-MM
    tripsByMonth[month] = (tripsByMonth[month] || 0) + 1;
  }

  monthlyChartOptions.value = {
    title: { text: 'Cantidad de viajes por mes' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Object.keys(tripsByMonth).sort() },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { formatter: '{value}' }
    },
    series: [
      {
        name: 'Viajes',
        type: 'bar',
        data: Object.values(tripsByMonth),
        itemStyle: { color: '#2196f3' }
      }
    ]
  };
};

const updateAllCharts = () => {
  ChartTripsStatus();
  ChartTripsMonthly();
};

const onStatusClick = (params: any) => {
  selectedFilters.value.status = selectedFilters.value.status === params.name ? null : params.name;
  updateAllCharts();
};

const onMonthClick = (params: any) => {
  selectedFilters.value.month = selectedFilters.value.month === params.name ? null : params.name;
  updateAllCharts();
};

const loadInformation = async () => {
  const token = userStore.token;
  if (!token) return;

  if (userStore.user?.role_id === 2) {
    try {
      trips.value = [];

      const tripResponse = await getTripByUser(token) as { data: Trip[] };
      const tripData = tripResponse.data ?? [];

      const tripArray = Array.isArray(tripData) ? tripData : [tripData];
      trips.value = tripArray.map(trip => ({
        trip_id: trip.trip_id,
        date: trip.date,
        status: trip.status
      }));

      console.log('Viajes cargados:', trips.value);

      setTimeout(() => {
        updateAllCharts();
        showChart.value = true;
      }, 300);
    } catch (error) {
      console.error("Error cargando viajes", error);
      trips.value = [];
    }
  }
};

onMounted(() => {
  loadInformation();
});
</script>
