!(function ()
{
    'use strict';

    angular
        .module('productQuest')

        .config(['$locationProvider', '$urlRouterProvider', '$stateProvider', 'productHunterApiProvider', function ($locationProvider, $urlRouterProvider, $stateProvider, productHunterApiProvider)
        {
            var lazyDeferred = {};

            $locationProvider.html5Mode(true);

            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('home',
                {
                    url: '/',
                    controller: 'homeCtrl',
                    controllerAs: 'ct',
                    templateProvider: function ()
                    {
                        return lazyDeferred.promise;
                    },
                    resolve: {
                        load: ['$ocLazyLoad', '$q', '$http', function ($ocLazyLoad, $q, $http)
                        {
                            lazyDeferred = $q.defer();

                            return $ocLazyLoad.load({
                                name: 'home',
                                files: ['/content/js/product-quest.home.ctrl.js']
                            }).then(function ()
                            {
                                $http.get('/view/home.html')
                                    .success(
                                        function (response)
                                        {
                                            return lazyDeferred.resolve(response);
                                        }
                                    )
                                    .error(
                                        function (response)
                                        {
                                            return lazyDeferred.resolve('<h1>what a goof! Bad server request... however subscribe to Markiplier channel at youtube!</h1>');
                                        }
                                    );
                            })
                        }]
                    }
                })

            productHunterApiProvider.initializeApi(
                'https://api.producthunt.com/v1/',
                'http://localhost:20909',
                '0785795bc55c288c07998a116a4fdcd4249066e685665401895e548bb60f97a0',
                'e8f51a2864062cb7c5cdb2469b3b32fae74fedd3a31f600584d0a8c57dd29ec3',

                // eu tive que encapsular as chamadas na api devido ao CORS, 
                // fiz isto depois de conversar com a Kate do Product Hunter.
                // o print da conversa está versionado no GIT.

                'http://bypass.azurewebsites.net/producthunter/feed.php',
                'http://bypass.azurewebsites.net/producthunter/user.php',
                'http://bypass.azurewebsites.net/producthunter/post.php'
            );

        }]);
})();