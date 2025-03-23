<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="forgot-password-box">
          <h2 class="title single-line">Recuperar Contraseña</h2>
          <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
  
          <div class="input-fields">
            <InputField label="Mail" type="email" placeholder="example@email.com" name="email" v-model="form.email" />
          </div>
  
          <ErrorMessage :message="errorMessage" />
  
          <CustomButton class="send-button" @click="sendResetLink">Enviar</CustomButton>
          
          <div class="link-buttons fixed-bottom">
            <p class="remember-password">¿Recordaste tu contraseña?</p>
            <LinkButton color="primary" @click="handleLogin">Ingresa</LinkButton>
          </div>
        </div>
      </ion-content>
  
      <ion-toast :is-open="showToast" message="Correo enviado!" color="success" duration="3000" @didDismiss="showToast = false" />
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonPage, IonContent, IonToast } from "@ionic/vue";
  import { ref } from "vue";
  import InputField from "@/components/InputField.vue";
  import CustomButton from "@/components/CustomButton.vue";
  import LinkButton from "@/components/LinkButton.vue";
  import ErrorMessage from "@/components/ErrorMessage.vue";
  import { sendPasswordReset } from "@/services/api";
  import { isValidEmail } from "@/utils/utils";
  import { useRouter } from "vue-router";
  
  const form = ref({ email: "" });
  const errorMessage = ref("");
  const showToast = ref(false);

  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };
  
  const sendResetLink = async () => {
    errorMessage.value = "";
  
    if (!form.value.email) {
      errorMessage.value = "El email es obligatorio";
      return;
    }
  
    if (!isValidEmail(form.value.email)) {
      errorMessage.value = "El email no es válido";
      return;
    }
  
    try {
      const response = await sendPasswordReset(form.value.email);
      if (response?.error) {
        errorMessage.value = response.error;
      } else {
        errorMessage.value = "";  
        showToast.value = true;   
      }
    } catch (error) {
      errorMessage.value = "Hubo un problema. Inténtalo nuevamente.";
    }
  };
  </script>
  
  <style scoped>
  .forgot-password-box {
    text-align: center;
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: 100%;
  }
  
  .input-fields {
    margin-top: 40px;
  }
  
  .send-button {
    margin-top: 40px;
    margin-bottom: 20px;
  }
  
  .link-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
  }
  
  .remember-password {
    font-size: 16px;
    color: gray;
    margin-right: 5px;
  }
  
  .fixed-bottom {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
  }
  </style>
  