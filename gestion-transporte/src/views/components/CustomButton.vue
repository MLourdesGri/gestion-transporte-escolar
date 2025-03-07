<template>
    <ion-button expand="full" :color="color" :router-link="to" part="native">
      <ion-icon v-if="icon" :icon="icon" class="custom-icon"></ion-icon>
      <slot></slot>
    </ion-button>
</template>
  
<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
  
defineProps({
    color: {
      type: String,
      default: 'primary'
    },
    icon: {
      type: String,
      default: ''
    },
    to: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>
.custom-icon {
  margin-right: 8px;
}
</style>