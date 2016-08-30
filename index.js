"use strict";

const _ = require('lodash');
const Thinky = require('thinky');
const requireAll = require('require-all');

let loader = {
  thinky: null,
  models: {}
};

loader.initialize = (config, thinky) => {
  loader.thinky = thinky || new Thinky(config.thinky.rethinkdb);

  // This will return a promise
  return loader.thinky.dbReady().then(() => {
    if (config.debug) {
      console.dir("DB Ready");
    }

    if (config.debug) {
      console.dir("Loading models from path: " + config.modelsPath);
    }

    // Loads all modules from the models directory specified when the loader
    // is initialized
    let definitions = requireAll({
      dirname: config.modelsPath,
      filter: /(.+)\.(js)$/,
      depth: 1,
      caseSensitive: true
    });

    // Delete ignored models from the object store
    let ignoreModels = config.ignoreModels;

    if (ignoreModels && ignoreModels.length) {
      ignoreModels.map(m => delete definitions[m]);
    }

    // Maps all classes loaded into an object
    definitions = _.mapValues(definitions, (d) => {

      let DefinitionModel = d.default;
      return new DefinitionModel(loader);
    });

    // Loop over each class and create the corresponding model
    _.each(definitions, (definition) => {
      let modelId = definition.tableName || definition.globalId;

      if (config.debug) {
        console.dir("Creating model id: " + modelId);
      }

      let model = loader.thinky.createModel(modelId, definition.schema, definition.options);
      loader.models[modelId] = model;
    });

    // Loop over each class and run the initialize method, usually to set up
    // relationships or hooks
    _.each(definitions, (definition) => {
      let modelId = definition.tableName || definition.globalId;

      if (config.debug) {
        console.dir("Initializing model id: " + modelId);
      }

      let model = loader.models[modelId];
      definition.initialize(loader, model);
    });

    return loader;
  });

};

module.exports = loader;
