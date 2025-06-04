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
      <div v-if="userStore.user?.role_id === 2">
        <v-chart
        v-if="showChart"
        :option="chartOptions"
        autoresize
        style="height: 300px; width: 100%;"
        @click="onStatusClick"
        />
        <br />
        <v-chart
          v-if="showChart"
          :option="dailyChartOptions"
          autoresize
          style="height: 300px; width: 100%; margin-top: 20px;"
          @click="onMonthClick"
        />
        <ion-card class="average-card">
          <ion-card-header>
            <ion-card-title class="title">Promedio de niños por viaje</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="average-number">{{ averageChildrenPerTrip }}</div>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-else>
        <v-chart
        v-if="showChart"
        :option="chartOptions"
        autoresize
        style="height: 300px; width: 100%;"
        @click="onStatusClick"
        />
        <br />
        <VChart
        v-if="showChart" 
        :option="dailyChartOptions"
        autoresize
        style="height: 300px; width: 100%;" />
        <ion-card class="average-card">
          <ion-card-header>
            <ion-card-title class="title">Cantidad de choferes</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="average-number">{{ totalDrivers }}</div>
          </ion-card-content>
        </ion-card>
      </div>   
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue';
import { useUserStore } from '@/store/user';
import { getAllAuthorizations, getTripsByDriver } from '@/services/api';
import { ref, onMounted } from 'vue';
import { use } from 'echarts/core';
import VChart from 'vue-echarts';
import { BarChart } from 'echarts/charts';
import { PieChart } from 'echarts/charts';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { computed } from 'vue';

use([BarChart, PieChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

const userStore = useUserStore();

interface Trip {
  trip_id: number;
  date: string;
  status: string;
  childrenCount: number
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

const trips = ref<Trip[]>([]);
const auths = ref<Authorization[]>([]);
const chartOptions = ref({});
const dailyChartOptions = ref({});
const showChart = ref(false);

const selectedFilters = ref<{ status: string | null, month: string | null,  }>({
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

const getFilteredAuthorizations = () => {
  return auths.value.filter(auth => {
    const statusLabels: Record<number, string> = {
      1: 'Pendiente',
      2: 'Aprobada',
      3: 'Rechazada',
      4: 'Vencida',
    };

    const label = statusLabels[auth.state];
    const dueDate = auth.due_date_vehicle?.split('T')[0];
    const month = dueDate?.slice(0, 7); // "YYYY-MM"

    const matchesStatus = !selectedFilters.value.status || selectedFilters.value.status === label;
    const matchesMonth = !selectedFilters.value.month || selectedFilters.value.month === month;

    return matchesStatus && matchesMonth;
  });
};

const ChartTripsStatus = () => {
  const statusLabels: Record<string, string> = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'rejected': 'Rechazado',
  };

  const statusCount: Record<string, number> = {};

  const filteredTrips = getFilteredTrips();

  for (const trip of filteredTrips) {
    const label = statusLabels[trip.status];
    statusCount[label] = (statusCount[label] || 0) + 1;
  }

  chartOptions.value = {
    title: { text: 'Distribución de viajes por estado', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', top: 'bottom' },
    series: [
      {
        name: 'Viajes',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: Object.entries(statusCount).map(([status, count]) => ({
          name: status,
          value: count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{c}', // muestra cantidad
          position: 'inside',
          color: '#fff'
        }
      }
    ]
  };
};

const ChartChildrenOverTime = () => {
  const filteredTrips = getFilteredTrips();

  const groupedByDate: Record<string, number> = {};

  for (const trip of filteredTrips) {
    const date = trip.date.split('T')[0];
    groupedByDate[date] = (groupedByDate[date] || 0) + trip.childrenCount;
  }

  const dates = Object.keys(groupedByDate).sort();
  const data = dates.map(date => groupedByDate[date]);

  dailyChartOptions.value = {
    title: {
      text: 'Niños transportados por fecha',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates.map(date => {
        const [, month, day] = date.split('-');
        return `${day}/${month}`;
      }),
      name: 'Fecha',
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: 'Cant. de niños'
    },
    series: [
      {
        name: 'Niños',
        type: 'line',
        data,
        smooth: true,
        lineStyle: {
          color: '#3ba272',
          width: 2
        },
        itemStyle: {
          color: '#3ba272'
        },
        areaStyle: {
          color: 'rgba(59, 162, 114, 0.2)' // Sombra debajo de la línea
        }
      }
    ],
    legend: {
      bottom: '0'
    }
  };
};

const ChartAuthorizationsStatus = () => {
  const statusLabels: Record<number, string> = {
    1: 'Pendiente',
    2: 'Aprobada',
    3: 'Rechazada',
    4: 'Vencida',
  };

  const statusCount: Record<string, number> = {};

  const filteredAuths = getFilteredAuthorizations();

  for (const auth of filteredAuths) {
    const label = statusLabels[auth.state];
    statusCount[label] = (statusCount[label] || 0) + 1;
  }

  chartOptions.value = {
    title: { text: 'Distribución de autorizaciones por estado', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', top: 'bottom' },
    series: [
      {
        name: 'Autorizaciones',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: Object.entries(statusCount).map(([status, count]) => ({
          name: status,
          value: count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{c}',
          position: 'inside',
          color: '#fff'
        }
      }
    ]
  };
};

const ChartAuthorizationsByExpirationMonth = () => {
  const filteredAuths = getFilteredAuthorizations();

  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const expirationCount: Record<string, number> = {};

  for (const auth of filteredAuths) {
    const date = auth.due_date_vehicle?.split('T')[0];
    if (!date) continue;

    const [year, month] = date.split('-');
    const label = `${monthNames[Number(month) - 1]} ${year}`;
    expirationCount[label] = (expirationCount[label] || 0) + 1;
  }

  const sortedMonths = Object.keys(expirationCount).sort((a, b) => {
    // Ordenar por año y mes
    const [mA, yA] = a.split(' ');
    const [mB, yB] = b.split(' ');
    const idxA = monthNames.indexOf(mA);
    const idxB = monthNames.indexOf(mB);
    return yA === yB ? idxA - idxB : Number(yA) - Number(yB);
  });

  dailyChartOptions.value = {
    title: {
      text: 'Autorizaciones por mes de vencimiento',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: sortedMonths,
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: 'Cantidad'
    },
    series: [
      {
        name: 'Autorizaciones',
        type: 'bar',
        data: sortedMonths.map(month => expirationCount[month]),
        itemStyle: {
          color: '#5470c6'
        }
      }
    ],
  };
};

const updateAllCharts = () => {
  if (userStore.user?.role_id === 2) {
    ChartTripsStatus();
    ChartChildrenOverTime();
  } else {
    ChartAuthorizationsStatus();
    ChartAuthorizationsByExpirationMonth();
  }
};

const onStatusClick = (params: any) => {
  selectedFilters.value.status = selectedFilters.value.status === params.name ? null : params.name;
  updateAllCharts();
};

const onMonthClick = (params: any) => {
  selectedFilters.value.month = selectedFilters.value.month === params.name ? null : params.name;
  updateAllCharts();
};

const loadInformationForDriver = async () => {
  const token = userStore.token;
  if (!token) return;

  if (userStore.user?.role_id === 2) {
    try {
      trips.value = [];

      const tripResponse = await getTripsByDriver(token) as { data: Trip[] };
      const tripData = tripResponse.data ?? [];

      console.log('Datos de viajes:', tripData);

      const tripArray = Array.isArray(tripData) ? tripData : [tripData];
      trips.value = tripArray.map(trip => ({
        trip_id: trip.trip_id,
        date: trip.date,
        status: trip.status,
        childrenCount: trip.childrenCount || 0
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

const loadInformationForAdmin = async () => {
  const token = userStore.token;
  if (!token) return;

  if (userStore.user?.role_id === 3) {
    try {
      auths.value = [];

      const authResponse = await getAllAuthorizations() as { data: Authorization[] }; //
      const authData = authResponse.data ?? [];

      const authArray = Array.isArray(authData) ? authData : [authData];
      auths.value = authArray.map(auth => ({
        authorization_id: auth.authorization_id,
        vehicle_make: auth.vehicle_make,
        vehicle_model: auth.vehicle_model,
        vehicle_year: auth.vehicle_year,
        vehicle_license_plate: auth.vehicle_license_plate,
        vehicle_capacity: auth.vehicle_capacity,
        due_date_vehicle: auth.due_date_vehicle,
        due_date_driver: auth.due_date_driver,
        address: auth.address,
        phone: auth.phone,
        driver_name: auth.driver_name,
        vehicle_authorization_pdf: auth.vehicle_authorization_pdf,
        driver_authorization_pdf: auth.driver_authorization_pdf,
        state: auth.state,
        rejection_reason: auth.rejection_reason
      }));

      console.log('Habilitaciones cargadas:', auths.value);

      setTimeout(() => {
        updateAllCharts();
        showChart.value = true;
      }, 300);
    } catch (error) {
      console.error("Error cargando habilitaciones", error);
      auths.value = [];
    }
  }
};

const averageChildrenPerTrip = computed(() => {
  const filtered = getFilteredTrips();
  if (filtered.length === 0) return 0;

  const totalChildren = filtered.reduce((sum, trip) => sum + (Number(trip.childrenCount) || 0), 0);
  return (totalChildren / filtered.length).toFixed(2);
});

const totalDrivers = computed(() => {
  const uniqueDrivers = new Set(auths.value.map(auth => auth.driver_name));
  return uniqueDrivers.size;
});

onMounted(() => {
  const roleId = userStore.user?.role_id;
  if (roleId === 2) {
    loadInformationForDriver();
  } else if (roleId === 3) {
    loadInformationForAdmin();
  }
});
</script>

<style scoped>
.average-card {
  width: 80%;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background-color: #18181b;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.4);
  margin-left: auto;
  margin-right: auto;
}

.title {
  color: #747474af;
  font-size: 1rem;
  font-weight: 600;
}

.average-number {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}
</style>