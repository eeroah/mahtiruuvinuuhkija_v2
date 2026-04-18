import ruuvi from 'node-ruuvitag';
ruuvi.on('found', tag => {
  tag.on('updated', data => {
    console.log('Got data from tag:', tag.id);
    console.log(data);
    process.exit(0);
  });
});
