import './SplashPad.scss';
import { Row, Column, Button, Content } from 'carbon-components-react';


export default function SplashPad() {
    return (
        <Content>
            <Row>
                <Column className='splash-pad-title'>
                    <h1>Mueller Branch Park</h1>
                </Column>
            </Row>
            <Row>
                <Column className='splash-pad-status center'>
                    <h1>Status</h1>
                </Column>
            </Row>
            <Row>
                <Column className='splash-pad-details center'>
                    Last Update: 3 minutes ago <br></br>
            Working: 0 | Not Working: 2
          </Column>
            </Row>
            <Row>
                <Column className='splash-pad-buttons center'>
                    <Button>Working</Button>
                    <Button>Not Working</Button>
                </Column>
            </Row>
        </Content>
    );
}
