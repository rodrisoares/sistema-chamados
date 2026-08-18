
// Aplica a máscara 00.000.000/0000-00 conforme o usuário digita
export function maskCNPJ(value){
  const d = (value || '').replace(/\D/g, '').slice(0, 14);

  if(d.length > 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  if(d.length > 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  if(d.length > 5)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if(d.length > 2)  return `${d.slice(0,2)}.${d.slice(2)}`;
  return d;
}

// Valida CNPJ pelos dígitos verificadores oficiais
export function validaCNPJ(value){
  const cnpj = (value || '').replace(/\D/g, '');

  if(cnpj.length !== 14) return false;
  if(/^(\d)\1{13}$/.test(cnpj)) return false; // rejeita todos os dígitos iguais

  function calculaDigito(base){
    let soma = 0;
    let pos = base.length - 7;
    for(let i = base.length; i >= 1; i--){
      soma += Number(base.charAt(base.length - i)) * pos--;
      if(pos < 2) pos = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  const digito1 = calculaDigito(cnpj.substring(0, 12));
  if(digito1 !== Number(cnpj.charAt(12))) return false;

  const digito2 = calculaDigito(cnpj.substring(0, 13));
  if(digito2 !== Number(cnpj.charAt(13))) return false;

  return true;
}
