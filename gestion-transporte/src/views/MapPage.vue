<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Mapa de viaje #{{ tripId }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="map-wrapper">
        <div class="info-box">
          <div class="info-content">
            <span>Tiempo total de viaje: {{ totalDurationText }}</span>
            <div v-if="userStore.user?.role_id === 2">
            <ion-button v-if="trip?.status === 'pending'" size="medium" @click="initializeTrip">Iniciar viaje</ion-button>
            <ion-button v-else-if="trip?.status === 'in progress'" size="medium" @click="terminateTrip">Finalizar viaje</ion-button>
            <ion-button v-else size="medium" disabled>Viaje {{ formatTripStatus(trip?.status || 'unknown') }}</ion-button>
            </div>
          </div>
        </div>
        <div ref="mapContainer" class="map"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { IonPage, IonHeader,IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonButton} from '@ionic/vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { geocodeAddresses } from '@/services/externalApi';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { finishTrip, getTripById, startTrip } from '@/services/api';
import { formatTripStatus } from '@/utils/utils';

interface Trip {
  trip_id: number;
  date: string;
  status: string;
}

const socket: Socket = io("https://gestion-transporte-escolar-be-production.up.railway.app",{ 
  transports: ['websocket', "polling"],
  withCredentials: true
});

const route = useRoute();
const tripId = Number(route.params.id);

const userStore = useUserStore();
const token = userStore.token || '';

const mapContainer = ref<HTMLElement | null>(null);
const totalDurationText = ref<string>('');
let userMarker: google.maps.Marker | null = null;
let userCircle: google.maps.Circle | null = null;
let choferMarker: google.maps.Marker | null = null;
let watchId: number | null = null;
const errorMessage = ref("");
const trip = ref<Trip | null>(null);

onMounted(async () => {
  try {
    const tripResponse = await getTripById(tripId, token) as { data: Trip };
    if (tripResponse) {
      trip.value = tripResponse.data;
    }

    const apiResult = await geocodeAddresses(tripId, token);
  if (!apiResult?.success || !Array.isArray(apiResult.data.locations)) {
    console.error("Error en la respuesta de la API:", apiResult);
    console.error("No se pudieron obtener las ubicaciones.");
    return;
  }

  const locations = apiResult.data.locations.map((loc: any) => ({
    lat: loc.lat,
    lng: loc.lng,
  }));

  console.log("Ubicaciones geocodificadas:", locations);

  totalDurationText.value = apiResult.data.routeSummary.totalDurationText;

  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'marker']
  });

  const google = await loader.load();

  const map = new google.maps.Map(mapContainer.value as HTMLElement, {
    center: locations[0],
    zoom: 5,
    mapId: '68d29ea0afcc7282',
  });

  if (userStore.user?.role_id !== 2) {
    socket.emit("pedir-ultima-ubicacion", tripId);

    socket.on("ultima-ubicacion", (data) => {
      const choferLocation = new google.maps.LatLng(data.lat, data.lng);
      if (!choferMarker) {
        choferMarker = new google.maps.Marker({
          position: choferLocation,
          map,
          title: "Ubicación del chofer",
          icon: {
            url: "https://maps.gstatic.com/mapfiles/ms2/micons/bus.png",
            scaledSize: new google.maps.Size(40, 40),
          },
        });
      } else {
        choferMarker.setPosition(choferLocation);
      }
    });

    socket.on("nueva-ubicacion", (data) => {
      const choferLocation = new google.maps.LatLng(data.lat, data.lng);
      if (!choferMarker) {
        choferMarker = new google.maps.Marker({
          position: choferLocation,
          map,
          title: "Ubicación del chofer",
          icon: {
            url: "https://maps.gstatic.com/mapfiles/ms2/micons/bus.png",
            scaledSize: new google.maps.Size(40, 40),
          },
        });
      } else {
        choferMarker.setPosition(choferLocation);
      }
    });
  }

  new google.maps.Marker({
    position: locations[0],
    map,
    title: "Chofer",
    icon: {
      url: "https://cdn-icons-png.flaticon.com/512/2922/2922522.png",
      scaledSize: new google.maps.Size(40, 40),
    },
    label: {
      text: "Chofer",
      color: "#000",
      fontWeight: "bold",
      fontSize: "12px",
    },
  });

  new google.maps.Marker({
    position: locations[locations.length - 1],
    map,
    title: "Escuela",
    icon: {
      url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      scaledSize: new google.maps.Size(40, 40),
    },
    label: {
      text: "Escuela",
      color: "#000",
      fontWeight: "bold",
      fontSize: "12px",
    },
  });

  const houseIconUrl = "https://cdn-icons-png.flaticon.com/512/25/25694.png"; // Icono de casa

  locations.slice(1, -1).forEach((loc, index) => {
    new google.maps.Marker({
      position: loc,
      map,
      title: ``,
      icon: {
        url: houseIconUrl,
        scaledSize: new google.maps.Size(40, 40),
      },
      label: {
        text: `Casa ${index + 1}`,
        color: "#000",
        fontSize: "11px",
      },
    });
  });

  const userRole = userStore.user?.role_id;

  if (userRole == 2 && navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );

        socket.emit("chofer-ubicacion", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          tripId: tripId,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        });

        // Centrar mapa solo la primera vez
        if (!userMarker) {
          map.setCenter(userLocation);
        }

        // Crear o mover el marcador
        if (!userMarker) {
          userMarker = new google.maps.Marker({
            position: userLocation,
            map,
            title: "Mi ubicación",
            icon: {
              url: "data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='%23007bff' stroke='%23ffffff' stroke-width='4' /></svg>",
              scaledSize: new google.maps.Size(40, 40),
            },
          });
        } else {
          userMarker.setPosition(userLocation);
        }

        // Crear o mover el círculo de precisión
        if (!userCircle) {
          userCircle = new google.maps.Circle({
            strokeColor: "#4285F4",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#4285F4",
            fillOpacity: 0.35,
            map,
            center: userLocation,
            radius: position.coords.accuracy,
          });
        } else {
          userCircle.setCenter(userLocation);
          userCircle.setRadius(position.coords.accuracy);
        }
      },
      (error) => {
        console.error("No se pudo obtener la ubicación:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    console.error("Geolocalización no está soportada en este navegador");
  }

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true,
  });

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
  } catch (error) {
    console.error('Error al cargar el mapa:', error);
  }
});

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
});

const initializeTrip = async () => {
  errorMessage.value = "";
  const token = userStore.token;
  if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
  }
  try {    
    const response = await startTrip(tripId, token);
    console.log(response);
  }
  catch (error) {
    console.error("Error al iniciar el viaje:", error);
    errorMessage.value = "Error al iniciar el viaje. Inténtalo de nuevo.";
  }
};

const terminateTrip = async () => {
  errorMessage.value = "";
  const token = userStore.token;
  if (!token) {
    errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
    return;
  }
  try {    
    const response = await finishTrip(tripId, token);
    console.log(response);
  }
  catch (error) {
    console.error("Error al iniciar el viaje:", error);
    errorMessage.value = "Error al iniciar el viaje. Inténtalo de nuevo.";
  }
};
</script>

<style scoped>
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.map {
  height: 100%;
  width: 100%;
}

.info-box {
  position: absolute;
  bottom: 25px;
  left: 5%;
  right: 5%;
  background-color: #003366;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.info-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

ion-button {
  margin: 10px;
  border-radius: 20px;
  font-size: 14px;
}

</style>
