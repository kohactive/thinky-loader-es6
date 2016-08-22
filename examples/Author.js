/**
 * Author.js
 *
 * @description :: Example of a blog post author model file.
 */

export default class {
  constructor(loader) {
    let type = loader.thinky.type;

    this.tableName = 'Author';
    this.schema = {
      id: type.string(),
      sold: type.number(),
      userId: type.string()
    };

    this.options = {};
  }

  initialize(loader, model) {
    let models = loader.models;

    model.hasMany(models.Post, 'posts', 'id', 'authorId');
  }
}
