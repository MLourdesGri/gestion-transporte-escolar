<template>
  <IonPage>
    <IonContent>
      <div class="map-wrapper">
        <div class="info-box">
          Tiempo total de viaje: {{ totalDurationText }}
        </div>
        <div ref="mapContainer" class="map"></div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script lang="ts" setup>
import { IonContent, IonPage } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { geocodeAddresses } from '@/services/externalApi';

const mapContainer = ref<HTMLElement | null>(null);

const totalDurationText = ref<string>('');

onMounted(async () => {
  const apiResult = await geocodeAddresses();
  if (!apiResult?.success || !Array.isArray(apiResult.data.locations)) {
    console.error("No se pudieron obtener las ubicaciones");
    return;
  }

  const locations = apiResult.data.locations.map((loc: any) => ({
    lat: loc.lat,
    lng: loc.lng,
  }));

  totalDurationText.value = apiResult.data.routeSummary.totalDurationText;

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'marker']
  });

  const google = await loader.load();

  const map = new google.maps.Map(mapContainer.value as HTMLElement, {
    center: locations[0],
    zoom: 10,
    mapId: '68d29ea0afcc7282',
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

        apiResult.data.routeSummary.legs.forEach((leg) => {
          const steps = leg.steps;
          if (!steps || steps.length === 0) return;

          const middleStepIndex = Math.floor(steps.length / 2);
          const position = {
            lat: steps[middleStepIndex].end_location.lat,
            lng: steps[middleStepIndex].end_location.lng,
          };

          const markerElement = document.createElement('div');
          markerElement.innerHTML = `
            <div style="background: #2D9CDB; color: white; padding: 6px 10px; border-radius: 20px; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              🕒 ${leg.durationText}
            </div>
          `;
          
          new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: markerElement,
          });
        });
      } else {
        console.error('Error al calcular la ruta:', status);
      }
    }
  );
});
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.map-wrapper {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.map {
  height: 100%;
  width: 100%;
}

.info-box {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(12, 199, 22);
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}
</style>