from ._baseProvider import ProviderBaseClass

class HttpCallProvider(ProviderBaseClass):


  def _processMessage(self, sender, receiver, subject, body, destination, bodyDict, tenantConfig, outputFn):
    if receiver is None:
      raise Exception("HTTPCall - message has no receiver")


    raise Exception("HTTPCall TODO")
