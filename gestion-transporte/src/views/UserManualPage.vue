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
          <h3>Registro en el sistema</h3>
          <p>Ingrese a la app.</p>
          <p>Haga clic en "Registrarse".</p>
          <p>Ingrese un email y contraseña válidos. Seleccione su perfil como Tutor (esta elección no se podrá cambiar después). Complete sus datos personales.</p>

          <h3>Alta de dirección</h3>
          <p>Desde la sección "Perfil" puede ingresar su dirección para poder comenzar a solicitar viajes.</p>

          <h3>Solicitud de viaje</h3>
          <p>Desde la pantalla de inicio, haga clic en el botón flotante "+" para registrar un nuevo viaje.</p>
          <p>Complete los datos del menor y la institución a la que se dirige.</p>

          <h3>Seguimiento</h3>
          <p>En la pantalla principal podrá ver los próximos viajes registrados, junto con el estado del viaje, la fecha y el turno.</p>
          <p>Podrá ingresar a cada viaje para ver más detalles.</p>

          <h3>Perfil</h3>
          <p>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</p>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="userStore.user?.role_id === 2">
        <ion-card-header>
          <ion-card-title>Manual del Chofer</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h3>Registro en el sistema</h3>
          <p>Ingrese a la app.</p>
          <p>Haga clic en "Registrarse".</p>
          <p>Ingrese un email y contraseña válidos. Seleccione su perfil como Chofer. Complete sus datos personales.</p>

          <h3>Alta de vehículo</h3>
          <p>Desde la sección "Vehículos" puede registrar su vehículo, incluyendo toda la documentación requerida.</p>

          <h3>Habilitaciones</h3>
          <p>Debe tener la documentación del chofer y del vehículo al día para poder tomar viajes.</p>

          <h3>Viajes</h3>
          <p>Desde la pantalla principal podrá ver los viajes asignados con la información del pasajero y la institución.</p>
          <p>Debe marcar el inicio y finalización del viaje en la app para registrar el recorrido.</p>

          <h3>Pagos</h3>
          <p>Los viajes realizados se visualizarán en la sección de pagos, indicando su estado (pendiente, pagado, etc.).</p>

          <h3>Perfil</h3>
          <p>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</p>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="userStore.user?.role_id === 3">
        <ion-card-header>
          <ion-card-title>Manual del Administrador</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h3>Ingreso al sistema</h3>
          <p>Los administradores son dados de alta por el equipo de soporte técnico.</p>
          <p>Ingrese con sus credenciales.</p>

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
