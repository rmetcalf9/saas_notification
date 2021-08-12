export default {
  loginServiceBaseURL: '', // 'https://api.metcarob.com/saas_user_management/v0/',
  loginTenantName: '', // set in registerloginendpoint
  /*
  -1 = login process not registered
  0 = NOT_LOGGEDIN
  1 = REFRESH_IN_PROGRESS
  2 = LOGGEDIN
  */
  loginProcessState: -1,
  pendingRefreshToken: null,
  loggedInInfo: {},
  requestUserReloginFn: function (message, curpath) {
    console.log('requestUserReLoginFn not set but was called with ', message, curpath)
  },
  endpointInfo: {}
  /*

  Endpoint identification process is a process that tries to get
  server info from all possible endpoints until it is sucessful
  this will vary between prod and dev
  serverinfo is not availiable until the process is complete

  endpointInfo key is id
  endpointInfo structures are:
  {
    apiCallQueue: [], //SEE apiCallQueue note below
    queueProcessingInProgress: false,
    endpointIdentificationProcessState: 0,  0=? 1=id process started, 2=id process complete serverinfo loaded
    apiPrefixIdentificationProcessConfig: {
      possibleApiPrefixes: [ { prefix: 'A', connectingthroughnginx: false }, ... ]
    }
    apiPrefix: {
      prefix: 'https://xxxx.com/a/b', connectingthroughnginx: false
    },
    serverInfo: {}
  }

  endpointIdentificationProcessState values:
  0 = NOT RUN
  1 = RUNNING
  2 = ENDPOINT IDENTIFIED

  apiCallQueue values:
  { path, method, postdata, callback, curpath, authtype }
  // possible auth types:
  //  none - never attach token to call
  //  always - always attach token to call
  //  ifloggedin - if logged in then attach token to call, otherwise don't
  */
}
