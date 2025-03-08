<template>
    <ion-page>
        <ion-content class="ion-padding">
            <div class="signup-box">
                <h2 class="title">Registrarse</h2>
                <p>Crea tu cuenta</p>

                <div class="input-fields">
                    <InputField v-model="email" label="Mail" type="email" placeholder="example@email.com" name="email"/>
                    <InputField v-model="password" label="Contraseña" type="password" placeholder="••••••••" name="password"/>
                    <InputField label="Repetir contraseña" type="password" placeholder="••••••••" name="confirmPassword"/>
                </div>

                <CustomButton @click="handleRegister" class="signup-button" to="/assign-role">Continuar</CustomButton>
                
                <CustomButton color="light" :icon="logoGoogle">Continuar con Google</CustomButton>

                <div class="link-buttons">
                    <p class="have-an-account">¿Ya tienes una cuenta?</p>
                    <LinkButton color="primary" to="/login">Ingresa</LinkButton>    
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import InputField from "@/views/components/InputField.vue";
import CustomButton from "@/views/components/CustomButton.vue";
import LinkButton from "@/views/components/LinkButton.vue";
import { registerUser } from "@/services/api";
import { logoGoogle } from "ionicons/icons";

const email = ref("");
const password = ref("");

const handleRegister = async () => {
    await registerUser({ email: email.value, password: password.value });
};

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
  margin-bottom: 20px;
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

.error-message {
  color: red;
  margin-top: 10px;
}
</style>