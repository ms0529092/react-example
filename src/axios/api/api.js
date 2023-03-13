import Axios from "../mainAction";

// export const callBannerRequest = (postData, req) => Axios('post', `web/carousel_picture`, postData, req)

// export const callGetUserList = (postData) => Axios('post', `users`, postData, {})

const ApiList = {
    callTestData:() => Axios('get', 'https://tinyurl.com/j9t6jxds')
}

export default ApiList ;