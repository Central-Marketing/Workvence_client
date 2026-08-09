const axios = require('axios');
axios.get('http://localhost:3000/api/orders/6a7745ed6eb0db8455bc7f06')
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.log(err.message));
