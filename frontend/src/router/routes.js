import stores from '../store/index.js'
import saasApiClient from '../saasApiClient'

var prodDomain = 'platform.challengeswipe.com'
var preferredTenantName = 'defaulttenant'
var preferredFullLocation = 'https://' + prodDomain + '/#/' + preferredTenantName + '/'

var logger = function (msg, messagetype) {
  var log = true
  if (messagetype === 'redirect') {
    log = true
  }
  if (log) {
    console.log(messagetype, ':', msg)
  }
}
var redirectionlogger = function (msg) {
  logger(msg, 'redirect')
}

function allowNotLoggedInForPath (tenantName, path) {
  // All pages require login accept profile which may be public
  if (path === '/' + tenantName + '/') {
    return true
  }
  if (path === '/' + tenantName + '/debug') {
    return true
  }
  // if (path.startsWith('/' + tenantName + '/login/')) {
  //   return true
  // }
  return false
}

function redirectToProperDomain () {
  // return
  // {
  //   wasRedirected: true if redirection is required, false otherwise
  //   runtype: 'proddomain' - if running in prodDomain, 'prodapi' if running in api.metcarob.com, 'dev' otherwise
  // }
  // host api.metcarob.com can never be http - kong will block
  // host www.thumbsum.co must be moved non-www and https if not already
  // host thumbsum.co must be moved to https if not
  // console.log('location.protocol:', location.protocol)
  // console.log('location.hostname:', location.hostname)
  var subDomainsToRedirectFrom = ['www']
  var runtype = 'dev'
  var arrayLength = subDomainsToRedirectFrom.length
  for (var i = 0; i < arrayLength; i++) {
    if (location.hostname === subDomainsToRedirectFrom[i] + '.' + prodDomain) {
      redirectionlogger('redirectToProperDomain 1->HREF(' + preferredFullLocation + ')')
      window.location.href = preferredFullLocation
      return { wasRedirected: true }
    }
  }

  if (location.hostname === prodDomain) {
    if (location.protocol === 'http:') {
      redirectionlogger('redirectToProperDomain 2->HREF(' + preferredFullLocation + ')')
      window.location.href = preferredFullLocation
      return { wasRedirected: true }
    }
    runtype = 'proddomain'
  } else { // not prod domain
    if (location.hostname === 'api.metcarob.com') {
      runtype = 'prodapi'
    } else {
      if (location.hostname !== 'localhost') {
        if (location.hostname !== 'localhost:8080') {
          if (location.hostname !== '127.0.0.1') {
            if (location.hostname !== '127.0.0.1:8080') {
              // May be someone else hosting this code
              redirectionlogger('redirectToProperDomain 3->HREF(' + preferredFullLocation + ')')
              window.location.href = preferredFullLocation
              return { wasRedirected: true }
            }
          }
        }
      }
    }
  }

  return { wasRedirected: false, runtype: runtype }
}

function redirectToURLWithExpandedCampaignParams () {
  var redirectUTMSource = 'defaulttenant'
  var urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('l')) {
    // Auto tag an internal campaign
    var newLocation = 'https://' + prodDomain + '/?utm_source=' + redirectUTMSource + '&utm_medium=' + urlParams.get('l') + '&utm_campaign=Internal%20app%20Share'
    redirectionlogger('redirectToURLWithExpandedCampaignParams->HREF(' + newLocation + ')')
    window.location.href = newLocation
    return true
  }
  return false
}

function actionsForLoggedInUser ({ to }) {
  // Empty function. Good place for loading logged in users details
  // saasLinkVisCallback uses router.history.current.path to get the current path
  //   we need to fake it
  // var fakerouter = {
  //   history: {
  //     current: {
  //       path: to.path
  //     }
  //   }
  // }
  // stores().dispatch(
  //   'loggedInUserInfo/getInfo',
  //   {
  //     router: fakerouter, // Used to caculate cur path
  //     store: stores(),
  //     userGuid: stores().getters['saasUserManagementClientStore/loggedInInfo'].userGuid
  //   }
  // )
}

function notLoggedInBeforeEnter (to, from, next) {
  redirectionlogger('notLoggedInBeforeEnter')

  var notLoggedInPath = '/' + to.params.tenantName + '/notloggedin'
  var afterLoginPath = '/' + to.params.tenantName

  var sendUserToNotLoggedInPage = function () {
    // sendUserToPage(to, next, notLoggedInPath, to.path)
    sendUserToLogin(to)
  }
  var sendUserToDefaultAfterLoginPage = function () {
    sendUserToPage(to, next, afterLoginPath)
  }

  var callback = {
    ok: function (response) {
      // At this point the retervial token and cookie has been read to see if user is logged in

      // console.log('sendUserToNotLoggedInPage callback OK')
      // Rather than check if user is logged in check they have the role hasaccount
      var hasAccount = stores().getters['saasUserManagementClientStore/hasRole']('hasaccount')
      if (hasAccount) {
        if (to.path === notLoggedInPath) {
          console.log('about to sendUserToDefaultAfterLoginPage', to.path)
          sendUserToDefaultAfterLoginPage()
          return
        } else {
          actionsForLoggedInUser({ to })
          next()
          return
        }
      }

      // At this point we know the user has no login credentials
      if (allowNotLoggedInForPath(to.params.tenantName, to.path)) {
        redirectionlogger('notLoggedInBeforeEnter - page is allowed for not logged in user')
        next()
        return
      }
      sendUserToNotLoggedInPage()
      // console.log('sendUserToNotLoggedInPage callback OK END')
    },
    error: function (response) {
      console.log('ERROR router.js fds43 ERR', response)
      sendUserToNotLoggedInPage()
    }
  }

  if (typeof (to.query.jwtretervialtoken) === 'undefined') {
    // console.log('Checking for logon cookie')
    stores().dispatch(
      'saasUserManagementClientStore/checkForPersistedCookieLogon',
      {
        callback: callback
      }
    )
  } else {
    redirectionlogger('Detected return from login')
    // gtm not deployed yet
    // gtm.logEvent('login', 'LoginComplete', 'Done', 0)
    stores().dispatch(
      'saasUserManagementClientStore/processRecievedJWTretervialtoken',
      {
        jwtretervialtoken: to.query.jwtretervialtoken,
        callback: callback,
        curpath: to.path
      }
    )
  }
}

function globalBeforeEnter (to, from, next, callSrc) {
  redirectionlogger('globalBeforeEnter topath=' + to.path + ' source of globalBeforeEnter=' + callSrc)

  var x = redirectToProperDomain()
  if (x.wasRedirected) return
  if (redirectToURLWithExpandedCampaignParams()) return

  saasApiClient.registerEndpoints(stores(), prodDomain, x.runtype, to.params.tenantName)

  if (stores().getters['saasUserManagementClientStore/isLoggedIn']) {
    actionsForLoggedInUser({ to })
    next()
  } else {
    notLoggedInBeforeEnter(to, from, next)
  }
}

function getGlobalBeforeEnterFn (params, callSrc) {
  return function (to, from, next) {
    redirectionlogger('S-Start of GlobalBeforeEnterFn')
    globalBeforeEnter(to, from, next, params, callSrc)
    redirectionlogger('X-End of GlobalBeforeEnterFn', callSrc)
  }
}

function sendUserToPage (to, next, targetPage, requestedPage) {
  if (to.path === targetPage) {
    // console.log('a')
    redirectionlogger('sendUserToPage->next()')
    next()
    return
  }
  if (typeof (requestedPage) !== 'undefined') {
    targetPage = targetPage + '?requestedPage=' + requestedPage
  }
  // console.log('AAA:', targetPage)
  redirectionlogger('sendUserToPage->next(' + targetPage + ')')
  next({
    path: targetPage
  })
}

function sendUserToLogin (to) {
  var returnAddress = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + to.path
  window.location.href = stores().getters['saasUserManagementClientStore/getLoginUIURLFn'](undefined, '/', returnAddress)
}

function redirectToDefaultTenant (to, from, next) {
  redirectionlogger('redirectToDefaultTenant')
  var x = redirectToProperDomain()
  if (x.wasRedirected) return
  if (redirectToURLWithExpandedCampaignParams()) return
  // window.location.href = window.location.href + preferredTenantName + '/'
  redirectionlogger('redirectToDefaultTenant - about to call sendUserToPage')
  sendUserToPage(to, next, '/' + preferredTenantName + '/')
}

const routes = [
  {
    path: '/',
    beforeEnter: redirectToDefaultTenant
  },
  {
    path: '/:tenantName/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: getGlobalBeforeEnterFn('main'),
    children: [
      { path: '', name: 'Index', component: () => import('pages/Index.vue'), beforeEnter: getGlobalBeforeEnterFn('Index') },

      { path: 'debug', name: 'Debug', component: () => import('pages/Debug.vue'), beforeEnter: getGlobalBeforeEnterFn('debug') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:tenantName/*',
    component: () => import('pages/Error404.vue')
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
