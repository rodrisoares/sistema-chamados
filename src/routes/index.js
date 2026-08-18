
import { Switch } from 'react-router-dom';
import Route from './Route';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';

import Chamados from '../pages/Chamados';
import Profile from '../pages/Profile';
import Customers from '../pages/Customers';
import NewCustomer from '../pages/NewCustomer';
import New from '../pages/New';
import Detail from '../pages/Detail';

export default function Routes(){
  return(
    <Switch>
      <Route exact path="/" component={SignIn} />
      <Route exact path="/register" component={SignUp} />

      <Route exact path="/chamados" component={Chamados} isPrivate />
      <Route exact path="/profile" component={Profile} isPrivate />
      <Route exact path="/customers" component={Customers} isPrivate />
      <Route exact path="/customers/new" component={NewCustomer} isPrivate />
      <Route exact path="/customers/:id/edit" component={NewCustomer} isPrivate />
      <Route exact path="/new" component={New} isPrivate />
      <Route exact path="/new/:id" component={New} isPrivate />
      <Route exact path="/chamado/:id" component={Detail} isPrivate />
      
    </Switch>
  )
}