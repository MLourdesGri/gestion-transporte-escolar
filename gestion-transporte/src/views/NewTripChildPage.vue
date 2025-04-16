<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
            <ion-title>Nuevo transporte</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true" >
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
              <ion-segment v-model="includeNextMonth" @ionChange="handleSegmentChange">
                <ion-segment-button value="no">
                  <ion-label>Solo este mes</ion-label>
                </ion-segment-button>
                <ion-segment-button value="yes">
                  <ion-label>Incluir mes siguiente</ion-label>
                </ion-segment-button>
              </ion-segment>
              <div class="calendar-container">
              <ion-datetime
                presentation="date"
                :is-date-enabled="isWeekday"
                :multiple="true"
                :min="minDate"
                :max="maxDate"
                :highlighted-dates="highlightedNextMonth"
                :value="selectedDates"
                @ionChange="onDateChange"
              />
              </div>
              <ion-toast
                :is-open="showToast"
                :message="toastMessage"
                duration="5000"
                @didDismiss="showToast = false"
              />
            </div>

            <!-- Paso 4: Pago MP -->
            <div v-if="step === 4">
              <ion-title size="large" class="title">Realizar el pago</ion-title>
              <CustomButton expand="full" @click="payWithMercadoPago">Pagar con Mercado Pago</CustomButton>
            </div>
  
            <ErrorMessage :message="errorMessage" duration="3000" />
            
            <!-- Botones de navegación -->
            <div class="navigation-buttons">
              <CustomButton v-if="step > 1" @click="prevStep" class="btnPrev">Anterior</CustomButton>
              <CustomButton v-if="step < 4" @click="nextStep" class="btnNext">Siguiente</CustomButton>
              <CustomButton v-if="step === 4" @click="saveTrip" class="btnNext">Guardar</CustomButton>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonContent, IonCard, IonCardHeader, 
    IonCardSubtitle, IonCardTitle, IonCardContent, IonDatetime, IonSegment, IonSegmentButton, IonLabel, IonToast} from '@ionic/vue';
import { ref, onMounted, toRaw, computed } from 'vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { createPayment, getChildAuthorizations, getChildrenByUser, getUser } from '@/services/api';
import { useUserStore } from '@/store/user';

interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school: string;
}

interface Authorization {
    authorization_id: number;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_license_plate: string;
    vehicle_capacity: number;
}

interface Trip_Child{
    user_id: number;
    authorization_id: number;
    child_id: number;
    selected_dates: string[];
}

interface User{
  id: number;
}

const userStore = useUserStore();

onMounted(() => {
loadChildren();
mercadopago.value = new window.MercadoPago("TEST-eadd1652-39b2-45fb-a417-b7731d105195", { locale: "es-AR" });
});

const step = ref(1); 
const children = ref<Child[]>([]);
const drivers = ref<Authorization[]>([]);
const errorMessage = ref("");
const currentChild = ref<Child | null>(null); 
const currentDriver = ref<Authorization | null>(null);
const trip_child = ref<Trip_Child | null>(null);
const mercadopago = ref<any>(null);
const token = userStore.token;
const selectedDates = ref<string[]>([]);
const includeNextMonth = ref("no");
const showToast = ref(true);
const toastMessage = ref("Seleccione días para transporte del mes corriente");
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-based

const nextStep = () => {
if (step.value < 4) step.value++;
};

const prevStep = () => {
if (step.value > 1) step.value--;
};



const loadChildren = async () => {
const token = userStore.token;
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
    console.error("Error cargando alumnos", error);
    drivers.value = [];
    }
}
};

const minDate = new Date(year, month, 1).toISOString().split("T")[0];
const maxDate = computed(() => {
  const limit = includeNextMonth.value === "yes" ? month + 2 : month + 1;
  const max = new Date(year, limit, 0); // Último día del mes correspondiente
  return max.toISOString().split("T")[0];
});

// Obtener días hábiles del mes siguiente
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

// Remarcar los días del mes siguiente (solo visual, si querés que se vean diferentes)
const highlightedNextMonth = computed(() => {
  return includeNextMonth.value === "yes"
    ? getNextMonthWeekdays().map(date => ({
        date,
        textColor: 'var(--ion-color-medium)',
        backgroundColor: 'transparent',
      }))
    : [];
});

const isWeekday = (dateString: string) => {
        const date = new Date(dateString);
        const utcDay = date.getUTCDay();

        /**
         * Date will be enabled if it is not
         * Sunday or Saturday
         */
        return utcDay !== 0 && utcDay !== 6;
      };

// Al cambiar el toggle
const handleSegmentChange = () => {
  const nextMonthWeekdays = getNextMonthWeekdays();
  const set = new Set(selectedDates.value);

  if (includeNextMonth.value === "yes") {
    nextMonthWeekdays.forEach(date => set.add(date));
    toastMessage.value = "Se agregaron automáticamente los días hábiles del mes siguiente.";
  } else {
    nextMonthWeekdays.forEach(date => set.delete(date));
    toastMessage.value = "Seleccione días para transporte del mes corriente";
  }

  selectedDates.value = Array.from(set).sort();
  
  // Mostrar el toast
  showToast.value = true;
  console.log("selectedDates", selectedDates.value);
};

// Interceptamos los cambios manuales en el calendario
const onDateChange = (ev: any) => {
  const value = ev.detail.value; // array de fechas seleccionadas
  const nextMonthWeekdays = new Set(getNextMonthWeekdays());

  const filtered = value.filter((date: string) => {
    const isNextMonth = nextMonthWeekdays.has(date);
    if (includeNextMonth.value === "no" && isNextMonth) return false;
    if (includeNextMonth.value === "yes" && isNextMonth) return false; // el usuario no puede modificarlos
    return true;
  });

  // Reagregamos los días hábiles automáticamente si corresponde
  if (includeNextMonth.value === "yes") {
    getNextMonthWeekdays().forEach(date => filtered.push(date));
  }

  // Eliminamos duplicados
  selectedDates.value = Array.from(new Set(filtered)).sort() as string[];
};


const selectChild = (child: Child) => {
    currentChild.value = child;
    loadDriver();
};

const selectDriver = (driver: Authorization) => {
    currentDriver.value = driver;
};
const user = ref<User | null>(null);

declare global {
  interface Window {
      MercadoPago: any;
  }
}

const payWithMercadoPago = async () => {
    const token = userStore.token;
    if (!token) {
        throw new Error('Token is missing');
    }
    const userResponse = await getUser(token) as { data: User };
    user.value = userResponse.data;
    trip_child.value= {
        user_id: userResponse.data.id,
        authorization_id: currentDriver.value?.authorization_id || 0,
        child_id: currentChild.value?.child_id || 0,
        selected_dates: toRaw(selectedDates.value)
    };
    console.log("trip_child", trip_child.value);
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

const saveTrip = async () => {
    errorMessage.value = "";
    
    if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
    }

    try {
    let response;

    if (response && typeof response === 'object' && 'data' in response) {
        showToast.value = true;
        setTimeout(() => {
        showToast.value = false;
        }, 3000);
    } else {
        errorMessage.value = "Error al actualizar o crear el vehículo. Inténtalo nuevamente.";
    }
    } catch (error) {
    console.error(error);
    errorMessage.value = "Hubo un problema con la actualización o creación del vehículo. Inténtalo nuevamente.";
    }
}
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
  .selected {
  border: 2px solid #003366; 
    }
  .title {
  margin-top: 20px;
  }
</style>
  