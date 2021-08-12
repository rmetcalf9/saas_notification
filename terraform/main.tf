# main.tf

module "saas_infra" {
  source = "git::https://github.com/rmetcalf9/tf_saas_service_infra.git?ref=0.0.2"

  ws_name = var.ws_name
  deployment_config = var.deployment_config

  # include_test_public = false
  # include_test_private = false
  # include_main_public = false
  # include_main_private = false

  # Testing and caused issus. The requests didn't seem to have a cookie.
  # I need to debug. for now falling back to application security
  secure_test_private = false
  secure_main_private = false

  private_allow_tenant_role_whitelist = [
    "saas_notification:hasaccount"
  ]
}

