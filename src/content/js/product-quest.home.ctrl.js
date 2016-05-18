!(function ()
{
    'use strict';

    angular
        .module('productQuest')

        .controller('homeCtrl', ['$rootScope', '$location', 'productHunterApi', 'userMenu', function ($rootScope, $location, productHunterApi, userMenu)
        {
            var vm = this;

            vm.posts = [];

            vm.filter = 'popular'

            vm.setActiveClass = setActiveClass;

            vm.loadFeed = loadFeed;

            vm.showPostDetails = showPostDetails;

            vm.hasLoggedUser = hasLoggedUser;

            vm.activePost = null;

            loadFeed();

            checkForUserCode();


            function hasLoggedUser()
            {
                return userMenu.hasLoggedUser();
            }

            function checkForUserCode()
            {
                productHunterApi.checkForUserCode();
            }

            function loadFeed(filter)
            {
                vm.filter = filter || vm.filter;

                vm.posts = [];

                productHunterApi.getFeedContent(vm.filter, function (response)
                {
                    vm.posts = (response.success) ? response.data.posts : [];
                });
            }

            function setActiveClass(name)
            {
                return (name === vm.filter) ? 'active' : '';
            }

            function showPostDetails(id)
            {
                if (hasLoggedUser())
                {
                    vm.activePost = null;

                    productHunterApi.getPostDetails(id, function (response)
                    {
                        if (response.success)
                        {
                            vm.activePost = response.data.post;
                        }
                    });
                }
                else
                {
                    alert('You must be logged to see this information');
                }
            }
        }]);

})();