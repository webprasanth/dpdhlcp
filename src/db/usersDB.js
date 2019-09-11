const db = require('../utils/postGresDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const userGroupsDB = require('../db/userGroupsDB')
const blobStorage = require('../azure/blobStorage')
const notificationsDB = require('../db/notificationsDB')

const strUser = 'User'

const getUsers = async (page, size, search, sortColumn, sortType) => {
  try {

    let offsetRows = (page - 1) * size
    let sortTypeValue = (sortType == 1) ? 'ASC' : 'DESC'
    let result = {}

    if (search == null) {

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM users')
      const { rows } = await db.query('SELECT * FROM users  ORDER BY ' + sortColumn + ' ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows])

      result = {
        totalrows: totalrows.rows[0].total,
        rows
      }

    } else {

      let searchValue = '%' + search + '%'

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM users WHERE ' + sortColumn + ' LIKE $4 ORDER BY $3 ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])
      const { rows } = await db.query('SELECT * FROM users WHERE ' + sortColumn + ' LIKE $4 ORDER BY $3 ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])

      result = {
        totalrows: totalrows.rows.length == 0 ? 0 : totalrows.rows[0].total,
        rows
      }
    }

    return result
  } catch (e) {
    throw e
  }
}

const getAllUsers = async(data) => {
  try {
        const { userRole, userEmailID } = data
        let query =''
        if(userRole == 'Platform Admin'){

          query = `SELECT users.id,first_name,email_id,	   
          array_to_string(array_agg(user_group_name),',') user_group_name,
          array_to_string(array_agg(app.name),',') application_name,
          array_to_string(array_agg(bu.name),',') business_unit
          
          FROM PUBLIC.users 
          LEFT JOIN PUBLIC.userassociations ua on users.id = ua.user_id
          LEFT JOIN PUBLIC.usergroups ug on ug.id = ua.user_group_id
          LEFT JOIN PUBLIC.applications app on app.id = ua.app_id AND app.is_exists = true
          LEFT JOIN PUBLIC.businessunits bu on ua.bu_id = bu.id AND bu.is_exists = true
          WHERE users.is_exists = true
        GROUP BY users.id,first_name,email_id	
          ORDER BY users.id `
        } else if(userRole == 'Application Owner') {

          query = `SELECT users.id,first_name,email_id,	   
          array_to_string(array_agg(user_group_name),',') user_group_name,
          array_to_string(array_agg(app.name),',') application_name,
          array_to_string(array_agg(bu.name),',') business_unit
          
          FROM PUBLIC.users 
          LEFT JOIN PUBLIC.userassociations ua on users.id = ua.user_id
          LEFT JOIN PUBLIC.usergroups ug on ug.id = ua.user_group_id
          JOIN PUBLIC.applications app on app.id = ua.app_id AND app.is_exists = true
          JOIN PUBLIC.businessunits bu on ua.bu_id = bu.id AND bu.is_exists = true
          WHERE users.is_exists = true
          AND app.owner = '${userEmailID}'
          GROUP BY users.id,first_name,email_id	
          ORDER BY users.id `
        } else {

          const {rows} = await db.query( `SELECT array_agg(ua.user_group_id) as usegroupids  FROM PUBLIC.userassociations ua JOIN users u ON u.id = ua.user_id 
          JOIN usergroups ug on ug.id = ua.user_group_id
          where u.email_id = '${userEmailID}' AND user_group_id  IN
          (SELECT entity_id FROM  PUBLIC.associations WHERE entity_type = 'User Group' ) `)

          const userGroupIDs = rows[0].usegroupids

          query = `SELECT users.id,first_name,email_id,	   
          array_to_string(array_agg(user_group_name),',') user_group_name,
          array_to_string(array_agg(app.name),',') application_name,
          array_to_string(array_agg(bu.name),',') business_unit
          
          FROM PUBLIC.users 
          JOIN PUBLIC.userassociations ua on users.id = ua.user_id
          LEFT JOIN PUBLIC.usergroups ug on ug.id = ua.user_group_id
          LEFT JOIN PUBLIC.applications app on app.id = ua.app_id AND app.is_exists = true
          LEFT JOIN PUBLIC.businessunits bu on ua.bu_id = bu.id AND bu.is_exists = true
          WHERE users.is_exists = true
          AND ua.user_group_id in (${userGroupIDs})
          GROUP BY users.id,first_name,email_id	
          ORDER BY users.id `
        }


    

    const { rows } = await db.query(query)
    return rows
  } catch(e) {
    throw e
  } 
}

const getUserByID = async (id) => {
  try {
    
    const query = `SELECT  users.id as id, users.first_name as firstname, users.last_name as lastname ,
    users.designation, users.mobile_number as mobile, users.email_id as email, users.country, 
    users.state, users.city, users.street, users.pincode, users.display_name as displayname, 
    users.isdislaynameprimary as isdisplaynameprimary, users.gender, users.landlin_number as landline, 
    users.date_of_birth as dateofbirth, users.image_name as imagename, users.last_login as lastlogin,
    json_agg(json_build_object('groupID',ug.id, 'groupName',ug.user_group_name,
    'appID',app.id, 'appName',app.name,
    'buID',bu.id, 'buName',bu.name )) as Entities
    FROM PUBLIC.users 
    LEFT JOIN PUBLIC.userassociations as ua on users.id = ua.user_id
    LEFT JOIN PUBLIC.usergroups as ug on ug.id = ua.user_group_id AND ug.is_exists  = true
    LEFT JOIN PUBLIC.applications as app on ua.app_id = app.id and app.is_exists  = true
    LEFT JOIN PUBLIC.businessunits as bu on ua.bu_id = bu.id and bu.is_exists  = true
    WHERE PUBLIC.users.id = $1
    group by users.id,users.first_name,users.last_name, users.designation, users.mobile_number, users.email_id, 
    users.country,users.state,users.city,users.street,users.pincode,users.display_name, 
    users.isdislaynameprimary, users.gender, users.landlin_number, 
    users.date_of_birth,users.image_name, users.last_login`

    const { rows } = await db.query(query, [id])

    if(rows.length > 0){
      const imgData = await blobStorage.readFileFromBlobStorage(rows[0].imagename || "")
      rows[0].imgData = imgData
    }

    return rows
  } catch (e) {
    throw e
  }
}

const getUsersCount = async(userGroupIDs) => {
  try {
      let query = `SELECT  COUNT(DISTINCT  user_id) as total FROM userassociations `
      if(userGroupIDs) query += ` WHERE user_group_id in (${userGroupIDs}) `
      const { rows } = await db.query(query)
      return rows[0].total

  } catch(e) {
    throw e
  } 
}

const getUserByEmail = async (email) => {
  try {

    const query = `SELECT * FROM PUBLIC.users where email_id = $1`

    const { rows } = await db.query(query, [email])
    return rows
  } catch (e) {
    throw e
  }
}

const getUserGroupByUserEmailID = async (email) => {
  try {

    const query = ` SELECT ua.user_group_id, ug.user_group_name  FROM PUBLIC.userassociations ua JOIN users u ON u.id = ua.user_id 
    JOIN usergroups ug on ug.id = ua.user_group_id
    where u.email_id = $1 AND user_group_id  IN
    (SELECT entity_id FROM  PUBLIC.associations WHERE entity_type = 'User Group' ) `

    const { rows } = await db.query(query, [email])
    return rows
  } catch (e) {
    throw e
  }
}

const getUsersByUserGroupID = async (userGroupID) => {
  try {

    const query = `SELECT ug.id  as user_group_id, ug.user_group_name, ua.bu_id, ua.app_id, parent_id,parent_name, parent_type, 
    ug.created_date, ug.created_by, ug.is_exists,json_agg(u.*) as users  
    FROM userGroups ug
    LEFT JOIN usergroupassociations uga ON ug.id = uga.user_group_id
    LEFT JOIN userassociations ua ON ua.user_group_id = ug.id
    LEFT JOIN USERS u ON u.id = ua.user_id
    WHERE ug.id = $1
    GROUP BY ug.id, ug.user_group_name, ua.bu_id, ua.app_id, parent_id, parent_name, parent_type, ug.created_date, 
    ug.created_by, ug.is_exists`

    const { rows } = await db.query(query, [ userGroupID ])
    return rows
  } catch (e) {
    throw e
  }
}

const createUser = async (data) => {
  try {
    const { firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, appIDs, createdBy, imgData, rolesIDs, userGroupIDs } = data
    const createdDate = new Date()
    const imageName = `User_${email}_${createdDate.toDateString()}`

    const userParams = [firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, createdDate, createdBy, imageName, true]
    const userQuery = `INSERT INTO PUBLIC.users (	first_name,	last_name ,	display_name, isDislayNamePrimary,	gender,
    email_id, landlin_number, mobile_number, designation, date_of_birth, country,	state, city, street, pincode, created_date,	 
      created_by,	image_name,	is_exists)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`

    await db.query(userQuery, userParams)
    
    const queryuserId = `SELECT max(id) as userId FROM PUBLIC.users where email_id = $1`

    const { rows: userRows } = await db.query(queryuserId, [ email ])
    const { userid: userID } = userRows[0]

    if (userGroupIDs !== null && userGroupIDs !== '') {
      for (let i = 0; i < userGroupIDs.length; i++) {

       const data = {
          userGroupID : userGroupIDs[i], 
          userID : userID
        }
       await userGroupsDB.createUserGroupAssociations(data)
      }
    }
/*
    if (appIDs !== null && appIDs !== '') {
    for (let i = 0; i < appIDs.length; i++) {

      const queryappName = `SELECT bu.id as buId FROM PUBLIC.applications as app 
      LEFT JOIN PUBLIC.businessunits bu on app.bu_id = bu.id where app.id = $1`

      const { rows } = await db.query(queryappName, [ appId[i] ])

      const { buid: buID } = rows[0]

       const data = {
        appID  : appIDs[i], 
        userID : userID,
        buID   : buID
       }
        await createUserAssociations(data)
      }
    }
*/
    if (imgData.trim() !== '') {
      await blobStorage.uploadFileToBlobStorage(imgData, imageName)
    }

    return userID

  } catch (e) {
    throw e
  }
}

const updateUser = async (data) => {
  try {
    const { id, firstName, email, mobile, country, state, city, street, pincode, modifiedBy, imgData } = data
    const modifiedDate = new Date()

    const userParams = [ id, firstName, email, mobile, country, state, city, street, pincode, modifiedDate, modifiedBy]
    const userQuery = `UPDATE PUBLIC.users SET first_name = $2,	email_id = $3,
    mobile_number = $4,  country = $5,	state = $6, city = $7, street = $8, 
    pincode = $9, modified_date = $10, modified_by = $11
    WHERE id = $1`
    await db.query(userQuery, userParams)

    if (imgData.trim() !== '') {
      const { rows } = await db.query('SELECT users.image_name as imagename FROM PUBLIC.users as users WHERE users.id = $1', [id])
      const blobName = rows[0].imagename
      await blobStorage.uploadFileToBlobStorage(imgData, blobName)
    }

    const title = 'User updated'
    const message = `${firstName} details is updated by ${modifiedBy}`
    await notificationsDB.createNotifications(title, message)
    return

  } catch (e) {
    throw e
  }
}

const deleteUser = async (id) => {
  try {
    
    await db.query('DELETE FROM  PUBLIC.userassociations where user_id =$1', [id])
    await db.query('DELETE FROM PUBLIC.users WHERE id = $1', [id])

    return
  } catch (e) {
    throw e
  }
}

const deleteUserFromUserGroup = async (userID, userGroupID) => {
  try {
      await db.query('DELETE FROM  PUBLIC.userassociations where user_id = $1 AND user_group_id = $2', [userID, userGroupID])
    return
  } catch (e) {
    throw e
  }
}

const createBulkUsers = async (data) => {
  try {
    return new Promise((resolve, reject) => {

    const { firstName, email, mobile, designation, country, state, city, street, createdBy } = data
    const createdDate = new Date()
    const imageName = `User_${email}_${createdDate.toDateString()}`

    const userParams = [firstName, '', '', false, '', email, '', mobile, designation, '', country, state, city, street, '', createdDate, createdBy, imageName, true]
    const userQuery = `INSERT INTO PUBLIC.users (	first_name,	last_name ,	display_name, isDislayNamePrimary,	gender,
    email_id, landlin_number, mobile_number, designation, date_of_birth, country,	state, city, street, pincode, created_date,	 
    created_by,	image_name,	is_exists)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`

      db.query(userQuery, userParams)
      .then(async(result) => {
        const user = await getUserByEmail(email)
        const userID = user[0].id
        
        const title = 'New User onboarded'
        const message = `${firstName} is onboarded by ${createdBy}`
        await notificationsDB.createNotifications(title, message)

        resolve(userID)
        
      })
      .catch((e) => {
        reject(e)
      })
    })
  } catch(e) {
  }
}

const updateFavoriteMenu = async (data) => {
  try {

    const { userID, userfavoriteMenu } = data

    const query = `UPDATE PUBLIC.users SET favorite_menu = $2
    WHERE user_id =$1` 
    
    const { rows } = await db.query(query, [ userID, userfavoriteMenu ])
    return rows
  } catch (e) {
    throw e
  }
}

const createUserAssociations = async (data) => {
  try {
    const { userID, userGroupID, appID, buID } = data

    const params = [ userID, userGroupID, appID, buID ]
    const query = `INSERT INTO PUBLIC.userassociations (user_id, user_group_id, app_id, bu_id)
      VALUES ($1, $2, $3, $4)`

    await db.query(query, params)

    return
  } catch (e) {
    throw e
  }
}

const updateUserAssociations = async (data) => {
  try {
      const { id, userID, userGroupID, appID, buID } = data
  
      const params = [id, userGroupID, userID, appID, buID ]
      const query = `UPDATE PUBLIC.userassociations SET user_group_id = $2, user_id = $3, app_id = $4, bu_id = $5 WHERE id = $1`
      await db.query(query, params)
  
      return
  } catch (e) {
    throw e
  }
}

const updateUserAssociationByUserAndUserGroupID = async (data) => {
  try {
      const { userID, userGroupID, appID, buID } = data
  
      const params = [ userGroupID, userID, appID, buID ]
      const query = `UPDATE PUBLIC.userassociations SET app_id = $3, bu_id = $4 WHERE user_group_id = $1 AND user_id = $2`
      await db.query(query, params)
  
      return
  } catch (e) {
    throw e
  }
}

const deleteUserAssociation = async (data) => {
  try {
      const { userID, userGroupID } = data
  
      const params = [userID, userGroupID]
      const query = `DELETE FROM PUBLIC.userassociations WHERE user_id = $1 AND user_group_id = $2`
      await db.query(query, params)
  
      return
  } catch (e) {
    throw e
  }
}

const createUserProfile = async (data) => {
  try {
    const { firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, createdBy, imgData } = data
    const createdDate = new Date()
    const imageName = `User_${email}_${createdDate.toDateString()}`

    const userParams = [firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, createdDate, createdBy, imageName, true]
    const userQuery = `INSERT INTO PUBLIC.users (	first_name,	last_name ,	display_name, isDislayNamePrimary,	gender,
    email_id, landlin_number, mobile_number, designation, date_of_birth, country,	state, city, street, pincode, created_date,	 
    created_by,	image_name,	is_exists)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`

    await db.query(userQuery, userParams)

    const user = await getUserByEmail(email)
    const userID = user[0].id
    
    if (imgData.trim() !== '') {
      await blobStorage.uploadFileToBlobStorage(imgData, imageName)
    }

    const title = 'New User onboarded'
    const message = `${firstName} is onboarded by ${createdBy}`
    await notificationsDB.createNotifications(title, message)

    return userID

  } catch (e) {
    throw e
  }
}

const updateUserProfile = async (data) => {
  try {
    const { id, firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, imgData, modifiedBy } = data
    const modifiedDate = new Date()

    const userParams = [ id, firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, modifiedDate, modifiedBy]
    const userQuery = `UPDATE PUBLIC.users SET first_name = $2,	last_name = $3,	display_name = $4, isDislayNamePrimary = $5,	gender = $6, email_id = $7, landlin_number = $8,
    mobile_number = $9, designation = $10, date_of_birth = $11, country = $12,	state = $13, city = $14, street = $15, pincode = $16, modified_date = $17, modified_by = $18
    WHERE id = $1`
    await db.query(userQuery, userParams)

    if (imgData.trim() !== '') {
      const { rows } = await db.query('SELECT users.image_name as imagename FROM PUBLIC.users as users WHERE users.id = $1', [id])
      const blobName = rows[0].imagename
      await blobStorage.uploadFileToBlobStorage(imgData, blobName)
    }

    const title = 'User updated'
    const message = `${firstName} details is updated by ${modifiedBy}`
    await notificationsDB.createNotifications(title, message)

    return
  } catch (e) {
    throw e
  }
}

const getUserAssocByUserandUserGroupID = async(userID, userGroupID) => {
  try {
      const { rows } = await db.query(`SELECT * FROM PUBLIC.userassociations 
      WHERE user_id = $1 AND user_group_id = $2`, [userID, userGroupID])
      return rows
  } catch(e) {
    throw e
  } 
}

const updateUserLastLogin = async (userID) => {
  try {

    const d = new Date()
    const lastLoginDate = d.toUTCString()

    const query = `UPDATE PUBLIC.users SET last_login = $2 WHERE id = $1` 
    
    const { rows } = await db.query(query, [ userID, lastLoginDate ])
    return rows
  } catch (e) {
    throw e
  }
}

const getAppByUserMailID = async (userEmailID) => {
  try {

    const { rows }  = await db.query( `SELECT id as appid, name as appname FROM PUBLIC.applications app WHERE app.owner = '${userEmailID}'`)
    
    return rows
  } catch (e) {
    throw e
  }
}


module.exports = {
  getUsers,
  getAllUsers,
  getUserByID,
  getUsersCount,
  getUserByEmail,
  getUsersByUserGroupID,
  createUser,
  updateUser,
  deleteUser,
  deleteUserFromUserGroup,
  createBulkUsers,
  updateFavoriteMenu,
  createUserAssociations,
  deleteUserAssociation,
  createUserProfile,
  updateUserProfile,
  getUserAssocByUserandUserGroupID,
  updateUserAssociations,
  updateUserAssociationByUserAndUserGroupID,
  updateUserLastLogin,
  getUserGroupByUserEmailID,
  getAppByUserMailID
}