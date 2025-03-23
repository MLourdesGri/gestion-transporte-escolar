<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button color="primary"></ion-menu-button>
          </ion-buttons>
          <ion-title>Perfil</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true" class="ion-padding">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Perfil</ion-title>
          </ion-toolbar>
        </ion-header>
  
        <div class="avatar-box">
          <div class="pic">
            <img class="pic-img" :src="user?.profile_picture || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Foto de perfil"/>
          </div>
          <strong>{{user?.email || form.email}}</strong> 
          <div v-if="isEditing" class="upload-photo">
            <CustomButton class="upload-photo-button" color="light">Subir foto</CustomButton>
          </div>
        </div>

        <div class="input-fields">
          <InputField label="Nombre y apellido" type="text" :placeholder= "user?.full_name || 'Juan Perez'" name="full_name" v-model="form.full_name" :disabled="!isEditing"/>
          <InputField label="Número de telefono" type="text" :placeholder="user?.phone_number || '1111111'" name="phone_number" v-model="form.phone_number" :disabled="!isEditing"/>
          <InputField label="Dirección" type="text" :placeholder="user?.address || 'Casa 123'" name="address" v-model="form.address" :disabled="!isEditing"/>
        </div>

        
        <ErrorMessage :message="errorMessage" />

        <CustomButton class="edit-profile" @click="toggleEdit">
          {{ isEditing ? 'Guardar' : 'Editar perfil' }}
        </CustomButton>

        <ion-toast v-if="showToast" message="Perfil actualizado correctamente" position="bottom" color="light" :isOpen="!errorMessage" duration="3000"></ion-toast>
      </ion-content>
    </ion-page>
</template>
  
<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonToast } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import InputField from '@/components/InputField.vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { getUser, putUser } from '@/services/api';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface User {
  email: string;
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture: string;
}

const user = ref<User | null>(null);

const errorMessage = ref("");

const form = ref({
  email: "",
  full_name: "",
  phone_number: "",
  address: "",
  profile_picture: "",
});

const getProfileData = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const userResponse = await getUser(token);
      console.log(userResponse);
      user.value = userResponse.data;
    }
    catch (error) {
      console.error("Error cargando usuario", error);
      user.value = null;
    }
  }
};

onMounted(getProfileData);

// const profileImage = ref<string | null>(null);

// const selectImage = async () => {
//   try {
//     const image = await Camera.getPhoto({
//       quality: 90,
//       source: CameraSource.Photos,  // Permite solo seleccionar desde la galería
//       resultType: CameraResultType.Uri,  // Devuelve una URI de la imagen
//     });

//     profileImage.value = image.webPath || null;  // Almacena la URI de la imagen seleccionada
//   } catch (error) {
//     console.error("Error al seleccionar la imagen:", error);
//   }
// };

const isEditing = ref(false);
const showToast = ref(false);

const toggleEdit = async () => {
  if (isEditing.value) {
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }

  isEditing.value = !isEditing.value;

  errorMessage.value = "";
  
  if (!isEditing.value) {
    try {
      const userEdited = {
        full_name: form.value.full_name,
        phone_number: form.value.phone_number,
        address: form.value.address,
      };

      const token = localStorage.getItem("token");

      if (!token) {
        errorMessage.value = "No se encontró el token. Inicia sesión nuevamente.";
        return;
      }

      const response = await putUser(userEdited, token);

      if (response?.error) {
        errorMessage.value = response.error;
        return;
      }
      
      await getProfileData();
    } catch (error) {
      errorMessage.value = "Hubo un problema con la actualización. Inténtalo nuevamente.";
    }
  }
};
</script>
  
<style scoped>
.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  gap: 20px;
}

.pic {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
}

.pic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input-fields {
  margin-top: 70px;
}

.edit-profile {
  margin-top: 30px;
}
</style>  