

class ProviderBaseClass:
  id = None
  type = None
  def __init__(self, providerConfig):
    self.id = providerConfig["id"]
    self.type = providerConfig["type"]

  def getId(self):
    return self.id

  def processMessage(self, destination, bodyDict, tenantConfig, outputFn):
    raise Exception("Provider should override process message function")

