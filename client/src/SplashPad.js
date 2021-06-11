import './SplashPad.scss';
import { Row, Column, Button, Content, Loading } from 'carbon-components-react';
import React, { useState, useEffect, useCallback } from 'react';


export default function SplashPad() {

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [statusData, setStatusData] = useState({});
    const [location, setLocation] = useState({})

    const theme = statusData.status === 'working' ? 'working-theme'
        : statusData.status === 'not working' ? "not-working-theme"
            : "unknow-theme"

    const handleResults = (result) => {
        setStatusData({
            ...result,
            statusText: result.status === 'working' ? "It's working!"
                : result.status === 'not working' ? "Awww, It's not working!"
                    : "Not sure"
        })
        setIsLoaded(true)
    }
    const handleError = (error) => {
        setIsLoaded(true)
        console.log(error)
    }

    useEffect(() => {
        const loadStatusData = () => {
            fetch("/status")
                .then(res => res.json())
                .then(handleResults, handleError)
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude, longitude } }) => {
                setLocation({ latitude, longitude })
                loadStatusData()
            },
            error => {
                console.log(error)
                loadStatusData()
            },
            { enableHighAccuracy: true })
    }, [])

    const vote = useCallback(async ({ on }) => {
        setIsLoaded(false)
        const parameters = {
            method: 'post', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote: on ? "on" : "off", location })
        }
        await fetch("/status", parameters)
            .then(res => res.json())
            .then(handleResults, handleError)
            .finally(() => setHasVoted(true))

    }, [location])

    if (isLoaded) {
        return (
            <Content className={theme}>
                <Row>
                    <Column className='splash-pad-title'>
                        <div>Mueller Branch Park</div>
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
                    {hasVoted ? <></> :
                        <Column className='splash-pad-buttons center'>
                            <Button onClick={() => vote({ on: true })}>Working</Button>
                            <Button onClick={() => vote({ on: false })}>Not Working</Button>
                        </Column>}
                </Row>
            </Content>
        );
    } else {
        return <Loading></Loading>
    }



}
