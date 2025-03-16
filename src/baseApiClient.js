import axios from 'axios'


const BASE_URL = 'http://localhost:8000'


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

const apiFormClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})


export default {
  getItem: async function (resource, id) {
    this.loading = true
    this.error = null
    try {
      const response = await apiClient.get(`${BASE_URL}/${resource}/${id}`)
      return response.data
    } catch (error) {
      return { error: error.message }
    }
  },

  listItems: async function (resourcePlural) {
    this.loading = true
    this.error = null
    try {
      const response = await apiClient.get(`${BASE_URL}/${resourcePlural}/`)
      return response.data
    } catch (error) {
      return { error: error.message }
    }
  },

  createItem: async function (resourcePlural, data) {
    try {
      const response = await apiClient.post(
        `${BASE_URL}/${resourcePlural}/`,
        JSON.stringify(data)
      )
      console.log("CREATED")
      console.log(response.data)
      return response.data
    } catch (error) {
      return { error: error.message }
    }
  },

  // note: formData client not default JSON header
  uploadImage: async function (formData) {
    try {
      const response = await apiFormClient.post(
        `${BASE_URL}/uploadImage`,
        formData
      )
      return response.data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteItem: async function (resource, id) {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${resource}/${id}`)
      return response.id
    } catch (error) {
      return { error: error.message }
    }
  },

  updateItem: async function (resource, data) {
    try {
      const response = await apiClient.put(
        `${BASE_URL}/${resource}/${data.id}`,
        JSON.stringify(data)
      )
      console.log("UPDATED")
      console.log(response.data)
      return response.data
    } catch (error) {
      return { error: error.message }
    }
  }

}