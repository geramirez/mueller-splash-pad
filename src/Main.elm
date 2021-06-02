module Main exposing (..)

import Browser
import Element exposing (Color, alignBottom, centerX, centerY, column, el, fill, height, layout, padding, rgb255, row, text, width)
import Element.Background as Background
import Element.Font as Font
import Element.Input exposing (button)


main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type SpashPadStatus
    = On
    | Off
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
    ( initialModel, Cmd.none )


type Msg
    = None


update : Msg -> Model -> ( Model, Cmd Msg )
update _ model =
    ( model, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = "Mueller Splashpad"
    , body =
        [ layout
            [ Background.color (getColorPalette model).primary, Font.color (getColorPalette model).secondary, padding 30 ]
            (column [ height fill, width fill ]
                [ row [] [ el [ Font.size 40 ] (text "Mueller Splashpad: Last updated at: May 1, 2021 - 3:57PM") ]
                , row [ centerY, centerX ] [ statusElement model ]
                , row [ alignBottom ] [ el [ Font.size 50 ] (text (helpText model)) ]
                ]
            )
        ]
    }


helpText : SpashPadStatus -> String
helpText model =
    "Is this wrong? Text '"
        ++ (if model == On then
                "Not Working"

            else
                "Working"
           )
        ++ "' to 737-235-7904"


isWorkingButton : Element.Element (Cmd msg)
isWorkingButton =
    button
        []
        { onPress = Just Cmd.none
        , label = text "It's Working"
        }


isNotWorkingButton : Element.Element (Cmd msg)
isNotWorkingButton =
    button
        []
        { onPress = Just Cmd.none
        , label = text "It's Not Working"
        }


statusElement : SpashPadStatus -> Element.Element msg
statusElement model =
    el [ Font.size 200 ] (displayText model |> text)


displayText : SpashPadStatus -> String
displayText model =
    case model of
        Off ->
            "Not Working"

        On ->
            "Working!"

        Unknown ->
            "Unknown"


type alias ColorPalette =
    { primary : Color
    , secondary : Color
    }


getColorPalette : SpashPadStatus -> ColorPalette
getColorPalette model =
    case model of
        Off ->
            { primary = rgb255 175 36 30, secondary = rgb255 233 210 153 }

        On ->
            { primary = rgb255 191 255 251, secondary = rgb255 0 111 104 }

        Unknown ->
            { primary = rgb255 173 173 173, secondary = rgb255 247 247 247 }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
