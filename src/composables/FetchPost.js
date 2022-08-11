import { useUsersStore } from '@/stores/storeUser'
import { ref, reactive } from 'vue'

export function fetchPost(url, payload, headers) {
  // Notes:
  // url = string
  // payload = string
  // headers = object

  //   example:
  //   const url = 'https://bauverein.nviiserver.de/api/login'

  //   let payload = `{
  //   "username": "${username.value}",
  //   "password": "${pw.value}"
  // } `

  //   const headers = {
  //     'Content-type': 'application/json; charset=UTF-8',
  //     Accept: '*/*',
  //   }
  // End Notes

  console.log(
    'FetchPost - url: ',
    url,
    'payload: ',
    payload,
    'headers: ',
    headers
  )

  let responseData = ref(null)
  let responseRaw = ref(null)
  let error = reactive({ message: '', code: '', object: '' })

  let data = {}

  if (headers === undefined) {
    data = {
      method: 'POST',
      body: payload,
    }
  } else {
    data = {
      method: 'POST',
      body: payload,
      headers: headers,
    }
  }

  fetch(url, data)
    .then(function (response) {
      console.log('FetchPost - response  : ', response)
      if (response.ok === false) {
        // error
        error.message = response.statusText
        error.code = response.status
        error.object = response
      }

      responseRaw.value = response

      if (response.ok === true) {
        // Response Ok, handing data to .then json
        console.log('FetchPost - response.ok ')
        return response.json()
      }
    })
    .then(function (json) {
      console.log('FetchPost - json : ', json)
      if (json != undefined) {
        responseData.value = json
      }
    })
    .catch(function (err) {
      // Only for connection errors and similar
      console.log('FetchPost - catch - error : ', err)
      console.log(err)
      error.object = err
    })

  return { responseRaw, responseData, error }
}
