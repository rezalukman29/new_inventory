import axios from 'axios';
import { localStorageService } from './localStorage';

const ax = axios.create({
  baseURL: 'http://66.42.48.163:8000',
});

ax.interceptors.request.use(
  async (configuration: any) => {
    const auth =  localStorageService.getAuth("auth");
    configuration.headers['Content-Type'] = 'application/json';
    if (auth) {
      configuration.headers['User-Id'] = JSON.parse(auth).id;
    } else {
      configuration.headers['User-Id'] = 8;
    }
    return configuration;
  },
  (error: any) => {
    Promise.reject(error);
  },
);

export default ax;
