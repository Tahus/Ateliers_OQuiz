const { Tag } = require('../models');


// Affichage simple de la liste de l'ensemble des tags
const tagController = {

  // Affichage simple de la liste de l'ensemble des tags
  tagList: async (req, res) => {
    try {
      const tags = await Tag.findAll();
      res.render('tags', {tags});
    } catch (err) {
      console.trace(err);
      res.status(500).send(err);
    }
  },



  // Rajout d'un Tag seulement pour les admins
  addTagPage : async (req, res) => {
   res.render('add_tag');
  },


  // Ajout d'un tag
  //pour gérer l'ajout de couleur du tag crée, on ne peut pas modifier à chaud le fichier CSS
  //Il faut donc ajouter un champ color sur la table tag et dans les vues on va tester :
  //- si la couleur est renseignée en base, on l'utilise
  //- sinon, on utilise la classe CSS
  // ALTER TABLE "tag" ADD COLUMN "color" TEXT NULL;
  addTagAction : async (req, res) => {

    try {

      // on vérifie si le tag existe déjà
      const tag = await Tag.findOne({
        where: {
          name: req.body.name
        }
      });

      //le tag existe déjà, on réaffiche le formulaire avec une erreur
      //pour l'UX, je réaffiche les infos saisies par l'utilisateur
      //J'utilise return pour sortir de la méthode et ne pas exécuter le reste du code
      if (tag) {

        console.log('Le tag existe déjà');
        return res.render('add_tag', {error: 'Le tag existe déjà', fields: req.body});

      } else {
        // si le tag n'existe pas, je rajoute le tag en bdd
        await Tag.create({
          name: req.body.name,
          color: req.body.color
        });
        console.log('Tag créé!');

        return res.render('add_Tag', {result: `Le tag ${req.body.name} a été ajouté`});
      }
    } catch (err) {
      console.trace(err);
      res.status(500).send(err.message);
    }
  },


  // Modifier un tag existant (pour les admins)
  // d'abord une méthode pour sélectionnet un tag à modifier
  // puis une méthode pour modifier le tag
  // Pas de modif de couleur ici car complexe


  // Sélection d'un tag à modifier
  selectTag : async (req, res) => {
    try {
      // je récupère tous les tags 
      const tags = await Tag.findAll();
      res.render('select_tag', {tags});
    } catch (err) {
      console.trace(err);
      res.status(500).send(err.message);
    }
  },

  //C'est ici que je vais pouvoir choisir le tag à modifier
  // J'ai donc besoin de l'id en fonction du choix de l'utilisateur
  modifyTag: async (req, res) => {
    try {
      // je récupère le tag à modifier
      const tag = await Tag.findByPk(req.params.id);

      console.log('tag à modifier',tag);

      res.render('modify_tag', {tag});
    } catch (err) {
      console.trace(err);
      res.status(500).send(err.message);
    }
  },

 // Une fois le tag modifié je redirige vers la liste des tags
  modifyTagHandle: async (req, res) => {
    try {
      // je récupère le tag à modifier
      const tag = await Tag.update({
        name: req.body.name
      }, {
        where: {
          id: parseInt(req.body.id, 10)
        }
      });
      res.redirect('/tags');
    } catch (err) {
      console.trace(err);
      res.status(500).send(err.message);
    }
  }

};




module.exports = tagController;