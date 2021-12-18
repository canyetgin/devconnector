import './App.css';
import { Fragment } from "react";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import {Provider} from "react-redux";
import store from "./store";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const App = () =>(
   <Provider store={store} >
    <Router>
        <Fragment>
             <Navbar/>
             <Route exact path="/" component={ Landing }/>
             <section className="container">
                 <Switch>
                     <Route exact path ="/register" component={Register}/>
                     <Route exact path ="/login" component={Login}/>
                 </Switch>
             </section>
        </Fragment>
    </Router>
   </Provider>
);


export default App;