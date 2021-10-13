import axios from 'axios'
import { Manager } from '@twilio/flex-ui'

const instance = axios.create({
  timeout: 10000,
  baseURL: `${process.env.REACT_APP_SERVICE_BASE_URL}`,
})

instance.defaults.headers.post['Content-Type'] = 'application/json'
instance.defaults.headers.post['Accept'] = '*'

instance.interceptors.request.use(config => {
  return config
}, error => {
  return Promise.reject(error)
})

instance.interceptors.response.use(response => {
  return Promise.resolve(response.data)
}, error => {
  if (error.response) {
    return Promise.reject(error)
  } else {
    return Promise.reject('Request Timeout, Please try again')
  }
})

export const get = (url, params, config = {}) => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'get',
      url,
      params,
      ...config,
    }).then(response => {
      resolve(response)
    }).catch(error => {
      reject(error)
    })
  })
}

export const post = (url, data, config = {}) => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'post',
      url,
      data: {
        ...data,
        Token: Manager.getInstance().user.token,
      },
      ...config,
    }).then(response => {
      resolve(response)
    }).catch(error => {
      reject(error)
    })
  })
}
