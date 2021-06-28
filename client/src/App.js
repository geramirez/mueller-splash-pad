import './App.scss';
import { Header, HeaderName, SideNavLink, SideNav, Content, Row, ClickableTile, Column, SideNavItems, HeaderMenuButton, SkipToContent, HeaderContainer } from 'carbon-components-react';
import SplashPad from './SplashPad'
import About from './About'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";


const splashPads = [
  { path: '/bartholomew', title: 'Bartholomew Park Splashpad', parkKey: 'bartholomew' },
  { path: '/chestnut', title: 'Chestnut', parkKey: 'chestnut' },
  { path: '/eastwoods', title: 'Eastwoods', parkKey: 'eastwoods' },
  { path: '/liz-carpenter', title: 'Liz Carpenter Park', parkKey: 'liz-carpenter' },
  { path: '/lott', title: 'Lott', parkKey: 'lott' },
  { path: '/metz', title: 'Metz', parkKey: 'metz' },
  { path: '/mueller-branch-park', title: 'Mary Elizabeth Branch Park', parkKey: 'mueller-branch-park' },
  { path: '/ricky-guerrero', title: 'Ricky Guerrero Park', parkKey: 'ricky-guerrero' },
  { path: '/rosewood', title: 'Rosewood Park', parkKey: 'rosewood' },
]

function AppHeader() {
  
  const location = useLocation();
  const getHeaderTitle = () => {
    if (window.location.hostname.includes('muellersplashpad') && location.pathname === '/')
      return 'Austin Splash Pads - Mary Elizabeth Branch Park'
    else if (!window.location.hostname.includes('muellersplashpad') && location.pathname === '/')
      return "Austin Splash Pads"
    else if (splashPads.some(pad => pad.path === location.pathname))
      return `Austin Splash Pads - ${splashPads.find(pad => pad.path === location.pathname).title}`
    else 
      return 'Austin Splash Pads'

  }


  return (<HeaderContainer
    render={({ isSideNavExpanded, onClickSideNavExpand }) => (
      <Header aria-label="Austin Splash Pads">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={onClickSideNavExpand}
          isActive={isSideNavExpanded}
        />
        <HeaderName  href="/" prefix="" >
          {getHeaderTitle()}
        </HeaderName>
        <SideNav aria-label="Side navigation" expanded={isSideNavExpanded}>
          <SideNavItems>
            {splashPads.map(({ path, title, parkKey }, idx) => (
              <SideNavLink href={path} key={`${idx}-${parkKey}`}>
                {title}
              </SideNavLink>
            ))}
              <SideNavLink href="/about">
                About
              </SideNavLink>
          </SideNavItems>
        </SideNav>
      </Header>
    )}
  />)

}

function AllSplashPads() {

  return (<Content>
    <Row>
      <Column >
        {splashPads.map(({ path, title, parkKey }, idx) => (
          <ClickableTile className="tile" key={`${idx}-${parkKey}`} href={path} >{title}</ClickableTile>
        ))}
      </Column>
    </Row>
  </Content>)
}

function App() {
  const HomePage = window.location.hostname.includes('muellersplashpad') ?
    <SplashPad title="Mary Elizabeth Branch Park" parkKey="mueller-branch-park" /> :
    < AllSplashPads />

  return (
    <>
      <Router>
        <AppHeader />
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
          <Route path="/">
            {HomePage}
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
