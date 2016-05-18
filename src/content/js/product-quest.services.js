!(function ()
{
    'use strict';

    angular
        .module('productQuest')

        .provider('productHunterApi', function ()
        {
            var $config = {
                'apiUrl': null,
                'apiRedirect': null,
                'apiKey': null,
                'apiSecret': null,
                'apiFeedUrl': null,
                'apiUserUrl': null,
                'apiPostDetailsUrl': null,
            };

            return {

                initializeApi: function (apiUrl, apiRedirect, apiKey, apiSecret, apiFeedUrl, apiUserUrl, apiPostDetailsUrl)
                {
                    $config.apiUrl = apiUrl;
                    $config.apiRedirect = apiRedirect;
                    $config.apiKey = apiKey;
                    $config.apiSecret = apiSecret;
                    $config.apiFeedUrl = apiFeedUrl;
                    $config.apiUserUrl = apiUserUrl;
                    $config.apiPostDetailsUrl = apiPostDetailsUrl;
                },

                $get: ['$rootScope', '$window', '$location', '$http', function ($rootScope, $window, $location, $http)
                {
                    function getResponse(response, callback)
                    {
                        if (callback && typeof (callback) === 'function')
                        {
                            callback({ success: (response && response.status === 200), data: response.data });
                        }
                    }

                    function configSimpleRequest(method, url, postData)
                    {
                        return {
                            method: method,
                            url: url,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                            },
                            data: (postData) ? angular.element.param(postData) : null
                        };
                    }

                    function handleIssuing(event, state)
                    {
                        if (event && event.target)
                        {
                            angular.element(event.target).button(state);
                        }
                    }

                    function submit(method, endpoint, data, callback, event, urlInsteadEndpoint)
                    {
                        endpoint = (urlInsteadEndpoint) ? endpoint : $config.apiUrl + endpoint;

                        var request = configSimpleRequest(method, endpoint, data);

                        handleIssuing(event, 'loading');

                        $http(request)

                            .then(
                                // success callback

                                function (response)
                                {
                                    handleIssuing(event, 'reset');

                                    getResponse(response, callback);
                                },

                                // error callback

                                function (response)
                                {
                                    handleIssuing(event, 'reset');

                                    getResponse(response, callback);
                                }
                            );
                    }

                    function post(endpoint, data, callback, event, urlInsteadEndpoint)
                    {
                        console.log('POST', endpoint, data);

                        submit('POST', endpoint, data, callback, event, urlInsteadEndpoint);
                    }

                    function get(endpoint, data, callback, event, urlInsteadEndpoint)
                    {
                        if (data)
                        {
                            endpoint = endpoint + '?' + angular.element.param(data);
                        }

                        console.log('GET', endpoint);

                        submit('GET', endpoint, null, callback, event, urlInsteadEndpoint);
                    }

                    function redirect(endpoint, data)
                    {
                        endpoint = endpoint + '?' + angular.element.param(data);

                        console.log('GET', endpoint);

                        window.location.href = $config.apiUrl + endpoint.replace('%2B', '+');
                    }

                    function getLink(endpoint, data)
                    {
                        endpoint = endpoint + '?' + angular.element.param(data);

                        return $config.apiUrl + endpoint.replace('%2B', '+');
                    }

                    return {

                        checkForUserCode: function ()
                        {
                            var qs = $location.search();

                            if (qs && qs.code)
                            {
                                $rootScope.$broadcast('user-code-found', qs.code);
                            }
                        },

                        oauthAuthorize: function ()
                        {
                            var data = {
                                'client_id': $config.apiKey,
                                'redirect_uri': $config.apiRedirect,
                                'response_type': 'code',
                                'scope': 'public+private'
                            }

                            return redirect('oauth/authorize', data);
                        },

                        oauthAuthenticate: function (code, callback)
                        {
                            var data = {
                                'client_id': $config.apiKey,
                                'client_secret': $config.apiSecret,
                                'redirect_uri': $config.apiRedirect,
                                'code': code,
                                'grant_type': 'authorization_code'
                            }

                            return post('oauth/token', data, callback, null, false);
                        },

                        logOut: function ()
                        {
                            console.log('ok');

                            if ($window.localStorage)
                            {
                                $window.localStorage.clear();

                                $rootScope.$broadcast('user-logged-out');
                            }
                        },

                        getFeedContent: function (filter, callback, event)
                        {
                            var data = {
                                'categoryId': 1,
                                'filter': filter
                            }

                            get($config.apiFeedUrl, data, callback, event, true);
                        },

                        getLoggedUserDetails: function (token, callback)
                        {
                            var data = {
                                'token': token
                            }

                            get($config.apiUserUrl, data, callback, null, true);
                        },

                        getPostDetails: function (id, callback)
                        {
                            if ($window.localStorage)
                            {
                                var data = {
                                    'token': $window.localStorage.getItem('access_token'),
                                    'id': id
                                }

                                get($config.apiPostDetailsUrl, data, callback, null, true);
                            }
                        }

                    };
                }]

            };
        })

        .provider('userMenu', [function ()
        {
            return {

                $get: ['$rootScope', '$window', function ($rootScope, $window)
                {
                    return {

                        getUserIfLoggedIn: function ()
                        {
                            // todo: fazer o bloco abaixo de uma forma mais elegante
                            if ($window.localStorage)
                            {
                                return {
                                    'id': $window.localStorage.getItem('user_id'),
                                    'username': $window.localStorage.getItem('user_username'),
                                    'name': $window.localStorage.getItem('user_name'),
                                    'imgSm': $window.localStorage.getItem('user_img_sm'),
                                    'imgMd': $window.localStorage.getItem('user_img_md'),
                                    'imgBg': $window.localStorage.getItem('user_img_bg')
                                }
                            }

                            return null;
                        },

                        hasLoggedUser: function ()
                        {
                            var user = this.getUserIfLoggedIn();

                            return (user.id != null);
                        }

                    };

                }]

            };

        }]);
})();