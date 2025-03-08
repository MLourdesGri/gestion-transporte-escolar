<template>
    <ion-button fill="clear" class="link-button" :router-link="to" part="native">
      <slot></slot>
    </ion-button>
</template>
  
<script setup lang="ts">
import { IonButton } from '@ionic/vue';
  
defineProps({
    color: {
      type: String,
      default: 'medium'
    },
    to: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>
.link-button {
  --color: #003366;
  text-transform: none;
}
</style>