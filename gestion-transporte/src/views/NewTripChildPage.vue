<template :fullscreen="true">
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
            <ion-title>Nuevo transporte</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content  >
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Nuevo transporte</ion-title>
          </ion-toolbar>
        </ion-header>
  
        <div class="vehicle-box">
          <div>
            <!-- Paso 1: Elegir hijo -->
            <div v-if="step === 1">
                <ion-title size="large" class="title">Elegir hijo</ion-title>
                <template v-if="children.length > 0">
                    <ion-card v-for="child in children" :key="child.child_id" :button="true" @click="selectChild(child)" :class="{ selected: currentChild && currentChild.child_id === child.child_id }">
                        <ion-card-header>
                        <ion-card-title>{{ child.name }} {{ child.last_name }}</ion-card-title>
                        <ion-card-subtitle>Edad: {{ child.age }}</ion-card-subtitle>
                        <ion-card-subtitle>Escuela: {{ child.school_name }}</ion-card-subtitle>
                        </ion-card-header>
                    </ion-card>
                </template>
                <p v-else class="text_cal">No hay tienes hijos registrados.</p>
            </div>
  
            <!-- Paso 2: Choferes disponibles-->
            <div v-if="step === 2">
                <ion-title size="large" class="title">Elegir chofer</ion-title>
                <template v-if="drivers.length > 0">
                    <ion-card v-for="driver in drivers" :key="driver.authorization_id" :button="true" @click="selectDriver(driver)" :class="{ selected: currentDriver && currentDriver.authorization_id === driver.authorization_id }">
                        <ion-card-header>
                          <ion-card-title>{{ driver.driver_name }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                          <p><strong>Patente: </strong> {{ driver.vehicle_license_plate }}</p>
                          <p><strong>Marca:</strong> {{ driver.vehicle_make }}</p>
                          <p><strong>Modelo:</strong> {{ driver.vehicle_model }}</p>
                          <p><strong>Año:</strong> {{ driver.vehicle_year }}</p>
                          <p><strong>Capacidad:</strong> {{ driver.vehicle_capacity }} pasajeros</p>
                        </ion-card-content>
                    </ion-card>
                </template>
                <p v-else class="text_cal">No hay choferes disponibles para este hijo.</p>
            </div>
            
            <!-- Paso 3: Elección de fecha -->
            <div v-if="step === 3">
              <ion-title size="large" class="title">Elige las fechas de transporte</ion-title>

              <!-- Selector -->
              <div class="calendar-container">
              <ion-datetime
                presentation="date"
                :preferWheel="false"
                :value="selectedDates"
                :is-date-enabled="isEnabledDate"
                :multiple="true"
                :min="minDate"
                :max="maxDate"
                @ionChange="handleChange"
                @ionIonChange="onDateChange"
                @ionVisibleMonthChange="onVisibleMonthChange"
              />

              </div>
              <ion-button @click="selectFullMonth" expand="block" class="select-month-button">
                {{ isFullMonthSelected ? 'Deseleccionar mes completo' : 'Seleccionar mes completo' }}
              </ion-button>

              <p class="text_cal">Selecciona las fechas en las que necesitas el transporte.</p>
              <p class="text_cal">Solo aparecen las fechas disponibles para el chofer seleccionado, y las fechas para las que el alumno seleccionado no tiene viaje</p>
            </div>

            <!-- Paso 4: Resumen y Pago MP -->
            <div v-if="step === 4">
              <ion-title size="large" class="title">Realizar el pago</ion-title>
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Resumen de la reserva</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <p><strong>Hijo:</strong> {{ currentChild?.name }} {{ currentChild?.last_name }}</p>
                  <p><strong>Turno:</strong> {{ formatShift(currentChild?.school_shift || '') }}</p>
                  <p><strong>{{ currentChild?.school_name }}</strong></p>
                  <p><strong>Chofer:</strong> {{ currentDriver?.driver_name}}</p>
                  <p><strong>Días seleccionados:</strong></p>
                  <ul>
                    <li v-for="date in sortedSelectedDates" :key="date">{{ formatDate(date) }}</li>
                  </ul>
                  <p><strong>Total:</strong> ${{ totalPrice }}</p>
                </ion-card-content>
              </ion-card>
            </div>
            
            <!-- Botones de navegación -->
            <div slot="fixed" class="navigation-buttons">
              <CustomButton vertical="bottom" horizontal="start" v-if="step > 1" @click="prevStep" class="btnPrev" expand="block">Anterior</CustomButton>
              <CustomButton vertical="bottom" horizontal="end" v-if="step < 4" @click="nextStep" class="btnNext" expand="block">Siguiente</CustomButton>
              <CustomButton v-if="selectedDates.length !=0 && step==4" @click="payWithMercadoPago" class="btnNext" expand="block">Pagar con Mercado Pago</CustomButton>
              <ion-toast
                :is-open="showToast"
                :message="errorMessage"
                duration="3000"
                color="danger"
                @didDismiss="showToast = false"
              />
            </div>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardHeader, 
    IonCardSubtitle, IonCardTitle, IonCardContent, IonDatetime, IonToast, IonButton} from '@ionic/vue';
import { ref, onMounted, toRaw, computed, watch } from 'vue';
import CustomButton from '@/components/CustomButton.vue';
import { createPayment, getChildAuthorizations, getChildrenByUser, getPriceByUserAuthorization, getTripChildByChildId, getUser } from '@/services/api';
import { useUserStore } from '@/store/user';
import { formatDate, formatShift, redirectIfNoToken } from '@/utils/utils';

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
    user: User;
    trips: Trip[];
    driver_name: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_license_plate: string;
    vehicle_capacity: number;
}

interface Trip {
    trip_id: number;
    date: string;
    available_capacity: number;
    status: string;
}

interface Trip_Child{
    user_id: number;
    authorization_id: number;
    trip: Trip;
    child_id: number;
    selected_dates: string[];
}

interface User{
  id: number;
}

interface Price{
  monthly_price : number;
  daily_price : number;
}

const userStore = useUserStore();

onMounted(() => {
  if (redirectIfNoToken()) return;
  loadChildren();
  mercadopago.value = new window.MercadoPago("TEST-eadd1652-39b2-45fb-a417-b7731d105195", { locale: "es-AR" });
});

const step = ref(1); 
const children = ref<Child[]>([]);
const drivers = ref<Authorization[]>([]);
const price = ref<Price | null>(null);
const errorMessage = ref("");
const currentChild = ref<Child | null>(null); 
const currentDriver = ref<Authorization | null>(null);
const trip_child = ref<Trip_Child | null>(null);
const mercadopago = ref<any>(null);
const token = userStore.token;
const selectedDates = ref<string[]>([]);
const today = new Date();
const enabledDates = ref<string[]>([]);
const occupiedDates = ref<string[]>([]);
const showToast = ref(false);

const nextStep = () => {
  if (step.value === 1 && !currentChild.value) {
    errorMessage.value = "Debe seleccionar un hijo.";
    showToast.value = true;
    return;
  }
  if (step.value === 2 && !currentDriver.value) {
    errorMessage.value = "Debe seleccionar un chofer.";
    showToast.value = true;
    return;
  }
  if (step.value === 3 && selectedDates.value.length === 0) {
    errorMessage.value = "Debe seleccionar al menos una fecha.";
    showToast.value = true;
    return;
  }
  if (step.value < 4) step.value++;
};

const prevStep = () => {
if (step.value > 1) step.value--;
};

const visibleMonth = ref<string>(new Date().toISOString().substring(0, 7));
console.log("Visible Month:", visibleMonth.value);

const onDateChange = (event: CustomEvent) => {
  const value = event.detail.value;
  if (!value) return;

  // value puede ser un string o array si es multiple
  const date = Array.isArray(value) ? value[0] : value;
  if (date) {
    const month = date.substring(0, 7); // "YYYY-MM"
    if (month !== visibleMonth.value) {
      visibleMonth.value = month;
    }
  }
};


const selectFullMonth = () => {
  const [yearStr, monthStr] = visibleMonth.value.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1; // Date usa 0-based months

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isoDate = date.toISOString().split("T")[0];

    if (isEnabledDate(isoDate)) {
      monthDates.push(isoDate);
    }
  }

  const allSelected = monthDates.every(date => selectedDates.value.includes(date));

  if (allSelected) {
    selectedDates.value = selectedDates.value.filter(date => !monthDates.includes(date));
  } else {
    const datesToAdd = monthDates.filter(date => !selectedDates.value.includes(date));
    selectedDates.value = [...selectedDates.value, ...datesToAdd];
  }
};

const isFullMonthSelected = computed(() => {
  const [yearStr, monthStr] = visibleMonth.value.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isoDate = date.toISOString().split("T")[0];
    if (isEnabledDate(isoDate)) {
      monthDates.push(isoDate);
    }
  }

  return monthDates.every(date => selectedDates.value.includes(date));
});

const onVisibleMonthChange = (event: CustomEvent) => {
  const visibleMonthStr = event.detail.month; // viene en formato "YYYY-MM"
  if (visibleMonthStr && visibleMonthStr !== visibleMonth.value) {
    visibleMonth.value = visibleMonthStr;
  }
};


const loadChildren = async () => {
if (token) {
    try {
    const childResponse = await getChildrenByUser(token);
    if (childResponse && typeof childResponse === "object" && "data" in childResponse) {
        const childData = childResponse.data;
        children.value = Array.isArray(childData) ? childData : (childData ? [childData] : []);
    } else {
        children.value = [];
    }
    } catch (error) {
    console.error("Error cargando alumnos", error);
    children.value = [];
    }
}
};

const loadDriver = async () => {
const token = userStore.token;
if (token && currentChild.value) {
    try {
    const childId = currentChild.value.child_id;
    const driverResponse = await getChildAuthorizations(childId);
    if (driverResponse && typeof driverResponse === "object" && "data" in driverResponse) {
        const driverData = driverResponse.data;
        console.log("Choferes cargados:", driverData);
        drivers.value = Array.isArray(driverData) ? driverData : (driverData ? [driverData] : []);
    } else {
        drivers.value = [];
    }
    } catch (error) {
    console.error("Error cargando choferes", error);
    drivers.value = [];
    }
}
};

const minDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString(); 
const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString() ; 


const selectChild = async (child: Child) => {
  currentChild.value = child;
  await loadDriver();
  try {
    const response = await getTripChildByChildId(child.child_id) as {data: Trip_Child[]};
    if (response && response.data) {
      const trips = response.data;
      const allDates = trips.flatMap(trip => trip.trip.date);
      occupiedDates.value = allDates.map(date => new Date(date).toISOString().split("T")[0]);
    }
  } catch (error) {
    console.error("Error cargando trips del hijo", error);
    occupiedDates.value = [];
  }
};

const selectDriver = async (driver: Authorization) => {
    currentDriver.value = driver;
    if (token) {
        const priceResponse = await getPriceByUserAuthorization(token, currentDriver.value?.user.id || 0) as {data: Price};
        price.value = priceResponse.data;
    } else {
        console.error("Token is null");
    }
};
const user = ref<User | null>(null);

declare global {
  interface Window {
      MercadoPago: any;
  }
}

const sortedSelectedDates = computed(() => {
  return selectedDates.value.slice().sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
});

watch(currentDriver, (newDriver) => {
  if (newDriver && newDriver.trips) {
    const tripDates = newDriver.trips.map((trip: any) => trip.date);
    enabledDates.value.push(...tripDates);
  }
});

const handleChange = (event : any) => {
      const fechasNuevas = event.detail.value;
      selectedDates.value = fechasNuevas.filter((date: any) => enabledDates.value.includes(date));
    };

const isEnabledDate = (dateString: string) => {
  const date = new Date(dateString);
  const formatted = date.toISOString().split("T")[0];

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

  return (
    enabledDates.value.includes(formatted) && !occupiedDates.value.includes(formatted) && !isWeekend
  );
};

const totalPrice = computed(() => {
  const numDates = selectedDates.value.length
  const weekly = price.value?.daily_price || 0
  const monthly = price.value?.monthly_price || 0

  if (numDates < 20) {
    return numDates * weekly
  } else if (numDates === 20) {
    return monthly
  } else {
    return monthly + (numDates - 20) * weekly
  }
})

const payWithMercadoPago = async () => {
    if (!currentChild.value || !currentDriver.value) {
        errorMessage.value = "Por favor, selecciona un hijo y un chofer antes de proceder al pago.";
        return;
    }
    if (!selectedDates.value.length) {
        errorMessage.value = "Por favor, selecciona al menos una fecha.";
        return;
    }
    const token = userStore.token;
    if (!token) {
        throw new Error('Token is missing');
    }
    const tripDates = currentDriver.value.trips.map((trip: any) => trip.date);
    enabledDates.value = tripDates;
    const userResponse = await getUser(token) as { data: User };
    user.value = userResponse.data;
    trip_child.value= {
        user_id: userResponse.data.id,
        authorization_id: currentDriver.value?.authorization_id || 0,
        trip: { trip_id: 0, date: "", available_capacity: 0, status: "" },
        child_id: currentChild.value?.child_id || 0,
        selected_dates: toRaw(selectedDates.value)
    };
    const response = await createPayment(token, trip_child);
    if (response && typeof response === "object" && "data" in response) {
        const responseData = response.data as { preferenceId: string };
        const mp = new window.MercadoPago("TEST-eadd1652-39b2-45fb-a417-b7731d105195", { locale: "es-AR" });

        mp.checkout({
            preference: {
                id: responseData.preferenceId
            }
        }).open();
    }
};

</script>
  
<style scoped>
  .vehicle-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 10px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  ion-toast {
    margin-bottom: 20px;
  }
  .calendar-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.navigation-buttons {
  position: fixed;
  display: flex;
  justify-content: space-between;
  width: 100%;
  bottom: 0;
  left: 0;
  padding: 10px;
}
.title {
  margin-bottom: 20px;
}
.btnNext {
  margin-left: auto;  
}
  .selected {
  border: 2px solid #003366; 
    }
  .title {
  margin-top: 20px;
  }
  ion-checkbox {
    margin: 10px;

  }
  .text_cal {
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
    color: #666;
  }
</style>
  