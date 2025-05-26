import { defineStore } from 'pinia';
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as null | { full_name: string; role_id: number, address: string },
    token: null as null | string,
  }),
  actions: {
    setUser(userData: any) {
      this.user = userData;
    },
    setToken(token: string) {
      this.token = token;
    },
    logout() {
      this.user = null;
      this.token = null;
    }
  },
  persist: true,
});

