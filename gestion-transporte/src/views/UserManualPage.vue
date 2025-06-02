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
      <ion-card>
        <ion-card-header>
          <ion-card-title>Manual del Tutor</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ul>
            <li>Registro en el sistema</li>
            <ul>
              <li>Ingrese a la app.</li>
              <li>Haga clic en "Registrarse".</li>
              <li>Ingrese un email y contraseña válidos. Seleccione su perfil como Tutor (esta elección no se podrá cambiar después). Complete sus datos personales.</li>
            </ul>
            <li>Alta de dirección</li>
            <ul>
              <li>Desde la sección "Perfil" puede ingresar su dirección para poder comenzar a solicitar viajes.</li>
            </ul>
            <li>Solicitud de viaje</li>
            <ul>
              <li>Desde la pantalla de inicio, haga clic en el botón flotante "+" para registrar un nuevo viaje.</li>
              <li>Complete los datos del menor y la institución a la que se dirige.</li>
            </ul>
            <li>Seguimiento</li>
            <ul>
              <li>En la pantalla principal podrá ver los próximos viajes registrados, junto con el estado del viaje, la fecha y el turno.</li>
              <li>Podrá ingresar a cada viaje para ver más detalles.</li>
            </ul>
            <li>Perfil</li>
            <ul>
              <li>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</li>
            </ul>
          </ul>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Manual del Chofer</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ul>
            <li>Registro en el sistema</li>
            <ul>
              <li>Ingrese a la app.</li>
              <li>Haga clic en "Registrarse".</li>
              <li>Ingrese un email y contraseña válidos. Seleccione su perfil como Chofer. Complete sus datos personales.</li>
            </ul>
            <li>Alta de vehículo</li>
            <ul>
              <li>Desde la sección "Vehículos" puede registrar su vehículo, incluyendo toda la documentación requerida.</li>
            </ul>
            <li>Habilitaciones</li>
            <ul>
              <li>Debe tener la documentación del chofer y del vehículo al día para poder tomar viajes.</li>
            </ul>
            <li>Viajes</li>
            <ul>
              <li>Desde la pantalla principal podrá ver los viajes asignados con la información del pasajero y la institución.</li>
              <li>Debe marcar el inicio y finalización del viaje en la app para registrar el recorrido.</li>
            </ul>
            <li>Pagos</li>
            <ul>
              <li>Los viajes realizados se visualizarán en la sección de pagos, indicando su estado (pendiente, pagado, etc.).</li>
            </ul>
            <li>Perfil</li>
            <ul>
              <li>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</li>
            </ul>
          </ul>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Manual del Administrador</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ul>
            <li>Ingreso al sistema</li>
            <ul>
              <li>Los administradores son dados de alta por el equipo de soporte técnico.</li>
              <li>Ingrese con sus credenciales.</li>
            </ul>
            <li>Visualización de habilitaciones</li>
            <ul>
              <li>Desde la sección correspondiente, puede ver y gestionar las habilitaciones de vehículos y choferes.</li>
            </ul>
            <li>Gestión de pagos</li>
            <ul>
              <li>Acceda a la sección de pagos para aprobar y registrar los pagos realizados a choferes.</li>
            </ul>
            <li>Estadísticas y reportes</li>
            <ul>
              <li>Desde la sección de reportes puede visualizar gráficos e informes con métricas de uso, viajes realizados, pagos, etc.</li>
            </ul>
            <li>Perfil</li>
            <ul>
              <li>Puede editar sus datos personales y cargar una foto de perfil desde la sección "Perfil".</li>
            </ul>
          </ul>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonCardContent } from '@ionic/vue';
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
ion-card-content ul {
  margin-left: 15px;
  margin-bottom: 10px;
}
ion-card-content li {
  margin-bottom: 5px;
}
</style>
