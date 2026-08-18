import { describe, it, expect } from 'vitest';
import { corStatus, corPrioridade, STATUS_COR, PRIORIDADE_COR } from './status';

describe('corStatus', () => {
  it('retorna a cor de um status conhecido', () => {
    expect(corStatus('Aberto')).toBe(STATUS_COR['Aberto']);
  });

  it('usa a cor padrão para status desconhecido', () => {
    expect(corStatus('Inexistente')).toBe('#999999');
  });
});

describe('corPrioridade', () => {
  it('retorna a cor de uma prioridade conhecida', () => {
    expect(corPrioridade('Alta')).toBe(PRIORIDADE_COR['Alta']);
  });

  it('usa a cor padrão para prioridade desconhecida', () => {
    expect(corPrioridade('Nenhuma')).toBe('#999999');
  });
});
