module.exports = (sequelize2, DataTypes) => {
    const Institution = sequelize2.define('Institution', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            notEmpty: {
                message: 'Le nom ne peut pas être vide'
            },
            notNull: {
                message: 'Le nom est une propriété requise'
            },
            allowNull: false
        },
        acronym: {
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: 'Le sigle doit être unique'
            },
            validate: {
                notEmpty: {
                    message: 'Le sigle ne peut pas être vide'
                },
                notNull: {
                    message: 'Le sigle est un propriété requise'
                }
            },
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        passwordMustBeChange: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        soumisPar: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        estActif: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status:{
            type: DataTypes.INTEGER,
            allowNull: true 
        },
        email: {
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: 'L\'email doit être unique'
            },
            validate: {
                isEmail: {
                    message: 'L\'email doit être une adresse email valide'
                },
                isLowercase: {
                    message: 'L\'email doit être en minuscules'
                },
                len: {
                    args: [6, 255],
                    message: 'L\'email doit avoir entre 6 et 255 caractères'
                },
                is: {
                    args: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'L\'email doit être au format valide'
                }
            },
            allowNull: true
        },
        estValide: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        idTypeAC: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        nomext: {
            type: DataTypes.STRING,
            notEmpty: {
                message: 'Le nom ne peut pas être vide'
            },
            notNull: {
                message: 'Le nom est une propriété requise'
            },
            allowNull: true
        },
    }, {
        tableName: 'ac',
        timestamps: false
    })

    return Institution;
}
