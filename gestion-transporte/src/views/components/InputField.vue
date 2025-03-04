<template>
  <ion-item class="input-container">
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input 
      :type="type" 
      v-model="inputValue" 
      :placeholder="placeholder" 
      class="custom-input"
      required
    />
  </ion-item>
</template>

<script setup>
import { ref } from 'vue';
import { IonItem, IonLabel, IonInput } from '@ionic/vue';

defineProps({
  label: String,
  type: String,
  placeholder: String
});

const inputValue = ref('');
</script>

<style scoped>
.input-container {
  margin-bottom: 20px;
}

.custom-input {
  margin-top: 5px;
  padding: 10px;
  border-radius: 5px;
}
</style>
