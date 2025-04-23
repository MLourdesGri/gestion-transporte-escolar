<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Pago Exitoso</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <div class="success-message">
                <ion-icon :icon="checkmarkCircle" class="success-icon"></ion-icon>
                <h2>¡Pago realizado con éxito!</h2>
                <p>Gracias por tu compra.</p>
                <ion-button @click="goHome">Volver al inicio</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon} from "@ionic/vue";
import { checkmarkCircle} from "ionicons/icons";

const router = useRouter();

const goHome = () => {
    router.push("/home");
};
</script>

<style scoped>
.success-message {
    text-align: center;
    margin-top: 50px;
}

.success-icon {
    font-size: 100px;
    color: green;
}

ion-button {
  --border-radius: 10px;
  --background: #003366;
  --color: white;
  text-transform: none;
  margin-top: 10px;
}
</style>
