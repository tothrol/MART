import { useUsersStore } from '@/stores/userStore';
import { ref, reactive } from 'vue';

export function fetchGet(url, headers) {
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
    'FetchGet - url: ',
    url,

    'headers: ',
    headers
  );

  let responseData = ref(null);
  let responseRaw = ref(null);
  let error = reactive({ message: '', code: '', object: '' });

  let data = {};

  if (headers === undefined) {
    data = {
      method: 'GET',
    };
  } else {
    data = {
      method: 'GET',
      headers: headers,
    };
  }

  console.log('FetchGET - data  : ', data);

  fetch(url, data)
    .then(function (response) {
      console.log('FetchGET - response  : ', response);
      if (response.ok === false) {
        // error
        error.message = response.statusText;
        error.code = response.status;
        error.object = response;
      }

      responseRaw.value = response;

      if (response.ok === true) {
        // Response Ok, handing data to .then json
        console.log('FetchGET - response.ok ');
        return response.json();
      }
    })
    .then(function (json) {
      console.log('FetchGET - json : ', json);
      if (json != undefined) {
        responseData.value = json;
      }
    })
    .catch(function (err) {
      // Only for connection errors and similar
      console.log('FetchGET - catch - error : ', err);
      error.object = err;
    });

  return { responseRaw, responseData, error };
}
