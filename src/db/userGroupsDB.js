const db = require('../utils/postGresDB')
//const associationsDB = require('../db/associationsDB'
const associationsDB = require('../dummy/treeAssociationDB')

const strUserGroup = 'User Group'

/************ User Groups API's ******************/
const getUserGroups = async() => {
  try {

      const query = `SELECT ug.id, ug.user_group_name, parent_id,parent_name, parent_type, created_date, created_by, is_exists  FROM userGroups ug
      LEFT JOIN usergroupassociations ua ON ug.id = ua.user_group_id`

      const { rows } = await db.query(query)
      return rows
  } catch(e) {
    throw e
  } 
}

const getAllUserGroupsByRole = async(data) => {
  try {
      const { userRole, userEmailID  } = data
      let query =''
      if(userRole == 'Platform Admin'){

      query = `SELECT ug.id, ug.user_group_name, parent_id,parent_name, parent_type, ug.created_date, ug.created_by, ug.is_exists ,r.role_name  
      FROM userGroups ug LEFT JOIN usergroupassociations ua ON ug.id = ua.user_group_id
                    LEFT JOIN rolemapping rm ON rm.user_group_id = ug.id
            JOIN roles r ON r.id = rm.role_id`

      } else if(userRole == 'Application Owner') { 

      query = `	 SELECT ug.id, ug.user_group_name, uga.parent_id,uga.parent_name, uga.parent_type,
      ug.created_date, ug.created_by, ug.is_exists ,r.role_name   FROM userGroups ug
      LEFT JOIN usergroupassociations uga ON ug.id = uga.user_group_id
      LEFT JOIN userassociations ua ON ug.id = ua.user_group_id
      JOIN PUBLIC.applications app on app.id = ua.app_id AND app.is_exists = true
      LEFT JOIN rolemapping rm ON rm.user_group_id = ug.id
		  JOIN roles r ON r.id = rm.role_id
      WHERE app.owner = '${userEmailID}' `

      }else {
        query =   `SELECT ua.*,ug.id, ug.user_group_name, uga.parent_id,uga.parent_name, uga.parent_type, ug.created_date,
        ug.created_by, ug.is_exists,r.role_name   FROM userGroups ug
          LEFT JOIN usergroupassociations uga ON ug.id = uga.user_group_id
          LEFT JOIN userassociations ua ON ug.id = ua.user_group_id	 
          LEFT JOIN rolemapping rm ON rm.user_group_id = ug.id
          JOIN roles r ON r.id = rm.role_id 
        WHERE ua.app_id in 
        (SELECT app_id FROM PUBLIC.userassociations ua 
         JOIN users u ON u.id = ua.user_id WHERE u.email_id = '${userEmailID}'`
      }

      const { rows } = await db.query(query)
      return rows
  } catch(e) {
    throw e
  } 
}

const getAllUserGroupsNotAssociatedForCurrentEntity = async(data) => {
  try {
      const { entityID, entityName, entityType } = data 

      //getAllUserGroupsNotAssociatedForCurrentEntity
      // const query = `SELECT * FROM userGroups ug WHERE ug.id NOT IN 
      // (SELECT user_group_id FROM usergroupassociations ua
      // WHERE ua.parent_id = $1 AND ua.parent_name = $2 AND parent_type = $3)`

      //const params = [entityID, entityName, entityType]

      //const { rows } = await db.query(query, params)

      //getAllUserGroupsNotAssociated
      const query = `SELECT * FROM userGroups ug WHERE ug.id NOT IN
      (SELECT user_group_id FROM usergroupassociations ua)   
      AND is_exists = true AND user_group_name 
	    NOT IN ('Platform Admin', 'Application Admin', 'Default App User')`

      const { rows } = await db.query(query)
      
      return rows
  } catch(e) {
    throw e
  } 
}

const getUserGroupsByID = async (id) => {
  try {

    const query = `SELECT * FROM PUBLIC.usergroups WHERE id = $1 AND is_exists = true ORDER BY id ASC`

    const { rows } = await db.query(query, [ id ])
    return rows
  } catch (e) {
    throw e
  }
}

const getUserGroupByUserGroupName = async (userGroupName) => {
  try {

    const query = `SELECT * FROM PUBLIC.usergroups WHERE user_group_name = $1 AND is_exists = true ORDER BY id ASC`

    const { rows } = await db.query(query, [ userGroupName ])
    return rows
  } catch (e) {
    throw e
  }
}

const getUserGroupsByAppID = async (appID) => {
  try {

    const query = `SELECT ua.app_id, ua.bu_id, ua.user_group_id, ug.user_group_name 
    FROM userassociations as ua 
    JOIN usergroups as ug on ua.user_group_id = ug.id
    WHERE ua.app_id = $1
    GROUP BY ua.app_id, ua.bu_id, ua.user_group_id, ug.user_group_name`

    const { rows } = await db.query(query, [ appID ])
    return rows
  } catch (e) {
    throw e
  }
}

const createUserGroups = async (data) => {
  try {
    const { userGroupName, createdBy } = data
    const createdDate = new Date()

    const userGroupParams = [ userGroupName, createdDate, createdBy, true ]
    const userGroupQuery = `INSERT INTO PUBLIC.usergroups (user_group_name, created_date, created_by, is_exists)
      VALUES ($1, $2, $3, $4)`

    await db.query(userGroupQuery, userGroupParams)

    const { rows } = await db.query('SELECT id FROM PUBLIC.usergroups WHERE user_group_name = $1', [userGroupName])
    const { id } = rows[0]

    return id
  } catch (e) {
    throw e
  }
}

const updateUserGroups = async (data) => {
  try {
    const { id, userGroupName, modifiedBy } = data
    const modifiedDate = new Date()

    const userParams = [id, userGroupName, modifiedDate, modifiedBy]
    const userQuery = `UPDATE PUBLIC.usergroups SET user_group_name = $2, modified_date = $3, modified_by = $4 WHERE id = $1`
    await db.query(userQuery, userParams)

    return

  } catch (e) {
    throw e
  }
}

const deleteUserGroup = async (id) => {
  try {

    const query = `SELECT user_group_name FROM PUBLIC.usergroups as ua WHERE ua.id = $1`

    const { rows } = await db.query(query, [ id ])

    if(rows.length > 0) {

        await db.query('DELETE FROM PUBLIC.userassociations WHERE user_group_id =$1', [ id ])
        await db.query('DELETE FROM PUBLIC.usergroupassociations WHERE user_group_id =$1', [ id ])
        await db.query('DELETE FROM PUBLIC.rolemapping WHERE user_group_id =$1', [ id ])
        await db.query('DELETE FROM PUBLIC.usergroups WHERE id = $1', [ id ])

        const data = { entityName : rows[0].user_group_name, entityID : id, entityType : strUserGroup }
        await associationsDB.deleteAssociationsByNodeForAngular( data ) 

        return 'User Group Deleted Successfully.'
    }
    return 'Record not found.'

  } catch (e) {
    throw e
  }
}

/* Compare
const associateUserGroups = async (data) => {
  try {
    const { appID, userGroupID } = data

    const queryappName = `SELECT name as appName FROM PUBLIC.applications WHERE id = $1`

    const { rows: appRows } = await db.query(queryappName, [ appID ])
    const { appname: appName } = appRows[0]

    const queryUserName = `SELECT User_group_name as usergroupname FROM PUBLIC.usergroups WHERE id = $1`
    const { rows: userRows } = await db.query(queryUserName, [ userGroupID ])
    const { usergroupname : userGroupName } = userRows[0]
    
    await associationsDB.createAssociationsByNode(appName, userGroupName, userGroupID, strUserGroup)
    //await db.query('INSERT INTO PUBLIC.userassociations (user_id, user_group_id, app_id, bu_id) VALUES ($1, $2, $3 )  ', [id, userGroupID, appId, buId ])

    return
  } catch (e) {
    throw e
  }
}

const associateUserGroupForBu = async (data) => {
  try {
    const { buID, userGroupID } = data

    const queryBuName = `SELECT name as buname FROM PUBLIC.businessUnits WHERE id = $1`

    const { rows: buRows } = await db.query(queryBuName, [ buID ])
    const { buname: buName } = buRows[0]

    const queryUserName = `SELECT User_group_name as usergroupname FROM PUBLIC.usergroups WHERE id = $1`
    const { rows: userRows } = await db.query(queryUserName, [ userGroupID ])
    const { usergroupname : userGroupName } = userRows[0]
    
    await associationsDB.createAssociationsByNode(buName, userGroupName, userGroupID, strUserGroup)
    //await db.query('INSERT INTO PUBLIC.userassociations (user_id, user_group_id, app_id, bu_id) VALUES ($1, $2, $3 )  ', [id, userGroupID, appId, buId ])

    return
  } catch (e) {
    throw e
  }
}

const updateAssociatedUserGroups = async (data) => {
  try {
    const { userGroupID, appID } = data

    const queryOldappName = `SELECT app.name as appName FROM PUBLIC.userassociations d
    JOIN PUBLIC.applications app ON d.app_id = app.id  WHERE user_group_id = $1 GROUP BY user_group_id, app.name`
    const { rows: oldAppRows } = await db.query(queryOldappName, [ userGroupID ])

    let oldAppName = null

    if(oldAppRows.length > 0) {
      oldAppName = oldAppRows[0].appname
    }

    const queryNewappName = `SELECT name as appName FROM PUBLIC.applications WHERE id = $1`
    const { rows: newAppRows } = await db.query(queryNewappName, [ appID ])
    const { appname: newAppName } = newAppRows[0]

    const queryUserName = `SELECT user_group_name as usergroupname FROM PUBLIC.usergroups WHERE id = $1`
    const { rows: userRows } = await db.query(queryUserName, [ userGroupID ])

    let userGroupName = ''
    if(userRows.length > 0) {
      userGroupName = userRows[0].usergroupname
    }
    
    await associationsDB.updateAssociationsByNode(userGroupName, userGroupID, strUserGroup, oldAppName, newAppName)

    return
  } catch (e) {
    throw e
  }
}

const updateAssociatedUserGroupForBu = async (data) => {
  try {
    const { userGroupID, buID } = data

    const queryOldBuName = `SELECT bu.name as buName FROM PUBLIC.userassociations d
    JOIN PUBLIC.businessUnits bu ON d.bu_id = bu.id  WHERE user_group_id = $1 GROUP BY user_group_id, bu.name`
    const { rows: oldBuRows } = await db.query(queryOldBuName, [ userGroupID ])

    let oldBuName = null

    if(oldBuRows.length > 0) {
      oldBuName = oldBuRows[0].buname
    }

    const queryNewBuName = `SELECT name as buName FROM PUBLIC.businessUnits WHERE id = $1`
    const { rows: newBuRows } = await db.query(queryNewBuName, [ buID ])
    const { buname: newBuName } = newBuRows[0]

    const queryUserName = `SELECT user_group_name as usergroupname FROM PUBLIC.usergroups WHERE id = $1`
    const { rows: userRows } = await db.query(queryUserName, [ userGroupID ])

    let userGroupName = ''
    if(userRows.length > 0) {
      userGroupName = userRows[0].usergroupname
    }
    
    await associationsDB.updateAssociationsByNode(userGroupName, userGroupID, strUserGroup, oldBuName, newBuName)

    return
  } catch (e) {
    throw e
  }
}*/

/************ User Groups API's ******************/
  const getUserGroupAssociations = async() => {
    try {
        const { rows } = await db.query('SELECT * FROM PUBLIC.usergroupassociations ORDER BY id ASC')
        return rows
    } catch(e) {
      throw e
    } 
  }

  const getUserGroupsAssociationsByUserID = async(id) => {
    try {
        const query = `select array_agg(user_group_id) as current_groups from PUBLIC.usergroupassociations
        where user_id = $1 group by user_group_id`

        const { rows } = await db.query(query, [ id ])
        return rows
    } catch(e) {
      throw e
    } 
  }
    
  const createUserGroupAssociations = async (data) => {
    try {
      const { userGroupID, userID } = data
  
      const params = [ userGroupID, userID ]
      const query = `INSERT INTO PUBLIC.usergroupassociations (user_group_id, user_id)
        VALUES ($1, $2)`
  
      await db.query(query, params)
  
      return
    } catch (e) {
      throw e
    }
  }
  
  const updateUserGroupAssociations = async (data) => {
    try {
      const { id, userGroupID, userID } = data
  
      const params = [id, userGroupID, userID ]
      const query = `UPDATE PUBLIC.usergroupassociations SET user_group_id = $2, user_id = $3 WHERE id = $1`
      await db.query(query, params)
  
      return
  
    } catch (e) {
      throw e
    }
  }
  
  const deleteUserGroupAssociation = async (id) => {
    try {
          await db.query('DELETE FROM PUBLIC.usergroupassociations WHERE id = $1', [ id ])
      return
    } catch (e) {
      throw e
    }
  }

  const deleteUserGroupAssociationByUserID = async (id) => {
    try {
          await db.query('DELETE FROM PUBLIC.usergroupassociations WHERE user_id = $1', [ id ])
      return
    } catch (e) {
      throw e
    }
  }

/************ User App Roles API's ******************/
  const getUserAppRoles = async() => {
    try {
        const { rows } = await db.query('SELECT * FROM PUBLIC.userapproles ORDER BY id ASC')
        return rows
    } catch(e) {
      throw e
    } 
  }
  
  const getUserAppRolesByID = async (id) => {
    try {
  
      query = `SELECT * FROM PUBLIC.userapproles WHERE id = $1 ORDER BY id ASC`
  
      const { rows } = await db.query(query, [ id ])
      return rows
    } catch (e) {
      throw e
    }
  }
  
  const createUserAppRoles = async (data) => {
    try {
      const { userID, appID, roleID } = data
  
      const params = [ userID, appID, roleID ]
      const query = `INSERT INTO PUBLIC.userapproles (user_id, app_id, role_id )
        VALUES ($1, $2, $3)`
  
      await db.query(query, params)
  
      return
    } catch (e) {
      throw e
    }
  }
  
  const updateUserAppRoles = async (data) => {
    try {
      const { id, userID, appID, roleID  } = data

      const params = [id, userID, appID, roleID ]
      const query = `UPDATE PUBLIC.userapproles SET user_id = $2, app_id = $3, role_id =$4  WHERE id = $1`
      await db.query(query, params)
  
      return
  
    } catch (e) {
      throw e
    }
  }
  
  const deleteUserAppRoles = async (id) => {
    try {
          await db.query('DELETE FROM PUBLIC.userapproles WHERE id = $1', [ id ])
      return
    } catch (e) {
      throw e
    }
  }

/************ User Group App Roles API's ******************/
  const getUserGroupAppRoles = async() => {
    try {
        const { rows } = await db.query('SELECT * FROM PUBLIC.usergroupapproles ORDER BY id ASC')
        return rows
    } catch(e) {
      throw e
    } 
  }
  
  const getUserGroupAppRolesByID = async (id) => {
    try {
  
      const query = `SELECT * FROM PUBLIC.usergroupapproles WHERE id = $1 ORDER BY id ASC`
  
      const { rows } = await db.query(query, [ id ])
      return rows
    } catch (e) {
      throw e
    }
  }
  
  const createUserGroupAppRoles = async (data) => {
    try {
      const { userGroupID, appID, roleID } = data
  
      const params = [ userGroupID, appID, roleID ]
      const query = `INSERT INTO PUBLIC.usergroupapproles (user_group_id, app_id, role_id )
        VALUES ($1, $2, $3)`
  
      await db.query(query, params)
  
      return
    } catch (e) {
      throw e
    }
  }
  
  const updateUserGroupAppRoles = async (data) => {
    try {
      const { id, userGroupID, appID, roleID  } = data

      const params = [id, userGroupID, appID, roleID ]
      const query = `UPDATE PUBLIC.usergroupapproles SET user_group_id = $2, app_id = $3, role_id =$4  WHERE id = $1`
      await db.query(query, params)
  
      return
  
    } catch (e) {
      throw e
    }
  }
  
  const deleteUserGroupAppRoles = async (id) => {
    try {
          await db.query('DELETE FROM PUBLIC.usergroupapproles WHERE id = $1', [ id ])
      return
    } catch (e) {
      throw e
    }
  }   

  const createUserGroupForAngular = async (data) => {
    try {
      let { userGroupName, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, isParentIsEntity, createdBy } = data
      const createdDate = new Date()

      if(grandParentID == null) {
          const query = `select  a.parent_id, a.parent_name, a.parent_type
          from associations
          and entity_id = $1 and entity_name = $2
          AND entity_type = $3`
          const { rows } = await db.query(query, [ parentID, parentName, parentType ])

          if( rows.length > 0){
            grandParentID = rows[0].parent_id
            grandParentName = rows[0].parent_name
            grandParentType = rows[0].parent_type
          }
      }
  
      const userGroupParams = [userGroupName, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, createdBy, createdDate, true]
      const userGroupQuery = `INSERT INTO PUBLIC.userEntityGroups(user_group_name, parent_id, parent_name, parent_type, grand_parent_id, grand_parent_name, grand_parent_type, created_by, created_date, is_exists) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
  
      await db.query(userGroupQuery, userGroupParams)
  
      const { rows } = await db.query('SELECT id FROM PUBLIC.userEntityGroups where user_group_name = $1', [userGroupName])
      const { id : userGroupID } = rows[0]
  
      if(parentID == null) {   
  
          const data = { parentName : null, parentType : null, entityName : userGroupName, entityID : userGroupID, entityType : strUserGroup } 
          await associationsDB.createAssociationsByNodeForAngular(data)
          
      } else if(parentID !== null && typeof parentID !== 'undefined' && parentName !== null && typeof parentName !== 'undefined'){
          if(isParentIsEntity == false) {
  
              const data = { entityID : parentID, entityName : parentName, entityType : parentType}
              const checkEntity = await associationsDB.getAssociationsByEntityForAngular(data)
              if(checkEntity.length == 0){
                  const data = { parentName : grandParentName, parentType : grandParentType, entityName : parentName, entityID : parentID, entityType : parentType} 
                    await associationsDB.createAssociationsByNodeForAngular(data)
              }
          }
          const data = { parentName : parentName, parentType : parentType, entityName : userGroupName , entityID : userGroupID , entityType : strUserGroup } 
          await associationsDB.createAssociationsByNodeForAngular(data)
      }
              
      return userGroupID
  
    } catch (e) {
      throw e
    }
  }

  const updateUserGroupForAngular = async( data ) => {
    try{
        const { userGroupID, userGroupName, oldParentID, oldParentType, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, isParentIsEntity, modifiedBy } = data
        const modifiedDate = new Date()

        const query = `UPDATE PUBLIC.userEntityGroups SET user_group_name = $2,  parent_id = $3, parent_name = $4, parent_type = $5, grand_parent_id = $6, grand_parent_name = $7, 
        grand_parent_type = $8,  modified_date = $9, modified_by = $10 WHERE id = $1`
        const params = [ userGroupID, userGroupName, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, modifiedDate, modifiedBy ]
        
        await db.query(query,params)
        
        if(oldParentID !== parentID && oldParentType !== parentType) { 
            if(parentID == null) { 
                const data = { parentName : null, parentType : null, entityName : userGroupName, entityID : userGroupID, entityType : strUserGroup } 
                await associationsDB.updateAssociationsByNodeForAngular(data)

            } else if(parentID !== null && typeof parentID !== 'undefined' && parentName !== null && typeof parentName !== 'undefined'){
                if(isParentIsEntity == false) {
                    const data = { entityID : parentID, entityName : parentName, entityType : parentType }
                    const checkEntity = await associationsDB.getAssociationsByEntityForAngular(data)
                    if(checkEntity.length == 0){
                        const data = { parentName : grandParentName, parentType : grandParentType, entityName : parentName, entityID : parentID, entityType : parentType} 
                         await associationsDB.createAssociationsByNodeForAngular(data)
                    }
                }
                    const data1 = { entityID : userGroupID, entityName : userGroupName, entityType : strUserGroup }
                    const checkEntity1 = await associationsDB.getAssociationsByEntityForAngular(data1)
                if(checkEntity1.length == 0) {
                    const data2 = { parentName : parentName, parentType : parentType, entityName : userGroupName , entityID : userGroupID, entityType : strUserGroup } 
                    await associationsDB.createAssociationsByNodeForAngular(data2)
                }else {
                    const data3 = { parentName : parentName, parentType : parentType, entityName : userGroupName , entityID : userGroupID, entityType : strUserGroup } 
                    await associationsDB.updateAssociationsByNodeForAngular(data3)
                }
            } 
        }
        return entityID
    } catch(e) {
        throw e
    }
}

  const createUserEntityGroups = async (data) => {
    try {
      const { userGroupName, createdBy } = data
      const createdDate = new Date()
  
      const userGroupParams = [userGroupName, null, null, null, null, null, null, createdBy, createdDate, true]
      const userGroupQuery = `INSERT INTO PUBLIC.userEntityGroups(user_group_name, parent_id, parent_name, parent_type, grand_parent_id, grand_parent_name, grand_parent_type, created_by, created_date, is_exists) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
  
      await db.query(userGroupQuery, userGroupParams)
  
      const { rows } = await db.query('SELECT id FROM PUBLIC.userEntityGroups where user_group_name = $1', [userGroupName])
      const { id : userGroupID } = rows[0]
             
      return userGroupID
  
    } catch (e) {
      throw e
    }
  }

  const associateUserGroup = async (data) => {
    try {
      let { userGroupID, userGroupName, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType } = data
      
      if(parentID !== null && typeof parentID !== 'undefined' && parentName !== null && typeof parentName !== 'undefined') {

        if(grandParentID == null) {
            const query = `select parent_id, parent_name, parent_type
            from associations
            WHERE entity_id = $1 AND entity_name = $2
            AND entity_type = $3`
            const { rows } = await db.query(query, [ parentID, parentName, parentType ])

            if( rows.length > 0){
              grandParentID = rows[0].parent_id
              grandParentName = rows[0].parent_name
              grandParentType = rows[0].parent_type
            }
        }

        const userGroupParams = [userGroupID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType]
        const userGroupQuery = `INSERT INTO PUBLIC.usergroupassociations(user_group_id, parent_id, parent_name, parent_type, grand_parent_id, grand_parent_name, grand_parent_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`
    
        await db.query(userGroupQuery, userGroupParams)
            
        const data = { parentName : parentName, parentType : parentType, entityName : userGroupName , entityID : userGroupID , entityType : strUserGroup } 
        await associationsDB.createAssociationsByNodeForAngular(data)
      } 

    return
  
    } catch (e) {
      throw e
    }
  }

  const deleteAssociatedUserGroup = async (data) => {
    try {

      const { userGroupID, userGroupName } = data

      const params = [userGroupID, userGroupName]
      const query = `DELETE FROM PUBLIC.usergroupassociations WHERE user_group_id = $1`

      await db.query(query, params)

  
      return
    } catch (e) {
      throw e
    }
  }

  const deAssociateUserGroup = async (data) => {
    try { 
  
        const { userGroupID } = data 

        const query = `DELETE FROM PUBLIC.usergroupassociations 
        WHERE  user_group_id = $1`
  
        await db.query(query, [userGroupID])

        return
    
    } catch (e) {
      throw e
    }
  }

  // const deAssociateUserGroups = async (userGroupID, parentID, parentName, parentType) => {
  //   try { 
  
  //       const query = `DELETE FROM PUBLIC.usergroupassociations 
  //       WHERE  user_group_id = $1 AND parent_id = $2 AND parent_name = $3 AND parent_type = $4`
  
  //       await db.query(query, [userGroupID, parentID, parentName, parentType])

  //       return
    
  //   } catch (e) {
  //     throw e
  //   }
  // }

module.exports = {
  getUserGroups,
  getAllUserGroupsNotAssociatedForCurrentEntity,
  getUserGroupsByID,
  getUserGroupsByAppID,
  getUserGroupByUserGroupName,
  createUserGroups,
  updateUserGroups,
  deleteUserGroup,
  //associateUserGroups,
  //associateUserGroupForBu,
  //updateAssociatedUserGroups,
  //updateAssociatedUserGroupForBu,
/******************************/
  getUserGroupAssociations,
  getUserGroupsAssociationsByUserID,
  createUserGroupAssociations,
  updateUserGroupAssociations,
  deleteUserGroupAssociation,
  deleteUserGroupAssociationByUserID,
/******************************/
  getUserAppRoles,
  getUserAppRolesByID,
  createUserAppRoles,
  updateUserAppRoles,
  deleteUserAppRoles,
/******************************/
  getUserGroupAppRoles,
  getUserGroupAppRolesByID,
  createUserGroupAppRoles,
  updateUserGroupAppRoles,
  deleteUserGroupAppRoles,

  /************* */
  createUserGroupForAngular,
  updateUserGroupForAngular,
  createUserEntityGroups,
  associateUserGroup,
  deleteAssociatedUserGroup,
  deAssociateUserGroup,
  getAllUserGroupsByRole
  //,
  //deAssociateUserGroups

}