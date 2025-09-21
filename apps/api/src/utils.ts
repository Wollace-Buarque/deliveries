function safeRetrieveDomain<T extends Record<string, any>>(domain: T): T {
  const dangerousProperties = ['password']

  for (const prop of dangerousProperties) {
    delete domain[prop]
  }

  return domain
}

export { safeRetrieveDomain }
