<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-box">
        <ion-icon :icon="busOutline" class="bus-icon"></ion-icon>
        <h2>Iniciar sesión</h2>
        <p>¡Hola de nuevo!</p>

        <div class="input-fields">
            <InputField label="Email" type="email" placeholder="example@email.com" />
            <InputField label="Password" type="password" placeholder="••••••••" />
        </div>

        <CustomButton color="primary" class="login-button">Iniciar sesión</CustomButton>

        <ion-button fill="clear" class="forgot-password" @click="recuperarContrasena">
            ¿Olvidaste tu contraseña?
        </ion-button>

        <ion-button expand="full" color="light" class="google-button">
          <ion-icon :icon="logoGoogle" class="google-icon"></ion-icon>
          Continuar con Google
        </ion-button>

        <ion-button fill="clear" class="register-link" @click="registrarse">
            ¿Aún no te has registrado? Regístrate
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue';
import { busOutline, logoGoogle } from 'ionicons/icons';
import InputField from '@/views/components/InputField.vue';
import CustomButton from '@/views/components/CustomButton.vue';
</script>

<style scoped>
.login-box {
  text-align: center;
  padding: 20px;
}

.bus-icon {
  font-size: 90px;
  color: #003366;
  margin-bottom: 10px;
}

.input-fields {
  margin-top: 40px;
}

.google-icon {
  margin-right: 8px;
}

.login-button {
  margin-top: 40px;
}

.google-button {
  margin-top: 40px;
}

.forgot-password {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.register-link {
  margin-top: 40px;
  font-size: 14px;
  color: rgb(35, 155, 192);
}
</style>
