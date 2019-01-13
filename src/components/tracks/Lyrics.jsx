import React, { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Moment from 'react-moment'
import Spinner from '../layout/Spinner'

export default class Lyrics extends Component {
  state = {
    track: {},
    lyrics: {}
  }

  componentDidMount = async () => {
    const {
      match: {
        params: { id }
      }
    } = this.props
    try {
      // retrieve lyrics information
      const lyrics_response = await axios.get(
        `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${id}&apikey=${
          process.env.REACT_APP_MM_KEY
        }`
      )
      const {
        data: {
          message: {
            body: { lyrics }
          }
        }
      } = lyrics_response
      // retrieve track information
      const track_response = await axios.get(
        `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.get?track_id=${id}&apikey=${
          process.env.REACT_APP_MM_KEY
        }`
      )
      const {
        data: {
          message: {
            body: { track }
          }
        }
      } = track_response
      this.setState(prevState => {
        return { ...prevState, lyrics, track }
      })
    } catch (error) {
      console.log(error)
    }
  }

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
}
