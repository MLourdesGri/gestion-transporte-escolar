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
                        <ion-card-subtitle>Escuela: {{ child.school }}</ion-card-subtitle>
                        </ion-card-header>
                    </ion-card>
                </template>
            </div>
  
            <!-- Paso 2: Choferes disponibles-->
            <div v-if="step === 2">
                <ion-title size="large" class="title">Elegir chofer</ion-title>
                <template v-if="drivers.length > 0">
                    <ion-card v-for="driver in drivers" :key="driver.authorization_id" :button="true" @click="selectDriver(driver)" :class="{ selected: currentDriver && currentDriver.authorization_id === driver.authorization_id }">
                        <ion-card-header>
                          <ion-card-title>{{ driver.vehicle_license_plate }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                          <p><strong>Marca:</strong> {{ driver.vehicle_make }}</p>
                          <p><strong>Modelo:</strong> {{ driver.vehicle_model }}</p>
                          <p><strong>Año:</strong> {{ driver.vehicle_year }}</p>
                          <p><strong>Capacidad:</strong> {{ driver.vehicle_capacity }} pasajeros</p>
                        </ion-card-content>
                    </ion-card>
                </template>
            </div>
            
            <!-- Paso 3: Elección de fecha -->
            <div v-if="step === 3">
              <ion-title size="large" class="title">Elige las fechas de transporte</ion-title>

              <!-- Selector -->
              <div class="calendar-container">
              <ion-datetime
                presentation="date"
                :is-date-enabled="isEnabledDate"
                :multiple="true"
                :min="minDate"
                :max="maxDate"
                :highlighted-dates="highlightedNextMonth"
                :value="selectedDates"
                @ionChange="onDateChange"
              />
              </div>
              <ion-checkbox  v-model="includeNextMonth" @ionChange="handleCheckboxChange" label-placement="end" 
              helper-text="Al seccionar se incluiran para transporte los días hábiles del mes siguiente">
                Incluir días hábiles del mes siguiente
              </ion-checkbox>
              <ion-toast
                :is-open="showToast"
                :message="toastMessage"
                duration="3000"
                @didDismiss="showToast = false"
              />
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
                  <p><strong>Turno:</strong> {{ currentChild?.school_shift }}</p>
                  <p><strong>Escuela:</strong> {{ currentChild?.school }}</p>
                  <p><strong>Chofer:</strong> {{ currentDriver?.driver_name}}</p>
                  <p><strong>Días seleccionados:</strong></p>
                  <ul>
                    <li v-for="date in current_days" :key="date">{{ formatDate(date) }}</li>
                  </ul>
                  <p v-if="current_days.length > 0 && price?.weekly_price"><strong>Subtotal:</strong> {{ (price?.weekly_price ?? 0) * current_days.length }} </p>
                  <p v-if="monthFee==1"><strong>Mes posterior:</strong> SI </p>
                  <p v-if="monthFee==1"><strong>Subtotal:</strong> {{ price?.monthly_price }} </p>
                  <p v-if="monthFee==0"><strong>Mes posterior:</strong> NO </p>
                  <p v-if="monthFee==1 && price" style="text-align: end;"><strong>Total:</strong> {{ price.monthly_price + ((price.weekly_price || 0) * current_days.length) }}</p>
                  <p v-if="monthFee==0" style="text-align: end;"><strong>Total:</strong> {{ (price?.weekly_price ?? 0) * current_days.length}}</p>

                </ion-card-content>
              </ion-card>
              
              
            </div>
  
            <ErrorMessage :message="errorMessage" duration="3000" />
            
            <!-- Botones de navegación -->
            <div class="navigation-buttons">
              <CustomButton v-if="step > 1" @click="prevStep" class="btnPrev">Anterior</CustomButton>
              <CustomButton v-if="step < 4" @click="nextStep" class="btnNext">Siguiente</CustomButton>
              <CustomButton v-if="selectedDates.length !=0 && step==4" @click="payWithMercadoPago" class="btnNext">Pagar con Mercado Pago</CustomButton>
              <ion-toast v-if="selectedDates.length==0 || selectChild==null || selectDriver==null" 
              is-open="true"
              message="Debe completar todos los pasos"
              duration="5000"
              color="danger"/>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardHeader, 
    IonCardSubtitle, IonCardTitle, IonCardContent, IonDatetime, IonCheckbox, IonToast} from '@ionic/vue';
import { ref, onMounted, toRaw, computed, watch } from 'vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { createPayment, getChildAuthorizations, getChildrenByUser, getPriceByUserAuthorization, getUser } from '@/services/api';
import { useUserStore } from '@/store/user';
import { formatDate } from '@/utils/utils';

interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school: string;
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
    child_id: number;
    selected_dates: string[];
    month_fee: number;
    qty_days: number;
}

interface User{
  id: number;
}

interface Price{
  monthly_price : number;
  weekly_price : number;
}

const userStore = useUserStore();

onMounted(() => {
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
const includeNextMonth = ref(false);
const showToast = ref(true);
const toastMessage = ref("Seleccione días para transporte del mes corriente");
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const current_days = ref<string[]>([]);
const enabledDates = ref<string[]>([]);

const nextStep = () => {
if (step.value < 4) step.value++;
};

const prevStep = () => {
if (step.value > 1) step.value--;
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
const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();  

const getNextMonthWeekdays = (): string[] => {
  const nextMonth = month + 1;
  const nextYear = nextMonth > 11 ? year + 1 : year;
  const realMonth = nextMonth % 12;
  const daysInMonth = new Date(nextYear, realMonth + 1, 0).getDate();

  const weekdays: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(nextYear, realMonth, day);
    const dow = date.getDay();
    if (dow >= 1 && dow <= 5) {
      weekdays.push(date.toISOString().split("T")[0]);
    }
  }
  return weekdays;
};

const highlightedNextMonth = computed(() => {
  return includeNextMonth.value === true
    ? getNextMonthWeekdays().map(date => ({
        date,
        textColor: 'var(--ion-color-medium)',
        backgroundColor: 'transparent',
      }))
    : [];
});



const monthFee = ref(0); 


const handleCheckboxChange = () => {
  const nextMonthWeekdays = getNextMonthWeekdays();
  const set = new Set(selectedDates.value);

  if (includeNextMonth.value) {
    nextMonthWeekdays.forEach(date => set.add(date));
    monthFee.value = 1;
    toastMessage.value = "Se agregaron automáticamente los días hábiles del mes siguiente.";
  } else {
    nextMonthWeekdays.forEach(date => set.delete(date));
    monthFee.value = 0;
    toastMessage.value = "Seleccione días para transporte del mes corriente";
  }

  selectedDates.value = Array.from(set).sort();
  showToast.value = true;
};


const onDateChange = (ev: any) => {
  const value = ev.detail.value; 
  const nextMonthWeekdays = new Set(getNextMonthWeekdays());

  const filtered = value.filter((date: string) => {
    const isNextMonth = nextMonthWeekdays.has(date);
    if (includeNextMonth.value === false && isNextMonth) return false;
    if (includeNextMonth.value === true && isNextMonth) return false; 
    return true;
  });
  if (includeNextMonth.value === true) {
    getNextMonthWeekdays().forEach(date => filtered.push(date));
  }
  selectedDates.value = Array.from(new Set(filtered)).sort() as string[];
};


const selectChild = (child: Child) => {
    currentChild.value = child;
    loadDriver();
};

const selectDriver = async (driver: Authorization) => {
    currentDriver.value = driver;
    console.log("Choferes disponibles:", currentDriver.value);
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

watch(currentDriver, (newDriver) => {
  if (newDriver && newDriver.trips) {
    const tripDates = newDriver.trips.map((trip: any) => trip.date);
    enabledDates.value = tripDates;
  }
});

const isEnabledDate = (dateString: string) => {
  const formatted = new Date(dateString).toISOString().split("T")[0];
  return enabledDates.value.includes(formatted);
};


watch([selectedDates, step], async ([dates, currentStep]) => {
  if (currentStep === 4) {
    current_days.value = dates.filter(dateStr => {
      const [y, m] = dateStr.split("-").map(Number);
      return y === year && m - 1 === month; 
    })    
  }
});

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
    const userResponse = await getUser(token) as { data: User };
    user.value = userResponse.data;
    const qty_current_days = selectedDates.value.filter(dateStr => {
    const [y, m] = dateStr.split("-").map(Number);
    return y === year && m - 1 === month; 
  }).length;
    trip_child.value= {
        user_id: userResponse.data.id,
        authorization_id: currentDriver.value?.authorization_id || 0,
        child_id: currentChild.value?.child_id || 0,
        selected_dates: toRaw(selectedDates.value),
        month_fee: monthFee.value,
        qty_days: qty_current_days
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
    display: flex;
    justify-content: space-between;
    width: 100%;
    position: absolute;
    bottom: 10px;
    left: 0;
  }
  .title {
    margin-bottom: 20px;
  }
  .btnNext {
    margin-left: auto;
  }
  .btnPay {
    display: flex;
    position: absolute;
    bottom: 10px;
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
</style>
  