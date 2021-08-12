// Common funcitons

function hasRole (role, loggedInInfo) {
  // console.log('hasRole:', role, loggedInInfo)
  if (typeof (loggedInInfo.ThisTenantRoles) === 'undefined') return false
  return loggedInInfo.ThisTenantRoles.includes(role)
}

export default {
  hasRole: hasRole
}
