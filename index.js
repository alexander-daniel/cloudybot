require('dotenv').config();

const ora = require('ora');
const boxen = require('boxen');
const clipboardy = require('clipboardy');
const { prompt } = require('inquirer');
const DigitalOcean = require('do-wrapper');
const api = new DigitalOcean(process.env.DO_KEY);
const hat = require('hat');

async function wait(delay = 3000) {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  });
}

async function deleteAllDroplets() {
  let spinner;

  try {
    const { body } = await api.dropletsGetAll({});
    const { droplets } = body;

    for (let droplet of droplets) {
      spinner = ora(`Deleting: ${droplet.name}`).start();
      await api.dropletsDelete(droplet.id)
      spinner.succeed();
    }

    return;
  }

  catch (err) {
    spinner.fail();
    console.error(err);
  }
}

async function createNewDroplet() {
  const dropletNameQuestion = [
    { name: 'dropletName', type: 'input', message: 'choose a droplet name' }
  ];
  const { dropletName } = await prompt(dropletNameQuestion);
  let spinner = ora(`Creating: ${dropletName}`).start();

  const { body } = await api.dropletsCreate({
    name: dropletName || hat(),
    region: 'tor1',
    size: 's-1vcpu-1gb',
    image: 'ubuntu-16-04-x64',
    ssh_keys: ['677813']
  });

  const { droplet } = body;
  spinner.succeed();

  let isDeployed = false;
  let ip;

  spinner = ora(`Booting instance: ${droplet.name}`).start();
  while (!isDeployed) {
    const { body } = await api.dropletsGetById(droplet.id);
    const dropletMeta = body.droplet;
    if (dropletMeta.networks.v4.length) {
      isDeployed = true;
      ip = dropletMeta.networks.v4[0].ip_address;
    }
    await wait();
  }

  spinner.succeed();
  console.error(`run: ssh root@${ip} # (copied to clipboard)`);
  clipboardy.writeSync(`ssh root@${ip}`);
}

async function main() {
  try {

    console.log(boxen('dev box manager', { padding: 1 }));

    const questions = [
      {
        name: 'actionName',
        type: 'list',
        message: 'What do you want to do?',
        choices: [
          'delete',
          'create'
        ]
      }
    ];

    const { actionName } = await prompt(questions)

    switch (actionName) {
      case 'delete': {
        await deleteAllDroplets();
        break;
      }

      case 'create': {
        await createNewDroplet();
        break;
      }

      default:
        throw new Error(`Action: ${actionName} not handled`);
    }

  }

  catch (err) {
    console.error(err);
  }
}

main();
