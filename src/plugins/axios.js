import axios from 'axios'

export default {
  install: (app) => {
    const axiosInstance = axios.create({
      baseURL: 'http://65.109.140.121:8000',
      timeout: 10000
    })

    app.config.globalProperties.$axios = axiosInstance
    app.provide('axios', axiosInstance)
  }
}