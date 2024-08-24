import { boot } from "quasar/wrappers";
import { LocalStorage } from "quasar"; // make sure you edit quasar.conf.js
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

//live
// const api = axios.create({
//   baseURL: "https://sms.nehemiahsolutions.com/v1",
// });

// local
const api = axios.create({
  baseURL: "http://127.0.0.1:3001",
});

// Local
// const appUrl = "http://localhost:9002";

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  const Newtoken = LocalStorage.getItem("jwt");
  api.defaults.headers.common["Authorization"] = "Bearer " + Newtoken;
  api.defaults.headers.common["Accept"] = "application/vnd.api+json";
  api.defaults.headers.common["Content-Type"] = "application/vnd.api+json";
  api.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
  api.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
  api.defaults.headers.withCredentials = true;

  let token = document.head.querySelector('meta[name="csrf-token"]');

  if (token) {
    api.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
  } else {
    // console.error(
    //   "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
    // );
  }
});

export { api };
