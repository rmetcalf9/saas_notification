

'''
Config format:
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
  configDict = None

  def __init__(self, configDict):
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
