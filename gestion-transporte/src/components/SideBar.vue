<template>
  <IonPage>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="inbox-list">
            <ion-list-header>TeLlevoAlCole</ion-list-header>
            <ion-note>Hola, {{ userStore.user?.full_name || "Invitado" }}!</ion-note>

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <router-link :to="p.url" class="menu-link">
                <ion-item 
                  @click="selectedIndex = i" 
                  router-direction="root"
                  lines="none"
                  :detail="false"
                  class="hydrated" 
                  :class="{ selected: selectedIndex === i }"
                >
                  <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.iosIcon"></ion-icon>
                  <ion-label>{{ p.title }}</ion-label>
                </ion-item>
              </router-link>
            </ion-menu-toggle>

            <ion-menu-toggle :auto-hide="false">
              <ion-item @click="showLogoutAlert = true" lines="none" class="hydrated logout-btn">
                <ion-icon aria-hidden="true" slot="start" :ios="logOutOutline" :md="logOutOutline"></ion-icon>
                <ion-label>Cerrar Sesión</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
    <IonAlert
      :is-open="showLogoutAlert"
      header="Confirmación"
      message="¿Estás seguro que deseas cerrar sesión?"
      :buttons="[
        {
          text: 'Sí',
          handler: logout,
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => (showLogoutAlert = false),
        },
      ]"
    />

  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
  IonAlert,
} from '@ionic/vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { homeOutline, personOutline, settingsOutline, logOutOutline, carOutline, accessibilityOutline, pricetagOutline } from 'ionicons/icons';
import { getUser } from '@/services/api';
import { useUserStore } from '@/store/user';

const router = useRouter();
const route = useRoute();
const selectedIndex = ref(0);
const showLogoutAlert = ref(false);

interface User {
  full_name: string;
  role_id: number;
}

const userStore = useUserStore();

const loadUser = async () => { 
  const token = userStore.token;
  
  if (token) {
    try {
      const userResponse = await getUser(token) as { data: User };
      userStore.setUser(userResponse.data);
    }
    catch (error) {
      console.error("Error cargando usuario", error);
      userStore.setUser(null);
    }
  } 
}

onMounted(() => {
  loadUser();
});

watch(() => route.path, () => {
  loadUser();
});

// Aca hay q poner las rutas y roles
// Roles: 1- padre, 2- chofer, 3- admin
const allPages = [
  { title: "Inicio", url: "/home", iosIcon: homeOutline, roles: [1, 2, 3] },
  { title: "Perfil", url: "/profile", iosIcon: personOutline, roles: [1, 2, 3] },
  { title: "Hijos", url: "/children", iosIcon: accessibilityOutline, roles: [1] },
  { title: 'Habilitaciones', url: "/authorization", iosIcon: carOutline, roles: [2, 3] },
  {title: "Tarifas", url: "/prices", iosIcon: pricetagOutline, roles: [2]},
  { title: "Configuracion", url: "/settings", iosIcon: settingsOutline, roles: [1, 2] },
];

const appPages = computed(() => {
  return allPages.filter(page => typeof userStore.user?.role_id === 'number' && page.roles.includes(userStore.user.role_id as number));
});

const path = window.location.pathname.split("/")[1];
if (path !== undefined) {
  selectedIndex.value = allPages.findIndex(page => page.url === `/${path}`);
}

const logout = () => {
  userStore.logout()
  router.replace({ name: 'Login' })
}
</script>

<style scoped>
.menu-item {
  text-decoration: none;
  color: inherit;
}
.menu-link {
  text-decoration: none;
  color: inherit; 
}

ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;
  min-height: 20px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-blue);
}

ion-menu.md ion-item ion-icon {
  color: #003366;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-blue);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;
  color: var(--ion-color-blue);
}

ion-item.selected {
  --color: var(--ion-color-blue);
}

/* Estilo para el botón de cerrar sesión */
.logout-btn {
  margin-top: 20px;
}

</style>
