<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button class="custom-menu"></ion-menu-button>
          </ion-buttons>
          <ion-title>Hijos</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Hijos</ion-title>
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
            <p>No tienes hijos registrados.</p>
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
  
        <!-- Modal para agregar o editar hijo -->
        <ion-modal ref="modalRef" :is-open="isModalOpen" @did-dismiss="closeModal">
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button @click="cancel()">Cancelar</ion-button>
              </ion-buttons>
              <ion-buttons slot="end">
                <ion-button :strong="true" @click="confirm()">Confirmar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <InputField label="Nombre" type="text" name="name" placeholder="" v-model="form.name" />
            <InputField label="Apellido" type="text" name="last_name" placeholder="" required="true" v-model="form.last_name" />
            <InputField label="Edad" type="number" name="age" placeholder="" v-model="form.age" />
            <InputField label="Escuela" type="text" name="school" placeholder="" v-model="form.school" />
          </ion-content>
        </ion-modal>
  
        <ion-toast v-model:isOpen="showToast" message="Hijo creado/actualizado correctamente" position="bottom" color="success" duration="3000"></ion-toast>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardSubtitle, IonCardTitle, IonAlert, IonFab, IonFabButton, IonIcon, IonModal, IonButton, IonToast} from '@ionic/vue';
  import InputField from '@/components/InputField.vue';
  import { onMounted, ref } from "vue";
  import { getChildrenByUser, getUser, postChild, putChild } from "../services/api"; 
  import { add } from 'ionicons/icons';
  import ErrorMessage from '@/components/ErrorMessage.vue';
  
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
  const user = ref<User | null>(null);
  const role_id = ref<number | null>(null);
  const showAlert = ref(false); 
  const errorMessage = ref("");
  const showToast = ref(false);
  const currentChild = ref<Child | null>(null); // Agregado para editar un hijo
  const isModalOpen = ref(false); // Estado para abrir/cerrar modal
  
  const loadChildren = async () => {
    const token = localStorage.getItem("token");
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
        console.error("Error cargando hijos", error);
        children.value = [];
      }
    }
  };
  
  const loadUser = async () => { 
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const userResponse = await getUser(token) as { data: User };
        user.value = userResponse.data;
        role_id.value = userResponse.data.role_id;
  
        if (user.value && !user.value.is_confirmed) {
          showAlert.value = true; 
        }
      } catch (error) {
        console.error("Error cargando usuario", error);
        user.value = null;
        role_id.value = null;
      }
    }
  };
  
  onMounted(() => {
    loadChildren();
    loadUser();
  });
  
  const cancel = () => {
    isModalOpen.value = false; // Cerrar el modal cuando se cancela
    currentChild.value = null; // Limpiar el hijo actual
  };

  const closeModal = () => {
    isModalOpen.value = false; // Cerrar el modal
    currentChild.value = null; // Limpiar el hijo actual
  };

  const confirm = async () => {
    await saveChild();
    isModalOpen.value = false; // Cerrar el modal después de confirmar
    loadChildren(); // Recargar la lista de hijos
  };
  
  const openModal = () => {
    currentChild.value = null; // Limpiar cualquier hijo anterior
    form.value = { name: '', last_name: '', age: '', school: '' }; // Limpiar el formulario
    isModalOpen.value = true; // Abrir el modal
  };
  
  // Nuevo hijo o editar uno existente
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
      const token = localStorage.getItem("token");
      if (!token) {
        errorMessage.value = "No se pudo autenticar. Por favor, inicie sesión nuevamente.";
        return;
      }
      if (currentChild.value) {
        // Editar hijo
        response = await putChild(currentChild.value.child_id, childData, token);
      } else {
        // Crear nuevo hijo
        response = await postChild(childData, token);
      }
      if (response && typeof response === 'object' && 'data' in response) {
        showToast.value = true;
        setTimeout(() => {
          showToast.value = false;
        }, 3000);
      } else {
        errorMessage.value = "Error al crear o editar el hijo. Inténtalo nuevamente.";
      }
    } catch (error) {
      console.error(error);
      errorMessage.value = "Hubo un problema. Inténtalo nuevamente.";
    }
  };
  
  // Abrir el modal para editar un hijo
  const editChild = (child: Child) => {
    currentChild.value = child;
    form.value = { ...child, age: child.age.toString() }; // Convertir 'age' a string y llenar el formulario con los datos del hijo
    isModalOpen.value = true; // Mostrar el modal
  };
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
    --color: white; /* Color del icono */
  }
  .custom-menu {
    --color: #003366; /* Color del icono */
  }
  </style>
  