const { Quiz, Tag } = require('../models');

const quizzController = {

  quizzPage: async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await Quiz.findByPk(quizId,{
        include: [
          { association: 'author'},
          { association: 'questions', include: ['answers', 'level']},
          { association: 'tags'}
        ]
      });
      // Si l'utilisateur est connecté, il accède à la page de jeu
      if (req.session.user) {
        res.render('play_quiz', {quiz});
      } else {
        // Sinon, il est redirigé vers la page de quiz "statique"
        res.render('quiz', {quiz});
      }
    } catch (err) {
      console.trace(err);
      res.status(500).send(err);
    }
  },

  listByTag: async (req, res) => {
    // plutot que de faire une requete compliquée
    // on va passer par le tag, et laisser les relations de Sequelize faire le taf !
    try {
      const tagId = parseInt(req.params.id);
      const tag = await Tag.findByPk(tagId,{
        include: [{
          association: 'quizzes',
          include: ['author']
        }]
      });
      const quizzes = tag.quizzes;
      res.render('index', { quizzes });
    } catch (err) {
      console.trace(err);
      res.status(500).send(err);
    }
  }

};

module.exports = quizzController;