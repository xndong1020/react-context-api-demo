### 01. Use `rcc` to create a container component

### 02. Use `rfc` to create a functional component, or `rfce` to export the component at the bottom

### 03. Use `imp` to import Navbar.jsx into App.jsx

### 04. We need a global state for all container components, that's reason why we need context API

### 05. We create a context.jsx under root directory

Every context.jsx should export 2 things: a Provider class, and a Consumer function

```
import React, { Component } from 'react'

const Context = React.createContext()

export class Provider extends Component {
  state = {
    track_list: [
      {
        track: {
          track_name: 'abc'
        }
      },
      {
        track: {
          track_name: '123'
        }
      }
    ],
    heading: 'Top 10 Tracks'
  }

  render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

```

If we put {this.state} as the value of the Provider, it will be shared by all components
You can share only part of the state of the Provider, like {this.state.track_list}

A `consumer function` will be imported into other component, to gain the access to the context (defined in Provider)
This is similar with `connect` in Redux

### 06. Before starts consuming context, in App.jsx, we need to import Provider from context.js, then wrap everything with Provider

```
import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from './context'
import Navbar from './components/layout/Navbar'
import Layout from './components/layout/Layout'
import './App.css'

class App extends Component {
  render() {
    return (
      <Provider>
        <Router>
          <React.Fragment>
            <Navbar />
            <div className="container">
              <Switch>
                <Route exact path="/" component={Layout} />
              </Switch>
            </div>
          </React.Fragment>
        </Router>
      </Provider>
    )
  }
}

export default App

```

### 07. Now in other component, we can start using the consumer to access the context

```
import React, { Component } from 'react'
import { Consumer } from '../../context'

class Tracks extends Component {
  render() {
    return (
     <Consumer>
       {value => {
         console.log(value)
       }}
     </Consumer>
    )
  }
}

export default Tracks
```

This `value` is the value you defined in Provider class render function

```
render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
```

### 08. Create a .env file in root directory.

```
REACT_APP_MM_KEY=<YOUR_MUSIXMATCH_API_KEY>
```

Please note: For react project created by create-react-app, if you want to use .env file, you don't need to install dotenv, BUT THE VARIABLES YOU PUT IN .env FILE, MUST PREFIX WITH `REACT_APP_`, for example `REACT_APP_MM_KEY`.
Also if you made any changes to .env files, make sure you restart the project.

### 09. Now fetch the data from MusixMatch API

```
  componentDidMount = async () => {
    try {
      const response = await axios.get(
        `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/chart.tracks.get?page=1&page_size=10&country=us&f_has_lyrics=1&apikey=${
          process.env.REACT_APP_MM_KEY
        }`
      )
      const {
        data: {
          message: {
            body: { track_list }
          }
        }
      } = response

      this.setState(prevState => {
        return { ...prevState, track_list }
      })
    } catch (error) {
      console.log(error)
    }
  }
```

### 09. Create Tracks container component and Track functional component

```
import React, { Component } from 'react'
import { Consumer } from '../../context'
import Spinner from '../layout/Spinner'
import Track from './Track'

class Tracks extends Component {
  render() {
    return (
      <Consumer>
        {value => {
          const { track_list, heading } = value
          if (!track_list || !track_list.length) {
            return <Spinner />
          } else {
            return (
              <React.Fragment>
                <h3 className="text-center mb-4">{heading}</h3>
                <div className="row">
                  {track_list.map(item => (
                    <Track key={item.track.track_id} track={item.track} />
                  ))}
                </div>
              </React.Fragment>
            )
          }
        }}
      </Consumer>
    )
  }
}

export default Tracks

```

```
import React from 'react'
import { Link } from 'react-router-dom'

const Track = ({ track }) => {
  return (
    <div className="col-md-6">
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5>{track.artist_name}</h5>
          <p className="card-text">
            <strong>
              <i className="fas fa-play" /> Track
            </strong>
            : {track.track_name}
            <br />
            <strong>
              <i className="fas fa-compact-disc" /> Album
            </strong>
            : {track.album_name}
          </p>
          <Link
            to={`lyrics/track/${track.track_id}`}
            className="btn btn-dark btn-block"
          >
            <i className="fas fa-chevron-right" /> View Lyrics
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Track

```

**Please note:** For button, use `{ Link }` from 'react-router-dom', instead of using a normal button. By doing this you don't need to write a click event handler for the button!

### 10. Create a new route for displaying lyrics

```
  <Switch>
    <Route exact path="/" component={Layout} />
    <Route exact path="/lyrics/track/:id" component={Lyrics} />
  </Switch>
```

and retrieve this id param from Lyrics component

```
 componentDidMount = async () => {
    const {
      match: {
        params: { id }
      }
    } = this.props
  }
```

and render

```
  render() {
    const { lyrics, track } = this.state
    if (
      !lyrics ||
      !track ||
      Object.keys(lyrics).length === 0 ||
      Object.keys(track).length === 0
    ) {
      return <Spinner />
    } else {
      return (
        <React.Fragment>
          <Link to="/" className="btn btn-dark btn-sm mb-4">
            Go Back
          </Link>
          <div className="card">
            <h5 className="card-header">
              {track.track_name} by{' '}
              <span className="text-secondary">{track.artist_name}</span>
            </h5>
            <div className="card-body">
              <p className="card-text">{lyrics.lyrics_body}</p>
            </div>
          </div>
          <ul className="list-group mt-3">
            <li className="list-group-item">
              <strong>Album ID</strong>: {track.album_id}
            </li>
            <li className="list-group-item">
              <strong>Song Genre</strong>:{' '}
              {track.primary_genres.music_genre_list &&
              track.primary_genres.music_genre_list.length > 0
                ? track.primary_genres.music_genre_list[0].music_genre
                    .music_genre_name
                : 'N/A'}
            </li>
            <li className="list-group-item">
              <strong>Explicit Words</strong>:{' '}
              {track.explicit === 0 ? 'No' : 'Yes'}
            </li>
            <li className="list-group-item">
              <strong>Release Date</strong>:{' '}
              <Moment format="DD-MM-YYYY">{track.updated_time}</Moment>
            </li>
          </ul>
        </React.Fragment>
      )
    }
  }
```

**Please note:** the correct way to check if a object is empty is do `Object.keys(lyrics).length === 0`, `lyrics === {}` won't work because object is reference type
Also for displaying date, we use `moment` and `react-moment`

### 11. Search component

```
export default class Search extends Component {
  state = {
    keyword: ''
  }

  onChangeHandler = event => {
    const { name, value } = event.target
    this.setState(prevState => {
      return { ...prevState, [name]: value }
    })
  }

  findTrack = async event => {
    event.preventDefault()
    const { keyword } = this.state

    try {
      const response = await axios.get(
        `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.search?q_track=${keyword}&page_size=10&page=1&s_track_rating=desc&apikey=${
          process.env.REACT_APP_MM_KEY
        }`
      )
      // now we receive the new list of track_list, we need to update the track_list in the context Provider
      const {
        data: {
          message: {
            body: { track_list }
          }
        }
      } = response
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <Consumer>
        {value => {
          const { keyword } = this.state
          return (
            <div className="card card-body mb-4 p-4">
              <h1 className="display-4 text-center">
                <i className="fas fa-music" /> Search for a song:
              </h1>
              <p className="lead text-center">Get the lyrics for any song</p>
              <form onSubmit={this.findTrack}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter song title..."
                    name="keyword"
                    value={keyword}
                    onChange={this.onChangeHandler}
                  />
                </div>
                <button
                  className="btn btn-primary btn-lg btn-block mb-5"
                  type="submit"
                >
                  Search Track Lyrics
                </button>
              </form>
            </div>
          )
        }}
      </Consumer>
    )
  }
```

Now if you search anything, you will get the new track_list, but the million dollar question is, **how do we update the old track_list from context provider with this new track_list??**

### 12. First we need to create a dispatch function in context provider, so this function can be passed along to all components, for dispatching an action to the context provider
```
 // this method will be passed to all components for dispatching actions
 dispatch: action => this.setState(prevState => reducer(prevState, action))
```

### 13. Also we need a reducer function, for updating the state of the Provider class
```
// very similar with normal Redux reducers
const reducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH_RESULT':
      return { ...state, ...action.payload }
    default:
      return state
  }
}
```

### 14. Then we can start using the function in Search component
```
render() {
    return (
      <Consumer>
        {value => {
          const { dispatch } = value
          const { keyword } = this.state
          return (
            <div className="card card-body mb-4 p-4">
              <h1 className="display-4 text-center">
                <i className="fas fa-music" /> Search for a song:
              </h1>
              <p className="lead text-center">Get the lyrics for any song</p>
              <form onSubmit={this.findTrack.bind(this, dispatch)}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter song title..."
                    name="keyword"
                    value={keyword}
                    onChange={this.onChangeHandler}
                  />
                </div>
                <button
                  className="btn btn-primary btn-lg btn-block mb-5"
                  type="submit"
                >
                  Search Track Lyrics
                </button>
              </form>
            </div>
          )
        }}
      </Consumer>
    )
  }
```

**Please note:** if we need to pass the dispatch function to the findTrack function, we have to use <form onSubmit={this.findTrack.bind(this, dispatch)}> syntax, otherwise it won't work

```
findTrack = async (dispatch, event) => {
    event.preventDefault()
    const { keyword } = this.state

    try {
      const response = await axios.get(
        `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.search?q_track=${keyword}&page_size=10&page=1&s_track_rating=desc&apikey=${
          process.env.REACT_APP_MM_KEY
        }`
      )
      // now we receive the new list of track_list, we need to update the track_list in the context Provider
      const {
        data: {
          message: {
            body: { track_list }
          }
        }
      } = response

      const action = {
        type: 'SEARCH_RESULT',
        payload: {
          track_list,
          heading: 'Search Result'
        }
      }
      // dispatch action to context 
      dispatch(action)
      // to clear the search input box
      this.setState(prevState => {
        return { ...prevState, keyword: '' }
      })
    } catch (error) {
      console.log(error)
    }
  }
```

All done!!