module AboutPage exposing (..)

import Html exposing (Html)
import Element exposing (column, el, fill, height, layout, padding, rgb255, row, spacing, text, width)
import Element.Background as Background
import Element.Font as Font

type alias Model =
    {}

init : a -> (Model, Cmd msg)
init _ = 
    (Model, Cmd.none)

view : a -> Html msg
view _ =
     layout [ Background.color (rgb255 191 255 251), Font.color (rgb255 0 111 104), padding 30 ]
        (column [ height fill, width fill, spacing 30 ]
            ([ row [] [ el [ Font.size 50 ] (text "About") ] ])
        )



type Msg
    = NothingYet


update : Msg -> Model -> ( Model, Cmd Msg )
update _ model =
    ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none

