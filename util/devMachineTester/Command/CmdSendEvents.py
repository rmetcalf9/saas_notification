from .Base import Base
import uuid
import json

def nameGetFn(item):
  return item["name"]

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

    for curQueue in selectedQueues:
      body = {
        "id": "123",
        "TODO": "TODO"
      }
      print("Sending", json.dumps(body))
      context["mqClient"].sendStringMessage(destination=curQueue["name"],body=json.dumps(body))
      print("Sent event ", curQueue["name"], body["id"])

