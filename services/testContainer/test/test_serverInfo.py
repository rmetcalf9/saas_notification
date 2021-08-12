import os
import containerTestCommon
import unittest
import requests

class test_containerAPI(unittest.TestCase):
  def test_ContainerVersionMatchesEnviromentVariable(self):
    self.assertTrue('TESTPARAM_EXPECTED_CONTAINER_VERSION' in os.environ, msg="TESTPARAM_EXPECTED_CONTAINER_VERSION missing from environment")
    resultJSON = containerTestCommon.callInfoAPIService(self, requests.get, url="/serverinfo", loginSession=None, postData=None)
    self.assertEqual(resultJSON['Server']['Version'], os.environ['TESTPARAM_EXPECTED_CONTAINER_VERSION'])
