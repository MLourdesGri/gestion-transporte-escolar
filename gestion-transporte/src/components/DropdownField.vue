<template>
    <ion-item>
      <ion-label>{{ label }}</ion-label>
      <ion-select v-model="selectedValue" placeholder="Seleccione...">
        <ion-select-option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </ion-select-option>
      </ion-select>
    </ion-item>
  </template>
  
  <script setup>
  import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue';
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    label: String,  
    options: {      
      type: Array,
      required: true
    },
    modelValue: {   
      type: [String, Number], 
      required: true
    }
  });
  
  const selectedValue = ref(props.modelValue);
  
  const updateValue = () => {
    emit('update:modelValue', selectedValue.value);
  };
  
  watch(selectedValue, updateValue);
  </script>
  