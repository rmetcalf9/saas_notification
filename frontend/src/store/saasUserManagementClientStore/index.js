import state from './state'
import * as getters from './getters'
import * as mutations from './mutations'
import * as actions from './actions'

/*
saasUserManagementClientStore
to be used on webapps that use saasUserManagement to retrieve JWT tokens
See https://github.com/rmetcalf9/saas_user_management_system
*/

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
