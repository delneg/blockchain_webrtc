import { FunctionalComponent, h } from 'preact';
import { Route, Router } from 'preact-router';
import adapter from 'webrtc-adapter';

import GoToRoomComponent from "../components/goToRoom";
import NotFoundPage from '../components/notfound';
import Video from "./video";


const App: FunctionalComponent = () => {
    return (
        <div id="preact_root">
            <Router>
                <Route path="/" component={GoToRoomComponent} />
                <Route path="/:roomId" component={Video} />
                <NotFoundPage default />
            </Router>
        </div>
    );
};

export default App;
