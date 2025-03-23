<template>
    <ion-button fill="clear" class="link-button" part="native">
      <slot></slot>
    </ion-button>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
  
defineProps({
    color: {
      type: String,
      default: 'medium'
    }
});
</script>

<style scoped>
.link-button {
  --color: #003366;
  text-transform: none;
}
</style>