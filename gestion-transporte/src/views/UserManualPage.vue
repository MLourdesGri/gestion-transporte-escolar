<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Manual de Usuario</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card v-if="userStore.user?.role_id === 1">
        <ion-card-header>
          <ion-card-title>Manual del Tutor</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h3>Alta de dirección</h3>
          <p>Desde la sección "Perfil" puede ingresar la dirección de su hogar para poder comenzar a solicitar viajes.</p>

          <h3>Alta de hijos</h3>
          <p>Desde la sección "Hijos" debe dar de alta a sus hijos y la institución a la que asisten.</p>

          <h3>Solicitud de viaje</h3>
          <p>Desde la pantalla de inicio, haga clic en el botón flotante "+" para registrar un nuevo viaje.</p>
          <p>Elija un hijo, el chofer y la o las fechas que necesita, y luego abone el viaje via Mercado Pago.</p>

          <h3>Seguimiento</h3>
          <p>En la pantalla principal podrá ver los próximos viajes registrados, junto con el estado del viaje, la fecha y el turno.</p>
          <p>Podrá ingresar a cada viaje para ver más detalles y realizar el seguimiento del chofer.</p>

          <h3>Estadísticas y reportes</h3>
          <p>Desde la sección de reportes puede visualizar gráficos e informes con métricas de uso, viajes realizados, pagos, etc.</p>

          <h3>Perfil</h3>
          <p>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</p>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="userStore.user?.role_id === 2">
        <ion-card-header>
          <ion-card-title>Manual del Chofer</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h3>Alta de vehículo</h3>
          <p>Desde la sección "Habilitaciones" puede registrar su vehículo, incluyendo toda la documentación requerida. Deberá esperar a que su habilitación sea aprobada para empezar a trabajar.</p>

          <h3>Alta de tarifas</h3>
          <p>Desde la sección "Tarifas" puede registrar y gestionar las tarifas de los viajes. Puede cargar tarifa diaria y mensual.</p>

          <h3>Viajes</h3>
          <p>Desde la pantalla principal podrá ver los viajes asignados con la información de los pasajeros y la institución.</p>
          <p>Debe marcar el inicio y finalización del viaje en la app para registrar el recorrido.</p>

          <h3>Estadísticas y reportes</h3>
          <p>Desde la sección de reportes puede visualizar gráficos e informes con métricas de uso, viajes realizados, pagos, etc.</p>

          <h3>Perfil</h3>
          <p>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</p>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="userStore.user?.role_id === 3">
        <ion-card-header>
          <ion-card-title>Manual del Administrador</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h3>Visualización de habilitaciones</h3>
          <p>Desde la sección correspondiente, puede ver y gestionar las habilitaciones de vehículos y choferes.</p>

          <h3>Gestión de pagos</h3>
          <p>Acceda a la sección de pagos para aprobar y registrar los pagos realizados a choferes.</p>

          <h3>Estadísticas y reportes</h3>
          <p>Desde la sección de reportes puede visualizar gráficos e informes con métricas de uso, viajes realizados, pagos, etc.</p>

          <h3>Perfil</h3>
          <p>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</p>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent } from '@ionic/vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
</script>

<style scoped>
.custom-menu {
  --color: #003366;
}

ion-card-title {
  color: #003366;
  font-weight: bold;
  font-size: 20px;
}

ion-card-content h3 {
  font-size: 16px;
  color: #003366;
  margin-top: 16px;
  font-weight: bold;
}

ion-card-content p {
  margin-left: 10px;
  margin-bottom: 8px;
  line-height: 1.4;
}
</style>
