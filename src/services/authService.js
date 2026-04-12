import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const accessTokenName = 'PondlifeAccessToken'

function parseErrorMessage (error) {
  const detail = error.response?.data?.detail
  if (detail == null) {
    return error.message || 'Request failed'
  }
  if (typeof detail === 'string') {
    return detail
  }
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
  }
  return JSON.stringify(detail)
}

export default {

  async login (credentials) {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams()
    params.append('username', credentials.get('username'))
    params.append('password', credentials.get('password'))
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )
      if (response.data.accessToken) {
        localStorage.setItem(accessTokenName, response.data.accessToken)
      }
      return response.data
    } catch (error) {
      return { error: true, message: parseErrorMessage(error) }
    }
  },

  async signup ({ username, email, password }) {
    try {
      const response = await axios.post(`${BASE_URL}/signup`, {
        username,
        email,
        password
      })
      return response.data
    } catch (error) {
      return { error: true, message: parseErrorMessage(error) }
    }
  },

  getToken () {
    return localStorage.getItem(accessTokenName)
  },

  logout () {
    localStorage.removeItem(accessTokenName)
  },

  isAuthenticated () {
    return !!this.getToken()
  }

}
