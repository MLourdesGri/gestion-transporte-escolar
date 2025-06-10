<template>
  <ion-grid class="ion-padding-top">
    <ion-row class="ion-align-items-center ion-justify-content-between">
      <!-- Día -->
      <ion-col size="4" size-sm="2">
        <ion-item lines="none" class="filter-item">
          <ion-select v-model="selectedDay" interface="popover" placeholder="Día" clearable>
            <ion-select-option :value="null">Día</ion-select-option>
            <ion-select-option v-for="day in days" :key="day" :value="day">{{ day }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>

      <!-- Mes -->
      <ion-col size="4" size-sm="3">
        <ion-item lines="none" class="filter-item">
          <ion-select v-model="selectedMonth" interface="popover" placeholder="Mes" clearable>
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
          <ion-select v-model="selectedYear" interface="popover" placeholder="Año" clearable>
            <ion-select-option :value="null">Año</ion-select-option>
            <ion-select-option v-for="year in years" :key="year" :value="year">{{ year }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>

      <!-- Chofer (opcional) -->
      <ion-col size="12" size-sm="3" v-if="showDriverFilter">
        <ion-item lines="none" class="filter-item">
          <ion-label position="stacked">Chofer</ion-label>
          <ion-select v-model="selectedDriver" interface="popover" placeholder="Chofer" clearable>
            <ion-select-option :value="null">Chofer</ion-select-option>
            <ion-select-option
              v-for="driver in drivers"
              :key="driver.id"
              :value="driver.id"
            >
              {{ driver.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-col>

      <!-- Botón aplicar -->
      <ion-col size="12" size-sm="2" class="ion-text-end">
        <ion-button size="small" @click="emitFilters" color="primary">Filtrar</ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup>
import { IonGrid, IonRow, IonCol, IonItem, IonSelect, IonSelectOption, IonLabel, IonButton } from '@ionic/vue'
import { ref } from 'vue'

defineProps({
  showDriverFilter: Boolean,
  drivers: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['filter'])

const selectedDay = ref(null)
const selectedMonth = ref(null)
const selectedYear = ref(null)
const selectedDriver = ref(null)

const days = Array.from({ length: 31 }, (_, i) => i + 1)
const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const years = [2023, 2024, 2025]

function emitFilters() {
  emit('filter', {
    day: selectedDay.value,
    month: selectedMonth.value,
    year: selectedYear.value,
    driver: selectedDriver.value,
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