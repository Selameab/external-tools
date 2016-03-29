angular.module('glimpse')
    .factory('AtomsFactory', function ($resource) {

        var atomsFactory = {};

        atomsFactory.atoms = [];
        atomsFactory.pullAtoms = function (callback) {
            $resource("http://localhost:5000/api/v1.1/atoms").get(function (data) {
                atomsFactory.atoms = data.result.atoms;
                if (typeof callback === "function") callback();
            });
        };
        return atomsFactory;
    })

    .factory('SettingsFactory', function ($resource) {

        var settingsFactory = {};

        settingsFactory.display.planarView = {
            gravity: 0.2,
            charge: -300,
            linkDistance: 20
        };
        return settingsFactory;
    })
;