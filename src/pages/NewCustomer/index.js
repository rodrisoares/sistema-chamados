import { useState, useEffect } from 'react';

import { getCustomer, createCustomer, updateCustomer } from '@/services/customersService';
import { useHistory, useParams, Link } from 'react-router-dom';

import Header from '@/components/Header';
import Title from '@/components/Title';
import { toast } from 'react-toastify';
import { logError } from '@/utils/logError';

import { maskCNPJ, validaCNPJ } from '@/utils/cnpj';

import '../New/new.css';
import { FiUserPlus, FiSave, FiArrowLeft } from 'react-icons/fi';

export default function NewCustomer(){
  const { id } = useParams();
  const history = useHistory();

  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [responsavel, setResponsavel] = useState('');

  const [idCustomer, setIdCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(()=> {
    async function loadId(){
      setLoading(true);
      try{
        const d = await getCustomer(id);
        if(!d){
          toast.error('Cliente não encontrado.');
          setIdCustomer(false);
          setLoading(false);
          history.push('/customers');
          return;
        }

        setNomeFantasia(d.nomeFantasia);
        setCnpj(maskCNPJ(d.cnpj));
        setEndereco(d.endereco);
        setTelefone(d.telefone || '');
        setEmailContato(d.emailContato || '');
        setResponsavel(d.responsavel || '');
        setIdCustomer(true);
        setLoading(false);
      }catch(err){
        logError('NewCustomer:loadId', err);
        toast.error('Cliente não encontrado.');
        setIdCustomer(false);
        setLoading(false);
        history.push('/customers');
      }
    }

    if(id){
      loadId();
    }

  }, [id, history]);


  async function handleRegister(e){
    e.preventDefault();

    const novosErros = {
      nomeFantasia: nomeFantasia.trim() === '',
      cnpj: cnpj.trim() === '' || !validaCNPJ(cnpj),
      endereco: endereco.trim() === ''
    };

    if(novosErros.nomeFantasia || novosErros.cnpj || novosErros.endereco){
      setErrors(novosErros);
      if(novosErros.cnpj && cnpj.trim() !== ''){
        toast.error('CNPJ inválido. Verifique os números digitados.');
      }else{
        toast.error('Preencha todos os campos corretamente!');
      }
      return;
    }

    // E-mail de contato é opcional, mas se preenchido precisa ser válido
    if(emailContato.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailContato.trim())){
      setErrors(er => ({ ...er, emailContato: true }));
      toast.error('E-mail de contato inválido.');
      return;
    }

    setErrors({});
    setLoading(true);

    const dadosCliente = {
      nomeFantasia: nomeFantasia,
      cnpj: cnpj,
      endereco: endereco,
      telefone: telefone,
      emailContato: emailContato,
      responsavel: responsavel
    };

    //Editando um cliente existente
    if(idCustomer){
      try{
        await updateCustomer(id, dadosCliente);
        toast.success('Cliente editado com sucesso!');
        history.push('/customers');
      }catch(error){
        logError('NewCustomer:update', error);
        toast.error('Erro ao editar esse cliente.');
        setLoading(false);
      }

      return;
    }

    //Cadastrando um novo cliente
    try{
      await createCustomer(dadosCliente);
      toast.success('Cliente cadastrado com sucesso!');
      history.push('/customers');
    }catch(error){
      logError('NewCustomer:create', error);
      toast.error('Erro ao cadastrar esse cliente.');
      setLoading(false);
    }

  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name={idCustomer ? "Editar cliente" : "Novo cliente"}>
          <FiUserPlus size={25} />
        </Title>

        <div className="container">

          <form className="form-profile" onSubmit={handleRegister}>

            <label>Nome da Empresa</label>
            <input
              type="text"
              placeholder="Digite o nome da empresa"
              className={errors.nomeFantasia ? 'input-invalid' : ''}
              value={nomeFantasia}
              onChange={ (e) => { setNomeFantasia(e.target.value); setErrors(er => ({ ...er, nomeFantasia: false })); } }
            />

            <label>CNPJ</label>
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className={errors.cnpj ? 'input-invalid' : ''}
              value={cnpj}
              onChange={ (e) => { setCnpj(maskCNPJ(e.target.value)); setErrors(er => ({ ...er, cnpj: false })); } }
            />

            <label>Endereço</label>
            <input
              type="text"
              placeholder="Digite o Endereço da empresa"
              className={errors.endereco ? 'input-invalid' : ''}
              value={endereco}
              onChange={ (e) => { setEndereco(e.target.value); setErrors(er => ({ ...er, endereco: false })); } }
            />

            <label>Telefone <span className="label-opcional">(opcional)</span></label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={ (e) => setTelefone(e.target.value) }
            />

            <label>E-mail de contato <span className="label-opcional">(opcional)</span></label>
            <input
              type="text"
              placeholder="contato@empresa.com"
              className={errors.emailContato ? 'input-invalid' : ''}
              value={emailContato}
              onChange={ (e) => { setEmailContato(e.target.value); setErrors(er => ({ ...er, emailContato: false })); } }
            />

            <label>Responsável <span className="label-opcional">(opcional)</span></label>
            <input
              type="text"
              placeholder="Nome do responsável na empresa"
              value={responsavel}
              onChange={ (e) => setResponsavel(e.target.value) }
            />

            <div className="form-botoes">
              <Link to="/customers" className="btn-form btn-secundario">
                <FiArrowLeft size={18} />
                Voltar
              </Link>

              <button type="submit" className="btn-form btn-primario" disabled={loading}>
                <FiSave size={18} />
                { loading ? 'Salvando...' : (idCustomer ? 'Salvar' : 'Cadastrar') }
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  )
}
