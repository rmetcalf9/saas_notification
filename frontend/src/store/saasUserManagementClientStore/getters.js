import common from './common.js'
/*
export function someGetter (state) {
}
*/

export function isLoggedIn (state) {
  return state.loginProcessState === 2
}

export function isLogginProcessStateRegistered (state) {
  return state.loginProcessState !== -1
}

export function loggedInInfo (state) {
  return state.loggedInInfo
}

export function hasRole (state) {
  if (!isLoggedIn) return false
  return function (role) {
    return common.hasRole(role, state.loggedInInfo)
  }
}

export function loginUIBaseURL (state) {
  return state.loginServiceBaseURL + 'public/web/frontend/#/' + state.loginTenantName
}

export function loginServicePublicURL (state) {
  return state.loginServiceBaseURL + 'public/'
}

export function getEndpoints (state) {
  return state.endpointInfo
}

export function getLoginUIURLFn (state) {
  return function (message, loginPath, returnAddress) {
    var newHREF = loginUIBaseURL(state) + loginPath
    var addedParam = false
    addedParam = true
    newHREF = newHREF + '?usersystem_returnaddress=' + encodeURIComponent(returnAddress)

    if (typeof (message) !== 'undefined') {
      if (addedParam) {
        newHREF = newHREF + '&'
      } else {
        newHREF = newHREF + '?'
      }
      newHREF = newHREF + 'usersystem_message=' + encodeURIComponent(message)
    }

    return newHREF
  }
}

export function getDebugStats (state) {
  return {
    loginServiceBaseURL: state.loginServiceBaseURL,
    tenantName: state.tenantName,
    loginProcessState: state.loginProcessState,
    endpoints: Object.keys(state.endpointInfo).map(function (item) {
      return {
        name: item,
        apiCallQueueLength: state.endpointInfo[item].apiCallQueue.length,
        queueProcessingInProgress: state.endpointInfo[item].queueProcessingInProgress,
        endpointIdentificationProcessState: state.endpointInfo[item].endpointIdentificationProcessState
      }
    })
  }
}

export function getProdVerFn (state) {
  /*
  Example values of currentURL:
  https://api.metcarob.com/endpointName/test/v0/public/web/adminfrontend/#/usersystem/users
  https://api.metcarob.com/endpointName/v0/public/web/adminfrontend/#/usersystem/users
  http://somefunnyhostname.com:5080/public/web/adminfrontend/#/usersystem/users

  https://api.metcarob.com/saas_linkvis/v0/public/web/frontend/#/linkvis/notloggedin?requestedPage=%2Flinkvis%2F

  returned prefix will NOT end with a slash
  */
  return function (currentURL, endpointName) {
    var searchStr = '/' + endpointName + '/test/v'
    var testPos = currentURL.indexOf(searchStr)
    var searchStr2 = '/public/web/'
    if (testPos !== -1) {
      var midArg = currentURL.substring(currentURL.indexOf(searchStr) + searchStr.length)
      var secondPos = midArg.indexOf(searchStr2)
      if (secondPos === -1) {
        return {
          prod: false
        }
      }
      return {
        prod: true,
        ver: parseInt(midArg.substring(0, secondPos)),
        test: true,
        prefix: currentURL.substring(0, currentURL.indexOf(searchStr)) + searchStr + parseInt(midArg.substring(0, secondPos))
      }
    } else {
      searchStr = '/' + endpointName + '/v'
      testPos = currentURL.indexOf(searchStr)
      if (testPos !== -1) {
        midArg = currentURL.substring(currentURL.indexOf(searchStr) + searchStr.length)
        secondPos = midArg.indexOf(searchStr2)
        if (secondPos === -1) {
          return {
            prod: false
          }
        }
        return {
          prod: true,
          ver: parseInt(midArg.substring(0, secondPos)),
          test: false,
          prefix: currentURL.substring(0, currentURL.indexOf(searchStr)) + searchStr + parseInt(midArg.substring(0, secondPos))
        }
      }
    }
    return {
      prod: false
    }
  }
}

export function getEndpointIdentificationProcessStateFn (state) {
  return function (endpoint) {
    return state.endpointInfo[endpoint].endpointIdentificationProcessState
  }
}
