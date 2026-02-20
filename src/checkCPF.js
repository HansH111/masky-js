function checkCPF(value) {
  const cpf = value.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return 'The CPF ' + cpf + ' has not the correct length (11 != ' + cpf.length + ')';
  }

  for (let verifierPosition = 9;
       verifierPosition < 11; verifierPosition++) {
    let sumOfProducts = 0;
    for (let digitIndex = 0;
         digitIndex < verifierPosition; digitIndex++) {
      const digit = parseInt(cpf[digitIndex]);
      const weight = verifierPosition + 1 - digitIndex;
      sumOfProducts += digit * weight;
    }
    const expectedVerifier = ((sumOfProducts * 10) % 11) % 10;
    const actualVerifier = parseInt(cpf[verifierPosition]);
    if (actualVerifier !== expectedVerifier) {
      return 'The CPF ' + cpf + ' is not correct';
    }
  }
  return null;
}
