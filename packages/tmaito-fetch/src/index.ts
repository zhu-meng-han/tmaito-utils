import axios from 'axios';

const DEFAULT_OPTIONS = {
  BASE_URL: '/',
  TIMEOUT: 1 * 60 * 1000,
  CONTENT_TYPE: 'application/json; charset=UTF-8'
};

axios.defaults.baseURL = DEFAULT_OPTIONS.BASE_URL;
axios.defaults.timeout = DEFAULT_OPTIONS.TIMEOUT;
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = DEFAULT_OPTIONS.CONTENT_TYPE;

const fetch = (props: any) => {
  const config = {
    method: 'post',
    ...props
  };
  if (
    config.method.toLowerCase() === 'get' &&
    ((<any>window).ActiveXObject || 'ActiveXObject' in window)
  ) {
    config.params = {
      t: Date.now(),
      ...config.params
    };
  }
  const instance = axios.create();
  if (typeof props.requestInterceptor === 'function') {
    instance.interceptors.request.use(props.requestInterceptor, (error) => Promise.reject(error));
  }
  if (typeof props.responseInterceptor === 'function') {
    instance.interceptors.response.use(props.responseInterceptor, (error) => Promise.reject(error));
  }
  return instance
    .request(config)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(props.response ? response : response.data);
      }
      return Promise.reject({
        response
      });
    })
    .catch((e) => {
      const { response } = e;
      if (response) {
        const { origin = '', href = '' } = location || {};
        const {
          config: {
            url = ''
          }, status
        } = response;
        const reg = /(localhost)|(127\.0\.0\.1)|(0\.0\.0\.0)/;
        const isLocalEnv = reg.test(origin);
        if (!isLocalEnv && status === 401) {
          window.location.href = `${origin}/login?redirect=${encodeURIComponent(href)}`;
          return Promise.resolve();
        }
        return Promise.reject(`接口: ${url} 请求状态为: ${status}`);
      }
      Promise.reject(e);
    });
};

export {
  fetch
};
