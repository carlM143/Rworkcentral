export const useEmployeePortal = () => {
  const auth = useAuth()

  const displayName = computed(() => auth.user.value?.name ?? 'Employee')
  const email = computed(() => auth.user.value?.email ?? '')
  const initials = computed(() => displayName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join(''))

  return {
    displayName,
    email,
    initials,
  }
}
