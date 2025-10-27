export default async (policyContext: any) => {
  const user = policyContext.state.user || policyContext.state.userAbility?.user;

  if (!user) {
    return false;
  }

  // TODO: Implement proper permission check when user roles are configured
  // For now, allow authenticated users (both admin and API users)
  return true;
};