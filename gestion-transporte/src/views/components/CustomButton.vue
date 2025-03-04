<template>
    <ion-button expand="full" :color="color" class="custom-button" part="native">
      <slot></slot>
    </ion-button>
</template>
  
<script setup>
import { IonButton } from '@ionic/vue';
  
defineProps({
    color: {
      type: String,
      default: 'primary'
    }
});
</script>

<style scoped>
</style>