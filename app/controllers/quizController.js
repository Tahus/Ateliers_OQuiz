const { Quiz, Tag } = require('../models');


// Page du jeu dynamique 
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
      //on checke ici si le user est connecté
      //on regarde le contenu de la propriété user en session :
      // - si elle est définie, le user est connecté -> rendu de la vue play_quiz
      //- si elle est undefined, le user n'est pas connecté -> rendu de la vue quiz
      //version longue
      /*
      if (req.session.user) {
        res.render('play_quiz', {quiz});
      } else {
        res.render('quiz', {quiz});
      }
      */
      //version courte
      res.render(req.session.user ? 'play_quiz' : 'quiz', { quiz });
    } catch (err) {
      console.trace(err);
      res.status(500).send(err);
    }
  },


  // Page de la liste des tags
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
    }},


    // Traitement des réponses de l'utilisateur (je vais pouvoir VALIDER la répondse aux questions, et voir mon score)
    quizzAnswer: async (req, res) => {
      const quizId = parseInt(req.params.id);
      // on resélectionne le quiz concerné en ajoutant la relation good_answer pour chaque question
      //Rappel : cette relation va inclure pour chaque question un object Answer contenant les infos de la bonne réponse
      const quiz = await Quiz.findByPk(quizId, {
        include: ['author', 'tags',
          { association: 'questions', include: ['good_answer', 'answers', 'level'] }
        ]
      });
      //Je vais stocker ici des informations sur chaque réponse de l'utilisateur afin de les passer à la vue
      const answers = [];
      //un compteur pour le nombre de points, chaque bonne réponse vaut 1
      let nbPoints = 0;
      //on boucle sur les questions du quiz et on compare
      for (const question of quiz.questions) {
        /*
        Rappel : req.body va être de la forme
          req.body.question_<id_question>: <id_reponse_user_string>
          req.body.question_1: '25',
          req.body.question_32: '12',
          req.body.question_45: '63',
          ...
        */
        //Je détermine si l'id de la bonne réponse correpond à la sélection du user
        //les infos reçues d'un formulaire sont toujours sous forme de string, je dois donc utiliser parseInt pour transformer la string en number pour pouvoir effectuer la comparaison
        const isGood = question.good_answer.id === parseInt(req.body[`question_${question.id}`]);
        if (isGood) {
          //le user a donné la bonne réponse, on lui donne 1 point de plus
          nbPoints++;
        }
        //J'ajoute pour cette question des infos dans le tableau answers
        //pour la question du quiz d'index X correspondra une entrée d'index X dans le tableau answers
        answers.push({ 
          //bonne réponse
          question_answer: question.good_answer.id, 
          //réponse du user
          user_answer: parseInt(req.body[`question_${question.id}`]), 
          //boolean indiquant si le user a trouvé la bonne réponse
          isGood 
        });
      }
      //en sortie de boucle, on affiche la vue score avec comme data :
      //- le quiz récupéré de la BDD
      //- le tableau aswers avec des infos sur la réponse à chaque question
      //- le nombre de points
      res.render('score', { quiz, answers, nbPoints });
    }
  
  };
  
  module.exports = quizzController;