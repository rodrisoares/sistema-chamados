import { Component } from 'react';
import './errorboundary.css';
import { logError } from '@/utils/logError';

// Captura erros de renderização em qualquer componente filho e exibe
// um fallback amigável em vez de uma tela branca.
// (Precisa ser componente de classe — React não oferece equivalente em hooks.)
class ErrorBoundary extends Component {
  constructor(props){
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(){
    return { hasError: true };
  }

  componentDidCatch(error, info){
    logError('ErrorBoundary', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render(){
    if(this.state.hasError){
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <h1>Ops! Algo deu errado.</h1>
            <p>Ocorreu um erro inesperado nesta página. Tente recarregar.</p>
            <button onClick={this.handleReload}>Recarregar página</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
