import React, { Component } from 'react'
import axios from 'axios'

const Context = React.createContext()

// very similar with normal Redux reducers
const reducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH_RESULT':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export class Provider extends Component {
  state = {
    track_list: [],
    heading: 'Top 10 Tracks',
    // this method will be passed to all components for dispatching actions
    dispatch: action => this.setState(prevState => reducer(prevState, action))
  }

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

  render() {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

export const Consumer = Context.Consumer
