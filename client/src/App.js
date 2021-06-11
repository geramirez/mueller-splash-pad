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
  { path: '/bartholomew', title: 'Bartholomew Splashpad', key: 'bartholomew' },
  { path: '/mueller-branch-park', title: 'Mueller Branch Park', key: 'mueller-branch-park' },
  { path: '/', title: 'Mueller Branch Park', key: 'mueller-branch-park' },
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
          {splashPads.map(({ path, title, key }) => (
            <Route path={path}>
              <SplashPad title={title} key={key} />
            </Route>
          ))
          }
        </Switch>
      </Router>
    </>
  );
}

export default App;
