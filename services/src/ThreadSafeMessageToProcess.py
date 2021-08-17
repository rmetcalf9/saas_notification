import threading

class ThreadSafeMessageToProcess():
  lock=None
  inProgress=None
  destination=None
  body=None
  tenantConfig=None
  waitingToProcess=None

  def __init__(self):
    self.lock = threading.Lock()
    self.waitingToProcess = False
    self.inProgress = False
    self.destination = None
    self.body = None
    self.tenantConfig = None

  def readyForAnotherMessage(self):
    retVal = True
    self.lock.acquire(blocking=True, timeout=-1)
    if self.waitingToProcess:
      retVal = False
    if self.inProgress:
      retVal = False
    self.lock.release()
    return retVal

  def setMessageToProcess(self, destination, body, tenantConfig):
    self.lock.acquire(blocking=True, timeout=-1)
    try:
      if self.inProgress:
        raise Exception("ERROR MESSAGE already in progress can't set")
      if self.body is not None:
        raise Exception("ERROR MESSAGE body not taken can't set (Body is none)")
      if self.destination is not None:
        raise Exception("ERROR MESSAGE destination not taken can't set (Destination is None)")
      self.destination = destination
      self.body = body
      self.tenantConfig = tenantConfig
      self.waitingToProcess = True
    finally:
      self.lock.release()

  def startProcessing(self):
    self.lock.acquire(blocking=True, timeout=-1)
    if self.inProgress:
      raise Exception("ERROR MESSAGE already in progress can't start")
    if self.body is None:
      self.lock.release()
      return None, None, None
    if self.destination is None:
      raise Exception("ERROR MESSAGE no destination can't start")
    retVal = (self.body, self.destination, self.tenantConfig)
    self.inProgress = True
    self.waitingToProcess = False
    self.lock.release()
    return retVal

  def processingComplete(self):
    self.lock.acquire(blocking=True, timeout=-1)
    if not self.inProgress:
      raise Exception("ERROR MESSAGE NOT in progress can't complete")
    if self.body is None:
      raise Exception("ERROR MESSAGE no body can't complete")
    if self.destination is None:
      raise Exception("ERROR MESSAGE no destination can't complete")
    self.inProgress = False
    self.body = None
    self.destination = None
    self.lock.release()

  def isInProgress(self):
    self.lock.acquire(blocking=True, timeout=-1)
    retVal = self.inProgress
    self.lock.release()
    return retVal
