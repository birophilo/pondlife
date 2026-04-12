import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const accessTokenName = 'PondlifeAccessToken'
const refreshTokenName = 'PondlifeRefreshToken'

/** Single in-flight refresh so parallel 401s share one /refresh call. */
let refreshPromise = null

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

function setTokens (accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(accessTokenName, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(refreshTokenName, refreshToken)
  }
}

export default {

  async login (credentials) {
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
        setTokens(response.data.accessToken, response.data.refreshToken)
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

  /**
   * Uses a separate axios call (no API interceptors) to avoid refresh loops.
   * @returns {Promise<boolean>}
   */
  async refreshTokenIfNeeded () {
    if (refreshPromise) {
      return refreshPromise
    }
    const rt = localStorage.getItem(refreshTokenName)
    if (!rt) {
      return false
    }
    refreshPromise = (async () => {
      try {
        const { data } = await axios.post(`${BASE_URL}/refresh`, {
          refreshToken: rt
        })
        setTokens(data.accessToken, data.refreshToken)
        return true
      } catch {
        localStorage.removeItem(accessTokenName)
        localStorage.removeItem(refreshTokenName)
        return false
      } finally {
        refreshPromise = null
      }
    })()
    return refreshPromise
  },

  getToken () {
    return localStorage.getItem(accessTokenName)
  },

  async logout () {
    const rt = localStorage.getItem(refreshTokenName)
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        rt ? { refreshToken: rt } : {}
      )
    } catch {
      // Still clear local session
    }
    localStorage.removeItem(accessTokenName)
    localStorage.removeItem(refreshTokenName)
  },

  isAuthenticated () {
    return !!this.getToken()
  }

}
