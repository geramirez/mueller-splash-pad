import './App.scss';
import { Header, HeaderName } from 'carbon-components-react';
import SplashPad from './SplashPad'

function App() {
  return (
    <>
      <Header aria-label="Mueller Spalsh Pad">
        <HeaderName prefix="" >
          Austin Splash Pads
        </HeaderName>
      </Header>
      <SplashPad />
    </>
  );
}

export default App;
