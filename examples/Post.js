/**
 * Post.js
 *
 * @description :: Example of a blog post model file.
 */

export default class {
  constructor(loader) {
    let type = loader.thinky.type;

    this.tableName = 'Post';
    this.schema = {
      id: type.string(),
      title: type.string(),
      content: type.string(),
      authorId: type.string()
    };

    this.options = {};
  }

  initialize(loader, model) {
    let models = loader.models;

    model.belongsTo(models.Author, 'author', 'authorId', 'id');
  }
}
