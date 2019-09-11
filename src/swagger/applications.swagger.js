/**
* @swagger
* paths:
*   /applications/getApplications:
*     post:
*       description: ''
*       summary: getApplications
*       tags:
*       - Applications
*       operationId: GetApplicationsPost
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*         default: application/json
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         schema:
*           $ref: '#/definitions/getApplicationsRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /applications/getAllApplications:
*     get:
*       description: ''
*       summary: getAllApplications
*       tags:
*       - Applications
*       operationId: GetAllApplicationsGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /applications/getApplicationByID:
*     get:
*       description: ''
*       summary: getApplicationsByID
*       tags:
*       - Applications
*       operationId: GetApplicationByIDGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: id
*         in: query
*         required: true
*         type: integer
*         format: int32
*         description: ''
*         default: application/json
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /applications/createApplication:
*     post:
*       description: ''
*       summary: createApplication
*       tags:
*       - Applications
*       operationId: CreateApplicationPost
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         default: application/json
*         schema:
*           $ref: '#/definitions/createApplicationRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /applications/createBulkApplications:
*     post:
*       description: ''
*       summary: createBulkApplications
*       tags:
*       - Applications
*       operationId: CreateBulkApplicationsPost
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*         default: application/json
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         schema:
*           $ref: '#/definitions/createBulkApplicationsRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /applications/updateApplication:
*     patch:
*       description: ''
*       summary: updateApplication
*       tags:
*       - Applications
*       operationId: UpdateApplicationPatch
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*         default: application/json
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         schema:
*           $ref: '#/definitions/updateApplicationRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /applications/deleteApplication:
*     delete:
*       description: ''
*       summary: deleteApplication
*       tags:
*       - Applications
*       operationId: DeleteApplicationDelete
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: id
*         in: query
*         required: true
*         type: integer
*         format: int32
*         description: ''
*         default: application/json
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*       responses:
*         200:
*           description: ''
*           headers: {}
* definitions:
*   getApplicationsRequest:
*     title: getApplicationsRequest
*     example:
*       pageNumber: 1
*       pageSize: 10
*       search: 
*       sortColumn: id
*       sortType: 1
*     type: object
*     properties:
*       pageNumber:
*         type: integer
*         format: int32
*       pageSize:
*         type: integer
*         format: int32
*       search:
*         type: string
*       sortColumn:
*         type: string
*       sortType:
*         type: integer
*         format: int32
*     required:
*     - pageNumber
*     - pageSize
*     - sortColumn
*     - sortType
*   createApplicationRequest:
*     title: createApplicationRequest
*     example:
*       appName: Application-4
*       appOwner: John
*       appStatus: Active
*       appGroupName: NA
*       appCreatedBy: Me
*       resourceGroupName: Demo1
*       appDescription: not sure
*       buID: 1
*       appRoleIDs:
*       - 1
*       - 2
*       imgData: ''
*     type: object
*     properties:
*       appName:
*         type: string
*       appOwner:
*         type: string
*       appStatus:
*         type: string
*       appGroupName:
*         type: string
*       appCreatedBy:
*         type: string
*       resourceGroupName:
*         type: string
*       appDescription:
*         type: string
*       buID:
*         type: integer
*         format: int32
*       appRoleIDs:
*         type: array
*         items:
*           type: integer
*           format: int32
*       imgData:
*         type: string
*     required:
*     - appName
*     - appOwner
*     - appStatus
*     - appGroupName
*     - appCreatedBy
*     - resourceGroupName
*     - appDescription
*     - buID
*     - appRoleIDs
*     - imgData
*   createBulkApplicationsRequest:
*     title: createBulkApplicationsRequest
*     example:
*       data:
*       - appName: ''
*         appOwner: ''
*         appStatus: Active
*         appGroupName: NA
*         appCreatedBy: Me
*         resourceGroupName: 
*         appDescription: not sure
*       - appName: Application-4
*         appOwner: ''
*         appStatus: Active
*         appGroupName: NA
*         appCreatedBy: Me
*         resourceGroupName: 
*         appDescription: not sure
*       - appName: Application-5
*         appOwner: ''
*         appStatus: Active
*         appGroupName: NA
*         appCreatedBy: Me
*         resourceGroupName: gbs
*         appDescription: not sure
*     type: object
*     properties:
*       data:
*         type: array
*         items:
*           $ref: '#/definitions/Datum'
*     required:
*     - data
*   Datum:
*     title: Datum
*     example:
*       appName: ''
*       appOwner: ''
*       appStatus: Active
*       appGroupName: NA
*       appCreatedBy: Me
*       resourceGroupName: 
*       appDescription: not sure
*     type: object
*     properties:
*       appName:
*         type: string
*       appOwner:
*         type: string
*       appStatus:
*         type: string
*       appGroupName:
*         type: string
*       appCreatedBy:
*         type: string
*       resourceGroupName:
*         type: string
*       appDescription:
*         type: string
*     required:
*     - appName
*     - appOwner
*     - appStatus
*     - appGroupName
*     - appCreatedBy
*     - appDescription
*   updateApplicationRequest:
*     title: updateApplicationRequest
*     example:
*       id: 5
*       appName: Application-2
*       appOwner: John
*       appStatus: Active
*       appGroupName: NA
*       appModifiedBy: Me
*       resourceGroupName: your group
*       appDescription: not sure
*       buID: 1
*       appRoleIDs:
*       - 1
*       - 2
*       imgData: ''
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       appName:
*         type: string
*       appOwner:
*         type: string
*       appStatus:
*         type: string
*       appGroupName:
*         type: string
*       appModifiedBy:
*         type: string
*       resourceGroupName:
*         type: string
*       appDescription:
*         type: string
*       buID:
*         type: integer
*         format: int32
*       appRoleIDs:
*         type: array
*         items:
*           type: integer
*           format: int32
*       imgData:
*         type: string
*     required:
*     - id
*     - appName
*     - appOwner
*     - appStatus
*     - appGroupName
*     - appModifiedBy
*     - resourceGroupName
*     - appDescription
*     - buID
*     - appRoleIDs
*     - imgData
* tags:
* - name: Applications
*   description: ''
*/ 