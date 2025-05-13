<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button class="custom-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>Notificaciones</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="notifications.length === 0" class="no-children">
        No hay notificaciones por el momento.
      </div>

      <ion-card
          v-for="(notif, index) in notifications"
          :key="index"
          :class="{ 'unread': !notif.is_read }"
          @click="openNotification(notif)"
          style="cursor: pointer;"
        >

        <ion-card-header>
          <ion-card-title>{{ notif.title }}</ion-card-title>
          <ion-card-subtitle>{{ notif.detail.substring(0, 60) }}...</ion-card-subtitle>
        </ion-card-header>
      </ion-card>

      <!-- Modal para ver detalle -->
      <ion-modal :is-open="selectedNotification !== null" @did-dismiss="selectedNotification = null">
        <ion-header>
          <ion-toolbar>
            <ion-title>Detalle</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="selectedNotification = null">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <h2>{{ selectedNotification?.title }}</h2>
          <p>{{ selectedNotification?.detail }}</p>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonContent, IonHeader, IonMenuButton, IonModal, IonPage, IonTitle, IonToolbar
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { getNotificationsByUser, markNotificationAsRead } from '../services/api';
import { useUserStore } from '@/store/user';


const unreadCount = ref(0);
const notifications = ref<any[]>([]);
const selectedNotification = ref<any | null>(null);
const userStore = useUserStore();

interface Notification {
  id: number;
  title: string;
  detail: string;
  is_read: boolean; 
  created_at: string;
}

const loadNotifications = async () => {
  if (userStore.token) {
    try {
      const response = await getNotificationsByUser(userStore.token) as { data: Notification[] };
      const sorted = response.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      notifications.value = sorted;

      const unread = sorted.filter(n => !n.is_read);
      unreadCount.value = unread.length;
    } catch (error) {
      console.error("Error al cargar notificaciones", error);
    }
  }
};



onMounted(
  () => {
  loadNotifications();
}
);

const openNotification = async (notif: any) => {
  selectedNotification.value = notif;
  if (!notif.is_read && userStore.token) {
    try {
      await markNotificationAsRead(notif.notification_id, userStore.token);
      notif.is_read = true;
    } catch (error) {
      console.error("Error al cargar notificaciones", error);
    }
  }
};
</script>

<style scoped>
.no-children {
  text-align: center;
  padding: 20px;
  color: gray;
  font-size: 18px;
}
.custom-menu {
  --color: #003366;
}
ion-card {
  margin: 12px;
}

.unread {
  border-left: 5px solid #003366; 
  background-color: #f0f8ff;
}

</style>
