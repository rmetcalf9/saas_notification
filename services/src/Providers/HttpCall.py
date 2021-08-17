from ._baseProvider import ProviderBaseClass

class HttpCallProvider(ProviderBaseClass):


  def processMessage(self, destination, bodyDict, tenantConfig, outputFn):
    raise Exception("HTTPCall TODO")
