/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */



process.env.TZ = 'Asia/Hong_Kong';
module.exports.bootstrap = async function () {


  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)


const importer = await sails.helpers.importer();

  //const fs = require("fs");

  const sqlfiles = [
    '../SQL/Standard/dropcommand.sql',
    '../SQL/Standard/TableCreate.sql',
    '../SQL/Standard/TriggerCreate.sql',
    '../SQL/Standard/SampleData.sql',
    '../SQL/Standard/Setting.sql',
    '../SQL/Standard/AllclassSQL.sql',


    '../SQL/Standard/SettingUpdateForFastTesting.sql',
    '../SQL/Standard/PairingObserver.sql',
  ]
  importer.onProgress(progress=>{
    var percent = Math.floor(progress.bytes_processed / progress.total_bytes * 10000) / 100;
    console.log(`${percent}% Completed`);
  });

  importer.onDumpCompleted(callback=>{
    var path = callback.file_path;
    var result = callback.error;
    console.log(path,+"     ",result);
  });

  for (let f of sqlfiles) {
    console.log(f)
   await importer.import(f);
    var files_imported = importer.getImported();
    console.log(`${files_imported.length} SQL file(s) imported.`);
  }



};
