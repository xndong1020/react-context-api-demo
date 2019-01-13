import React, { Component } from 'react'
import axios from 'axios'
import { Consumer } from '../../context'

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
}
