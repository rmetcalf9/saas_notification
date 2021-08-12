import callbackHelper from '../../callbackHelper'
import axios from 'axios'
import common from './common.js'
/*
export function someAction (context) {
}
*/

/*
called from router when the interval token has been recieved from the login page
params {
  jwtretervialtoken: 'string'
}
*/
export const processRecievedJWTretervialtoken = ({ dispatch, getters, commit, state }, params) => {
  if (state.loginProcessState !== 0) {
    console.log('saasUserManagementClientStore - Not processing RecievedJWTretervialtoken as not in LOGGEDOUT STATE')
    return
  }
  var callback = {
    ok: function (response) {
      console.log('processRecievedJWTretervialtoken got OK back')
      params.callback.ok(response)
    },
    error: function (response) {
      console.log('processRecievedJWTretervialtoken ERR', response)
      params.callback.error(response)
    }
  }
  commit('SETPENDINGREFRESH', params.jwtretervialtoken)
  refreshJWTToken(dispatch, getters, commit, state, callback, params.curpath)
}

export const checkForPersistedCookieLogon = ({ dispatch, getters, commit, state }, params) => {
  if (state.loginProcessState !== 0) {
    return
  }
  commit('RETRIEVELOGINFROMCOOKIE')
  params.callback.ok('')
}

function refreshJWTToken (dispatch, getters, commit, state, callback, curpath) {
  if (state.loginProcessState === -1) {
    callbackHelper.callbackWithSimpleError(callback, 'No login function registered')
    return
  }
  if (state.loginProcessState === 1) {
    callbackHelper.callbackWithSimpleError(callback, 'Mutiple calls to refreshJWT Token')
    return
  }
  if (state.pendingRefreshToken === null) {
    callbackHelper.callbackWithSimpleError(callback, 'refreshJWTToken with no pendingRefreshToken')
    return
  }
  var refreshToken = state.pendingRefreshToken
  commit('STARTREFRESH') // Set state to REFRESH_IN_PROGRESS
  console.log('REFRESH url', getters.loginServicePublicURL + 'api/login/' + state.loginTenantName + '/refresh')
  var config = {
    method: 'POST',
    url: getters.loginServicePublicURL + 'api/login/' + state.loginTenantName + '/refresh',
    data: { token: refreshToken }
  }
  // console.log(config)
  // console.log(refreshToken)

  axios(config).then(
    (response) => {
      if (common.hasRole('hasaccount', response.data)) {
        commit('COMPLETEREFRESHSUCESSFULLY', response)
        for (var endpoint in state.endpointInfo) {
          processAPICallQueue({
            dispatch: dispatch,
            getters: getters,
            commit: commit,
            state: state,
            endpoint: endpoint,
            calledAtEndOfRefresh: true,
            curpath: curpath
          })
        }
        callback.ok(response)
      } else {
        commit('COMPLETEREFRESHFAILED', response)
        state.requestUserReloginFn('Logged in user has no account', curpath)
      }
    },
    (response) => {
      commit('COMPLETEREFRESHFAILED', response)
      state.requestUserReloginFn('User needs to log in again', curpath)
    }
  )
}

export const logout = ({ dispatch, getters, commit, state }, params) => {
  commit('LOGOUT')
}

export const registerLoginEndpoint = ({ dispatch, getters, commit, state }, { loginServiceBaseURL, loginTenantName }) => {
  commit('REGISTERLOGINENDPOINT', { loginServiceBaseURL, loginTenantName })
}

export const registerEndpoint = ({ dispatch, getters, commit, state }, { endpoint, apiPrefixIdentificationProcessConfig, finishEndPointIdentificationHook }) => {
  if (endpoint in state.endpointInfo) {
    return
  }
  commit('REGISTERENDPOINT', { endpoint, apiPrefixIdentificationProcessConfig, finishEndPointIdentificationHook })
}

function getUrlToCall (prefixRecord, apiPath, orveridePublicPrivatePart) {
  // apitype can be either 'public' or 'private' and it's the kong endpoint part of the url
  var apiTypeToUse = prefixRecord.apitype
  if (typeof (orveridePublicPrivatePart) !== 'undefined') {
    apiTypeToUse = orveridePublicPrivatePart
  }
  if (prefixRecord.connectingthroughnginx) {
    return prefixRecord.prefix + '/' + apiTypeToUse + '/api' + apiPath
  }
  return prefixRecord.prefix + '/api/' + apiTypeToUse + apiPath
}

function tryToReadServerInfoFromAllThesePossibleAPIPrefixes ({ possibleApiPrefixes, callback, endpoint }) {
  if (possibleApiPrefixes.length === 0) {
    callback.error('Fail')
    return
  }
  var prefixToTry = possibleApiPrefixes.shift()

  var config = {
    method: 'GET',
    url: getUrlToCall(prefixToTry, '/info/serverinfo')
  }
  console.log('Trying to reach API at ' + config.url)
  axios(config).then(
    (response) => {
      // TODO Considercheck that this server info is for this service
      //   might be helpful when I run mutiple services locally
      console.log('SUCCESS! - reached api at ' + config.url)
      callback.ok({
        serverinfoResponse: response,
        endpoint: endpoint,
        sucessfulapiprefix: prefixToTry
      })
    },
    (response) => {
      console.log('FAILED')
      tryToReadServerInfoFromAllThesePossibleAPIPrefixes({ possibleApiPrefixes, callback, endpoint })
    }
  )
}

export const startEndpointIdentificationProcessAction = ({ dispatch, getters, commit, state }, { endpoint, callback }) => {
  startEndpointIdentificationProcess({ dispatch, getters, commit, state, endpoint, callback })
}

function startEndpointIdentificationprocessThenStartToProcessQueue ({ dispatch, getters, commit, state, endpoint, curpath }) {
  var callback = {
    ok: function ({ serverinfoResponse, endpoint, sucessfulapiprefix }) {
      processAPICallQueue({
        dispatch: dispatch,
        getters: getters,
        commit: commit,
        state: state,
        endpoint: endpoint,
        calledAtEndOfRefresh: false,
        curpath: curpath
      })
    },
    error: function (response) {
    }
  }
  startEndpointIdentificationProcess({ dispatch, getters, commit, state, endpoint, callback })
}

function startEndpointIdentificationProcess ({ dispatch, getters, commit, state, endpoint, callback }) {
  if (state.endpointInfo[endpoint].endpointIdentificationProcessState !== 0) return
  commit('STARTENDPOINTIDENTIFICATIONPROCESS', { endpoint })

  var possibleApiPrefixes = JSON.parse(JSON.stringify(state.endpointInfo[endpoint].apiPrefixIdentificationProcessConfig.possibleApiPrefixes))

  var callbackInternal = {
    ok: function ({ serverinfoResponse, endpoint, sucessfulapiprefix }) {
      // console.log('Success API response recieved')
      // console.log('startEndpointIdentificationprocess Success', serverinfoResponse, sucessfulapiprefix)
      commit('FINISHENDPOINTIDENTIFICATIONPROCESS', {
        endpoint: endpoint,
        sucessfulapiprefix: sucessfulapiprefix,
        serverInfo: serverinfoResponse.data
      })
      if (typeof (state.endpointInfo[endpoint].finishEndPointIdentificationHook) !== 'undefined') {
        var param = {
          serverInfo: state.endpointInfo[endpoint].serverInfo,
          apiPrefix: state.endpointInfo[endpoint].apiPrefix
        }
        state.endpointInfo[endpoint].finishEndPointIdentificationHook(param)
      }
      callback.ok({ serverinfoResponse, endpoint, sucessfulapiprefix })
    },
    error: function (response) {
      // Need to watch for infinite loop
      console.log('EndpointIdentificationprocess FAILED for', endpoint, ' with response ', response)
      commit('RESETENDPOINTIDENTIFICATIONPROCESS', { endpoint })
      callback.error(response)
    }
  }
  tryToReadServerInfoFromAllThesePossibleAPIPrefixes({
    possibleApiPrefixes: possibleApiPrefixes,
    callback: callbackInternal,
    endpoint: endpoint
  })
}

function processAPICallQueueRecursive ({ endpoint, dispatch, getters, commit, state, calledAtEndOfRefresh, curpath }) {
  if (state.endpointInfo[endpoint].apiCallQueue.length === 0) {
    commit('FINISHQUEUEPROCESSING', { endpoint })
    // console.log('No calls to make')
    return
  }
  // console.log('Calling')
  var apiCall = state.endpointInfo[endpoint].apiCallQueue[0]
  var urlToCall = getUrlToCall(state.endpointInfo[endpoint].apiPrefix, apiCall.path, apiCall.orveridePublicPrivatePart)
  var config = {
    method: apiCall.method,
    url: urlToCall,
    data: apiCall.postdata,
    headers: {}
  }
  var attachToken = false
  switch (apiCall.authtype) {
    case 'none':
      attachToken = true
      break
    case 'always':
      attachToken = true
      break
    case 'ifloggedin':
      if (state.loginProcessState === 2) {
        attachToken = true
      }
      break
  }
  // console.log('callAPI ', apiCall.authtype, 'attachToken:', attachToken, ' state', state.loginProcessState)

  if (attachToken) {
    // Possible optiomzation - check if jwt token has expired and go direct to refresh call
    // console.log(state.loggedInInfo.jwtData.JWTToken)
    config.headers['jwt-auth-token'] = state.loggedInInfo.jwtData.JWTToken
    // Kong can only read Authorization header- https://docs.konghq.com/hub/kong-inc/jwt/
    config.headers.Authorization = 'Bearer ' + state.loggedInInfo.jwtData.JWTToken
  }

  axios(config).then(
    (response) => {
      state.endpointInfo[endpoint].apiCallQueue[0].callback.ok(response)
      state.endpointInfo[endpoint].apiCallQueue.shift()
      processAPICallQueueRecursive({ endpoint, dispatch, getters, commit, state, calledAtEndOfRefresh, curpath })
    },
    (response) => {
      // Error respones
      if (callbackHelper.getResponseStatusIfItHasOneOtherwiseNegativeOne(response) === 401) {
        if (calledAtEndOfRefresh) {
          callbackHelper.callbackWithSimpleError(state.endpointInfo[endpoint].apiCallQueue[0].callback, 'API Call Auth failed (refresh tried)')
          state.endpointInfo[endpoint].apiCallQueue.shift()
          processAPICallQueueRecursive({ endpoint, dispatch, getters, commit, state, calledAtEndOfRefresh, curpath })
        } else {
          commit('FINISHQUEUEPROCESSING', { endpoint })
          refreshJWTToken(dispatch, getters, commit, state, callbackHelper.consoleLogCallback(), curpath)
          // return (Not needed)
        }
      } else {
        callbackHelper.webserviceError(state.endpointInfo[endpoint].apiCallQueue[0].callback, response)
        state.endpointInfo[endpoint].apiCallQueue.shift()
        processAPICallQueueRecursive({ endpoint, dispatch, getters, commit, state, calledAtEndOfRefresh, curpath })
      }
    }
  )
}

function processAPICallQueue ({ dispatch, getters, commit, state, endpoint, calledAtEndOfRefresh, curpath }) {
  // console.log('call processAPICallQueue for endpoint', endpoint, state.loginProcessState)
  if (state.endpointInfo[endpoint].queueProcessingInProgress) return
  if (state.loginProcessState === 1) return // refresh in progress, it will call this fn again when completed
  if (state.loginProcessState === -1) return // login process not registered
  // if (state.loginProcessState === 0) return // not logged in Altered, processing API calls even if not logged in
  if (state.endpointInfo[endpoint].endpointIdentificationProcessState === 0) {
    startEndpointIdentificationprocessThenStartToProcessQueue({ dispatch, getters, commit, state, endpoint, curpath })
    return // we are
  }
  if (state.endpointInfo[endpoint].endpointIdentificationProcessState === 1) return // we are processing endpoint state this fn will call again when completed

  if (state.endpointInfo[endpoint].queueProcessingInProgress) return // belt and braces second check

  // console.log('processAPICallQueue Start processing for endpoint', endpoint)
  commit('STARTQUEUEPROCESSING', { endpoint })

  processAPICallQueueRecursive({ endpoint, dispatch, getters, commit, state, calledAtEndOfRefresh, curpath })
}

export const processAPICallQueueACTION = ({ dispatch, getters, commit, state }, { endpoint, curpath }) => {
  processAPICallQueue({
    dispatch: dispatch,
    getters: getters,
    commit: commit,
    state: state,
    endpoint: endpoint,
    calledAtEndOfRefresh: false,
    curpath: curpath
  })
}

function callAPI ({ dispatch, getters, commit, state }, { endpoint, path, method, postdata, callback, curpath, authtype, orveridePublicPrivatePart }) {
  if (state.loginProcessState === -1) {
    // not logged in
    callbackHelper.callbackWithSimpleError(callback, 'Trying to call authed API but login process not registered')
    return
  }
  if (typeof (curpath) === 'undefined') {
    callbackHelper.callbackWithSimpleError(callback, 'Error callAuthedAPI called with no curpath set')
    return
  }
  // console.log('callAuthedAPI ', path)
  state.endpointInfo[endpoint].apiCallQueue.push({ path, method, postdata, callback, curpath, authtype, orveridePublicPrivatePart })
  processAPICallQueue({
    dispatch: dispatch,
    getters: getters,
    commit: commit,
    state: state,
    endpoint: endpoint,
    calledAtEndOfRefresh: false,
    curpath: curpath
  })
}

export const callAuthedAPI = ({ dispatch, getters, commit, state }, { endpoint, path, method, postdata, callback, curpath, orveridePublicPrivatePart }) => {
  if (state.loginProcessState === 0) {
    // not logged in
    callbackHelper.callbackWithSimpleError(callback, 'Trying to call authed API but not logged in')
    return
  }
  var authtype = 'always'
  callAPI({ dispatch, getters, commit, state }, { endpoint, path, method, postdata, callback, curpath, authtype, orveridePublicPrivatePart })
}

export const callAuthedOrAnonAPI = ({ dispatch, getters, commit, state }, { endpoint, path, method, postdata, callback, curpath, orveridePublicPrivatePart }) => {
  // Used to API's that only sometimes require token to be sent
  var authtype = 'ifloggedin'
  callAPI({ dispatch, getters, commit, state }, { endpoint, path, method, postdata, callback, curpath, authtype, orveridePublicPrivatePart })
}

export const runFunctionWhenServerInfoHasLoaded = ({ dispatch, getters, commit, state }, { fnToRun, endpointName }) => {
  var iter = 0
  var t = function () {
    iter += 1
    if (iter > 10) {
      console.log('ERROR - Waiting too long for serverinfo to load - giving up!!!!!!!!!!!!!')
      return
    }
    var endpointIDProcessState = getters.getEndpointIdentificationProcessStateFn(endpointName)
    if (endpointIDProcessState === 2) {
      fnToRun()
    } else {
      // try again in a bit
      setTimeout(t, 100)
    }
  }
  t()
}
