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
