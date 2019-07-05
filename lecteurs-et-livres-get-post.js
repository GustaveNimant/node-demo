const express = require("express");
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set ('view engine', 'ejs');

const db_config = require('./backend/models/db_config');
const port_server = db_config.SERVER_PORT;

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const Db_Promise = mongoose.connect(db_config.DB_URI, { useNewUrlParser: true })
    .then(
	() => {console.log('Database is connected to Uri', db_config.DB_URI)}
    )
    .catch ((error) => {
	console.log('Can not connect to the database');
	console.error(error);
    });

const lecteurModel = require('./backend/models/lecteurModel');
const livreModel = require('./backend/models/livreModel');

const router = express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {
    console.log('la méthode du middleware est ',req.method, 'son url est', req.url);
    next(); 
});

router.get ('/', (req, res) => {
    res.render ('pages/index');
});

router.post('/nouveau-livre', (req, res) => {
    var nouveauLivre = new livreModel(req.body);
    nouveauLivre.save()
        .then(item => {
	    res.send('Le livre '+ req.body.titreLivre + ' a été enregistré dans la base de données <br><a href="/">Retour a l\'accueil</a>');
        })
        .catch(err => {
	    res.status(400).send("Impossible d'enregistrer le livre '+ req.body.titreLivre + ' dans la base de données");
        });
});

router.post('/nouveau-lecteur', (req, res) => {
    console.log('req.body', req.body);
    var nouveauLecteur = new lecteurModel(req.body);
    nouveauLecteur.save()
        .then(item => {
	    res.send('Le lecteur '+ req.body.pseudoLecteur + ' a été enregistré dans la base de données <br><a href="/">Retour a l\'accueil</a>');
        })
        .catch(err => {
	    res.status(400).send("Impossible d'enregistrer le lecteur '+ req.body.pseudoLecteur + ' dans la base de données");
        });
});

router.get('/Un-lecteur', function(req, res) {
    res.render ('pages/un-lecteur-post');
});

router.post('/Un-lecteur-post', function(req, res) {
    const pseudo = req.body.pseudo;
    console.log('Le pseudo est ', pseudo, '!');
  
    lecteurModel.findOne({
	pseudo: pseudo
    }).then(
	(a_reader) => {
	    console.log('a_reader is', a_reader);
	    res.render('pages/un-lecteur-get',
		       {
			   un_lecteur : a_reader,
			   title_tag: "Un lecteur",
			   title_page: "Les coordonnées d'un lecteur"
		       }
		      )
	}
    ).catch(
	(error) => {
	    res.status(404).json({
		error: error
	    });
	}
    );
});
	    
// route middleware to validate :pseudo
router.param('pseudo', function(req, res, next, pseudo) {
    console.log('pseudo est ' + pseudo);
    req.pseudo = pseudo;
    next(); 
});

router.get('/Ici/:pseudo', function(req, res) {
    res.send('Le pseudo est ' + req.pseudo + '!');
});

router.get('/Un-lecteur/:pseudo', function(req, res) {
    lecteurModel.findOne({
	pseudo: req.pseudo
    }).then(
	(a_reader) => {
	    console.log('a_reader is', a_reader);
	    res.render('pages/un-lecteur-get',
		       {
			   un_lecteur : a_reader,
			   title_tag: "Un lecteur",
			   title_page: "Les coordonnées d'un lecteur"
		       }
		      )
	}
    ).catch(
	(error) => {
	    res.status(404).json({
		error: error
	    });
	}
    );
});

/* Lecteurs */
const readersRoute = require('./backend/routes/lecteurs.route')

router.get("/Les-lecteurs", readersRoute);

/* Livres */
const booksRoute = require('./backend/routes/livres.route')

router.get("/Les-livres", booksRoute);

// apply the routes to our application
app.use('/', router);

app.listen(port_server, () => {
    console.log("Server listening on port http://localhost:" + port_server);
});