const jwt = require('jsonwebtoken');
const privateKey = require('./private_key');

module.exports = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        const message = 'Vous n\'avez pas fourni de jeton d\'authentification. Ajoutez-en un dans l\'en-tête de la requête.';
        return res.status(401).json({ message });
    }

    const token = authorizationHeader.split(' ')[1];

    jwt.verify(token, privateKey, (error, decodedToken) => {
        if (error) {
            const message = 'Le jeton est invalide ou a expiré. Veuillez fournir un jeton valide.';
            return res.status(401).json({ message, data: error });
        }

        req.user = decodedToken;

        // Si l'utilisateur n'est pas un administrateur, vérifiez si le userId dans la requête correspond au userId dans le token
        if (decodedToken.institutionId !== 1 && req.body.useinstitutionId && req.body.institutionId !== decodedToken.institutionId) {
            const message = 'L\'identifiant de l\'utilisateur est invalide.';
            return res.status(401).json({ message });
        }
        
        // Passez au middleware ou à la route suivante
        next();
    });
};
