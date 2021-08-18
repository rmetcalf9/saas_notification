from ._baseProvider import ProviderBaseClass
import requests
from requests.auth import HTTPBasicAuth
import os
import json

supportedMethods = [requests.get, requests.post, requests.put, requests.options]

class HttpCallProvider(ProviderBaseClass):
  authCredentials = None

  def _processInitData(self, config):
    authCredentials = None
    if "basicAuthCredentialFile" in config:
      if config["basicAuthCredentialFile"] is not None:
        if len(config["basicAuthCredentialFile"]) > 0:
          if not os.path.isfile(config["basicAuthCredentialFile"]):
            raise Exception("HTTPCall - Can not find basicAuthCredentialFile - " + config["basicAuthCredentialFile"])
          with open(config["basicAuthCredentialFile"], 'r') as file:
            val = file.read()
          try:
            valDict = json.loads(val)
          except Exception:
            raise Exception("HTTPCall - Not valid JSON - " + config["basicAuthCredentialFile"])
          self.authCredentials = HTTPBasicAuth(valDict["username"], valDict["password"])
          print("HTTPCall - Basic auth credentials setup")

  def _getSupportedMethodAndUrl(self, value):
    for x in supportedMethods:
      if value.startswith(x.__name__ + ":"):
        return (x, value[len(x.__name__)+1:])
    return (None, None)

  def _validateReciever(self, reciever, isFinal):
    if reciever is None:
      if isFinal:
        return False
      return True # we allow non override
    (method, url) = self._getSupportedMethodAndUrl(reciever)
    if method is None:
      raise Exception("HTTPCall - receiver should start with a supported method - " + reciever)

    return True


  def _processMessage(self, sender, receiver, subject, body, destination, bodyDict, tenantConfig, outputFn):
    if receiver is None:
      raise Exception("HTTPCall - message has no receiver")
    (method, url) = self._getSupportedMethodAndUrl(receiver)
    result = requests.post(url, json=body, auth=self.authCredentials)
    outputFn("HTTPCall message -> subject:" + str(subject) + " got response code " + str(result.status_code))
