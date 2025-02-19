const BASE_URL = 'http://localhost:8000'


export default {
  getItem: async function (resource, id) {
    this.loading = true
    this.error = null
    try {
      const response = await fetch(`${BASE_URL}/${resource}/${id}`)
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
      const response = await fetch(`${BASE_URL}/${resourcePlural}/`)
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  createItem: async function (resourcePlural, data) {
    try {
      const response = await fetch(
        `${BASE_URL}/${resourcePlural}/`, {
          method: 'POST',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify(data)
        }
      )
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  uploadImage: async function (formData) {
    try {
      const response = await fetch(
        `${BASE_URL}/uploadImage`, {
          method: 'POST',
          body: formData
        }
      )
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  },

  deleteItem: async function (resource, id) {
    try {
      const response = await fetch(
        `${BASE_URL}/${resource}/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
        }
      )
      const resp = await response.json()
      return resp.id
    } catch (error) {
      this.error = error.message
    }
  },

  updateItem: async function (resource, data) {
    try {
      const response = await fetch(
        `${BASE_URL}/${resource}/${data.id}`, {
          method: 'PUT',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify(data)
        }
      )
      const resp = await response.json()
      return resp
    } catch (error) {
      this.error = error.message
    }
  }

}