const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Transaction', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    external_updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    external_created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status_original: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    schema: 'fullstack',
    tableName: 'external_transactions',
    timestamps: false,
  });
};
