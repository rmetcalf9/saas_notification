import os
import json

httpOrigin = 'http://a.com'

def removeQuotesIfTheyExist(val):
  retVal = val.strip()
  if len(retVal) < 3:
    return retVal
  if retVal[0] == "\"":
    if retVal[-1] == "\"":
      return retVal[1:-1]
  return retVal

def getOSParamValue(nam):
  return removeQuotesIfTheyExist(os.environ[nam])

targetBase = getOSParamValue('TESTPARAM_ENDPOINTURL')
viaKongSTR = getOSParamValue('TESTPARAM_THROUGHKONG')
viaKong = None
if viaKongSTR.upper() == "FALSE":
  viaKong = False
if viaKongSTR.upper() == "TRUE":
  viaKong = True
if viaKong is None:
  raise Exception("TESTPARAM_THROUGHKONG must be True or False - " + viaKongSTR)

infoAPIPrefix = '/public/api/info'
#userPrivateAPIPrefix = '/private/api/user'
#userPublicAPIPrefix = '/public/api/user'
#ccAPIPrefix = '/public/api/cc'
if viaKong:
  # swap public and private around
  ## my testing showed in templateservicename it's the same way round
  infoAPIPrefix = '/public/api/info'
  #userPrivateAPIPrefix = '/private/api/user'
  #userPublicAPIPrefix = '/public/api/user'
  #ccAPIPrefix = '/public/api/cc'


def _callService(unitTest, methodFn, url, loginSession, postData, acceptedResponseCodes, parseResponseAsJSON, failMsg):
  targetURL = targetBase + url
  headers = {}
  headers["content-type"] = "application/json"
  result = methodFn(
    targetURL,
    headers=headers,
    data=postData
  )
  if acceptedResponseCodes is not None:
    if result.status_code not in acceptedResponseCodes:
      print("Calling URL", targetURL)
      print("Response Text", result.text)
      unitTest.assertTrue(result.status_code in acceptedResponseCodes, msg=failMsg + " received bad response code " + str(result.status_code))
  if not parseResponseAsJSON:
    return result
  resultJSON = json.loads(result.text)
  return resultJSON

def callInfoAPIService(unitTest, methodFn, url, loginSession=None, postData=None, acceptedResponseCodes=[200], parseResponseAsJSON=True, failMsg=""):
  return _callService(
    unitTest=unitTest,
    methodFn=methodFn,
    url=infoAPIPrefix + url,
    loginSession=loginSession,
    postData=postData,
    acceptedResponseCodes=acceptedResponseCodes,
    parseResponseAsJSON=parseResponseAsJSON,
    failMsg=failMsg
  )


