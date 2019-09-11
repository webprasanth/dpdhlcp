/**
* @swagger
* paths:
*   /users/getUsers:
*     post:
*       description: ''
*       summary: getUsers
*       tags:
*       - Users
*       operationId: GetUsersPost
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
*         schema:
*           $ref: '#/definitions/getUsersRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/getAllUsers:
*     get:
*       description: ''
*       summary: getAllUsers
*       tags:
*       - Users
*       operationId: GetAllUsersGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/getUserByID:
*     get:
*       description: ''
*       summary: getUserByID?id=2
*       tags:
*       - Users
*       operationId: GetUserByIDGet
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
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/createUser:
*     post:
*       description: ''
*       summary: createUser
*       tags:
*       - Users
*       operationId: CreateUserPost
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
*         schema:
*           $ref: '#/definitions/createUserRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/UpdateUser:
*     patch:
*       description: ''
*       summary: UpdateUser
*       tags:
*       - Users
*       operationId: UpdateUserPatch
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
*         schema:
*           $ref: '#/definitions/UpdateUserRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/deleteUser:
*     delete:
*       description: ''
*       summary: deleteUser
*       tags:
*       - Users
*       operationId: DeleteUserDelete
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
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/createBulkUsers:
*     post:
*       description: ''
*       summary: createBulkUsers
*       tags:
*       - Users
*       operationId: CreateBulkUsersPost
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
*         schema:
*           $ref: '#/definitions/createBulkUsersRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/getRoles:
*     get:
*       description: ''
*       summary: getRoles
*       tags:
*       - Users
*       operationId: GetRolesGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: category
*         in: query
*         required: true
*         type: string
*         description: ''
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /users/updateFavorite:
*     patch:
*       description: ''
*       summary: updateFavorite
*       tags:
*       - Users
*       operationId: UpdateFavoritePatch
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
*         schema:
*           $ref: '#/definitions/updateFavoriteRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
* definitions:
*   getUsersRequest:
*     title: getUsersRequest
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
*   createUserRequest:
*     title: createUserRequest
*     example:
*       name: User-5
*       email: John@something.com
*       contact: 9744454515
*       designation: NA
*       address: Me
*       appId: 
*       createdBy: John
*     type: object
*     properties:
*       name:
*         type: string
*       email:
*         type: string
*       contact:
*         type: integer
*         format: int64
*       designation:
*         type: string
*       address:
*         type: string
*       appId:
*         type: string
*       createdBy:
*         type: string
*     required:
*     - name
*     - email
*     - contact
*     - designation
*     - address
*     - createdBy
*   UpdateUserRequest:
*     title: UpdateUserRequest
*     example:
*       id: 25
*       name: User-754
*       email: John@something.com
*       contact: 9744454515
*       designation: NA
*       address: Me
*       appId: 4
*       modifiedBy: John
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       name:
*         type: string
*       email:
*         type: string
*       contact:
*         type: integer
*         format: int64
*       designation:
*         type: string
*       address:
*         type: string
*       appId:
*         type: integer
*         format: int32
*       modifiedBy:
*         type: string
*     required:
*     - id
*     - name
*     - email
*     - contact
*     - designation
*     - address
*     - appId
*     - modifiedBy
*   createBulkUsersRequest:
*     title: createBulkUsersRequest
*     example:
*       data:
*       - name: User-6
*         email: John@something.com
*         contact: 9744454515
*         designation: NA
*         address: NA
*         createdBy: John
*       - name: User-5
*         email: John@something.com
*         contact: 9744454515
*         designation: NA
*         address: ''
*         createdBy: John
*       - name: User-5
*         email: John@something.com
*         contact: 9744454515
*         designation: NA
*         address: ''
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
*       name: User-6
*       email: John@something.com
*       contact: 9744454515
*       designation: NA
*       address: NA
*       createdBy: John
*     type: object
*     properties:
*       name:
*         type: string
*       email:
*         type: string
*       contact:
*         type: string
*       designation:
*         type: string
*       address:
*         type: string
*       createdBy:
*         type: string
*     required:
*     - name
*     - email
*     - contact
*     - designation
*     - address
*   updateFavoriteRequest:
*     title: updateFavoriteRequest
*     example:
*       userID: 1
*       appID: 1
*       isFavorite: true
*     type: object
*     properties:
*       userID:
*         type: integer
*         format: int32
*       appID:
*         type: integer
*         format: int32
*       isFavorite:
*         type: boolean
*     required:
*     - userID
*     - appID
*     - isFavorite
* tags:
* - name: Users
*   description: ''
*/ 