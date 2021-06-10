import './App.scss';
import { Content, Header, HeaderName } from 'carbon-components-react';


function App() {
  return (
    <>
      <Header aria-label="Mueller Spalsh Pad">
        <HeaderName prefix="" >
          Mueller Spalsh Pad
        </HeaderName>
      </Header>
      <Content>
        <div>Splash Pad</div>
      </Content>
    </>
  );
}

export default App;
