<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
        <div class="signup-box">
              <h2 class="title">Registrarse</h2>
              <p>Crea tu cuenta</p>

              <div class="input-fields">
                <InputField label="Nombre y apellido" type="text" placeholder="Juan Perez" name="full_name" v-model="form.full_name" />
                <InputField label="Mail" type="email" placeholder="example@email.com" name="email" v-model="form.email" />
                <InputField label="Contraseña" type="password" placeholder="••••••••" name="password" v-model="form.password" />
                <InputField label="Repetir contraseña" type="password" placeholder="••••••••" name="confirmPassword" v-model="form.confirmPassword" />
              </div>

              <ErrorMessage :message="errorMessage" />

              <div class="role-div">
                <ion-label>Elige tu rol</ion-label>
                <SegmentButton v-model="valorSeleccionado"/>
              </div>
              <CustomButton class="signup-button" @click="register">Continuar</CustomButton>
              
              <CustomButton color="light" :icon="logoGoogle" @click="handleLoginGoogle">Continuar con Google</CustomButton>

              <div class="link-buttons">
                  <p class="have-an-account">¿Ya tienes una cuenta?</p>
                  <LinkButton color="primary" @click="handleLogin">Ingresa</LinkButton>
              </div>
          </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonLabel } from "@ionic/vue";
import { ref } from "vue";
import InputField from "@/components/InputField.vue";
import CustomButton from "@/components/CustomButton.vue";
import LinkButton from "@/components/LinkButton.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import SegmentButton from "@/components/SegmentButton.vue";
import { postUser } from "@/services/api";
import { logoGoogle } from "ionicons/icons";
import { isValidEmail, isValidPassword } from "@/utils/utils";
import { useRouter } from "vue-router";
import { loginWithGoogle } from "@/firebase";
import { signUpGoogle } from "@/services/api";

const handleLogin = () => {
  router.push("/login");
};

const router = useRouter();

const valorSeleccionado = ref("");

const form = ref({
  email: "",
  password: "",
  confirmPassword: "",
  full_name: "",
  birth_date: "2000-01-01",
});

const errorMessage = ref("");

const register = async () => {
  errorMessage.value = "";

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = "Las contraseñas no coinciden";
    return;
  }

  if (!form.value.email || !form.value.password || !form.value.confirmPassword || !form.value.full_name) {
    errorMessage.value = "Todos los campos son obligatorios";
    return;
  }

  if (!valorSeleccionado.value) {
  errorMessage.value = "Debes seleccionar un rol";
  return;
  }

  if (!isValidEmail(form.value.email)) {
    errorMessage.value = "El email no es válido";
    return;
  }

  if (!isValidPassword(form.value.password)) {
    errorMessage.value = "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número";
    return;
  }

  try {
    const user = {
      email: form.value.email,
      password: form.value.password,
      full_name: form.value.full_name,
      role_id: parseInt(valorSeleccionado.value),
      birth_date: form.value.birth_date,
    };
    const response = await postUser(user);
    if (response?.error) {
      errorMessage.value = response.error;
      return;
    }
    else {
      router.push("/home");
    }
  } catch (error) {
    errorMessage.value = "Hubo un problema con el registro. Inténtalo nuevamente.";
  }
};

const handleLoginGoogle = async () => {
  const response = await loginWithGoogle();
  console.log(response);

  const user = {
      email: response?.email ?? '', 
      full_name: response?.displayName ?? '',
      role_id: parseInt("0"),
      profile_picture: response?.photoURL ?? '',
      phone_number: response?.phoneNumber ?? '',
      birth_date: '2000-01-01',
      is_confirmed: true,
  };
  try {
    const response = await signUpGoogle(user);
    
    if (response?.error) {
      errorMessage.value = response.error;
      return;
    }

    if ('user' in response && response.user?.role_id != 0) {
      router.push("/home");
    }
    else {
      router.push("/assign-role");
    }
  } catch (error) {
    errorMessage.value = "Hubo un problema con el registro. Inténtalo nuevamente.";
  }
};
</script>


<style scoped>
.signup-box {
text-align: center;
padding: 16px;
position: absolute;
top: 0;
margin: 0;
left: 0;
right: 0;
}

.title {
font-size: 30px;
}

.input-fields {
margin-top: 30px;
}

.signup-button {
margin-top: 30px;
margin-bottom: 20px;
}

.link-buttons {
display: inline-flex;
white-space: nowrap;
}

.role-div {
margin-top: 30px;
}

.have-an-account {
font-size: 16px;
color: gray;
margin-top: 20px;
margin-right: 0;
}

</style>
