module Main exposing (..)

import Browser
import Debug exposing (toString)
import Element exposing (Color, centerX, centerY, column, el, fill, height, layout, link, padding, rgb255, row, spacing, text, width)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Http
import Json.Decode exposing (bool, field, int, map2, map4, string)
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
    = On StatusResponse HasVoted
    | Off StatusResponse HasVoted
    | Unknown


type alias Model =
    SpashPadStatus


type alias Flags =
    {}


initialModel : SpashPadStatus
initialModel =
    Unknown


init : Flags -> ( Model, Cmd Msg )
init _ =
    ( initialModel, getSplashpadStatus )


type Msg
    = Loading
    | SendVote String
    | GotStatus (Result Http.Error StatusResponse)


getIfVoted statusResponse =
    if statusResponse.voted then
        Voted

    else
        NotVoted


getStatus : StatusResponse -> SpashPadStatus
getStatus statusResponse =
    case statusResponse.status of
        "working" ->
            On statusResponse (getIfVoted statusResponse)

        "not working" ->
            Off statusResponse (getIfVoted statusResponse)

        _ ->
            Unknown


updatedText : Model -> String
updatedText model =
    case model of
        On statusResponse _ ->
            " Last updated at: " ++ statusResponse.updated_at ++ "\n Votes -- Working: " ++ toString statusResponse.votes.working ++ " | Not Working: " ++ toString statusResponse.votes.not_working

        Off statusResponse _ ->
            " Last updated at: " ++ statusResponse.updated_at ++ "\n Votes -- Working: " ++ toString statusResponse.votes.working ++ " | Not Working: " ++ toString statusResponse.votes.not_working

        Unknown ->
            ""


update : Msg -> Model -> ( Model, Cmd Msg )
update msg _ =
    case msg of
        GotStatus result ->
            case result of
                Ok statusResponse ->
                    ( getStatus statusResponse, Cmd.none )

                Err _ ->
                    ( Unknown, Cmd.none )

        Loading ->
            ( Unknown, Cmd.none )

        SendVote vote ->
            ( Unknown, postVotes vote )


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
                    [ link [Font.size 10, Font.color (rgb255 0 0 0), Font.underline, Font.extraBold ]
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
        On _ Voted ->
            []

        Off _ Voted ->
            []

        _ ->
            [ isWorkingButton (getColorPalette model), isNotWorkingButton (getColorPalette model) ]


isWorkingButton : ColorPalette -> Element.Element Msg
isWorkingButton colorPalette =
    button
        [ padding 30
        , Font.size 25
        , Background.color colorPalette.primary
        , Border.color colorPalette.tertiary
        , Border.solid
        , Border.width 1
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
        [ padding 30
        , Font.size 25
        , Background.color colorPalette.primary
        , Border.color colorPalette.tertiary
        , Border.solid
        , Border.width 1
        , Border.rounded 10
        , Element.focused
            [ Background.color colorPalette.secondary, Font.color colorPalette.primary ]
        ]
        { onPress = Just (SendVote "off")
        , label = text "It's Not Working"
        }


statusElement : SpashPadStatus -> Element.Element msg
statusElement model =
    el [ Font.size 200 ] (displayText model |> text)


displayText : SpashPadStatus -> String
displayText model =
    case model of
        Off _ _ ->
            "Not \n Working"

        On _ _ ->
            "Working!"

        Unknown ->
            "Unknown"


type alias ColorPalette =
    { primary : Color
    , secondary : Color
    , tertiary : Color
    }


getColorPalette : SpashPadStatus -> ColorPalette
getColorPalette model =
    case model of
        Off _ _ ->
            { primary = rgb255 175 36 30, secondary = rgb255 233 210 153, tertiary = rgb255 43 45 66 }

        On _ _ ->
            { primary = rgb255 191 255 251, secondary = rgb255 0 111 104, tertiary = rgb255 23 26 33 }

        Unknown ->
            { primary = rgb255 173 173 173, secondary = rgb255 247 247 247, tertiary = rgb255 18 16 14 }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


getSplashpadStatus : Cmd Msg
getSplashpadStatus =
    Http.get
        { url = "http://localhost:3000/status"
        , expect = Http.expectJson GotStatus splashPadGetResponseDecoder
        }


postVotes : String -> Cmd Msg
postVotes vote =
    Http.post
        { url = "http://localhost:3000/status"
        , body =
            Http.jsonBody
                (Encode.object
                    [ ( "vote", Encode.string vote )
                    ]
                )
        , expect = Http.expectJson GotStatus splashPadGetResponseDecoder
        }


type alias VoteResponse =
    { working : Int, not_working : Int }


type alias StatusResponse =
    { status : String
    , votes : VoteResponse
    , updated_at : String
    , voted : Bool
    }


splashPadGetResponseDecoder =
    map4 StatusResponse
        (field "status" string)
        (field "votes" voteResponseDecoder)
        (field "updated_at" string)
        (field "voted" bool)


voteResponseDecoder =
    map2 VoteResponse
        (field "working" int)
        (field "not_working" int)
