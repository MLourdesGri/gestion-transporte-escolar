<template>
    <ion-item>
      <ion-label position="stacked" class="label">{{ label }}</ion-label>
      <ion-datetime-button datetime="date" :disabled="disabled"></ion-datetime-button>

      <ion-modal :keep-contents-mounted="true">
        <ion-datetime
            id="date"
            presentation="date"
            v-model="model"
            required>
        </ion-datetime>
      </ion-modal>
    </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonDatetimeButton, IonDatetime, IonModal } from '@ionic/vue';

const props = withDefaults(defineProps<{
  label: string;
  disabled?: boolean;
}>(), {
  disabled: false
});

console.log(props);

const model = defineModel<string>();
</script>

<style scoped>
ion-datetime-button {
    margin: 10px 0px;

}
.label {
  font-size: 20px;
}
</style>
