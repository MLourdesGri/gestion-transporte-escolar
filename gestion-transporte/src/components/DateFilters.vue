<template>
  <ion-grid class="ion-padding-top">
    <ion-row class="ion-align-items-center ion-justify-content-between">
      <!-- Día -->
      <ion-col size="4" size-sm="2">
        <ion-item lines="none" class="filter-item">
          <ion-select
            :value="modelValueDay"
            interface="popover"
            placeholder="Día"
            clearable
            @ionChange="e => emit('update:modelValueDay', e.target.value)"
          >
            <ion-select-option :value="null">Día</ion-select-option>
            <ion-select-option v-for="day in days" :key="day" :value="day">{{ day }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>

      <!-- Mes -->
      <ion-col size="4" size-sm="3">
        <ion-item lines="none" class="filter-item">
          <ion-select
            :value="modelValueMonth"
            interface="popover"
            placeholder="Mes"
            clearable
            @ionChange="e => emit('update:modelValueMonth', e.target.value)"
          >
            <ion-select-option :value="null">Mes</ion-select-option>
            <ion-select-option v-for="(month, index) in months" :key="month" :value="index + 1">
              {{ month }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>

      <!-- Año -->
      <ion-col size="4" size-sm="2">
        <ion-item lines="none" class="filter-item">
          <ion-select
            :value="modelValueYear"
            interface="popover"
            placeholder="Año"
            clearable
            @ionChange="e => emit('update:modelValueYear', e.target.value)"
          >
            <ion-select-option :value="null">Año</ion-select-option>
            <ion-select-option v-for="year in years" :key="year" :value="year">{{ year }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>

      <!-- Chofer -->
      <ion-col size="12" size-sm="3" v-if="showDriverFilter">
        <ion-item lines="none" class="filter-item">
          <ion-label position="stacked">Chofer</ion-label>
          <ion-select
            :value="modelValueDriver"
            interface="popover"
            placeholder="Chofer"
            clearable
            @ionChange="e => emit('update:modelValueDriver', e.target.value)"
          >
            <!-- <ion-select-option :value="null">Chofer</ion-select-option>
            <ion-select-option v-for="driver in drivers" :key="driver.id" :value="driver.id">
              {{ driver.name }}
            </ion-select-option> -->
          </ion-select>
        </ion-item>
      </ion-col>

      <ion-col size="12" size-sm="2" class="ion-text-end">
        <ion-button size="small" @click="emitFilters" color="primary">Filtrar</ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonItem, IonSelect, IonSelectOption, IonLabel, IonButton } from '@ionic/vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  showDriverFilter: boolean,
  modelValueDay: number | null,
  modelValueMonth: number | null,
  modelValueYear: number | null,
  modelValueDriver: number | null
}>()

const emit = defineEmits([
  'update:modelValueDay',
  'update:modelValueMonth',
  'update:modelValueYear',
  'update:modelValueDriver',
  'filter',
])

const days = Array.from({ length: 31 }, (_, i) => i + 1)
const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const years = [2023, 2024, 2025];

function emitFilters() {
  emit('filter', {
    day: props.modelValueDay ?? null,
    month: props.modelValueMonth ?? null,
    year: props.modelValueYear ?? null,
    driver: props.modelValueDriver ?? null,
  })
}
</script>

<style scoped>
ion-select {
  --padding-start: 0;
  --padding-end: 0px;
  text-align: center;
}

ion-select::part(text) {
  width: 100%;
  text-align: center;
}

ion-select::part(icon) {
  margin-left: auto !important;
  margin-right: 0 !important;
  position: absolute;
  right: 12px;
}
</style>