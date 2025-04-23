<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title>Tarifas</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Tarifas</ion-title>
          </ion-toolbar>
        </ion-header>
          <div class="no-price" v-if="prices.length == 0">
            <p>Aún no has registrado ninguna tarifa.</p>
          </div>
          <div v-else>
            <div class="ion-padding">
            <ion-text>
              <h2>Tarifa actual</h2>
            </ion-text>
            <ion-card>
              <ion-card-header>
                <ion-card-title>Tarifa {{ prices[0].price_id }}</ion-card-title>
                <ion-card-subtitle>Desde {{ formatDateTime(prices[0].date_from) }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p>Precio mensual: ${{ prices[0].monthly_price }}</p>
                <p>Precio semanal: ${{ prices[0].daily_price }}</p>
              </ion-card-content>
            </ion-card>

            <ion-text color="medium">
              <h3 style="margin-top: 30px;">Tarifas anteriores</h3>
            </ion-text>
            <div v-for="price in prices.slice(1)" :key="price.price_id">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>Tarifa {{ price.price_id }}</ion-card-title>
                  <ion-card-subtitle>Desde {{ formatDateTime(price.date_from) }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                <p>Precio mensual: ${{ price.monthly_price }}</p>
                <p>Precio semanal: ${{ price.daily_price }}</p>
              </ion-card-content>
              </ion-card>
            </div>
          </div>
          </div>

  
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button class="custom-fab" id="open-modal" expand="block" @click="openModal">
            <ion-icon :icon="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
  
        <ion-modal ref="modalRef" :is-open="isModalOpen" @did-dismiss="closeModal">
          <ion-header :translucent="true">
            <ion-toolbar>
              <ion-title>Crear Tarifa</ion-title>
            </ion-toolbar>
          </ion-header>
        <ion-content class="ion-padding">
          <InputField label="Monto mensual:" type="number" v-model="form.monthly_price" :disabled="!isEditing" />
          <InputField label="Monto diario:" type="number" v-model="form.daily_price" :disabled="!isEditing" />
          <ErrorMessage :message="errorMessage" duration="3000" />
          <div class="button-group">
            <CustomButton expand="block" color="medium" @click="cancel">Volver</CustomButton>
            <CustomButton expand="block" @click="confirm">Guardar</CustomButton>
          </div>
         
        </ion-content>
      
        <ion-alert
          trigger="cancelButton"
          header="Eliminar precio"
          :buttons="alertButtons"
          message="Está seguro de que desea eliminar al precio?"
        ></ion-alert>

      </ion-modal>
        <ion-toast v-model:isOpen="showToast" message="Precio creado/actualizado correctamente" position="bottom" color="success" duration="3000"></ion-toast>
      </ion-content>
    </ion-page>

    
  </template>
  
  <script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
IonCardSubtitle, IonCardTitle, IonAlert, IonFab, IonFabButton, IonIcon, IonModal,  IonToast, IonCardContent, IonText} from '@ionic/vue';
import InputField from '@/components/InputField.vue';
import { getPricesByUser, postPrice } from "../services/api"; 
import { add } from 'ionicons/icons';
import ErrorMessage from '@/components/ErrorMessage.vue';
import CustomButton from '@/components/CustomButton.vue';
import { useUserStore } from '@/store/user';
import { onMounted, ref } from 'vue';
import { formatDateTime } from '@/utils/utils';
  
  interface Price {
    price_id: number;
    daily_price: number;
    monthly_price: number;
    user_id: number;
    date_from: string;
  }
  
  const form = ref({
    daily_price: '',
    monthly_price: '',
    user_id: '',
    date_from: '',
  });
  
  const prices = ref<Price[]>([]);
  const errorMessage = ref("");
  const showToast = ref(false);
  const currentPrice = ref<Price | null>(null); 
  const isModalOpen = ref(false); 
  const isEditing = ref(false);

  const userStore = useUserStore();
  
  const loadPrice = async () => {
    const token = userStore.token;
    if (token) {
      try {
        const priceResponse = await getPricesByUser(token);
        if (priceResponse && typeof priceResponse === "object" && "data" in priceResponse) {
          const priceData = priceResponse.data;
          prices.value = Array.isArray(priceData) ? priceData : (priceData ? [priceData] : []);
          const sortedPrices = Array.isArray(priceData)
          ? priceData.sort((a: Price, b: Price) => b.price_id - a.price_id)
          : (priceData ? [priceData] : []);
          prices.value = sortedPrices;
        } else {
          prices.value = [];
        }
      } catch (error) {
        console.error("Error cargando tarifas", error);
        prices.value = [];
      }
    }
  };
  
  onMounted(() => {
    loadPrice();
  });
  
  const cancel = () => {
    isModalOpen.value = false;
    currentPrice.value = null;
    isEditing.value = false;
  };

  const closeModal = () => {
    isModalOpen.value = false; 
    currentPrice.value = null; 
  };

  const confirm = async () => {
    if(!form.value.monthly_price || !form.value.daily_price) {
      errorMessage.value = "Todos los campos son obligatorios";
      return;
    }
    await savePrice();
    isModalOpen.value = false; 
    loadPrice();
  };
  
  const openModal = () => {
    currentPrice.value = null; 
    isEditing.value = true;
    form.value = { daily_price: '', monthly_price: '', user_id: '', date_from: '' }; 
    isModalOpen.value = true; 
  };

  const token = userStore.token;
  
  const savePrice = async () => {
    const now = new Date();
    const offset = now.getTimezoneOffset(); 
    const localDate = new Date(now.getTime() - offset * 60000); 
    const formattedDate = localDate.toISOString().slice(0, 19).replace('T', ' ');

    const priceData = {
      monthly_price: form.value.monthly_price,
      daily_price: form.value.daily_price,
      date_from: formattedDate
    };
  
    if (!priceData.monthly_price || !priceData.daily_price) {
      return;
    }
  
    try {
      let response;
      
      if (!token) {
        errorMessage.value = "No se pudo autenticar. Por favor, inicie sesión nuevamente.";
        return;
      }
     {
      console.log(token);
        response = await postPrice(priceData, token);
      }
      if (response && typeof response === 'object' && 'data' in response) {
        showToast.value = true;
        setTimeout(() => {
          showToast.value = false;
        }, 3000);
      } else {
        errorMessage.value = "Error al crear o editar el precio. Inténtalo nuevamente.";
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = "Hubo un problema. Inténtalo nuevamente.";
    }
  };


  const alertButtons = [
  {
    text: 'Cancelar'
  },
  {
    text: 'Confirmar',
    handler: async () => {  
      if (currentPrice.value && token) {
        try {
          closeModal();
          await loadPrice();
          currentPrice.value = null;
        } catch (error) {
          console.error("Error eliminando precio", error);
        }
      } else {
        console.error("Token inválido o precio no seleccionado");
      }
    },
  },
];

  </script>
  
  <style scoped>
.btnNext {
  margin-left: auto;
  margin-right: 10px;
}

.bottom-buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background: white;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
}

  .no-price {
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
  .button-group {
    display: flex;
    position: absolute;
    left: 0;
    width: 100%;
    bottom: 0;
  }
  .button-group ion-button {
    flex: 1;
  }
  .error {
  display: flex;
  justify-content: center;
  }
  </style>
  