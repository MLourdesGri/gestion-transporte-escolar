<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="confirmation-box">
        <h2 class="title single-line">Confirmación de Email</h2>
   
        <div v-if="success" class="message success-message fixed-center">
          <p>¡Tu email ha sido confirmado correctamente!</p>
        </div>
        <div v-if="error" class="message error-message fixed-center">
          <p>{{ error }}</p>
        </div>

        <div class="link-buttons fixed-bottom ">
            <CustomButton @click="redirectToLogin">Ingresa</CustomButton>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonSpinner } from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import CustomButton from "@/components/CustomButton.vue";
import LinkButton from "@/components/LinkButton.vue";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const error = ref("");

const confirmEmail = async () => {
  const token = route.params.token;
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${API_URL}/users/confirm-email/${token}`);
    if (response.status === 200) {
      success.value = true;
    }
  } catch (err: any) {
    error.value = err.response?.data?.error.message || "Ocurrió un error inesperado";
  } finally {
    loading.value = false;
  }
};

const redirectToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  confirmEmail();
});
</script>

<style scoped>
.confirmation-box {
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

.message {
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
}

.success-message {
  color: green;
  font-weight: bold;
}

.error-message {
  color: red;
  font-weight: bold;
}

.confirm-button {
  margin-top: 40px;
}

.link-buttons {
  margin-left: 10px;
  margin-right: 10px;
}
  
  .fixed-bottom {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
  }
  
</style>
