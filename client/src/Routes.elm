module Routes exposing (Route(..), aboutRoute, parseUrl, splashPadRoute)

import Url exposing (Url)
import Url.Parser exposing (..)


type Route
    = SplashPadRoute
    | AboutRoute
    | NotFoundRoute


matchers : Parser (Route -> a) a
matchers =
    oneOf
        [ map SplashPadRoute top
        , map AboutRoute (s "about")
        , map SplashPadRoute (s "branch-park")
        ]


parseUrl : Url -> Route
parseUrl url =
    case parse matchers url of
        Just route ->
            route

        Nothing ->
            NotFoundRoute


pathFor : Route -> String
pathFor route =
    case route of
        SplashPadRoute ->
            "/#/branch-park"

        AboutRoute ->
            "/#/about"

        NotFoundRoute ->
            "/"


splashPadRoute : String
splashPadRoute =
    pathFor SplashPadRoute


aboutRoute : String
aboutRoute =
    pathFor AboutRoute
