<template>
  <IonPage>
    <IonContent>
      <div ref="mapContainer" style="height: 100vh; width: 100%;"></div>
    </IonContent>
  </IonPage>
</template>

<script lang="ts" setup>
import { IonContent, IonPage } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { geocodeAddresses } from '@/services/externalApi';


const mapContainer = ref<HTMLElement | null>(null);

// const locations = [
//   { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
//   { lat: -34.5210, lng: -58.7000 }, // Otra ubicación de ejemplo
//   { lat: -34.6155, lng: -58.5733 }  // Otra ubicación de ejemplo
// ];

onMounted(async () => {

  const result = await geocodeAddresses();
  if (!result?.success || !Array.isArray(result.data)) {
    console.error("No se pudieron obtener las ubicaciones");
    return;
  }

  const locations = result.data.map((loc: any) => ({
    lat: loc.lat,
    lng: loc.lng,
  }));

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const google = await loader.load();

  const map = new google.maps.Map(mapContainer.value as HTMLElement, {
    center: locations[0],
    zoom: 10,
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({ map });

  const waypoints = locations.slice(1, -1).map(loc => ({
    location: loc,
    stopover: true,
  }));

  directionsService.route(
    {
      origin: locations[0],
      destination: locations[locations.length - 1],
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result: any, status: string) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Error al calcular la ruta:', status);
      }
    }
  );
});
</script>
