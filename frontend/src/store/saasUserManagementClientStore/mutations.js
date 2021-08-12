import { Cookies } from 'quasar'
import Vue from 'vue'

/*
export function someMutation (state) {
}
*/

export function SETSTATE (state, newstate) {
  state.loginProcessState = newstate
}

export function SETPENDINGREFRESH (state, pendingRefreshToken) {
  // console.log('SETPENDINGREFRESH', pendingRefreshToken)
  state.pendingRefreshToken = pendingRefreshToken
}

export function STARTREFRESH (state) {
  state.loginProcessState = 1
  state.pendingRefreshToken = null
}

export function COMPLETEREFRESHSUCESSFULLY (state, result) {
  // console.log('COMPLETEREFRESHSUCESSFULLY', result.data.refresh.token)
  state.pendingRefreshToken = result.data.refresh.token
  state.loginProcessState = 2

  // Save the loginTenantName with the cookie
  result.data.loginTenantName = state.loginTenantName
  Cookies.set('saasUserManagementClientStoreCredentials', result.data, {
    secure: !window.location.href.includes('localhost'), // otherwise cookie not set on dev machines
    expires: 90 // expire in 90 days
  })
  state.loggedInInfo = result.data

  // console.log('SUC Refresh result:', result)
}

export function RETRIEVELOGINFROMCOOKIE (state) {
  if (!Cookies.has('saasUserManagementClientStoreCredentials')) {
    return // no cookie so do nothing
  }
  var cookieData = Cookies.get('saasUserManagementClientStoreCredentials')
  if (typeof (cookieData) === 'undefined') {
    return // blanked cookie so do nothing (cookies are blanked when refresh fails)
  }
  if (typeof (cookieData.loginTenantName) === 'undefined') {
    // require cookie to have the loginTenantName
    return
  }
  if (cookieData.loginTenantName !== state.loginTenantName) {
    // do not accept a cookie without a loginTenantName that matches this one
    return
  }
  state.loginProcessState = 2
  state.loggedInInfo = cookieData
  state.pendingRefreshToken = state.loggedInInfo.refresh.token
}

export function COMPLETEREFRESHFAILED (state, result) {
  state.loginProcessState = 0
  // Clear cookie as refresh token will no work any more
  Cookies.remove('saasUserManagementClientStoreCredentials')
  console.log('FAIL Refresh result:', result)
}

export function LOGOUT (state) {
  Cookies.remove('saasUserManagementClientStoreCredentials')
  state.loginProcessState = 0
  state.loggedInInfo = {}
}

export function REGISTERREQUESTUSERRELOGINFN (state, { requestUserReloginFn }) {
  state.requestUserReloginFn = requestUserReloginFn
}

export function STARTQUEUEPROCESSING (state, { endpoint }) {
  // console.log('STARTQUEUEPROCESSING', endpoint, state.endpointInfo[endpoint])
  state.endpointInfo[endpoint].queueProcessingInProgress = true
}
export function FINISHQUEUEPROCESSING (state, { endpoint }) {
  // console.log('FINISHQUEUEPROCESSING', endpoint, state.endpointInfo[endpoint])
  state.endpointInfo[endpoint].queueProcessingInProgress = false
}

export function REGISTERLOGINENDPOINT (state, { loginServiceBaseURL, loginTenantName }) {
  // console.log('REGISTERLOGINENDPOINT', loginServiceBaseURL, loginTenantName)
  state.loginServiceBaseURL = loginServiceBaseURL
  state.loginTenantName = loginTenantName
  state.loginProcessState = 0
}

export function REGISTERENDPOINT (state, { endpoint, apiPrefixIdentificationProcessConfig, finishEndPointIdentificationHook }) {
  state.endpointInfo[endpoint] = {
    apiCallQueue: [],
    queueProcessingInProgress: false,
    endpointIdentificationProcessState: 0,
    apiPrefixIdentificationProcessConfig: apiPrefixIdentificationProcessConfig,
    apiPrefix: {},
    serverInfo: {},
    finishEndPointIdentificationHook: finishEndPointIdentificationHook
  }
  // console.log('state.endpointInfo:', state.endpointInfo)
}

export function STARTENDPOINTIDENTIFICATIONPROCESS (state, { endpoint }) {
  // console.log('STARTENDPOINTIDENTIFICATIONPROCESS', endpoint)
  state.endpointInfo[endpoint].endpointIdentificationProcessState = 1
}
export function RESETENDPOINTIDENTIFICATIONPROCESS (state, { endpoint }) {
  // console.log('RESETENDPOINTIDENTIFICATIONPROCESS', endpoint)
  state.endpointInfo[endpoint].endpointIdentificationProcessState = 0
}
export function FINISHENDPOINTIDENTIFICATIONPROCESS (state, { endpoint, sucessfulapiprefix, serverInfo }) {
  // console.log('saasUserManagementClientStore mutation FINISHENDPOINTIDENTIFICATIONPROCESS', serverInfo)
  var newEndpointObject = {
    endpointIdentificationProcessState: 2,
    apiPrefix: sucessfulapiprefix,
    serverInfo: serverInfo,
    queueProcessingInProgress: false,
    // Unchanged properties below
    apiPrefixIdentificationProcessConfig: state.endpointInfo[endpoint].apiPrefixIdentificationProcessConfig,
    // Don't set apiCallQueue to empty list as calls may build up during endpoint identification
    apiCallQueue: state.endpointInfo[endpoint].apiCallQueue,
    finishEndPointIdentificationHook: state.endpointInfo[endpoint].finishEndPointIdentificationHook
  }
  Vue.set(state.endpointInfo, endpoint, newEndpointObject)

  // state.endpointInfo[endpoint].endpointIdentificationProcessState = 2
  // state.endpointInfo[endpoint].apiPrefix = sucessfulapiprefix
  // state.endpointInfo[endpoint].serverInfo = serverInfo
  // // state.endpointInfo[endpoint].apiCallQueue = [] Cant do this because may calls build up during the endpoint identification process
  // state.endpointInfo[endpoint].queueProcessingInProgress = false
}
