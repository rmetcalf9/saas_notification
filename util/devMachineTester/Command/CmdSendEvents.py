from .Base import Base
import uuid
import json

def nameGetFn(item):
  return item["name"]

def itemDisplayFunctionJustItem(item):
  return item

def selectItemsFromList(list, includeAll, subjectText="Queue", itemDisplayFunction=nameGetFn):
  num = 0
  for curItem in list:
    num = num + 1
    print(str(num) + " - " + itemDisplayFunction(curItem))
  if includeAll:
    print("ALL - a")
  retVal = input("Select " + subjectText + " (c to cancel):")
  if retVal == "c":
    return None, True
  if includeAll:
    if retVal == "a":
      return list, False
  try:
    queuNum = int(retVal) - 1
    return [list[queuNum]], False
  except:
    print("invalid")
    return None, True

class CmdSendEvents(Base):
  def __init__(self):
    super().__init__(name="Send Events", cmd="s")

  def run(self, context):
    selectedQueues, cancel = selectItemsFromList(list=context["queues"], includeAll=True)
    if cancel:
      return

    messagesToSend = {
      "rubbishData": {
        "id": "123",
        "TODO": "TODO"
      },
      "unregisteredProviderId": {
        "providerId": "RANDOM"
      },
      "httpcall providerId Only": {
        "providerId": "123"
      },
    }

    selectedMessages, cancel = selectItemsFromList(list=list(messagesToSend.keys()), includeAll=True, itemDisplayFunction=itemDisplayFunctionJustItem)
    if cancel:
      return

    for curMessage in selectedMessages:
      for curQueue in selectedQueues:
        print("Sending message")
        context["mqClient"].sendStringMessage(destination=curQueue["name"],body=json.dumps(messagesToSend[curMessage]))
        print("Sent event")

