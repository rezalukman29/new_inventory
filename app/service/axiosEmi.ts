import axios from 'axios';
import { localStorageService } from './localStorage';

const axEmi = axios.create({
  baseURL: 'http://45.77.245.18:8181',
});

axEmi.interceptors.request.use(
  async (configuration: any) => {
    const auth =  localStorageService.getAuth("auth");
    configuration.headers['Content-Type'] = 'application/json';
    configuration.headers['Emi-Auth-Token'] = 'tWDLj6G62Z438PgE34rFO5W6eTvZ';
    if (auth) {
      configuration.headers['User-Id'] = JSON.parse(auth).id;
      configuration.headers['Emi-Token'] = JSON.parse(auth).token;
    } else {
      configuration.headers['User-Id'] = 8;
    }
    return configuration;
  },
  (error: any) => {
    Promise.reject(error);
  },
);

export default axEmi;
