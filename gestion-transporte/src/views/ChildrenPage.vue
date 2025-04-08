<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title>Alumnos</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Alumnos</ion-title>
          </ion-toolbar>
        </ion-header>
  
        <template v-if="children.length > 0">
          <ion-card v-for="child in children" :key="child.child_id" :button="true" @click="editChild(child)">
            <ion-card-header>
              <ion-card-title>{{ child.name }} {{ child.last_name }}</ion-card-title>
              <ion-card-subtitle>Edad: {{ child.age }}</ion-card-subtitle>
              <ion-card-subtitle>Escuela: {{ child.school }}</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </template>
  
        <template v-else>
          <div class="no-children">
            <p>No tienes alumnos registrados.</p>
          </div>
        </template>
  
        <ion-alert
          v-if="showAlert"
          :is-open="showAlert"
          header="Cuenta no confirmada"
          message="Revise su casilla de correo y confirme su cuenta para continuar usando la aplicación."
          backdrop-dismiss="false"
        />
  
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button class="custom-fab" id="open-modal" expand="block" @click="openModal">
            <ion-icon :icon="add"></ion-icon>
          </ion-fab-button>
        </ion-fab>
  
        <ErrorMessage :message="errorMessage" duration="3000" />
  
        <ion-modal ref="modalRef" :is-open="isModalOpen" @did-dismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button @click="cancel()">Cancelar</ion-button>
            </ion-buttons>
            <ion-buttons slot="end">
              <ion-button v-if="isEditing || !currentChild" :strong="true" @click="confirm()">Confirmar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <InputField label="Nombre" type="text" v-model="form.name" :disabled="!isEditing" />
          <InputField label="Apellido" type="text" v-model="form.last_name" :disabled="!isEditing" />
          <InputField label="Edad" type="number" v-model="form.age" :disabled="!isEditing" />
          <InputField label="Escuela" type="text" v-model="form.school" :disabled="!isEditing" />
          
          <div class="button-group" v-if="currentChild">
            <ion-button expand="full" @click="startEditing">Editar</ion-button>
            <ion-button expand="full" color="danger" id="cancelButton">Eliminar</ion-button>
          </div>
        </ion-content>
      
        <ion-alert
          trigger="cancelButton"
          header="Eliminar alumno"
          :buttons="alertButtons"
          message="Está seguro de que desea eliminar al alumno?"
        ></ion-alert>

      </ion-modal>
        <ion-toast v-model:isOpen="showToast" message="Alumno creado/actualizado correctamente" position="bottom" color="success" duration="3000"></ion-toast>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonAlert, IonFab, IonFabButton, IonIcon, IonModal, IonButton, IonToast} from '@ionic/vue';
  import InputField from '@/components/InputField.vue';
  import { onMounted, ref } from "vue";
  import { getChildrenByUser, getUser, postChild, putChild, deleteChild } from "../services/api"; 
  import { add } from 'ionicons/icons';
  import ErrorMessage from '@/components/ErrorMessage.vue';
  import { useUserStore } from '@/store/user';
  
  interface Child {
    child_id: number;
    name: string;
    last_name: string;
    age: number;
    school: string;
  }
  
  interface User {
    full_name: string;
    role_id: number;
    is_confirmed: boolean; 
  }
  
  const form = ref({
    name: '',
    last_name: '',
    age: '',
    school: ''
  });
  
  const children = ref<Child[]>([]);
  const showAlert = ref(false); 
  const errorMessage = ref("");
  const showToast = ref(false);
  const currentChild = ref<Child | null>(null); 
  const isModalOpen = ref(false); 
  const isEditing = ref(false);

  const userStore = useUserStore();
  
  const loadChildren = async () => {
    const token = userStore.token;
    if (token) {
      try {
        const childResponse = await getChildrenByUser(token);
        if (childResponse && typeof childResponse === "object" && "data" in childResponse) {
          const childData = childResponse.data;
          children.value = Array.isArray(childData) ? childData : (childData ? [childData] : []);
        } else {
          children.value = [];
        }
      } catch (error) {
        console.error("Error cargando alumnos", error);
        children.value = [];
      }
    }
  };
  
  const token = userStore.token;
  
  const loadUser = async () => { 
  
    if (token) {
      try {
        const userResponse = await getUser(token) as { data: User };
        userStore.setUser(userResponse.data);
  
        if (userResponse.data && !userResponse.data.is_confirmed) {
          showAlert.value = true; 
        }
      } catch (error) {
        console.error("Error cargando usuario", error);
        userStore.setUser(null);
      }
    }
  };
  
  onMounted(() => {
    loadChildren();
    loadUser();
  });
  
  const cancel = () => {
    isModalOpen.value = false;
    currentChild.value = null;
    isEditing.value = false;
  };

  const closeModal = () => {
    isModalOpen.value = false; 
    currentChild.value = null; 
  };

  const confirm = async () => {
    await saveChild();
    isModalOpen.value = false; 
    loadChildren();
  };
  
  const openModal = () => {
    currentChild.value = null; 
    isEditing.value = true;
    form.value = { name: '', last_name: '', age: '', school: '' }; 
    isModalOpen.value = true; 
  };
  
  const saveChild = async () => {
    const childData = {
      name: form.value.name,
      last_name: form.value.last_name,
      age: form.value.age,
      school: form.value.school
    };
  
    if (!childData.name || !childData.last_name || !childData.age || !childData.school) {
      console.error("Error: Campos incompletos");
      return;
    }
  
    try {
      let response;
      
      if (!token) {
        errorMessage.value = "No se pudo autenticar. Por favor, inicie sesión nuevamente.";
        return;
      }
      if (currentChild.value) {
        response = await putChild(currentChild.value.child_id, childData, token);
      } else {
        response = await postChild(childData, token);
      }
      if (response && typeof response === 'object' && 'data' in response) {
        showToast.value = true;
        setTimeout(() => {
          showToast.value = false;
        }, 3000);
      } else {
        errorMessage.value = "Error al crear o editar el alumno. Inténtalo nuevamente.";
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = "Hubo un problema. Inténtalo nuevamente.";
    }
  };
  
  const editChild = (child: Child) => {
    currentChild.value = child;
    form.value = { ...child, age: child.age.toString() };
    isModalOpen.value = true; 
    isEditing.value = false;
  };

  const startEditing = () => {
  isEditing.value = true;
  };

  const alertButtons = [
  {
    text: 'Cancelar'
  },
  {
    text: 'Confirmar',
    handler: async () => {  
      if (currentChild.value && token) {
        try {
          await deleteChild(currentChild.value.child_id, token); 
          closeModal();
          await loadChildren();
          currentChild.value = null;
        } catch (error) {
          console.error("Error eliminando alumno", error);
        }
      } else {
        console.error("Token inválido o alumno no seleccionado");
      }
    },
  },
];

  </script>
  
  <style scoped>
  .no-children {
    text-align: center;
    padding: 20px;
    color: gray;
    font-size: 18px;
  }
  .custom-fab {
    --background: #003366;
    --background-hover: #002244;
    --color: white; 
  }
  .custom-menu {
    --color: #003366; 
  }
  .button-group {
    display: flex;
    position: absolute;
    left: 0;
    width: 100%;
    bottom: 0;
  }
  .button-group ion-button {
    flex: 1;
  }
  </style>
  