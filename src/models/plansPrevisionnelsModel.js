module.exports = (sequelize2, DataTypes) => {
    const PlansPrevisionnels = sequelize2.define('PlansPrevisionnels', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        numeroPlan: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        anneefiscale: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        datecreation: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        datepublication: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        idetat: {
            type: DataTypes.INTEGER(50),
            allowNull: true,
            defaultValue: '2'
        },
        idac: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            defaultValue: ''
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        show: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1
        }
    }, {
        tableName: 'plans_previsionnels',
        timestamps: false
    });

    return PlansPrevisionnels;
};
