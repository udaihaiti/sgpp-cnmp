module.exports = (sequelize2, DataTypes)=>{
    const Document = sequelize2.define('Document',{
        documentId:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        institutionId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        filename:{
            type:DataTypes.STRING,
            allowNull:false
        },
        filepath:{
            type:DataTypes.STRING,
            allowNull:false
        },
        fiscal_year:{
            type:DataTypes.STRING,
            allowNull:false
        },
        status:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'documents',
        createdAt: 'created',
        updatedAt: 'updated'
    })
    
    return Document;
}