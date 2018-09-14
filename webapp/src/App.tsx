import * as React from "react"
import {BrowserRouter as Router, Route} from "react-router-dom"
import "./App.css"
import {AboutPage} from "./Components/Pages/AboutPage"
import {HomePage} from "./Components/Pages/HomePage"
import {PlayerPage} from "./Components/Pages/PlayerPage"
import {ReplayPage} from "./Components/Pages/ReplayPage"
import {UploadPage} from "./Components/Pages/UploadPage"
import {ReplayViewer} from "./Components/Replay/ReplayViewer/ReplayViewer"

export class App extends React.Component {
    public render() {
        return (
            <Router>
                <div className="App">
                    <Route exact={true} path="/" component={HomePage}/>
                    <Route exact={true} path="/players/overview/:id" component={PlayerPage}/>
                    <Route exact={true} path="/replays/parsed/view/:id" component={ReplayPage}/>
                    <Route exact={true} path="/replay_viewer" component={ReplayViewer}/>
                    <Route exact={true} path="/about" component={AboutPage}/>
                    <Route exact={true} path="/upload" component={UploadPage}/>
                </div>
            </Router>
        )
    }
}

