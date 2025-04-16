<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Pago Fallido</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <div class="failure-message">
                <ion-icon :icon="closeCircle" class="failure-icon"></ion-icon>
                <h2>¡El pago ha fallado!</h2>
                <p>Hubo un problema al procesar tu compra. Por favor, intentá nuevamente.</p>
                <ion-button color="danger" @click="goHome">Volver al inicio</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from "@ionic/vue";
import { closeCircle } from "ionicons/icons";

const router = useRouter();

const goHome = () => {
    router.push("/home");
};
</script>

<style scoped>
.failure-message {
    text-align: center;
    margin-top: 50px;
}

.failure-icon {
    font-size: 100px;
    color: red;
}
</style>
