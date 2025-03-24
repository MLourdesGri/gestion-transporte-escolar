<template>
    <ion-text v-if="message" color="danger">
      <p class="error-message">{{ message }}</p>
    </ion-text>
</template>
  
<script setup lang="ts">
import { IonText } from '@ionic/vue';
import { defineProps } from 'vue';
  defineProps<{ message?: string }>();
</script>
  
<style scoped>
  .error-message {
    font-size: 14px;
    margin-top: 10px;
  }
</style>
  