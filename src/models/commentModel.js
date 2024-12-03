module.exports = (sequelize2, DataTypes)=>{
    const Comment = sequelize2.define('Comment',{
        commentId:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        documentId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        institutionId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        comment:{
            type:DataTypes.STRING,
            allowNull:false
        },
        status:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'comments',
        createdAt: 'created',
        updatedAt: 'updated'
    })
    
    return Comment;
}