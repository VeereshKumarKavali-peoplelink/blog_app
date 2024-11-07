import {component} from 'react'
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'


import LoginForm from './components/LoginForm'
import SignUpForm from './components/SignUpForm'
import Header from './components/Header'
import About from './components/About'
import Contact from './components/Contact'
import BlogsList from './components/BlogsList'
import BlogItemDetails from './components/BlogItemDetails'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/signup" component={SignUpForm} />
      <ProtectedRoute exact path="/" component={BlogsList} />
      <ProtectedRoute exact path="/about" component={About} />
      <ProtectedRoute exact path="/contact" component={Contact} />
      <ProtectedRoute path="/blogs/:id" component={BlogItemDetails} />
      <Route path="/not-found" component={NotFound} />
      <Redirect to="not-found" />
    </Switch>
  </BrowserRouter>
)

export default App