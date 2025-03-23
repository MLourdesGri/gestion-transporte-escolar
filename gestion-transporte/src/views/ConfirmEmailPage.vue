<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Confirmación de Email</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header style="background-color: #003366; color: white;">
            <ion-card-title color="white">Confirmando tu cuenta...</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="loading" class="message">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
              <p>Por favor, espera...</p>
            </div>
            <div v-if="success" class="message success-message">
              <p>¡Tu email ha sido confirmado correctamente!</p>
            </div>
            <div v-if="error" class="message error-message">
              <p>{{ error }}</p>
            </div>
          </ion-card-content>
        </ion-card>
  
        <div >
          <CustomButton expand="block" @click="redirectToLogin">Ir al login</CustomButton>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner } from "@ionic/vue";
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import axios from "axios";
import CustomButton from "@/components/CustomButton.vue";
  
  const route = useRoute();
  const router = useRouter();
  const loading = ref(true);
  const success = ref(false);
  const error = ref("");
  
  const confirmEmail = async () => {
    const token = route.params.token;
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/users/confirm-email/${token}`);
      if (response.status === 200) {
        success.value = true;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error.message || "Ocurrió un error inesperado";
    } finally {
      loading.value = false;
    }
  };
  
  const redirectToLogin = () => {
    router.push("/login");
  };
  
  onMounted(() => {
    confirmEmail();
  });
  </script>
  
  <style scoped>
  .message {
    text-align: center;
    font-size: 16px;
    margin-top: 20px;
  }
  
  .success-message {
    color: green;
    font-weight: bold;
  }
  
  .error-message {
    color: red;
    font-weight: bold;
  }
  
  ion-card {
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  ion-card-header {
    border-radius: 10px 10px 0 0;
    background-color: #003366;
    color: white;
  }
  
  ion-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
  }
  
  ion-button {
    border-radius: 5px;
    font-weight: bold;
  }

  </style>
  