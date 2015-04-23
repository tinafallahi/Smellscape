module.exports = function(bookshelf) {

  var User = bookshelf.Model.extend({
    tableName: 'users'
  });

  var Smell = bookshelf.Model.extend({
    tableName: 'smells'
  });

  var Comment = bookshelf.Model.extend({
    tableName: 'comments'
  });

  var Point = bookshelf.Model.extend({
    tableName: 'points'
  });

  var Settings = bookshelf.Model.extend({
    tableName: 'settings'
  });

  var Started = bookshelf.Model.extend({
    tableName: 'started'
  });

  var Walk = bookshelf.Model.extend({
    tableName: 'walks'
  });

  return {
    User: User,
    Smell: Smell,
    Comment: Comment,
    Point: Point,
    Settings: Settings,
    Started: Started,
    Walk: Walk
  }
}