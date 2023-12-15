module.exports = {
     port: 1338,
     environment: 'production',
     //NODE_ENV:"production",
   // port: process.env.OPENSHIFT_NODEJS_PORT,
    //environment: 'development',
   //environment: process.env.NODE_ENV || 'development',
    adapters: {
        mysql: {
            user: 'root',
            password: 'Psycho.K0831'
        }
    }
    
}