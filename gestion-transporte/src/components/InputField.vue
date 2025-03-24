<template>
  <ion-item>
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input
      :placeholder="placeholder"
      v-model="model"
      class="custom-input"
      :type="type"
      :disabled="disabled"
      required
      @input="checkInput">
    <ion-input-password-toggle v-if="showToggle && type === 'password'" slot="end" color="blue" tabindex="-1"></ion-input-password-toggle>
    </ion-input>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonInputPasswordToggle } from '@ionic/vue';
import { TextFieldTypes } from '@ionic/core';
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  type: TextFieldTypes | undefined;
  placeholder?: string;
  disabled?: boolean;
}>(), {
  disabled: false
});

console.log(props);

const showToggle = ref(false);

const checkInput = () => {
  showToggle.value = !!model.value; // Muestra el ojo solo si hay texto
};

const model = defineModel<string>();
</script>

<style scoped>
.password-toggle-icon {
  cursor: pointer;
  font-size: 18px;
}

/* Evita que el icono interrumpa el tab */
ion-input-password-toggle {
  pointer-events: auto;
}
</style>
