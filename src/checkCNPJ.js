function checkCNPJ(value) {
  const CNPJ_POSITIONS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const CNPJ_POSITIONS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const cnpj = value.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return 'The CNPJ ' + cnpj + ' has not the correct length (14/15 != ' + cnpj.length + ')';
  }

  const calculateDigit = (base, positions) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += base[i] * positions[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const baseCNPJ = cnpj.slice(0, 12);
  const digit1 = calculateDigit(baseCNPJ, CNPJ_POSITIONS_1);
  const digit2 = calculateDigit(baseCNPJ + digit1, CNPJ_POSITIONS_2);
  const calcCNPJ = baseCNPJ + digit1.toString() + digit2.toString();
  if (cnpj !== calcCNPJ) {
    return 'The CNPJ ' + cnpj + ' is not valid';
  }
  return null;
}
