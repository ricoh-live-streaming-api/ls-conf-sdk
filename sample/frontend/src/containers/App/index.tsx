import './App.css';

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Entrance from '../Entrance';
import IframePage from '../IframePage';
import Login from '../Login';

const App: React.FC<Record<string, never>> = () => {
  return (
    <div className="mdc-theme--background">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Login} />
          <Route path="/login" exact component={Login} />
          <Route path="/room/:roomId/entrance" exact component={Entrance} />
          <Route path="/room/:roomId" exact component={IframePage} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
