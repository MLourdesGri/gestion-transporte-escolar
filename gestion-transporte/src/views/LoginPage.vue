<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-box">
        <ion-icon :icon="busOutline" class="bus-icon"></ion-icon>
        <h2 class="title">Iniciar sesión</h2>
        <p>¡Hola de nuevo!</p>

        <div class="input-fields">
            <InputField label="Mail" type="email" placeholder="example@email.com" />
            <InputField label="Contraseña" type="password" placeholder="••••••••" />
        </div>

        <CustomButton class="login-button">Iniciar sesión</CustomButton>

        <LinkButton class="forgot-password">¿Olvidaste tu contraseña?</LinkButton>

        <CustomButton color="light" :icon="logoGoogle">Continuar con Google</CustomButton>

      
      <p class="have-an-account">¿Ya tienes una cuenta?</p>
      <LinkButton color="primary" class="register-link" to="/signup">Regístrate</LinkButton>
        
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { busOutline, logoGoogle } from 'ionicons/icons';
import InputField from '@/views/components/InputField.vue';
import CustomButton from '@/views/components/CustomButton.vue';
import LinkButton from '@/views/components/LinkButton.vue';
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

.title {
  font-size: 30px;
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
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.have-an-account {
  margin-top: 30px;
  margin-bottom: 0px;
  font-size: 14px;
  color: #666;
}

.register-link {
  margin-top:0px;
  font-size: 14px;
}
</style>
