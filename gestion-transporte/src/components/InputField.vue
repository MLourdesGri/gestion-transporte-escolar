<template>
  <ion-item class="input-container">
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input
      :placeholder="placeholder"
      v-model="model"
      class="custom-input"
      required>
    <ion-input-password-toggle v-if="type === 'password'" slot="end" color="blue" ></ion-input-password-toggle>
    </ion-input>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonInputPasswordToggle } from '@ionic/vue';

defineProps<{
  label: string;
  type: string;
  placeholder: string;
}>();

const model = defineModel<string>();
</script>

<style scoped>
.password-toggle-icon {
  cursor: pointer;
  font-size: 18px;
}
</style>
