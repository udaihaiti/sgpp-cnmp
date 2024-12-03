module.exports = (req, res, next) => {
    const { userId, status } = req.user;

    // Vérifiez si l'utilisateur est administrateur (userId = 1 ou status = 1)
    if (userId !== 1 && status !== 1) {
        const message = 'Accès refusé. Vous devez être un administrateur pour effectuer cette action.';
        return res.status(403).json({ message });
    }
    
    // Passez au middleware ou à la route suivante
    next();
};