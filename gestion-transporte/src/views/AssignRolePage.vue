<template>
    <ion-page>
        <ion-content class="ion-padding">
            <div class="role-box">
                <h2 class="title">¿Cuál es tu rol?</h2>

                <div class="button-group">
                    <CustomButton class="role-button">Padre</CustomButton>
                    <CustomButton class="role-button">Chofer</CustomButton>
                </div>
                <p class="warning">Advertencia: Este rol no puede ser cambiado en el futuro</p>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import CustomButton from '@/components/CustomButton.vue';
</script>

<style scoped>
.role-box {
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.title {
  font-size: 30px;
}

.button-group {
  margin-top: 50%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.warning {
  margin-top: 50px;
  font-size: 15px;
  color: #747474;
}
</style>