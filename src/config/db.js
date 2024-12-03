const { Sequelize, DataTypes } = require('sequelize');
const InstitutionModel = require('../models/institutionModel');
const PlansPrevisionnelsModel = require('../models/plansPrevisionnelsModel');
const DocumentModel = require('../models/documentModel');
const CommentModel = require('../models/commentModel');
const FiscalYearsModel = require('../models/fiscalYearsModel');


let sequelize2;

if (process.env.NODE_ENV === 'production') {
    // Base de données principale
    sequelize2 = new Sequelize('cnmp_db', 'cnmp_dbo', '2g_Efq00', {
        host: 'p3nlmysql3plsk.secureserver.net',
        port:3306,
        dialect: 'mariadb',
        dialectOptions: {
            timezone: 'Etc/GMT-2',
            connectTimeout: 30000
        },
        logging: true
    });
} else {
    // sequelize2 = new Sequelize('cnmp', 'root', '', {
    //     host: 'localhost',
    //     dialect: 'mariadb',
    //     dialectOptions: {
    //         timezone: 'Etc/GMT-2',
    //     },
    //     logging: false,
    // });

    // Base de données secondaire
    sequelize2 = new Sequelize('cnmp_db', 'cnmp_dbo', '2g_Efq00', {
        host: 'p3nlmysql3plsk.secureserver.net',
        dialect: 'mariadb',
        port:3306,
        dialectOptions: {
            timezone: 'Etc/GMT-2',
            connectTimeout: 30000
        },
        logging: false
    });
}

// Définir le modèle
const Institution = InstitutionModel(sequelize2, DataTypes);
const Document = DocumentModel(sequelize2, DataTypes);
const Comment = CommentModel(sequelize2, DataTypes);
const FiscalYear = FiscalYearsModel(sequelize2, DataTypes);
const PlansPrevisionnels = PlansPrevisionnelsModel(sequelize2, DataTypes);

sequelize2.authenticate()
    .then(() => {
        console.log('Connection has been established successfully  in database 2.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

Institution.hasMany(Document, { foreignKey: 'institutionId' });
Document.belongsTo(Institution, { foreignKey: 'institutionId' });

Institution.hasMany(Comment, { foreignKey: 'institutionId' });
Comment.belongsTo(Institution, { foreignKey: 'institutionId' });

Document.hasMany(Comment, { foreignKey: 'documentId' });
Comment.belongsTo(Document, { foreignKey: 'documentId' });

// Synchronisation des modèles avec la base de données
// sequelize.sync()
//     .then(() => {
//         console.log('Database synchronized successfully.');
//     })
//     .catch(err => {
//         console.error('Error synchronizing the database:', err);
//     });


// Exporter sequelize et le modèle
module.exports = {
    sequelize2,
    Institution,
    Document,
    Comment,
    FiscalYear,
    PlansPrevisionnels
};
