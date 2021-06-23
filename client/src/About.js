import { Row, Content } from 'carbon-components-react';

export default function About() {

    return (
        <Content>
            <Row>
                <h1>
                    About
                </h1>
            </Row>
            <Row>
                <p>
                    Crowdsouring and public project to help the comunity understand when the Austin area splash pads are open.
                </p>
                </Row>
                <br/>
            <Row>
                <h2>Don't see your splash pad?</h2>
                <p> Put in a request at: <a href="https://github.com/geramirez/mueller-splash-pad">Github</a> or Reach out on the Austin Splash Pads facebook group </p>
            </Row>
        </Content>
    )
}