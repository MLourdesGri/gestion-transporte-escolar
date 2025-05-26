<template>
    <div class="spinner-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
    </div>
</template>

<script lang="ts" setup>
import { IonSpinner } from '@ionic/vue';
</script>

<style scoped>
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

ion-spinner {
  width: 64px;
  height: 64px;
}
</style>