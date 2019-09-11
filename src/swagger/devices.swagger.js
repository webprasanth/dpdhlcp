/**
* @swagger
* paths:
*   /devices/getDevices:
*     post:
*       description: ''
*       summary: getDevices
*       tags:
*       - Devices
*       operationId: GetDevicesPost
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
*           $ref: '#/definitions/getDevicesRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /devices/getAllDevices:
*     get:
*       description: ''
*       summary: getAllDevices
*       tags:
*       - Devices
*       operationId: GetAllDevicesGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /devices/getDeviceById:
*     get:
*       description: ''
*       summary: getDeviceByID
*       tags:
*       - Devices
*       operationId: GetDeviceByIdGet
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
*   /devices/createDevice:
*     post:
*       description: ''
*       summary: createDevice
*       tags:
*       - Devices
*       operationId: CreateDevicePost
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
*           $ref: '#/definitions/createDeviceRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*     patch:
*       description: ''
*       summary: createDevice
*       tags:
*       - Devices
*       operationId: CreateDevicePatch
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
*           $ref: '#/definitions/createDeviceRequest1'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /devices/updateDevice:
*     patch:
*       description: ''
*       summary: updateDevice
*       tags:
*       - Devices
*       operationId: UpdateDevicePatch
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
*           $ref: '#/definitions/updateDeviceRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
* definitions:
*   getDevicesRequest:
*     title: getDevicesRequest
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
*   createDeviceRequest:
*     title: createDeviceRequest
*     example:
*       dhlDeviceID: DHL-DEVICE-97444547871
*       uuID: sfsfsg
*       serialNumber: 97444547819
*       macAddress: NA
*       deviceName: Device-9744454787
*       protocol: HTTP
*       deviceHealth: Healthy
*       onboardedBy: Me
*       deviceOwner: Me
*       powerType: Solar
*       appID: 
*       iotReady: true
*       deviceSpecID: 1
*     type: object
*     properties:
*       dhlDeviceID:
*         type: string
*       uuID:
*         type: string
*       serialNumber:
*         type: integer
*         format: int64
*       macAddress:
*         type: string
*       deviceName:
*         type: string
*       protocol:
*         type: string
*       deviceHealth:
*         type: string
*       onboardedBy:
*         type: string
*       deviceOwner:
*         type: string
*       powerType:
*         type: string
*       appID:
*         type: string
*       iotReady:
*         type: boolean
*       deviceSpecID:
*         type: integer
*         format: int32
*     required:
*     - dhlDeviceID
*     - uuID
*     - serialNumber
*     - macAddress
*     - deviceName
*     - protocol
*     - deviceHealth
*     - onboardedBy
*     - deviceOwner
*     - powerType
*     - iotReady
*     - deviceSpecID
*   createDeviceRequest1:
*     title: createDeviceRequest1
*     example:
*       id: 12
*       dhlDeviceID: DHL-DEVICE-2
*       uuID: sfsfsg
*       serialNumber: 9744454515
*       macAddress: NA
*       deviceName: Device-1
*       protocol: HTTP
*       deviceHealth: Healthy
*       onboardedBy: Me
*       deviceOwner: Me
*       powerType: Solar
*       appID: 
*       iotReady: true
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       dhlDeviceID:
*         type: string
*       uuID:
*         type: string
*       serialNumber:
*         type: integer
*         format: int64
*       macAddress:
*         type: string
*       deviceName:
*         type: string
*       protocol:
*         type: string
*       deviceHealth:
*         type: string
*       onboardedBy:
*         type: string
*       deviceOwner:
*         type: string
*       powerType:
*         type: string
*       appID:
*         type: string
*       iotReady:
*         type: boolean
*     required:
*     - id
*     - dhlDeviceID
*     - uuID
*     - serialNumber
*     - macAddress
*     - deviceName
*     - protocol
*     - deviceHealth
*     - onboardedBy
*     - deviceOwner
*     - powerType
*     - iotReady
*   updateDeviceRequest:
*     title: updateDeviceRequest
*     example:
*       id: 1
*       dhlDeviceID: DHL-DEVICE-101
*       uuID: sfsfsg
*       serialNumber: 9744454515
*       macAddress: NA
*       deviceName: Device-101
*       protocol: HTTP
*       deviceHealth: Healthy
*       onboardedBy: Me
*       deviceOwner: Me
*       powerType: Solar
*       appID: 5
*       iotReady: Y
*       deviceSpecID: 1
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       dhlDeviceID:
*         type: string
*       uuID:
*         type: string
*       serialNumber:
*         type: integer
*         format: int64
*       macAddress:
*         type: string
*       deviceName:
*         type: string
*       protocol:
*         type: string
*       deviceHealth:
*         type: string
*       onboardedBy:
*         type: string
*       deviceOwner:
*         type: string
*       powerType:
*         type: string
*       appID:
*         type: integer
*         format: int32
*       iotReady:
*         type: string
*       deviceSpecID:
*         type: integer
*         format: int32
*     required:
*     - id
*     - dhlDeviceID
*     - uuID
*     - serialNumber
*     - macAddress
*     - deviceName
*     - protocol
*     - deviceHealth
*     - onboardedBy
*     - deviceOwner
*     - powerType
*     - appID
*     - iotReady
*     - deviceSpecID
* tags:
* - name: Devices
*   description: ''
*/ 