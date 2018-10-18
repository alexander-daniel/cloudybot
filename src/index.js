const dotenv = require('dotenv');
const fs = require('fs');
const boxen = require('boxen');
const { prompt } = require('inquirer');
const DigitalOcean = require('do-wrapper');
const createNewDroplet = require('./api/create');
const listAllDroplets = require('./api/list');
const deleteDroplet = require('./api/delete');
const homedir = require('os').homedir();

const checkConfig = () => {
  const configPath = `${homedir}/.cloudy`;

  // First time user with no config set up.
  if (!fs.existsSync(configPath)) {
    //file exists
    console.log('Created empty configuration file');
    console.log('Put your digital ocean key inside the ~/.cloudy config file');
    fs.writeFileSync(configPath, 'DO_KEY=your_digital_ocean_api_key', 'utf8');
    process.exit(0);
  }

  // We've got a cloudy config. Lets pull out the Digital Ocean key
  dotenv.config({ path: configPath });
}

(async () => {
  try {

    // Before continuing, check that there is a configuration file
    // we can use.
    checkConfig();

    // Initialize the api module with the API token.
    const api = new DigitalOcean(process.env.DO_KEY);

    console.log(boxen('dev box manager', { padding: 1 }));

    const { actionName } = await prompt([{
      name: 'actionName',
      type: 'list',
      message: 'What do you want to do?',
      choices: [ 'create', 'list', 'delete' ]
    }]);

    switch (actionName) {
      case 'delete':
        await deleteDroplet(api);
        break;
      case 'create':
        await createNewDroplet(api);
        break;
      case 'list':
        await listAllDroplets(api);
        break;
      default:
        throw new Error(`Action: ${actionName} not handled`);
    }
  }

  catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
