import './App.scss';
import { Header, HeaderName } from 'carbon-components-react';
import SplashPad from './SplashPad'
import About from './About'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

const splashPads = [
  { path: '/bartholomew', title: 'Bartholomew Splashpad', parkKey: 'bartholomew' },
  { path: '/mueller-branch-park', title: 'Mueller Branch Park', parkKey: 'mueller-branch-park' },
  { path: '/', title: 'Mueller Branch Park', parkKey: 'mueller-branch-park' },
]

function App() {
  return (
    <>
      <Router>
        <Header aria-label="Mueller Spalsh Pad">
          <HeaderName prefix="" >
            Austin Splash Pads
        </HeaderName>
        </Header>
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          {splashPads.map(({ path, title, parkKey }, idx) => (
            <Route path={path} key={`${idx}-${parkKey}`}>
              <SplashPad title={title} parkKey={parkKey} key={`${idx}-${parkKey}`} />
            </Route>
          ))
          }
        </Switch>
      </Router>
    </>
  );
}

export default App;
