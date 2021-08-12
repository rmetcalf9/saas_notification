# simple test to make sure baseapp is properly configured

import TestHelperSuperClass
import python_Testing_Utilities
import json
import constants

class helpers(TestHelperSuperClass.testClassWithHelpers):
  def _getEnvironment(self):
    return TestHelperSuperClass.env

class test_adminapi(helpers):
  def test_infoEndpoint(self):
    #call rsults as /api/public/info/serverinfo
    apiResultTMP = self.assertInfoAPIResult(
      methodFN=self.testClient.get,
      url="/serverinfo",
      session=None,
      data=None
    )
    self.assertEqual(apiResultTMP.status_code, 200)
    apiResult = json.loads(apiResultTMP.get_data(as_text=True))

    expectedRes = {
      'Server': {
        'APIAPP_APIDOCSURL': '_',
        'Version': 'TEST-3.3.3',
        'APIAPP_FRONTENDURL': TestHelperSuperClass.env['APIAPP_FRONTENDURL']
      },
      'Derived': {
      }
    }

    python_Testing_Utilities.assertObjectsEqual(
      unittestTestCaseClass=self,
      first=apiResult,
      second=expectedRes,
      msg="Server Info return wrong",
      ignoredRootKeys=[]
    )
