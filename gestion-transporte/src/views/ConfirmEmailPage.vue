<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="confimation-box">
        <div v-if="success" class="message success-message fixed-center">
          <ion-icon :icon="checkmarkCircle" class="success-icon"></ion-icon>
          <p>¡Tu email ha sido confirmado correctamente!</p>
        </div>
        <div v-if="error" class="message error-message fixed-center">
          <ion-icon :icon="closeCircle" class="error-icon"></ion-icon>
          <p>{{ error }}</p>
        </div>

        <div class="link-buttons fixed-bottom ">
          <CustomButton @click="redirectToLogin">Ingresar</CustomButton>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import CustomButton from "@/components/CustomButton.vue";
import { checkmarkCircle, closeCircle } from "ionicons/icons";
import { useUserStore } from "@/store/user";

const route = useRoute();
const router = useRouter();
const success = ref(false);
const error = ref("");
const userStore = useUserStore();

const confirmEmail = async () => {
  const token = route.params.token;
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await api.get(`${API_URL}/users/confirm-email/${token}`) as any;
    if (response.status === 200) {
      userStore.setUser(response.data);
      success.value = true;
    }
  } catch (err: any) {
    error.value = err.response?.data?.error.message || "Ocurrió un error inesperado";
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  margin-top: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-message {
  color: green;
  font-weight: bold;
  font-size: 30px;
}

.error-message {
  color: red;
  font-weight: bold;
  font-size: 30px;
}

.success-icon {
  color: green;
  font-size: 100px;
}

.error-icon {
  color: red;
  font-size: 100px;
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
