import bodyParser from 'body-parser';
import { Picker } from 'meteor/meteorhacks:picker';

Picker.middleware(bodyParser.json());

Picker.route('/api/webhooks/:provider', ({ provider }, request, response) => {
 // We'll handle the request here.
 console.log('request recieved');
});