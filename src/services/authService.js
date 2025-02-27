import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

const accessTokenName = 'PondlifeAccessToken'


export default {

  async login(credentials) {
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        credentials
      )
      console.log(response.data)
      if (response.data.accessToken) {
        localStorage.setItem(accessTokenName)
        console.log('set token')
        console.log(response.data.accessToken)
      }
      return response.data
    } catch(error) {
      return { error: error }
    }
  },

  getToken() {
    return localStorage.getItem(accessTokenName)
  },

  logout() {
    localStorage.removeItem(accessTokenName)
  },

  isAuthenticated() {
    return !!this.getToken()
  }

}