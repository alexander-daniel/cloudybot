const ora = require('ora');
const listDroplets = require('./list');

async function deleteAllDroplets(api) {
  let spinner;

  const droplet = await listDroplets(api);

  try {
    spinner = ora(`Deleting: ${droplet.name}`).start();
    await api.dropletsDelete(droplet.id)
    spinner.succeed();
    return
  }

  catch (err) {
    spinner.fail();
    console.error(err);
  }
}

module.exports = deleteAllDroplets;
