<template>
  <router-link :to="to">
    <ion-button fill="clear" class="link-button" part="native">
      <slot></slot>
    </ion-button>
  </router-link>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { RouterLink } from 'vue-router';
  
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