import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'

import ScalableLive from './features/sclable-live'
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>kokutele-live</h1>
      </header>
      <main>
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to="/sender">Sender</Link>
                </li>
                <li>
                  <Link to="/receiver">Receiver</Link>
                </li>
              </ul>
            </nav>

            <Switch>
              <Route path="/sender">
                <ScalableLive mode="sender" />
              </Route>
              <Route path="/receiver/:liveId">
                <ScalableLive mode="receiver" />
              </Route>
            </Switch>
          </div>
        </Router>
      </main>
    </div>
  );
}

export default App;
