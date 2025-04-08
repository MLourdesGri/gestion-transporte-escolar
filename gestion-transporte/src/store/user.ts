import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as null | { full_name: string; role_id: number },
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
    },
  },
});

