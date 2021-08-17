from .HttpCall import HttpCallProvider

def providerFactory(providerConfig):
  if "id" not in providerConfig:
    raise Exception("Provider must have an id")
  if not isinstance(providerConfig["id"], str):
    raise Exception("Provider id must be string")
  if "type" not in providerConfig:
    raise Exception("Provider must have a type")
  if not isinstance(providerConfig["type"], str):
    raise Exception("Provider type must be string")
  if "config" not in providerConfig:
    raise Exception("Provider must have a config")
  if not isinstance(providerConfig["config"], dict):
    raise Exception("Provider config must be dict")

  if providerConfig["type"] == "httpcall":
    return HttpCallProvider(providerConfig)
  else:
    raise Exception("Error unknown provider type " + providerConfig["type"])
