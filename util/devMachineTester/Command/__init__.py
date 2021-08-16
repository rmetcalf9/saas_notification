from .CmdQuit import CmdQuit
from .CmdSendEvents import CmdSendEvents

class commandManager():
  commands = None
  def __init__(self):
    self.commands = []
    self.commands.append(CmdQuit())
    self.commands.append(CmdSendEvents())

  def listCommands(self):
    for command in self.commands:
      print(command.cmd + " - " + command.name)

  def runCommand(self, command, context):
    for curCommand in self.commands:
      if command == curCommand.cmd:
        curCommand.run(context)
        return
    print("Unknown command " + command)