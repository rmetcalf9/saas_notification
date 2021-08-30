# Amazon SES email sending
#https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-using-sdk-python.html
from ._baseProvider import ProviderBaseClass
import boto3
from botocore.exceptions import ClientError
from boto3 import Session as AWSSession

class AwsSesProvider(ProviderBaseClass):
  awsSession = None
  region_name = None

  def _processInitData(self, config):
    # run on construction. Validate the config
    # boto session is created by class
    # Note the AWSSession is not thread safe.
    #  but as ll processing runs in main thread this is not an issue

    #SPECIAL CONFIG:
    # aws_access_key_id
    # aws_secret_access_key
    # region_name

    if "aws_access_key_id" not in config:
      raise Exception("AwsSes - aws_access_key_id missing")
    if "aws_secret_access_key" not in config:
      raise Exception("AwsSes - aws_secret_access_key missing")
    if "region_name" not in config:
      raise Exception("AwsSes - region_name missing")
    self.region_name = config["region_name"]

    self.awsSession = AWSSession(
      aws_access_key_id=config["aws_access_key_id"],
      aws_secret_access_key=config["aws_secret_access_key"],
      aws_session_token=None,
      region_name=self.region_name,
      botocore_session=None,
      profile_name=None
    )

  def _processMessage(self, sender, receiver, subject, body, destination, bodyDict, tenantConfig, outputFn):
    if receiver is None:
      raise Exception("AwsSes - message has no receiver")

    # override sender set in config
    # recipient -> Should already be set in message

    CHARSET = "UTF-8"
    client = self.awsSession.client('ses', region_name=self.region_name)

    try:
      response = client.send_email(
        Destination={
          'ToAddresses': [
            receiver,
          ],
        },
        Message={
          'Body': {
            'Html': {
              'Charset': CHARSET,
              'Data': body["html"],
            },
            'Text': {
              'Charset': CHARSET,
              'Data': body["text"],
            },
          },
          'Subject': {
            'Charset': CHARSET,
            'Data': subject,
          },
        },
        Source=sender,
      )
      print("AwsSES - Message sent")

    except ClientError as e:
      print("AwsSES Error response:", e.response['Error']['Message'])
      raise e

    # # Replace sender@example.com with your "From" address.
    # # This address must be verified with Amazon SES.
    # SENDER = "Sender Name <sender@example.com>"
    #
    # # Replace recipient@example.com with a "To" address. If your account
    # # is still in the sandbox, this address must be verified.
    # RECIPIENT = "recipient@example.com"
    #
    # # If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
    # AWS_REGION = "us-west-2"

