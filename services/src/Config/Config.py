import Providers
import json

'''
Config format:
{
  "tenantName": {**TENNANT**}
}

**TENNANT**
{
  "dests": [
    "destName": {
      "durableSubscriptionName": ""
    }
  ]
  "providers": [ **PROVIDERS** ]
}

**PROVIDER**
{
  "id": "dd",
  "type": "dd",
  "config": {**DEPENDS ON TYPE SEE TYPE FILE**}
}
'''

'''
Message format:
From gitlab
{
  providerId: "VerifyEmail"
  reciever: provider spercific string. E.g. Email address
  senderOverrideString: 'ddd' OPTIONAL????
  subject: subject
  text: Text of email
  html: html of email
}


Shall I go with tenants?
I could just have different queue and provider subscrptions then I don't need tenenats at all
It is safer to relate queues and providers on a tenenat so the same provider id can refer to different providers
on different tenants 

tenantX: {
  recieverOverrideString: {
    AWSSESEmail: 'XXX'
  },
  providerConfig: {
    ProviderName: 'VerifyEmail', #to match what is in message
    ProviderType: 'AWSSESEmail',
    recieverOverrideString: 'sss',
    senderString: 'sss',
    ProvierSpercific: { AWS Connection details etc.}
  },
  sourceToWatch: {
    details of Message provider, credentials etc.
  }
}
'''

class Config:
  tenantConfigs = None
  destinationConfigMap = None
  def __init__(self, configDict):
    self.tenantConfigs = []
    if isinstance(configDict, str):
      configDict = json.loads(configDict)
    for currentTenant in configDict.keys():
      self.tenantConfigs.append(TenantConfig(configDict[currentTenant], currentTenant))

    if len(self.tenantConfigs)==0:
      raise Exception("Error in config 003 - 0 tenants found")

    self.destinationConfigMap = {}
    for curTenantConfig in self.tenantConfigs:
      for q in curTenantConfig.getDestinationsSubscribedTo():
        if q in self.destinationConfigMap:
          raise Exception("Error - same queue is subscribed more than once")
        else:
          self.destinationConfigMap[q] = curTenantConfig

  def getTenantList(self):
    return self.tenantConfigs

  def getTenantForDestination(self, destination):
    return self.destinationConfigMap[destination]

class TenantConfig:
  dests = None
  tenantName = None
  loadedProviders = None

  def __init__(self, configDict, tenantName):
    self.tenantName = tenantName
    self.dests = {}
    self.loadedProviders = {}
    if configDict is None:
      raise Exception("config is missing")
    expectedListKeys = ["providers", "dests"]
    for edk in expectedListKeys:
      if edk not in configDict:
        raise Exception("Error in config 004 - No " + edk)
      if not isinstance(configDict[edk], list):
        raise Exception("Error in config 005 - " + edk + " must be a list")

    for curDest in configDict["dests"]:
      self.dests[curDest["name"]] = curDest
    if len(self.dests.keys())==0:
       raise Exception("Error in config 007 - Must be at least one dest")

    for providerDict in configDict["providers"]:
      provider = Providers.providerFactory(providerDict)
      if provider.getId() in self.loadedProviders:
        raise Exception("Error in config 008 - Multiple providers in same tenant with same id")
      self.loadedProviders[provider.getId()] = provider
    if len(self.loadedProviders.keys())==0:
      raise Exception("Error in config 006 - Must be at least one provider")


  def getDestinationsSubscribedTo(self):
    return list(self.dests.keys())

  def getDestination(self, destination):
    return self.dests[destination]

  def getProvider(self, providerId):
    if providerId not in self.loadedProviders:
      return None
    return self.loadedProviders[providerId]
