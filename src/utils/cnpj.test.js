import { describe, it, expect } from 'vitest';
import { maskCNPJ, validaCNPJ } from './cnpj';

describe('maskCNPJ', () => {
  it('formata um CNPJ completo', () => {
    expect(maskCNPJ('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('ignora caracteres não numéricos', () => {
    expect(maskCNPJ('11a22b')).toBe('11.22');
  });

  it('limita a 14 dígitos', () => {
    expect(maskCNPJ('112223330001810000')).toBe('11.222.333/0001-81');
  });
});

describe('validaCNPJ', () => {
  it('aceita um CNPJ válido', () => {
    expect(validaCNPJ('11.222.333/0001-81')).toBe(true);
  });

  it('rejeita CNPJ com dígito verificador errado', () => {
    expect(validaCNPJ('11.222.333/0001-80')).toBe(false);
  });

  it('rejeita tamanho incorreto', () => {
    expect(validaCNPJ('123')).toBe(false);
  });

  it('rejeita todos os dígitos iguais', () => {
    expect(validaCNPJ('11111111111111')).toBe(false);
  });

  it('rejeita valor vazio', () => {
    expect(validaCNPJ('')).toBe(false);
  });
});
