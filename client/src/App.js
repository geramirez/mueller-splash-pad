import './App.scss';
import { Header, HeaderName, SideNavLink, SideNav, Content, SideNavItems, HeaderMenuButton, SkipToContent, HeaderContainer } from 'carbon-components-react';
import SplashPad from './SplashPad'
import About from './About'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';

function AppHeader({ splashPads }) {

  const location = useLocation();
  const getHeaderTitle = () => {
    if (window.location.hostname.includes('muellersplashpad') && location.pathname === '/')
      return 'Austin Splash Pads - Mary Elizabeth Branch Park'
    else if (!window.location.hostname.includes('muellersplashpad') && location.pathname === '/')
      return "Austin Splash Pads"
    else if (splashPads.some(pad => pad.path === location.pathname))
      return `Austin Splash Pads - ${splashPads.find(pad => pad.path === location.pathname).name}`
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
        <HeaderName href="/" prefix="" >
          {getHeaderTitle()}
        </HeaderName>
        <SideNav aria-label="Side navigation" expanded={isSideNavExpanded}>
          <SideNavItems>
            {splashPads.map(({ name, parkKey }, idx) => (
              <SideNavLink href={`/${parkKey}`} key={`${idx}-${parkKey}`}>
                {name}
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

function AllSplashPads({ splashPads }) {
  return (<Content className="map-page">
    <GoogleMapReact
      bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
      yesIWantToUseGoogleMapApiInternals={true}
      defaultCenter={{
        lat: 30.266666,
        lng: -97.733330
      }}
      defaultZoom={12}
    >
      {splashPads.map(({ name, parkKey, latitude, longitude, status }, idx) => (
        <a
          className={`splash-pad-tile ${status}`}
          lat={latitude}
          lng={longitude}
          href={`/${parkKey}`}
          text={name} key={`${idx}-${parkKey}`}>
          {name}
        </a>
      ))
      }
    </GoogleMapReact>
  </Content>)
}

function App() {

  const [location, setLocation] = useState({})
  const [isLoaded, setIsLoaded] = useState(false);
  const [splashPads, setSplashPads] = useState([]);

  const handleResults = (result) => {
    setSplashPads(result)
    setIsLoaded(true)
  }
  const handleError = (error) => {
    setIsLoaded(true)
    console.log(error)
  }

  useEffect(() => {
    fetch(`/status`)
      .then(res => res.json())
      .then(handleResults, handleError)
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocation({ latitude, longitude })
      },
      error => {
        console.log(error)
      },
      { enableHighAccuracy: true })
  }, [])

  return isLoaded ? (
    <>
      <Router>
        <AppHeader splashPads={splashPads} />
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          {splashPads.map(({ name, parkKey }, idx) => (
            <Route path={`/${parkKey}`} key={`${idx}-${parkKey}`}>
              <SplashPad title={name} parkKey={parkKey} key={`${idx}-${parkKey}`} location={location} />
            </Route>
          ))
          }
          <Route path="/">
            {window.location.hostname === 'www.muellersplashpad.com' ?
              <SplashPad title="Mary Elizabeth Branch Park" parkKey="mueller-branch-park" location={location} /> :
              < AllSplashPads splashPads={splashPads} />}
          </Route>
        </Switch>
      </Router>
    </>
  ) : null;
}

export default App;
