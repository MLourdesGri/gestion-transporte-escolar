<template>
  <ion-item>
    <ion-label position="stacked" class="label">{{ label }}</ion-label>
    <ion-input
      :placeholder="placeholder"
      :value="searchQuery"
      @ionInput="onInputChange"
      class="custom-input"
      required
    ></ion-input>

    <ion-list v-if="suggestions.length > 0">
      <ion-item 
        v-for="place in suggestions" 
        :key="place.place_id"
        @click="selectPlace(place)">
        {{ place.name }} - {{ place.address }}
      </ion-item>
    </ion-list>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonList } from '@ionic/vue';
import { ref, defineProps } from 'vue';
import { searchPlaces } from '@/services/externalApi';

const props = defineProps({
  label: String,
  placeholder: String,
  modelValue: {
    type: [String, Object], // Permite tanto un string como un objeto
    required: true
  },
  name: String, // Filtra por "school", "restaurant", etc.
  multipleFields: {
    type: Boolean,
    default: false
  }
});

interface Place {
  place_id: string;
  name: string;
  address: string;
}

interface ApiResponse {
  status: string;
  data: {
    id: number;
    name: string;
  };
}

const emit = defineEmits(["update:modelValue"]);
const searchQuery = ref(
  props.multipleFields ? (props.modelValue as any)?.school_name || "" : (props.modelValue as string) || ""
);
const suggestions = ref<Place[]>([]);

const onInputChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;

  if (props.multipleFields) {
    emit("update:modelValue", { 
      school_name: searchQuery.value,
      school_address: (props.modelValue as any)?.school_address || ''
    });
  } else {
    emit("update:modelValue", searchQuery.value);
  }

  if (searchQuery.value.length < 3) {
    suggestions.value = [];
    return;
  }

  try {
    const response = await searchPlaces(searchQuery.value, props.name || '') as ApiResponse;
    const results = response.data;
    if (Array.isArray(results)) {
      suggestions.value = results as Place[];
    } else {
      console.error("Formato de respuesta inesperado:", results);
      suggestions.value = [];
    }
  } catch (error) {
    console.error("Error buscando ubicaciones:", error);
  }
};

const selectPlace = (place: Place) => {
  searchQuery.value = place.address;

  if (props.multipleFields) {
    emit("update:modelValue", { 
      school_name: place.name,
      school_address: place.address
    });
  } else {
    emit("update:modelValue", place.address);
  }

  suggestions.value = [];
};
</script>

<style scoped>
.custom-input {
  width: 100%;
}

ion-list {
  position: relative;
  width: 100%;
  border-top: none;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}
.label {
  font-size: 20px;
}

ion-item {
  cursor: pointer;
}
</style>
