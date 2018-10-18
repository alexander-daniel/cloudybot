const { prompt } = require('inquirer');

async function listDroplets(api) {
  try {
    const { body } = await api.dropletsGetAll({});
    const { droplets } = body;
    const { selectedDroplet } = await prompt([{
      name: 'selectedDroplet',
      type: 'list',
      message: 'Droplets',
      choices: droplets.map(d => `${d.name}:${d.id}`)
    }]);
    const [_, dropletID] = selectedDroplet.split(':');
    const res = await api.dropletsGetById(dropletID);
    return res.body.droplet;
  }

  catch (err) {
    throw new Error(err);
  }
}

module.exports = listDroplets;
