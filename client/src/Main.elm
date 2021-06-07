module Main exposing (..)

import Browser
import Debug exposing (toString)
import Element exposing (Color, centerX, centerY, column, el, fill, height, layout, link, padding, rgb255, row, spacing, text, width)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Http
import Json.Decode exposing (field, int, map2, map3, string)
import Json.Encode as Encode


main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type HasVoted
    = Voted
    | NotVoted


type SpashPadStatus
    = On Flags StatusResponse HasVoted
    | Off Flags StatusResponse HasVoted
    | Unknown Flags StatusResponse HasVoted


type alias Model =
    SpashPadStatus


type alias Geolocation =
    Maybe { coords : { latitude : Float, longitude : Float }, timestamp : Int }


type alias Flags =
    Geolocation


init : Flags -> ( Model, Cmd Msg )
init geolocation =
    ( Unknown geolocation Nothing NotVoted, getSplashpadStatus )


type Msg
    = Loading
    | SendVote String
    | GotStatus (Result Http.Error StatusResponseData)


getStatus : StatusResponse -> Flags -> StatusResponse -> HasVoted -> SpashPadStatus
getStatus statusResponse =
    case statusResponse of
        Just statusResponseData ->
            case statusResponseData.status of
                "working" ->
                    On

                "not working" ->
                    Off

                _ ->
                    Unknown

        Nothing ->
            Unknown


updatedText : Model -> String
updatedText model =
    case model of
        On _ (Just statusResponse) _ ->
            " Last Update: " ++ statusResponse.updated_at ++ "\nWorking: " ++ toString statusResponse.votes.working ++ " | Not Working: " ++ toString statusResponse.votes.not_working

        Off _ (Just statusResponse) _ ->
            " Last Update: " ++ statusResponse.updated_at ++ "\nWorking: " ++ toString statusResponse.votes.working ++ " | Not Working: " ++ toString statusResponse.votes.not_working

        Unknown _ (Just statusResponse) _ ->
            " Last Update: " ++ statusResponse.updated_at ++ "\nWorking: " ++ toString statusResponse.votes.working ++ " | Not Working: " ++ toString statusResponse.votes.not_working

        _ ->
            ""


getGeolocation : SpashPadStatus -> Flags
getGeolocation model =
    case model of
        Unknown geolocation _ _ ->
            geolocation

        On geolocation _ _ ->
            geolocation

        Off geolocation _ _ ->
            geolocation


getVoted : SpashPadStatus -> HasVoted
getVoted model =
    case model of
        Unknown _ _ hasVoted ->
            hasVoted

        On _ _ hasVoted ->
            hasVoted

        Off _ _ hasVoted ->
            hasVoted


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotStatus result ->
            case result of
                Ok statusResponse ->
                    ( getStatus (Just statusResponse) (getGeolocation model) (Just statusResponse) (getVoted model), Cmd.none )

                Err _ ->
                    ( Unknown (getGeolocation model) Nothing NotVoted, Cmd.none )

        Loading ->
            ( Unknown (getGeolocation model) Nothing NotVoted, Cmd.none )

        SendVote vote ->
            ( Unknown (getGeolocation model) Nothing Voted, postVotes vote (getGeolocation model) )


view : Model -> Browser.Document Msg
view model =
    { title = "Mueller Splashpad Status"
    , body =
        [ layout
            [ Background.color (getColorPalette model).primary, Font.color (getColorPalette model).secondary, padding 30 ]
            (column [ height fill, width fill, spacing 20 ]
                [ row [] [ el [ Font.size 50 ] (text "Mueller Splashpad Status") ]
                , row [ centerY, centerX ] [ statusElement model ]
                , row [ centerY, centerX ] [ el [ Font.size 30 ] (text (updatedText model)) ]
                , row [ centerX ]
                    [ column []
                        [ row [ spacing 20 ] (updateButtons model)
                        ]
                    ]
                , row [ centerX ]
                    [ link [ Font.size 10, Font.color (rgb255 0 0 0), Font.underline, Font.extraBold ]
                        { url = "https://github.com/geramirez/mueller-splash-pad"
                        , label = text "Visit Github Source Code to report issues"
                        }
                    ]
                ]
            )
        ]
    }


updateButtons : SpashPadStatus -> List (Element.Element Msg)
updateButtons model =
    case model of
        On _ _ Voted ->
            []

        Off _ _ Voted ->
            []

        Unknown _ _ Voted ->
            []

        _ ->
            [ buildWorkingButton (getColorPalette model) "on" "Working", buildWorkingButton (getColorPalette model) "off" "Not Working" ]


buildWorkingButton : ColorPalette -> String -> String -> Element.Element Msg
buildWorkingButton colorPalette onPressPayload label =
    button
        [ padding 45
        , Font.size 60
        , Background.color colorPalette.primary
        , Border.color colorPalette.secondary
        , Border.solid
        , Border.width 3
        , Border.rounded 10
        , Element.focused
            [ Background.color colorPalette.secondary, Font.color colorPalette.primary ]
        ]
        { onPress = Just (SendVote onPressPayload)
        , label = text label
        }


isWorkingButton : ColorPalette -> Element.Element Msg
isWorkingButton colorPalette =
    button
        [ padding 45
        , Font.size 60
        , Background.color colorPalette.primary
        , Border.color colorPalette.secondary
        , Border.solid
        , Border.width 3
        , Border.rounded 10
        , Element.focused
            [ Background.color colorPalette.secondary, Font.color colorPalette.primary ]
        ]
        { onPress = Just (SendVote "on")
        , label = text "It's Working"
        }


isNotWorkingButton : ColorPalette -> Element.Element Msg
isNotWorkingButton colorPalette =
    button
        [ padding 45
        , Font.size 60
        , Background.color colorPalette.primary
        , Border.color colorPalette.secondary
        , Border.solid
        , Border.width 3
        , Border.rounded 10
        , Element.focused
            [ Background.color colorPalette.secondary, Font.color colorPalette.primary ]
        ]
        { onPress = Just (SendVote "off")
        , label = text "It's Not Working"
        }


statusElement : SpashPadStatus -> Element.Element msg
statusElement model =
    el [ Font.size 150, Font.center ] (displayText model |> text)


displayText : SpashPadStatus -> String
displayText model =
    case model of
        Off _ _ _ ->
            "Awww :(\nIt's not working"

        On _ _ _ ->
            "Hurray!\nIt's working"

        Unknown _ _ _ ->
            "Not Sure..."


type alias ColorPalette =
    { primary : Color
    , secondary : Color
    , tertiary : Color
    }


getColorPalette : SpashPadStatus -> ColorPalette
getColorPalette model =
    case model of
        Off _ _ _ ->
            { primary = rgb255 175 36 30, secondary = rgb255 233 210 153, tertiary = rgb255 43 45 66 }

        On _ _ _ ->
            { primary = rgb255 191 255 251, secondary = rgb255 0 111 104, tertiary = rgb255 23 26 33 }

        Unknown _ _ _ ->
            { primary = rgb255 173 173 173, secondary = rgb255 247 247 247, tertiary = rgb255 18 16 14 }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


getSplashpadStatus =
    Http.get
        { url = "/status"
        , expect = Http.expectJson GotStatus splashPadGetResponseDecoder
        }


postVotes : String -> Geolocation -> Cmd Msg
postVotes vote geolocation =
    let
        payload =
            case geolocation of
                Nothing ->
                    [ ( "vote", Encode.string vote )
                    ]

                Just geolocationData ->
                    [ ( "vote", Encode.string vote )
                    , ( "location"
                      , Encode.object
                            [ ( "latitude", Encode.float geolocationData.coords.latitude )
                            , ( "longitude", Encode.float geolocationData.coords.longitude )
                            ]
                      )
                    ]
    in
    Http.post
        { url = "/status"
        , body =
            Http.jsonBody
                (Encode.object payload)
        , expect = Http.expectJson GotStatus splashPadGetResponseDecoder
        }


type alias VoteResponse =
    { working : Int, not_working : Int }


type alias StatusResponseData =
    { status : String
    , votes : VoteResponse
    , updated_at : String
    }


type alias StatusResponse =
    Maybe StatusResponseData


splashPadGetResponseDecoder : Json.Decode.Decoder StatusResponseData
splashPadGetResponseDecoder =
    map3 StatusResponseData
        (field "status" string)
        (field "votes" voteResponseDecoder)
        (field "updated_at" string)


voteResponseDecoder : Json.Decode.Decoder VoteResponse
voteResponseDecoder =
    map2 VoteResponse
        (field "working" int)
        (field "not_working" int)
