module.exports = (sequelize2, DataTypes)=>{
    const FiscalYear = sequelize2.define('FiscalYear',{
        fiscalYearId:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        fiscalYear: {
            type: DataTypes.STRING,
            allowNull: false
        },
        submissionDate:{
            type:DataTypes.DATE,
            allowNull:false
        },
        status:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'fiscalyears',
        createdAt: 'created',
        updatedAt: 'updated'
    })
    
    return FiscalYear;
}