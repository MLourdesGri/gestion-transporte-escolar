<template>
    <ion-page>
      <ion-content :fullscreen="true" class="ion-padding">
        <div class="reset-password-box">
          <h2 class="title">Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña para continuar.</p>
  
          <div class="input-fields">
            <InputField
              label="Nueva Contraseña"
              type="password"
              placeholder="••••••••"
              name="newPassword"
              v-model="form.newPassword"
            />
            <InputField
              label="Confirmar Contraseña"
              type="password"
              placeholder="••••••••"
              name="confirmPassword"
              v-model="form.confirmPassword"
            />
          </div>
  
          <ErrorMessage :message="errorMessage" />
  
          <CustomButton class="reset-button" @click="handleResetPassword">Restablecer Contraseña</CustomButton>
          <div class="link-buttons fixed-bottom">
            <LinkButton color="primary" @click="handleLogin">Ir al login</LinkButton>
          </div>
        </div>
      </ion-content>
      
  
      <ion-toast :is-open="showToast" message="Tu contraseña ha sido restablecida con éxito." color="success" duration="2000" @didDismiss="showToast = false" />
    </ion-page>
  </template>
  
<script setup lang="ts">
    import { IonPage, IonContent, IonToast } from "@ionic/vue";
    import { ref } from "vue";
    import InputField from "@/components/InputField.vue";
    import CustomButton from "@/components/CustomButton.vue";
    import ErrorMessage from "@/components/ErrorMessage.vue";
    import { resetPassword } from "@/services/api"; 
    import { isValidPassword } from "@/utils/utils"; 
    import { useRoute } from "vue-router";
    import { useRouter } from "vue-router";
    import LinkButton from "@/components/LinkButton.vue";

    const form = ref({
    newPassword: "",
    confirmPassword: "",
    });

    const route = useRoute();
    const token = route.params.token as string;

    const router = useRouter();

    const handleLogin = () => {
      router.push("/login");
    };
    
    const errorMessage = ref("");
    const showToast = ref(false);

    const handleResetPassword = async () => {
    errorMessage.value = "";

    if (!form.value.newPassword || !form.value.confirmPassword) {
        errorMessage.value = "Las contraseñas son obligatorias";
        return;
    }

    if (form.value.newPassword !== form.value.confirmPassword) {
        errorMessage.value = "Las contraseñas no coinciden";
        return;
    }

    if (!isValidPassword(form.value.newPassword)) {
        errorMessage.value = "La contraseña no es válida. Debe tener al menos 8 caracteres, una mayúscula y un número.";
        return;
    }

    try {
        const response = await resetPassword(form.value.newPassword, token);
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
.reset-password-box {
text-align: center;
padding: 20px;
}

.title {
font-size: 22px;
margin-bottom: 10px;
}

.input-fields {
margin-top: 40px;
}

.reset-button {
margin-top: 40px;
margin-bottom: 20px;
}

.link-buttons {
display: flex;
justify-content: center;
align-items: center;
white-space: nowrap;
}

.go-back {
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
