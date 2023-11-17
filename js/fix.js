function fix(input) {
  input = input.replace('Abonnenten', 'Subscribers');
  if (input.includes('Mio.')) {
    input = input.replace('Â Mio.', 'M');
    input = input.replace(',', '.');
    input = input.replace('Mio.', 'M');
    if (input.includes('000')) {
      input = input.replace('.000', 'K');
    } else if (input.includes('00')) {
      input = input.replace('00', 'K');
    }
  } else {
    if (input.includes(',')) {
      input = input.replace(',', '.');
      input = input.replace(' Subscribers', 'K Subscribers');
    }
    if (input.split(' Subscribers')[0].length == 4) {
      input = (input.split(' Subscribers')[0])
      input = parseInt(input).toLocaleString('en-US') + ' Subscribers';
    }
  }
  input = input.replace('.000', 'K');
  if (input == '0') {
    input = '0 Subscribers';
  }
  return input;
}