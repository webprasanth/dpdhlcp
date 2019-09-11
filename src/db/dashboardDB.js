const db = require('../utils/postGresDB')



const getParentApptoFindSiblings = async (data) => {
  try {

      let { entityID, entityName, entityType } = data

      let a = `select t.* from (`
      let b = ''
      let c =  `)t WHERE entity_type in ('Application')`
      let interval = ''
      const { rows } = await db.query(`SELECT NLEVEL(node_path) as interval FROM associations WHERE entity_id = $1  AND entity_name = $2 AND entity_type= $3`,[entityID, entityName, entityType])

      if( rows.length >0 ) {
      interval = rows[0].interval
      }

      let condition = ''
      for (let i = 0 ; i < interval ; i++ ) {
          
          if(i !== 0){
              condition = `,-${i}`
          }
      let temp =  `SELECT number${i}.entity_id, number${i}.entity_name, number${i}.entity_type from associations x JOIN associations number${i} on number${i}.node_path = subpath(x.node_path, 0 ${condition}) WHERE x.entity_id = $1 AND x.entity_name = $2 AND x.entity_type = $3 UNION ALL `
            
      b +=  temp		   
      }
      const query = a + b.slice(0, -11) + c

      const result  = await db.query(query, [entityID, entityName, entityType]) 

      return result.rows


  } catch (e) {
      throw e
  }
}

const getAllAssociatedChildrens = async(data) => {
  const { entityID, entityName, entityType} = data
  try{
      const query = `Select json_agg(t)  FROM (
          with bu as
          (SELECT
              json_agg(a.entity_id) Business_Unit
          FROM
          associations x
          LEFT JOIN associations a ON a.node_path <@ x.node_path AND a.entity_type = 'Business Unit'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          app as
          (SELECT
              json_agg(b.entity_id)  Application
          FROM
          associations x
          LEFT JOIN associations b ON b.node_path <@ x.node_path AND b.entity_type = 'Application'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          ug as
          (SELECT
              json_agg(c.entity_id) User_Group
          FROM
          associations x
          LEFT JOIN associations c  ON c.node_path <@ x.node_path AND c.entity_type = 'User Group'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          dg as
          (SELECT
              json_agg(d.entity_id) Device_Group
          FROM
          associations x
          LEFT JOIN associations d  ON d.node_path <@ x.node_path AND d.entity_type = 'Device Group'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          entity as
          (SELECT
              json_agg(e.entity_id) entity
          FROM
          associations x
          LEFT JOIN associations e  ON e.node_path <@ x.node_path AND e.entity_type NOT IN ('Business Unit','Application','User Group','Device Group')
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3)
          select * from bu,app,ug,dg,entity) t`
      const  { rows }  = await db.query(query, [entityID, entityType, entityName])
      return rows
  } catch(e) {
      throw e
  }
}


const getUserDetailsByEmail = async (email) => {
    try {
  
      const query = `SELECT  users.id as id, users.first_name as firstname, users.last_name as lastname ,
      users.email_id as email, users.favorite_menu as favoritemenu,
		json_agg( r.privilege) as privileges,r.role_name,
		LENGTH(REPLACE(r.privilege::text,'true','-'))
		-LENGTH(REPLACE(r.privilege::text,'true','')) as level,(case r.role_name WHEN 'Platform Admin' THEN (SELECT 
      json_agg(json_build_object('appID', app.id, 'appName', app.name, 'appOwner', app.owner, 'appOwnerName', 
      app.owner_name,'description', app.description,'onBoardedDate', app.onboarded_date, 'isFavorite', false, 'url', app.url )) as applications 
		FROM PUBLIC.applications as app) WHEN 'Application Admin' THEN (SELECT 
      json_agg(json_build_object('appID', app.id, 'appName', app.name, 'appOwner', app.owner, 'appOwnerName', 
      app.owner_name,'description', app.description,'onBoardedDate', app.onboarded_date, 'isFavorite', false, 'url', app.url )) as applications 
		FROM PUBLIC.applications as app WHERE app.owner = $1) ELSE (
      json_agg(json_build_object('appID', app.id, 'appName', app.name, 'appOwner', app.owner, 'appOwnerName', 
      app.owner_name,'description', app.description,'onBoardedDate', app.onboarded_date, 'isFavorite', false, 'url', app.url ))  
		)  END)  applications
	    FROM PUBLIC.users 
      LEFT JOIN PUBLIC.userassociations as ua on users.id = ua.user_id
	  LEFT JOIN rolemapping rm ON rm.user_group_id = ua.user_group_id
      LEFT JOIN roles r  ON r.id = rm.role_id
      LEFT OUTER JOIN PUBLIC.applications as app on ua.app_id = app.id and app.is_exists  = true
      WHERE PUBLIC.users.email_id = $1
      group by users.id, firstname, lastname, email,r.role_name ,level
      ORDER BY level DESC  NULLS LAST LIMIT 1`
  
      const { rows } = await db.query(query, [email])
      return rows
    } catch (e) {
      throw e
    }
}

const updateFavoriteApp = async (data) => {
try {

    const { userID, appID, isFavorite } = data

    const query = `UPDATE PUBLIC.userassociations SET favorite_app = $3
    WHERE user_id =$1 and app_id = $2` 
    
    const { rows } = await db.query(query, [ userID, appID, isFavorite ])
    return rows
} catch (e) {
    throw e
}
}

const getOnboardingGraph = async (data) => {
  try {
  
    const { enitityType, year, month, week }  = data
  
      const query = `SELECT table_name from entityInfo WHERE entity_name = $1` 
      const { rows } = await db.query(query, [ enitityType])
      const table_name = rows[0].table_name

      let interval_type , interval_string,  interval = ''

      if(week !== null && typeof week != 'undefined' && week !== '') {
        interval_type = 'days'
        interval_string = 'YYYY-MM-DD'
        interval = 7
        format = `to_date('${year}${week}', 'yyyyww')`
        
      } else if (month !== null && typeof month != 'undefined' && month !== '') {
        interval_type = 'week'
        interval_string = 'YYYY-IW'
        interval = 4
        format =  `date_trunc('month', to_date('${year}${month}', 'yyyymonth'))`
        
      } else if (year !== null && typeof year != 'undefined' && year !== '') {
        interval_type = 'month'
        interval_string = 'YYYY-MM'
        interval = 12
        format = `to_char(date_trunc('${year}', now())`        
      }
  
      let a = `select row_to_json(t)  as counts from ( with `
      let b = ''
      let c = `SELECT * from `
      let d =  `)t`

      for (let i = 0 ; i < interval ; i++ ) {
      let temp =  ` number${i} as
                   (SELECT COUNT(created_date) as number${i}
                   from ${table_name}
                   WHERE to_char(created_date, '${interval_string}' ) = to_char(${format} + interval '${i} ${interval_type}', '${interval_string}')),`
      b +=  temp		 
      c += `number${i}, `

      }
      const graphQuery = a + b.slice(0, -1) + c.slice(0, -2) + d

      const graphResult = await db.query(graphQuery)

      return graphResult.rows

  } catch (e) {
      throw e
  }
}

const getAppOwners = async () => {
  try {

    const query = `	SELECT app.owner, app.owner_name, json_agg(json_build_object('id',app.id, 'name',app.name)) as appData,count(app.id)
    FROM applications app 
    WHERE app.is_exists = true 
    Group By app.owner, app.owner_name`

    const { rows } = await db.query(query, [])
    return rows
  } catch (e) {
    throw e
  }
}

const getMenu = async (roleID) => {
  try {
    
      const query = `SELECT menu FROM roles WHERE id = $1` 
      
      const { rows } = await db.query(query, [ roleID ])
      return rows
  } catch (e) {
      throw e
  }
}

const updateFavoriteMenu = async (data) => {
  try {
      const { userID, favoriteMenu } = data
  
      const query = `UPDATE PUBLIC.users SET favorite_menu = $2 WHERE user_id = $1`
      
      await db.query(query, [ userID, favoriteMenu ])

      return 
  } catch (e) {
      throw e
  }
}

const getAppUsersCountforGraph = async (data) => {
  try {
      const { fromDate, toDate,userGroupIDs } = data
      let query = `select json_agg(t) as app_user_counts
      from (
      SELECT to_json(app.name) x, to_json(count(*)) y FROM userassociations ua
      JOIN applications app ON app.id = ua.app_id
      WHERE created_timestamp BETWEEN  $1 AND  $2 `
      if(userGroupIDs) query += ` AND user_group_id in (${userGroupIDs}) `
      query += ` GROUP BY ua.app_id,app.name
      ) t`
      
      let { rows } = await db.query(query,[ fromDate, toDate ])

     /* if(rows[0].app_user_counts == null) {

        const query = `select json_agg(t) as app_user_counts
                      from (
                      SELECT to_json(app.name) x, to_json(count(ua.*)) y
                      FROM applications app
                      LEFT JOIN userassociations ua ON app.id = ua.app_id
                      GROUP BY app.name,onboarded_date
                      order by onboarded_date desc limit 5
                       ) t`
          
          let { rows } = await db.query(query)

          return rows
      }*/
      return rows

  } catch (e) {
      throw e
  }
}

const getAppDevicesCountforGraph = async (data) => {
  try {
      const { fromDate, toDate } = data
      const query = `select json_agg(t) as app_device_counts,SUM(y) as total_count
      from (
            SELECT to_json(app.name) x,COUNT(d.*) y FROM devices d
        JOIN devicegroupassociations dga ON d.device_group_id = dga.device_group_id
        JOIN applications app on app.id = dga.app_id
        WHERE created_timestamp BETWEEN  $1 AND $2
        GROUP BY app.name,d.device_group_id
       ) t`
      
      let { rows } = await db.query(query,[ fromDate, toDate ])

      if(rows[0].app_device_counts == null) {

        const query = ` select json_agg(t) as app_device_counts,SUM(y) as total_count
        from (
        SELECT to_json(app.name) x, count(dga.*) y
        FROM applications app
        LEFT JOIN devicegroupassociations dga ON app.id = dga.app_id
        GROUP BY app.name,onboarded_date
        order by onboarded_date desc limit 5
         ) t`
          
          let { rows } = await db.query(query)

          return rows
      }
      return rows

  } catch (e) {
      throw e
  }
}

const getAppDevicesCountforGraphNew = async (data) => {
  try {
      const { fromDate, toDate, deviceGroupIDs } = data
      let query = `select json_agg(t) as app_device_counts,SUM(y) as total_count
      from (
            SELECT to_json(app.name) x,COUNT(d.*) y FROM devices d
        JOIN devicegroupassociations dga ON d.device_group_id = dga.device_group_id`
       if(deviceGroupIDs) query += ` AND d.device_group_id in (${deviceGroupIDs}) `
       query += ` JOIN applications app on app.id = dga.app_id
       WHERE created_timestamp BETWEEN  $1 AND $2
       GROUP BY app.name
      ) t `
      console.log(query)
      let { rows } = await db.query(query,[ fromDate, toDate ])

      
      return rows

  } catch (e) {
      throw e
  }
}

module.exports = {
    getUserDetailsByEmail,
    updateFavoriteApp,
    getOnboardingGraph,
    getAppOwners,
    updateFavoriteMenu,
    getMenu,
    getAppUsersCountforGraph,
    getAppDevicesCountforGraph,
    getAppDevicesCountforGraphNew,
    getParentApptoFindSiblings,
    getAllAssociatedChildrens
    
}