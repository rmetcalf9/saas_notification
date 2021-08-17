
'''
Common provider config
id
type
"receiverOverride"
"senderOverride"
'''

class ProviderBaseClass:
  id = None
  type = None
  recieverOverride = None
  senderOverride = None
  def __init__(self, providerConfig):
    self.id = providerConfig["id"]
    self.type = providerConfig["type"]
    self.recieverOverride = None
    if "receiverOverride" in providerConfig:
      self.recieverOverride = providerConfig["receiverOverride"]
    self.senderOverride = None
    if "senderOverride" in providerConfig:
      self.senderOverride = providerConfig["senderOverride"]

  def getId(self):
    return self.id

  def processMessage(self, destination, bodyDict, tenantConfig, outputFn):
    receiver = None
    if self.recieverOverride is not None:
      receiver = self.recieverOverride
    elif "reciever" in bodyDict:
      receiver = bodyDict["reciever"]
    sender = None
    if self.senderOverride is not None:
      sender = self.senderOverride
    elif "reciever" in bodyDict:
      sender = bodyDict["sender"]

    self._processMessage(
      sender=sender,
      receiver=receiver,
      subject="TODO",
      body="TODO",
      destination=destination,
      bodyDict=bodyDict,
      tenantConfig=tenantConfig,
      outputFn=outputFn
    )

  def _processMessage(self, sender, receiver, subject, body, destination, bodyDict, tenantConfig, outputFn):
    raise Exception("Provider should override process message function")

