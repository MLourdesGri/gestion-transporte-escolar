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
  import { ref, onMounted } from "vue";
  import { getUser } from "../services/api"; 
  const users = ref<any[]>([]);
  
  const loadUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await getUser(token? token : "");
    if (response && response.data) {
      users.value = response.data; 
    } else {
      console.error("No users found or invalid response");
      users.value = [];  
    }
  } catch (error) {
    console.error("Error loading users", error);
    users.value = []; 
  }
  };

  
  onMounted(() => {
    loadUsers();
  });
  </script>
  
  <style scoped>
  </style>
  