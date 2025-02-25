import axios from 'axios'


const BASE_URL = 'http://localhost:8000'


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})


export default {
  getItem: async function (resource, id) {
    this.loading = true
    this.error = null
    try {
      const response = await apiClient.get(`${BASE_URL}/${resource}/${id}`)
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  listItems: async function (resourcePlural) {
    this.loading = true
    this.error = null
    try {
      const response = await apiClient.get(`${BASE_URL}/${resourcePlural}/`)
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  createItem: async function (resourcePlural, data) {
    try {
      const response = await apiClient.post(
        `${BASE_URL}/${resourcePlural}/`,
        JSON.stringify(data)
      )
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  uploadImage: async function (formData) {
    try {
      const response = await apiClient.post(
        `${BASE_URL}/uploadImage`,
        formData
      )
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  deleteItem: async function (resource, id) {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${resource}/${id}`)
      const resp = await response.json()
      return resp.id
    } catch (error) {
      this.error = error.message
    }
  },

  updateItem: async function (resource, data) {
    try {
      const response = await apiClient.put(
        `${BASE_URL}/${resource}/${data.id}`,
        JSON.stringify(data)
      )
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  }

}