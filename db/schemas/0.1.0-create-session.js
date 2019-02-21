module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('sessions', {
      sid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expires: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_roles')
  }
}