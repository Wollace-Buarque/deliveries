function isValidCPF(cpf: string) {
  if (!cpf) return false

  cpf = cpf.replace(/[^\d]+/g, '')

  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false

  const cpfArray = cpf.split('')

  const validator = cpfArray
    .filter((digit, index, array) => index >= array.length - 2 && digit)
    .map((element) => +element)

  const toValidate = (pop: number) =>
    cpfArray.filter((digit, index, array) => index < array.length - pop && digit).map((element) => +element)

  const rest = (count: number, pop: number) =>
    ((toValidate(pop).reduce((soma, element, i) => soma + element * (count - i), 0) * 10) % 11) % 10

  return !(rest(10, 2) !== validator[0] || rest(11, 1) !== validator[1])
}

function isPhoneNumberValid(phone: string) {
  const phoneRegex = /^\(?\d{2}\)?[\s-]?[\s9]?\d{4}-?\d{4}$/
  return phoneRegex.test(phone)
}

function isValidZipCode(zipCode: string) {
  const zipCodeRegex = /^\d{5}-?\d{3}$/
  return zipCodeRegex.test(zipCode)
}

export { isValidCPF, isPhoneNumberValid, isValidZipCode }
