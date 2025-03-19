<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Usuarios</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item v-for="user in users" :key="user.id">
            <ion-label>{{ user.full_name }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  // import { getUsers } from "../services/api"; // Cambia esto si usas otro servicio
  const users = ref<any[]>([]);
  
  // const loadUsers = async () => {
  // try {
  //   const response = await getUsers();
  //   if (response && response.data) {
  //     users.value = response.data;  // Asigna solo los usuarios dentro de 'data'
  //   } else {
  //     console.error("No users found or invalid response");
  //     users.value = [];  // Manejar el caso vacío si no hay datos
  //   }
  // } catch (error) {
  //   console.error("Error loading users", error);
  //   users.value = [];  // Asegura que users siempre sea un arreglo vacío en caso de error
  // }
  // };

  
  // onMounted(() => {
  //   loadUsers();
  // });
  </script>
  
  <style scoped>
  /* Aquí puedes agregar estilos personalizados */
  </style>
  