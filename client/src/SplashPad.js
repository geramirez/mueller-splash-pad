import './SplashPad.scss';
import { Row, Column, Button, Content, Loading } from 'carbon-components-react';
import React, { useState, useEffect, useCallback } from 'react';

//{"status":"unknown","votes":{"working":0,"not_working":0},"updated_at":"N/A"}

export default function SplashPad() {

    const [isLoaded, setIsLoaded] = useState(false);
    const [statusData, setStatusData] = useState({});

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
        fetch("/status")
            .then(res => res.json())
            .then(handleResults, handleError)
    }, [])



    const vote = useCallback(async ({ on }) => {
        setIsLoaded(false)
        await fetch("/status", {
            method: 'post', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote: on ? "on" : "off" })
        })
            .then(res => res.json())
            .then(handleResults, handleError)
    }, [])


    if (isLoaded) {
        return (
            <Content>
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
                    <Column >
                        <p>Last Update:</p><p>{statusData.updated_at}</p>
                    </Column>
                    <Column >
                        <p>Working: {statusData.votes.working}</p>
                        <p> Not Working: {statusData.votes.not_working}</p>
                    </Column>
                </Row>
                <Row>
                    <Column className='splash-pad-buttons center'>
                        <Button onClick={() => vote({ on: true })}>Working</Button>
                        <Button onClick={() => vote({ on: false })}>Not Working</Button>
                    </Column>
                </Row>
            </Content>
        );
    } else {
        return <Loading></Loading>
    }



}
