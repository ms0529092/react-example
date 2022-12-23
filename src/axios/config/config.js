import { createBrowserHistory, createHashHistory } from 'history';

const url = `${location.protocol}//${window.location.host}`;
const apiPrefixPath = 'api';

window.apiPrefixPath = apiPrefixPath

const config = {
    env:apiPrefixPath,
    apiPrefixPath:`/${apiPrefixPath}`,
    url:()=> url + config.apiPrefixPath,
    hash:true,
    history:()=> (config.hash ? createHashHistory : createBrowserHistory )
}

export { config };