'use strict';

var AllDependencies = require('../../lib/all-dependencies');
var expect = require('chai').expect;
var fs = require('fs-extra');
var mori = require('mori');
var depGraph = mori.toClj(fs.readJSONSync('./tests/fixtures/example-app/dep-graph.json'));

describe('all dependencies unit', function() {

  beforeEach(function () {
    AllDependencies._graph = {};
  });

  describe('update', function () {
    it('should place a package into dep-graph keyed off of the package name', function() {
      AllDependencies.update('example-app', depGraph);
      expect(mori.get(AllDependencies._graph, 'example-app')).to.deep.equal(depGraph);
    });

    it('should throw if no package is given', function() {
      var willThrow = function() {
        AllDependencies.update(depGraph);
      };

      expect(willThrow).to.throw(/You must pass an entry and a dependency graph./);
    });
  });

  describe('for', function() {
    it('should return a graph for a package', function() {
      AllDependencies.update('example-app', depGraph);
      expect(AllDependencies.for('example-app')).to.deep.equal(mori.toClj(depGraph));
    });

    it('should return the imports for a specific file', function() {
      AllDependencies.update('example-app', depGraph);
      var imports = AllDependencies.for('example-app/initializers/ember-moment.js');
      expect(mori.toJs(imports)).to.deep.equal([
        'ember-moment/helpers/moment',
        'ember-moment/helpers/ago',
        'ember-moment/helpers/duration',
        'ember'
      ]);
    });

    it('should return an empty Map if the package graph is not found', function() {
      expect(AllDependencies.for('example-moment')).to.deep.equal(mori.hashMap());
    });

    it('should return an empty List if the file imports are not found', function() {
      expect(AllDependencies.for('example-moment/ago.js')).to.deep.equal(mori.list());
    });
  });
});