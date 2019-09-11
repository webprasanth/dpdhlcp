const db = require('../utils/postGresDB')

const getRoles = async (category) => {
  try {
    let query = `SELECT r.id,r.role_name,role_category,privilege,array_to_string(array_agg(ug.user_group_name),',') user_group_name
    FROM PUBLIC.roles r
    LEFT JOIN rolemapping rm ON rm.role_id = r.id
    JOIN usergroups ug ON ug.id = rm.user_group_id `

    if(category) query += ` WHERE r.role_category = '${category}' `
    query += ` GROUP BY r.id,r.role_name,role_category`

    const { rows } = await db.query(query)
    return rows
  } catch (e) {
    throw e
  }
}

const getRoleIDByRoleName = async (name) => {
  try {
    let query = `	select * from roles
    WHERE role_name = $1`

    const { rows } = await db.query(query, [name])
    return rows
  } catch (e) {
    throw e
  }
}

const getRolePrivilegesMappingByRoleID = async (roleID) => {
  try {
    let query = `SELECT r.id,r.role_name,role_category,privilege,array_agg(ug.id) user_group_ids
    FROM PUBLIC.roles r
    LEFT JOIN rolemapping rm ON rm.role_id = r.id
    JOIN usergroups ug ON ug.id = rm.user_group_id
	WHERE r.id = $1
	GROUP BY r.id,r.role_name,role_category`

    const { rows } = await db.query(query, [ roleID ])
    return rows
  } catch (e) {
    throw e
  }
}

const getUserGroupsWhichMappedAndNotAssociated = async () => {
  try {
    let query = `SELECT * FROM usergroups ug WHERE id   
    NOT IN
    (SELECT user_group_id FROM usergroupassociations
    GROUP BY user_group_id)`

    const { rows } = await db.query(query)
    return rows
  } catch (e) {
    throw e
  }
}

const getRoleMappingToUserGroup = async (roleID, userGroupID) => {
  try {
    let query = ` select * from rolemapping 
	  where role_id = $1 AND user_group_id = $2`

    const { rows } = await db.query(query, [roleID, userGroupID])
    return rows
  } catch (e) {
    throw e
  }
}

const getRolesByAppID = async (appID) => {
  try {
    let query = `SELECT r.* FROM activities a
    JOIN roleactivityrbac ra ON ra.activity_id = a.id
    JOIN roles r on r.id = ra.role_id 
    WHERE a.app_id = $1
    AND a.activity_type = 'Application'`
    const { rows } = await db.query(query, [ appID ])
    return rows
  } catch (e) {
    throw e
  }
}

const getActivities = async (activityType) => {
  try {
    let query = `SELECT activity_name,json_agg(json_build_object('id',id,'sub_activity',sub_activity,'app_id',app_id ))  as data FROM PUBLIC.activities `
    if(activityType) query += ` WHERE activity_type = '${activityType}' `
    query += `GROUP BY activity_name`
    const { rows } = await db.query(query)
    return rows
  } catch (e) {
    throw e
  }
}

const getActivitiesByAppID = async (appID) => {
  try {
    let query = `SELECT id,activity_name, COALESCE (sub_activity,'') as sub_activity,app_id,activity_type FROM PUBLIC.activities 
    WHERE app_id = $1 AND activity_type = 'Application' ORDER BY id ASC`
    const { rows } = await db.query(query, [ appID ])
    return rows
  } catch (e) {
    throw e
  }
}

const addRoles = async (data) => {
  try {
    const { roleName, roleCategory, privileges } = data
    let query = `INSERT INTO PUBLIC.roles (role_name,role_category, privilege) VALUES ($1, $2, $3) `
    await db.query(query, [ roleName, roleCategory, JSON.stringify(privileges) ])

    const { rows } = await db.query('SELECT id FROM roles WHERE role_name = $1',[ roleName ])
    const roleID = rows[0].id
    return roleID

  } catch (e) {
    throw e
  }
}

const updateRoles = async (data) => {
  try {
    const { roleID, roleName, roleCategory, privileges } = data
    let query = `UPDATE PUBLIC.roles
    SET role_name = $2, role_category = $3, privilege = $4
    WHERE id = $1`
    await db.query(query, [ roleID, roleName, roleCategory,  JSON.stringify(privileges) ])
    return
  } catch (e) {
    throw e
  }
}

const addActivities = async (data) => {
  try {
    const { activityName, appID, activityType } = data
    let query = `INSERT INTO PUBLIC.activities (activity_name, app_id, activity_type) VALUES ($1, $2, $3) `
    await db.query(query, [ activityName, appID, activityType ])
    return 
  } catch (e) {
    throw e
  }
}

const addSubActivities = async (data) => {
  try {
    const { activityName, subActivity, appID, activityType } = data
    let query = `INSERT INTO PUBLIC.activities (activity_name, sub_activity, app_id, activity_type) VALUES ($1, $2, $3, $4) `
    await db.query(query, [ activityName, subActivity, appID, activityType ])
    return
  } catch (e) {
    throw e
  }
}

const saveRBACConfiguration = async (data) => {
  try {
    const { activityID, roleID, createAccess, readAccess, updateAccess, deleteAccess } = data
    let query = `INSERT INTO PUBLIC.roleactivityrbac (activity_id, role_id, create_access, read_access, update_access, delete_access) VALUES ($1, $2, $3, $4, $5, $6) `
    await db.query(query, [ activityID, roleID, createAccess, readAccess, updateAccess, deleteAccess ])
    return
  } catch (e) {
    throw e
  }
}

const getActivityRBAC = async(data) => {
  try {
    const { category, roleID, appID } = data
    let query = `SELECT * FROM PUBLIC.activities a 
    RIGHT JOIN PUBLIC.roleactivityrbac rb ON rb.activity_id = a.id  WHERE activity_type = '${category}' `
    if(roleID !== null && roleID !== '' && typeof roleID !== 'undefined') query += ` AND rb.role_id = ${roleID} `
    if(appID !== null && appID !== '' && typeof appID !== 'undefined') query += ` AND a.app_id = ${appID} `
    query += `ORDER BY rb.id ASC`
    const { rows } = await db.query(query)
    return rows
  } catch (e) {
    throw e
  }
}

const getRBACByRBACID = async (rbacID) => {
  try {
    let query = `SELECT r.* FROM PUBLIC.roleactivityrbac r
    WHERE r.id = $1`
    const { rows } = await db.query(query, [ rbacID ])
    return rows
  } catch (e) {
    throw e
  }
}

const updateActivityRBAC = async(data) => {
  try {

    const {  rbacID, createAccess, readAccess, updateAccess, deleteAccess } = data

    const query = `UPDATE PUBLIC.roleactivityrbac
    SET create_access = $2, read_access = $3, update_access = $4, delete_access = $5 WHERE id = $1` 

    const { rows } = await db.query(query, [ rbacID, createAccess, readAccess, updateAccess, deleteAccess ] )
    return rows
  } catch(e) {
    throw e
  }  
}

const getConfiguredRoles = async (category) => {
  try {
    let query = `SELECT r.id,r.role_name FROM roles r `
    query += `JOIN roleactivityrbac rb ON rb.role_Id = r.id `
    if(category) query += `WHERE r.role_category = '${category}' `   
    query += `GROUP BY r.id,r.role_name ORDER BY r.id ASC`

    const { rows } = await db.query(query)
    return rows
  } catch (e) {
    throw e
  }
}

const createRoleMappingToUserGroup = async (data) => {
  try {
    const { roleID, userGroupID, createdBy } = data
    const createdDate = new Date()
    let query = `INSERT INTO PUBLIC.rolemapping (role_id, user_group_id, created_date, created_by) VALUES ($1, $2, $3, $4)`
    
    await db.query(query, [ roleID, userGroupID, createdDate, createdBy ])
    return
  } catch (e) {
    throw e
  }
}

const updateRoleMappingToUserGroup = async(data) => {
  try {

    const {  userGroupID, roleID, modifiedBy } = data
    const modifiedDate = new Date()
    const query = `UPDATE PUBLIC.rolemapping
    SET role_id = $2, modified_date = $3, modified_by = $4 WHERE user_group_id = $1` 

    const { rows } = await db.query(query, [ userGroupID, roleID, modifiedDate, modifiedBy ] )
    return rows
  } catch(e) {
    throw e
  }  
}

const deleteRoleMappingByRoleID = async(data) => {
  try {

    const { roleID } = data
    const query = `DELETE FROM PUBLIC.rolemapping WHERE role_id = $1` 

    const { rows } = await db.query(query, [roleID] )
    return rows
  } catch(e) {
    throw e
  }  
}

const getTopLevelEntitiesAssociatedWithUserGroup = async() => {
  try{

      const query = `SELECT a.entity_id,a.entity_name, a.entity_type
      FROM PUBLIC.associations a
      JOIN PUBLIC.associations b ON b.node_path <@ a.node_path AND b.entity_type IN ('User Group')
      WHERE a.parent_id is NULL AND a.entity_type IN ('Business Unit','Application')
      GROUP BY a.entity_id,a.entity_name, a.entity_type,b.entity_type`

      const  { rows }  = await db.query(query)

      return rows
  } catch(e) {
      throw e
  }
}
const getAssociatedUserGroupByEntityID = async(entityID) => {
  try{

      const query = `SELECT b.entity_id,b.entity_name, b.entity_type
      FROM PUBLIC.associations a
      JOIN PUBLIC.associations b ON b.node_path <@ a.node_path AND b.entity_type IN ('User Group')
      WHERE a.parent_id is NULL AND a.entity_id = $1`

      const  { rows }  = await db.query(query, [ entityID ])

      return rows
  } catch(e) {
      throw e
  }
}

const getRoleMappingByUserGroupID = async(userGroupID) => {
  try{

      const query = `SELECT role_id,role_name,role_category FROM rolemapping rm
      JOIN roles r ON r.id = rm.role_id
      WHERE user_group_id = $1`

      const  { rows }  = await db.query(query, [ userGroupID ])

      return rows
  } catch(e) {
      throw e
  }
}
const deleteRBAC = async (rbacID) => {
  try {
    let query = `DELETE FROM PUBLIC.roleactivityrbac WHERE id = $1`
    const { rows } = await db.query(query, [ rbacID ])
    return
    } catch (e) {
    throw e
  }
}

module.exports = {
    getRoles,
    getRoleIDByRoleName,
    getRolePrivilegesMappingByRoleID,
    getRoleMappingToUserGroup,
    getRolesByAppID,
    getActivities,
    getActivitiesByAppID,
    addRoles,
    updateRoles,
    addActivities,
    addSubActivities,
    getActivityRBAC,
    saveRBACConfiguration,
    getRBACByRBACID,
    updateActivityRBAC,
    getConfiguredRoles,
    createRoleMappingToUserGroup,
    updateRoleMappingToUserGroup,
    deleteRoleMappingByRoleID,
    getTopLevelEntitiesAssociatedWithUserGroup,
    getAssociatedUserGroupByEntityID,
    getRoleMappingByUserGroupID,
    deleteRBAC,
    getUserGroupsWhichMappedAndNotAssociated
}
