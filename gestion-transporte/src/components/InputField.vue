<template>
  <ion-item class="input-container">
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input
      :placeholder="placeholder"
      v-model="model"
      class="custom-input"
      :type="type"
      :disabled="disabled"
      required>
    <ion-input-password-toggle v-if="type === 'password'" slot="end" color="blue"></ion-input-password-toggle>
    </ion-input>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonInputPasswordToggle } from '@ionic/vue';
import { TextFieldTypes } from '@ionic/core';
import { defineProps, withDefaults } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  type: TextFieldTypes | undefined;
  placeholder: string;
  disabled?: boolean;
}>(), {
  disabled: false
});

// Si no lo hago me tira error pero es la unica manera de que funcione ya que el disabled es boolean
console.log(props.disabled);

const model = defineModel<string>();
</script>

<style scoped>
.password-toggle-icon {
  cursor: pointer;
  font-size: 18px;
}
</style>
