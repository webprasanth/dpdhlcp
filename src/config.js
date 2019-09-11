module.exports = {
    pgConfig : {
        dbName : 'cpdb_new1',
        host : 'commonplatform.postgres.database.azure.com',
        userName : 'cpa@commonplatform',
        password : 'Apc$052019'
    },
    port: process.env.PORT || 3000,
    azureContainerName: 'ptcp1',
    azureStorageConnectionStr: 'DefaultEndpointsProtocol=https;AccountName=cpiconsfilesblobstorage;AccountKey=PUKw15mzPESDPDtzO11U3J720QZLq4riFeVeIZ4X2HKp2HMOcy3zRy0BBfHJhkJrjyMPxDjlYv95pvsXHP+xbQ==;EndpointSuffix=core.windows.net'
}