<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonIcon } from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons'; 
import { ref } from 'vue';

defineProps<{
  label: string;
  type: string;
  placeholder: string;
}>();

const model = defineModel<string>();
const isPasswordVisible = ref(false); 

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
</script>

<template>
  <ion-item class="input-container">
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input
      :type="isPasswordVisible ? 'text' : type"
      :placeholder="placeholder"
      v-model="model"
      class="custom-input"
      required
    />
    <ion-icon 
      v-if="type === 'password'" 
      :icon="isPasswordVisible ? eyeOffOutline : eyeOutline" 
      slot="end" 
      @click="togglePasswordVisibility"
      class="password-toggle-icon"
    />
  </ion-item>
</template>

<style scoped>
.password-toggle-icon {
  cursor: pointer;
  font-size: 22px;
}
</style>
