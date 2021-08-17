
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
      if not self._validateReciever(providerConfig["receiverOverride"]):
        raise Exception("Invalid receiverOverride")
      self.recieverOverride = providerConfig["receiverOverride"]
    self.senderOverride = None
    if "senderOverride" in providerConfig:
      if not self._validateSender(providerConfig["senderOverride"]):
        raise Exception("Invalid senderOverride")
      self.senderOverride = providerConfig["senderOverride"]

  def getId(self):
    return self.id

  def _validateReciever(self, reciever):
    return True
  def _validateSender(self, sender):
    return True

  def processMessage(self, destination, bodyDict, tenantConfig, outputFn):
    receiver = None
    if self.recieverOverride is not None:
      receiver = self.recieverOverride
    elif "receiver" in bodyDict:
      receiver = bodyDict["receiver"]
    sender = None
    if not self._validateReciever(receiver):
      raise Exception("Invalid Receiver")

    if self.senderOverride is not None:
      sender = self.senderOverride
    elif "receiver" in bodyDict:
      sender = bodyDict["sender"]
    if not self._validateSender(sender):
      raise Exception("Invalid Sender")

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

