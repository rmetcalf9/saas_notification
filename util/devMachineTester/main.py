import datetime
import pytz
import Command
import mq_client_abstraction
import os
import json
from ApiClient import ApiClient
import time

baseURL = "http://0.0.0.0:8097"

queues = [
  {"name": "/topic/saasNotificationTest", "tenant": "dev"}
]


print("Start of dev machine tester")

mqClient = mq_client_abstraction.createMQClientInstance(configDict=json.loads(os.environ["APIAPP_MQCLIENTCONFIG"]))

commandManager = Command.commandManager()

uniqueTenants = {}
for queue in queues:
  uniqueTenants[queue["tenant"]] = queue["tenant"]
uniqueTenantList = list(uniqueTenants.keys())

apiClient = ApiClient(baseURL)

postBody = {
  "todo": "TODO"
}

print("Pausing for 2 seconds")
time.sleep(2)

context = {
  "running": True,
  "queues": queues,
  "mqClient": mqClient,
  "apiClient": apiClient
}

while context["running"]:
  commandManager.listCommands()
  command = input("Enter Command:-")
  commandManager.runCommand(command, context)

print("End of dev machine tester")

