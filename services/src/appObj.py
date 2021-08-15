#appObj.py - This file contains the main application object
# to be constructed by app.py

from baseapp_for_restapi_backend_with_swagger import AppObjBaseClass as parAppObj, readFromEnviroment

import constants
import json

import logging
import sys
import APIs
import mq_client_abstraction

from object_store_abstraction import createObjectStoreInstance

invalidConfigurationException = constants.customExceptionClass('Invalid Configuration')

InvalidMqClientConfigInvalidJSONException = constants.customExceptionClass('APIAPP_MQCLIENTCONFIG value is not valid JSON')

class appObjClass(parAppObj):
  accessControlAllowOriginObj = None
  mqClient = None

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

    mqClientConfigJSON = readFromEnviroment(env, 'APIAPP_MQCLIENTCONFIG', '{}', None)
    mqClientConfigDict = None
    try:
      if mqClientConfigJSON != '{}':
        mqClientConfigDict = json.loads(mqClientConfigJSON)
    except Exception as err:
      print(err) # for the repr
      print(str(err)) # for just the message
      print(err.args) # the arguments that the exception has been called with.
      raise(InvalidMqClientConfigInvalidJSONException)

    self.mqClient = mq_client_abstraction.createMQClientInstance(configDict=mqClientConfigDict)

    super(appObjClass, self).init(env, serverStartTime, testingMode, serverinfoapiprefix='public/info')
    ##print("appOBj init")

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
