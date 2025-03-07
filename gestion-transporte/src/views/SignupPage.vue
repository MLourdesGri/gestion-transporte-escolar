<template>
    <ion-page>
        <ion-content class="ion-padding">
            <div class="signup-box">
                <h2 class="title">Registrarse</h2>
                <p>Crea tu cuenta</p>

                <div class="input-fields">
                    <InputField label="Email" type="email" placeholder="example@email.com" />
                    <InputField label="Contraseña" type="password" placeholder="••••••••" />
                    <InputField label="Ingrese nuevamente su contraseña" type="password" placeholder="••••••••" />
                </div>

                <CustomButton color="primary" class="signup-button" to="/assign-role">Continuar</CustomButton>

                <div class="link-buttons">
                    <!-- <LinkButton to="/login">¿Ya tienes una cuenta?</LinkButton> -->
                    <p class="have-an-account">¿Ya tienes una cuenta?</p>
                    <LinkButton color="primary" to="/login">Inicia sesión</LinkButton>    
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import InputField from '@/views/components/InputField.vue';
import CustomButton from '@/views/components/CustomButton.vue';
import LinkButton from './components/LinkButton.vue';
</script>

<style scoped>
.signup-box {
  text-align: center;
  padding: 20px;
}

.title {
  font-size: 30px;
}

.input-fields {
  margin-top: 40px;
}

.signup-button {
  margin-top: 60px;
}

.link-buttons {
  display: inline-flex;
  white-space: nowrap;
}

.have-an-account {
  font-size: 16px;
  color: gray;
  margin-top: 20px;
  margin-right: 0;
}
</style>