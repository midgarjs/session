module.exports = (sequelize, DataTypes) => {
  const session = sequelize.define('session', {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    user_id: DataTypes.STRING,
    expires: DataTypes.DATE,
    data: DataTypes.TEXT
  })

  return session
}