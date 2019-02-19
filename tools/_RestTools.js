/**
 * 让fetch也可以timeout
 *  timeout不是请求连接超时的含义，它表示请求的response时间，包括请求的连接、服务器处理及服务器响应回来的时间
 * fetch的timeout即使超时发生了，本次请求也不会被abort丢弃掉，它在后台仍然会发送到服务器端，只是本次请求的响应内容被丢弃而已
 * @param {Promise} fetch_promise    fetch请求返回的Promise
 * @param {number} [timeout=10000]   单位：毫秒，这里设置默认超时时间为10秒
 * @return 返回Promise
 */
function timeout_fetch(fetch_promise, timeout = 30000) {
	let timeout_fn = null;

	//这是一个可以被reject的promise
	let timeout_promise = new Promise(function(resolve, reject) {
		timeout_fn = function() {
			reject('timeout promise');
		};
	});

	//这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
	let abortable_promise = Promise.race([ fetch_promise, timeout_promise ]);

	setTimeout(function() {
		timeout_fn();
	}, timeout);

	return abortable_promise;
}

let common_url = 'https://cnodejs.org/api/v1'; //服务器地址
let token = '';
/**
* @param {string} url 接口地址
* @param {string} method 请求方法：GET、POST，只能大写
* @param {JSON} [params=''] body的请求参数，默认为空
* @return 返回Promise
*/
function fetchRequest(url, method, params = '') {
	let header = {
		'Content-Type': 'application/json;charset=UTF-8',
		accesstoken: token //用户登陆后返回的token，某些涉及用户数据的接口需要在header中加上token
	};
	// console.log('request url:', url, params); //打印请求参数
	if (params == '') {
		//如果网络请求中带有参数
		return new Promise(function(resolve, reject) {
			timeout_fetch(
				fetch(common_url + url, {
					method: method,
					headers: header
				})
			)
				.then((response) => response.json())
				.then((responseData) => {
					//console.log('res:',url,responseData);  //网络请求成功返回的数据
					resolve(responseData);
				})
				.catch((err) => {
					console.log('err:', url, err); //网络请求失败返回的数据
					reject(err);
				});
		});
	} else {
		//如果网络请求中没有参数
		return new Promise(function(resolve, reject) {
			if (method === 'GET') {
				let paramsArray = [];
				Object.keys(params).forEach((key) => paramsArray.push(key + '=' + encodeURIComponent(params[key])));
				if (url.search(/\?/) === -1) {
					url += '?' + paramsArray.join('&');
				} else {
					url += '&' + paramsArray.join('&');
                }
                timeout_fetch(
                    fetch(common_url + url, {
                        method: method,
                        headers: header,
                        //body: JSON.stringify(params) //body参数，通常需要转换成字符串后服务器才能解析
                    })
                ).then((response) => response.json())
                .then((responseData) => {
                    //console.log('res:',url, responseData);   //网络请求成功返回的数据
                    resolve(responseData);
                })
                .catch((err) => {
                    console.log('err:', url, err); //网络请求失败返回的数据
                    reject(err);
                });
			}else{
			timeout_fetch(
				fetch(common_url + url, {
					method: method,
					headers: header,
					body: JSON.stringify(params) //body参数，通常需要转换成字符串后服务器才能解析
				})
			).then((response) => response.json())
            .then((responseData) => {
                //console.log('res:',url, responseData);   //网络请求成功返回的数据
                resolve(responseData);
            })
            .catch((err) => {
                console.log('err:', url, err); //网络请求失败返回的数据
                reject(err);
            });
        }
		});
	}
}

export default {
	fetchRequest
};
