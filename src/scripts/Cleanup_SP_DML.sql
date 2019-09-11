<!-- Function -->

DO
$func$
BEGIN
   RAISE NOTICE '%', 
   -- EXECUTE
   (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
    FROM   pg_class
    WHERE  relkind = 'r'  -- only tables
    AND    relnamespace = 'public'::regnamespace
   );
END
$func$;


<!-- SP -->

do
$$
declare
  cpdb_uat_x text;
begin
  select 'truncate ' || string_agg(format('%I.%I', schemaname, tablename), ',')
    into cpdb_uat_x
  from pg_tables
  where schemaname in ('public');

  execute cpdb_uat_x;
end;
$$

--Insert Command Post truncation

// successful

INSERT INTO   businessunits

(name , short_name ,description ,owner ,created_date, created_by, icon_name, is_exists )

VALUES('Post & Parcel Germany','P&P',null,'a.anton@dpdhl.com',current_date,'Admin', concat('BU_P&P_',current_date),true),

('Express','EXP',null,'a.anton@dpdhl.com',current_date,'Admin', concat('BU_EXP_',current_date),true),

('Global Forwarding, Freight','DGFF',null,'a.anton@dpdhl.com',current_date,'Admin', concat('BU_DGFF_',current_date),true),

('Supply Chain','DSC',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_DSC_',current_date), true),

('Global Business Services','GBS',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_GBS_',current_date), true),

('DHL eCommerce Solutions','eCommerce',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_eCommerce_',current_date), true),

('Customer Solutions & Innovation','CSI',null,'a.anton@dpdhl.com',current_date,'Admin',concat('BU_CSI_',current_date), true);

               

// successful

INSERT INTO usergroups (  user_group_name ,  created_date , created_by, is_exists ) VALUES('Platform Admin',current_date,'Admin',true); 

               
// successful

INSERT INTO users (first_name,email_id,created_date,created_by,image_name,last_login) 

VALUES('ParsuramKattimani',

'parshuram.kattimani@dpdhl.com',current_date,'Admin',concat('User_parshuram.kattimani@dpdhl.com_',current_date),current_date),

('Srinivas Sedamkar','srinivas.sedamkar@dhl.com',current_date,'Admin',concat('User_srinivas.sedamkar@dhl.com_',current_date),current_date),

('Archana Vembakam','archana.vembakam@dpdhl.com',current_date,'Admin',concat('archana.vembakam@dpdhl.com_',current_date),current_date);


// successful

INSERT INTO userassociations  (user_id,user_group_id)

SELECT u.id,ug.id FROM USERS u,usergroups ug;


// successful

INSERT INTO roles (role_name,role_category)

values ('Platform Admin','Platform');


// successful

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


 // successful

INSERT INTO roleactivityrbac (activity_id, role_id, read_access, create_access,  update_access , delete_access )

SELECT a.id,r.id,'true','true','true','true' FROM activities a ,roles r;

  
INSERT INTO rolemapping ( role_id ,  user_group_id ,  created_date ,   created_by )

SELECT r.id,ug.id,current_date,'Admin' FROM roles r,usergroups ug;

 

INSERT INTO devicespec (service_provider,protocol,device_image_name,device_spec_name,object,interval_in_sec,api_url,created_date,created_by)

VALUES('Sigfox','http',concat('Device_Img_Sigfox',current_date),concat('Device_Img_Sigfox',current_date),

'{"username":"5ca4a93fe833d97655ae1de1","password":"353a66754599d6a201eab14e6f401cb3"}',300,'https://api.sigfox.com/v2/devices',current_date,'Admin'),

('RPP - Red Pointlabs Platform','http',concat('Device_Img_RPP',current_date),concat('Device_Img_RPP',current_date),

'{"email":"biswaranjan.sethi@wipro.com","token":"fbIDYVdsQIGQ8RWOP-DW","project":"Paqsyu9dQwOsCjTqdnpV8w"}',300,'https://dhl.rpplabs.com/api/trackable_objects/',

current_date,'Admin');