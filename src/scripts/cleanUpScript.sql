

TRUNCATE entityinfo CASCADE;  
TRUNCATE usergroupassociations CASCADE;  
TRUNCATE associations CASCADE;  
TRUNCATE usergroups CASCADE;  
TRUNCATE rolemapping CASCADE;  
TRUNCATE notifications CASCADE;  
TRUNCATE userassociations CASCADE;  
TRUNCATE entity CASCADE;  
TRUNCATE businessunits CASCADE;  
TRUNCATE entitydata CASCADE;  
TRUNCATE devicegroups CASCADE;  
TRUNCATE devicespec CASCADE;  
TRUNCATE devices CASCADE;  
TRUNCATE devicetypes CASCADE;  
TRUNCATE applications CASCADE;  
TRUNCATE devicegroupassociations CASCADE;  
TRUNCATE users CASCADE;  
TRUNCATE roles CASCADE;  
TRUNCATE entitymetadata CASCADE;  
TRUNCATE activities CASCADE;  
TRUNCATE roleactivityrbac CASCADE;  


DELETE FROM  entityinfo ;  
DELETE FROM  usergroupassociations ;  
DELETE FROM  associations ;  
DELETE FROM  rolemapping ; 
DELETE FROM  userassociations ;  
DELETE FROM  usergroups ;  
 DELETE FROM  entitymetadata ; 
DELETE FROM  notifications ;  

DELETE FROM  entity ;  
DELETE FROM  businessunits ;  
DELETE FROM  entitydata ;  
DELETE FROM  devicegroupassociations ;  
DELETE FROM  devices ;  
DELETE FROM  devicegroups ;  

DELETE FROM  devicespec ;  

DELETE FROM  devicetypes ;  
DELETE FROM  applications ;  

DELETE FROM  users ;  
DELETE FROM  roles ;  
 
DELETE FROM  activities ;  
DELETE FROM  roleactivityrbac ;   

--Insert Command Post truncation
INSERT INTO   businessunits 
	(name ,	short_name ,description ,owner ,created_date, created_by,icon_name, is_exists )
	 VALUES('Post & Parcel Germany','P&P',null,'a.anton@dpdhl.com',current_date,'Admin', concat('BU_P&P_',current_date),true),
	 ('Express','EXP',null,'a.anton@dpdhl.com',current_date,'Admin', concat('BU_EXP_',current_date),true),
	 ('Global Forwarding, Freight','DGFF',null,'a.anton@dpdhl.com',current_date,'Admin', concat('BU_DGFF_',current_date),true),
	 ('Supply Chain','DSC',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_DSC_',current_date), true),
	 ('Global Business Services','GBS',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_GBS_',current_date), true),
	 ('DHL eCommerce Solutions','eCommerce',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_eCommerce_',current_date), true),
	 ('Customer Solutions & Innovation','CSI',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_CSI_',current_date), true);
	

INSERT INTO usergroups (  user_group_name ,  created_date ,	 
  created_by, is_exists )	
  VALUES('Platform Admin',current_date,'Admin',true);	
	
INSERT INTO users (first_name,email_id,created_date,created_by,image_name,last_login)
VALUES ('Parsuram Kattimani','parshuram.kattimani@dpdhl.com',current_date,'Admin',concat('User_parshuram.kattimani@dpdhl.com_',current_date),current_date),
('Srinivas Sedamkar','srinivas.sedamkar@dhl.com',current_date,'Admin',concat('User_srinivas.sedamkar@dhl.com_',current_date),current_date),
('Archana Vembakam','archana.vembakam@dpdhl.com',current_date,'Admin',concat('archana.vembakam@dpdhl.com_',current_date),current_date),
('Tina Ziemek','Tina.Ziemek@dpdhl.com',current_date,'Admin',concat('Tina.Ziemek@dpdhl.com_',current_date),current_date);

   INSERT INTO userassociations  (user_id,user_group_id)
   SELECT u.id,ug.id FROM USERS u,usergroups ug;

INSERT INTO usergroups (  user_group_name ,  created_date ,	 
  created_by, is_exists )	
  VALUES('Application Admin',current_date,'Admin',true),('Default App User',current_date,'Admin',true);
  
insert into roles(role_name,role_category,privilege)
VALUES(
'Platform Admin','Platform','[  
   {  
      "role":"dashboard",
      "rights":[  
         {  
            "user_count":true,
            "device_count":true,
            "user_distribution_Graph":true,
            "device_status_Graph":true,
            "device_distribution_Graph":true,
            "application_owners_list":true,
            "all_applications_list":true
         }
      ]
   },
   {  
      "role":"business_Unit",
      "rights":[  
         {  
            "business_unit_list_view":true,
            "onboard_business_unit":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"application",
      "rights":[  
         {  
            "application_list_view":true,
            "onboard_application":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"device",
      "rights":[  
         {  
            "device_list_view":true,
            "onboard_device":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"user",
      "rights":[  
         {  
            "user_list_view":true,
            "onboard_user":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"entities",
      "rights":[  
         {  
            "entities_list_view":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"deviceConfig",
      "rights":[  
         {  
            "deviceConfig_list_view":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   }
]'),
('Application Admin','Platform','[  
   {  
      "role":"dashboard",
      "rights":[  
         {  
            "user_count":true,
            "device_count":true,
            "user_distribution_Graph":true,
            "device_status_Graph":true,
            "device_distribution_Graph":true,
            "application_owners_list":true,
            "all_applications_list":true
         }
      ]
   },
   {  
      "role":"business_Unit",
      "rights":[  
         {  
            "business_unit_list_view":true,
            "onboard_business_unit":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"application",
      "rights":[  
         {  
            "application_list_view":true,
            "onboard_application":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"device",
      "rights":[  
         {  
            "device_list_view":true,
            "onboard_device":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"user",
      "rights":[  
         {  
            "user_list_view":true,
            "onboard_user":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"entities",
      "rights":[  
         {  
            "entities_list_view":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   },
   {  
      "role":"deviceConfig",
      "rights":[  
         {  
            "deviceConfig_list_view":true,
            "edit":true,
            "delete":true,
            "export":true
         }
      ]
   }
]'),
('Default App User Role','Platform','[  
   {  
      "role":"dashboard",
      "rights":[  
         {  
            "user_count":true,
            "device_count":true,
            "user_distribution_Graph":true,
            "device_status_Graph":true,
            "device_distribution_Graph":true,
            "application_owners_list":false,
            "all_applications_list":true
         }
      ]
   },
   {  
      "role":"business_Unit",
      "rights":[  
         {  
            "business_unit_list_view":false,
            "onboard_business_unit":false,
            "edit":false,
            "delete":false,
            "export":false
         }
      ]
   },
   {  
      "role":"application",
      "rights":[  
         {  
            "application_list_view":false,
            "onboard_application":false,
            "edit":false,
            "delete":false,
            "export":false
         }
      ]
   },
   {  
      "role":"device",
      "rights":[  
         {  
            "device_list_view":true,
            "onboard_device":false,
            "edit":false,
            "delete":false,
            "export":false
         }
      ]
   },
   {  
      "role":"user",
      "rights":[  
         {  
            "user_list_view":true,
            "onboard_user":false,
            "edit":false,
            "delete":false,
            "export":false
         }
      ]
   },
   {  
      "role":"entities",
      "rights":[  
         {  
            "entities_list_view":false,
            "edit":false,
            "delete":false,
            "export":false
         }
      ]
   },
   {  
      "role":"deviceConfig",
      "rights":[  
         {  
            "deviceConfig_list_view":false,
            "edit":false,
            "delete":false,
            "export":false
         }
      ]
   }
]');

INSERT INTO rolemapping ( role_id ,  user_group_id ,  created_date ,	
  created_by )
  (SELECT r.id,ug.id,current_date,'Admin' FROM roles r,usergroups ug 
  WHERE role_name='Platform Admin' AND ug.user_group_name = 'Platform Admin');
  
  INSERT INTO rolemapping ( role_id ,  user_group_id ,  created_date ,	
  created_by )
  (SELECT r.id,ug.id,current_date,'Admin' FROM roles r,usergroups ug 
  WHERE role_name='Application Admin' AND ug.user_group_name = 'Application Admin');
  
  INSERT INTO rolemapping ( role_id ,  user_group_id ,  created_date ,	
  created_by )  
  (SELECT r.id,ug.id,current_date,'Admin' FROM roles r,usergroups ug 
  WHERE role_name='Default App User Role' AND ug.user_group_name = 'Default App User');
  
  
/*
INSERT INTO activities (activity_name,sub_activity,activity_type) 
values ('Dashboard','Cards of Entity Count','Platform'),
('Dashboard','Graph','Platform'),
('Dashboard','Application Owner','Platform'),
('Dashboard','All Application cards','Platform'),
('Dashboard','Alerts','Platform'),
('Dashboard','Favourite','Platform'),
('Dashboard','Left Navigation','Platform'),
('Entities','List of all entities ','Platform'),
('Business Unit','List of all Business Units','Platform'),
('Application','List of all Applications','Platform'),
('User','List of all Users','Platform'),
('Devices','List of all Devices ','Platform'),
('Association','Association Tree','Platform'),
('Administration','Device Config','Platform'),
('Administration','RBAC Config','Platform');



 INSERT INTO roleactivityrbac (activity_id, role_id ,  read_access ,create_access  update_access ,
  delete_access ) 
 SELECT a.id,r.id,'true','true','true','true' FROM activities a ,roles r;
*/


  
  
  INSERT INTO devicespec (service_provider,protocol,device_image_name,device_spec_name,object,interval_in_sec,api_url,created_date,created_by)
VALUES('Sigfox','http',concat('Device_Img_Sigfox',current_date),concat('Device_Img_Sigfox',current_date),
'{"username":"5ca4a93fe833d97655ae1de1","password":"353a66754599d6a201eab14e6f401cb3"}',300,'https://api.sigfox.com/v2/devices',current_date,'Admin'),
('RPP - Red Pointlabs Platform','http',concat('Device_Img_RPP',current_date),concat('Device_Img_RPP',current_date),
'{"email":"biswaranjan.sethi@wipro.com","token":"fbIDYVdsQIGQ8RWOP-DW","project":"Paqsyu9dQwOsCjTqdnpV8w"}',300,'https://dhl.rpplabs.com/api/trackable_objects/',
current_date,'Admin');


INSERT INTO PUBLIC.associations
(parent_id, parent_name, parent_type, entity_name, entity_id, entity_type) 
SELECT null,null,null,name,id,'Business Unit' FROM businessunits;

