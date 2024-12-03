const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const path = require('path');
const fs = require('fs');

// Chemin pour le dossier de stockage
const uploadsDir = path.join(__dirname, '../uploads');

// Créez le répertoire s'il n'existe pas
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Dossier de destination
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Renommer le fichier avec un timestamp
    }
});

const upload = multer({storage: storage});
const router = express.Router();

// Route pour créer un document avec un fichier
router.post('/', upload.single('file'), documentController.createDocument);
router.get('/', documentController.getAllDocuments);
router.get('/:document-by-institutions', documentController.getDocumentsByInstitutions);
router.get('/documents-with-comments', documentController.getDocumentsWithComments);
router.put('/:id', upload.single('file'), documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.get('/count-by-institution', documentController.getDocumentCountByInstitution);
router.get('/filtre/filtre-document', documentController.filtreDocument);
router.get('/:id', documentController.getDocumentById);
router.get('/download/:filename',documentController.downloadFile);

module.exports = router;
