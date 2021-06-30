import './SplashPad.scss';
import { Row, Column, Button, Content, Loading, Link } from 'carbon-components-react';
import React, { useState, useEffect, useCallback } from 'react';


export default function SplashPad({ title, parkKey, location }) {

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [statusData, setStatusData] = useState({});

    const theme = statusData.status === 'working' ? 'working-theme'
        : statusData.status === 'not_working' ? "not-working-theme"
            : "unknow-theme"

    const handleResults = (result) => {
        setStatusData({
            ...result,
            statusText: result.status === 'working' ? <><p>{"Hurray!"}</p><p>{"It's working"}</p></>
                : result.status === 'not_working' ? <><p>{"Awww :'("}</p><p>{"not working"}</p></>
                    : <><p>{"Not sure..."}</p><p>{"Let us know"}</p></>
        })
        setIsLoaded(true)
    }
    const handleError = (error) => {
        setIsLoaded(true)
        console.log(error)
    }

    useEffect(() => {
        fetch(`/status/${parkKey}`)
            .then(res => res.json())
            .then(handleResults, handleError)
    }, [parkKey])

    const vote = useCallback(async ({ on }) => {
        setIsLoaded(false)
        const parameters = {
            method: 'post', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote: on ? "on" : "off", location })
        }
        await fetch(`/status/${parkKey}`, parameters)
            .then(res => res.json())
            .then(handleResults, handleError)
            .finally(() => setHasVoted(true))

    }, [location, parkKey])

    if (isLoaded) {
        return (
            <Content className={theme}>
                <Row>
                    <Column className='splash-pad-title'>
                        <div>{title}</div>
                    </Column>
                </Row>
                <Row>
                    <Column className='splash-pad-status center'>
                        <div>{statusData.statusText}</div>
                    </Column>
                </Row>
                <Row className='splash-pad-details center'>
                    <Column className="splash-pad-detail center">
                        <p>Last Update:</p><p>{statusData.updated_at}</p>
                    </Column>
                    <Column className="splash-pad-detail center">
                        <p>Working: {statusData.votes.working}</p>
                        <p> Not Working: {statusData.votes.not_working}</p>
                    </Column>
                </Row>
                <Row>
                    {hasVoted || !location.latitude ? <></> :
                        <Column className='splash-pad-buttons center'>
                            <Button onClick={() => vote({ on: true })}>Working</Button>
                            <Button onClick={() => vote({ on: false })}>Not Working</Button>
                        </Column>}
                </Row>
                <div className="contribute center">Contribute on&nbsp;<Link href="https://github.com/geramirez/mueller-splash-pad/">Github</Link></div>
            </Content>
        );
    } else {
        return <Loading></Loading>
    }

}
