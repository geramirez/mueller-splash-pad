import './App.scss';
import { Header, HeaderName, SideNavLink, SideNav, SideNavItems, HeaderMenuButton, SkipToContent, HeaderContainer } from 'carbon-components-react';
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
  const currentSplashPad = splashPads.find(pad => pad.path === location.pathname) || splashPads.find(pad => pad.path === '/mueller-branch-park')

  return (<HeaderContainer
    render={({ isSideNavExpanded, onClickSideNavExpand }) => (
      <Header aria-label="Austin Splash Pads">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={onClickSideNavExpand}
          isActive={isSideNavExpanded}
        />
        <HeaderName prefix="" >
          Austin Splash Pads - {currentSplashPad.title}
      </HeaderName>
        <SideNav aria-label="Side navigation" expanded={isSideNavExpanded}>
          <SideNavItems>
            {splashPads.map(({ path, title, parkKey }, idx) => (
              <SideNavLink href={path} key={`${idx}-${parkKey}`}>
                {title}
              </SideNavLink>
            ))}
          </SideNavItems>
        </SideNav>
      </Header>
    )}
  />)

}



function App() {

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
            <SplashPad title="Mary Elizabeth Branch Park" parkKey="mueller-branch-park" />
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
