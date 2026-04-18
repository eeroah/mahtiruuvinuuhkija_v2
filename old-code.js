require('dotenv').config();

const ruuvi = require('node-ruuvitag');

let dryRun = false;
let debug = false;

const configuration = checkMandatoryEnvVariables(process.env);

if(!configuration) {
	throw 'mandatory parameters missing';
}

const tagDataMap = [];
const updateInterval = 1000 * 60 * configuration.interval;


ruuvi.on('found', tag => {
	// Add tag to tagDataMap
	if(!tagDataMap.find(t => t.id === tag.id)) {
		tagDataMap.push({
			id: tag.id,
			lastUpdated: 0, 
		})
	}

  tag.on('updated', async data => {

		if(!dryRun) {
			const curTagIndex = tagDataMap.findIndex(t => t.id === tag.id);
			
			if(debug) {
				console.log(`Tag: ${ tag.id}`);
				console.log(
					'Am I going to update (last updated + ' + updateInterval + ', Now, updating?)',
					tagDataMap[ curTagIndex ].lastUpdated + updateInterval,
					Date.now(),
					tagDataMap[ curTagIndex ].lastUpdated + updateInterval < Date.now()
				)
			}


			if(tagDataMap[ curTagIndex ].lastUpdated + updateInterval < Date.now()) {
				await fetch(`http://${ configuration.mahtiruuviFunctionHost }/tagmeasurement/${ tagDataMap[curTagIndex].id }`, {
					method: 'POST',
					body: JSON.stringify({
						humidity: data?.humidity || '0',
						pressure: data?.pressure || '0',
						temperature: data?.temperature || '0',
						battery: data?.battery || '0',
					}),
					headers: {
						'Authorization': 'APIToken ' + configuration.apiToken,
						'Content-Type': 'application/json',
					}
				});
				tagDataMap[ curTagIndex ].lastUpdated = Date.now();
			}
		} else {
			console.log('Dry run, here is tag data');
			console.log({
				id: tag.id,
				...data
			})
		}

  });
});

ruuvi.on('warning', message => {
  console.error(new Error(message));
});



function checkMandatoryEnvVariables(enviromentVariables) {
	if(!enviromentVariables) {
    return false;
  }

  if(enviromentVariables.apiToken === undefined || enviromentVariables.apiToken === '') {
    console.error('API token is not set');
    return false;
  }

  if(enviromentVariables.mahtiruuviFunctionHost === undefined || enviromentVariables.mahtiruuviFunctionHost === '') {
    console.error('Mahtiruuvi function host is not set');
    return false;
  }

  if(enviromentVariables.interval === undefined || enviromentVariables.interval === '') {
    console.error('Interval is not set');
    return false;
  }

  dryRun = enviromentVariables.dryRun === 'true';
  debug = enviromentVariables.debug === 'true';

  return {
    apiToken: enviromentVariables.apiToken,
    mahtiruuviFunctionHost: enviromentVariables.mahtiruuviFunctionHost,
    interval: parseInt(enviromentVariables.interval, 10),
  };
} 