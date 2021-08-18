
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
      if not self._validateReciever(providerConfig["receiverOverride"],isFinal=False):
        raise Exception("Invalid receiverOverride")
      self.recieverOverride = providerConfig["receiverOverride"]
    self.senderOverride = None
    if "senderOverride" in providerConfig:
      if not self._validateSender(providerConfig["senderOverride"],isFinal=False):
        raise Exception("Invalid senderOverride")
      self.senderOverride = providerConfig["senderOverride"]

    self._processInitData(providerConfig["config"])

  def getId(self):
    return self.id

  def processMessage(self, destination, bodyDict, tenantConfig, outputFn):
    #For overrides the override value has precedence over the message value
    receiver = None
    if self.recieverOverride is not None:
      receiver = self.recieverOverride
    elif "receiver" in bodyDict:
      receiver = bodyDict["receiver"]
    sender = None
    if not self._validateReciever(receiver,isFinal=True):
      raise Exception("Invalid Receiver")

    if self.senderOverride is not None:
      sender = self.senderOverride
    elif "receiver" in bodyDict:
      sender = bodyDict["sender"]
    if not self._validateSender(sender,isFinal=True):
      raise Exception("Invalid Sender")


    def readString(bodyDict, key):
      if key not in bodyDict:
        return None
      if not isInstance(bodyDict[key], str):
        raise Exception(key + " of message should be string")
      if bodyDict == "":
        return None # empty strings changed to none
      return bodyDict[key]

    subject = readString(bodyDict, "subject")
    body = readString(bodyDict, "body")

    self._processMessage(
      sender=sender,
      receiver=receiver,
      subject=subject,
      body=body,
      destination=destination,
      bodyDict=bodyDict,
      tenantConfig=tenantConfig,
      outputFn=outputFn
    )

  # Functions to override below

  def _processInitData(self, config):
    pass

  #For the override, isFinal=False, for the final validation isFinal is true
  def _validateReciever(self, reciever, isFinal):
    return True
  def _validateSender(self, sender, isFinal):
    return True


  def _processMessage(self, sender, receiver, subject, body, destination, bodyDict, tenantConfig, outputFn):
    raise Exception("Provider should override process message function")

