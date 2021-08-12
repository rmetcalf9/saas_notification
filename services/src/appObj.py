#appObj.py - This file contains the main application object
# to be constructed by app.py

from baseapp_for_restapi_backend_with_swagger import AppObjBaseClass as parAppObj, readFromEnviroment

import constants
import json

import logging
import sys
import APIs

from object_store_abstraction import createObjectStoreInstance

invalidConfigurationException = constants.customExceptionClass('Invalid Configuration')

InvalidObjectStoreConfigInvalidJSONException = constants.customExceptionClass('APIAPP_OBJECTSTORECONFIG value is not valid JSON')

class appObjClass(parAppObj):
  objectStore = None
  APIAPP_OBJECTSTOREDETAILLOGGING = None
  accessControlAllowOriginObj = None

  def setupLogging(self):
    root = logging.getLogger()
    #root.setLevel(logging.DEBUG)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    root.addHandler(handler)

  def init(self, env, serverStartTime, testingMode = False):
    ##self.setupLogging() Comment in when debugging

    super(appObjClass, self).init(env, serverStartTime, testingMode, serverinfoapiprefix='public/info')
    ##print("appOBj init")

    objectStoreConfigJSON = readFromEnviroment(env, 'APIAPP_OBJECTSTORECONFIG', '{}', None)
    objectStoreConfigDict = None
    try:
      if objectStoreConfigJSON != '{}':
        objectStoreConfigDict = json.loads(objectStoreConfigJSON)
    except Exception as err:
      print(err) # for the repr
      print(str(err)) # for just the message
      print(err.args) # the arguments that the exception has been called with.
      raise(InvalidObjectStoreConfigInvalidJSONException)

    if isinstance(objectStoreConfigDict, str):
      # Codfresh container test has problems passing json this deals with it's input
      print("APIAPP_OBJECTSTORECONFIG parsing First JSON pass gave string")
      #####print("XXX", objectStoreConfigDict) (This debug comment may display a password)
      objectStoreConfigDict = json.loads(objectStoreConfigDict)

    if not objectStoreConfigDict is None:
      if not isinstance(objectStoreConfigDict, dict):
        print("ObjectStoreConfig did not evaluate to a dictionary")
        raise(InvalidObjectStoreConfigInvalidJSONException)

    self.APIAPP_OBJECTSTOREDETAILLOGGING = readFromEnviroment(
      env=env,
      envVarName='APIAPP_OBJECTSTOREDETAILLOGGING',
      defaultValue='N',
      acceptableValues=['Y', 'N'],
      nullValueAllowed=True
    ).strip()
    if (self.APIAPP_OBJECTSTOREDETAILLOGGING=='Y'):
      print("APIAPP_OBJECTSTOREDETAILLOGGING set to Y - statement logging enabled")

    fns = {
      'getCurDateTime': self.getCurDateTime
    }
    self.objectStore = createObjectStoreInstance(
      objectStoreConfigDict,
      fns,
      detailLogging=(self.APIAPP_OBJECTSTOREDETAILLOGGING == 'Y')
    )

  def initOnce(self):
    super(appObjClass, self).initOnce()
    ##print("appOBj initOnce")
    APIs.registerAPIs(self)

    self.flastRestPlusAPIObject.title = "Challange Platform"
    self.flastRestPlusAPIObject.description = "API for Challange Platform"

  def stopThread(self):
    ##print("stopThread Called")
    pass

  #override exit gracefully to stop worker thread
  def exit_gracefully(self, signum, frame):
    self.stopThread()
    super(appObjClass, self).exit_gracefully(signum, frame)

  def getDerivedServerInfoData(self):
    return {
    }

appObj = appObjClass()
