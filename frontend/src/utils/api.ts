import axios, { AxiosInstance } from 'axios'

const baseURL = 'http://127.0.0.1:8000'

const http: AxiosInstance = axios.create({
  baseURL,
})

http.defaults.headers.post['Content-Type'] = 'application/json'

export default http