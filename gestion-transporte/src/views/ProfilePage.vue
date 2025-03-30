<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
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
            <img class="pic-img" :src="previewProfilePicture || user?.profile_picture || 'https://ionicframework.com/docs/img/demos/avatar.svg'" alt="Foto de perfil"/>
          </div>
          <strong>{{user?.email || form.email}}</strong> 
          <div v-if="isEditing" class="upload-photo">
            <InputFile accept="image/*" @file-uploaded="onFileUploaded">Subir foto</InputFile>
          </div>
        </div>

        <div class="input-fields">
          <InputField label="Nombre y apellido" type="text" name="full_name" v-model="form.full_name" :disabled="!isEditing"/>
          <InputField label="Número de telefono" type="text" name="phone_number" v-model="form.phone_number" :disabled="!isEditing"/>
          <InputField label="Dirección" type="text" name="address" v-model="form.address" :disabled="!isEditing"/>
          <DatePicker label="Fecha de nacimiento" name="birth_date" v-model="form.birth_date" :disabled="!isEditing"/>
        </div>

        
        <ErrorMessage :message="errorMessage" />

        <CustomButton class="edit-profile" @click="toggleEdit">
          {{ isEditing ? 'Guardar' : 'Editar perfil' }}
        </CustomButton>

        <ion-toast v-if="showToast" message="Perfil actualizado correctamente" position="bottom" color="success" :isOpen="!errorMessage" duration="3000"></ion-toast>

        <ion-loading :isOpen="isLoading" message="Actualizando foto de perfil..." />
      </ion-content>
    </ion-page>
</template>
  
<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonToast, IonLoading } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import InputField from '@/components/InputField.vue';
import CustomButton from '@/components/CustomButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import DatePicker from '@/components/DatePicker.vue';
import InputFile from '@/components/InputFile.vue';
import { getUser, putUser } from '@/services/api';

interface User {
  email: string;
  full_name: string;
  phone_number: string;
  address: string;
  profile_picture: string;
  birth_date: string;
}

const user = ref<User | null>(null);

const errorMessage = ref("");

const form = ref({
  email: "",
  full_name: "",
  phone_number: "",
  address: "",
  profile_picture: "",
  birth_date: "",
});

const getProfileData = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const userResponse = await getUser(token) as {data: User};
      user.value = userResponse.data;

      form.value.full_name = user.value.full_name;
      form.value.phone_number = user.value.phone_number;
      form.value.address = user.value.address;
      form.value.email = user.value.email;
      form.value.profile_picture = user.value.profile_picture;
      form.value.birth_date = user.value.birth_date;
    }
    catch (error) {
      console.error("Error cargando usuario", error);
      user.value = null;
    }
  }
};

onMounted(getProfileData);

const previewProfilePicture = ref("");
const isEditing = ref(false);
const showToast = ref(false);
const isLoading = ref(false);

const onFileUploaded = async (url: string) => {
  previewProfilePicture.value = url;
  isLoading.value = true;

  setTimeout(() => {
    form.value.profile_picture = url;
    isLoading.value = false;
  }, 3000);
};

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
        birth_date: form.value.birth_date,
        profile_picture: previewProfilePicture.value || form.value.profile_picture,
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