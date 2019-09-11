const db = require('../utils/postGresDB')

const getNotifications = async() => {
    try {
        const { rows } = await db.query('SELECT * FROM PUBLIC.notifications ORDER BY id DESC')
        return rows
    } catch(e) {
      throw e
    } 
}
const getNotificationByAppID = async (id) => {
    try {
      const query = ``
  
      const { rows } = await db.query(query, [id])
  
      return rows
    } catch (e) {
      throw e
    }
}
const getNotificationByBUID = async (id) => {
    try {
      const query = ``
  
      const { rows } = await db.query(query, [id])
  
      return rows
    } catch (e) {
      throw e
    }
}

const createNotifications = async (title, message) => {
  try {
    
    const receivedOn = new Date()

    const params = [ title, message, receivedOn ]
    const query = `INSERT INTO PUBLIC.notifications(title, message, received_on) 
    VALUES ($1, $2, $3)`

    await db.query(query, params)

    return

  } catch (e) {
    throw e
  }
}


// const createNotifications = async (data) => {
//     try {
//       const { NotificationType, message, appID, appGroupID, buID, buGroupID } = data
//       const Timestamp = new Date()
  
//       const appParams = [ Timestamp, NotificationType, message, appID, appGroupID, buID, buGroupID ]
//       const appQuery = `INSERT INTO PUBLIC.notifications(timstamp, Notification_type, message, 
//       app_id, app_group_id, bu_id, bu_group_id) 
//       VALUES ($1, $2, $3, $4, $5, $6, $7)`
  
//       await db.query(appQuery, appParams)
  
//       return
  
//     } catch (e) {
//       throw e
//     }
// }

module.exports = {
    getNotifications,
    getNotificationByAppID,
    getNotificationByBUID,
    createNotifications
}