// This file is for calling my backend services
import rjmversion from './rjmversion.js'

var endpointName = 'saas_notification'
function getMainEndpointName () {
  return endpointName
}

//   Used in user/private put back in when needed
// var authedStoreFn = 'saasUserManagementClientStore/callAuthedAPI'
// var authedOrAnonStoreFn = 'saasUserManagementClientStore/callAuthedOrAnonAPI'

// Change this variable to use different major bersions of login service
var prodLoginServiceBaseURL = 'https://api.metcarob.com/saas_user_management/v0/'

// TODO Activate as required
// var userPrivateAPIPrefix = '/user'
// var userPublicAPIPrefix = '/user'

function finishEndPointIdentificationHook (stores, { serverInfo, apiPrefix }) {
  // Do nothing
}

function registerEndpoints (stores, prodDomain, runtype, tenantName) {
  var finishEndPointIdentificationHookFN = function (params) {
    finishEndPointIdentificationHook(stores, params)
  }
  if (stores.getters['saasUserManagementClientStore/isLogginProcessStateRegistered']) {
    return
  }
  if (runtype === 'proddomain') {
    var majorCodeVersion = rjmversion.codebasever.split('.')[0]
    console.log('PROD taking api version from code', runtype, majorCodeVersion)
    stores.dispatch('saasUserManagementClientStore/registerLoginEndpoint', {
      loginServiceBaseURL: prodLoginServiceBaseURL,
      loginTenantName: tenantName
    })

    // https://api.metcarob.com/saas_linkvis/v0
    var possibleApiPrefixes = [{ prefix: 'https://api.metcarob.com/' + endpointName + '/v' + majorCodeVersion, connectingthroughnginx: true, apitype: 'public' }]
    stores.dispatch('saasUserManagementClientStore/registerEndpoint', {
      endpoint: endpointName,
      apiPrefixIdentificationProcessConfig: {
        possibleApiPrefixes: possibleApiPrefixes
      },
      finishEndPointIdentificationHook: finishEndPointIdentificationHookFN
    })
  } else {
    var prodVer = stores.getters['saasUserManagementClientStore/getProdVerFn'](window.location.href, endpointName)
    if (prodVer.prod) {
      console.log('PROD taking api version from url ', runtype)
      stores.dispatch('saasUserManagementClientStore/registerLoginEndpoint', {
        loginServiceBaseURL: prodLoginServiceBaseURL,
        loginTenantName: tenantName
      })

      var possibleApiPrefixes2 = [{ prefix: prodVer.prefix, connectingthroughnginx: true, apitype: 'public' }]
      stores.dispatch('saasUserManagementClientStore/registerEndpoint', {
        endpoint: endpointName,
        apiPrefixIdentificationProcessConfig: {
          possibleApiPrefixes: possibleApiPrefixes2
        },
        finishEndPointIdentificationHook: finishEndPointIdentificationHookFN
      })
    } else {
      console.log('NON PROD no api version needed using same basepath', runtype)
      stores.dispatch('saasUserManagementClientStore/registerLoginEndpoint', {
        loginServiceBaseURL: 'http://127.0.0.1:8099/',
        loginTenantName: tenantName
      })

      stores.dispatch('saasUserManagementClientStore/registerEndpoint', {
        endpoint: endpointName,
        apiPrefixIdentificationProcessConfig: {
          // these lines appear in the order they are attempted
          // first we are trying ./run_app_developer.sh which will be on different ports
          // then we are trying running via a container where the frontend and
          // python app are on the same port
          possibleApiPrefixes: [
            { prefix: 'http://localhost:8098', connectingthroughnginx: false, apitype: 'public' },
            { prefix: window.location.protocol + '//' + window.location.host, connectingthroughnginx: true, apitype: 'public' }
          ]
        },
        finishEndPointIdentificationHook: finishEndPointIdentificationHookFN
      })
    }
  }

  var requestUserReloginINT = function (message, curpath) {
    requestUserRelogin(message, curpath, stores)
  }
  stores.commit('saasUserManagementClientStore/REGISTERREQUESTUSERRELOGINFN', { requestUserReloginFn: requestUserReloginINT })

  var callback = {
    ok: function ({ serverinfoResponse, endpoint, sucessfulapiprefix }) {
    },
    error: function (response) {
    }
  }
  stores.dispatch('saasUserManagementClientStore/startEndpointIdentificationProcessAction', {
    endpoint: endpointName,
    callback: callback
  })
}

function requestUserRelogin (message, curpath, stores) {
  var thisQuasarPath = curpath
  var returnAddress = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + thisQuasarPath
  if (returnAddress.includes('saas_user_management')) {
    console.log('requestUserRelogin: error, found that returnAddress includes saas_user_management')
    console.log('window.location.protocol', window.location.protocol)
    console.log('window.location.host', window.location.host)
    console.log('window.location.pathname', window.location.pathname)
    console.log('thisQuasarPath', thisQuasarPath)
    console.log('Did not preform redirect to:', stores.getters['saasUserManagementClientStore/getLoginUIURLFn'](message, '/', returnAddress))
  } else {
    window.location.href = stores.getters['saasUserManagementClientStore/getLoginUIURLFn'](message, '/', returnAddress)
  }
}

// function callAPI (
//   router,
//   store,
//   path, // : queryString,
//   method, // : 'get',
//   postdata, // : null,
//   callback, // : callback,
//   storeFN,
//   orveridePublicPrivatePart
// ) {
//   var curPath // = undefined
//   if (typeof (router) !== 'undefined') {
//     curPath = router.history.current.path
//   }
//   store.dispatch(storeFN, {
//     endpoint: endpointName,
//     path: path,
//     method: method,
//     postdata: postdata,
//     callback: callback,
//     curpath: curPath,
//     orveridePublicPrivatePart: orveridePublicPrivatePart
//   })
// }

// function callUserPrivateAPI ({
//   router, // : this.$router
//   store, // : this.$store
//   tenantName, // tenantName
//   path, // : queryString e.g. '/charts',
//   method, // : 'get',
//   postdata, // : null,
//   callback // : callback,
// }) {
//   return callAPI(router, store, userPrivateAPIPrefix + '/' + tenantName + path, method, postdata, callback, authedStoreFn, 'private')
// }
//
// function callUserPublicAPI ({
//   router, // : this.$router
//   store, // : this.$store
//   tenantName, // tenantName
//   path, // : queryString e.g. '/charts',
//   method, // : 'get',
//   postdata, // : null,
//   callback // : callback,
// }) {
//   return callAPI(router, store, userPublicAPIPrefix + '/' + tenantName + path, method, postdata, callback, authedOrAnonStoreFn, 'public')
// }

function startAPIProcessQueue ({
  router, // : this.$router
  store // : this.$store
}) {
  var curPath // = undefined
  if (typeof (router) !== 'undefined') {
    curPath = router.history.current.path
  }
  store.dispatch('saasUserManagementClientStore/processAPICallQueueACTION', {
    endpoint: endpointName,
    curpath: curPath
  })
}

export default {
  registerEndpoints: registerEndpoints,
  // callUserPrivateAPI: callUserPrivateAPI,
  // callUserPublicAPI: callUserPublicAPI,
  getMainEndpointName: getMainEndpointName,
  startAPIProcessQueue: startAPIProcessQueue
}
