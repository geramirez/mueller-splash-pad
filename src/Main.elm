module Main exposing (..)

import Browser
import Element exposing (el, centerY, centerX, text, layout, rgb255)
import Element.Background as Background
import Element.Font as Font
import Element exposing (row)
import Element exposing (column)
import Element exposing (height)
import Element exposing (fill)
import Element exposing (width)
import Element exposing (padding)
import Element exposing (Color)

main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }

type SpashPadStatus = On | Off

type alias Model = SpashPadStatus

type alias Flags =
    {}

initialModel : SpashPadStatus
initialModel =
  On

init : Flags -> ( Model, Cmd Msg )
init _ =
    ( initialModel, Cmd.none )

type Msg
  = None

update : Msg -> Model -> ( Model, Cmd Msg )
update _ model = (model, Cmd.none)

view : Model -> Browser.Document Msg
view model =
    { title = "Mueller Splashpad"
    , body =
        [ layout
            [ Background.color (getColorPalette model).primary, Font.color (getColorPalette model).secondary, padding 30 ]
            (column [height fill, width fill] [
              row [] [el [Font.size 50] (text "Mueller Splashpad")]
              ,row [centerY, centerX] [statusElement model]
            ])
        ]
    }

statusElement : SpashPadStatus -> Element.Element msg
statusElement model = 
  el [Font.size 200] ( displayText model |> text )

displayText : SpashPadStatus -> String
displayText model =
  case model of 
    Off -> 
      "Not Working"
    On -> 
      "Working!"


type alias ColorPalette =
  { primary : Color
  , secondary :  Color
  }

getColorPalette : SpashPadStatus -> ColorPalette
getColorPalette model = 
   case model of 
    Off -> 
      {primary = rgb255 173 173 173, secondary = rgb255 247 247 247}
    On -> 
      {primary = rgb255 191 255 251, secondary = rgb255 0 111 104}

subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none