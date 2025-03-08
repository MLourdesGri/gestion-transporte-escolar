<template>
  <ion-item class="input-container">
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input 
      :type="type" 
      :placeholder="placeholder" 
      class="custom-input"
      :value="modelValue"
      @ionInput="updateValue($event)"
      required
    />
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput } from '@ionic/vue';

// Props definidas
defineProps<{
  label: string;
  type: string;
  placeholder: string;
  modelValue: string;
}>();

// Emitir el cambio de valor
const emit = defineEmits(["update:modelValue"]);

// Función para manejar el cambio del valor
const updateValue = (event: any) => {
  // Actualiza el valor de modelValue con el valor ingresado
  const newValue = event.detail.value;
  // Emitir el valor actualizado
  emit("update:modelValue", newValue);
};
</script>

<style scoped>
.input-container {
  margin-bottom: 20px;
  --border-radius: 10px;
}

.custom-input {
  margin-top: 5px;
  padding: 10px;
  --border-radius: 10px;
}
</style>
