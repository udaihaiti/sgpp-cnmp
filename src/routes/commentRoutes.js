const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// create a comment
router.post('/', commentController.createComment);
router.get('/', commentController.getAllComments);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.get('/comments/:documentId', commentController.commentByDocumentsId);
router.get('/count',commentController.getCommentsCountByDocument)
router.get('/:id', commentController.getCommentById);



module.exports = router;

