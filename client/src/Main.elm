module Main exposing (..)

import AboutPage
import Browser exposing (UrlRequest)
import Browser.Hash as Hash
import Browser.Navigation as Nav exposing (Key)
import Html exposing (Html, div, text)
import Routes exposing (Route)
import SplashPadStatusPage
import Url exposing (Url)


type alias Geolocation =
    Maybe { coords : { latitude : Float, longitude : Float }, timestamp : Int }


type alias Flags =
    Geolocation


type alias Model =
    { flags : Flags
    , navKey : Key
    , route : Route
    , page : Page
    }


type Page
    = PageNone
    | PageSplashPadStatus SplashPadStatusPage.Model
    | PageAbout AboutPage.Model


type Msg
    = OnUrlChange Url
    | OnUrlRequest UrlRequest
    | MsgSplashPad SplashPadStatusPage.Msg
    | MsgAboutPage AboutPage.Msg


init : Flags -> Url -> Key -> ( Model, Cmd Msg )
init flags url navKey =
    let
        model =
            { flags = flags
            , navKey = navKey
            , route = Routes.parseUrl url
            , page = PageNone
            }
    in
    ( model, Cmd.none )
        |> loadCurrentPage


loadCurrentPage : ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
loadCurrentPage ( model, cmd ) =
    let
        ( page, newCmd ) =
            case model.route of
                Routes.SplashPadRoute ->
                    let
                        ( pageModel, pageCmd ) =
                            SplashPadStatusPage.init model.flags
                    in
                    ( PageSplashPadStatus pageModel, Cmd.map MsgSplashPad pageCmd )

                Routes.AboutRoute ->
                    let
                        ( pageModel, pageCmd ) =
                            AboutPage.init model.flags
                    in
                    ( PageAbout pageModel, Cmd.map MsgAboutPage pageCmd )

                Routes.NotFoundRoute ->
                    ( PageNone, Cmd.none )
    in
    ( { model | page = page }, Cmd.batch [ cmd, newCmd ] )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model.page ) of
        ( OnUrlRequest urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( model
                    , Nav.pushUrl model.navKey (Url.toString url)
                    )

                Browser.External url ->
                    ( model
                    , Nav.load url
                    )

        ( OnUrlChange url, _ ) ->
            let
                newRoute =
                    Routes.parseUrl url
            in
            ( { model | route = newRoute }, Cmd.none )
                |> loadCurrentPage

        ( MsgSplashPad subMsg, PageSplashPadStatus pageModel ) ->
            let
                ( newPageModel, newCmd ) =
                    SplashPadStatusPage.update subMsg pageModel
            in
            ( { model | page = PageSplashPadStatus newPageModel }
            , Cmd.map MsgSplashPad newCmd
            )

        ( MsgAboutPage subMsg, PageAbout pageModel ) ->
            let
                ( newPageModel, newCmd ) =
                    AboutPage.update subMsg pageModel
            in
            ( { model | page = PageAbout newPageModel }
            , Cmd.map MsgAboutPage newCmd
            )

        _ ->
            ( model, Cmd.none )


main : Program Flags Model Msg
main =
    Hash.application
        -- Using Hash.application allows us to use /#/* style routing to simiplify the backend
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlRequest = OnUrlRequest
        , onUrlChange = OnUrlChange
        }


view : Model -> Browser.Document Msg
view model =
    { title = "Splash Pad Status"
    , body = [ currentPage model ]
    }


currentPage : Model -> Html Msg
currentPage model =
    case model.page of
        PageSplashPadStatus pageModel ->
            SplashPadStatusPage.view pageModel
                |> Html.map MsgSplashPad

        PageAbout pageModel ->
            AboutPage.view pageModel
                |> Html.map MsgAboutPage

        _ ->
            notFoundView


notFoundView : Html msg
notFoundView =
    div []
        [ text "Not found"
        ]
