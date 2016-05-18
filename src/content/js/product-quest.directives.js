!(function ()
{
    'use strict';

    angular
        .module('productQuest')

        .directive('jarvis', ['$window', '$location', '$rootScope', 'productHunterApi', function ($window, $location, $rootScope, productHunterApi)
        {
            function linkDirective(scope, element, attr)
            {
                scope.$on('user-code-found', function (event, code)
                {
                    productHunterApi.oauthAuthenticate(code, function (response)
                    {
                        if (response.success)
                        {
                            // todo: fazer o bloco abaixo de uma forma mais elegante
                            if ($window.localStorage)
                            {
                                $window.localStorage.clear();

                                $window.localStorage.setItem('access_token', response.data.access_token);

                                $window.localStorage.setItem('expires_in', response.data.expires_in);

                                $window.localStorage.setItem('scope', response.data.scope);

                                $window.localStorage.setItem('token_type', response.data.token_type);

                                productHunterApi.getLoggedUserDetails(response.data.access_token, function (response)
                                {
                                    $window.localStorage.setItem('user_id', response.data.user.id);

                                    $window.localStorage.setItem('user_username', response.data.user.username);

                                    $window.localStorage.setItem('user_name', response.data.user.name);

                                    $window.localStorage.setItem('user_img_sm', response.data.user.image_url['30px']);

                                    $window.localStorage.setItem('user_img_md', response.data.user.image_url['96px']);

                                    $window.localStorage.setItem('user_img_bg', response.data.user.image_url['original']);

                                    $rootScope.$broadcast('user-logged-in');

                                    $location.url($location.path())
                                });
                            }
                        }
                    });
                });
            }

            return {

                restrict: 'E',

                scope: {},

                template: '<!-- Oh long johnson -->',

                link: linkDirective

            };
        }])

        .directive('userMenu', ['$compile', 'productHunterApi', 'userMenu', function ($compile, productHunterApi, userMenu)
        {
            function clear(element)
            {
                element.html('');
            }

            function getElementTemplate(user)
            {
                if (user == null || user.id == null)
                {
                    return '<ul class="nav navbar-nav navbar-right"><li><a href="javascript:void(0);" ng-click="userLogin()">LOGIN</a></li></ul>';
                }
                else
                {
                    return '<div id="navbar" class="navbar-collapse collapse">' +
                    '    <ul class="nav navbar-nav navbar-right">' +
                    '        <li class="dropdown">' +
                    '            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' +
                    '                <img src="' + user.imgSm + '" alt="" title="" class="img-circle img-profile" />' +
                    '                ' + user.name.toUpperCase() + ' <span class="caret"></span>' +
                    '            </a>' +
                    '            <ul class="dropdown-menu">' +
                    '                <!--<li><a href="#">Action</a></li>-->' +
                    '                <!--<li><a href="#">Another action</a></li>-->' +
                    '                <!--<li><a href="#">Something else here</a></li>-->' +
                    '                <!--<li role="separator" class="divider"></li>-->' +
                    '                <!--<li class="dropdown-header">Nav header</li>-->' +
                    '                <li><a href="javascript:void(0);" ng-click="userLogout()">LOGOUT</a></li>' +
                    '            </ul>' +
                    '        </li>' +
                    '    </ul>' +
                    '</div>'
                }
            }

            function registerEvents(scope, element)
            {
                scope.$on('user-logged-in', function (event)
                {
                    var user = userMenu.getUserIfLoggedIn();

                    var template = getElementTemplate(user);

                    bindElement(scope, element, template);
                });

                scope.$on('user-logged-out', function (event)
                {
                    var template = getElementTemplate(null);

                    bindElement(scope, element, template);
                });
            }

            function bindElement(scope, element, template)
            {
                clear(element);

                scope.userLogout = productHunterApi.logOut;

                scope.userLogin = productHunterApi.oauthAuthorize;

                var link = $compile(template);

                var content = link(scope);

                element.append(content);
            }

            function linkDirective(scope, element, attr)
            {
                var user = userMenu.getUserIfLoggedIn();

                var template = getElementTemplate(user);

                registerEvents(scope, element);

                bindElement(scope, element, template);
            }

            return {

                restrict: 'E',

                scope: {},

                link: linkDirective

            };
        }]);
})();