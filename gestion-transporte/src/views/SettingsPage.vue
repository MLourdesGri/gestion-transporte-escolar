<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
            <ion-buttons slot="start">
                <ion-menu-button class="custom-menu"></ion-menu-button>
            </ion-buttons>
            <ion-title>Configuraciones</ion-title>
            </ion-toolbar>
        </ion-header>
  
        <ion-content :fullscreen="true" class="ion-padding">
            <InputFile accept="application/pdf" @file-uploaded="handleFileUpload">Subir PDF</InputFile>
            <div class="iframe-container">
                <iframe
                v-if="fileUrl"
                :src="'https://docs.google.com/gview?url=' + fileUrl + '&embedded=true'"
                width="100%"
                height="100%"
                frameborder="0"
                ></iframe>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonContent, IonTitle } from '@ionic/vue';
import InputFile from '@/components/InputFile.vue';

const fileUrl = ref<string | null>(null);

const handleFileUpload = (url: string) => {
    fileUrl.value = url;
};

// Este código es para abrir el PDF en una nueva pestaña

// const openFile = () => {
//     if (fileUrl.value) {
//         window.open(fileUrl.value, '_blank');
//     }
// };
</script>

<style scoped>
.iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 56.25%; /* Esto es para mantener la relación de aspecto 16:9 */
}

iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>