<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title>Notificaciones</ion-title>
        </ion-toolbar>
      </ion-header>

    </ion-page>
  </template>
  
<script setup lang="ts">
  import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonAlert, IonFab, IonFabButton, IonIcon, IonModal, IonToast} from '@ionic/vue';
  import InputField from '@/components/InputField.vue';
  import { onMounted, ref } from "vue";
  import { getNotificationsByUser } from "../services/api"; 
  import { add } from 'ionicons/icons';
  import ErrorMessage from '@/components/ErrorMessage.vue';
  import InputWithMaps from '@/components/InputWithMaps.vue';
  import CustomButton from '@/components/CustomButton.vue';
  import DropdownField from '@/components/DropdownField.vue';

  


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
  display: flex;
  justify-content: space-between;
}

  .no-children {
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
  