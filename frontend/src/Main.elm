module Main exposing (..)

import Browser
import Element exposing (Color, centerX, centerY, column, el, fill, height, layout, padding, rgb255, row, spacing, text, width)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Http
import Json.Decode exposing (Decoder, field, string)


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
    = SetOn
    | SetOff
    | SetUknown


update : Msg -> Model -> ( Model, Cmd Msg )
update msg _ =
    case msg of
        SetOn ->
            ( On, Cmd.none )

        SetOff ->
            ( Off, Cmd.none )

        SetUknown ->
            ( Unknown, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = "Mueller Splashpad Status"
    , body =
        [ layout
            [ Background.color (getColorPalette model).primary, Font.color (getColorPalette model).secondary, padding 30 ]
            (column [ height fill, width fill ]
                [ row [] [ el [ Font.size 50 ] (text "Mueller Splashpad Status") ]
                , row [ centerY, centerX ] [ statusElement model ]
                , row [ centerY, centerX ] [ el [ Font.size 20 ] (text " Last updated at: May 1, 2021 - 3:57PM") ]
                , row [ centerX ]
                    [ column []
                        [ row [ spacing 20 ] (updateButtons model)
                        ]
                    ]
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


updateButtons : SpashPadStatus -> List (Element.Element Msg)
updateButtons model =
    case model of
        On ->
            [ isNotWorkingButton (getColorPalette model) ]

        Off ->
            [ isWorkingButton (getColorPalette model) ]

        Unknown ->
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
        { onPress = Just SetOn
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
        { onPress = Just SetOff
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
    , tertiary : Color
    }


getColorPalette : SpashPadStatus -> ColorPalette
getColorPalette model =
    case model of
        Off ->
            { primary = rgb255 175 36 30, secondary = rgb255 233 210 153, tertiary = rgb255 43 45 66 }

        On ->
            { primary = rgb255 191 255 251, secondary = rgb255 0 111 104, tertiary = rgb255 23 26 33 }

        Unknown ->
            { primary = rgb255 173 173 173, secondary = rgb255 247 247 247, tertiary = rgb255 18 16 14 }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


getSplashpadStatus : Cmd Msg
getSplashpadStatus =
  Http.get
    { url = "//localhost:3000"
    , expect = Http.expectJson GotStatus splashPadGetResponseDecoder
    }


splashPadGetResponseDecoder : Decoder String
splashPadGetResponseDecoder =
  field "data" (field "image_url" string)