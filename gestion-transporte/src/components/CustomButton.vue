<template>
    <router-link :to="to">
      <ion-button class="custom-button" part="native" :color="color">
        <ion-icon v-if="icon" :icon="icon" class="custom-icon"></ion-icon>
        <slot></slot>
      </ion-button>
    </router-link>
</template>
  
<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { RouterLink } from 'vue-router';
  
defineProps({
    color: {
      type: String,
      default: "blue"
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

.custom-button {
  --border-radius: 10px;
  --background: #003366;
  --color: white;
  text-transform: none;
}
</style>