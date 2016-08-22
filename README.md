# thinky-loader-es6
An ES6-compatible model loader for Thinky ORM for RethinkDB.

## Why

This is a refactor of `thinky-loader` to support defining Thinky models as ES6 classes.

From `thinky-loader`'s README:

Rethinkdb is awesome and Thinky is a great ORM for it. But loading multiple model definition files and making them available in a large distributed Node.js applicaiton could be better. 

## Installation

`npm install thinky-loader-es6`

or add to `package.json`

*Also make sure to include `thinky` in your package.json as the loader does not make any assumptions as to the version of thinky you're using.

## Usage

`thinky-loader` configures the thinky orm and initializes the model files in the specified directory. Once initialized any controllers or services in your app can simply `require('thinky-loader')` to access instantiated thinky and model instances. It's basically just a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern) for thinky.

_In a controller, for example:_
```javascript
let orm = require('thinky-loader-es6');

// Post has been loaded and can be referenced at orm.models
orm.models.Post.getJoin().then(function(posts) {
     console.log(posts);
 });

// Customer has been loaded and can be referenced at orm.models
// The instance of thinky is available at orm.thinky
orm.models.Customer.orderBy({
    index: orm.thinky.r.desc("createdAt")
}).run().then(function(customers) {
     console.log(customers);
});
                  
```

## Configuration

It is recommended that you carve out a directory for your thinky model definitions, for example `data-models/thinky` and keep each model in a separate file. The loader will look in the specified directory and load each model definition.

_In a bootstapping or initialization file (could be your `app.js`!):_
```javascript
let orm = require('thinky-loader');

let ormConfig = {
                debug     : false, 
                modelsPath: 'data-models/thinky',
                thinky    : {
                        rethinkdb: {
                                host        : 'db-0',
                                port        : 28015,
                                authKey     : "",
                                db          : "master",
                                timeoutError: 5000,
                                buffer      : 5,
                                max         : 1000,
                                timeoutGb   : 60 * 60 * 1000
                        }
                }
        };

// returns a promise when configured
orm.initialize(ormConfig) // you can also optionally pass an instance of thinky: [orm.initialize(ormConfig, thinky)] for additional configuration.
.then(() => console.log('Ready!'))
.catch(() => console.log('Darn!'));
```



## Model file configuration
Create a file for each thinky model with the contents below. The model definition should be similar to the schema definition format you would normally use in thinky.

```javascript
export default class {
  constructor(loader) {
    let type = loader.thinky.type;

    this.tableName = "Car";
    this.schema = {
      id: type.string(),
      type: type.string(),
      year: type.number(),
      ownerId: type.string()
    };

    this.options = {
      enforce_extra: "none"
    }
  }

  initialize(loader, model) {
    let models = loader.models;

    model.belongsTo(models.Person, 'owner', 'ownerId', 'id');
    model.ensureIndex('type');

    model.define('isDomestic', function() {
      return this.type === 'Ford' || this.type === 'GM';
    });
  }
}
```
*Also see `examples` directory for sample model files.
