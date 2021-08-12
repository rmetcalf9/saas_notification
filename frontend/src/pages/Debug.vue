<template>
  <q-page class="flex flex-center">
    <div class="col">
      <q-list bordered padding>
        <q-item>
          <q-item-label header>Debug Information and functions</q-item-label>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Route Params</q-item-label>
            {{ $route.params }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Full Path</q-item-label>
            {{ $route.fullPath }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Login</q-item-label>
            <div>isAdminUser: {{ isAdminUser }}</div>
            <div>isLoggedIn: {{ isLoggedIn }}</div>
            <div>loginUIBaseURL:<br/> {{ loginUIBaseURL }}</div>
          </q-item-section>
        </q-item>
        <q-item>
           <q-item-section>
           <q-item-label>Make browser clear all caches for this app</q-item-label>
           <q-btn color="primary" label="Force Reload"
                     @click="forcereload" >
          </q-btn>
           </q-item-section>
         </q-item>
         <q-item>
           <q-item-section>
            Debug Stats
            <q-item-label caption>{{ debugStats }}</q-item-label>
           </q-item-section>
         </q-item>
       </q-list>
       <div
          class="row"
       >
         <div
           v-for="tenant in possibleTenants"
           :key="tenant"
           style="padding: 10px"
         >
           <q-btn color="primary" @click="btnBack('/' + tenant + '/')" v-if="tenant === $route.params.tenantName">Back {{ tenant }}</q-btn>
           <q-btn color="secondary" @click="btnBack('/' + tenant + '/')" v-if="tenant !== $route.params.tenantName">Back {{ tenant }}</q-btn>
         </div>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>

export default {
  name: 'DebugInformation',
  data () {
    return {
      possibleTenants: [
        '', 'defaulttenant'
      ]
    }
  },
  methods: {
    forcereload () {
      // Clear all caches - https://stackoverflow.com/questions/54376355/clear-workbox-cache-of-all-content
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
        })
      })
      window.location.reload(true)
    },
    btnBack (url) {
      try {
        this.$router.replace('' + url).catch((myerr) => {
          // console.log('Error going back 2', myerr)
          //  Ignoring this error
        })
      } catch {
        console.log('Error going back')
      }
    }
  },
  computed: {
    debugStats () {
      return this.$store.getters['saasUserManagementClientStore/getDebugStats']
    },
    isAdminUser () {
      return this.$store.getters['saasUserManagementClientStore/hasRole']('templateservicenameadmin')
    },
    isLoggedIn () {
      return this.$store.getters['saasUserManagementClientStore/isLoggedIn']
    },
    loginUIBaseURL () {
      return this.$store.getters['saasUserManagementClientStore/loginUIBaseURL']
    }
  }
}
</script>
