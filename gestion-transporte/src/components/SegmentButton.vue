<template>
  <ion-segment class="segment" v-model="model">
    <ion-segment-button value="1">
      <ion-label>Padre</ion-label>
    </ion-segment-button>
    <ion-segment-button value="2">
      <ion-label>Chofer</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';

defineProps({
  value: {
    type: String
  }
});

const model = defineModel<string>();
</script>


<style scoped>
.segment {
    margin-top: 15px;
    border-radius: 15px;
}

ion-segment-button {
    --color-checked: white;
    --color: gray;
    --background-checked: #003366;
}
</style>
