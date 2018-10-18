const ora = require('ora');
const hat = require('hat');
const { prompt } = require('inquirer');
const clipboardy = require('clipboardy');
const wait = async (d = 3000) => new Promise(r => setTimeout(r, d));

async function createNewDroplet(api) {
  let spinner;

  const { dropletName } = await prompt([{
    name: 'dropletName',
    type: 'input',
    message: 'choose a droplet name'
  }]);

  spinner = ora(`Creating: ${dropletName}`).start();

  // TODO: allow usage of templates.
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

  spinner = ora(`Booting instance: ${droplet.name} (takes a couple minutes -- grab a coffee!)`).start();

  while (!isDeployed) {
    const { body } = await api.dropletsGetById(droplet.id);
    const dropletMeta = body.droplet;

    if (dropletMeta.networks.v4.length) {
      isDeployed = true;
      ip = dropletMeta.networks.v4[0].ip_address;
    }
    // Delay a bit, we don't want to bombard the DO api
    await wait();
  }

  // TODO: figure this out because the server is up at this point, however
  // we might not be able to SSH in right away. Just wait another minute to be sure.
  await wait(60000);

  spinner.succeed();
  console.log(`run: ssh root@${ip} # (copied to clipboard)`);
  clipboardy.writeSync(`ssh root@${ip}`);
}

module.exports = createNewDroplet;
