import axios from 'axios';

const axEmi = axios.create({
  baseURL: 'https://emi-backend-staging.emi-project.my.id',
});

axEmi.interceptors.request.use(
  async (configuration: any) => {
    configuration.headers['Content-Type'] = 'application/json';
    configuration.headers['Emi-Auth-Token'] = 'tWDLj6G62Z438PgE34rFO5W6eTvZ';
    return configuration;
  },
  (error: any) => {
    Promise.reject(error);
  },
);

export default axEmi;
