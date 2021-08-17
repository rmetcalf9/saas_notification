

'''
Config format:
{
  "tenantName": {**TENNANT**}
}

**TENNANT**
{
  "destName": {
    "durableSubscriptionName": ""
  }
}
'''

'''
From gitlab
{
  providerName: "VerifyEmail"
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
  def __init__(self, configDict):
    self.tenantConfigs = []
    for currentTenant in configDict.keys():
      self.tenantConfigs.append(TenantConfig(configDict[currentTenant], currentTenant))

    if len(self.tenantConfigs)==0:
      raise Exception("Error in config 003 - 0 tenants found")

  def getTenantList(self):
    return self.tenantConfigs

class TenantConfig:
  configDict = None
  tenantName = None

  def __init__(self, configDict, tenantName):
    self.tenantName = tenantName
    self.configDict = configDict
    if self.configDict is None:
      raise Exception("config is missing")
    for x in configDict.keys():
      if not isinstance(configDict[x], dict):
        raise Exception("Error in config 001 - " + x + " item not dict")
      if "durableSubscriptionName" not in configDict[x]:
        raise Exception("Error in config 002 - " + x + " durableSubscriptionName missing")
      print(x)

  def getDestinationsSubscribedTo(self):
    return list(self.configDict.keys())

  def getDestination(self, destination):
    return self.configDict[destination]
