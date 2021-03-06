#appObj.py - This file contains the main application object
# to be constructed by app.py

from baseapp_for_restapi_backend_with_swagger import AppObjBaseClass as parAppObj, readFromEnviroment

import constants
import json

import logging
import sys
import APIs
import mq_client_abstraction
from ThreadSafeMessageToProcess import ThreadSafeMessageToProcess
import time
import Config
import traceback


from object_store_abstraction import createObjectStoreInstance

invalidConfigurationException = constants.customExceptionClass('Invalid Configuration')

InvalidMqClientConfigInvalidJSONException = constants.customExceptionClass('APIAPP_MQCLIENTCONFIG value is not valid JSON')
InvalidConfigInvalidJSONException = constants.customExceptionClass('APIAPP_CONFIG value is not valid JSON')


class appObjClass(parAppObj):
  accessControlAllowOriginObj = None
  mqClient = None
  msgToBeProcessed = None
  config = None

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
    self.msgToBeProcessed = ThreadSafeMessageToProcess()

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

    configJSON = readFromEnviroment(env, 'APIAPP_CONFIG', '{}', None)
    configDict = None
    try:
      if configJSON != '{}':
        configDict = json.loads(configJSON)
    except Exception as err:
      print(err) # for the repr
      print(str(err)) # for just the message
      print(err.args) # the arguments that the exception has been called with.
      raise(InvalidConfigInvalidJSONException)

    self.config = Config.Config(configDict=configDict)

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
    self.mqClient.close(wait=True)
    super(appObjClass, self).exit_gracefully(signum, frame)
    raise self.ServerTerminationError()

  def getDerivedServerInfoData(self):
    return {
    }

  def LocalMessageProcessorFunctionCaller(self, destination, body):
    try:
      self.msgToBeProcessed.setMessageToProcess(destination=destination, body=body)
    except Exception as err:
      print("ERROR PROCESSING RECEIVED MESSAGE - " + str(err))
      return
    #sleep this thread until the main thread has completed processing
    # this prevents us from taking another message before this one is complete
    # required because scrapy will only run on main thread
    while not self.msgToBeProcessed.readyForAnotherMessage():
      ## print("Sleeping")
      time.sleep(0.05)

  def LocalMessageProcessorFunction(self, destination, body, outputFn=print):
    tenantConfig = self.config.getTenantForDestination(destination)
    if tenantConfig is None:
      raise Exception("No tenantConfig found for destination " + str(destination))

    bodyDict = json.loads(body)

    if "providerId" not in bodyDict:
      raise Exception("Error received message has no providerId")
    provider = tenantConfig.getProvider(bodyDict["providerId"])
    if provider is None:
      raise Exception("Error received message but no providerId exists with id " + bodyDict["providerId"])

    provider.processMessage(destination=destination, bodyDict=bodyDict, tenantConfig=tenantConfig, outputFn=outputFn)


  def run(self, custom_request_handler=None):
    print("appObj Run Start")
    if (self.isInitOnce == False):
      raise Exception('Trying to run app without initing')

    for tenant in self.config.getTenantList():
      print("Subscribing to destinations for " + tenant.tenantName)
      for x in tenant.getDestinationsSubscribedTo():
        print("Subscribing to " + x + " durableSubscriptionName:" + tenant.getDestination(x)["durableSubscriptionName"])
        self.mqClient.subscribeToDestination(
          destination=x,
          msgRecieveFunction=self.LocalMessageProcessorFunctionCaller,
          durableSubscriptionName=tenant.getDestination(x)["durableSubscriptionName"]
        )

    print(" end of subscriptions\n")

    try:
      body = None
      while True:
        self.mqClient.processLoopIteration()
        (body, destination) = self.msgToBeProcessed.startProcessing()
        if body is not None:
          try:
            self.LocalMessageProcessorFunction(destination=destination, body=body)
          except Exception as err:
            print("***Exception in processing message - message is dequeued and ignored but app will still run***")
            traceback.print_exc()
            print(err)  # for the repr
            print(str(err))  # for just the message
            print(err.args)  # the arguments that the exception has been called with.
            print("***END***")
          self.msgToBeProcessed.processingComplete()
        time.sleep(0.1)
        pass
    except self.ServerTerminationError:
      pass

appObj = appObjClass()
