import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Title from './index';

describe('<Title />', () => {
  it('renderiza o nome recebido', () => {
    render(<Title name="Meu título" />);
    expect(screen.getByText('Meu título')).toBeInTheDocument();
  });

  it('renderiza os filhos (ex.: ícone)', () => {
    render(
      <Title name="Chamados">
        <span data-testid="icone" />
      </Title>
    );
    expect(screen.getByTestId('icone')).toBeInTheDocument();
  });
});
