'use strict';

var should = require('should');

var validation = require('../../lib/validationRules/permissionsNotRequired');


describe('Validation - Permissions property not required', function () {
    describe('permissionsNotRequired', function () {
        it('Should not error when a manifest does not contain permissions.', function (done) {

            var manifestWithoutPermissions = { manifest_version: 2, version: '1.0.0.0', name: 'Test', description: 'test manifest' };

            validation(manifestWithoutPermissions, function (err, warning) {
                should.not.exist(err);
                should.not.exist(warning);
                done();
            });
        });
    });
});