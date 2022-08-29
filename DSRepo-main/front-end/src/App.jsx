import Home from "./pages/Home"
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDetails from "./pages/UserDetails";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";


const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Register />
        </Route>
        <Route path="/UserDetails">
          <UserDetails />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;